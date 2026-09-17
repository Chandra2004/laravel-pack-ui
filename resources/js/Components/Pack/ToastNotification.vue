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
    // 1. WARNA: Default variant visual untuk semua toast
    variant: {
        type: String,
        default: 'default',
        validator: (val) => ['default', 'soft', 'solid', 'outline'].includes(val),
    },
    // 2. BENTUK: Ukuran default (sm, md, lg) & Radius border
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    radius: {
        type: String,
        default: '2xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(val),
    },
    // 3. TEKS KONTEN: Visibilitas label tipe
    showTypeLabel: {
        type: Boolean,
        default: true,
    },
    // 4. ICON: Visibilitas icon & Posisi bar
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

// 4. ICON: Mapping Google Material Symbols
const getMaterialIcon = (type) => {
    switch (type) {
        case 'success': return 'check_circle';
        case 'warning': return 'warning';
        case 'error': return 'error';
        case 'purple': return 'auto_awesome';
        case 'dark': return 'terminal';
        case 'neutral': return 'notifications';
        case 'info':
        default: return 'info';
    }
};

// 3. TEKS KONTEN: Label tipe default & kustomisasi
const DEFAULT_TYPE_LABELS = {
    success: 'Sukses',
    warning: 'Peringatan',
    error: 'Gagal',
    purple: 'Khusus',
    dark: 'Sistem',
    neutral: 'Notifikasi',
    info: 'Informasi',
};

const getTypeLabel = (type) => {
    return props.typeLabels[type] || DEFAULT_TYPE_LABELS[type] || 'Informasi';
};

const getPositionClasses = (pos) => {
    switch (pos) {
        case 'top-left': return 'top-4 left-4 items-start';
        case 'top-center': return 'top-4 left-1/2 -translate-x-1/2 items-center';
        case 'bottom-right': return 'bottom-4 right-4 items-end';
        case 'bottom-left': return 'bottom-4 left-4 items-start';
        case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
        case 'top-right':
        default: return 'top-4 right-4 items-end';
    }
};

// 1. WARNA: Accent bar & progress bar color
const getIndicatorColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'bg-white/30';
    switch (type) {
        case 'success': return 'bg-emerald-500';
        case 'error': return 'bg-rose-500';
        case 'warning': return 'bg-amber-500';
        case 'purple': return 'bg-purple-500';
        case 'dark': return 'bg-zinc-800 dark:bg-zinc-200';
        case 'neutral': return 'bg-slate-400';
        case 'info':
        default: return 'bg-blue-500';
    }
};

// 1. WARNA: Theme kartu (Solid, Soft, Outline, Default)
const getCardThemeClasses = (type, variant = 'default') => {
    const activeVariant = variant || props.variant;

    if (activeVariant === 'solid') {
        switch (type) {
            case 'success': return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20';
            case 'error': return 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20';
            case 'warning': return 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20';
            case 'purple': return 'bg-purple-600 text-white border-purple-500 shadow-purple-500/20';
            case 'dark': return 'bg-zinc-900 text-white border-zinc-800 shadow-zinc-900/30';
            case 'neutral': return 'bg-slate-700 text-white border-slate-600 shadow-slate-700/20';
            case 'info':
            default: return 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20';
        }
    }

    if (activeVariant === 'soft') {
        switch (type) {
            case 'success': return 'bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100 border-emerald-200/80 dark:border-emerald-800/70';
            case 'error': return 'bg-rose-50/95 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100 border-rose-200/80 dark:border-rose-800/70';
            case 'warning': return 'bg-amber-50/95 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 border-amber-200/80 dark:border-amber-800/70';
            case 'purple': return 'bg-purple-50/95 dark:bg-purple-950/80 text-purple-950 dark:text-purple-100 border-purple-200/80 dark:border-purple-800/70';
            case 'dark': return 'bg-zinc-100/95 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700';
            case 'neutral': return 'bg-slate-100/95 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700';
            case 'info':
            default: return 'bg-blue-50/95 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100 border-blue-200/80 dark:border-blue-800/70';
        }
    }

    if (activeVariant === 'outline') {
        switch (type) {
            case 'success': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-emerald-500 dark:border-emerald-500';
            case 'error': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-rose-500 dark:border-rose-500';
            case 'warning': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-amber-500 dark:border-amber-500';
            case 'purple': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-purple-500 dark:border-purple-500';
            case 'dark': return 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-800 dark:border-zinc-200';
            case 'neutral': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-400 dark:border-slate-600';
            case 'info':
            default: return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-blue-500 dark:border-blue-500';
        }
    }

    // Default: Clean Card
    return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800';
};

