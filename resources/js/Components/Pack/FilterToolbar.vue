<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
    /**
     * Objek table dari composable useServerTable()
     * Jika dioper, toolbar akan otomatis menyinkronkan search, filters, isLoading, & reset.
     */
    table: {
        type: Object,
        default: null,
    },

    // Search Props
    search: {
        type: String,
        default: '',
    },
    showSearch: {
        type: Boolean,
        default: true,
    },
    searchPlaceholder: {
        type: String,
        default: 'Cari data...',
    },
    searchDebounce: {
        type: Number,
        default: 350,
    },

    // Date Preset Props
    showDatePresets: {
        type: Boolean,
        default: true,
    },
    datePreset: {
        type: String,
        default: 'all',
    },
    datePresets: {
        type: Array,
        default: () => [
            { key: 'all', label: 'Semua' },
            { key: 'today', label: 'Hari Ini' },
            { key: '7days', label: '7 Hari' },
            { key: '30days', label: '30 Hari' },
            { key: 'this_month', label: 'Bulan Ini' },
        ],
    },

    // Status Filter Props
    showStatus: {
        type: Boolean,
        default: false,
    },
    status: {
        type: [String, Number],
        default: '',
    },
    statusLabel: {
        type: String,
        default: 'Status',
    },
    statusOptions: {
        type: Array,
        default: () => [],
        // Format: [{ label: 'Semua Status', value: '' }, { label: 'Berhasil', value: 'success' }, ...]
    },

    // Reset Button Props
    showReset: {
        type: Boolean,
        default: true,
    },
    resetLabel: {
        type: String,
        default: 'Reset',
    },
    alwaysShowReset: {
        type: Boolean,
        default: false,
    },

    // Visual & State Props
    loading: {
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
});

const emit = defineEmits([
    'update:search',
    'update:datePreset',
    'update:status',
    'search',
    'reset',
    'date-preset-change',
    'status-change',
    'refresh',
]);

// -----------------------------------------------------------------------------
// Search State & Debounce
// -----------------------------------------------------------------------------
const localSearch = ref(props.table?.search?.value ?? props.search ?? '');
let debounceTimeout = null;

// Sinkronisasi dari luar (props atau table) ke localSearch
watch(
    () => (props.table ? props.table.search?.value : props.search),
    (newVal) => {
        if (newVal !== localSearch.value) {
            localSearch.value = newVal || '';
        }
    }
);

const onSearchInput = (e) => {
    const val = e.target.value;
    localSearch.value = val;

    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        if (props.table?.search) {
            props.table.search.value = val;
        }
        emit('update:search', val);
        emit('search', val);
    }, props.searchDebounce);
};

const clearSearch = () => {
    localSearch.value = '';
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (props.table?.search) {
        props.table.search.value = '';
    }
    emit('update:search', '');
    emit('search', '');
};

// -----------------------------------------------------------------------------
// Date Preset State
// -----------------------------------------------------------------------------
const localDatePreset = ref(
    props.table?.filters?.date_preset ?? props.datePreset ?? 'all'
);

watch(
    () => (props.table ? props.table.filters?.date_preset : props.datePreset),
    (newVal) => {
        if (newVal !== undefined && newVal !== localDatePreset.value) {
            localDatePreset.value = newVal || 'all';
        }
    }
);

const selectDatePreset = (presetKey) => {
    localDatePreset.value = presetKey;
    if (props.table?.filters) {
        props.table.filters.date_preset = presetKey === 'all' ? '' : presetKey;
    }
    emit('update:datePreset', presetKey);
    emit('date-preset-change', presetKey);
};

// -----------------------------------------------------------------------------
// Status Filter State
// -----------------------------------------------------------------------------
const localStatus = ref(
    props.table?.filters?.status ?? props.status ?? ''
);

watch(
    () => (props.table ? props.table.filters?.status : props.status),
    (newVal) => {
        if (newVal !== undefined && newVal !== localStatus.value) {
            localStatus.value = newVal ?? '';
        }
    }
);

const onStatusChange = (e) => {
    const val = e.target.value;
    localStatus.value = val;
    if (props.table?.filters) {
        props.table.filters.status = val;
    }
    emit('update:status', val);
    emit('status-change', val);
};

// -----------------------------------------------------------------------------
// Loading & Active Filters Calculation
// -----------------------------------------------------------------------------
const isLoading = computed(() => {
    return props.loading || Boolean(props.table?.isLoading?.value);
});

const activeFiltersCount = computed(() => {
    let count = 0;
    // Cek Search
    if (localSearch.value && String(localSearch.value).trim() !== '') {
        count++;
    }
    // Cek Date Preset
    if (localDatePreset.value && localDatePreset.value !== 'all') {
        count++;
    }
    // Cek Status
    if (localStatus.value !== '' && localStatus.value !== 'all') {
        count++;
    }
    // Cek filter kustom tambahan dari table.filters jika ada
    if (props.table?.filters) {
        Object.entries(props.table.filters).forEach(([key, val]) => {
            if (['status', 'date_preset'].includes(key)) return;
            if (val !== null && val !== undefined && val !== '' && val !== 'all') {
                count++;
            }
        });
    }
    return count;
});

