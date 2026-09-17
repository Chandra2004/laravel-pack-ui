<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';

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
});

const emit = defineEmits([
    'update:loading',
    'update:selected',
    'row-click',
    'select',
    'select-all',
    'empty-action',
]);

const internalLoading = ref(false);
let loadingTimeout = null;
let inertiaStartUnregister = null;
let inertiaFinishUnregister = null;

// Ref Scroll Track untuk Overflow Indicator
const scrollWrapperRef = ref(null);
const canScrollRight = ref(false);
const canScrollLeft = ref(false);

const updateScrollIndicator = () => {
    if (!scrollWrapperRef.value || !props.scrollIndicator) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollWrapperRef.value;
    canScrollLeft.value = scrollLeft > 10;
    canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10;
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

// 2. Auto-Skeleton saat navigasi berpindah halaman / submit form via Inertia
onMounted(() => {
    updateScrollIndicator();
    window.addEventListener('resize', updateScrollIndicator);

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
            badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
            icon: 'text-blue-600 dark:text-blue-400',
        },
        indigo: {
            hover: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
            selected: 'bg-indigo-50/80 dark:bg-indigo-950/40 font-medium',
            checkbox: 'text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
            icon: 'text-indigo-600 dark:text-indigo-400',
        },
        emerald: {
            hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
            selected: 'bg-emerald-50/80 dark:bg-emerald-950/40 font-medium',
            checkbox: 'text-emerald-600 focus:ring-emerald-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            icon: 'text-emerald-600 dark:text-emerald-400',
        },
        purple: {
            hover: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
            selected: 'bg-purple-50/80 dark:bg-purple-950/40 font-medium',
            checkbox: 'text-purple-600 focus:ring-purple-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
            icon: 'text-purple-600 dark:text-purple-400',
        },
        amber: {
            hover: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
            selected: 'bg-amber-50/80 dark:bg-amber-950/40 font-medium',
            checkbox: 'text-amber-600 focus:ring-amber-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
            icon: 'text-amber-600 dark:text-amber-400',
        },
        rose: {
            hover: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
            selected: 'bg-rose-50/80 dark:bg-rose-950/40 font-medium',
            checkbox: 'text-rose-600 focus:ring-rose-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            icon: 'text-rose-600 dark:text-rose-400',
        },
        cyan: {
            hover: 'hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20',
            selected: 'bg-cyan-50/80 dark:bg-cyan-950/40 font-medium',
            checkbox: 'text-cyan-600 focus:ring-cyan-500/20 border-slate-300 dark:border-slate-600',
            badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
            icon: 'text-cyan-600 dark:text-cyan-400',
        },
        dark: {
            hover: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
            selected: 'bg-slate-100 dark:bg-slate-800/80 font-medium',
            checkbox: 'text-slate-900 dark:text-slate-100 focus:ring-slate-700 border-slate-400',
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

const tableClasses = computed(() => {
    return ['w-full text-left border-collapse', sizeStyles.value.table].join(' ');
});

const theadClasses = computed(() => {
    const classes = [
        'bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider select-none'
    ];
    if (props.stickyHeader) {
        classes.push('sticky top-0 z-20 backdrop-blur-md');
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
    let count = props.skeletonCols;
    if (props.selectable) count += 1;
    return count;
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
                            <h3 v-if="title" class="text-slate-900 dark:text-white" :class="sizeStyles.headerTitle">
                                {{ title }}
                            </h3>
                            <p v-if="subtitle" class="text-slate-500 dark:text-slate-400 mt-0.5" :class="sizeStyles.headerSubtitle">
                                {{ subtitle }}
                            </p>
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
                class="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
            >
                <div class="flex items-center gap-2.5">
                    <span
                        class="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-[11px] leading-none"
                        :class="colorClasses.badge"
                    >
                        {{ selected.length }} baris terpilih
                    </span>
                    <button
                        type="button"
                        @click="clearSelection"
                        class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer leading-none"
                    >
                        <span class="material-symbols-outlined text-[14px]">close</span>
                        <span>Batal Pilih</span>
                    </button>
                </div>

                <!-- Custom Bulk Action Buttons Slot -->
                <div class="flex items-center gap-2">
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
                ]"
                :style="maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' } : {}"
            >
                <table :class="tableClasses">
                    <thead :class="theadClasses">
                        <tr>
                            <!-- Checkbox Select All Column -->
                            <th
                                v-if="selectable"
                                class="text-center select-none"
                                :class="[
                                    sizeStyles.checkboxTh,
                                    stickyFirstColumn ? 'sticky left-0 z-30 bg-slate-50/95 dark:bg-slate-800/95 shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]' : '',
                                ]"
                            >
                                <input
                                    type="checkbox"
                                    :checked="isAllSelected"
                                    :indeterminate.prop="isSomeSelected"
                                    @change="toggleSelectAll"
                                    class="rounded-sm cursor-pointer transition-colors"
                                    :class="colorClasses.checkbox"
                                    aria-label="Pilih semua baris"
                                />
                            </th>

                            <!-- Slot Headers Kolom -->
                            <slot name="headers" />
                        </tr>
                    </thead>

                    <!-- Skeleton Loading State (Multi-column Animated Pulse) -->
                    <tbody v-if="isLoading" class="divide-y divide-slate-100 dark:divide-slate-800/60 animate-pulse">
                        <tr v-for="r in skeletonRows" :key="r" class="bg-white dark:bg-slate-900">
                            <td
                                v-if="selectable"
                                class="text-center"
                                :class="[
                                    sizeStyles.checkboxTd,
                                    stickyFirstColumn ? 'sticky left-0 z-10 bg-white dark:bg-slate-900' : '',
                                ]"
                            >
                                <div class="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm mx-auto"></div>
                            </td>
                            <td
                                v-for="c in skeletonCols"
                                :key="c"
                                :class="sizeStyles.td"
                            >
                                <div
                                    class="bg-slate-200 dark:bg-slate-800 rounded-md"
                                    :class="[getSkeletonColWidth(c), sizeStyles.skeletonHeight]"
                                ></div>
                            </td>
                        </tr>
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
                                    stickyFirstColumn ? 'sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]' : '',
                                ]"
                                @click.stop
                            >
                                <input
                                    type="checkbox"
                                    :checked="selectedMap.has(item[itemKey])"
                                    @change="toggleSelectItem(item)"
                                    class="rounded-sm cursor-pointer transition-colors"
                                    :class="colorClasses.checkbox"
                                    :aria-label="`Pilih baris ${index + 1}`"
                                />
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
                            <td :colspan="totalCols" class="px-6 py-14 text-center bg-white dark:bg-slate-900">
                                <slot name="empty">
                                    <div class="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <!-- 4. ICON: Empty State Icon -->
                                        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3.5 shadow-2xs">
                                            <span class="material-symbols-outlined text-3xl select-none leading-none">{{ emptyIcon }}</span>
                                        </div>

                                        <!-- 3. TEKS KONTEN: Empty Title & Message -->
                                        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                                            {{ emptyTitle }}
                                        </h4>
                                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                            {{ emptyMessage }}
                                        </p>

                                        <!-- Action Button Slot / Trigger -->
                                        <slot name="empty-action">
                                            <button
                                                v-if="emptyActionText"
                                                type="button"
                                                @click="$emit('empty-action')"
                                                class="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                            >
                                                {{ emptyActionText }}
                                            </button>
                                        </slot>
                                    </div>
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 5. RESPONSIF: Indikator Overflow Kanan (Fade Cue) -->
            <div
                v-if="scrollIndicator && canScrollRight"
                class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 dark:from-slate-900/90 to-transparent z-10 transition-opacity"
            />
            <!-- Indikator Overflow Kiri (Fade Cue) -->
            <div
                v-if="scrollIndicator && canScrollLeft"
                class="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 dark:from-slate-900/90 to-transparent z-10 transition-opacity"
            />
        </div>

        <!-- Bottom Footer Slot (Pagination & Summaries) -->
        <div
            v-if="$slots.footer"
            class="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30"
            :class="sizeStyles.footer"
        >
            <slot name="footer" />
        </div>
    </div>
</template>
