import { ref, computed, watch, onMounted, onUnmounted, unref } from 'vue';
import { useConfirm } from './useConfirm';
import { router } from '@inertiajs/vue3';

/**
 * Enterprise Unsaved Changes Guard Composable
 *
 * Mencegah pengguna meninggalkan halaman secara tidak sengaja saat formulir
 * masih dalam kondisi kotor (isDirty), baik lewat penutupan tab/browser (beforeunload)
 * maupun navigasi SPA Inertia.js (router.on('before')).
 *
 * @param {import('vue').Ref<boolean>|Function|Object} isDirtyTarget - Ref boolean, getter function, atau reactive form object
 * @param {Object} [options={}]
 * @param {string} [options.title='Perubahan Belum Disimpan']
 * @param {string} [options.message='Ada perubahan pada formulir yang belum disimpan. Yakin ingin meninggalkan halaman ini?']
 * @param {string} [options.confirmText='Tinggalkan Halaman']
 * @param {string} [options.cancelText='Tetap di Sini']
 * @param {'warning'|'danger'|'primary'} [options.variant='warning']
 * @param {boolean} [options.useConfirmDialog=true] - Gunakan ConfirmDialog elegan untuk navigasi Inertia
 * @param {boolean|import('vue').Ref<boolean>} [options.enabled=true]
 * @param {Function} [options.onLeave]
 * @param {Function} [options.onStay]
 */
export function useUnsavedChanges(isDirtyTarget, options = {}) {
    const {
        title = 'Perubahan Belum Disimpan',
        message = 'Ada perubahan pada formulir yang belum disimpan. Yakin ingin meninggalkan halaman ini?',
        confirmText = 'Tinggalkan Halaman',
        cancelText = 'Tetap di Sini',
        variant = 'warning',
        useConfirmDialog = true,
        enabled = true,
        onLeave = null,
        onStay = null,
    } = options;

    const confirmModal = useConfirm();
    const isEnabled = ref(unref(enabled));
    const isBypassing = ref(false);

    /**
     * Evaluasi apakah target saat ini dalam kondisi kotor (isDirty)
     */
    const evaluateIsDirty = () => {
        if (!isEnabled.value) return false;

        const target = unref(isDirtyTarget);

        // 1. Boolean ref atau boolean murni
        if (typeof target === 'boolean') {
            return target;
        }

        // 2. Getter function () => boolean
        if (typeof isDirtyTarget === 'function') {
            return Boolean(isDirtyTarget());
        }

        // 3. Inertia useForm object yang memiliki property isDirty
        if (target && typeof target.isDirty !== 'undefined') {
            return Boolean(target.isDirty);
        }

        // 4. Object dengan property isDirty (seperti useAutoSave)
        if (target && target.isDirty && typeof target.isDirty.value !== 'undefined') {
            return Boolean(target.isDirty.value);
        }

        return Boolean(target);
    };

    /** Computed status apakah penjaga saat ini aktif melindungi navigasi */
    const isGuarded = computed(() => {
        return isEnabled.value && evaluateIsDirty();
    });

    /**
     * Handler untuk event bawaan browser (Tutup tab, refresh browser, ganti URL manual)
     */
    const handleBeforeUnload = (e) => {
        if (!isGuarded.value || isBypassing.value) return;

        // Standar HTML5
        e.preventDefault();
        // Chrome & Firefox memerlukan pengisian returnValue
        e.returnValue = message;
        return message;
    };

    let removeInertiaListener = null;

    /**
     * Daftarkan pencegat navigasi SPA Inertia.js
     */
    const setupInertiaInterceptor = () => {
        if (typeof window === 'undefined') return;

        // Pastikan router Inertia tersedia
        if (router && typeof router.on === 'function') {
            removeInertiaListener = router.on('before', (event) => {
                // Jika tidak sedang guarded atau sedang di-bypass, izinkan navigasi
                if (!isGuarded.value || isBypassing.value) {
                    return;
                }

                // Cegat dan batalkan navigasi secara instan
                event.preventDefault();

                // Dapatkan detail target navigasi
                const visitDetail = event?.detail?.visit || {};

                if (useConfirmDialog) {
                    confirmModal
                        .confirm({
                            title,
                            message,
                            confirmText,
                            cancelText,
                            variant,
                            icon: 'warning',
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                isBypassing.value = true;
                                if (typeof onLeave === 'function') {
                                    onLeave();
                                }

                                // Jalankan ulang kunjungan rute setelah konfirmasi
                                if (visitDetail.url) {
                                    router.visit(visitDetail.url, {
                                        ...visitDetail,
                                        onFinish: () => {
                                            isBypassing.value = false;
                                        },
                                    });
                                }
                            } else {
                                if (typeof onStay === 'function') {
                                    onStay();
                                }
                            }
                        });
                } else {
                    // Fallback ke window.confirm browser biasa
                    const confirmed = window.confirm(message);
                    if (confirmed) {
                        isBypassing.value = true;
                        if (typeof onLeave === 'function') {
                            onLeave();
                        }
                        if (visitDetail.url) {
                            router.visit(visitDetail.url, visitDetail);
                        }
                    } else {
                        if (typeof onStay === 'function') {
                            onStay();
                        }
                    }
                }
            });
        }
    };

    /**
     * Bypass guard sementara (misal saat form utama sedang disubmit secara sah)
     */
    const bypass = () => {
        isBypassing.value = true;
    };

    /**
     * Aktifkan atau nonaktifkan guard
     */
    const enable = () => {
        isEnabled.value = true;
    };

    const disable = () => {
        isEnabled.value = false;
    };

    onMounted(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', handleBeforeUnload);
            setupInertiaInterceptor();
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
        if (typeof removeInertiaListener === 'function') {
            removeInertiaListener();
        }
    });

    return {
        isGuarded,
        isEnabled,
        isBypassing,
        bypass,
        enable,
        disable,
        evaluateIsDirty,
    };
}