const hasActiveFilters = computed(() => {
    return activeFiltersCount.value > 0;
});

// -----------------------------------------------------------------------------
// Reset Action
// -----------------------------------------------------------------------------
const handleReset = () => {
    localSearch.value = '';
    localDatePreset.value = 'all';
    localStatus.value = '';

    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (props.table && typeof props.table.resetFilters === 'function') {
        props.table.resetFilters();
    } else {
        emit('update:search', '');
        emit('update:datePreset', 'all');
        emit('update:status', '');
    }

    emit('reset');
};

const handleRefresh = () => {
    if (props.table && typeof props.table.reload === 'function') {
        props.table.reload();
    }
    emit('refresh');
};

onUnmounted(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
});

defineExpose({
    clearSearch,
    handleReset,
    handleRefresh,
    activeFiltersCount,
    hasActiveFilters,
});
</script>

<template>
    <div
        :class="[
            'w-full flex flex-col gap-3 transition-colors duration-200',
            borderless
                ? ''
                : 'p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs'
        ]"
    >
        <!-- Baris Utama (Search + Filter Controls + Actions) -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Sisi Kiri: Prepend + Search + Quick Filters -->
            <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                <!-- Slot Prepend (misal: Batch selector atau icon) -->
                <slot name="prepend" />

                <!-- Search Input Box -->
                <div v-if="showSearch" class="relative flex-1 min-w-50 max-w-md">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <span
                            v-if="isLoading"
                            class="material-symbols-outlined text-lg animate-spin text-blue-600 dark:text-blue-400"
                        >
                            progress_activity
                        </span>
                        <span v-else class="material-symbols-outlined text-lg">search</span>
                    </span>

                    <input
                        type="text"
                        :value="localSearch"
                        :placeholder="searchPlaceholder"
                        @input="onSearchInput"
                        class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 dark:focus:border-blue-400 transition-all"
                    />

                    <!-- Clear Search Button -->
                    <button
                        v-if="localSearch"
                        type="button"
                        @click="clearSearch"
                        class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Hapus pencarian"
                    >
                        <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <!-- Status Select Dropdown (Jika diaktifkan) -->
                <div v-if="showStatus || statusOptions.length > 0" class="relative shrink-0">
                    <select
                        :value="localStatus"
                        @change="onStatusChange"
                        class="appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
                    >
                        <option value="">Semua {{ statusLabel }}</option>
                        <option
                            v-for="opt in statusOptions"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>
                    <span class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                        <span class="material-symbols-outlined text-sm">expand_more</span>
                    </span>
                </div>

                <!-- Slot Kustom Filters (Opsi kustom tambahan developer) -->
                <slot name="filters" />
                <slot />

                <!-- Tombol Reset Filter Aktif -->
                <button
                    v-if="showReset && (alwaysShowReset || hasActiveFilters)"
                    type="button"
                    @click="handleReset"
                    class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/60 transition-colors cursor-pointer select-none"
                    title="Kembalikan semua filter ke bawaan"
                >
                    <span class="material-symbols-outlined text-sm">filter_alt_off</span>
                    <span>{{ resetLabel }}</span>
                    <span
                        v-if="activeFiltersCount > 0"
                        class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white"
                    >
                        {{ activeFiltersCount }}
                    </span>
                </button>
            </div>

            <!-- Sisi Kanan: Action Buttons Slot (Export, Refresh, Tambah Data, dll) -->
            <div v-if="$slots.actions || props.table" class="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <slot name="actions" />

                <!-- Tombol Refresh Bawaan (jika terhubung ke useServerTable) -->
                <button
                    v-if="props.table && !$slots.actions"
                    type="button"
                    @click="handleRefresh"
                    :disabled="isLoading"
                    class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 select-none"
                    title="Muat ulang data tabel"
                >
                    <span
                        class="material-symbols-outlined text-sm"
                        :class="isLoading ? 'animate-spin' : ''"
                    >
                        refresh
                    </span>
                    <span>Segarkan</span>
                </button>
            </div>
        </div>

        <!-- Baris Kedua: Quick Date Presets Bar (Pills Segmented) -->
        <div
            v-if="showDatePresets && datePresets.length > 0"
            class="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar select-none"
        >
            <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">calendar_today</span>
                <span>Periode:</span>
            </span>

            <div class="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <button
                    v-for="preset in datePresets"
                    :key="preset.key"
                    type="button"
                    @click="selectDatePreset(preset.key)"
                    :class="[
                        'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0',
                        localDatePreset === preset.key
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    ]"
                >
                    {{ preset.label }}
                </button>
            </div>

            <!-- Slot Date Kustom Ekstra (misal: DateRangePicker custom) -->
            <slot name="date" />
        </div>
    </div>
</template>
