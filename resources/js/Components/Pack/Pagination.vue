<script setup>
import { ref, computed, useId } from 'vue';
import { Link } from '@inertiajs/vue3';
import ButtonSubmit from './ButtonSubmit.vue';
import Badge from './Badge.vue';
import InputSelect from './Input/InputSelect.vue';
import InputText from './Input/InputText.vue';

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
    // Alias fleksibel untuk nama entitas data yang mengisi token :item (contoh: :item="'Produk'")
    item: {
        type: String,
        default: '',
    },
    showInfo: {
        type: Boolean,
        default: true,
    },
    // Template string ringkasan data kustom (misal: "Menampilkan :from-:to dari :total :item")
    infoText: {
        type: String,
        default: '',
    },
    showingText: {
        type: String,
        default: 'Menampilkan',
    },
    toSeparator: {
        type: String,
        default: '-',
    },
    ofText: {
        type: String,
        default: 'dari',
    },
    // Tipe Navigasi: 'full' | 'arrows-only' | 'prev-next-only' | 'numbers-only' | 'simple'
    navType: {
        type: String,
        default: 'full',
        validator: (v) => ['full', 'arrows-only', 'prev-next-only', 'numbers-only', 'simple'].includes(v),
    },
    simple: {
        type: Boolean,
        default: false,
    },
    clientSide: {
        type: Boolean,
        default: false,
    },
    // Inertia.js Scroll Preservation: mencegah scroll melompat ke atas saat navigasi
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
    // Windowing Pagination: Boundary (ujung awal & akhir) dan Sibling (di sekitar halaman aktif)
    boundaryCount: {
        type: Number,
        default: 1,
    },
    siblingCount: {
        type: Number,
        default: 1,
    },
    // Pilar 1: Warna
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    // Pilar 2: Bentuk & Tampilan
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
    // Pilar 3: Teks Konten Tombol
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
    // Fitur Batas Baris Per-Page
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
        default: () => [5, 10, 25, 50, 100],
    },
    allowCustomPerPage: {
        type: Boolean,
        default: true,
    },
    // Fitur Lompat Halaman
    showJump: {
        type: Boolean,
        default: false,
    },
    showJumpPage: {
        type: Boolean,
        default: false,
    },
    jumpPlaceholder: {
        type: String,
        default: '#',
    },
    jumpButtonText: {
        type: String,
        default: 'Go',
    },
    // Container Alignment
    align: {
        type: String,
        default: 'between',
        validator: (v) => ['between', 'center', 'start', 'end'].includes(v),
    },
});

const emit = defineEmits(['change', 'page-change', 'update:perPage', 'per-page-change']);

const uid = useId ? useId() : Math.random().toString(36).substring(2, 9);
const jumpInput = ref('');
const isCustomPerPageActive = ref(false);
const customPerPageValue = ref('');

const currentPage = computed(() => Number(props.data?.current_page) || 1);
const lastPage = computed(() => Math.max(1, Number(props.data?.last_page) || 1));
const totalItems = computed(() => Number(props.data?.total) || 0);

const hasPrev = computed(() => currentPage.value > 1 && !props.loading);
const hasNext = computed(() => currentPage.value < lastPage.value && !props.loading);
const isJumpActive = computed(() => props.showJump || props.showJumpPage);

// Mode navigasi efektif
const effectiveNavType = computed(() => {
    if (props.simple) return 'simple';
    return props.navType;
});

// Ringkasan data teks yang dapat dikonfigurasi sepenuhnya
const formattedInfoSummary = computed(() => {
    const fromVal = props.data?.from != null ? props.data.from : (totalItems.value > 0 ? 1 : 0);
    const toVal = props.data?.to != null ? props.data.to : totalItems.value;
    const totalVal = totalItems.value;
    const itemVal = (props.item && props.item.trim() !== '') ? props.item : (props.itemName || 'Data');
    const pageVal = currentPage.value;
    const pagesVal = lastPage.value;

    if (props.infoText && props.infoText.trim() !== '') {
        const tokenMap = {
            ':total': String(totalVal),
            ':to': String(toVal),
            ':from': String(fromVal),
            ':pages': String(pagesVal),
            ':page': String(pageVal),
            ':item': itemVal,
        };
        return props.infoText.replace(/:(total|to|from|pages|page|item)\b/g, (match) => tokenMap[match] ?? match);
    }

    return `${props.showingText} ${fromVal} ${props.toSeparator} ${toVal} ${props.ofText} ${totalVal} ${itemVal}`;
});

