import { reactive } from 'vue';

/**
 * State global tunggal untuk mengendalikan dialog konfirmasi
 */
const defaultState = {
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
    onConfirm: null,
};

const state = reactive({ ...defaultState });

/**
 * useConfirm
 * Composable dialog konfirmasi berbasis Promise (asynchronous).
 * Menyediakan pemanggilan dialog konfirmasi semudah fungsi window.confirm(),
 * namun dengan tampilan modal modern yang terintegrasi, responsif, dan konsisten.
 *
 * @returns {Object}
 */
export function useConfirm() {
    /**
     * Membuka dialog konfirmasi dan mengembalikan Promise bernilai boolean
     * @param {Object|string} options - Opsi konfigurasi dialog atau string pesan ringkas
     * @returns {Promise<boolean>}
     */
    const confirm = (options = {}) => {
        if (typeof options === 'string') {
            options = { message: options };
        }

        return new Promise((resolve) => {
            // Jika dialog sebelumnya masih terbuka, batalkan secara bersih terlebih dahulu
            if (typeof state.resolver === 'function') {
                state.resolver(false);
            }

            state.title = options.title ?? 'Konfirmasi Tindakan';
            state.message = options.message ?? 'Apakah Anda yakin ingin melanjutkan tindakan ini?';
            state.context = options.context ?? '';
            state.variant = options.variant ?? 'danger';
            state.confirmText = options.confirmText ?? 'Ya, Lanjutkan';
            state.cancelText = options.cancelText ?? 'Batal';
            state.icon = options.icon ?? '';
            state.closable = options.closable !== undefined ? Boolean(options.closable) : true;
            state.loading = false;
            state.onConfirm = typeof options.onConfirm === 'function' ? options.onConfirm : null;
            state.resolver = resolve;
            state.isOpen = true;
        });
    };

    /**
     * Helper cepat varian Danger (misal: penghapusan data permanen)
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    confirm.danger = (options = {}) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        return confirm({ variant: 'danger', confirmText: 'Ya, Hapus', ...opts });
    };

    /**
     * Helper cepat varian Warning (misal: pengabaian perubahan atau publikasi)
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    confirm.warning = (options = {}) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        return confirm({ variant: 'warning', confirmText: 'Ya, Lanjutkan', ...opts });
    };

    /**
     * Helper cepat varian Info (misal: verifikasi status informasi)
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    confirm.info = (options = {}) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        return confirm({ variant: 'info', confirmText: 'Mengerti', ...opts });
    };

    /**
     * Helper cepat varian Success (misal: konfirmasi finalisasi transaksi)
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    confirm.success = (options = {}) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        return confirm({ variant: 'success', confirmText: 'Ya, Selesaikan', ...opts });
    };

    /**
     * Helper cepat varian Primary (misal: konfirmasi alur bisnis standar)
     * @param {Object|string} options
     * @returns {Promise<boolean>}
     */
    confirm.primary = (options = {}) => {
        const opts = typeof options === 'string' ? { message: options } : options;
        return confirm({ variant: 'primary', confirmText: 'Konfirmasi', ...opts });
    };

    /**
     * Tindakan saat pengguna menekan tombol Konfirmasi (Ya)
     */
    const handleConfirm = async () => {
        if (state.loading) return;

        if (typeof state.onConfirm === 'function') {
            state.loading = true;
            try {
                const result = await state.onConfirm();
                if (typeof state.resolver === 'function') {
                    state.resolver(result !== false);
                    state.resolver = null;
                }
                state.isOpen = false;
                state.loading = false;
            } catch (error) {
                state.loading = false;
                // Tetap biarkan dialog terbuka jika onConfirm melempar exception agar user dapat mengulang
                throw error;
            }
            return;
        }

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
     * Menutup dialog secara paksa dan membatalkan promise dengan nilai false
     */
    const close = () => {
        handleCancel();
    };

    /**
     * Mengembalikan seluruh state dialog ke nilai default pabrikan
     */
    const reset = () => {
        if (typeof state.resolver === 'function') {
            state.resolver(false);
        }
        Object.assign(state, defaultState);
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
        reset,
    };
}
