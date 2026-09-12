<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

// Module-level state for nested modal scroll management
let activeModalsCount = 0;
let modalIdCounter = 0;

const lockScroll = () => {
    if (typeof document === 'undefined') return;
    activeModalsCount++;
    if (activeModalsCount === 1) {
        document.body.style.overflow = 'hidden';
    }
};

const unlockScroll = () => {
    if (typeof document === 'undefined') return;
    activeModalsCount = Math.max(0, activeModalsCount - 1);
    if (activeModalsCount === 0) {
        document.body.style.overflow = '';
    }
};

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    show: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    context: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    maxWidth: {
        type: String,
        default: 'md', // xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
    },
    position: {
        type: String,
        default: 'center', // center, top, bottom, left, right
    },
    persistent: {
        type: Boolean,
        default: false,
    },
    variant: {
        type: String,
        default: 'default', // 'default', 'danger', 'warning', 'success', 'info', 'confirm'
    },
    confirmText: {
        type: String,
        default: '',
    },
    cancelText: {
        type: String,
        default: 'Batal',
    },
    showConfirm: {
        type: Boolean,
        default: true,
    },
    showCancel: {
        type: Boolean,
        default: true,
    },
    showClose: {
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    bodyClass: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue', 'update:show', 'close', 'confirm']);

const instanceId = ++modalIdCounter;
const titleId = computed(() => props.title ? `modal-title-${instanceId}` : undefined);

const modalRef = ref(null);
let previousActiveElement = null;
let wasLocked = false;

const isOpen = computed(() => props.modelValue || props.show);

const displayConfirmText = computed(() => {
    if (props.confirmText) return props.confirmText;
    switch (props.variant) {
        case 'danger': return 'Hapus';
        case 'warning': return 'Lanjutkan';
        case 'confirm': return 'Ya, Lanjutkan';
        default: return 'Simpan';
    }
});

const close = () => {
    if (props.loading) return;
    emit('update:modelValue', false);
    emit('update:show', false);
    emit('close');
};

const handleConfirm = () => {
    if (props.loading) return;
    emit('confirm');
};

const handleBackdropClick = () => {
    if (!props.persistent && !props.loading) {
        close();
    }
};

const getFocusableElements = () => {
    if (!modalRef.value) return [];
    return Array.from(
        modalRef.value.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
    ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
};

const trapFocus = (e) => {
    if (e.key !== 'Tab' || !isOpen.value) return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
        e.preventDefault();
        return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === modalRef.value) {
            e.preventDefault();
            lastElement.focus();
        }
    } else {
        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
};

const handleKeydown = (e) => {
    if (!isOpen.value) return;

    if (e.key === 'Escape') {
        if (!props.persistent && !props.loading) {
            close();
        }
        return;
    }

    if (e.key === 'Tab') {
        trapFocus(e);
    }
};

const applyScrollLock = (shouldLock) => {
    if (shouldLock && !wasLocked) {
        lockScroll();
        wasLocked = true;
    } else if (!shouldLock && wasLocked) {
        unlockScroll();
        wasLocked = false;
    }
};

watch(isOpen, async (value) => {
    applyScrollLock(value);

    if (typeof document === 'undefined') return;

    if (value) {
        previousActiveElement = document.activeElement;
        await nextTick();
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
            focusable[0].focus();
        } else if (modalRef.value) {
            modalRef.value.focus();
        }
    } else {
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }
    }
}, { immediate: true });

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeydown);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
    }
    applyScrollLock(false);
});

const maxWidthClass = computed(() => {
    switch (props.maxWidth) {
        case 'xs': return 'sm:max-w-xs';
        case 'sm': return 'sm:max-w-sm';
        case 'md': return 'sm:max-w-md';
        case 'lg': return 'sm:max-w-lg';
        case 'xl': return 'sm:max-w-xl';
        case '2xl': return 'sm:max-w-2xl';
        case '3xl': return 'sm:max-w-3xl';
        case '4xl': return 'sm:max-w-4xl';
        case '5xl': return 'sm:max-w-5xl';
        case 'full':
            return props.position === 'left' || props.position === 'right' ? 'w-full' : 'sm:max-w-full m-4';
        default: return 'sm:max-w-md';
    }
});

const positionContainerClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'items-start justify-center p-4 sm:p-6 pt-6 sm:pt-12';
        case 'bottom':
            return 'items-end justify-center p-0 sm:p-6';
        case 'left':
            return 'items-stretch justify-start p-0';
        case 'right':
            return 'items-stretch justify-end p-0';
        case 'center':
        default:
            return 'items-center justify-center p-4 sm:p-6';
    }
});

const positionCardClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'max-h-[calc(100dvh-3rem)] rounded-2xl sm:rounded-3xl my-0';
        case 'bottom':
            return 'max-h-[90dvh] sm:max-h-[calc(100dvh-3rem)] rounded-t-3xl sm:rounded-3xl my-0';
        case 'left':
            return 'h-full max-h-full rounded-r-2xl sm:rounded-r-3xl rounded-l-none my-0';
        case 'right':
            return 'h-full max-h-full rounded-l-2xl sm:rounded-l-3xl rounded-r-none my-0';
        case 'center':
        default:
            return 'max-h-[calc(100dvh-3rem)] rounded-2xl sm:rounded-3xl my-auto';
    }
});

