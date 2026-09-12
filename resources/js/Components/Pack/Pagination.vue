<script setup>
import { ref, computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            current_page: 1,
            last_page: 1,
            from: 1,
            to: 1,
            total: 0,
            prev_page_url: null,
            next_page_url: null,
            links: [],
        }),
    },
    path: {
        type: String,
        default: '',
    },
    itemName: {
        type: String,
        default: 'Data',
    },
    showInfo: {
        type: Boolean,
        default: true,
    },
    simple: {
        type: Boolean,
        default: false,
    },
    clientSide: {
        type: Boolean,
        default: false,
    },
    preserveScroll: {
        type: Boolean,
        default: true,
    },
    preserveState: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    showPerPage: {
        type: Boolean,
        default: false,
    },
    perPage: {
        type: Number,
        default: 10,
    },
    perPageOptions: {
        type: Array,
        default: () => [10, 25, 50, 100],
    },
    showJump: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['change', 'update:perPage', 'per-page-change']);

const jumpInput = ref('');

const currentPage = computed(() => Number(props.data?.current_page) || 1);
const lastPage = computed(() => Math.max(1, Number(props.data?.last_page) || 1));
const totalItems = computed(() => Number(props.data?.total) || 0);

const hasPrev = computed(() => currentPage.value > 1 && !props.loading);
const hasNext = computed(() => currentPage.value < lastPage.value && !props.loading);

// Safe SSR-friendly URL builder
const getPageUrl = (page) => {
    if (!page || page === '...' || props.loading) return '#';
    if (props.path) {
        return props.path.includes('?')
            ? `${props.path}&page=${page}`
            : `${props.path}?page=${page}`;
    }

    if (props.data?.links && Array.isArray(props.data.links)) {
        const found = props.data.links.find((l) => String(l.label) === String(page));
        if (found && found.url) return found.url;
    }

    try {
        if (typeof window !== 'undefined' && window.location) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', page);
            return url.pathname + url.search;
        }
    } catch (e) {}

    return `?page=${page}`;
};

const prevUrl = computed(() => {
    if (props.clientSide || !hasPrev.value) return null;
    if (props.data?.prev_page_url) return props.data.prev_page_url;
    return getPageUrl(currentPage.value - 1);
});

const nextUrl = computed(() => {
    if (props.clientSide || !hasNext.value) return null;
    if (props.data?.next_page_url) return props.data.next_page_url;
    return getPageUrl(currentPage.value + 1);
});

// Optimasi: Dihitung sebagai computed, bukan fungsi biasa di template
const paginationPages = computed(() => {
    const current = currentPage.value;
    const last = lastPage.value;
    const delta = 2;
    const pages = [];

    if (last <= 7) {
        for (let i = 1; i <= last; i++) {
            pages.push(i);
        }
        return pages;
    }

    const left = current - delta;
    const right = current + delta + 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
});

const handlePageClick = (page) => {
    if (props.loading || page === '...' || page === currentPage.value) return;
    emit('change', page);
};

const handlePerPageChange = (event) => {
    const val = Number(event.target.value);
    emit('update:perPage', val);
    emit('per-page-change', val);
};

const handleJump = () => {
    const target = parseInt(jumpInput.value, 10);
    if (!isNaN(target) && target >= 1 && target <= lastPage.value && target !== currentPage.value) {
        handlePageClick(target);
        jumpInput.value = '';
    }
};
</script>

