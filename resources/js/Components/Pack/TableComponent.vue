<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    autoLoading: {
        type: Boolean,
        default: true, // Otomatis tampilkan skeleton saat items berubah (search, pagination, dll)
    },
    autoLoadingDuration: {
        type: Number,
        default: 300, // Durasi skeleton transisi dalam ms
    },
    watchInertia: {
        type: Boolean,
        default: true, // Otomatis tangkap loading saat berpindah halaman via Inertia request
    },
    skeletonRows: {
        type: Number,
        default: 5,
    },
    skeletonCols: {
        type: Number,
        default: 4,
    },
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
    responsive: {
        type: Boolean,
        default: true,
    },
    hoverable: {
        type: Boolean,
        default: true,
    },
    striped: {
        type: Boolean,
        default: false,
    },
    compact: {
        type: Boolean,
        default: false,
    },
    borderless: {
        type: Boolean,
        default: false,
    },
    stickyHeader: {
        type: Boolean,
        default: false,
    },
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

const emit = defineEmits(['update:loading', 'update:selected', 'row-click', 'select', 'select-all']);

const internalLoading = ref(false);
let loadingTimeout = null;
let inertiaStartUnregister = null;
let inertiaFinishUnregister = null;

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
            }, props.autoLoadingDuration);
        }
    },
    { deep: false }
);

// 2. Auto-Skeleton saat navigasi berpindah halaman / submit form via Inertia
onMounted(() => {
    if (props.watchInertia && typeof router !== 'undefined' && typeof router.on === 'function') {
        try {
            inertiaStartUnregister = router.on('start', () => {
                internalLoading.value = true;
            });
            inertiaFinishUnregister = router.on('finish', () => {
                internalLoading.value = false;
            });
        } catch (e) {
            // Diluar context runtime Inertia
        }
    }
});

onUnmounted(() => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    if (inertiaStartUnregister) inertiaStartUnregister();
    if (inertiaFinishUnregister) inertiaFinishUnregister();
});

// --- Selection Management ---
const selectedMap = computed(() => {
    const set = new Set();
    for (const item of props.selected) {
        const id = typeof item === 'object' ? item[props.itemKey] : item;
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
    const existsIndex = newSelected.findIndex((s) => (typeof s === 'object' ? s[props.itemKey] === key : s === key));

    if (existsIndex > -1) {
        newSelected.splice(existsIndex, 1);
    } else {
        newSelected.push(item);
    }

    emit('update:selected', newSelected);
    emit('select', { item, selected: existsIndex === -1 });
};

// --- Row Click Event ---
const handleRowClick = (item, index, event) => {
    // Abaikan jika klik terjadi pada input checkbox atau tombol di dalam row
    if (event.target.closest('button, a, input, select, textarea')) {
        return;
    }
    emit('row-click', { item, index });
};

// --- Styling Classes ---
const containerClasses = computed(() => {
    const classes = ['bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200'];
    if (!props.borderless) {
        classes.push('border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs');
    }
    return classes.join(' ');
});

const tableClasses = computed(() => {
    const classes = ['w-full text-left border-collapse'];
    if (props.compact) {
        classes.push('text-xs');
    } else {
        classes.push('text-sm');
    }
    return classes.join(' ');
});

const theadClasses = computed(() => {
    const classes = ['bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide text-[11px] select-none'];
    if (props.stickyHeader) {
        classes.push('sticky top-0 z-10 backdrop-blur-xs');
    }
    return classes.join(' ');
});

const getRowClasses = (item, index) => {
    const classes = ['transition-colors duration-150 group'];

    // Selesaikan konflik visual striped + hoverable
    if (props.striped) {
        if (index % 2 === 1) {
            classes.push('bg-slate-50/50 dark:bg-slate-800/30');
        } else {
            classes.push('bg-white dark:bg-slate-900');
        }
    }

    if (props.hoverable) {
        classes.push('hover:bg-blue-50/40 dark:hover:bg-slate-800/70');
    }

    if (props.clickableRows) {
        classes.push('cursor-pointer');
    }

    const key = item[props.itemKey];
    if (props.selectable && selectedMap.value.has(key)) {
        classes.push('bg-blue-50/70 dark:bg-blue-950/40');
    }

    return classes.join(' ');
};

const getSkeletonColWidth = (colIndex) => {
    const widths = ['w-16', 'w-48', 'w-28', 'w-24', 'w-36', 'w-20'];
    return widths[colIndex % widths.length];
};

// Hitung total kolom aktual untuk colspan empty state & skeleton
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
    isLoading,
});
</script>