const getIconBadgeClasses = (type, variant = 'default') => {
    const activeVariant = variant || props.variant;
    if (activeVariant === 'solid') {
        return 'bg-white/20 text-white';
    }
    switch (type) {
        case 'success': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
        case 'error': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';
        case 'warning': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
        case 'purple': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400';
        case 'dark': return 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200';
        case 'neutral': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
        case 'info':
        default: return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
    }
};

const getTagColor = (type, variant = 'default') => {
    const activeVariant = variant || props.variant;
    if (activeVariant === 'solid') return 'text-white/90';
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

const getTextColor = (variant = 'default') => {
    const activeVariant = variant || props.variant;
    if (activeVariant === 'solid') return 'text-white/90';
    return 'text-slate-600 dark:text-slate-300';
};

// 2. BENTUK: Helper class border-radius
const getRadiusClass = (customRadius) => {
    const r = customRadius || props.radius;
    switch (r) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'full': return 'rounded-3xl sm:rounded-full';
        case '2xl':
        default: return 'rounded-2xl';
    }
};

const getIconBoxRadius = (customRadius) => {
    const r = customRadius || props.radius;
    switch (r) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-xs';
        case 'md': return 'rounded';
        case 'lg': return 'rounded-md';
        case 'full': return 'rounded-full';
        case 'xl':
        case '2xl':
        default: return 'rounded-xl';
    }
};

// 2. BENTUK: Helper class ukuran padding & font (sm, md, lg)
const getSizeClasses = (customSize) => {
    const s = customSize || props.size;
    switch (s) {
        case 'sm':
            return {
                padding: 'p-2.5 pl-3 gap-2 text-xs',
                iconBox: 'w-7 h-7',
                icon: 'text-base',
                title: 'text-xs font-semibold leading-tight',
                message: 'text-[11px] leading-snug',
                tag: 'text-[9px]',
                action: 'text-[11px] px-2 py-0.5',
                close: 'p-0.5 -mr-0.5 -mt-0.5',
            };
        case 'lg':
            return {
                padding: 'p-4 pl-5 gap-3.5 text-sm',
                iconBox: 'w-10 h-10',
                icon: 'text-xl',
                title: 'text-sm font-bold leading-tight',
                message: 'text-xs sm:text-sm leading-relaxed',
                tag: 'text-[11px]',
                action: 'text-xs sm:text-sm px-3 py-1.5',
                close: 'p-1.5 -mr-1 -mt-1',
            };
        case 'md':
        default:
            return {
                padding: 'p-3.5 pl-4 gap-3 text-xs',
                iconBox: 'w-8 h-8',
                icon: 'text-lg',
                title: 'text-xs font-semibold leading-tight',
                message: 'text-xs leading-relaxed',
                tag: 'text-[10px]',
                action: 'text-xs px-2.5 py-1',
                close: 'p-1 -mr-1 -mt-1',
            };
    }
};

