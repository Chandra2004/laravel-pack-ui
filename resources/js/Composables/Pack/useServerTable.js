import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';

/**
 * useServerTable
 * Composable untuk menyinkronkan state tabel (search, sort, filter, pagination)
 * dengan URL query string Inertia.js secara reaktif dan otomatis.
 *
 * @param {Object} options
 * @param {string} [options.routeName] - Nama rute Ziggy atau path URL
 * @param {Object} [options.routeParams] - Parameter tambahan untuk rute (misal { id: 1 })
 * @param {Object} [options.defaultSort] - { column: 'id', direction: 'desc' }
 * @param {number} [options.defaultPerPage] - Jumlah baris per halaman (default: 10)
 * @param {Object} [options.defaultFilters] - Nilai awal filter kustom
 * @param {number} [options.debounceMs] - Jeda debounce untuk pencarian (default: 350ms)
 * @param {boolean} [options.preserveState] - Pertahankan state komponen Inertia (default: true)
 * @param {boolean} [options.preserveScroll] - Pertahankan posisi scroll window (default: true)
 * @param {boolean} [options.replace] - Ganti history state browser tanpa menambah riwayat baru (default: true)
 * @param {Array<string>} [options.only] - Partial reload prop Inertia tertentu
 * @param {boolean} [options.mock] - Mode simulasi/mock query sync tanpa memicu HTTP request Inertia (default: false)
 * @param {Function} [options.onStart] - Callback saat request dimulai
 * @param {Function} [options.onFinish] - Callback saat request selesai
 */