<template>
    <nav
        v-if="data && (totalItems > 0 || lastPage > 1)"
        aria-label="Pagination Navigation"
        class="flex flex-col sm:flex-row items-center justify-between gap-3.5 w-full select-none"
    >
        <!-- Info Ringkasan & PerPage Dropdown -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
            <span v-if="showInfo">
                Menampilkan
                <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.from || (totalItems > 0 ? 1 : 0) }}</strong>
                -
                <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.to || totalItems }}</strong>
                dari
                <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ totalItems }}</strong>
                {{ itemName }}
            </span>

            <!-- PerPage Selector Dropdown -->
            <div v-if="showPerPage" class="inline-flex items-center gap-1.5 ml-1">
                <label for="pagination-per-page" class="text-slate-400 dark:text-slate-500 text-[11px]">Per Hal:</label>
                <select
                    id="pagination-per-page"
                    :value="perPage"
                    @change="handlePerPageChange"
                    :disabled="loading"
                    class="h-7 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 cursor-pointer disabled:opacity-50"
                >
                    <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
            </div>
        </div>

        <!-- Tombol Paginasi (DRY Refactored dengan Dynamic Component) -->
        <div class="inline-flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center order-1 sm:order-2">
            <!-- Tombol Previous -->
            <component
                :is="clientSide || !hasPrev ? 'button' : Link"
                :type="clientSide || !hasPrev ? 'button' : undefined"
                :href="!clientSide && hasPrev ? prevUrl : undefined"
                :preserve-scroll="preserveScroll"
                :preserve-state="preserveState"
                @click="clientSide && hasPrev ? handlePageClick(currentPage - 1) : null"
                :disabled="!hasPrev || loading"
                :class="[
                    'inline-flex items-center gap-1 px-2.5 sm:px-3 h-8 text-xs font-medium rounded-xl border transition-all duration-150 shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/30',
                    hasPrev && !loading
                        ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-98 cursor-pointer'
                        : 'border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                ]"
                aria-label="Halaman Sebelumnya"
            >
                <span class="material-symbols-outlined text-base leading-none">chevron_left</span>
                <span class="hidden xs:inline">Sebelumnya</span>
            </component>

            <!-- Simple Mode: Informasi Halaman Ringkas -->
            <span v-if="simple" class="px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                Hal. {{ currentPage }} / {{ lastPage }}
            </span>

            <!-- Full Mode: Nomor-nomor Halaman -->
            <template v-else>
                <template v-for="(page, idx) in paginationPages" :key="idx">
                    <!-- Ellipsis -->
                    <span
                        v-if="page === '...'"
                        class="inline-flex items-center justify-center min-w-[32px] h-8 text-xs font-bold text-slate-400 dark:text-slate-600"
                        aria-hidden="true"
                    >
                        ...
                    </span>

                    <!-- Page Number Button / Link -->
                    <component
                        v-else
                        :is="clientSide ? 'button' : Link"
                        :type="clientSide ? 'button' : undefined"
                        :href="!clientSide ? getPageUrl(page) : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide ? handlePageClick(page) : null"
                        :disabled="loading"
                        :class="[
                            'inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 text-xs rounded-xl transition-all duration-150 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/30',
                            page === currentPage
                                ? 'bg-blue-600 text-white font-bold border border-blue-600 shadow-sm shadow-blue-500/25 dark:bg-blue-600 dark:border-blue-600 cursor-default'
                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium active:scale-98 cursor-pointer'
                        ]"
                        :aria-current="page === currentPage ? 'page' : undefined"
                    >
                        {{ page }}
                    </component>
                </template>
            </template>

            <!-- Tombol Next -->
            <component
                :is="clientSide || !hasNext ? 'button' : Link"
                :type="clientSide || !hasNext ? 'button' : undefined"
                :href="!clientSide && hasNext ? nextUrl : undefined"
                :preserve-scroll="preserveScroll"
                :preserve-state="preserveState"
                @click="clientSide && hasNext ? handlePageClick(currentPage + 1) : null"
                :disabled="!hasNext || loading"
                :class="[
                    'inline-flex items-center gap-1 px-2.5 sm:px-3 h-8 text-xs font-medium rounded-xl border transition-all duration-150 shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/30',
                    hasNext && !loading
                        ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-98 cursor-pointer'
                        : 'border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                ]"
                aria-label="Halaman Selanjutnya"
            >
                <span class="hidden xs:inline">Selanjutnya</span>
                <span class="material-symbols-outlined text-base leading-none">chevron_right</span>
            </component>

            <!-- Jump To Page Input (Lompat ke halaman) -->
            <div v-if="showJump && lastPage > 1" class="hidden md:inline-flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                <input
                    v-model="jumpInput"
                    @keydown.enter="handleJump"
                    type="number"
                    min="1"
                    :max="lastPage"
                    placeholder="#"
                    aria-label="Lompat ke nomor halaman"
                    class="w-12 h-8 text-center text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
                <button
                    type="button"
                    @click="handleJump"
                    class="h-8 px-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                    Go
                </button>
            </div>
        </div>
    </nav>
</template>
