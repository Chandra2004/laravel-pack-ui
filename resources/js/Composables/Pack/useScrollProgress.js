import { ref, computed, onMounted, onUnmounted, watch, unref } from 'vue';

/**
 * useScrollProgress
 * Composable cerdas untuk melacak progres scroll (window, document, maupun kontainer elemen lokal)
 * dengan performa tinggi (requestAnimationFrame + capture listener), deteksi otomatis container aktif,
 * status ambang batas, estimasi waktu baca tersisa, dan helper scrollToTop.
 *
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement>|string|HTMLElement|null} [options.target=null] - Target scroll (null/'auto' = auto-detect window/main, string selector, atau element/ref)
 * @param {number} [options.threshold=1] - Ambang batas persentase atas (isAtTop aktif jika progress <= threshold)
 * @param {number} [options.wordsCount=0] - Total kata konten untuk estimasi waktu membaca
 * @param {number} [options.wordsPerMinute=200] - Kecepatan baca rata-rata (kata per menit)
 */
export function useScrollProgress(options = {}) {
    const {
        target = 'auto',
        threshold = 1,
        wordsCount = 0,
        wordsPerMinute = 200,
    } = options;

    const progress = ref(0); // 0 - 100
    const scrollTop = ref(0);
    const scrollHeight = ref(0);
    const clientHeight = ref(0);
    const isScrolling = ref(false);

    let rafId = null;
    let scrollTimer = null;
    let activeElement = null;

    /**
     * Menyelesaikan referensi elemen target eksplisit jika diberikan
     */
    const resolveExplicitTarget = () => {
        if (typeof window === 'undefined') return null;

        const rawTarget = unref(target);
        if (!rawTarget || rawTarget === 'window' || rawTarget === 'auto') {
            return null;
        }

        if (typeof rawTarget === 'string') {
            return document.querySelector(rawTarget);
        }

        if (rawTarget instanceof HTMLElement) {
            return rawTarget;
        }

        return null;
    };

    /**
     * Mengambil data dimensi dan posisi scroll dari target yang relevan
     */
    const getScrollMetrics = () => {
        if (typeof window === 'undefined') {
            return { currentScroll: 0, visibleHeight: 0, totalScrollable: 0, element: null };
        }

        // 1. Target eksplisit (misal: target="#my-container")
        const explicit = resolveExplicitTarget();
        if (explicit && explicit instanceof HTMLElement) {
            return {
                currentScroll: explicit.scrollTop,
                visibleHeight: explicit.clientHeight,
                totalScrollable: explicit.scrollHeight - explicit.clientHeight,
                element: explicit,
            };
        }

        // 2. Elemen yang baru saja tertangkap oleh capture listener saat pengguna scroll
        if (activeElement && activeElement instanceof HTMLElement && activeElement !== document.body && activeElement !== document.documentElement) {
            const total = activeElement.scrollHeight - activeElement.clientHeight;
            if (total > 5) {
                return {
                    currentScroll: activeElement.scrollTop,
                    visibleHeight: activeElement.clientHeight,
                    totalScrollable: total,
                    element: activeElement,
                };
            }
        }

        // 3. Cek apakah ada container layout utama (seperti <main class="overflow-y-auto"> di Testing.vue / Dashboard)
        const mainContainer = document.querySelector('main, #main-canvas, [class*="overflow-y-auto"]');
        if (mainContainer && mainContainer instanceof HTMLElement) {
            const mainTotal = mainContainer.scrollHeight - mainContainer.clientHeight;
            // Jika container ini memiliki scroll aktif atau memiliki konten yang melebihi tinggi layar
            if (mainTotal > 20) {
                return {
                    currentScroll: mainContainer.scrollTop,
                    visibleHeight: mainContainer.clientHeight,
                    totalScrollable: mainTotal,
                    element: mainContainer,
                };
            }
        }

        // 4. Fallback ke window / document scroll
        const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        const winTotal = docHeight - winHeight;

        return {
            currentScroll: winScroll,
            visibleHeight: winHeight,
            totalScrollable: Math.max(0, winTotal),
            element: window,
        };
    };

    /**
     * Menghitung nilai progres scroll secara presisi
     */
    const calculateProgress = () => {
        const metrics = getScrollMetrics();

        scrollTop.value = Math.max(0, metrics.currentScroll);
        clientHeight.value = metrics.visibleHeight;
        scrollHeight.value = metrics.totalScrollable + metrics.visibleHeight;

        if (metrics.totalScrollable <= 0) {
            progress.value = 0;
            return;
        }

        const calculated = (metrics.currentScroll / metrics.totalScrollable) * 100;
        progress.value = Math.min(100, Math.max(0, Math.round(calculated * 10) / 10));
    };

    /**
     * Handler scroll berkinerja tinggi via requestAnimationFrame
     */
    const handleScroll = () => {
        isScrolling.value = true;
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            isScrolling.value = false;
        }, 350);

        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
            calculateProgress();
            rafId = null;
        });
    };

    /**
     * Capture scroll event dari kontainer manapun yang sedang aktif di-scroll
     */
    const handleCaptureScroll = (e) => {
        if (e && e.target instanceof HTMLElement && e.target !== document && e.target !== document.documentElement) {
            activeElement = e.target;
        }
        handleScroll();
    };

    /**
     * Melakukan scroll mulus kembali ke paling atas target
     * @param {'smooth'|'auto'} [behavior='smooth']
     */
    const scrollToTop = (behavior = 'smooth') => {
        if (typeof window === 'undefined') return;

        const metrics = getScrollMetrics();
        const targetEl = metrics.element || window;

        if (targetEl === window || !targetEl) {
            window.scrollTo({
                top: 0,
                behavior,
            });
            document.documentElement.scrollTo({
                top: 0,
                behavior,
            });
        } else if (targetEl instanceof HTMLElement) {
            targetEl.scrollTo({
                top: 0,
                behavior,
            });
        }
    };

    /**
     * Melakukan scroll ke persentase tertentu
     * @param {number} targetPercentage (0 - 100)
     * @param {'smooth'|'auto'} [behavior='smooth']
     */
    const scrollToProgress = (targetPercentage, behavior = 'smooth') => {
        if (typeof window === 'undefined') return;
        const pct = Math.min(100, Math.max(0, targetPercentage)) / 100;

        const metrics = getScrollMetrics();
        const targetEl = metrics.element || window;

        if (targetEl === window || !targetEl) {
            const winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
            window.scrollTo({
                top: (docHeight - winHeight) * pct,
                behavior,
            });
        } else if (targetEl instanceof HTMLElement) {
            const totalScrollable = targetEl.scrollHeight - targetEl.clientHeight;
            targetEl.scrollTo({
                top: totalScrollable * pct,
                behavior,
            });
        }
    };

    // Status ambang batas atas
    const isAtTop = computed(() => progress.value <= threshold);

    // Status selesai 100%
    const isComplete = computed(() => progress.value >= 99.5);

    // Persentase normalisasi desimal 0 - 1
    const scrollPercent = computed(() => progress.value / 100);

    // Estimasi sisa waktu baca (dalam menit)
    const readingTimeRemaining = computed(() => {
        if (!wordsCount || wordsCount <= 0) return 0;
        const totalMinutes = Math.ceil(wordsCount / wordsPerMinute);
        const remainingMinutes = Math.ceil(totalMinutes * (1 - scrollPercent.value));
        return Math.max(0, remainingMinutes);
    });

    /**
     * Memasang event listeners
     */
    const attachListeners = () => {
        if (typeof window === 'undefined') return;

        // 1. Explicit target jika ada
        const explicit = resolveExplicitTarget();
        if (explicit && explicit instanceof HTMLElement) {
            explicit.addEventListener('scroll', handleScroll, { passive: true });
        }

        // 2. Pasang langsung ke kontainer scroll utama jika ada di DOM
        const scrollContainers = document.querySelectorAll('main, #main-canvas, [class*="overflow-y-auto"]');
        scrollContainers.forEach((el) => {
            el.addEventListener('scroll', handleCaptureScroll, { passive: true });
        });

        // 3. Listener capture global pada window & document
        document.addEventListener('scroll', handleCaptureScroll, { capture: true, passive: true });
        window.addEventListener('scroll', handleCaptureScroll, { capture: true, passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        // Hitung segera pada saat inisialisasi
        calculateProgress();
    };

    /**
     * Melepas event listeners
     */
    const detachListeners = () => {
        if (typeof window === 'undefined') return;

        const explicit = resolveExplicitTarget();
        if (explicit && explicit instanceof HTMLElement) {
            explicit.removeEventListener('scroll', handleScroll);
        }

        const scrollContainers = document.querySelectorAll('main, #main-canvas, [class*="overflow-y-auto"]');
        scrollContainers.forEach((el) => {
            el.removeEventListener('scroll', handleCaptureScroll);
        });

        document.removeEventListener('scroll', handleCaptureScroll, { capture: true });
        window.removeEventListener('scroll', handleCaptureScroll, { capture: true });
        window.removeEventListener('resize', handleScroll);

        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (scrollTimer) {
            clearTimeout(scrollTimer);
            scrollTimer = null;
        }
    };

    onMounted(() => {
        attachListeners();
    });

    onUnmounted(() => {
        detachListeners();
    });

    // Mengawasi jika target berubah secara dinamis
    watch(
        () => unref(target),
        () => {
            detachListeners();
            attachListeners();
        }
    );

    return {
        progress,
        scrollPercent,
        scrollTop,
        scrollHeight,
        clientHeight,
        isScrolling,
        isAtTop,
        isComplete,
        readingTimeRemaining,
        scrollToTop,
        scrollToProgress,
        calculateProgress,
    };
}
