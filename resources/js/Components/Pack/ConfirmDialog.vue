<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useConfirm } from '@/Composables/Pack/useConfirm';

const { state, handleConfirm, handleCancel } = useConfirm();

// Mapping Skema Warna Varian Dialog
const variantConfig = computed(() => {
    switch (state.variant) {
        case 'warning':
            return {
                icon: state.icon || 'warning',
                iconColor: 'text-amber-600 dark:text-amber-400',
                iconBg: 'bg-amber-100 dark:bg-amber-950/60',
                btnColor: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
                badgeText: 'Peringatan',
                badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
            };
        case 'info':
            return {
                icon: state.icon || 'info',
                iconColor: 'text-sky-600 dark:text-sky-400',
                iconBg: 'bg-sky-100 dark:bg-sky-950/60',
                btnColor: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
                badgeText: 'Informasi',
                badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
            };
        case 'success':
            return {
                icon: state.icon || 'check_circle',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
                btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
                badgeText: 'Konfirmasi Sukses',
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
            };
        case 'primary':
            return {
                icon: state.icon || 'help',
                iconColor: 'text-blue-600 dark:text-blue-400',
                iconBg: 'bg-blue-100 dark:bg-blue-950/60',
                btnColor: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
                badgeText: 'Konfirmasi',
                badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
            };
        case 'danger':
        default:
            return {
                icon: state.icon || 'error',
                iconColor: 'text-rose-600 dark:text-rose-400',
                iconBg: 'bg-rose-100 dark:bg-rose-950/60',
                btnColor: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
                badgeText: 'Tindakan Berbahaya',
                badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
            };
    }
});

// Penanganan Keyboard Accessibility (Escape untuk Batal)
const onKeydown = (event) => {
    if (!state.isOpen) return;

    if (event.key === 'Escape' && state.closable && !state.loading) {
        event.preventDefault();
        handleCancel();
    }
};

// Scroll Lock saat dialog terbuka
watch(
    () => state.isOpen,
    (open) => {
        if (typeof document !== 'undefined') {
            if (open) {
                document.body.classList.add('overflow-hidden');
            } else {
                document.body.classList.remove('overflow-hidden');
            }
        }
    }
);

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', onKeydown);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeydown);
        document.body.classList.remove('overflow-hidden');
    }
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="state.isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                role="dialog"
                aria-modal="true"
                :aria-label="state.title"
            >
                <!-- Backdrop Blur -->
                <div
                    class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
                    @click="state.closable && !state.loading ? handleCancel() : null"
                ></div>

                <!-- Modal Panel Card -->
                <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-2"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-2"
                >
                    <div
                        v-if="state.isOpen"
                        class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl transition-all space-y-5"
                    >
                        <!-- Top Header & Icon -->
                        <div class="flex items-start gap-3.5">
                            <div
                                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                :class="variantConfig.iconBg"
                            >
                                <span
                                    class="material-symbols-outlined text-2xl select-none"
                                    :class="variantConfig.iconColor"
                                >
                                    {{ variantConfig.icon }}
                                </span>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                        :class="variantConfig.badgeClass"
                                    >
                                        {{ state.context || variantConfig.badgeText }}
                                    </span>
                                </div>
                                <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                    {{ state.title }}
                                </h3>
                            </div>

                            <!-- Tombol X jika closable -->
                            <button
                                v-if="state.closable && !state.loading"
                                type="button"
                                @click="handleCancel"
                                aria-label="Tutup dialog"
                                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-xl leading-none">close</span>
                            </button>
                        </div>

                        <!-- Message Body -->
                        <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-0.5">
                            <p class="whitespace-pre-line">{{ state.message }}</p>
                        </div>

                        <!-- Footer Actions -->
                        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                :disabled="state.loading"
                                @click="handleCancel"
                                class="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {{ state.cancelText }}
                            </button>

                            <button
                                type="button"
                                :disabled="state.loading"
                                @click="handleConfirm"
                                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                :class="variantConfig.btnColor"
                            >
                                <span
                                    v-if="state.loading"
                                    class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"
                                ></span>
                                <span>{{ state.confirmText }}</span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
