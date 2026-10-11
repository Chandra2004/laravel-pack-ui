import { onMounted, onUnmounted, unref, getCurrentInstance } from 'vue';

/**
 * Ekstraksi elemen DOM mentah dari target (ref, reactive element, atau Vue component instance).
 * @param {any} target
 * @returns {HTMLElement | null}
 */
const unrefElement = (target) => {
    if (!target) return null;
    const plain = unref(target);
    return (plain && '$el' in plain ? plain.$el : plain) || null;
};

/**
 * Enterprise Composable to detect clicks, touches, or pointer events outside target element(s).
 *
 * Mendukung target tunggal maupun jamak (array), elemen yang diabaikan (ignore list),
 * deteksi klik iframe, pemeriksaan composedPath (aman shadow DOM dan unmounted children),
 * serta opsi capture listener.
 *
 * @param {import('vue').Ref<HTMLElement|null> | HTMLElement | Array<import('vue').Ref<HTMLElement|null>|HTMLElement>} target
 * @param {(event: PointerEvent | MouseEvent | TouchEvent) => void} handler - Callback saat klik luar terjadi
 * @param {Object} [options={}] - Opsi konfigurasi
 * @param {Array<import('vue').Ref<HTMLElement|null>|HTMLElement>} [options.ignore=[]] - Elemen yang diabaikan dari deteksi klik luar
 * @param {boolean} [options.capture=true] - Gunakan capture phase pada event listener
 * @param {boolean|import('vue').Ref<boolean>} [options.enabled=true] - Aktifkan/nonaktifkan pemantauan secara reaktif
 * @param {boolean} [options.detectIframe=true] - Deteksi klik saat fokus berpindah ke dalam iframe
 * @returns {() => void} Fungsi stop untuk menghentikan listener secara manual
 */
export function useClickOutside(target, handler, options = {}) {
    const {
        ignore = [],
        capture = true,
        enabled = true,
        detectIframe = true,
    } = options;

    if (typeof window === 'undefined') {
        return () => {};
    }

    let isListening = false;

    const shouldTrigger = (event) => {
        // Cek flag enabled
        if (!unref(enabled)) return false;

        const targets = Array.isArray(target) ? target : [target];
        const elements = targets.map(unrefElement).filter(Boolean);

        if (elements.length === 0) return false;

        const ignores = Array.isArray(ignore) ? ignore : [ignore];
        const ignoredElements = ignores.map(unrefElement).filter(Boolean);

        // Gunakan composedPath jika didukung (lebih akurat untuk Shadow DOM dan elemen anak yang di-unmount)
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [];

        // 1. Cek apakah klik berada di dalam salah satu elemen target
        for (const el of elements) {
            if (path.length > 0) {
                if (path.includes(el)) return false;
            } else if (el.contains(event.target)) {
                return false;
            }
        }

        // 2. Cek apakah klik berada di dalam elemen yang diabaikan (ignored elements)
        for (const ignoredEl of ignoredElements) {
            if (path.length > 0) {
                if (path.includes(ignoredEl)) return false;
            } else if (ignoredEl.contains(event.target)) {
                return false;
            }
        }

        return true;
    };

    const listener = (event) => {
        if (!shouldTrigger(event)) return;
        if (typeof handler === 'function') {
            handler(event);
        }
    };

    // Deteksi saat pengguna mengeklik area di dalam iframe (fokus window lepas)
    const onBlur = (event) => {
        if (!unref(enabled) || !detectIframe) return;

        // Beri jeda tick untuk memastikan activeElement telah terbarui
        setTimeout(() => {
            if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                const targets = (Array.isArray(target) ? target : [target]).map(unrefElement).filter(Boolean);
                const isInsideTarget = targets.some((el) => el.contains(document.activeElement));
                if (!isInsideTarget && typeof handler === 'function') {
                    handler(event);
                }
            }
        }, 0);
    };

    const start = () => {
        if (isListening || typeof window === 'undefined') return;
        window.addEventListener('pointerdown', listener, capture);
        if (detectIframe) {
            window.addEventListener('blur', onBlur);
        }
        isListening = true;
    };

    const stop = () => {
        if (!isListening || typeof window === 'undefined') return;
        window.removeEventListener('pointerdown', listener, capture);
        if (detectIframe) {
            window.removeEventListener('blur', onBlur);
        }
        isListening = false;
    };

    if (getCurrentInstance()) {
        onMounted(() => {
            start();
        });

        onUnmounted(() => {
            stop();
        });
    } else {
        start();
    }

    return stop;
}
