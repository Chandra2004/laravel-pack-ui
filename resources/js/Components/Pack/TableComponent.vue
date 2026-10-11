<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';
import Badge from './Badge.vue';
import ButtonSubmit from './ButtonSubmit.vue';
import Skeleton from './Skeleton.vue';
import Pagination from './Pagination.vue';

const props = defineProps({
    /**
     * 3. TEKS KONTEN: Array data tabel
     */
    items: {
        type: Array,
        default: () => [],
    },
    /**
     * 3. TEKS KONTEN: Judul dan deskripsi tabel opsional di header atas
     */
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    /**
     * State loading manual
     */
    loading: {
        type: Boolean,
        default: false,
    },
    /**
     * Otomatis tampilkan skeleton saat items berubah (search, pagination, dll)
     */
    autoLoading: {
        type: Boolean,
        default: true,
    },
    autoLoadingDuration: {
        type: Number,
        default: 300,
    },
    /**
     * Otomatis tangkap loading saat berpindah halaman via Inertia request
     */
    watchInertia: {
        type: Boolean,
        default: true,
    },
    skeletonRows: {
        type: Number,
        default: 5,
    },
    skeletonCols: {
        type: Number,
        default: 4,
    },
    /**
     * 3. TEKS KONTEN & 4. ICON: Konfigurasi Empty State
     */
    emptyTitle: {
        type: String,
        default: 'Tidak Ada Data',
    },
    emptyMessage: {
        type: String,
        default: 'Belum ada data yang tersedia untuk ditampilkan saat ini.',
    },
    emptyIcon: {
        type: String,
        default: 'inbox',
    },
    emptyActionText: {
        type: String,
        default: '',
    },
    emptyActionIcon: {
        type: String,
        default: 'refresh',
    },
    colspan: {
        type: [Number, String],
        default: null,
    },
    /**
     * 1. WARNA: Palet aksen warna semantik tabel (hover row, selection, checkbox, skeleton)
     */
    color: {
        type: String,
        default: 'primary',
        validator: (val) => [
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
            'dark', 'slate'
        ].includes(val),
    },
    /**
     * 2. BENTUK: Kelengkungan sudut container tabel (border-radius)
     */
    radius: {
        type: String,
        default: '2xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(val),
    },
    /**
     * 2. BENTUK: Skala ukuran tabel ('sm', 'md', 'lg')
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    /**
     * 2. BENTUK: Bayangan kontainer tabel
     */
    shadow: {
        type: String,
        default: '2xs',
        validator: (val) => ['none', '2xs', 'xs', 'sm', 'md'].includes(val),
    },
    /**
     * 5. RESPONSIF: Aktifkan scroll horizontal responsif
     */
    responsive: {
        type: Boolean,
        default: true,
    },
    /**
     * 5. RESPONSIF: Tampilkan indikator visual gradient overflow saat tabel dapat di-scroll
     */
    scrollIndicator: {
        type: Boolean,
        default: true,
    },
    /**
     * Efek highlight saat baris di-hover
     */
    hoverable: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilan belang-belang (*zebra rows*)
     */
    striped: {
        type: Boolean,
        default: false,
    },
    /**
     * Mode rapat (*compact padding* - backward compatibility)
     */
    compact: {
        type: Boolean,
        default: false,
    },
    /**
     * Hilangkan border dan shadow luar kontainer
     */
    borderless: {
        type: Boolean,
        default: false,
    },
    /**
     * Header tabel tetap di atas saat di-scroll vertikal
     */
    stickyHeader: {
        type: Boolean,
        default: false,
    },
    /**
     * 5. RESPONSIF: Kunci kolom pertama (ID/Checkbox) saat tabel di-scroll horizontal
     */
    stickyFirstColumn: {
        type: Boolean,
        default: false,
    },
    /**
     * Maksimal tinggi tabel untuk scroll vertikal mandiri (cth: '400px', '65vh')
     */
    maxHeight: {
        type: [String, Number],
        default: null,
    },
    /**
     * Baris data dapat dipilih dengan checkbox
     */
    selectable: {
        type: Boolean,
        default: false,
    },
    selected: {
        type: Array,
        default: () => [],
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    clickableRows: {
        type: Boolean,
        default: false,
    },
    /**
     * Objek Paginator Laravel atau Mock Client-Side Pagination
     */
    pagination: {
        type: Object,
        default: null,
    },
    paginationProps: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits([
    'update:loading',
    'update:selected',
    'row-click',
    'select',
    'select-all',
    'empty-action',
    'page-change',
    'update:perPage',
    'per-page-change',
]);

const internalLoading = ref(false);
let loadingTimeout = null;
let inertiaStartUnregister = null;
let inertiaFinishUnregister = null;

// Ref Scroll Track untuk Overflow Indicator
const scrollWrapperRef = ref(null);
const tableElementRef = ref(null);
const canScrollRight = ref(false);
const canScrollLeft = ref(false);
const detectedColCount = ref(0);
let resizeObserver = null;

const updateScrollIndicator = () => {
    if (!scrollWrapperRef.value || !props.scrollIndicator) return;
    const { scrollLeft: sLeft, scrollWidth, clientWidth } = scrollWrapperRef.value;
    canScrollLeft.value = sLeft > 6;
    canScrollRight.value = sLeft + clientWidth < scrollWidth - 6;
};

const scrollLeft = () => {
    if (scrollWrapperRef.value) {
        scrollWrapperRef.value.scrollBy({ left: -260, behavior: 'smooth' });
    }
};

const scrollRight = () => {
    if (scrollWrapperRef.value) {
        scrollWrapperRef.value.scrollBy({ left: 260, behavior: 'smooth' });
    }
};

const updateColCount = () => {
    if (tableElementRef.value) {
        const ths = tableElementRef.value.querySelectorAll('thead tr:first-child th');
        if (ths && ths.length > 0) {
            detectedColCount.value = ths.length;
        }
    }
};

// Gabungan state loading manual prop & otomatis (transisi / Inertia)
const isLoading = computed(() => props.loading || internalLoading.value);

const startLoading = () => {
    internalLoading.value = true;
};

const stopLoading = () => {
    internalLoading.value = false;
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }
};

// 1. Auto-Skeleton saat data items berubah (search filter, client-side pagination, dll)
watch(
    () => props.items,
    () => {
        nextTick(updateColCount);
        if (props.autoLoading && !props.loading) {
            internalLoading.value = true;
            if (loadingTimeout) clearTimeout(loadingTimeout);
            loadingTimeout = setTimeout(() => {
                internalLoading.value = false;
                loadingTimeout = null;
                updateScrollIndicator();
            }, props.autoLoadingDuration);
        } else {
            setTimeout(updateScrollIndicator, 50);
        }
    },
    { deep: false }
);

watch(
    () => props.selectable,
    () => {
        nextTick(updateColCount);
    }
);

// 2. Auto-Skeleton saat navigasi berpindah halaman / submit form via Inertia
onMounted(() => {
    updateScrollIndicator();
    nextTick(() => {
        updateColCount();
        updateScrollIndicator();
    });
    window.addEventListener('resize', updateScrollIndicator);

    if (typeof ResizeObserver !== 'undefined' && scrollWrapperRef.value) {
        resizeObserver = new ResizeObserver(() => {
            updateScrollIndicator();
            updateColCount();
        });
        resizeObserver.observe(scrollWrapperRef.value);
        if (tableElementRef.value) {
            resizeObserver.observe(tableElementRef.value);
        }
    }

    if (props.watchInertia && typeof router !== 'undefined' && typeof router.on === 'function') {
        try {
            inertiaStartUnregister = router.on('start', () => {
                internalLoading.value = true;
            });
            inertiaFinishUnregister = router.on('finish', () => {
                internalLoading.value = false;
                setTimeout(updateScrollIndicator, 100);
            });
        } catch (e) {
            // Diluar context runtime Inertia
        }
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScrollIndicator);
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    if (loadingTimeout) clearTimeout(loadingTimeout);
    if (inertiaStartUnregister) inertiaStartUnregister();
    if (inertiaFinishUnregister) inertiaFinishUnregister();
});

// --- Selection Management ---
const selectedMap = computed(() => {
    const set = new Set();
    for (const item of props.selected) {
        const id = typeof item === 'object' && item !== null ? item[props.itemKey] : item;
        set.add(id);
    }
    return set;
});

const isAllSelected = computed(() => {
    if (!props.items || props.items.length === 0) return false;
    return props.items.every((item) => selectedMap.value.has(item[props.itemKey]));
});

const isSomeSelected = computed(() => {
    if (isAllSelected.value) return false;
    return props.items.some((item) => selectedMap.value.has(item[props.itemKey]));
});

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        emit('update:selected', []);
        emit('select-all', []);
    } else {
        const allItems = [...props.items];
        emit('update:selected', allItems);
        emit('select-all', allItems);
    }
};

