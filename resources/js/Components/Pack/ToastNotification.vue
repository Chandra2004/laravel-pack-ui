<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useNotification } from '../../Composables/Pack/useNotification';

const props = defineProps({
    position: {
        type: String,
        default: 'top-right',
        validator: (val) => ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'].includes(val),
    },
    duration: {
        type: Number,
        default: 4000,
    },
    autoWatchFlash: {
        type: Boolean,
        default: true,
    },
    maxToasts: {
        type: Number,
        default: 5,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    typeLabels: {
        type: Object,
        default: () => ({}),
    },
    variant: {
        type: String,
        default: 'default',
        validator: (val) => ['default', 'soft', 'solid', 'outline'].includes(val),
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    radius: {
        type: String,
        default: 'lg',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(val),
    },
    showTypeLabel: {
        type: Boolean,
        default: false,
    },
    showIcon: {
        type: Boolean,
        default: true,
    },
    showIndicatorBar: {
        type: Boolean,
        default: true,
    },
    showProgressBar: {
        type: Boolean,
        default: true,
    },
    teleport: {
        type: Boolean,
        default: true,
    },
});

const { notifications, remove, clear, setDefaultDuration, initFlashWatcher } = useNotification();

let timer = null;
let lastTimestamp = null;

const runTimer = () => {
    if (timer) return;
    lastTimestamp = performance.now();

    timer = setInterval(() => {
        const now = performance.now();
        const delta = now - (lastTimestamp || now);
        lastTimestamp = now;

        let activeCount = 0;

        for (let i = notifications.value.length - 1; i >= 0; i--) {
            const item = notifications.value[i];
            if (item && item.duration > 0) {
                activeCount++;
                if (!item.paused) {
                    item.remaining = Math.max(0, item.remaining - delta);
                    item.progress = Math.max(0, (item.remaining / item.duration) * 100);
                    if (item.remaining <= 0) {
                        remove(item.id);
                    }
                }
            }
        }

        if (activeCount === 0) {
            clearInterval(timer);
            timer = null;
            lastTimestamp = null;
        }
    }, 25);
};

watch(
    () => notifications.value.length,
    (len) => {
        if (len > 0) {
            runTimer();
        }
    },
    { immediate: true }
);

watch(
    () => props.duration,
    (newVal) => {
        if (typeof newVal === 'number' && newVal >= 0) {
            setDefaultDuration(newVal);
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (props.duration !== undefined) {
        setDefaultDuration(props.duration);
    }
    if (props.autoWatchFlash) {
        initFlashWatcher();
    }
    runTimer();
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});

const positions = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'];

const toastsByPosition = computed(() => {
    const map = {};
    for (const pos of positions) {
        map[pos] = [];
    }
    for (const item of notifications.value) {
        const pos = item.position || props.position;
        if (map[pos] && map[pos].length < props.maxToasts) {
            map[pos].push(item);
        }
    }
    return map;
});

const handleMouseEnter = (item) => {
    item.paused = true;
};

const handleMouseLeave = (item) => {
    item.paused = false;
    runTimer();
};

const handleAction = (item) => {
    if (item.action && typeof item.action.onClick === 'function') {
        item.action.onClick(item);
    }
    if (item.action?.autoDismiss !== false) {
        remove(item.id);
    }
};

// Deteksi multi-line (ada title, action, atau custom layout)
const isItemMultiline = (item) => {
    return Boolean(item.title || item.action || (item.showTypeLabel ?? props.showTypeLabel));
};

const TYPE_ICONS = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    purple: 'auto_awesome',
    dark: 'terminal',
    neutral: 'notifications',
    info: 'info',
};

const getMaterialIcon = (type) => TYPE_ICONS[type] || 'info';

const DEFAULT_TYPE_LABELS = {
    success: 'Sukses',
    warning: 'Peringatan',
    error: 'Gagal',
    purple: 'Khusus',
    dark: 'Sistem',
    neutral: 'Notifikasi',
    info: 'Informasi',
};

const getTypeLabel = (type) => props.typeLabels[type] || DEFAULT_TYPE_LABELS[type] || 'Informasi';

const getPositionClasses = (pos) => {
    switch (pos) {
        case 'top-left': return 'top-3 left-3 items-start';
        case 'top-center': return 'top-3 left-1/2 -translate-x-1/2 items-center';
        case 'bottom-right': return 'bottom-3 right-3 items-end';
        case 'bottom-left': return 'bottom-3 left-3 items-start';
        case 'bottom-center': return 'bottom-3 left-1/2 -translate-x-1/2 items-center';
        case 'top-right':
        default: return 'top-3 right-3 items-end';
    }
};

const getIndicatorColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'bg-white/35';
    switch (type) {
        case 'success': return 'bg-emerald-500';
        case 'error': return 'bg-rose-500';
        case 'warning': return 'bg-amber-500';
        case 'purple': return 'bg-purple-500';
        case 'dark': return 'bg-zinc-800 dark:bg-zinc-200';
        case 'neutral': return 'bg-slate-400 dark:bg-slate-500';
        case 'info':
        default: return 'bg-blue-500';
    }
};

const getIconColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'text-white/95';
    switch (type) {
        case 'success': return 'text-emerald-600 dark:text-emerald-400';
        case 'error': return 'text-rose-600 dark:text-rose-400';
        case 'warning': return 'text-amber-600 dark:text-amber-400';
        case 'purple': return 'text-purple-600 dark:text-purple-400';
        case 'dark': return 'text-zinc-600 dark:text-zinc-300';
        case 'neutral': return 'text-slate-500 dark:text-slate-400';
        case 'info':
        default: return 'text-blue-600 dark:text-blue-400';
    }
};