// Evaluasi visibilitas elemen
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
    <div class="toast-root">
        <template v-for="pos in positions" :key="pos">
            <div
                v-if="toastsByPosition[pos]?.length > 0"
                class="fixed z-9999 flex flex-col gap-2.5 pointer-events-none w-full max-w-sm sm:max-w-md px-4"
                :class="getPositionClasses(pos)"
                aria-live="polite"
                aria-atomic="true"
            >
                <!-- Clear All Button (Jika diaktifkan dan ada >= 2 notifikasi) -->
                <div
                    v-if="clearable && toastsByPosition[pos].length >= 2"
                    class="pointer-events-auto flex items-center justify-end w-full"
                >
                    <button
                        type="button"
                        @click="clear(pos)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none"
                    >
                        <span class="material-symbols-outlined text-xs leading-none">clear_all</span>
                        <span>Bersihkan Semua</span>
                    </button>
                </div>

                <TransitionGroup
                    enter-active-class="transition-all duration-300 ease-out transform"
                    enter-from-class="opacity-0 translate-y-3 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-200 ease-in transform"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 scale-90"
                    tag="div"
                    class="w-full flex flex-col gap-2.5"
                >
                    <div
                        v-for="item in toastsByPosition[pos]"
                        :key="item.id"
                        class="pointer-events-auto relative flex flex-col border shadow-lg hover:shadow-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 w-full"
                        :class="[
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
                            <!-- 1. Left Accent Indicator Bar (opsional / bisa dimatikan) -->
                            <div
                                v-if="isIndicatorBarVisible(item)"
                                class="absolute left-0 top-0 bottom-0 w-1"
                                :class="getIndicatorColor(item.type, item.variant)"
                            ></div>

                            <div
                                class="flex items-start"
                                :class="[
                                    getSizeClasses(item.size).padding,
                                    item.iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
                                    !isIndicatorBarVisible(item) ? 'pl-3.5' : '',
                                ]"
                            >
                                <!-- 4. ICON: Kotak Ikon / Slot Icon Kustom -->
                                <div
                                    v-if="isIconVisible(item)"
                                    class="shrink-0 flex items-center justify-center mt-0.5"
                                    :class="[
                                        getSizeClasses(item.size).iconBox,
                                        getIconBadgeClasses(item.type, item.variant),
                                        getIconBoxRadius(item.radius),
                                    ]"
                                >
                                    <slot name="icon" :toast="item">
                                        <span
                                            class="material-symbols-outlined select-none"
                                            :class="[
                                                getSizeClasses(item.size).icon,
                                                { 'animate-spin': item.isSpinning },
                                            ]"
                                        >
                                            {{ item.icon || getMaterialIcon(item.type) }}
                                        </span>
                                    </slot>
                                </div>

                                <!-- 3. TEKS KONTEN: Title, Type Label, Message, Action -->
                                <div class="flex-1 min-w-0 pr-1">
                                    <!-- Header: Type Label Tag & Title -->
                                    <div
                                        v-if="isTypeLabelVisible(item) || item.title"
                                        class="flex items-center gap-2 mb-0.5"
                                    >
                                        <span
                                            v-if="isTypeLabelVisible(item)"
                                            class="font-bold uppercase tracking-wider select-none"
                                            :class="[
                                                getSizeClasses(item.size).tag,
                                                getTagColor(item.type, item.variant),
                                            ]"
                                        >
                                            {{ getTypeLabel(item.type) }}
                                        </span>

                                        <slot name="title" :toast="item">
                                            <h5
                                                v-if="item.title"
                                                :class="getSizeClasses(item.size).title"
                                            >
                                                {{ item.title }}
                                            </h5>
                                        </slot>
                                    </div>

                                    <!-- Message Body -->
                                    <slot name="message" :toast="item">
                                        <p
                                            v-if="item.message"
                                            class="break-words"
                                            :class="[
                                                getSizeClasses(item.size).message,
                                                getTextColor(item.variant),
                                            ]"
                                        >
                                            {{ item.message }}
                                        </p>
                                    </slot>

                                    <!-- Tombol Aksi Kustom -->
                                    <slot name="action" :toast="item" :close="() => remove(item.id)">
                                        <div v-if="item.action" class="mt-2">
                                            <button
                                                type="button"
                                                @click="handleAction(item)"
                                                class="inline-flex items-center gap-1.5 font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-hidden transition-colors cursor-pointer"
                                                :class="getSizeClasses(item.size).action"
                                            >
                                                <span v-if="item.action.icon" class="material-symbols-outlined text-sm leading-none">
                                                    {{ item.action.icon }}
                                                </span>
                                                <span>{{ item.action.label }}</span>
                                            </button>
                                        </div>
                                    </slot>
                                </div>

                                <!-- Close Button -->
                                <button
                                    v-if="item.dismissible"
                                    type="button"
                                    @click="remove(item.id)"
                                    class="shrink-0 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-hidden transition-all duration-150 self-start cursor-pointer"
                                    :class="getSizeClasses(item.size).close"
                                    aria-label="Tutup notifikasi"
                                    title="Tutup"
                                >
                                    <span class="material-symbols-outlined text-base leading-none select-none">close</span>
                                </button>
                            </div>

                            <!-- Progress Bar Track -->
                            <div
                                v-if="item.duration > 0 && isProgressBarVisible(item)"
                                class="w-full h-0.5 bg-black/5 dark:bg-white/10 overflow-hidden"
                            >
                                <div
                                    class="h-full transition-all duration-75 ease-linear"
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
</template>