const toggleSelectItem = (item) => {
    const key = item[props.itemKey];
    let newSelected = [...props.selected];
    const existsIndex = newSelected.findIndex((s) => (typeof s === 'object' && s !== null ? s[props.itemKey] === key : s === key));

    if (existsIndex > -1) {
        newSelected.splice(existsIndex, 1);
    } else {
        newSelected.push(item);
    }

    emit('update:selected', newSelected);
    emit('select', { item, selected: existsIndex === -1 });
};

const clearSelection = () => {
    emit('update:selected', []);
    emit('select-all', []);
};

// --- Row Click Event ---
const handleRowClick = (item, index, event) => {
    if (event.target.closest('button, a, input, select, textarea, label')) {
        return;
    }
    emit('row-click', { item, index });
};

// --- 1. WARNA: Normalisasi Color & Style Presets ---
const normalizedColor = computed(() => {
    const map = {
        blue: 'primary',
        success: 'emerald',
        danger: 'rose',
        warning: 'amber',
        sky: 'cyan',
        violet: 'purple',
    };
    return map[props.color] || props.color || 'primary';
});

const colorClasses = computed(() => {
    const c = normalizedColor.value;
    const map = {
        primary: {
            hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
            selected: 'bg-blue-50/80 dark:bg-blue-950/40 font-medium',
            checkbox: 'text-blue-600 focus:ring-blue-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-500/20',
            badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
            icon: 'text-blue-600 dark:text-blue-400',
        },
        indigo: {
            hover: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
            selected: 'bg-indigo-50/80 dark:bg-indigo-950/40 font-medium',
            checkbox: 'text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-indigo-600 border-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20',
            badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
            icon: 'text-indigo-600 dark:text-indigo-400',
        },
        emerald: {
            hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
            selected: 'bg-emerald-50/80 dark:bg-emerald-950/40 font-medium',
            checkbox: 'text-emerald-600 focus:ring-emerald-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-emerald-600 border-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            icon: 'text-emerald-600 dark:text-emerald-400',
        },
        purple: {
            hover: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
            selected: 'bg-purple-50/80 dark:bg-purple-950/40 font-medium',
            checkbox: 'text-purple-600 focus:ring-purple-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-purple-600 border-purple-600 text-white shadow-xs ring-2 ring-purple-500/20',
            badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
            icon: 'text-purple-600 dark:text-purple-400',
        },
        amber: {
            hover: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
            selected: 'bg-amber-50/80 dark:bg-amber-950/40 font-medium',
            checkbox: 'text-amber-600 focus:ring-amber-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-amber-600 border-amber-600 text-white shadow-xs ring-2 ring-amber-500/20',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
            icon: 'text-amber-600 dark:text-amber-400',
        },
        rose: {
            hover: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
            selected: 'bg-rose-50/80 dark:bg-rose-950/40 font-medium',
            checkbox: 'text-rose-600 focus:ring-rose-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-rose-600 border-rose-600 text-white shadow-xs ring-2 ring-rose-500/20',
            badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            icon: 'text-rose-600 dark:text-rose-400',
        },
        cyan: {
            hover: 'hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20',
            selected: 'bg-cyan-50/80 dark:bg-cyan-950/40 font-medium',
            checkbox: 'text-cyan-600 focus:ring-cyan-500/20 border-slate-300 dark:border-slate-600',
            checkboxActive: 'bg-cyan-600 border-cyan-600 text-white shadow-xs ring-2 ring-cyan-500/20',
            badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
            icon: 'text-cyan-600 dark:text-cyan-400',
        },
        dark: {
            hover: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
            selected: 'bg-slate-100 dark:bg-slate-800/80 font-medium',
            checkbox: 'text-slate-900 dark:text-slate-100 focus:ring-slate-700 border-slate-400',
            checkboxActive: 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-xs ring-2 ring-slate-500/20',
            badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
            icon: 'text-slate-800 dark:text-slate-200',
        },
    };
    return map[c] || map.primary;
});

