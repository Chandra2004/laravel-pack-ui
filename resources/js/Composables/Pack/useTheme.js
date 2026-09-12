import { ref } from 'vue';

// Subscribers set for external reactions
const subscribers = new Set();

let mediaQueryList = null;
let mediaQueryHandler = null;
let isInitialized = false;

const getSystemPrefersDark = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialThemeState = () => {
    if (typeof window === 'undefined') {
        return { theme: 'system', isDark: false };
    }

    const saved = localStorage.getItem('theme');
    const systemDark = getSystemPrefersDark();
    const domDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    if (saved === 'dark') {
        return { theme: 'dark', isDark: true };
    }
    if (saved === 'light') {
        return { theme: 'light', isDark: false };
    }
    // Saved is 'system' or not set:
    return {
        theme: saved || 'system',
        isDark: domDark || systemDark,
    };
};

const initialState = getInitialThemeState();
const theme = ref(initialState.theme); // 'light' | 'dark' | 'system'
const isDark = ref(initialState.isDark);

const notifySubscribers = () => {
    const payload = { theme: theme.value, isDark: isDark.value };
    subscribers.forEach((cb) => {
        try {
            cb(payload);
        } catch (err) {
            console.error('[useTheme] Subscriber callback error:', err);
        }
    });
};

const applyToDom = (dark) => {
    if (typeof document === 'undefined') return;
    isDark.value = dark;
    if (dark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    notifySubscribers();
};

const updateThemeState = (targetTheme) => {
    theme.value = targetTheme;
    if (targetTheme === 'dark') {
        applyToDom(true);
    } else if (targetTheme === 'light') {
        applyToDom(false);
    } else {
        // 'system'
        applyToDom(getSystemPrefersDark());
    }
};

export function useTheme() {
    const initTheme = () => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem('theme') || 'system';
        updateThemeState(saved);

        if (!isInitialized) {
            isInitialized = true;
            if (window.matchMedia) {
                mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQueryHandler = (e) => {
                    if (theme.value === 'system' || !localStorage.getItem('theme')) {
                        applyToDom(e.matches);
                    }
                };

                if (mediaQueryList.addEventListener) {
                    mediaQueryList.addEventListener('change', mediaQueryHandler);
                } else if (mediaQueryList.addListener) {
                    mediaQueryList.addListener(mediaQueryHandler);
                }
            }
        }
    };

    const cleanupTheme = () => {
        if (mediaQueryList && mediaQueryHandler) {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', mediaQueryHandler);
            } else if (mediaQueryList.removeListener) {
                mediaQueryList.removeListener(mediaQueryHandler);
            }
        }
        mediaQueryList = null;
        mediaQueryHandler = null;
        isInitialized = false;
    };

    const setTheme = (newTheme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
        }
        updateThemeState(newTheme);
    };

    const cycleTheme = () => {
        const order = ['light', 'dark', 'system'];
        const currentIdx = order.indexOf(theme.value);
        const next = order[(currentIdx + 1) % order.length];
        setTheme(next);
    };

    const toggleTheme = (includeSystem = false) => {
        if (includeSystem) {
            cycleTheme();
            return;
        }
        const next = isDark.value ? 'light' : 'dark';
        setTheme(next);
    };

    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => {};
        subscribers.add(callback);
        callback({ theme: theme.value, isDark: isDark.value });
        return () => {
            subscribers.delete(callback);
        };
    };

    return {
        theme,
        isDark,
        setTheme,
        toggleTheme,
        cycleTheme,
        initTheme,
        cleanupTheme,
        subscribe,
    };
}