// Persentase progress untuk mode simple
const progressPercent = computed(() => {
    if (lastPage.value <= 1) return 100;
    return Math.min(100, Math.max(0, Math.round((currentPage.value / lastPage.value) * 100)));
});

// Normalisasi opsi perPage untuk InputSelect
const formattedPerPageOptions = computed(() => {
    const raw = props.perPageOptions || [5, 10, 25, 50, 100];
    const opts = [...raw];
    const currentVal = Number(props.perPage);
    
    const exists = opts.some(o => {
        const val = typeof o === 'object' && o !== null ? Number(o.value) : Number(o);
        return val === currentVal;
    });
    if (!exists && !isNaN(currentVal) && currentVal > 0) {
        opts.unshift(currentVal);
    }
    
    opts.sort((a, b) => {
        const vA = typeof a === 'object' && a !== null ? Number(a.value) : Number(a);
        const vB = typeof b === 'object' && b !== null ? Number(b.value) : Number(b);
        return vA - vB;
    });

    return opts.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
            return opt;
        }
        return {
            value: Number(opt),
            label: `${opt} / hal`,
        };
    });
});

// Safe SSR-friendly URL builder
const getPageUrl = (page) => {
    if (!page || page === '...' || props.loading) return 'javascript:void(0)';
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

// Windowing Pagination Pages (Awal [boundaryCount], Tengah [siblingCount], Akhir [boundaryCount])
const paginationPages = computed(() => {
    const current = currentPage.value;
    const count = lastPage.value;
    const boundary = Math.max(0, Number(props.boundaryCount) || 1);
    const sibling = Math.max(0, Number(props.siblingCount) || 1);

    if (count <= 1) return [1];

    const range = (start, end) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const startPages = range(1, Math.min(boundary, count));
    const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

    const siblingsStart = Math.max(
        Math.min(
            current - sibling,
            count - boundary - sibling * 2 - 1
        ),
        boundary + 2
    );

    const siblingsEnd = Math.min(
        Math.max(
            current + sibling,
            boundary + sibling * 2 + 2
        ),
        endPages.length > 0 ? endPages[0] - 2 : count - 1
    );

    const itemList = [
        ...startPages,
        ...(siblingsStart > boundary + 2
            ? ['...']
            : boundary + 1 < count - boundary
                ? [boundary + 1]
                : []),
        ...(siblingsStart <= siblingsEnd ? range(siblingsStart, siblingsEnd) : []),
        ...(siblingsEnd < count - boundary - 1
            ? ['...']
            : count - boundary > boundary
                ? [count - boundary]
                : []),
        ...endPages,
    ];

    const uniquePages = [];
    let prev = null;
    for (const item of itemList) {
        if (item === '...') {
            if (prev !== '...') uniquePages.push(item);
        } else if (!uniquePages.includes(item)) {
            uniquePages.push(item);
        }
        prev = item;
    }

    return uniquePages;
});

const handlePageClick = (page) => {
    if (props.loading || page === '...' || page === currentPage.value) return;
    emit('change', page);
    emit('page-change', page);
};

const handlePerPageChange = (val) => {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
        emit('update:perPage', num);
        emit('per-page-change', num);
    }
};