// --- 2. BENTUK: Helper Class Radius & Shadow ---
const getRadiusClass = (r) => {
    switch (r) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case '3xl': return 'rounded-3xl';
        case '2xl':
        default: return 'rounded-2xl';
    }
};

const getShadowClass = (s) => {
    switch (s) {
        case 'none': return '';
        case 'xs': return 'shadow-xs';
        case 'sm': return 'shadow-sm';
        case 'md': return 'shadow-md';
        case '2xs':
        default: return 'shadow-2xs';
    }
};

// --- 2. BENTUK: Ukuran Proporsional (Size Classes) ---
const effectiveSize = computed(() => {
    if (props.compact) return 'sm';
    return props.size;
});

const sizeStyles = computed(() => {
    switch (effectiveSize.value) {
        case 'sm':
            return {
                table: 'text-xs',
                th: 'px-3.5 py-2.5 text-[10px]',
                td: 'px-3.5 py-2.5',
                checkboxTh: 'w-9 px-3 py-2.5',
                checkboxTd: 'w-9 px-3 py-2.5',
                headerTitle: 'text-xs',
                headerSubtitle: 'text-[11px]',
                toolbar: 'px-4 py-3',
                footer: 'px-4 py-2.5',
                skeletonHeight: 'h-3.5',
            };
        case 'lg':
            return {
                table: 'text-sm sm:text-base',
                th: 'px-6 py-4 text-xs font-bold',
                td: 'px-6 py-4',
                checkboxTh: 'w-12 px-5 py-4',
                checkboxTd: 'w-12 px-5 py-4',
                headerTitle: 'text-base font-bold',
                headerSubtitle: 'text-xs',
                toolbar: 'px-6 py-4.5',
                footer: 'px-6 py-4',
                skeletonHeight: 'h-5',
            };
        case 'md':
        default:
            return {
                table: 'text-xs sm:text-sm',
                th: 'px-4 sm:px-5 py-3 text-[11px]',
                td: 'px-4 sm:px-5 py-3.5',
                checkboxTh: 'w-10 px-4 py-3.5',
                checkboxTd: 'w-10 px-4 py-3.5',
                headerTitle: 'text-sm font-bold',
                headerSubtitle: 'text-xs',
                toolbar: 'px-5 py-3.5',
                footer: 'px-5 py-3.5',
                skeletonHeight: 'h-4',
            };
    }
});

