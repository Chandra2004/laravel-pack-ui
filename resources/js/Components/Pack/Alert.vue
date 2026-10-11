<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: undefined,
    },
    show: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: undefined,
        validator: (value) => value === undefined || ['success', 'warning', 'error', 'danger', 'info', 'neutral'].includes(value),
    },
    design: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'minimal', 'bordered', 'floating', 'modern'].includes(value),
    },
    color: {
        type: String,
        default: undefined,
        validator: (value) => value === undefined || [
            'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark',
            'success', 'warning', 'error', 'danger', 'info', 'neutral'
        ].includes(value),
    },
    variant: {
        type: String,
        default: 'soft',
        validator: (value) => ['soft', 'solid', 'outline', 'pill'].includes(value),
    },
    style: {
        type: String,
        default: undefined,
        validator: (value) => value === undefined || ['soft', 'solid', 'outline', 'pill'].includes(value),
    },
    radius: {
        type: String,
        default: 'xl',
        validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
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
        default: 0,
    },
    icon: {
        type: String,
        default: '',
    },
    iconSize: {
        type: String,
        default: 'md',
        validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    iconStyle: {
        type: String,
        default: 'plain',
        validator: (value) => ['plain', 'subtle', 'circle', 'square'].includes(value),
    },
    iconPosition: {
        type: String,
        default: 'start',
        validator: (value) => ['start', 'center'].includes(value),
    },
    iconColor: {
        type: String,
        default: '',
    },
    showIcon: {
        type: Boolean,
        default: true,
    },
    showIndicator: {
        type: Boolean,
        default: true,
    },
    dismissLabel: {
        type: String,
        default: 'Tutup notifikasi',
    },
    align: {
        type: String,
        default: 'left',
        validator: (value) => ['left', 'center', 'right', 'justify'].includes(value),
    },
    items: {
        type: Array,
        default: () => [],
    },
    listType: {
        type: String,
        default: 'disc',
        validator: (value) => ['disc', 'decimal', 'none'].includes(value),
    },
    collapsible: {
        type: Boolean,
        default: false,
    },
    defaultExpanded: {
        type: Boolean,
        default: true,
    },
    actionPosition: {
        type: String,
        default: 'end',
        validator: (value) => ['end', 'bottom'].includes(value),
    },
    isLog: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'update:show', 'dismiss', 'open', 'close', 'log', 'toggle:collapse']);

// Telemetri Logging Internal Helper
const emitLog = (eventName, detail, level = 'info') => {
    if (!props.isLog) return;
    const payload = {
        component: 'Alert',
        event: eventName,
        detail,
        level,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
    };
    if (typeof console !== 'undefined' && console[level]) {
        console[level](`[Pack UI][Alert] @${eventName} -> ${detail}`);
    }
    emit('log', payload);
};

// modelValue takes priority — show sebagai fallback
const resolveVisible = () => props.modelValue !== undefined ? props.modelValue : props.show;

const isVisible = ref(resolveVisible());
const progress = ref(100);
const paused = ref(false);
const isExpanded = ref(props.defaultExpanded);

let progressInterval = null;
let autoCloseTimer = null;

const toggleCollapse = () => {
    isExpanded.value = !isExpanded.value;
    emit('toggle:collapse', isExpanded.value);
    emitLog('toggle:collapse', `Daftar rincian diubah: ${isExpanded.value ? 'Terbuka' : 'Tertutup'}`);
};

const handleMouseEnter = () => {
    if (props.autoClose > 0) {
        paused.value = true;
        emitLog('timer:pause', 'Timer auto-close dijeda karena kursor mouse berada di atas alert');
    }
};

const handleMouseLeave = () => {
    if (props.autoClose > 0) {
        paused.value = false;
        emitLog('timer:resume', 'Timer auto-close dilanjutkan kembali');
    }
};

const clearTimers = () => {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
};

const startAutoClose = () => {
    if (props.autoClose <= 0 || !isVisible.value) return;
    clearTimers();

    progress.value = 100;
    let remaining = props.autoClose;

    emitLog('timer:start', `AutoClose timer aktif: ${props.autoClose}ms`);

    progressInterval = setInterval(() => {
        if (paused.value) return;
        remaining -= 40;
        progress.value = Math.max(0, (remaining / props.autoClose) * 100);
        if (remaining <= 0) {
            emitLog('timer:end', 'AutoClose timer kedaluwarsa, menutup notifikasi');
            handleDismiss();
        }
    }, 40);
};

