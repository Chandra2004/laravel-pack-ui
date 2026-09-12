<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: undefined, // undefined = not explicitly passed, fallback ke prop show
    },
    show: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: 'info',
        validator: (value) => ['success', 'warning', 'error', 'info', 'neutral'].includes(value),
    },
    variant: {
        type: String,
        default: 'soft', // 'soft', 'solid', 'outline'
        validator: (value) => ['soft', 'solid', 'outline'].includes(value),
    },
    title: {
        type: String,
        default: '',
    },
    message: {
        type: String,
        default: '',
    },
    dismissible: {
        type: Boolean,
        default: false,
    },
    autoClose: {
        type: Number,
        default: 0, // ms, 0 = tidak otomatis tutup
    },
    icon: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue', 'update:show', 'dismiss', 'open', 'close']);

// modelValue takes priority — show sebagai fallback untuk backward compat
const resolveVisible = () => props.modelValue !== undefined ? props.modelValue : props.show;

const isVisible = ref(resolveVisible());
const progress = ref(100);
const paused = ref(false);

let progressInterval = null;
let autoCloseTimer = null;

const clearTimers = () => {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
};

const startAutoClose = () => {
    if (props.autoClose <= 0 || !isVisible.value) return;
    clearTimers();

    progress.value = 100;
    let remaining = props.autoClose;

    progressInterval = setInterval(() => {
        if (paused.value) return;
        remaining -= 40;
        progress.value = Math.max(0, (remaining / props.autoClose) * 100);
        if (remaining <= 0) handleDismiss();
    }, 40);
};

// modelValue (v-model) priority watch
watch(() => props.modelValue, (val) => {
    if (val === undefined) return;
    if (val === isVisible.value) return;
    isVisible.value = val;
    if (val) {
        emit('open');
        startAutoClose();
    } else {
        clearTimers();
    }
});

// show prop watch — hanya aktif jika modelValue tidak di-pass
watch(() => props.show, (val) => {
    if (props.modelValue !== undefined) return;
    if (val === isVisible.value) return;
    isVisible.value = val;
    if (val) {
        emit('open');
        startAutoClose();
    } else {
        clearTimers();
    }
});

// autoClose reaktif: restart timer jika prop berubah
watch(() => props.autoClose, () => {
    clearTimers();
    if (isVisible.value) startAutoClose();
});

const handleDismiss = () => {
    clearTimers();
    isVisible.value = false;
    emit('update:modelValue', false);
    emit('update:show', false);
    emit('dismiss');
    emit('close');
};

onMounted(() => {
    if (isVisible.value) {
        emit('open');
        startAutoClose();
    }
});

onUnmounted(() => {
    clearTimers();
});

// --- Styling (lookup table — efisien & mudah di-extend) ---

const TYPE_ICONS = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    neutral: 'notifications',
    info: 'info',
};

const currentIcon = computed(() => props.icon || TYPE_ICONS[props.type] || 'info');

const ALERT_CLASSES = {
    soft: {
        success: 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800/60',
        warning: 'bg-amber-50/90 text-amber-950 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/60',
        error:   'bg-rose-50/90 text-rose-950 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800/60',
        neutral: 'bg-slate-100/90 text-slate-800 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700',
        info:    'bg-blue-50/90 text-blue-950 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800/60',
    },
    solid: {
        success: 'bg-emerald-600 text-white border-transparent dark:bg-emerald-700',
        warning: 'bg-amber-500 text-white border-transparent dark:bg-amber-600',
        error:   'bg-rose-600 text-white border-transparent dark:bg-rose-700',
        neutral: 'bg-slate-700 text-white border-transparent dark:bg-slate-800',
        info:    'bg-blue-600 text-white border-transparent dark:bg-blue-700',
    },
    outline: {
        success: 'bg-white text-emerald-800 border border-emerald-500 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-600',
        warning: 'bg-white text-amber-800 border border-amber-500 dark:bg-transparent dark:text-amber-300 dark:border-amber-600',
        error:   'bg-white text-rose-800 border border-rose-500 dark:bg-transparent dark:text-rose-300 dark:border-rose-600',
        neutral: 'bg-white text-slate-800 border border-slate-300 dark:bg-transparent dark:text-slate-300 dark:border-slate-500',
        info:    'bg-white text-blue-800 border border-blue-500 dark:bg-transparent dark:text-blue-300 dark:border-blue-600',
    },
};