// Kontainer Utama
const containerClasses = computed(() => {
    const classes = ['bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200 w-full'];
    if (!props.borderless) {
        classes.push(
            'border border-slate-200/80 dark:border-slate-800',
            getRadiusClass(props.radius),
            getShadowClass(props.shadow)
        );
    }
    return classes.join(' ');
});

const effectiveScrollStyle = computed(() => {
    const style = {};
    const limit = props.maxHeight || (props.stickyHeader ? '500px' : null);
    if (limit) {
        style.maxHeight = typeof limit === 'number' ? `${limit}px` : limit;
        style.overflowY = 'auto';
    }
    return style;
});

const tableClasses = computed(() => {
    const classes = ['w-full text-left'];
    if (props.stickyHeader || props.stickyFirstColumn) {
        classes.push('border-separate border-spacing-0');
    } else {
        classes.push('border-collapse');
    }
    classes.push(sizeStyles.value.table);
    return classes.join(' ');
});

const theadClasses = computed(() => {
    const classes = [
        'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider select-none'
    ];
    if (props.stickyHeader) {
        classes.push('sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 shadow-[0_1px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]');
    } else {
        classes.push('border-b border-slate-200/80 dark:border-slate-800');
    }
    return classes.join(' ');
});

const getRowClasses = (item, index) => {
    const classes = ['transition-colors duration-150 group'];

    if (props.striped) {
        if (index % 2 === 1) {
            classes.push('bg-slate-50/50 dark:bg-slate-800/30');
        } else {
            classes.push('bg-white dark:bg-slate-900');
        }
    }

    if (props.hoverable) {
        classes.push(colorClasses.value.hover);
    }

    if (props.clickableRows) {
        classes.push('cursor-pointer');
    }

    const key = item[props.itemKey];
    if (props.selectable && selectedMap.value.has(key)) {
        classes.push(colorClasses.value.selected);
    }

    return classes.join(' ');
};