// modelValue (v-model) priority watch
watch(() => props.modelValue, (val) => {
    if (val === undefined) return;
    if (val === isVisible.value) return;
    isVisible.value = val;
    if (val) {
        emit('open');
        emitLog('open', 'Alert ditampilkan via v-model');
        startAutoClose();
    } else {
        clearTimers();
        emitLog('close', 'Alert disembunyikan via v-model');
    }
});

// show prop watch
watch(() => props.show, (val) => {
    if (props.modelValue !== undefined) return;
    if (val === isVisible.value) return;
    isVisible.value = val;
    if (val) {
        emit('open');
        emitLog('open', 'Alert ditampilkan via prop show');
        startAutoClose();
    } else {
        clearTimers();
        emitLog('close', 'Alert disembunyikan via prop show');
    }
});

// autoClose reaktif
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
    emitLog('dismiss', 'Pengguna menutup notifikasi alert');
};

onMounted(() => {
    if (isVisible.value) {
        emit('open');
        emitLog('mounted', 'Alert dimuat ke DOM');
        startAutoClose();
    }
});

onUnmounted(() => {
    clearTimers();
});

// --- Resolusi Dimensi Warna & Gaya Visual ---
const resolvedVariant = computed(() => props.style || props.variant || 'soft');

const resolvedColor = computed(() => {
    if (props.color) {
        // Alias mapping
        if (props.color === 'success') return 'emerald';
        if (props.color === 'warning') return 'amber';
        if (props.color === 'error' || props.color === 'danger') return 'rose';
        if (props.color === 'info') return 'cyan';
        if (props.color === 'neutral') return 'dark';
        return props.color;
    }
    if (props.type) {
        if (props.type === 'success') return 'emerald';
        if (props.type === 'warning') return 'amber';
        if (props.type === 'error' || props.type === 'danger') return 'rose';
        if (props.type === 'info') return 'indigo';
        if (props.type === 'neutral') return 'dark';
    }
    return 'indigo';
});

const TYPE_ICONS = {
    emerald: 'check_circle',
    amber: 'warning',
    rose: 'error',
    cyan: 'info',
    indigo: 'info',
    primary: 'campaign',
    purple: 'auto_awesome',
    dark: 'notifications',
};

const shouldRenderIcon = computed(() => {
    if (!props.showIcon) return false;
    if (props.icon === 'none') return false;
    return true;
});

const currentIcon = computed(() => {
    if (props.icon && props.icon !== 'none') return props.icon;
    return TYPE_ICONS[resolvedColor.value] || 'info';
});

const computedRole = computed(() => {
    return ['rose', 'amber'].includes(resolvedColor.value) ? 'alert' : 'status';
});

const computedAriaLive = computed(() => {
    return ['rose', 'amber'].includes(resolvedColor.value) ? 'assertive' : 'polite';
});