const handleApplyCustomPerPage = () => {
    const val = parseInt(customPerPageValue.value, 10);
    if (!isNaN(val) && val > 0) {
        handlePerPageChange(val);
        isCustomPerPageActive.value = false;
        customPerPageValue.value = '';
    }
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
            badge: 'primary',
            progressBar: 'bg-blue-600 dark:bg-blue-500',
        },
        indigo: {
            active: 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30 dark:bg-indigo-600 dark:border-indigo-600',
            activeSubtle: 'bg-indigo-50 text-indigo-700 font-bold border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
            focus: 'focus-visible:ring-indigo-500/30',
            borderFocus: 'focus:border-indigo-500',
            btnAccent: 'hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400',
            badge: 'indigo',
            progressBar: 'bg-indigo-600 dark:bg-indigo-500',
        },
        emerald: {
            active: 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30 dark:bg-emerald-600 dark:border-emerald-600',
            activeSubtle: 'bg-emerald-50 text-emerald-700 font-bold border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
            focus: 'focus-visible:ring-emerald-500/30',
            borderFocus: 'focus:border-emerald-500',
            btnAccent: 'hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400',
            badge: 'success',
            progressBar: 'bg-emerald-600 dark:bg-emerald-500',
        },
        purple: {
            active: 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30 dark:bg-purple-600 dark:border-purple-600',
            activeSubtle: 'bg-purple-50 text-purple-700 font-bold border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
            focus: 'focus-visible:ring-purple-500/30',
            borderFocus: 'focus:border-purple-500',
            btnAccent: 'hover:border-purple-500/60 hover:text-purple-600 dark:hover:text-purple-400',
            badge: 'purple',
            progressBar: 'bg-purple-600 dark:bg-purple-500',
        },
        amber: {
            active: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30 dark:bg-amber-500 dark:border-amber-500',
            activeSubtle: 'bg-amber-50 text-amber-700 font-bold border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            focus: 'focus-visible:ring-amber-500/30',
            borderFocus: 'focus:border-amber-500',
            btnAccent: 'hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-400',
            badge: 'warning',
            progressBar: 'bg-amber-500 dark:bg-amber-400',
        },
        rose: {
            active: 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/30 dark:bg-rose-600 dark:border-rose-600',
            activeSubtle: 'bg-rose-50 text-rose-700 font-bold border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
            focus: 'focus-visible:ring-rose-500/30',
            borderFocus: 'focus:border-rose-500',
            btnAccent: 'hover:border-rose-500/60 hover:text-rose-600 dark:hover:text-rose-400',
            badge: 'danger',
            progressBar: 'bg-rose-600 dark:bg-rose-500',
        },
        cyan: {
            active: 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-500/30 dark:bg-cyan-600 dark:border-cyan-600',
            activeSubtle: 'bg-cyan-50 text-cyan-700 font-bold border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
            focus: 'focus-visible:ring-cyan-500/30',
            borderFocus: 'focus:border-cyan-500',
            btnAccent: 'hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400',
            badge: 'cyan',
            progressBar: 'bg-cyan-600 dark:bg-cyan-500',
        },
        dark: {
            active: 'bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-900/30 dark:bg-white dark:text-slate-900 dark:border-white',
            activeSubtle: 'bg-slate-100 text-slate-900 font-bold border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600',
            focus: 'focus-visible:ring-slate-500/30',
            borderFocus: 'focus:border-slate-500',
            btnAccent: 'hover:border-slate-600 hover:text-slate-900 dark:hover:text-white',
            badge: 'neutral',
            progressBar: 'bg-slate-900 dark:bg-slate-100',
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
            btn: 'h-7 min-w-[28px] px-2 text-xs sm:text-[11px]',
            navBtn: 'h-7 px-2 text-xs sm:text-[11px] gap-1',
            icon: 'text-[15px]',
            input: 'h-7 w-12 text-xs',
            select: 'h-7 text-xs',
        },
        md: {
            btn: 'h-8 min-w-[32px] px-2.5 text-xs',
            navBtn: 'h-8 px-2.5 sm:px-3 text-xs gap-1',
            icon: 'text-base',
            input: 'h-8 w-14 text-xs',
            select: 'h-8 text-xs',
        },
        lg: {
            btn: 'h-9 min-w-[36px] px-3 text-sm',
            navBtn: 'h-9 px-3 sm:px-3.5 text-sm gap-1.5',
            icon: 'text-lg',
            input: 'h-9 w-16 text-sm',
            select: 'h-9 text-sm',
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

defineExpose({
    currentPage,
    lastPage,
    totalItems,
    handlePageClick,
    handleJump,
    handlePerPageChange,
});
</script>

<template>
    <nav
        v-if="data && (totalItems > 0 || lastPage > 1)"
        aria-label="Pagination Navigation"
        :class="[
            'w-full select-none transition-all duration-200',
            variant === 'card'
                ? 'p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/40 dark:shadow-none'
                : ''
        ]"
    >
        <!-- Kontainer Fleksibel Responsif: Desktop Luas (1 Baris) atau Layar Kompak Tablet/Mobile (Stack Rapi) -->
        <div :class="['flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 w-full', alignmentClass]">
            
            <!-- Sisi Info & Per-Page: Muncul di bawah pada mobile, di kiri pada desktop -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 order-2 lg:order-1 text-center sm:text-left shrink-0 relative z-30">
                <!-- Slot / Komponen Ringkasan Data -->
                <slot
                    name="info"
                    :from="data.from || (totalItems > 0 ? 1 : 0)"
                    :to="data.to || totalItems"
                    :total="totalItems"
                    :item-name="itemName"
                    :current-page="currentPage"
                    :last-page="lastPage"
                    :formatted="formattedInfoSummary"
                >
                    <span v-if="showInfo" class="inline-flex items-center gap-1.5 flex-wrap justify-center font-medium">
                        <template v-if="infoText">
                            <span>{{ formattedInfoSummary }}</span>
                        </template>
                        <template v-else>
                            <span>{{ showingText }}</span>
                            <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.from || (totalItems > 0 ? 1 : 0) }}</strong>
                            <span>{{ toSeparator }}</span>
                            <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ data.to || totalItems }}</strong>
                            <span>{{ ofText }}</span>
                            <strong class="font-semibold text-slate-800 dark:text-slate-200">{{ totalItems }}</strong>
                            <span>{{ itemName }}</span>
                        </template>
                    </span>
                </slot>

                <!-- Selector Per-Page Redesigned: Dropdown + Custom Direct Input -->
                <slot name="per-page" :per-page="perPage" :options="formattedPerPageOptions" :loading="loading">
                    <div v-if="showPerPage" class="inline-flex items-center gap-1.5 ml-1 shrink-0 relative z-30">
                        <label :for="`pagination-per-page-${uid}`" class="text-slate-400 dark:text-slate-500 text-[11px] whitespace-nowrap">Batas:</label>
                        
                        <!-- Mode Kustom Input Langsung -->
                        <div v-if="isCustomPerPageActive" class="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                            <input
                                v-model="customPerPageValue"
                                type="number"
                                min="1"
                                max="1000"
                                placeholder="Angka"
                                :disabled="loading"
                                class="w-14 h-6 text-xs text-center font-medium bg-white dark:bg-slate-900 border-none rounded focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                                @keydown.enter="handleApplyCustomPerPage"
                            />
                            <button
                                type="button"
                                @click="handleApplyCustomPerPage"
                                :disabled="!customPerPageValue || loading"
                                class="h-6 w-6 inline-flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 disabled:opacity-40 cursor-pointer"
                                title="Terapkan angka batas per halaman"
                            >
                                <span class="material-symbols-outlined text-[15px]">check</span>
                            </button>
                            <button
                                type="button"
                                @click="isCustomPerPageActive = false"
                                class="h-6 w-6 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer"
                                title="Kembali ke pilihan dropdown"
                            >
                                <span class="material-symbols-outlined text-[15px]">close</span>
                            </button>
                        </div>

                        <!-- Mode Dropdown Standar -->
                        <div v-else class="inline-flex items-center gap-1 relative z-30">
                            <div class="w-24 relative z-30">
                                <InputSelect
                                    :id="`pagination-per-page-${uid}`"
                                    :model-value="perPage"
                                    :options="formattedPerPageOptions"
                                    size="sm"
                                    :disabled="loading"
                                    :searchable="false"
                                    :clearable="false"
                                    placeholder="Hal"
                                    placement="top"
                                    dropdown-z-index="z-[9999]"
                                    @update:model-value="handlePerPageChange"
                                />
                            </div>
                            <button
                                v-if="allowCustomPerPage"
                                type="button"
                                @click="isCustomPerPageActive = true; customPerPageValue = String(perPage)"
                                class="h-7 px-1.5 inline-flex items-center justify-center text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-md hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer"
                                title="Masukkan angka per halaman bebas"
                            >
                                <span class="material-symbols-outlined text-[13px] mr-0.5">edit</span>
                                Kustom
                            </button>
                        </div>
                    </div>
                </slot>
            </div>

            <!-- Sisi Navigasi Tombol & Lompat Halaman -->
            <div class="flex items-center justify-center gap-2 sm:gap-2.5 order-1 lg:order-2 shrink-0 flex-nowrap py-0.5">
                
                <!-- BILAH TOMBOL NAVIGASI PAGINASI (ANTI-WRAP) -->
                <div class="inline-flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0">
                    
                    <!-- 1. VARIAN JOINED (Segmented Control Bar Terpadu) -->
                    <div
                        v-if="variant === 'joined'"
                        :class="[
                            'inline-flex items-stretch border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs divide-x divide-slate-200 dark:divide-slate-700 overflow-hidden flex-nowrap',
                            radiusClasses
                        ]"
                    >
                        <!-- First Page Button (Hanya jika showFirstLast dan navType mendukung) -->
                        <component
                            v-if="showFirstLast && ['full', 'arrows-only'].includes(effectiveNavType)"
                            :is="clientSide || !hasPrev ? 'button' : Link"
                            :type="clientSide || !hasPrev ? 'button' : undefined"
                            :href="!clientSide && hasPrev ? firstUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasPrev ? handlePageClick(1) : null"
                            :disabled="!hasPrev || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 shrink-0',
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
                            <span class="sr-only">{{ firstText }}</span>
                        </component>

                        <!-- Prev Button (Kecuali numbers-only) -->
                        <component
                            v-if="effectiveNavType !== 'numbers-only'"
                            :is="clientSide || !hasPrev ? 'button' : Link"
                            :type="clientSide || !hasPrev ? 'button' : undefined"
                            :href="!clientSide && hasPrev ? prevUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasPrev ? handlePageClick(currentPage - 1) : null"
                            :disabled="!hasPrev || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 shrink-0',
                                sizeClasses.navBtn,
                                themeClasses.focus,
                                hasPrev && !loading
                                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                            ]"
                            aria-label="Halaman Sebelumnya"
                        >
                            <span v-if="effectiveNavType !== 'prev-next-only'" class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ prevIcon }}</span>
                            <span v-if="effectiveNavType === 'prev-next-only' || showButtonText" :class="effectiveNavType === 'prev-next-only' ? 'inline' : 'hidden sm:inline'">{{ prevText }}</span>
                        </component>

                        <!-- Simple Mode: Modern Indicator Capsule -->
                        <div v-if="effectiveNavType === 'simple'" class="inline-flex flex-col items-center justify-center px-3 py-1 shrink-0 min-w-22.5">
                            <div class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                <span>Hal. {{ currentPage }}</span>
                                <span class="text-slate-400">/</span>
                                <span>{{ lastPage }}</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-700/60 h-1 rounded-full overflow-hidden mt-0.5">
                                <div :class="['h-full transition-all duration-300', themeClasses.progressBar]" :style="{ width: `${progressPercent}%` }"></div>
                            </div>
                        </div>

                        <!-- Page Numbers (Hanya untuk navType 'full' atau 'numbers-only') -->
                        <template v-else-if="['full', 'numbers-only'].includes(effectiveNavType)">
                            <template v-for="(page, idx) in paginationPages" :key="idx">
                                <span
                                    v-if="page === '...'"
                                    :class="[
                                        'inline-flex items-center justify-center font-bold text-slate-400 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-900/20 shrink-0',
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
                                        'items-center justify-center font-medium transition-colors select-none focus-visible:outline-hidden shrink-0 inline-flex',
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

                        <!-- Next Button (Kecuali numbers-only) -->
                        <component
                            v-if="effectiveNavType !== 'numbers-only'"
                            :is="clientSide || !hasNext ? 'button' : Link"
                            :type="clientSide || !hasNext ? 'button' : undefined"
                            :href="!clientSide && hasNext ? nextUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasNext ? handlePageClick(currentPage + 1) : null"
                            :disabled="!hasNext || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 shrink-0',
                                sizeClasses.navBtn,
                                themeClasses.focus,
                                hasNext && !loading
                                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                            ]"
                            aria-label="Halaman Selanjutnya"
                        >
                            <span v-if="effectiveNavType === 'prev-next-only' || showButtonText" :class="effectiveNavType === 'prev-next-only' ? 'inline' : 'hidden sm:inline'">{{ nextText }}</span>
                            <span v-if="effectiveNavType !== 'prev-next-only'" class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ nextIcon }}</span>
                        </component>

                        <!-- Last Page Button (Hanya jika showFirstLast dan navType mendukung) -->
                        <component
                            v-if="showFirstLast && ['full', 'arrows-only'].includes(effectiveNavType)"
                            :is="clientSide || !hasNext ? 'button' : Link"
                            :type="clientSide || !hasNext ? 'button' : undefined"
                            :href="!clientSide && hasNext ? lastUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasNext ? handlePageClick(lastPage) : null"
                            :disabled="!hasNext || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 shrink-0',
                                sizeClasses.navBtn,
                                themeClasses.focus,
                                hasNext && !loading
                                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                                    : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed pointer-events-none'
                            ]"
                            title="Halaman Terakhir"
                            aria-label="Halaman Terakhir"
                        >
                            <span class="sr-only">{{ lastText }}</span>
                            <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ lastIcon }}</span>
                        </component>
                    </div>

                    <!-- 2. VARIAN DEFAULT, PILLS, FLAT, & CARD (Tombol Mandiri Berestetika Tinggi) -->
                    <div v-else class="inline-flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0">
                        <!-- First Page Button -->
                        <component
                            v-if="showFirstLast && ['full', 'arrows-only'].includes(effectiveNavType)"
                            :is="clientSide || !hasPrev ? 'button' : Link"
                            :type="clientSide || !hasPrev ? 'button' : undefined"
                            :href="!clientSide && hasPrev ? firstUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasPrev ? handlePageClick(1) : null"
                            :disabled="!hasPrev || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95 shrink-0',
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
                            <span class="sr-only">{{ firstText }}</span>
                        </component>

                        <!-- Prev Button -->
                        <component
                            v-if="effectiveNavType !== 'numbers-only'"
                            :is="clientSide || !hasPrev ? 'button' : Link"
                            :type="clientSide || !hasPrev ? 'button' : undefined"
                            :href="!clientSide && hasPrev ? prevUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasPrev ? handlePageClick(currentPage - 1) : null"
                            :disabled="!hasPrev || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95 shrink-0',
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
                            <span v-if="effectiveNavType !== 'prev-next-only'" class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ prevIcon }}</span>
                            <span v-if="effectiveNavType === 'prev-next-only' || showButtonText" :class="effectiveNavType === 'prev-next-only' ? 'inline' : 'hidden sm:inline'">{{ prevText }}</span>
                        </component>

                        <!-- Simple Mode: Modern Indicator Capsule -->
                        <div
                            v-if="effectiveNavType === 'simple'"
                            class="inline-flex flex-col items-center justify-center px-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl shrink-0 min-w-23.75"
                        >
                            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <span>Hal. {{ currentPage }}</span>
                                <span class="text-slate-400">/</span>
                                <span class="text-slate-500 dark:text-slate-400">{{ lastPage }}</span>
                            </div>
                            <div class="w-full bg-slate-200/80 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                                <div :class="['h-full transition-all duration-300', themeClasses.progressBar]" :style="{ width: `${progressPercent}%` }"></div>
                            </div>
                        </div>

                        <!-- Page Numbers (Hanya untuk navType 'full' atau 'numbers-only') -->
                        <template v-else-if="['full', 'numbers-only'].includes(effectiveNavType)">
                            <template v-for="(page, idx) in paginationPages" :key="idx">
                                <!-- Ellipsis -->
                                <span
                                    v-if="page === '...'"
                                    :class="[
                                        'inline-flex items-center justify-center font-bold text-slate-400 dark:text-slate-600 shrink-0',
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
                                        'items-center justify-center transition-all duration-150 select-none focus-visible:outline-hidden focus-visible:ring-2 active:scale-95 shrink-0 inline-flex',
                                        sizeClasses.btn,
                                        radiusClasses,
                                        themeClasses.focus,
                                        variant === 'flat'
                                            ? page === currentPage
                                                ? [themeClasses.activeSubtle, 'border cursor-default font-bold']
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

                        <!-- Next Button -->
                        <component
                            v-if="effectiveNavType !== 'numbers-only'"
                            :is="clientSide || !hasNext ? 'button' : Link"
                            :type="clientSide || !hasNext ? 'button' : undefined"
                            :href="!clientSide && hasNext ? nextUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasNext ? handlePageClick(currentPage + 1) : null"
                            :disabled="!hasNext || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95 shrink-0',
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
                            <span v-if="effectiveNavType === 'prev-next-only' || showButtonText" :class="effectiveNavType === 'prev-next-only' ? 'inline' : 'hidden sm:inline'">{{ nextText }}</span>
                            <span v-if="effectiveNavType !== 'prev-next-only'" class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ nextIcon }}</span>
                        </component>

                        <!-- Last Page Button -->
                        <component
                            v-if="showFirstLast && ['full', 'arrows-only'].includes(effectiveNavType)"
                            :is="clientSide || !hasNext ? 'button' : Link"
                            :type="clientSide || !hasNext ? 'button' : undefined"
                            :href="!clientSide && hasNext ? lastUrl : undefined"
                            :preserve-scroll="preserveScroll"
                            :preserve-state="preserveState"
                            @click="clientSide && hasNext ? handlePageClick(lastPage) : null"
                            :disabled="!hasNext || loading"
                            :class="[
                                'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 active:scale-95 shrink-0',
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
                            <span class="sr-only">{{ lastText }}</span>
                            <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ lastIcon }}</span>
                        </component>
                    </div>
                </div>

                <!-- JUMP TO PAGE INPUT (Segmented Pill Redesigned) -->
                <slot name="jump" :current-page="currentPage" :last-page="lastPage" :handle-jump="handleJump">
                    <div
                        v-if="isJumpActive && lastPage > 1"
                        class="inline-flex items-center gap-1 pl-2 sm:pl-2.5 border-l border-slate-200 dark:border-slate-700 shrink-0"
                    >
                        <div class="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                            <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 pl-1.5 pr-0.5 select-none">Hal:</span>
                            <input
                                v-model="jumpInput"
                                type="number"
                                :min="1"
                                :max="lastPage"
                                :placeholder="jumpPlaceholder"
                                :disabled="loading"
                                class="w-11 sm:w-13 h-7 text-xs text-center font-semibold bg-white dark:bg-slate-900 border-none rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 shadow-2xs"
                                @keydown.enter="handleJump"
                                aria-label="Lompat ke nomor halaman"
                            />
                            <button
                                type="button"
                                @click="handleJump"
                                :disabled="loading || !jumpInput"
                                :class="[
                                    'h-7 px-2 inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ml-0.5',
                                    jumpInput && !loading
                                        ? [themeClasses.active, 'cursor-pointer']
                                        : 'bg-slate-200/60 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                                ]"
                                aria-label="Lompat"
                            >
                                <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </slot>
            </div>
        </div>
    </nav>
</template>