const getSkeletonColWidth = (colIndex) => {
    const widths = ['w-16', 'w-44', 'w-28', 'w-24', 'w-36', 'w-20'];
    return widths[colIndex % widths.length];
};

const totalCols = computed(() => {
    if (props.colspan) return Number(props.colspan);
    if (detectedColCount.value > 0) return detectedColCount.value;
    let count = props.skeletonCols;
    if (props.selectable) count += 1;
    // Standar HTML: colspan yang lebih besar dari jumlah kolom thead aktual
    // akan dibatasi browser selebar 100% dari kolom thead yang tersedia.
    return Math.max(count, 100);
});

// CSV Export Helper
const exportToCsv = (filename = 'export-table.csv') => {
    if (!props.items || props.items.length === 0) return;
    const headers = Object.keys(props.items[0]);
    const csvRows = [headers.join(',')];

    for (const row of props.items) {
        const values = headers.map((header) => {
            const val = row[header] ?? '';
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

defineExpose({
    startLoading,
    stopLoading,
    exportToCsv,
    clearSelection,
    toggleSelectAll,
    isLoading,
    scrollLeft,
    scrollRight,
    checkScroll: updateScrollIndicator,
});
</script>

<template>
    <div :class="containerClasses">
        <!-- 3. TEKS KONTEN: Header Judul & Subtitle Tabel Otomatis (jika didefinisikan) -->
        <div
            v-if="title || subtitle || $slots.title"
            class="border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900"
            :class="sizeStyles.toolbar"
        >
            <slot name="title">
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <span
                            v-if="icon"
                            class="material-symbols-outlined shrink-0 select-none"
                            :class="[sizeStyles.headerTitle, colorClasses.icon]"
                        >
                            {{ icon }}
                        </span>
                        <div>
                            <div v-if="title" class="text-slate-900 dark:text-white" :class="sizeStyles.headerTitle">
                                {{ title }}
                            </div>
                            <div v-if="subtitle" class="text-slate-500 dark:text-slate-400 mt-0.5" :class="sizeStyles.headerSubtitle">
                                {{ subtitle }}
                            </div>
                        </div>
                    </div>
                </div>
            </slot>
        </div>

        <!-- Toolbar Slot (Pencarian, Filter, Export Button) -->
        <div
            v-if="$slots.toolbar"
            class="border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900"
            :class="sizeStyles.toolbar"
        >
            <slot
                name="toolbar"
                :start-loading="startLoading"
                :stop-loading="stopLoading"
                :is-loading="isLoading"
                :export-csv="exportToCsv"
                :selected="selected"
                :count="selected.length"
            />
        </div>

        <!-- 3. TEKS KONTEN: Bulk Selection Actions Floating Bar -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div
                v-if="selectable && selected.length > 0"
                class="px-3 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
            >
                <div class="flex items-center gap-2.5">
                    <Badge :color="normalizedColor" variant="solid" size="xs">
                        {{ selected.length }} baris terpilih
                    </Badge>
                    <ButtonSubmit
                        type="button"
                        size="xs"
                        variant="ghost"
                        color="dark"
                        icon="close"
                        @click="clearSelection"
                    >
                        Batal Pilih
                    </ButtonSubmit>
                </div>

                <!-- Custom Bulk Action Buttons Slot -->
                <div class="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <slot
                        name="bulk-actions"
                        :selected="selected"
                        :count="selected.length"
                        :clear-selection="clearSelection"
                    />
                </div>
            </div>
        </Transition>

        <!-- 5. RESPONSIF: Table Wrapper dengan Overflow Indicator -->
        <div class="relative w-full">
            <div
                ref="scrollWrapperRef"
                @scroll="updateScrollIndicator"
                class="w-full"
                :class="[
                    responsive ? 'overflow-x-auto scrollbar-none' : '',
                    { 'table-sticky-first-col': stickyFirstColumn, 'table-selectable': selectable }
                ]"
                :style="effectiveScrollStyle"
            >
                <table ref="tableElementRef" :class="tableClasses">
                    <thead :class="theadClasses">
                        <tr>
                            <!-- Checkbox Select All Column -->
                            <th
                                v-if="selectable"
                                class="text-center select-none"
                                :class="[
                                    sizeStyles.checkboxTh,
                                    stickyFirstColumn ? 'sticky left-0 border-r border-slate-200/80 dark:border-slate-700/80' : '',
                                    stickyHeader ? 'sticky top-0' : '',
                                    stickyHeader && stickyFirstColumn ? 'z-40' : (stickyHeader ? 'z-20' : (stickyFirstColumn ? 'z-30' : '')),
                                    'bg-slate-50 dark:bg-slate-800'
                                ]"
                            >
                                <div class="flex items-center justify-center">
                                    <label
                                        class="relative inline-flex items-center justify-center cursor-pointer select-none group"
                                        :title="isAllSelected ? 'Batalkan semua pilihan' : 'Pilih semua baris'"
                                    >
                                        <input
                                            type="checkbox"
                                            :checked="isAllSelected"
                                            :indeterminate.prop="isSomeSelected"
                                            @change="toggleSelectAll"
                                            class="sr-only peer"
                                            aria-label="Pilih semua baris"
                                        />
                                        <div
                                            class="w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-150"
                                            :class="[
                                                isAllSelected || isSomeSelected
                                                    ? colorClasses.checkboxActive
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                                            ]"
                                        >
                                            <span
                                                v-if="isSomeSelected && !isAllSelected"
                                                class="material-symbols-outlined text-xs font-bold leading-none text-white select-none"
                                            >
                                                remove
                                            </span>
                                            <span
                                                v-else
                                                class="material-symbols-outlined text-xs font-bold leading-none text-white select-none transition-transform duration-150"
                                                :class="isAllSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                                            >
                                                check
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </th>

                            <!-- Slot Headers Kolom -->
                            <slot name="headers" />
                        </tr>
                    </thead>

                    <!-- Skeleton Loading State (Pack UI Skeleton Component) -->
                    <tbody v-if="isLoading" class="divide-y divide-slate-100 dark:divide-slate-800/60">
                        <slot
                            name="skeleton"
                            :rows="skeletonRows"
                            :cols="skeletonCols"
                            :color="normalizedColor"
                            :size="size"
                        >
                            <tr v-for="r in skeletonRows" :key="r" class="bg-white dark:bg-slate-900">
                                <td
                                    v-if="selectable"
                                    class="text-center"
                                    :class="[
                                        sizeStyles.checkboxTd,
                                        stickyFirstColumn ? 'sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800' : '',
                                    ]"
                                >
                                    <div class="flex items-center justify-center">
                                        <Skeleton variant="rounded" :color="normalizedColor" width="w-4" height="h-4" />
                                    </div>
                                </td>

                                <slot
                                    name="skeleton-row"
                                    :row-index="r"
                                    :cols="skeletonCols"
                                    :color="normalizedColor"
                                    :size="size"
                                >
                                    <td
                                        v-for="c in skeletonCols"
                                        :key="c"
                                        :class="sizeStyles.td"
                                    >
                                        <Skeleton
                                            variant="rounded"
                                            :color="normalizedColor"
                                            :width="getSkeletonColWidth(c)"
                                            :height="sizeStyles.skeletonHeight"
                                        />
                                    </td>
                                </slot>
                            </tr>
                        </slot>
                    </tbody>

                    <!-- Actual Data Rows -->
                    <tbody
                        v-else-if="items && items.length > 0"
                        class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300"
                    >
                        <tr
                            v-for="(item, index) in items"
                            :key="item[itemKey] ?? item.id ?? item.uuid ?? index"
                            :class="getRowClasses(item, index)"
                            @click="handleRowClick(item, index, $event)"
                        >
                            <!-- Row Selection Checkbox -->
                            <td
                                v-if="selectable"
                                class="text-center"
                                :class="[
                                    sizeStyles.checkboxTd,
                                    stickyFirstColumn ? 'sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800' : '',
                                    selectedMap.has(item[itemKey]) ? colorClasses.selected : '',
                                ]"
                                @click.stop
                            >
                                <div class="flex items-center justify-center">
                                    <label
                                        class="relative inline-flex items-center justify-center cursor-pointer select-none group"
                                        :title="`Pilih baris ${index + 1}`"
                                    >
                                        <input
                                            type="checkbox"
                                            :checked="selectedMap.has(item[itemKey])"
                                            @change="toggleSelectItem(item)"
                                            class="sr-only peer"
                                            :aria-label="`Pilih baris ${index + 1}`"
                                        />
                                        <div
                                            class="w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-150"
                                            :class="[
                                                selectedMap.has(item[itemKey])
                                                    ? colorClasses.checkboxActive
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                                            ]"
                                        >
                                            <span
                                                class="material-symbols-outlined text-xs font-bold leading-none text-white select-none transition-transform duration-150"
                                                :class="selectedMap.has(item[itemKey]) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                                            >
                                                check
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </td>

                            <!-- Slot Row Scoped -->
                            <slot
                                name="row"
                                :item="item"
                                :index="index"
                                :selected="selectedMap.has(item[itemKey])"
                            />
                        </tr>
                    </tbody>

                    <!-- Empty State -->
                    <tbody v-else>
                        <tr>
                            <td
                                :colspan="totalCols"
                                class="px-6 py-12 sm:py-16 text-center bg-white dark:bg-slate-900"
                            >
                                <slot
                                    name="empty"
                                    :title="emptyTitle"
                                    :message="emptyMessage"
                                    :icon="emptyIcon"
                                    :action-text="emptyActionText"
                                    :action-icon="emptyActionIcon"
                                >
                                    <div class="w-full flex flex-col items-center justify-center max-w-sm sm:max-w-md mx-auto text-center">
                                        <!-- 4. ICON: Empty State Icon -->
                                        <slot name="empty-icon" :icon="emptyIcon">
                                            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3.5 shadow-2xs">
                                                <span class="material-symbols-outlined text-3xl select-none leading-none">{{ emptyIcon }}</span>
                                            </div>
                                        </slot>

                                        <!-- 3. TEKS KONTEN: Empty Title & Message -->
                                        <slot name="empty-title" :title="emptyTitle">
                                            <div class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                {{ emptyTitle }}
                                            </div>
                                        </slot>

                                        <slot name="empty-message" :message="emptyMessage">
                                            <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-sm">
                                                {{ emptyMessage }}
                                            </div>
                                        </slot>

                                        <!-- Action Button Slot / Trigger -->
                                        <slot
                                            name="empty-action"
                                            :action-text="emptyActionText"
                                            :action-icon="emptyActionIcon"
                                        >
                                            <ButtonSubmit
                                                v-if="emptyActionText"
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                :color="normalizedColor"
                                                :icon="emptyActionIcon"
                                                @click.prevent.stop="$emit('empty-action')"
                                            >
                                                {{ emptyActionText }}
                                            </ButtonSubmit>
                                        </slot>
                                    </div>
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 5. RESPONSIF: Indikator Overflow Kanan (Fade Gradient + Interactive Scroll Assist Button) -->
            <div
                v-if="scrollIndicator && canScrollRight"
                class="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent pointer-events-none z-20 flex items-center justify-end pr-1 transition-all duration-200"
            >
                <button
                    type="button"
                    class="pointer-events-auto w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                    title="Gulir tabel ke kanan"
                    aria-label="Gulir ke kanan"
                    @click.prevent.stop="scrollRight"
                >
                    <span class="material-symbols-outlined text-sm font-bold">chevron_right</span>
                </button>
            </div>

            <!-- Indikator Overflow Kiri (Fade Gradient + Interactive Scroll Assist Button) -->
            <div
                v-if="scrollIndicator && canScrollLeft"
                class="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent pointer-events-none z-20 flex items-center justify-start pl-1 transition-all duration-200"
            >
                <button
                    type="button"
                    class="pointer-events-auto w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                    title="Gulir tabel ke kiri"
                    aria-label="Gulir ke kiri"
                    @click.prevent.stop="scrollLeft"
                >
                    <span class="material-symbols-outlined text-sm font-bold">chevron_left</span>
                </button>
            </div>
        </div>

        <!-- Bottom Footer Slot (Pagination & Summaries) -->
        <div
            v-if="$slots.footer || (pagination && (pagination.total > 0 || pagination.last_page > 1))"
            class="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 relative z-20"
            :class="sizeStyles.footer"
        >
            <slot name="footer" :pagination="pagination">
                <Pagination
                    v-if="pagination"
                    :data="pagination"
                    :client-side="true"
                    :color-theme="color === 'dark' || color === 'slate' ? 'dark' : (['emerald', 'success'].includes(color) ? 'emerald' : (['amber', 'warning'].includes(color) ? 'amber' : (['rose', 'danger'].includes(color) ? 'rose' : (['cyan', 'sky'].includes(color) ? 'cyan' : (['purple', 'violet'].includes(color) ? 'purple' : (color === 'indigo' ? 'indigo' : 'primary'))))))"
                    v-bind="paginationProps"
                    @change="(p) => $emit('page-change', p)"
                    @page-change="(p) => $emit('page-change', p)"
                    @update:per-page="(pp) => $emit('update:perPage', pp)"
                    @per-page-change="(pp) => $emit('per-page-change', pp)"
                />
            </slot>
        </div>
    </div>