// Palet Kelas Warna Tailwind
const COLOR_VARIANT_CLASSES = {
    indigo: {
        soft: 'bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800/60',
        solid: 'bg-indigo-600 text-white border-transparent dark:bg-indigo-700',
        outline: 'bg-white text-indigo-800 border border-indigo-500 dark:bg-transparent dark:text-indigo-300 dark:border-indigo-600',
        pill: 'bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800/60 !rounded-full ring-1 ring-indigo-300 dark:ring-indigo-700',
    },
    primary: {
        soft: 'bg-primary-50/90 text-primary-950 border border-primary-200/80 dark:bg-primary-950/40 dark:text-primary-100 dark:border-primary-800/60',
        solid: 'bg-primary-600 text-white border-transparent dark:bg-primary-700',
        outline: 'bg-white text-primary-800 border border-primary-500 dark:bg-transparent dark:text-primary-300 dark:border-primary-600',
        pill: 'bg-primary-50/90 text-primary-950 border border-primary-200/80 dark:bg-primary-950/40 dark:text-primary-100 dark:border-primary-800/60 !rounded-full ring-1 ring-primary-300 dark:ring-primary-700',
    },
    emerald: {
        soft: 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800/60',
        solid: 'bg-emerald-600 text-white border-transparent dark:bg-emerald-700',
        outline: 'bg-white text-emerald-800 border border-emerald-500 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-600',
        pill: 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800/60 !rounded-full ring-1 ring-emerald-300 dark:ring-emerald-700',
    },
    purple: {
        soft: 'bg-purple-50/90 text-purple-950 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-100 dark:border-purple-800/60',
        solid: 'bg-purple-600 text-white border-transparent dark:bg-purple-700',
        outline: 'bg-white text-purple-800 border border-purple-500 dark:bg-transparent dark:text-purple-300 dark:border-purple-600',
        pill: 'bg-purple-50/90 text-purple-950 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-100 dark:border-purple-800/60 !rounded-full ring-1 ring-purple-300 dark:ring-purple-700',
    },
    amber: {
        soft: 'bg-amber-50/90 text-amber-950 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/60',
        solid: 'bg-amber-500 text-white border-transparent dark:bg-amber-600',
        outline: 'bg-white text-amber-800 border border-amber-500 dark:bg-transparent dark:text-amber-300 dark:border-amber-600',
        pill: 'bg-amber-50/90 text-amber-950 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/60 !rounded-full ring-1 ring-amber-300 dark:ring-amber-700',
    },
    rose: {
        soft: 'bg-rose-50/90 text-rose-950 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800/60',
        solid: 'bg-rose-600 text-white border-transparent dark:bg-rose-700',
        outline: 'bg-white text-rose-800 border border-rose-500 dark:bg-transparent dark:text-rose-300 dark:border-rose-600',
        pill: 'bg-rose-50/90 text-rose-950 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800/60 !rounded-full ring-1 ring-rose-300 dark:ring-rose-700',
    },
    cyan: {
        soft: 'bg-cyan-50/90 text-cyan-950 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-100 dark:border-cyan-800/60',
        solid: 'bg-cyan-600 text-white border-transparent dark:bg-cyan-700',
        outline: 'bg-white text-cyan-800 border border-cyan-500 dark:bg-transparent dark:text-cyan-300 dark:border-cyan-600',
        pill: 'bg-cyan-50/90 text-cyan-950 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-100 dark:border-cyan-800/60 !rounded-full ring-1 ring-cyan-300 dark:ring-cyan-700',
    },
    dark: {
        soft: 'bg-slate-100/90 text-slate-800 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700',
        solid: 'bg-slate-700 text-white border-transparent dark:bg-slate-800',
        outline: 'bg-white text-slate-800 border border-slate-300 dark:bg-transparent dark:text-slate-300 dark:border-slate-500',
        pill: 'bg-slate-100/90 text-slate-800 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700 !rounded-full ring-1 ring-slate-300 dark:ring-slate-700',
    },
};

const INDICATOR_CLASSES = {
    indigo: 'bg-indigo-500',
    primary: 'bg-primary-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
    dark: 'bg-slate-500',
};

const ICON_CLASSES = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    primary: 'text-primary-600 dark:text-primary-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    dark: 'text-slate-600 dark:text-slate-400',
};

// Radius Scale
const RADIUS_CLASSES = {
    none: '!rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: '!rounded-full',
};

// Size Scale
const SIZE_CLASSES = {
    xs: 'p-2.5 gap-2 text-xs',
    sm: 'p-3 gap-2.5 text-xs',
    md: 'p-4 gap-3.5 text-sm',
    lg: 'p-5 gap-4 text-base',
    xl: 'p-6 gap-5 text-lg',
};

// Design Scale
const DESIGN_CLASSES = {
    default: 'shadow-2xs',
    minimal: '!border-0 !shadow-none !bg-transparent',
    bordered: 'border-2 border-dashed shadow-none',
    floating: 'shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10',
    modern: 'bg-gradient-to-r shadow-xs',
};

const textAlignClasses = computed(() => {
    switch (props.align) {
        case 'center':
            return 'text-center';
        case 'right':
            return 'text-right';
        case 'justify':
            return 'text-justify';
        case 'left':
        default:
            return 'text-left';
    }
});

const normalizedItems = computed(() => {
    if (!Array.isArray(props.items)) return [];
    return props.items.map((item) => {
        if (typeof item === 'string') {
            return { text: item, children: [] };
        }
        if (item && typeof item === 'object') {
            const text = item.text || item.title || item.label || '';
            const rawChildren = Array.isArray(item.children) ? item.children : (Array.isArray(item.items) ? item.items : []);
            const children = rawChildren.map((child) => {
                if (typeof child === 'string') {
                    return { text: child, children: [] };
                }
                if (child && typeof child === 'object') {
                    const cText = child.text || child.title || child.label || '';
                    const rawSubChildren = Array.isArray(child.children) ? child.children : (Array.isArray(child.items) ? child.items : []);
                    const subChildren = rawSubChildren.map((sc) => typeof sc === 'object' ? (sc.text || sc.title || '') : String(sc));
                    return { text: cText, children: subChildren };
                }
                return { text: String(child), children: [] };
            });
            return { text, children };
        }
        return { text: String(item), children: [] };
    });
});

