<script setup>
import { computed, watch, onMounted } from 'vue';

const props = defineProps({
    /**
     * Pass the whole object returned from useAutoSave() for instant binding.
     */
    autoSave: {
        type: Object,
        default: null,
    },
    /**
     * Dual-way v-model binding for status.
     * Values: 'idle' | 'saving' | 'saved' | 'error' | 'paused'
     */
    modelValue: {
        type: String,
        default: undefined,
        validator: (val) => val === undefined || ['idle', 'saving', 'saved', 'error', 'paused'].includes(val),
    },
    /**
     * Explicit status if not passing autoSave object or modelValue.
     * Values: 'idle' | 'saving' | 'saved' | 'error' | 'paused'
     */
    status: {
        type: String,
        default: 'idle',
        validator: (val) => ['idle', 'saving', 'saved', 'error', 'paused'].includes(val),
    },
    /**
     * 5 Dimensi Desain Paten:
     */
    design: {
        type: String,
        default: 'default',
        validator: (val) => ['default', 'minimal', 'bordered', 'floating', 'modern'].includes(val),
    },
    color: {
        type: String,
        default: undefined,
        validator: (val) => val === undefined || [
            'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark',
            'success', 'warning', 'error', 'danger', 'info', 'neutral'
        ].includes(val),
    },
    style: {
        type: String,
        default: 'soft',
        validator: (val) => ['soft', 'solid', 'outline', 'pill'].includes(val),
    },
    variant: {
        type: String,
        default: 'both', // 'both' | 'badge' | 'banner' OR visual style 'soft' | 'solid' | 'outline' | 'pill'
    },
    radius: {
        type: String,
        default: 'full',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(val),
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    lastSaved: {
        type: [String, Date],
        default: null,
    },
    hasDraft: {
        type: Boolean,
        default: false,
    },
    draftTime: {
        type: String,
        default: '',
    },
    showBanner: {
        type: Boolean,
        default: true,
    },
    savingText: {
        type: String,
        default: 'Menyimpan draf...',
    },
    savedText: {
        type: String,
        default: 'Tersimpan otomatis',
    },
    errorText: {
        type: String,
        default: 'Gagal menyimpan',
    },
    pausedText: {
        type: String,
        default: 'Auto-save dijeda',
    },
    idleText: {
        type: String,
        default: 'Semua perubahan tersimpan',
    },
    restoreText: {
        type: String,
        default: 'Pulihkan Draf',
    },
    discardText: {
        type: String,
        default: 'Abaikan',
    },
    retryText: {
        type: String,
        default: 'Coba Lagi',
    },
    isLog: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['restore', 'discard', 'retry', 'log', 'update:status', 'update:modelValue']);

// Telemetri Logging Helper
const emitLog = (eventName, detail, level = 'info') => {
    if (!props.isLog) return;
    const payload = {
        component: 'AutoSaveStatus',
        event: eventName,
        detail,
        level,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
    };
    if (typeof console !== 'undefined' && console[level]) {
        console[level](`[Pack UI][AutoSaveStatus] @${eventName} -> ${detail}`);
    }
    emit('log', payload);
};

// Resolve properties from autoSave object or fallback props
const resolvedStatus = computed(() => {
    return props.modelValue ?? props.autoSave?.status?.value ?? props.autoSave?.status ?? props.status;
});

// Pancarkan event @update:status dan @update:modelValue saat status berubah
watch(
    resolvedStatus,
    (newVal) => {
        emit('update:modelValue', newVal);
        emit('update:status', newVal);
        emitLog('update:status', `Status penyimpanan beralih ke: ${newVal}`);
    },
    { immediate: false }
);

const resolvedHasDraft = computed(() => {
    if (!props.showBanner) return false;
    return props.autoSave?.hasDraft?.value ?? props.autoSave?.hasDraft ?? props.hasDraft;
});

onMounted(() => {
    if (resolvedHasDraft.value) {
        emitLog('draft:detected', `Draf lokal terdeteksi (${resolvedDraftTime.value || 'sesi sebelumnya'})`);
    }
});

const resolvedDraftTime = computed(() => {
    return props.autoSave?.draftTimeFormatted?.value ?? props.autoSave?.draftTimeFormatted ?? props.draftTime;
});

const resolvedLastSaved = computed(() => {
    return props.autoSave?.lastSavedFormatted?.value ?? props.autoSave?.lastSavedFormatted ?? props.lastSaved;
});

// Resolusi Layout Display Mode (backward compatibility untuk variant 'both'|'badge'|'banner')
const resolvedDisplayMode = computed(() => {
    if (['both', 'badge', 'banner'].includes(props.variant)) {
        return props.variant;
    }
    return 'both';
});

// Resolusi Gaya Visual ('soft', 'solid', 'outline', 'pill')
const resolvedStyle = computed(() => {
    if (['soft', 'solid', 'outline', 'pill'].includes(props.style)) {
        return props.style;
    }
    if (['soft', 'solid', 'outline', 'pill'].includes(props.variant)) {
        return props.variant;
    }
    return 'soft';
});

// Resolusi Warna Aktif (mendukung palet 8 warna paten)
const resolvedColor = computed(() => {
    if (props.color) {
        if (props.color === 'success') return 'emerald';
        if (props.color === 'warning') return 'amber';
        if (props.color === 'error' || props.color === 'danger') return 'rose';
        if (props.color === 'info') return 'cyan';
        if (props.color === 'neutral') return 'dark';
        return props.color;
    }
    switch (resolvedStatus.value) {
        case 'saved': return 'emerald';
        case 'saving': return 'primary';
        case 'error': return 'rose';
        case 'paused': return 'amber';
        case 'idle':
        default: return 'dark';
    }
});

const handleRestore = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (props.autoSave && typeof props.autoSave.restoreDraft === 'function') {
        props.autoSave.restoreDraft();
    }
    emitLog('restore', 'Pengguna memulihkan draf sesi sebelumnya');
    emit('restore');
};

const handleDiscard = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (props.autoSave && typeof props.autoSave.discardDraft === 'function') {
        props.autoSave.discardDraft();
    }
    emitLog('discard', 'Pengguna mengabaikan draf sesi sebelumnya');
    emit('discard');
};

