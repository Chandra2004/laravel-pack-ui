import { ref, watch, onUnmounted } from 'vue';

/**
 * useLocalStorage
 * Composable untuk menyimpan dan menyinkronkan state reaktif Vue dengan localStorage browser.
 * Dilengkapi auto JSON parse/stringify dan sinkronisasi lintas tab browser (storage event).
 *
 * @param {string} key - Kunci penyimpanan localStorage
 * @param {any} initialValue - Nilai bawaan jika key belum tersimpan di localStorage
 * @param {Object} [options={}]
 * @param {boolean} [options.listenToStorage=true] - Dengarkan perubahan dari tab browser lain
 * @param {boolean} [options.deep=true] - Lakukan deep watcher untuk objek/array
 */
export function useLocalStorage(key, initialValue, options = {}) {
    const { listenToStorage = true, deep = true } = options;

    /**
     * Membaca nilai dari localStorage secara aman
     */
    const read = () => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return typeof initialValue === 'function' ? initialValue() : initialValue;
        }

        try {
            const raw = window.localStorage.getItem(key);
            if (raw === null) {
                return typeof initialValue === 'function' ? initialValue() : initialValue;
            }
            return JSON.parse(raw);
        } catch {
            return typeof initialValue === 'function' ? initialValue() : initialValue;
        }
    };

    /**
     * Menulis nilai ke localStorage secara aman
     */
    const write = (val) => {
        if (typeof window === 'undefined' || !window.localStorage) return;

        try {
            if (val === undefined || val === null) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(val));
            }
        } catch (err) {
            console.error(`[useLocalStorage] Gagal menyimpan key "${key}":`, err);
        }
    };

    const data = ref(read());

    // Watcher perubahan data untuk otomatis menyimpannya ke storage
    watch(
        data,
        (newVal) => {
            write(newVal);
        },
        { deep }
    );

    /**
     * Listener event storage untuk sinkronisasi antar-tab
     */
    const onStorage = (event) => {
        if (event.key !== key || event.storageArea !== window.localStorage) return;

        try {
            if (event.newValue === null) {
                data.value = typeof initialValue === 'function' ? initialValue() : initialValue;
            } else {
                data.value = JSON.parse(event.newValue);
            }
        } catch {
            // Abaikan kesalahan parsing eksternal
        }
    };

    if (listenToStorage && typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
        onUnmounted(() => {
            window.removeEventListener('storage', onStorage);
        });
    }

    /**
     * Menghapus nilai dari localStorage dan mengembalikan state ke initialValue
     */
    const remove = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
        data.value = typeof initialValue === 'function' ? initialValue() : initialValue;
    };

    return {
        data,
        remove,
    };
}
