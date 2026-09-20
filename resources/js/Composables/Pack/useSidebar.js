import { ref, watch, onMounted, onUnmounted } from 'vue';

// Global shared state
const globalCollapsed = ref(false);
const globalMobileOpen = ref(false);
let isInitialized = false;

/**
 * Composable useSidebar
 * Mengelola state reaktif sidebar (ciut/lebar, drawer mobile, persistensi localStorage, dan shortcut keyboard Ctrl+B).
 *
 * @param {Object} options
 * @param {string|boolean} [options.persistKey='pack_sidebar_collapsed'] Key localStorage untuk menyimpan preferensi (false untuk menonaktifkan).
 * @param {boolean} [options.defaultCollapsed=false] Nilai default saat inisialisasi awal.
 * @param {boolean} [options.enableShortcut=true] Mengaktifkan shortcut keyboard Ctrl+B / Cmd+B.
 * @param {boolean} [options.isolated=false] Jika true, membuat instance state lokal baru dan tidak berbagi state global.
 */
export function useSidebar(options = {}) {
    const {
        persistKey = 'pack_sidebar_collapsed',
        defaultCollapsed = false,
        enableShortcut = true,
        isolated = false,
    } = options;

    // Tentukan apakah menggunakan state lokal atau global
    const isCollapsed = isolated ? ref(defaultCollapsed) : globalCollapsed;
    const isMobileOpen = isolated ? ref(false) : globalMobileOpen;

    // Helper Kunci Scroll Layar Body
    const handleBodyScrollLock = (lock) => {
        if (typeof document === 'undefined') return;
        if (lock) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    // Baca persistensi dari localStorage
    const loadPersistedState = () => {
        if (typeof window === 'undefined' || !persistKey) return;
        try {
            const saved = localStorage.getItem(persistKey);
            if (saved !== null) {
                isCollapsed.value = saved === 'true';
            }
        } catch (e) {
            // Abaikan error sandbox/privacy mode
        }
    };

    // Simpan ke localStorage saat isCollapsed berubah
    const savePersistedState = (val) => {
        if (typeof window === 'undefined' || !persistKey) return;
        try {
            localStorage.setItem(persistKey, String(val));
        } catch (e) {
            // Abaikan error quota/private browsing
        }
    };

    // Inisialisasi awal
    if (!isolated && !isInitialized) {
        loadPersistedState();
        isInitialized = true;
    } else if (isolated) {
        loadPersistedState();
    }

    watch(isCollapsed, (val) => {
        savePersistedState(val);
    });

    watch(isMobileOpen, (val) => {
        handleBodyScrollLock(val);
    });

    // Aksi Pengontrol Sidebar
    const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value;
    };

    const setCollapsed = (val) => {
        isCollapsed.value = Boolean(val);
    };

    const openMobile = () => {
        isMobileOpen.value = true;
    };

    const closeMobile = () => {
        isMobileOpen.value = false;
        handleBodyScrollLock(false);
    };

    const toggleMobile = () => {
        isMobileOpen.value = !isMobileOpen.value;
    };

    const setMobileOpen = (val) => {
        isMobileOpen.value = Boolean(val);
    };

    // Keyboard shortcut handler (Ctrl+B atau Cmd+B)
    const handleKeydown = (e) => {
        if (!enableShortcut) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            const activeTag = document.activeElement?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
                return;
            }
            e.preventDefault();
            toggleCollapse();
        } else if (e.key === 'Escape' && isMobileOpen.value) {
            closeMobile();
        }
    };

    onMounted(() => {
        if (typeof window !== 'undefined' && enableShortcut) {
            window.addEventListener('keydown', handleKeydown);
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined' && enableShortcut) {
            window.removeEventListener('keydown', handleKeydown);
        }
        handleBodyScrollLock(false);
        if (!isolated) {
            globalMobileOpen.value = false;
        }
    });

    return {
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        setCollapsed,
        openMobile,
        closeMobile,
        toggleMobile,
        setMobileOpen,
    };
}
