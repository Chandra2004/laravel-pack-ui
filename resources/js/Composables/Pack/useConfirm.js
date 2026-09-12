import { reactive } from 'vue';

/**
 * State global tunggal untuk mengendalikan dialog konfirmasi
 */
const state = reactive({
    isOpen: false,
    title: 'Konfirmasi Tindakan',
    message: 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    context: '',
    variant: 'danger', // 'danger' | 'warning' | 'info' | 'primary' | 'success'
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    icon: '',
    loading: false,
    closable: true,
    resolver: null,
});

/**
 * useConfirm
 * Composable dialog konfirmasi berbasis Promise (asynchronous).
 * Memungkinkan pemanggilan dialog konfirmasi semudah fungsi confirm() bawaan,
 * namun dengan tampilan modal modern yang responsif dan konsisten.
 */
export function useConfirm() {
    /**
     * Membuka dialog konfirmasi dan mengembalikan Promise bernilai boolean
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    const confirm = (options = {}) => {
        if (typeof options === 'string') {
            options = { message: options };
        }

        return new Promise((resolve) => {
            // Jika dialog sebelumnya masih terbuka, selesaikan dengan false terlebih dahulu
            if (state.resolver) {
                state.resolver(false);
            }

            state.title = options.title || 'Konfirmasi Tindakan';
            state.message = options.message || 'Apakah Anda yakin ingin melanjutkan tindakan ini?';
            state.context = options.context || '';
            state.variant = options.variant || 'danger';
            state.confirmText = options.confirmText || 'Ya, Lanjutkan';
            state.cancelText = options.cancelText || 'Batal';
            state.icon = options.icon || '';
            state.closable = options.closable !== undefined ? Boolean(options.closable) : true;
            state.loading = false;
            state.resolver = resolve;
            state.isOpen = true;
        });
    };

    /**
     * Tindakan saat pengguna menekan tombol Konfirmasi (Ya)
     */
    const handleConfirm = () => {
        if (state.loading) return;

        if (typeof state.resolver === 'function') {
            state.resolver(true);
            state.resolver = null;
        }
        state.isOpen = false;
    };

    /**
     * Tindakan saat pengguna menekan tombol Batal atau menutup dialog
     */
    const handleCancel = () => {
        if (state.loading && !state.closable) return;

        if (typeof state.resolver === 'function') {
            state.resolver(false);
            state.resolver = null;
        }
        state.isOpen = false;
        state.loading = false;
    };

    /**
     * Mengatur status loading tombol konfirmasi
     * @param {boolean} val
     */
    const setLoading = (val) => {
        state.loading = Boolean(val);
    };

    /**
     * Tutup dialog secara paksa
     */
    const close = () => {
        handleCancel();
    };

    return {
        // State Dialog (Digunakan oleh komponen ConfirmDialog.vue)
        state,

        // Pemicu Utama
        confirm,

        // Handlers & Controls
        handleConfirm,
        handleCancel,
        setLoading,
        close,
    };
}