</template>

<style scoped>
/* Otomatis sticky kolom data pertama jika selectable bernilai false */
.table-sticky-first-col:not(.table-selectable) :deep(thead tr th:first-child) {
    position: sticky;
    left: 0;
    z-index: 30;
    background-color: #f8fafc;
    box-shadow: 2px 0 5px -2px rgba(0, 0, 0, 0.12);
}
:global(.dark) .table-sticky-first-col:not(.table-selectable) :deep(thead tr th:first-child) {
    background-color: #1e293b;
    box-shadow: 2px 0 5px -2px rgba(255, 255, 255, 0.05);
}

.table-sticky-first-col:not(.table-selectable) :deep(tbody tr td:first-child) {
    position: sticky;
    left: 0;
    z-index: 10;
    background-color: #ffffff;
    box-shadow: 2px 0 5px -2px rgba(0, 0, 0, 0.08);
}
:global(.dark) .table-sticky-first-col:not(.table-selectable) :deep(tbody tr td:first-child) {
    background-color: #0f172a;
    box-shadow: 2px 0 5px -2px rgba(255, 255, 255, 0.05);
}
.table-sticky-first-col:not(.table-selectable) :deep(tbody tr:hover td:first-child) {
    background-color: #f8fafc;
}
:global(.dark) .table-sticky-first-col:not(.table-selectable) :deep(tbody tr:hover td:first-child) {
    background-color: #1e293b;
}
</style>
