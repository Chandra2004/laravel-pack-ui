import { ref, watch, onUnmounted, customRef } from 'vue';

/**
 * Pure debounce helper function
 * @param {Function} fn - Fungsi yang akan dieksekusi
 * @param {number} [delay=300] - Waktu jeda dalam milidetik
 * @param {Object} [options={}]
 * @param {boolean} [options.immediate=false] - Jalankan segera pada panggilan pertama
 * @returns {Function}
 */
export function debounce(fn, delay = 300, options = {}) {
    let timer = null;
    const immediate = Boolean(options.immediate);

    const debounced = function (...args) {
        const callNow = immediate && !timer;

        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                fn.apply(this, args);
            }
        }, delay);

        if (callNow) {
            fn.apply(this, args);
        }
    };

    debounced.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return debounced;
}

/**
 * Pure throttle helper function
 * @param {Function} fn
 * @param {number} [limit=300]
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
    let inThrottle = false;
    let lastArgs = null;
    let lastContext = null;

    const throttled = function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    throttled.apply(lastContext, lastArgs);
                    lastArgs = null;
                    lastContext = null;
                }
            }, limit);
        } else {
            lastArgs = args;
            lastContext = this;
        }
    };

    throttled.cancel = () => {
        inThrottle = false;
        lastArgs = null;
        lastContext = null;
    };

    return throttled;
}

/**
 * useDebouncedRef
 * Membuat ref Vue yang nilai emitnya tertunda selama delay milidetik
 * @param {any} value - Nilai awal
 * @param {number} [delay=300]
 * @returns {Ref}
 */
export function useDebouncedRef(value, delay = 300) {
    let timeout = null;
    return customRef((track, trigger) => {
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    value = newValue;
                    trigger();
                }, delay);
            },
        };
    });
}

/**
 * useDebounce
 * Composable hook pembungkus debounce yang otomatis membersihkan timer saat unmount
 * @param {Function} fn
 * @param {number} [delay=300]
 * @param {Object} [options={}]
 * @returns {Function}
 */
export function useDebounce(fn, delay = 300, options = {}) {
    const debouncedFn = debounce(fn, delay, options);

    onUnmounted(() => {
        debouncedFn.cancel();
    });

    return debouncedFn;
}

/**
 * useThrottle
 * Composable hook pembungkus throttle yang otomatis membersihkan timer saat unmount
 * @param {Function} fn
 * @param {number} [limit=300]
 * @returns {Function}
 */
export function useThrottle(fn, limit = 300) {
    const throttledFn = throttle(fn, limit);

    onUnmounted(() => {
        throttledFn.cancel();
    });

    return throttledFn;
}