const hasItems = computed(() => normalizedItems.value.length > 0);

const totalItemsCount = computed(() => {
    let count = 0;
    normalizedItems.value.forEach((item) => {
        count++;
        if (item.children) {
            count += item.children.length;
        }
    });
    return count;
});

const listClasses = computed(() => {
    const typeClass = props.listType === 'decimal' ? 'list-decimal' : (props.listType === 'none' ? 'list-none' : 'list-disc');
    const alignClass = props.align === 'center'
        ? 'list-inside text-center inline-block'
        : (props.align === 'right' ? 'list-inside text-right' : 'list-inside text-left');
    return `${typeClass} ${alignClass} space-y-1.5 w-full`;
});

const subListClasses = computed(() => {
    const typeClass = props.listType === 'decimal' ? 'list-[lower-alpha]' : (props.listType === 'none' ? 'list-none' : 'list-[circle]');
    const indent = props.align === 'center' ? 'pl-0' : (props.align === 'right' ? 'pr-4' : 'pl-4');
    return `${typeClass} ${indent} list-inside space-y-1 mt-1 opacity-90`;
});

const subSubListClasses = computed(() => {
    const typeClass = props.listType === 'decimal' ? 'list-[lower-roman]' : (props.listType === 'none' ? 'list-none' : 'list-[square]');
    const indent = props.align === 'center' ? 'pl-0' : (props.align === 'right' ? 'pr-4' : 'pl-4');
    return `${typeClass} ${indent} list-inside space-y-0.5 mt-0.5 opacity-80`;
});

const alertClasses = computed(() => {
    const base = 'relative flex items-start transition-all duration-200 overflow-hidden';
    const radiusCls = RADIUS_CLASSES[props.radius] || RADIUS_CLASSES.xl;
    const sizeCls = SIZE_CLASSES[props.size] || SIZE_CLASSES.md;
    const designCls = DESIGN_CLASSES[props.design] || DESIGN_CLASSES.default;
    const colorStyleCls = COLOR_VARIANT_CLASSES[resolvedColor.value]?.[resolvedVariant.value] || COLOR_VARIANT_CLASSES.indigo.soft;
    return `${base} ${radiusCls} ${sizeCls} ${designCls} ${colorStyleCls}`;
});

const indicatorClasses = computed(() => {
    if (props.design === 'minimal' || !props.showIndicator) return 'hidden';
    return resolvedVariant.value === 'solid' ? 'bg-white/20' : (INDICATOR_CLASSES[resolvedColor.value] ?? 'bg-indigo-500');
});

const ICON_SIZE_CLASSES = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
};

const ICON_CONTAINER_CLASSES = {
    plain: '',
    subtle: 'p-1.5 rounded-lg bg-black/5 dark:bg-white/10',
    circle: 'p-1.5 rounded-full bg-black/5 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10',
    square: 'p-1.5 rounded-md bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10',
};

const iconPositionClass = computed(() =>
    props.iconPosition === 'center' ? 'self-center' : 'self-start pt-0.5'
);

const iconSizeClass = computed(() =>
    ICON_SIZE_CLASSES[props.iconSize] || ICON_SIZE_CLASSES.md
);

const iconContainerClass = computed(() =>
    ICON_CONTAINER_CLASSES[props.iconStyle] || ''
);

const iconClasses = computed(() => {
    if (props.iconColor) {
        return ICON_CLASSES[props.iconColor] || props.iconColor;
    }
    return resolvedVariant.value === 'solid' ? 'text-white/90' : (ICON_CLASSES[resolvedColor.value] ?? 'text-indigo-600 dark:text-indigo-400');
});

const progressBarColor = computed(() =>
    resolvedVariant.value === 'solid' ? 'bg-white/40' : (INDICATOR_CLASSES[resolvedColor.value] ?? 'bg-indigo-500')
);

const DISMISS_BUTTON_CLASSES = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-4 h-4 text-[13px]',
    md: 'w-5 h-5 text-[14px]',
    lg: 'w-6 h-6 text-[16px]',
    xl: 'w-7 h-7 text-[18px]',
};

