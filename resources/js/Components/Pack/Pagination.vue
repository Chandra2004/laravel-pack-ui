<script setup>
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';

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
    // Pilar 1: Warna
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    // Pilar 2: Bentuk & Tampilan (Anti-Monoton)
    variant: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'joined', 'pills', 'flat', 'card'].includes(v),
    },
    radius: {
        type: String,
        default: 'xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    // Pilar 3: Teks Konten
    showButtonText: {
        type: Boolean,
        default: true,
    },
    prevText: {
        type: String,
        default: 'Sebelumnya',
    },
    nextText: {
        type: String,
        default: 'Selanjutnya',
    },
    firstText: {
        type: String,
        default: 'Awal',
    },
    lastText: {
        type: String,
        default: 'Akhir',
    },
    // Pilar 4: Icon & Fitur Navigasi
    showFirstLast: {
        type: Boolean,
        default: false,
    },
    prevIcon: {
        type: String,
        default: 'chevron_left',
    },
    nextIcon: {
        type: String,
        default: 'chevron_right',
    },
    firstIcon: {
        type: String,
        default: 'first_page',
    },
    lastIcon: {
        type: String,
        default: 'last_page',
    },
    // Fitur Tambahan
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
    align: {
        type: String,
        default: 'between',
        validator: (v) => ['between', 'center', 'start', 'end'].includes(v),
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

const firstUrl = computed(() => {
    if (props.clientSide || !hasPrev.value) return null;
    return getPageUrl(1);
});

const lastUrl = computed(() => {
    if (props.clientSide || !hasNext.value) return null;
    return getPageUrl(lastPage.value);
});

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

// Windowing Pagination Pages
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

// Pilar 1: Theme Presets
const themeClasses = computed(() => {
    const themes = {
        primary: {
            active: 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30 dark:bg-blue-600 dark:border-blue-600',
            activeSubtle: 'bg-blue-50 text-blue-700 font-bold border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
            focus: 'focus-visible:ring-blue-500/30',
            borderFocus: 'focus:border-blue-500',
            btnAccent: 'hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400',
            jumpBtn: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs border-transparent',
        },
        indigo: {
            active: 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30 dark:bg-indigo-600 dark:border-indigo-600',
            activeSubtle: 'bg-indigo-50 text-indigo-700 font-bold border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
            focus: 'focus-visible:ring-indigo-500/30',
            borderFocus: 'focus:border-indigo-500',
            btnAccent: 'hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400',
            jumpBtn: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-xs border-transparent',
        },
        emerald: {
            active: 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30 dark:bg-emerald-600 dark:border-emerald-600',
            activeSubtle: 'bg-emerald-50 text-emerald-700 font-bold border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
            focus: 'focus-visible:ring-emerald-500/30',
            borderFocus: 'focus:border-emerald-500',
            btnAccent: 'hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400',
            jumpBtn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-xs border-transparent',
        },
        purple: {
            active: 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30 dark:bg-purple-600 dark:border-purple-600',
            activeSubtle: 'bg-purple-50 text-purple-700 font-bold border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
            focus: 'focus-visible:ring-purple-500/30',
            borderFocus: 'focus:border-purple-500',
            btnAccent: 'hover:border-purple-500/60 hover:text-purple-600 dark:hover:text-purple-400',
            jumpBtn: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold shadow-xs border-transparent',
        },
        amber: {
            active: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30 dark:bg-amber-500 dark:border-amber-500',
            activeSubtle: 'bg-amber-50 text-amber-700 font-bold border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            focus: 'focus-visible:ring-amber-500/30',
            borderFocus: 'focus:border-amber-500',
            btnAccent: 'hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-400',
            jumpBtn: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold shadow-xs border-transparent',
        },
        rose: {
            active: 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/30 dark:bg-rose-600 dark:border-rose-600',
            activeSubtle: 'bg-rose-50 text-rose-700 font-bold border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
            focus: 'focus-visible:ring-rose-500/30',
            borderFocus: 'focus:border-rose-500',
            btnAccent: 'hover:border-rose-500/60 hover:text-rose-600 dark:hover:text-rose-400',
            jumpBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-xs border-transparent',
        },
        cyan: {
            active: 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-500/30 dark:bg-cyan-600 dark:border-cyan-600',
            activeSubtle: 'bg-cyan-50 text-cyan-700 font-bold border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
            focus: 'focus-visible:ring-cyan-500/30',
            borderFocus: 'focus:border-cyan-500',
            btnAccent: 'hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400',
            jumpBtn: 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold shadow-xs border-transparent',
        },
        dark: {
            active: 'bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-900/30 dark:bg-white dark:text-slate-900 dark:border-white',
            activeSubtle: 'bg-slate-100 text-slate-900 font-bold border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600',
            focus: 'focus-visible:ring-slate-500/30',
            borderFocus: 'focus:border-slate-500',
            btnAccent: 'hover:border-slate-600 hover:text-slate-900 dark:hover:text-white',
            jumpBtn: 'bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-semibold shadow-xs border-transparent',
        },
    };
    return themes[props.colorTheme] || themes.primary;
});

// Pilar 2: Radius Classes
const radiusClasses = computed(() => {
    if (props.variant === 'pills') return 'rounded-full';
    const rad = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
    };
    return rad[props.radius] || 'rounded-xl';
});

// Pilar 2: Size Classes
const sizeClasses = computed(() => {
    const sz = {
        sm: {
            btn: 'h-7 min-w-[28px] px-2 text-[11px]',
            navBtn: 'h-7 px-2 text-[11px] gap-1',
            icon: 'text-[15px]',
            input: 'h-7 w-11 text-[11px]',
            select: 'h-7 px-1.5 text-[11px]',
        },
        md: {
            btn: 'h-8 min-w-[32px] px-2.5 text-xs',
            navBtn: 'h-8 px-2.5 sm:px-3 text-xs gap-1',
            icon: 'text-base',
            input: 'h-8 w-12 text-xs',
            select: 'h-8 px-2 text-xs',
        },
        lg: {
            btn: 'h-9 min-w-[36px] px-3 text-sm',
            navBtn: 'h-9 px-3 sm:px-3.5 text-sm gap-1.5',
            icon: 'text-lg',
            input: 'h-9 w-14 text-sm',
            select: 'h-9 px-2.5 text-sm',
        },
    };
    return sz[props.size] || sz.md;
});

// Container Alignment
const alignmentClass = computed(() => {
    const alignMap = {
        between: 'justify-between',
        center: 'justify-center',
        start: 'justify-start',
        end: 'justify-end',
    };
    return alignMap[props.align] || 'justify-between';
});
</script>

<template>
    <nav
        v-if="data && (totalItems > 0 || lastPage > 1)"
        aria-label="Pagination Navigation"
        :class="[
            'w-full select-none transition-all duration-200',
            variant === 'card'
                ? 'p-3.5 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs'
                : ''
        ]"
    >
        <div :class="['flex flex-col sm:flex-row items-center gap-3.5 w-full', alignmentClass]">
            <!-- Info Ringkasan & PerPage Dropdown (Kiri / Order 2 di Mobile) -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                <!-- Slot Info atau Teks Default -->
                <slot
                    name="info"
                    :from="data.from || (totalItems > 0 ? 1 : 0)"
                    :to="data.to || totalItems"
                    :total="totalItems"
                    :item-name="itemName"
                    :current-page="currentPage"
                    :last-page="lastPage"
                >
                    <span v-if="showInfo">
                        Menampilkan
                        <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.from || (totalItems > 0 ? 1 : 0) }}</strong>
                        -
                        <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.to || totalItems }}</strong>
                        dari
                        <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ totalItems }}</strong>
                        {{ itemName }}
                    </span>
                </slot>

                <!-- PerPage Selector Dropdown -->
                <slot name="per-page" :per-page="perPage" :options="perPageOptions" :loading="loading">
                    <div v-if="showPerPage" class="inline-flex items-center gap-1.5 ml-1">
                        <label for="pagination-per-page" class="text-slate-400 dark:text-slate-500 text-[11px]">Per Hal:</label>
                        <select
                            id="pagination-per-page"
                            :value="perPage"
                            @change="handlePerPageChange"
                            :disabled="loading"
                            :class="[
                                sizeClasses.select,
                                radiusClasses,
                                themeClasses.borderFocus,
                                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer disabled:opacity-50 transition-colors'
                            ]"
                        >
                            <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                        </select>
                    </div>
                </slot>
            </div>

            <!-- Tombol Navigasi Paginasi (Kanan / Order 1 di Mobile) -->
            <div class="inline-flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center order-1 sm:order-2">
                <!-- Varian JOINED: Mengelompokkan seluruh tombol dalam 1 segmented control border bar -->
                <div
                    v-if="variant === 'joined'"
                    :class="[
                        'inline-flex items-stretch border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs divide-x divide-slate-200 dark:divide-slate-700 overflow-hidden',
                        radiusClasses
                    ]"
                >
                    <!-- Tombol First Page (Joined) -->
                    <component
                        v-if="showFirstLast"
                        :is="clientSide || !hasPrev ? 'button' : Link"
                        :type="clientSide || !hasPrev ? 'button' : undefined"
                        :href="!clientSide && hasPrev ? firstUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasPrev ? handlePageClick(1) : null"
                        :disabled="!hasPrev || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1',
                            sizeClasses.navBtn,
                            themeClasses.focus,
                            hasPrev && !loading
                                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        title="Halaman Pertama"
                        aria-label="Halaman Pertama"
                    >
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ firstIcon }}</span>
                        <span v-if="showButtonText" class="hidden md:inline">{{ firstText }}</span>
                    </component>

                    <!-- Tombol Previous (Joined) -->
                    <component
                        :is="clientSide || !hasPrev ? 'button' : Link"
                        :type="clientSide || !hasPrev ? 'button' : undefined"
                        :href="!clientSide && hasPrev ? prevUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasPrev ? handlePageClick(currentPage - 1) : null"
                        :disabled="!hasPrev || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1',
                            sizeClasses.navBtn,
                            themeClasses.focus,
                            hasPrev && !loading
                                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        aria-label="Halaman Sebelumnya"
                    >
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ prevIcon }}</span>
                        <span v-if="showButtonText" class="hidden xs:inline">{{ prevText }}</span>
                    </component>

                    <!-- Simple Mode Indicator (Joined) -->
                    <div v-if="simple" :class="['inline-flex items-center justify-center px-3 font-medium text-slate-700 dark:text-slate-300 text-xs']">
                        Hal. {{ currentPage }} / {{ lastPage }}
                    </div>

                    <!-- Page Numbers (Joined) -->
                    <template v-else>
                        <template v-for="(page, idx) in paginationPages" :key="idx">
                            <span
                                v-if="page === '...'"
                                :class="[
                                    'inline-flex items-center justify-center font-bold text-slate-400 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-900/20',
                                    sizeClasses.btn
                                ]"
                                aria-hidden="true"
                            >
                                ...
                            </span>

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
                                    'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-hidden',
                                    sizeClasses.btn,
                                    page === currentPage
                                        ? [themeClasses.active, 'font-bold cursor-default z-10']
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                ]"
                                :aria-current="page === currentPage ? 'page' : undefined"
                            >
                                {{ page }}
                            </component>
                        </template>
                    </template>

                    <!-- Tombol Next (Joined) -->
                    <component
                        :is="clientSide || !hasNext ? 'button' : Link"
                        :type="clientSide || !hasNext ? 'button' : undefined"
                        :href="!clientSide && hasNext ? nextUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasNext ? handlePageClick(currentPage + 1) : null"
                        :disabled="!hasNext || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1',
                            sizeClasses.navBtn,
                            themeClasses.focus,
                            hasNext && !loading
                                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        aria-label="Halaman Selanjutnya"
                    >
                        <span v-if="showButtonText" class="hidden xs:inline">{{ nextText }}</span>
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ nextIcon }}</span>
                    </component>

                    <!-- Tombol Last Page (Joined) -->
                    <component
                        v-if="showFirstLast"
                        :is="clientSide || !hasNext ? 'button' : Link"
                        :type="clientSide || !hasNext ? 'button' : undefined"
                        :href="!clientSide && hasNext ? lastUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasNext ? handlePageClick(lastPage) : null"
                        :disabled="!hasNext || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1',
                            sizeClasses.navBtn,
                            themeClasses.focus,
                            hasNext && !loading
                                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        title="Halaman Terakhir"
                        aria-label="Halaman Terakhir"
                    >
                        <span v-if="showButtonText" class="hidden md:inline">{{ lastText }}</span>
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ lastIcon }}</span>
                    </component>
                </div>

                <!-- Varian DEFAULT, PILLS, FLAT, & CARD (Tombol Terpisah) -->
                <div v-else class="inline-flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                    <!-- Tombol First Page -->
                    <component
                        v-if="showFirstLast"
                        :is="clientSide || !hasPrev ? 'button' : Link"
                        :type="clientSide || !hasPrev ? 'button' : undefined"
                        :href="!clientSide && hasPrev ? firstUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasPrev ? handlePageClick(1) : null"
                        :disabled="!hasPrev || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95',
                            sizeClasses.navBtn,
                            radiusClasses,
                            themeClasses.focus,
                            variant === 'flat'
                                ? hasPrev && !loading
                                    ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                : hasPrev && !loading
                                    ? ['border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-2xs cursor-pointer', themeClasses.btnAccent]
                                    : 'border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        title="Halaman Pertama"
                        aria-label="Halaman Pertama"
                    >
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ firstIcon }}</span>
                        <span v-if="showButtonText" class="hidden md:inline">{{ firstText }}</span>
                    </component>

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
                            'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95',
                            sizeClasses.navBtn,
                            radiusClasses,
                            themeClasses.focus,
                            variant === 'flat'
                                ? hasPrev && !loading
                                    ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                : hasPrev && !loading
                                    ? ['border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-2xs cursor-pointer', themeClasses.btnAccent]
                                    : 'border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        aria-label="Halaman Sebelumnya"
                    >
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ prevIcon }}</span>
                        <span v-if="showButtonText" class="hidden xs:inline">{{ prevText }}</span>
                    </component>

                    <!-- Simple Mode: Informasi Halaman Ringkas -->
                    <span v-if="simple" class="px-2 font-medium text-slate-600 dark:text-slate-300 text-xs">
                        Hal. {{ currentPage }} / {{ lastPage }}
                    </span>

                    <!-- Full Mode: Nomor-nomor Halaman -->
                    <template v-else>
                        <template v-for="(page, idx) in paginationPages" :key="idx">
                            <!-- Ellipsis -->
                            <span
                                v-if="page === '...'"
                                :class="[
                                    'inline-flex items-center justify-center font-bold text-slate-400 dark:text-slate-600',
                                    sizeClasses.btn
                                ]"
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
                                    'inline-flex items-center justify-center transition-all duration-150 select-none focus-visible:outline-hidden focus-visible:ring-2 active:scale-95',
                                    sizeClasses.btn,
                                    radiusClasses,
                                    themeClasses.focus,
                                    variant === 'flat'
                                        ? page === currentPage
                                            ? [themeClasses.activeSubtle, 'border cursor-default']
                                            : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer'
                                        : page === currentPage
                                            ? [themeClasses.active, 'font-bold border cursor-default']
                                            : ['border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white font-medium shadow-2xs cursor-pointer', themeClasses.btnAccent]
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
                            'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95',
                            sizeClasses.navBtn,
                            radiusClasses,
                            themeClasses.focus,
                            variant === 'flat'
                                ? hasNext && !loading
                                    ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                : hasNext && !loading
                                    ? ['border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-2xs cursor-pointer', themeClasses.btnAccent]
                                    : 'border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        aria-label="Halaman Selanjutnya"
                    >
                        <span v-if="showButtonText" class="hidden xs:inline">{{ nextText }}</span>
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ nextIcon }}</span>
                    </component>

                    <!-- Tombol Last Page -->
                    <component
                        v-if="showFirstLast"
                        :is="clientSide || !hasNext ? 'button' : Link"
                        :type="clientSide || !hasNext ? 'button' : undefined"
                        :href="!clientSide && hasNext ? lastUrl : undefined"
                        :preserve-scroll="preserveScroll"
                        :preserve-state="preserveState"
                        @click="clientSide && hasNext ? handlePageClick(lastPage) : null"
                        :disabled="!hasNext || loading"
                        :class="[
                            'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95',
                            sizeClasses.navBtn,
                            radiusClasses,
                            themeClasses.focus,
                            variant === 'flat'
                                ? hasNext && !loading
                                    ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                : hasNext && !loading
                                    ? ['border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white shadow-2xs cursor-pointer', themeClasses.btnAccent]
                                    : 'border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                        ]"
                        title="Halaman Terakhir"
                        aria-label="Halaman Terakhir"
                    >
                        <span v-if="showButtonText" class="hidden md:inline">{{ lastText }}</span>
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ lastIcon }}</span>
                    </component>
                </div>

                <!-- Jump To Page Input (Lompat ke halaman) -->
                <slot name="jump" :current-page="currentPage" :last-page="lastPage" :handle-jump="handleJump">
                    <div
                        v-if="showJump && lastPage > 1"
                        class="hidden md:inline-flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-2.5"
                    >
                        <input
                            v-model="jumpInput"
                            @keydown.enter="handleJump"
                            type="number"
                            min="1"
                            :max="lastPage"
                            placeholder="#"
                            aria-label="Lompat ke nomor halaman"
                            :class="[
                                sizeClasses.input,
                                radiusClasses,
                                themeClasses.borderFocus,
                                'text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden transition-colors'
                            ]"
                        />
                        <button
                            type="button"
                            @click="handleJump"
                            :class="[
                                sizeClasses.btn,
                                radiusClasses,
                                themeClasses.jumpBtn,
                                'px-2.5 font-semibold border transition active:scale-95 cursor-pointer'
                            ]"
                        >
                            Go
                        </button>
                    </div>
                </slot>
            </div>
        </div>
    </nav>
</template>