const handleRetry = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (props.autoSave && typeof props.autoSave.saveNow === 'function') {
        props.autoSave.saveNow();
    }
    emitLog('retry', 'Pengguna mencoba ulang proses penyimpanan draf');
    emit('retry');
};

// Sizing classes mapping (xs, sm, md, lg, xl)
const SIZES = {
    xs: {
        badge: 'text-[10px] gap-1 px-2 py-0.5 min-h-[22px]',
        spinner: 'w-2.5 h-2.5 border-[1.25px]',
        icon: 'text-[12px]',
        banner: 'py-1.5 px-3 gap-2 text-xs',
        bannerIcon: 'w-5 h-5 text-[13px]',
        bannerTitle: 'text-xs font-semibold leading-none',
        bannerText: 'text-[10px] leading-tight',
        buttonPrimary: 'px-2 py-0.5 text-[10px] rounded-md gap-1',
        buttonSecondary: 'px-2 py-0.5 text-[10px] rounded-md',
    },
    sm: {
        badge: 'text-[11px] gap-1.5 px-2.5 py-0.5 min-h-[26px]',
        spinner: 'w-3 h-3 border-[1.5px]',
        icon: 'text-[13px]',
        banner: 'py-2 px-3.5 gap-2.5 text-xs',
        bannerIcon: 'w-5 h-5 text-[14px]',
        bannerTitle: 'text-xs font-semibold leading-none',
        bannerText: 'text-[11px] leading-tight',
        buttonPrimary: 'px-2.5 py-1 text-[11px] rounded-md gap-1.5',
        buttonSecondary: 'px-2.5 py-1 text-[11px] rounded-md',
    },
    md: {
        badge: 'text-xs gap-1.5 px-3 py-1 min-h-[30px]',
        spinner: 'w-3.5 h-3.5 border-[1.75px]',
        icon: 'text-[14px]',
        banner: 'py-2.5 px-4 gap-3 text-xs',
        bannerIcon: 'w-6 h-6 text-[15px]',
        bannerTitle: 'text-xs font-semibold leading-none',
        bannerText: 'text-xs leading-tight',
        buttonPrimary: 'px-3 py-1 text-xs rounded-md gap-1.5',
        buttonSecondary: 'px-2.5 py-1 text-xs rounded-md',
    },
    lg: {
        badge: 'text-xs gap-2 px-3.5 py-1.5 min-h-[34px]',
        spinner: 'w-4 h-4 border-2',
        icon: 'text-[16px]',
        banner: 'py-3 px-4.5 gap-3.5 text-sm',
        bannerIcon: 'w-7 h-7 text-[16px]',
        bannerTitle: 'text-sm font-semibold leading-tight',
        bannerText: 'text-xs leading-normal',
        buttonPrimary: 'px-3.5 py-1.5 text-xs font-medium rounded-md gap-2',
        buttonSecondary: 'px-3 py-1.5 text-xs font-medium rounded-md',
    },
    xl: {
        badge: 'text-sm gap-2.5 px-4 py-2 min-h-[40px]',
        spinner: 'w-4.5 h-4.5 border-2',
        icon: 'text-[18px]',
        banner: 'py-3.5 px-5 gap-4 text-base',
        bannerIcon: 'w-8 h-8 text-[18px]',
        bannerTitle: 'text-base font-semibold leading-tight',
        bannerText: 'text-sm leading-normal',
        buttonPrimary: 'px-4 py-2 text-sm font-medium rounded-md gap-2.5',
        buttonSecondary: 'px-3.5 py-2 text-sm font-medium rounded-md',
    },
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

// Design Scale
const DESIGN_CLASSES = {
    default: 'shadow-2xs',
    minimal: '!border-0 !shadow-none !bg-transparent',
    bordered: 'border-2 border-dashed shadow-none',
    floating: 'shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10',
    modern: 'bg-gradient-to-r shadow-xs',
};

// Palet Kelas Warna Tailwind untuk Badge
const BADGE_COLOR_CLASSES = {
    indigo: {
        soft: 'bg-indigo-50/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-800/60',
        solid: 'bg-indigo-600 text-white border-transparent dark:bg-indigo-700',
        outline: 'bg-white text-indigo-700 border border-indigo-500 dark:bg-transparent dark:text-indigo-300 dark:border-indigo-600',
        pill: 'bg-indigo-50/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-800/60 !rounded-full ring-1 ring-indigo-300 dark:ring-indigo-700',
    },
    primary: {
        soft: 'bg-primary-50/90 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:bg-primary-950/40 dark:border-primary-800/60',
        solid: 'bg-primary-600 text-white border-transparent dark:bg-primary-700',
        outline: 'bg-white text-primary-700 border border-primary-500 dark:bg-transparent dark:text-primary-300 dark:border-primary-600',
        pill: 'bg-primary-50/90 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:bg-primary-950/40 dark:border-primary-800/60 !rounded-full ring-1 ring-primary-300 dark:ring-primary-700',
    },
    emerald: {
        soft: 'bg-emerald-50/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60',
        solid: 'bg-emerald-600 text-white border-transparent dark:bg-emerald-700',
        outline: 'bg-white text-emerald-700 border border-emerald-500 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-600',
        pill: 'bg-emerald-50/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60 !rounded-full ring-1 ring-emerald-300 dark:ring-emerald-700',
    },
    purple: {
        soft: 'bg-purple-50/90 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-800/60',
        solid: 'bg-purple-600 text-white border-transparent dark:bg-purple-700',
        outline: 'bg-white text-purple-700 border border-purple-500 dark:bg-transparent dark:text-purple-300 dark:border-purple-600',
        pill: 'bg-purple-50/90 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-800/60 !rounded-full ring-1 ring-purple-300 dark:ring-purple-700',
    },
    amber: {
        soft: 'bg-amber-50/90 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60',
        solid: 'bg-amber-500 text-white border-transparent dark:bg-amber-600',
        outline: 'bg-white text-amber-700 border border-amber-500 dark:bg-transparent dark:text-amber-300 dark:border-amber-600',
        pill: 'bg-amber-50/90 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60 !rounded-full ring-1 ring-amber-300 dark:ring-amber-700',
    },
    rose: {
        soft: 'bg-rose-50/90 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-800/60',
        solid: 'bg-rose-600 text-white border-transparent dark:bg-rose-700',
        outline: 'bg-white text-rose-700 border border-rose-500 dark:bg-transparent dark:text-rose-300 dark:border-rose-600',
        pill: 'bg-rose-50/90 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-800/60 !rounded-full ring-1 ring-rose-300 dark:ring-rose-700',
    },
    cyan: {
        soft: 'bg-cyan-50/90 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:bg-cyan-950/40 dark:border-cyan-800/60',
        solid: 'bg-cyan-600 text-white border-transparent dark:bg-cyan-700',
        outline: 'bg-white text-cyan-700 border border-cyan-500 dark:bg-transparent dark:text-cyan-300 dark:border-cyan-600',
        pill: 'bg-cyan-50/90 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:bg-cyan-950/40 dark:border-cyan-800/60 !rounded-full ring-1 ring-cyan-300 dark:ring-cyan-700',
    },
    dark: {
        soft: 'bg-slate-100/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700',
        solid: 'bg-slate-700 text-white border-transparent dark:bg-slate-800',
        outline: 'bg-white text-slate-700 border border-slate-300 dark:bg-transparent dark:text-slate-300 dark:border-slate-500',
        pill: 'bg-slate-100/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 !rounded-full ring-1 ring-slate-300 dark:ring-slate-700',
    },
};

const currentSize = computed(() => SIZES[props.size] ?? SIZES.md);
const currentRadius = computed(() => RADIUS_CLASSES[props.radius] ?? RADIUS_CLASSES.full);
const currentDesign = computed(() => DESIGN_CLASSES[props.design] ?? DESIGN_CLASSES.default);

const computedBadgeColorStyle = computed(() => {
    return BADGE_COLOR_CLASSES[resolvedColor.value]?.[resolvedStyle.value] || BADGE_COLOR_CLASSES.emerald.soft;
});
</script>

<template>
    <div :class="resolvedDisplayMode === 'badge' ? 'inline-flex' : 'flex flex-col gap-2.5'">
        <!-- 1. Draft Recovery Alert Banner -->
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="(resolvedDisplayMode === 'both' || resolvedDisplayMode === 'banner') && resolvedHasDraft"
                role="region"
                aria-label="Pemberitahuan pemulihan draf"
                class="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-200"
                :class="[currentSize.banner, currentRadius, currentDesign]"
            >
                <slot
                    name="banner"
                    :has-draft="resolvedHasDraft"
                    :draft-time="resolvedDraftTime"
                    :restore="handleRestore"
                    :discard="handleDiscard"
                >
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div
                            class="rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
                            :class="currentSize.bannerIcon"
                        >
                            <span class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center">history</span>
                        </div>
                        <div class="min-w-0">
                            <div class="text-amber-900 dark:text-amber-100 font-semibold" :class="currentSize.bannerTitle">
                                Draf Belum Tersimpan Ditemukan
                            </div>
                            <div class="truncate sm:whitespace-normal" :class="currentSize.bannerText">
                                Ada data tersimpan dari <strong class="font-medium text-amber-900 dark:text-amber-200">{{ resolvedDraftTime || 'sesi sebelumnya' }}</strong>. Ingin memulihkan data tersebut?
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                        <slot
                            name="actions"
                            :restore="handleRestore"
                            :discard="handleDiscard"
                        >
                            <button
                                type="button"
                                class="flex-1 sm:flex-initial inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-medium shadow-2xs transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 leading-none"
                                :class="[currentSize.buttonPrimary, currentRadius]"
                                @click.prevent.stop="handleRestore"
                            >
                                <span class="material-symbols-outlined text-[14px] select-none leading-none shrink-0 flex items-center justify-center">restore</span>
                                <span class="leading-none inline-flex items-center">{{ restoreText }}</span>
                            </button>
                            <button
                                type="button"
                                class="flex-1 sm:flex-initial inline-flex items-center justify-center border border-amber-300/80 dark:border-amber-700/80 hover:bg-amber-500/15 text-amber-900 dark:text-amber-200 font-medium transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
                                :class="[currentSize.buttonSecondary, currentRadius]"
                                @click.prevent.stop="handleDiscard"
                            >
                                <span class="leading-none inline-flex items-center">{{ discardText }}</span>
                            </button>
                        </slot>
                    </div>
                </slot>
            </div>
        </Transition>

        <!-- 2. Real-Time Status Badge Indicator -->
        <div
            v-if="resolvedDisplayMode === 'both' || resolvedDisplayMode === 'badge'"
            class="inline-flex items-center font-medium transition-all duration-200"
            :role="resolvedStatus === 'error' ? 'alert' : 'status'"
            :aria-live="resolvedStatus === 'error' ? 'assertive' : 'polite'"
        >
            <slot
                name="badge"
                :status="resolvedStatus"
                :last-saved="resolvedLastSaved"
                :retry="handleRetry"
            >
                <!-- A. Saving Status -->
                <div
                    v-if="resolvedStatus === 'saving'"
                    class="inline-flex items-center transition-all duration-150"
                    :class="[currentSize.badge, currentRadius, currentDesign, computedBadgeColorStyle]"
                >
                    <span
                        class="border-current border-t-transparent rounded-full animate-spin shrink-0"
                        :class="currentSize.spinner"
                    />
                    <span>{{ savingText }}</span>
                </div>

                <!-- B. Saved Status -->
                <div
                    v-else-if="resolvedStatus === 'saved'"
                    class="inline-flex items-center transition-all duration-150 leading-none"
                    :class="[currentSize.badge, currentRadius, currentDesign, computedBadgeColorStyle]"
                >
                    <span
                        class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center"
                        :class="currentSize.icon"
                    >
                        check_circle
                    </span>
                    <span class="inline-flex items-center gap-1.5 leading-none">
                        <span class="leading-none inline-flex items-center">{{ savedText }}</span>
                        <span v-if="resolvedLastSaved" class="opacity-80 font-mono text-[10px] leading-none inline-flex items-center">
                            ({{ resolvedLastSaved }})
                        </span>
                    </span>
                </div>

                <!-- C. Error Status -->
                <div
                    v-else-if="resolvedStatus === 'error'"
                    class="inline-flex items-center transition-all duration-150 leading-none"
                    :class="[currentSize.badge, currentRadius, currentDesign, computedBadgeColorStyle]"
                >
                    <span
                        class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center"
                        :class="currentSize.icon"
                    >
                        error
                    </span>
                    <span class="leading-none inline-flex items-center">{{ errorText }}</span>
                    <button
                        type="button"
                        class="ml-1 text-[11px] font-semibold underline underline-offset-2 hover:opacity-100 opacity-90 cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-rose-500 rounded leading-none inline-flex items-center"
                        aria-label="Coba simpan ulang draf"
                        @click.prevent.stop="handleRetry"
                    >
                        {{ retryText }}
                    </button>
                </div>

                <!-- D. Paused Status -->
                <div
                    v-else-if="resolvedStatus === 'paused'"
                    class="inline-flex items-center transition-all duration-150 leading-none"
                    :class="[currentSize.badge, currentRadius, currentDesign, computedBadgeColorStyle]"
                >
                    <span
                        class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center"
                        :class="currentSize.icon"
                    >
                        pause_circle
                    </span>
                    <span class="leading-none inline-flex items-center">{{ pausedText }}</span>
                </div>

                <!-- E. Idle Status -->
                <div
                    v-else
                    class="inline-flex items-center transition-all duration-150 leading-none"
                    :class="[currentSize.badge, currentRadius, currentDesign, computedBadgeColorStyle]"
                >
                    <span
                        class="material-symbols-outlined select-none leading-none shrink-0 flex items-center justify-center"
                        :class="currentSize.icon"
                    >
                        cloud_done
                    </span>
                    <span class="leading-none inline-flex items-center">{{ idleText }}</span>
                </div>
            </slot>
        </div>
    </div>
</template>