const getCardThemeClasses = (type, variant = 'default') => {
    const activeVariant = variant || props.variant;

    if (activeVariant === 'solid') {
        switch (type) {
            case 'success': return 'bg-emerald-600 text-white border border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700 shadow-sm';
            case 'error': return 'bg-rose-600 text-white border border-rose-600 dark:bg-rose-700 dark:border-rose-700 shadow-sm';
            case 'warning': return 'bg-amber-500 text-white border border-amber-500 dark:bg-amber-600 dark:border-amber-600 shadow-sm';
            case 'purple': return 'bg-purple-600 text-white border border-purple-600 dark:bg-purple-700 dark:border-purple-700 shadow-sm';
            case 'dark': return 'bg-zinc-800 text-white border border-zinc-800 dark:bg-zinc-900 dark:border-zinc-900 shadow-sm';
            case 'neutral': return 'bg-slate-700 text-white border border-slate-700 dark:bg-slate-800 dark:border-slate-800 shadow-sm';
            case 'info':
            default: return 'bg-blue-600 text-white border border-blue-600 dark:bg-blue-700 dark:border-blue-700 shadow-sm';
        }
    }

    if (activeVariant === 'soft') {
        switch (type) {
            case 'success': return 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/50 shadow-xs';
            case 'error': return 'bg-rose-50/90 text-rose-950 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/50 shadow-xs';
            case 'warning': return 'bg-amber-50/90 text-amber-950 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/50 shadow-xs';
            case 'purple': return 'bg-purple-50/90 text-purple-950 border border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/50 shadow-xs';
            case 'dark': return 'bg-zinc-100/90 text-zinc-900 border border-zinc-200/80 dark:bg-zinc-800/50 dark:text-zinc-200 dark:border-zinc-700/60 shadow-xs';
            case 'neutral': return 'bg-slate-100/90 text-slate-800 border border-slate-200/80 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700/50 shadow-xs';
            case 'info':
            default: return 'bg-blue-50/90 text-blue-950 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/50 shadow-xs';
        }
    }

    if (activeVariant === 'outline') {
        switch (type) {
            case 'success': return 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-xs';
            case 'error': return 'bg-white dark:bg-slate-900 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 shadow-xs';
            case 'warning': return 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs';
            case 'purple': return 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 shadow-xs';
            case 'dark': return 'bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 border border-zinc-400 dark:border-zinc-600 shadow-xs';
            case 'neutral': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs';
            case 'info':
            default: return 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 shadow-xs';
        }
    }

    // Default: Clean Card identik Alert.vue
    return 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800/90 shadow-xs';
};

const getTextColor = (variant = 'default') => {
    if (variant === 'solid') return 'text-white/90';
    return 'text-slate-600 dark:text-slate-300';
};

const getTagColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'text-white/90';
    switch (type) {
        case 'success': return 'text-emerald-600 dark:text-emerald-400';
        case 'error': return 'text-rose-600 dark:text-rose-400';
        case 'warning': return 'text-amber-600 dark:text-amber-400';
        case 'purple': return 'text-purple-600 dark:text-purple-400';
        case 'dark': return 'text-zinc-800 dark:text-zinc-300';
        case 'neutral': return 'text-slate-500 dark:text-slate-400';
        case 'info':
        default: return 'text-blue-600 dark:text-blue-400';
    }
};

