import { customRef, getCurrentInstance, onUnmounted } from 'vue';

/**
 * Pure debounce helper function
 * Menunda eksekusi fungsi hingga jeda waktu delay berlalu sejak pemanggilan terakhir.
 *
 * @param {Function} fn - Fungsi yang akan dieksekusi
 * @param {number} [delay=300] - Waktu jeda dalam milidetik
 * @param {Object} [options={}] - Opsi debounce
 * @param {boolean} [options.immediate=false] - Jalankan segera pada panggilan pertama
 * @param {number} [options.maxWait] - Waktu tunggu maksimum sebelum eksekusi dipaksa
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }}
 */
export function debounce(fn, delay = 300, options = {}) {
    let timer = null;
    let maxTimer = null;
    let lastArgs = null;
    let lastThis = null;
    const immediate = Boolean(options.immediate);
    const maxWait = typeof options.maxWait === 'number' ? options.maxWait : null;

    const invoke = () => {
        const args = lastArgs;
        const thisArg = lastThis;
        lastArgs = null;
        lastThis = null;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (maxTimer) {
            clearTimeout(maxTimer);
            maxTimer = null;
        }
        return fn.apply(thisArg, args);
    };

    const debounced = function (...args) {
        lastArgs = args;
        lastThis = this;

        const callNow = immediate && !timer;

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                invoke();
            } else {
                lastArgs = null;
                lastThis = null;
            }
        }, delay);

        if (maxWait !== null && !maxTimer && !immediate) {
            maxTimer = setTimeout(() => {
                if (timer) {
                    invoke();
                }
            }, maxWait);
        }

        if (callNow) {
            return fn.apply(this, args);
        }
    };

    debounced.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (maxTimer) {
            clearTimeout(maxTimer);
            maxTimer = null;
        }
        lastArgs = null;
        lastThis = null;
    };

    debounced.flush = () => {
        if (timer && lastArgs) {
            return invoke();
        }
    };

    debounced.pending = () => {
        return Boolean(timer);
    };

    return debounced;
}

/**
 * Pure throttle helper function
 * Membatasi frekuensi pemanggilan fungsi maksimal satu kali setiap interval limit milidetik.
 *
 * @param {Function} fn - Fungsi yang akan dieksekusi
 * @param {number} [limit=300] - Batas interval waktu dalam milidetik
 * @param {Object} [options={}] - Opsi throttle
 * @param {boolean} [options.leading=true] - Eksekusi pada permulaan interval
 * @param {boolean} [options.trailing=true] - Eksekusi panggilan terakhir saat interval berakhir
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }}
 */
export function throttle(fn, limit = 300, options = {}) {
    let timer = null;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = 0;
    const leading = options.leading !== false;
    const trailing = options.trailing !== false;

    const invoke = () => {
        const args = lastArgs;
        const thisArg = lastThis;
        lastArgs = null;
        lastThis = null;
        lastCallTime = leading ? Date.now() : 0;
        return fn.apply(thisArg, args);
    };

    const throttled = function (...args) {
        const now = Date.now();
        if (!lastCallTime && !leading) {
            lastCallTime = now;
        }
        const remaining = limit - (now - lastCallTime);

        lastArgs = args;
        lastThis = this;

        if (remaining <= 0 || remaining > limit) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastCallTime = now;
            return fn.apply(this, args);
        } else if (!timer && trailing) {
            timer = setTimeout(() => {
                timer = null;
                invoke();
            }, remaining);
        }
    };

    throttled.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        lastArgs = null;
        lastThis = null;
        lastCallTime = 0;
    };

    throttled.flush = () => {
        if (timer && lastArgs) {
            clearTimeout(timer);
            timer = null;
            return invoke();
        }
    };

    throttled.pending = () => {
        return Boolean(timer);
    };

    return throttled;
}

/**
 * useDebouncedRef
 * Membuat ref kustom Vue yang emisi pembaruan nilainya tertunda selama delay milidetik.
 *
 * @param {any} value - Nilai awal
 * @param {number} [delay=300] - Waktu jeda dalam milidetik
 * @returns {import('vue').Ref}
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
 * useThrottledRef
 * Membuat ref kustom Vue yang emisi pembaruan nilainya dibatasi laju intervalnya.
 *
 * @param {any} value - Nilai awal
 * @param {number} [limit=300] - Batas interval waktu dalam milidetik
 * @returns {import('vue').Ref}
 */
export function useThrottledRef(value, limit = 300) {
    let timeout = null;
    let lastCall = 0;
    return customRef((track, trigger) => {
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                const now = Date.now();
                const remaining = limit - (now - lastCall);
                if (remaining <= 0) {
                    lastCall = now;
                    value = newValue;
                    trigger();
                } else if (!timeout) {
                    timeout = setTimeout(() => {
                        timeout = null;
                        lastCall = Date.now();
                        value = newValue;
                        trigger();
                    }, remaining);
                }
            },
        };
    });
}

/**
 * useDebounce
 * Composable hook pembungkus debounce yang otomatis membersihkan timer saat unmount.
 *
 * @param {Function} fn - Fungsi yang akan dieksekusi
 * @param {number} [delay=300] - Waktu jeda dalam milidetik
 * @param {Object} [options={}] - Opsi debounce
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }}
 */
export function useDebounce(fn, delay = 300, options = {}) {
    const debouncedFn = debounce(fn, delay, options);

    if (getCurrentInstance()) {
        onUnmounted(() => {
            debouncedFn.cancel();
        });
    }

    return debouncedFn;
}

/**
 * useThrottle
 * Composable hook pembungkus throttle yang otomatis membersihkan timer saat unmount.
 *
 * @param {Function} fn - Fungsi yang akan dieksekusi
 * @param {number} [limit=300] - Batas interval waktu dalam milidetik
 * @param {Object} [options={}] - Opsi throttle
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }}
 */
export function useThrottle(fn, limit = 300, options = {}) {
    const throttledFn = throttle(fn, limit, options);

    if (getCurrentInstance()) {
        onUnmounted(() => {
            throttledFn.cancel();
        });
    }

    return throttledFn;
}

// Aliases for VueUse parity
export const useDebounceFn = useDebounce;
export const useThrottleFn = useThrottle;