export function useServerTable(options = {}) {
    const {
        routeName = '',
        routeParams = {},
        defaultSort = { column: 'id', direction: 'desc' },
        defaultPerPage = 10,
        defaultFilters = {},
        debounceMs = 350,
        preserveState = true,
        preserveScroll = true,
        replace = true,
        only = [],
        mock = false,
        onStart = null,
        onFinish = null,
    } = options;

    // Baca parameter awal dari URL jika tersedia di lingkungan browser
    const getInitialQuery = () => {
        if (typeof window === 'undefined') return {};
        const searchParams = new URLSearchParams(window.location.search);
        const query = {};
        for (const [key, value] of searchParams.entries()) {
            query[key] = value;
        }
        return query;
    };

    const initialQuery = getInitialQuery();

    // Inisialisasi State Reaktif
    const search = ref(initialQuery.search !== undefined ? initialQuery.search : '');
    const sortColumn = ref(initialQuery.sort || defaultSort.column);
    const sortDirection = ref(initialQuery.direction || defaultSort.direction);
    const perPage = ref(Number(initialQuery.per_page) || defaultPerPage);
    const page = ref(Number(initialQuery.page) || 1);
    const isLoading = ref(false);

    // Filter Kustom
    const initialFilters = { ...defaultFilters };
    Object.keys(initialFilters).forEach((key) => {
        if (initialQuery[key] !== undefined) {
            initialFilters[key] = initialQuery[key];
        }
    });
    const filters = reactive(initialFilters);

    let debounceTimer = null;
    let isInternalUpdate = false;

    /**
     * Resolusi URL tujuan request
     */
    const resolveUrl = () => {
        if (typeof window === 'undefined') return '';

        if (routeName) {
            // Jika ada helper Ziggy route() secara global
            if (typeof window.route === 'function') {
                try {
                    return window.route(routeName, routeParams);
                } catch {
                    // Fallback jika nama rute tidak dikenali Ziggy
                }
            }
            if (routeName.startsWith('http://') || routeName.startsWith('https://') || routeName.startsWith('/')) {
                return routeName;
            }
        }

        return window.location.pathname;
    };

    /**
     * Query Parameters gabungan yang bersih (menyingkirkan nilai kosong/null)
     */
    const queryParams = computed(() => {
        const params = {};

        if (search.value && String(search.value).trim() !== '') {
            params.search = String(search.value).trim();
        }

        if (sortColumn.value) {
            params.sort = sortColumn.value;
            params.direction = sortDirection.value || 'asc';
        }

        if (perPage.value && Number(perPage.value) !== defaultPerPage) {
            params.per_page = perPage.value;
        }

        if (page.value && Number(page.value) > 1) {
            params.page = page.value;
        }

        // Gabungkan filter kustom
        Object.entries(filters).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '' && val !== 'all') {
                params[key] = val;
            }
        });

        return params;
    });

    /**
     * Eksekusi kunjungan Inertia dengan parameter aktif
     */
    const executeVisit = (customParams = null) => {
        const url = resolveUrl();
        const data = customParams || queryParams.value;

        isLoading.value = true;
        if (typeof onStart === 'function') onStart();

        if (mock) {
            if (typeof window !== 'undefined') {
                const searchParams = new URLSearchParams(data);
                const queryString = searchParams.toString();
                const newUrl = `${url}${queryString ? '?' + queryString : ''}`;
                window.history.replaceState(null, '', newUrl);
            }
            setTimeout(() => {
                isLoading.value = false;
                if (typeof onFinish === 'function') onFinish();
            }, 250);
            return;
        }

        router.get(url, data, {
            preserveState,
            preserveScroll,
            replace,
            only: only.length > 0 ? only : undefined,
            onFinish: () => {
                isLoading.value = false;
                if (typeof onFinish === 'function') onFinish();
            },
        });
    };

    /**
     * Trigger visit dengan debounce (untuk input ketikan search)
     */
    const triggerDebouncedVisit = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeVisit();
        }, debounceMs);
    };

    /**
     * Ganti arah urutan atau ubah kolom sortir
     * @param {string} column
     */
    const applySort = (column) => {
        if (sortColumn.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn.value = column;
            sortDirection.value = 'asc';
        }
        page.value = 1;
        executeVisit();
    };

    /**
     * Atur filter tertentu secara langsung
     * @param {string} key
     * @param {any} value
     */
    const setFilter = (key, value) => {
        filters[key] = value;
        page.value = 1;
        executeVisit();
    };

    /**
     * Ubah halaman aktif
     * @param {number} newPage
     */
    const goToPage = (newPage) => {
        if (newPage === page.value || newPage < 1) return;
        page.value = newPage;
        executeVisit();
    };

    /**
     * Reset semua filter, search, dan pagination ke kondisi bawaan
     */
    const resetFilters = () => {
        isInternalUpdate = true;
        search.value = '';
        sortColumn.value = defaultSort.column;
        sortDirection.value = defaultSort.direction;
        perPage.value = defaultPerPage;
        page.value = 1;

        Object.keys(filters).forEach((key) => {
            filters[key] = defaultFilters[key] !== undefined ? defaultFilters[key] : '';
        });

        isInternalUpdate = false;
        executeVisit();
    };

    /**
     * Muat ulang data secara manual
     */
    const reload = () => {
        executeVisit();
    };

    // Watcher Search: Reset page ke 1 lalu kirim request debounced
    watch(search, () => {
        if (isInternalUpdate) return;
        page.value = 1;
        triggerDebouncedVisit();
    });

    // Watcher Filters: Reset page ke 1 lalu kirim request debounced
    watch(filters, () => {
        if (isInternalUpdate) return;
        page.value = 1;
        triggerDebouncedVisit();
    }, { deep: true });

    // Watcher PerPage: Reset page ke 1 lalu kirim request instan
    watch(perPage, () => {
        if (isInternalUpdate) return;
        page.value = 1;
        executeVisit();
    });

    onUnmounted(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
    });

    return {
        // State Reaktif
        search,
        sortColumn,
        sortDirection,
        perPage,
        page,
        filters,
        isLoading,
        queryParams,

        // Actions / Methods
        applySort,
        setFilter,
        goToPage,
        resetFilters,
        reload,
    };
}