const INDICATOR_CLASSES = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error:   'bg-rose-500',
    neutral: 'bg-slate-400',
    info:    'bg-blue-500',
};

const ICON_CLASSES = {
    soft: {
        success: 'text-emerald-600 dark:text-emerald-400',
        warning: 'text-amber-600 dark:text-amber-400',
        error:   'text-rose-600 dark:text-rose-400',
        neutral: 'text-slate-500 dark:text-slate-400',
        info:    'text-blue-600 dark:text-blue-400',
    },
    outline: {
        success: 'text-emerald-600 dark:text-emerald-400',
        warning: 'text-amber-600 dark:text-amber-400',
        error:   'text-rose-600 dark:text-rose-400',
        neutral: 'text-slate-500 dark:text-slate-400',
        info:    'text-blue-600 dark:text-blue-400',
    },
};

const alertClasses = computed(() => {
    const base = 'relative flex items-start p-4 rounded-2xl gap-3.5 transition-all duration-200 my-2.5 overflow-hidden shadow-2xs';
    const typeClasses = ALERT_CLASSES[props.variant]?.[props.type] ?? ALERT_CLASSES.soft.info;
    return `${base} ${typeClasses}`;
});

const indicatorClasses = computed(() =>
    props.variant === 'solid' ? 'bg-white/20' : (INDICATOR_CLASSES[props.type] ?? 'bg-blue-500')
);

const iconClasses = computed(() =>
    props.variant === 'solid' ? 'text-white/90' : (ICON_CLASSES[props.variant]?.[props.type] ?? 'text-blue-600 dark:text-blue-400')
);

const progressBarColor = computed(() =>
    props.variant === 'solid' ? 'bg-white/40' : (INDICATOR_CLASSES[props.type] ?? 'bg-blue-500')
);
</script>

<template>
    <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
    >
        <div
            v-if="isVisible"
            :class="alertClasses"
            role="alert"
            @mouseenter="autoClose > 0 ? (paused = true) : null"
            @mouseleave="autoClose > 0 ? (paused = false) : null"
        >
            <!-- Left Accent Indicator Bar -->
            <div class="absolute left-0 top-0 bottom-0 w-1" :class="indicatorClasses"></div>

            <!-- Google Material Icon (mendukung slot custom) -->
            <div class="shrink-0 flex items-center justify-center pt-0.5" :class="iconClasses">
                <slot name="icon">
                    <span class="material-symbols-outlined text-xl select-none">{{ currentIcon }}</span>
                </slot>
            </div>

            <!-- Body Content -->
            <div class="flex-1 min-w-0">
                <h5 v-if="title" class="font-semibold text-sm leading-tight mb-0.5">{{ title }}</h5>
                <p v-if="message" class="text-xs leading-relaxed opacity-90">{{ message }}</p>
                <div v-if="$slots.default" class="text-xs leading-relaxed mt-0.5">
                    <slot></slot>
                </div>
            </div>

            <!-- Actions & Dismiss Button Container -->
            <div v-if="$slots.action || dismissible" class="shrink-0 flex items-center gap-2.5 ml-auto self-center pl-2">
                <!-- Action Slot -->
                <div v-if="$slots.action" class="flex items-center gap-2">
                    <slot name="action" :dismiss="handleDismiss" />
                </div>

                <!-- Close / Dismiss Button -->
                <button
                    v-if="dismissible"
                    type="button"
                    @click="handleDismiss"
                    class="inline-flex items-center justify-center p-1 rounded-lg text-current opacity-70 hover:opacity-100 hover:bg-black/10 focus:outline-hidden transition-all duration-150"
                    aria-label="Tutup alert"
                    title="Tutup"
                >
                    <span class="material-symbols-outlined text-lg leading-none select-none">close</span>
                </button>
            </div>

            <!-- AutoClose Progress Bar -->
            <div
                v-if="autoClose > 0"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10"
            >
                <div
                    class="h-full"
                    :class="progressBarColor"
                    :style="{ width: `${progress}%` }"
                ></div>
            </div>
        </div>
    </Transition>
</template>