<template>
    <div :class="containerClasses">
        <!-- Top Toolbar Slot -->
        <div
            v-if="$slots.toolbar"
            class="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900"
        >
            <slot
                name="toolbar"
                :start-loading="startLoading"
                :stop-loading="stopLoading"
                :is-loading="isLoading"
                :export-csv="exportToCsv"
            />
        </div>

        <!-- Table Responsive Wrapper -->
        <div :class="{ 'overflow-x-auto': responsive }">
            <table :class="tableClasses">
                <thead :class="theadClasses">
                    <tr>
                        <!-- Checkbox Select All Column -->
                        <th v-if="selectable" class="w-10 px-4 py-3.5 text-center">
                            <input
                                type="checkbox"
                                :checked="isAllSelected"
                                :indeterminate.prop="isSomeSelected"
                                @change="toggleSelectAll"
                                class="rounded-sm border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                aria-label="Pilih semua baris"
                            />
                        </th>
                        <slot name="headers" />
                    </tr>
                </thead>

                <!-- Skeleton Loading State (Transisi Halus Otomatis saat Page / Search Berubah) -->
                <tbody v-if="isLoading" class="divide-y divide-slate-100 dark:divide-slate-800/60 animate-pulse">
                    <tr v-for="r in skeletonRows" :key="r" class="bg-white dark:bg-slate-900">
                        <td v-if="selectable" class="w-10 px-4 py-3.5 text-center">
                            <div class="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm mx-auto"></div>
                        </td>
                        <td
                            v-for="c in skeletonCols"
                            :key="c"
                            :class="compact ? 'px-4 py-2.5' : 'px-5 py-3.5'"
                        >
                            <div
                                class="h-4 bg-slate-200 dark:bg-slate-800 rounded-md"
                                :class="getSkeletonColWidth(c)"
                            ></div>
                        </td>
                    </tr>
                </tbody>

                <!-- Actual Data Rows -->
                <tbody v-else-if="items && items.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr
                        v-for="(item, index) in items"
                        :key="item[itemKey] ?? item.id ?? item.uuid ?? index"
                        :class="getRowClasses(item, index)"
                        @click="handleRowClick(item, index, $event)"
                    >
                        <!-- Row Selection Checkbox -->
                        <td v-if="selectable" class="w-10 px-4 py-3.5 text-center" @click.stop>
                            <input
                                type="checkbox"
                                :checked="selectedMap.has(item[itemKey])"
                                @change="toggleSelectItem(item)"
                                class="rounded-sm border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                :aria-label="`Pilih baris ${index + 1}`"
                            />
                        </td>
                        <slot name="row" :item="item" :index="index" />
                    </tr>
                </tbody>

                <!-- Empty State -->
                <tbody v-else>
                    <tr>
                        <td :colspan="totalCols" class="px-6 py-14 text-center bg-white dark:bg-slate-900">
                            <slot name="empty">
                                <div class="flex flex-col items-center justify-center max-w-sm mx-auto">
                                    <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3.5 shadow-2xs">
                                        <span class="material-symbols-outlined text-3xl select-none">{{ emptyIcon }}</span>
                                    </div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{{ emptyTitle }}</h4>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ emptyMessage }}</p>
                                </div>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Bottom Footer Slot -->
        <div v-if="$slots.footer" class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
            <slot name="footer" />
        </div>
    </div>
</template>
