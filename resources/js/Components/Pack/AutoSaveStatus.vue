<script setup>
import { computed } from 'vue';

const props = defineProps({
    /**
     * Pass the whole object returned from useAutoSave() for instant binding.
     */
    autoSave: {
        type: Object,
        default: null,
    },
    /**
     * Explicit status if not passing autoSave object.
     * Values: 'idle' | 'saving' | 'saved' | 'error' | 'paused'
     */
    status: {
        type: String,
        default: 'idle',
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
    /**
     * Display variant:
     * - 'both': Shows both the banner (if draft exists) and the status badge.
     * - 'badge': Shows only the status badge.
     * - 'banner': Shows only the draft recovery banner.
     */
    variant: {
        type: String,
        default: 'both', // 'both' | 'badge' | 'banner'
    },
    showBanner: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['restore', 'discard', 'retry']);

// Resolve properties from autoSave object or fallback props
const resolvedStatus = computed(() => {
    return props.autoSave?.status?.value ?? props.autoSave?.status ?? props.status;
});

const resolvedHasDraft = computed(() => {
    if (!props.showBanner) return false;
    return props.autoSave?.hasDraft?.value ?? props.autoSave?.hasDraft ?? props.hasDraft;
});

const resolvedDraftTime = computed(() => {
    return props.autoSave?.draftTimeFormatted?.value ?? props.autoSave?.draftTimeFormatted ?? props.draftTime;
});

const resolvedLastSaved = computed(() => {
    return props.autoSave?.lastSavedFormatted?.value ?? props.autoSave?.lastSavedFormatted ?? props.lastSaved;
});

const handleRestore = () => {
    if (props.autoSave && typeof props.autoSave.restoreDraft === 'function') {
        props.autoSave.restoreDraft();
    }
    emit('restore');
};

const handleDiscard = () => {
    if (props.autoSave && typeof props.autoSave.discardDraft === 'function') {
        props.autoSave.discardDraft();
    }
    emit('discard');
};

const handleRetry = () => {
    if (props.autoSave && typeof props.autoSave.saveNow === 'function') {
        props.autoSave.saveNow();
    }
    emit('retry');
};
</script>

<template>
    <div class="space-y-3">
        <!-- 1. Draft Recovery Alert Banner -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div
                v-if="(variant === 'both' || variant === 'banner') && resolvedHasDraft"
                class="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <span class="material-symbols-outlined text-[18px]">history</span>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-amber-900 dark:text-amber-200 leading-snug">
                            Draf Belum Tersimpan Ditemukan
                        </h4>
                        <p class="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                            Ada data tersimpan dari <strong class="font-semibold">{{ resolvedDraftTime || 'sesi sebelumnya' }}</strong>. Ingin memulihkan data tersebut?
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                    <button
                        type="button"
                        class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        @click="handleRestore"
                    >
                        <span class="material-symbols-outlined text-[15px]">restore</span>
                        <span>Pulihkan Draf</span>
                    </button>
                    <button
                        type="button"
                        class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                        @click="handleDiscard"
                    >
                        <span>Abaikan</span>
                    </button>
                </div>
            </div>
        </Transition>

        <!-- 2. Real-Time Status Badge Indicator -->
        <div
            v-if="variant === 'both' || variant === 'badge'"
            class="inline-flex items-center gap-1.5 text-xs font-medium"
        >
            <!-- A. Saving Status -->
            <div
                v-if="resolvedStatus === 'saving'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
                <span class="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Menyimpan draf...</span>
            </div>

            <!-- B. Saved Status -->
            <div
                v-else-if="resolvedStatus === 'saved'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
            >
                <span class="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">check_circle</span>
                <span>Tersimpan otomatis <span v-if="resolvedLastSaved" class="text-emerald-600 dark:text-emerald-500 font-mono text-[11px]">({{ resolvedLastSaved }})</span></span>
            </div>

            <!-- C. Error Status -->
            <div
                v-else-if="resolvedStatus === 'error'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
            >
                <span class="material-symbols-outlined text-[15px] text-rose-600 dark:text-rose-400">error</span>
                <span>Gagal menyimpan</span>
                <button
                    type="button"
                    class="ml-1 text-[11px] underline font-bold hover:text-rose-900 dark:hover:text-rose-200 cursor-pointer"
                    @click="handleRetry"
                >
                    Coba Lagi
                </button>
            </div>

            <!-- D. Paused Status -->
            <div
                v-else-if="resolvedStatus === 'paused'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
                <span class="material-symbols-outlined text-[15px]">pause_circle</span>
                <span>Auto-save dijeda</span>
            </div>

            <!-- E. Idle Status -->
            <div
                v-else
                class="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500"
            >
                <span class="material-symbols-outlined text-[15px]">cloud_done</span>
                <span>Semua perubahan tersimpan</span>
            </div>
        </div>
    </div>
</template>