const transitionEnterFrom = computed(() => {
    switch (props.position) {
        case 'right':
            return 'opacity-0 [&_.modal-card]:translate-x-full';
        case 'left':
            return 'opacity-0 [&_.modal-card]:-translate-x-full';
        case 'bottom':
            return 'opacity-0 [&_.modal-card]:translate-y-full';
        case 'top':
            return 'opacity-0 [&_.modal-card]:-translate-y-8';
        case 'center':
        default:
            return 'opacity-0 [&_.modal-card]:scale-95 [&_.modal-card]:translate-y-2';
    }
});

const transitionEnterTo = computed(() => {
    switch (props.position) {
        case 'right':
        case 'left':
        case 'bottom':
            return 'opacity-100 [&_.modal-card]:translate-x-0 [&_.modal-card]:translate-y-0';
        case 'top':
            return 'opacity-100 [&_.modal-card]:translate-y-0';
        case 'center':
        default:
            return 'opacity-100 [&_.modal-card]:scale-100 [&_.modal-card]:translate-y-0';
    }
});

const transitionLeaveFrom = computed(() => transitionEnterTo.value);
const transitionLeaveTo = computed(() => transitionEnterFrom.value);

const defaultIcon = computed(() => {
    if (props.icon) return props.icon;
    switch (props.variant) {
        case 'danger': return 'delete_forever';
        case 'warning': return 'warning';
        case 'success': return 'check_circle';
        case 'info': return 'info';
        case 'confirm': return 'help';
        default: return '';
    }
});

const accentBarClasses = computed(() => {
    switch (props.variant) {
        case 'danger': return 'bg-rose-500';
        case 'warning': return 'bg-amber-500';
        case 'success': return 'bg-emerald-500';
        case 'info': return 'bg-blue-500';
        case 'confirm': return 'bg-indigo-500';
        default: return '';
    }
});

const iconBadgeClasses = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'bg-rose-50 border border-rose-200/80 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-400';
        case 'warning':
            return 'bg-amber-50 border border-amber-200/80 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-400';
        case 'success':
            return 'bg-emerald-50 border border-emerald-200/80 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-400';
        case 'info':
            return 'bg-blue-50 border border-blue-200/80 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-400';
        case 'confirm':
            return 'bg-indigo-50 border border-indigo-200/80 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-400';
        default:
            return 'bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
    }
});

const confirmButtonClasses = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500';
        case 'warning':
            return 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs focus:ring-amber-500';
        case 'success':
            return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500';
        case 'info':
            return 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500';
        case 'default':
        case 'confirm':
        default:
            return 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500';
    }
});

defineExpose({
    close,
    isOpen,
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            :enter-from-class="transitionEnterFrom"
            :enter-to-class="transitionEnterTo"
            leave-active-class="transition-opacity duration-150 ease-in [&_.modal-card]:duration-150 [&_.modal-card]:ease-in"
            :leave-from-class="transitionLeaveFrom"
            :leave-to-class="transitionLeaveTo"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-50 flex overflow-y-auto"
                :class="positionContainerClasses"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <!-- Backdrop Overlay -->
                <div
                    class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    aria-hidden="true"
                    @click="handleBackdropClick"
                ></div>

                <!-- Modal Card Container -->
                <div
                    ref="modalRef"
                    tabindex="-1"
                    :class="[
                        'modal-card relative w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl z-10 overflow-hidden flex flex-col transition-all duration-200 ease-out outline-none',
                        maxWidthClass,
                        positionCardClasses
                    ]"
                >
                    <!-- Variant Accent Bar -->
                    <div
                        v-if="variant !== 'default' && accentBarClasses"
                        class="h-1 w-full shrink-0"
                        :class="accentBarClasses"
                    />

                    <!-- Modal Header -->
                    <div class="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 gap-3 shrink-0">
                        <slot name="header">
                            <div class="flex items-center gap-3.5 min-w-0">
                                <!-- Status Icon Badge -->
                                <div
                                    v-if="defaultIcon"
                                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                                    :class="iconBadgeClasses"
                                >
                                    <span class="material-symbols-outlined text-2xl leading-none select-none">
                                        {{ defaultIcon }}
                                    </span>
                                </div>

                                <!-- Title & Context -->
                                <div class="min-w-0">
                                    <span
                                        v-if="context"
                                        class="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 select-none"
                                    >
                                        {{ context }}
                                    </span>
                                    <h3
                                        :id="titleId"
                                        class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate"
                                    >
                                        {{ title }}
                                    </h3>
                                </div>
                            </div>
                        </slot>

                        <!-- Close (X) Button -->
                        <button
                            v-if="showClose && !loading"
                            type="button"
                            @click="close"
                            class="inline-flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                            aria-label="Tutup modal"
                            title="Tutup"
                        >
                            <span class="material-symbols-outlined text-xl leading-none select-none">close</span>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div
                        :class="[
                            'p-5 sm:p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed overflow-y-auto flex-1 min-h-0',
                            bodyClass
                        ]"
                    >
                        <slot />
                    </div>

                    <!-- Modal Footer -->
                    <div
                        v-if="showFooter"
                        class="px-5 py-4 sm:px-6 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0"
                    >
                        <slot name="footer">
                            <button
                                v-if="showCancel"
                                type="button"
                                @click="close"
                                :disabled="loading"
                                class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {{ cancelText }}
                            </button>

                            <button
                                v-if="showConfirm && (variant !== 'default' || confirmText || displayConfirmText)"
                                type="button"
                                @click="handleConfirm"
                                :disabled="loading"
                                :class="[
                                    'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                                    confirmButtonClasses
                                ]"
                            >
                                <span
                                    v-if="loading"
                                    class="material-symbols-outlined text-sm leading-none animate-spin"
                                >
                                    progress_activity
                                </span>
                                <span>{{ displayConfirmText }}</span>
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