const dismissButtonClass = computed(() =>
    DISMISS_BUTTON_CLASSES[props.size] || DISMISS_BUTTON_CLASSES.md
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
            :role="computedRole"
            :aria-live="computedAriaLive"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @focusin="handleMouseEnter"
            @focusout="handleMouseLeave"
        >
            <!-- Left Accent Indicator Bar -->
            <div class="absolute left-0 top-0 bottom-0 w-0.75" :class="indicatorClasses"></div>

            <!-- Google Material Icon (mendukung kustomisasi lengkap & slot custom) -->
            <div
                v-if="shouldRenderIcon || $slots.icon"
                class="shrink-0 flex items-center justify-center transition-all duration-200"
                :class="[iconClasses, iconPositionClass, iconContainerClass]"
            >
                <slot name="icon" :icon="currentIcon" :size="iconSize" :style="iconStyle">
                    <span class="material-symbols-outlined select-none transition-transform duration-200" :class="iconSizeClass">{{ currentIcon }}</span>
                </slot>
            </div>

            <!-- Body Content -->
            <div class="flex-1 min-w-0" :class="textAlignClasses">
                <div v-if="title" class="font-semibold text-sm leading-tight mb-0.5">{{ title }}</div>
                <div v-if="message" class="text-xs leading-relaxed opacity-90">{{ message }}</div>
                <div v-if="$slots.default" class="text-xs leading-relaxed mt-0.5">
                    <slot></slot>
                </div>

                <!-- Teks Beranak / Hierarchical Nested Items -->
                <div v-if="hasItems" class="mt-2 text-xs leading-relaxed" :class="align === 'center' ? 'flex flex-col items-center' : ''">
                    <button
                        v-if="collapsible"
                        type="button"
                        @click.prevent.stop="toggleCollapse"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold opacity-85 hover:opacity-100 transition-opacity cursor-pointer mb-1.5 focus:outline-hidden focus-visible:underline"
                        :aria-expanded="isExpanded"
                    >
                        <span class="material-symbols-outlined text-sm leading-none select-none shrink-0 flex items-center justify-center transition-transform duration-200" :class="{ 'rotate-90': isExpanded }">
                            chevron_right
                        </span>
                        <span>{{ isExpanded ? 'Sembunyikan Rincian' : `Lihat Rincian (${totalItemsCount} item)` }}</span>
                    </button>

                    <div v-show="!collapsible || isExpanded" class="w-full">
                        <ul :class="listClasses">
                            <li v-for="(item, idx) in normalizedItems" :key="idx" class="mt-0.5">
                                <span class="font-medium">{{ item.text }}</span>
                                <!-- Sub Level 1 -->
                                <ul v-if="item.children && item.children.length > 0" :class="subListClasses">
                                    <li v-for="(child, cIdx) in item.children" :key="cIdx" class="mt-0.5">
                                        <span>{{ child.text }}</span>
                                        <!-- Sub Level 2 (Sub-anak) -->
                                        <ul v-if="child.children && child.children.length > 0" :class="subSubListClasses">
                                            <li v-for="(subChild, scIdx) in child.children" :key="scIdx" class="mt-0.5">
                                                <span>{{ subChild }}</span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Action Button in Bottom Position -->
                <div v-if="$slots.action && actionPosition === 'bottom'" class="mt-3 flex items-center gap-2" :class="align === 'center' ? 'justify-center' : (align === 'right' ? 'justify-end' : 'justify-start')">
                    <slot name="action" :dismiss="handleDismiss" />
                </div>
            </div>

            <!-- Actions & Dismiss Button Container (End Position) -->
            <div
                v-if="($slots.action && actionPosition === 'end') || dismissible"
                class="shrink-0 flex items-center gap-2.5 ml-auto self-center pl-2"
            >
                <!-- Action Slot -->
                <div v-if="$slots.action && actionPosition === 'end'" class="flex items-center gap-2">
                    <slot name="action" :dismiss="handleDismiss" />
                </div>

                <!-- Close / Dismiss Button -->
                <button
                    v-if="dismissible"
                    type="button"
                    @click.prevent.stop="handleDismiss"
                    class="inline-flex items-center justify-center rounded-lg text-current opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current/40 transition-all duration-150 shrink-0"
                    :class="dismissButtonClass"
                    :aria-label="dismissLabel"
                    :title="dismissLabel"
                >
                    <span class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center text-inherit">close</span>
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
