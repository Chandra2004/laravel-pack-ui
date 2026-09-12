import { ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

const notifications = ref([]);
const defaultPosition = ref('top-right');
const defaultDuration = ref(4000);
let nextId = 1;
let unwatchFlash = null;
let lastFlashSignature = '';

export function useNotification() {
    /**
     * Mengatur durasi default global untuk seluruh notifikasi baru
     * @param {number} ms
     */
    const setDefaultDuration = (ms) => {
        if (typeof ms === 'number' && ms >= 0) {
            defaultDuration.value = ms;
        }
    };

    /**
     * Update notifikasi yang sudah ada berdasarkan ID
     */
    const update = (id, options = {}) => {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index === -1) return null;

        const current = notifications.value[index];
        const duration = options.duration !== undefined ? Number(options.duration) : current.duration;

        notifications.value[index] = {
            ...current,
            ...options,
            duration,
            remaining: duration,
            progress: 100,
            paused: false,
        };

        return notifications.value[index];
    };

    /**
     * Tambah notifikasi baru
     * Mendukung multiple notification secara penuh (dedupe opsional, default false)
     * @param {Object|string} options
     */
    const add = (options) => {
        if (typeof options === 'string') {
            options = { message: options };
        }

        const message = options.message || '';
        const type = options.type || 'info';
        const position = options.position || defaultPosition.value;
        const dedupe = options.dedupe === true; // Default false agar multiple notification berfungsi normal

        // Deduplikasi hanya aktif jika user secara eksplisit menyetel dedupe: true
        if (dedupe) {
            const existing = notifications.value.find(
                (n) => n.message === message && n.type === type && (n.position || defaultPosition.value) === position
            );
            if (existing) {
                existing.duration = options.duration !== undefined ? Number(options.duration) : existing.duration;
                existing.remaining = existing.duration;
                existing.progress = 100;
                existing.paused = false;
                return existing.id;
            }
        }

        const id = options.id || `toast-${Date.now()}-${nextId++}`;
        // Prioritas durasi: options.duration -> defaultDuration (bisa custom 5000ms dll)
        const duration = options.duration !== undefined ? Number(options.duration) : defaultDuration.value;

        const item = {
            id,
            type,
            variant: options.variant || 'default', // 'default', 'soft', 'solid', 'outline'
            title: options.title || '',
            message,
            duration,
            remaining: duration,
            progress: 100,
            paused: false,
            position,
            icon: options.icon || null,
            isSpinning: !!options.isSpinning,
            customStyle: options.customStyle || null,
            action: options.action || null, // { label, icon, autoDismiss, onClick }
            dismissible: options.dismissible !== undefined ? options.dismissible : true,
            created: Date.now(),
        };

        notifications.value.push(item);
        return id;
    };

    const remove = (id) => {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    };

    const clear = (position = null) => {
        if (position) {
            notifications.value = notifications.value.filter(
                (item) => (item.position || defaultPosition.value) !== position
            );
        } else {
            notifications.value = [];
        }
    };

    const success = (message, options = {}) => add({ ...options, type: 'success', message });
    const error = (message, options = {}) => add({ ...options, type: 'error', message });
    const warning = (message, options = {}) => add({ ...options, type: 'warning', message });
    const info = (message, options = {}) => add({ ...options, type: 'info', message });
    const neutral = (message, options = {}) => add({ ...options, type: 'neutral', message });

    /**
     * Menangani async promise dengan transisi state otomatis:
     * loading -> success / error
     */
    const promise = async (promiseOrFn, messages = {}, options = {}) => {
        const loadingMsg = messages.loading || 'Sedang memproses...';
        const successMsg = messages.success || 'Berhasil diselesaikan!';
        const errorMsg = messages.error || 'Terjadi kesalahan saat memproses.';

        const toastId = add({
            ...options,
            type: 'info',
            message: loadingMsg,
            duration: 0,
            dismissible: false,
            icon: 'progress_activity',
            isSpinning: true,
        });

        try {
            const promiseInstance = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
            const result = await promiseInstance;

            const finalSuccessMsg = typeof successMsg === 'function' ? successMsg(result) : successMsg;
            update(toastId, {
                type: 'success',
                message: finalSuccessMsg,
                duration: options.successDuration !== undefined ? Number(options.successDuration) : defaultDuration.value,
                dismissible: true,
                icon: null,
                isSpinning: false,
            });

            return result;
        } catch (err) {
            const finalErrorMsg = typeof errorMsg === 'function' ? errorMsg(err) : errorMsg;
            update(toastId, {
                type: 'error',
                message: finalErrorMsg,
                duration: options.errorDuration !== undefined ? Number(options.errorDuration) : 5000,
                dismissible: true,
                icon: null,
                isSpinning: false,
            });

            throw err;
        }
    };

    /**
     * Inisialisasi watcher flash message Inertia
     */
    const initFlashWatcher = (customPage = null) => {
        if (unwatchFlash) {
            unwatchFlash();
            unwatchFlash = null;
        }

        try {
            const page = customPage || usePage();
            if (!page || !page.props) return;

            unwatchFlash = watch(
                () => page.props.flash,
                (flash) => {
                    if (!flash || typeof flash !== 'object') return;

                    const signature = JSON.stringify(flash);
                    if (signature === lastFlashSignature) return;
                    lastFlashSignature = signature;

                    if (flash.success) success(flash.success);
                    if (flash.error) error(flash.error);
                    if (flash.warning) warning(flash.warning);
                    if (flash.info) info(flash.info);
                    if (flash.message) info(flash.message);
                },
                { deep: true, immediate: true }
            );
        } catch (e) {
            // Context berada di luar Inertia runtime
        }
    };

    return {
        notifications,
        defaultPosition,
        defaultDuration,
        setDefaultDuration,
        add,
        update,
        remove,
        clear,
        success,
        error,
        warning,
        info,
        neutral,
        promise,
        initFlashWatcher,
    };
}