const getRadiusClass = (customRadius) => {
    const r = customRadius || props.radius;
    switch (r) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'xl': return 'rounded-xl';
        case '2xl': return 'rounded-2xl';
        case 'full': return 'rounded-full';
        case 'lg':
        default: return 'rounded-lg';
    }
};

// Skala ukuran yang 100% konsisten dan serasi dengan Alert.vue (compact, ramping, hemat padding vertikal)
const SIZE_CONFIG = {
    sm: {
        root: 'py-1.5 pl-3 pr-2 gap-2 text-xs',
        icon: 'text-[16px]',
        title: 'text-xs font-semibold leading-tight',
        message: 'text-[11.5px] leading-snug',
        close: 'w-4 h-4',
        closeIcon: 'text-[13px]',
    },
    md: {
        root: 'py-2 pl-3.5 pr-2.5 gap-2.5 text-xs',
        icon: 'text-[18px]',
        title: 'text-xs font-semibold leading-tight',
        message: 'text-xs leading-snug',
        close: 'w-5 h-5',
        closeIcon: 'text-[14px]',
    },
    lg: {
        root: 'py-2.5 pl-4 pr-3 gap-3 text-sm',
        icon: 'text-[20px]',
        title: 'text-sm font-semibold leading-tight',
        message: 'text-[13px] leading-snug',
        close: 'w-6 h-6',
        closeIcon: 'text-[16px]',
    },
};

const getSizeConfig = (customSize) => SIZE_CONFIG[customSize] || SIZE_CONFIG[props.size] || SIZE_CONFIG.md;

const isIconVisible = (item) => {
    if (item.showIcon !== undefined) return Boolean(item.showIcon);
    return props.showIcon;
};

const isTypeLabelVisible = (item) => {
    if (item.showTypeLabel !== undefined) return Boolean(item.showTypeLabel);
    return props.showTypeLabel;
};

const isIndicatorBarVisible = (item) => {
    if (item.showIndicatorBar !== undefined) return Boolean(item.showIndicatorBar);
    return props.showIndicatorBar;
};

const isProgressBarVisible = (item) => {
    if (item.showProgressBar !== undefined) return Boolean(item.showProgressBar);
    return props.showProgressBar;
};
</script>

