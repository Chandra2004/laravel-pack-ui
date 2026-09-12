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
        default: 4000, // Interval durasi default (ms), misal 5000 untuk 5 detik
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

        // Hitung mundur waktu setiap notifikasi secara independen
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

        // Hentikan interval jika tidak ada lagi notifikasi yang berdurasi
        if (activeCount === 0) {
            clearInterval(timer);
            timer = null;
            lastTimestamp = null;
        }
    }, 25);
};

// Reaktif: Segera jalankan timer jika notifikasi baru masuk
watch(
    () => notifications.value.length,
    (len) => {
        if (len > 0) {
            runTimer();
        }
    },
    { immediate: true }
);

// Sinkronisasi prop duration ke composable
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

// Multiple toast group per posisi layar
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

const getMaterialIcon = (type) => {
    switch (type) {
        case 'success': return 'check_circle';
        case 'warning': return 'warning';
        case 'error': return 'error';
        case 'neutral': return 'notifications';
        case 'info':
        default: return 'info';
    }
};

const DEFAULT_TYPE_LABELS = {
    success: 'Sukses',
    warning: 'Peringatan',
    error: 'Gagal',
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

const getIndicatorColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'bg-white/30';
    switch (type) {
        case 'success': return 'bg-emerald-500';
        case 'error': return 'bg-rose-500';
        case 'warning': return 'bg-amber-500';
        case 'neutral': return 'bg-slate-400';
        case 'info':
        default: return 'bg-blue-500';
    }
};

const getCardThemeClasses = (type, variant = 'default') => {
    if (variant === 'solid') {
        switch (type) {
            case 'success': return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20';
            case 'error': return 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20';
            case 'warning': return 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20';
            case 'neutral': return 'bg-slate-700 text-white border-slate-600 shadow-slate-700/20';
            case 'info':
            default: return 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20';
        }
    }

    if (variant === 'soft') {
        switch (type) {
            case 'success': return 'bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100 border-emerald-200/80 dark:border-emerald-800/70';
            case 'error': return 'bg-rose-50/95 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100 border-rose-200/80 dark:border-rose-800/70';
            case 'warning': return 'bg-amber-50/95 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 border-amber-200/80 dark:border-amber-800/70';
            case 'neutral': return 'bg-slate-100/95 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700';
            case 'info':
            default: return 'bg-blue-50/95 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100 border-blue-200/80 dark:border-blue-800/70';
        }
    }

    if (variant === 'outline') {
        switch (type) {
            case 'success': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-emerald-500 dark:border-emerald-500';
            case 'error': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-rose-500 dark:border-rose-500';
            case 'warning': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-amber-500 dark:border-amber-500';
            case 'neutral': return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-400 dark:border-slate-600';
            case 'info':
            default: return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-blue-500 dark:border-blue-500';
        }
    }

    // Default: Clean Card
    return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800';
};

const getIconBadgeClasses = (type, variant = 'default') => {
    if (variant === 'solid') {
        return 'bg-white/20 text-white';
    }
    switch (type) {
        case 'success': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
        case 'error': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';
        case 'warning': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
        case 'neutral': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
        case 'info':
        default: return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
    }
};

const getTagColor = (type, variant = 'default') => {
    if (variant === 'solid') return 'text-white/90';
    switch (type) {
        case 'success': return 'text-emerald-600 dark:text-emerald-400';
        case 'error': return 'text-rose-600 dark:text-rose-400';
        case 'warning': return 'text-amber-600 dark:text-amber-400';
        case 'neutral': return 'text-slate-500 dark:text-slate-400';
        case 'info':
        default: return 'text-blue-600 dark:text-blue-400';
    }
};

const getTextColor = (variant = 'default') => {
    if (variant === 'solid') return 'text-white/90';
    return 'text-slate-600 dark:text-slate-300';
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
                        class="pointer-events-auto relative flex flex-col border rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 w-full"
                        :class="getCardThemeClasses(item.type, item.variant)"
                        :style="item.customStyle ? {
                            backgroundColor: item.customStyle.bg,
                            color: item.customStyle.color,
                            borderColor: item.customStyle.border
                        } : {}"
                        @mouseenter="handleMouseEnter(item)"
                        @mouseleave="handleMouseLeave(item)"
                        role="alert"
                    >
                        <!-- Left Accent Indicator Bar -->
                        <div class="absolute left-0 top-0 bottom-0 w-1" :class="getIndicatorColor(item.type, item.variant)"></div>

                        <div class="flex items-start p-3.5 pl-4 gap-3">
                            <!-- Icon Box -->
                            <div
                                class="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl mt-0.5"
                                :class="getIconBadgeClasses(item.type, item.variant)"
                            >
                                <span
                                    class="material-symbols-outlined text-lg select-none"
                                    :class="{ 'animate-spin': item.isSpinning }"
                                >
                                    {{ item.icon || getMaterialIcon(item.type) }}
                                </span>
                            </div>

                            <!-- Content Text -->
                            <div class="flex-1 min-w-0 pr-1">
                                <div class="flex items-center gap-2 mb-0.5">
                                    <span class="text-[10px] font-bold uppercase tracking-wider select-none" :class="getTagColor(item.type, item.variant)">
                                        {{ getTypeLabel(item.type) }}
                                    </span>
                                    <h5 v-if="item.title" class="font-semibold text-xs leading-tight">
                                        {{ item.title }}
                                    </h5>
                                </div>
                                <p v-if="item.message" class="text-xs leading-relaxed break-words" :class="getTextColor(item.variant)">
                                    {{ item.message }}
                                </p>

                                <!-- Action Button if provided -->
                                <div v-if="item.action" class="mt-2">
                                    <button
                                        type="button"
                                        @click="handleAction(item)"
                                        class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-hidden transition-colors cursor-pointer"
                                    >
                                        <span v-if="item.action.icon" class="material-symbols-outlined text-sm leading-none">
                                            {{ item.action.icon }}
                                        </span>
                                        <span>{{ item.action.label }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Close Button -->
                            <button
                                v-if="item.dismissible"
                                type="button"
                                @click="remove(item.id)"
                                class="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-hidden transition-all duration-150 self-start -mr-1 -mt-1 cursor-pointer"
                                aria-label="Tutup notifikasi"
                                title="Tutup"
                            >
                                <span class="material-symbols-outlined text-base leading-none select-none">close</span>
                            </button>
                        </div>

                        <!-- Progress Bar Track -->
                        <div v-if="item.duration > 0" class="w-full h-0.5 bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div
                                class="h-full transition-all duration-75 ease-linear"
                                :class="getIndicatorColor(item.type, item.variant)"
                                :style="{ width: `${item.progress}%` }"
                            ></div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </template>
    </div>
</template>