<template>
    <Teleport to="body" :disabled="!teleport">
        <div class="toast-root">
        <template v-for="pos in positions" :key="pos">
            <div
                v-if="toastsByPosition[pos]?.length > 0"
                class="fixed z-9999 flex flex-col gap-1.5 pointer-events-none w-full max-w-90 px-3"
                :class="getPositionClasses(pos)"
                aria-live="polite"
                aria-atomic="true"
            >
                <!-- Clear All Button -->
                <div
                    v-if="clearable && toastsByPosition[pos].length >= 2"
                    class="pointer-events-auto flex items-center justify-end w-full mb-0.5"
                >
                    <button
                        type="button"
                        @click="clear(pos)"
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-white/95 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none leading-none"
                    >
                        <span class="material-symbols-outlined text-[13px] leading-none shrink-0 flex items-center justify-center">clear_all</span>
                        <span class="leading-none inline-flex items-center">Bersihkan</span>
                    </button>
                </div>

                <TransitionGroup
                    enter-active-class="transition-all duration-200 ease-out transform"
                    enter-from-class="opacity-0 translate-y-1.5 scale-98"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-150 ease-in transform"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 scale-95"
                    tag="div"
                    class="w-full flex flex-col gap-1.5"
                >
                    <div
                        v-for="item in toastsByPosition[pos]"
                        :key="item.id"
                        class="pointer-events-auto relative flex transition-all duration-200 overflow-hidden shadow-xs hover:shadow-sm w-full"
                        :class="[
                            isItemMultiline(item) ? 'items-start' : 'items-center',
                            getSizeConfig(item.size).root,
                            getCardThemeClasses(item.type, item.variant),
                            getRadiusClass(item.radius),
                        ]"
                        :style="item.customStyle ? {
                            backgroundColor: item.customStyle.bg,
                            color: item.customStyle.color,
                            borderColor: item.customStyle.border
                        } : {}"
                        @mouseenter="handleMouseEnter(item)"
                        @mouseleave="handleMouseLeave(item)"
                        role="alert"
                    >
                        <!-- Scoped Slot: Default (Custom layout seutuhnya) -->
                        <slot :toast="item" :close="() => remove(item.id)">
                            <!-- 1. Left Accent Indicator Line (3px) -->
                            <div
                                v-if="isIndicatorBarVisible(item)"
                                class="absolute left-0 inset-y-0 w-0.75"
                                :class="getIndicatorColor(item.type, item.variant)"
                            ></div>

                            <!-- 2. Leading Icon (Ramping, inline, tanpa kotak background tebal) -->
                            <div
                                v-if="isIconVisible(item)"
                                class="shrink-0 flex items-center justify-center"
                                :class="[
                                    getIconColor(item.type, item.variant),
                                    isItemMultiline(item) ? 'mt-0.5' : '',
                                ]"
                            >
                                <slot name="icon" :toast="item">
                                    <span
                                        class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center"
                                        :class="[
                                            getSizeConfig(item.size).icon,
                                            { 'animate-spin': item.isSpinning },
                                        ]"
                                    >
                                        {{ item.icon || getMaterialIcon(item.type) }}
                                    </span>
                                </slot>
                            </div>

                            <!-- 3. Body Content (Menggunakan div m-0 p-0 untuk mengeliminasi margin bawaan browser) -->
                            <div class="flex-1 min-w-0">
                                <!-- Title Bar -->
                                <div
                                    v-if="item.title || isTypeLabelVisible(item)"
                                    class="flex items-center gap-1.5 leading-tight"
                                    :class="item.message ? 'mb-0.5' : ''"
                                >
                                    <span
                                        v-if="isTypeLabelVisible(item)"
                                        class="uppercase tracking-wider select-none rounded leading-none text-[8.5px] px-1 py-px font-bold"
                                        :class="[
                                            getTagColor(item.type, item.variant),
                                            item.variant === 'solid' ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10',
                                        ]"
                                    >
                                        {{ getTypeLabel(item.type) }}
                                    </span>

                                    <slot name="title" :toast="item">
                                        <div
                                            v-if="item.title"
                                            :class="getSizeConfig(item.size).title"
                                        >
                                            {{ item.title }}
                                        </div>
                                    </slot>
                                </div>

                                <!-- Message Body (Bebas margin vertikal berlebih) -->
                                <slot name="message" :toast="item">
                                    <div
                                        v-if="item.message"
                                        class="m-0 p-0 opacity-90 wrap-break-word"
                                        :class="[
                                            getSizeConfig(item.size).message,
                                            getTextColor(item.variant),
                                        ]"
                                    >
                                        {{ item.message }}
                                    </div>
                                </slot>

                                <!-- Action Slot -->
                                <slot name="action" :toast="item" :close="() => remove(item.id)">
                                    <div v-if="item.action" class="mt-1 flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            @click="handleAction(item)"
                                            class="inline-flex items-center gap-1.5 font-semibold rounded px-2 py-0.5 text-[11px] border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-colors cursor-pointer leading-none"
                                        >
                                            <span v-if="item.action.icon" class="material-symbols-outlined text-[12px] leading-none shrink-0 flex items-center justify-center">
                                                {{ item.action.icon }}
                                            </span>
                                            <span class="leading-none inline-flex items-center">{{ item.action.label }}</span>
                                        </button>
                                    </div>
                                </slot>
                            </div>

                            <!-- 4. Close Button (Sleek & Minimal, sama seperti Alert) -->
                            <div v-if="item.dismissible" class="shrink-0 flex items-center ml-auto self-center pl-1.5">
                                <button
                                    type="button"
                                    @click="remove(item.id)"
                                    class="inline-flex items-center justify-center rounded text-current opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all duration-150 cursor-pointer leading-none"
                                    :class="[
                                        getSizeConfig(item.size).close,
                                        isItemMultiline(item) ? 'self-start mt-0.5' : 'self-center',
                                    ]"
                                    aria-label="Tutup notifikasi"
                                    title="Tutup"
                                >
                                    <span
                                        class="material-symbols-outlined leading-none select-none flex items-center justify-center"
                                        :class="getSizeConfig(item.size).closeIcon"
                                    >
                                        close
                                    </span>
                                </button>
                            </div>

                            <!-- 5. Hairline Progress Bar Track (2px) Absolute di Bawah (Tidak menaikkan tinggi flex kartu) -->
                            <div
                                v-if="item.duration > 0 && isProgressBarVisible(item)"
                                class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/10 overflow-hidden"
                            >
                                <div
                                    class="h-full transition-[width] duration-75 ease-linear"
                                    :class="getIndicatorColor(item.type, item.variant)"
                                    :style="{ width: `${item.progress}%` }"
                                ></div>
                            </div>
                        </slot>
                    </div>
                </TransitionGroup>
            </div>
        </template>
        </div>
    </Teleport>
</template>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite !important;
    display: inline-block !important;
    transform-origin: center center !important;
}
</style>
