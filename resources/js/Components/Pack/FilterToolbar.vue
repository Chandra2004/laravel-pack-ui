<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import InputField from './InputField.vue';
import CtaButton from './CtaButton.vue';
import Badge from './Badge.vue';
import Tabs from './Tabs.vue';

const props = defineProps({
    /**
     * Objek table dari composable useServerTable()
     * Jika dioper, toolbar akan otomatis menyinkronkan search, filters, isLoading, & reset.
     */
    table: {
        type: Object,
        default: null,
    },

    // -------------------------------------------------------------------------
    // 1. Core Configurable Props (Size, Rounded/Radius, Variant, Color Theme)
    // -------------------------------------------------------------------------
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    rounded: {
        type: String,
        default: '2xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    radius: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'card', 'soft', 'glass', 'minimal', 'flat', 'accent', 'floating'].includes(v),
    },
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'slate', 'emerald', 'rose', 'amber', 'violet', 'indigo', 'dark'].includes(v),
    },
    color: {
        type: String,
        default: '',
    },

    // -------------------------------------------------------------------------
    // 2. Search Props & Configurable Text & Icons
    // -------------------------------------------------------------------------
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
    searchIcon: {
        type: String,
        default: 'search',
    },

    // -------------------------------------------------------------------------
    // 3. Date Presets Props & Icons
    // -------------------------------------------------------------------------
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
    dateLabel: {
        type: String,
        default: 'Periode:',
    },
    dateIcon: {
        type: String,
        default: 'calendar_today',
    },

    // -------------------------------------------------------------------------
    // 4. Status Filter Props & Customization
    // -------------------------------------------------------------------------
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
    allStatusText: {
        type: String,
        default: '',
    },
    statusOptions: {
        type: Array,
        default: () => [],
    },

    // -------------------------------------------------------------------------
    // 5. Reset & Action Button Props & Icons
    // -------------------------------------------------------------------------
    showReset: {
        type: Boolean,
        default: true,
    },
    resetLabel: {
        type: String,
        default: 'Reset',
    },
    resetIcon: {
        type: String,
        default: 'filter_alt_off',
    },
    refreshIcon: {
        type: String,
        default: 'refresh',
    },
    refreshLabel: {
        type: String,
        default: 'Segarkan',
    },
    alwaysShowReset: {
        type: Boolean,
        default: false,
    },

    // -------------------------------------------------------------------------
    // 6. Visual & Backwards Compatibility Flags
    // -------------------------------------------------------------------------
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

watch(
    () => (props.table ? props.table.search?.value : props.search),
    (newVal) => {
        if (newVal !== localSearch.value) {
            localSearch.value = newVal || '';
        }
    }
);

const onSearchInput = (val) => {
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

const statusSelectOptions = computed(() => {
    const labelAll = props.allStatusText || `Semua ${props.statusLabel}`;
    return [
        { label: labelAll, value: '' },
        ...props.statusOptions,
    ];
});

const onStatusChange = (val) => {
    localStatus.value = val;
    if (props.table?.filters) {
        props.table.filters.status = val;
    }
    emit('update:status', val);
    emit('status-change', val);
};

// -----------------------------------------------------------------------------
// Dynamic Tokens (Size, Rounded, Variant, Color Theme)
// -----------------------------------------------------------------------------
const effectiveSize = computed(() => (props.compact ? 'sm' : props.size));

const effectiveRadius = computed(() => props.radius || props.rounded || '2xl');

const radiusClasses = computed(() => {
    const r = effectiveRadius.value;
    const map = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
    };
    return map[r] || 'rounded-2xl';
});

// Radius for inner controls (inputs, selects, buttons)
const innerRadius = computed(() => {
    return effectiveRadius.value || 'xl';
});

// Radius for date preset wrapper container
const pillRadiusClass = computed(() => {
    const r = effectiveRadius.value;
    const map = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
    };
    return map[r] || 'rounded-xl';
});

// Radius for individual buttons inside date preset wrapper
const pillButtonRadius = computed(() => {
    const r = effectiveRadius.value;
    if (r === 'none') return 'none';
    if (r === 'full') return 'full';
    if (r === '3xl') return '2xl';
    if (r === '2xl') return 'xl';
    if (r === 'xl') return 'lg';
    if (r === 'lg') return 'md';
    if (r === 'md') return 'sm';
    return 'sm';
});

const containerPaddingClasses = computed(() => {
    const s = effectiveSize.value;
    const map = {
        sm: 'p-2 sm:p-2.5 gap-2 text-xs',
        md: 'p-3 sm:p-3.5 gap-2.5 sm:gap-3 text-sm',
        lg: 'p-4 sm:p-5 gap-3.5 sm:gap-4 text-base',
    };
    return map[s] || map.md;
});

const inputComponentSize = computed(() => {
    const s = effectiveSize.value;
    if (s === 'sm') return 'sm';
    if (s === 'lg') return 'lg';
    return 'md';
});

const buttonComponentSize = computed(() => {
    const s = effectiveSize.value;
    if (s === 'sm') return 'xs';
    if (s === 'lg') return 'md';
    return 'sm';
});

const presetButtonSize = computed(() => {
    const s = effectiveSize.value;
    if (s === 'lg') return 'sm';
    return 'xs';
});

const effectiveColorTheme = computed(() => props.color || props.colorTheme || 'primary');

const variantClasses = computed(() => {
    if (props.borderless || props.variant === 'minimal') {
        return 'bg-transparent border-b border-slate-200/80 dark:border-slate-800 shadow-none px-0.5 py-1.5 rounded-none!';
    }
    const theme = effectiveColorTheme.value;
    const accentThemeMap = {
        primary: 'bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 shadow-xs',
        indigo: 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 shadow-xs',
        emerald: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs',
        rose: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 shadow-xs',
        amber: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 shadow-xs',
        violet: 'bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50 shadow-xs',
        slate: 'bg-slate-100/80 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/80 shadow-xs',
        dark: 'bg-slate-900 text-white border border-slate-800 shadow-md',
    };

    const map = {
        default: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700',
        card: 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm',
        soft: 'bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 shadow-none',
        glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-lg shadow-slate-900/5 dark:shadow-black/25',
        flat: 'bg-slate-100 dark:bg-slate-800 border-0 shadow-none',
        accent: accentThemeMap[theme] || accentThemeMap.primary,
        floating: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/40 ring-1 ring-slate-900/5 dark:ring-white/10 border-0',
    };
    return map[props.variant] || map.default;
});

// Radius Tabs (track mengikuti radius tab via radiusStyles Tabs.vue) agar sudut konsentris dengan toolbar
const tabsRadius = computed(() => {
    const map = {
        none: 'none',
        sm: 'xs',
        md: 'sm',
        lg: 'md',
        xl: 'lg',
        '2xl': 'xl',
        '3xl': 'full',
        full: 'full',
    };
    return map[effectiveRadius.value] || 'xl';
});

const tabsSize = computed(() => (effectiveSize.value === 'lg' ? 'sm' : 'xs'));

const datePresetTabs = computed(() =>
    props.datePresets.map((preset) => ({ id: preset.key, label: preset.label, icon: preset.icon }))
);

// -----------------------------------------------------------------------------
// Loading & Active Filters Calculation
// -----------------------------------------------------------------------------
const isLoading = computed(() => {
    return props.loading || Boolean(props.table?.isLoading?.value);
});

const activeFiltersCount = computed(() => {
    let count = 0;
    if (localSearch.value && String(localSearch.value).trim() !== '') {
        count++;
    }
    if (localDatePreset.value && localDatePreset.value !== 'all') {
        count++;
    }
    if (localStatus.value !== '' && localStatus.value !== 'all') {
        count++;
    }
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
// Reset & Refresh Actions
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
            'w-full flex flex-col transition-all duration-200',
            containerPaddingClasses,
            radiusClasses,
            variantClasses
        ]"
    >
        <!-- Baris Utama (Prepend + Search + Status + Filters + Reset + Actions) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <!-- Sisi Kiri: Prepend + Search + Status + Custom Filters + Reset -->
            <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 flex-1 min-w-0">
                <!-- Slot Prepend (misal: Batch selector, Checkbox, dll) -->
                <slot name="prepend" :innerRadius="innerRadius" :size="inputComponentSize" :buttonSize="buttonComponentSize" :colorTheme="effectiveColorTheme" />

                <!-- Search Input (menggunakan InputField type="search") -->
                <div v-if="showSearch" class="w-full sm:flex-1 sm:min-w-48 sm:max-w-md">
                    <InputField
                        type="search"
                        :modelValue="localSearch"
                        :placeholder="searchPlaceholder"
                        :loading="isLoading"
                        :icon="searchIcon"
                        :clearable="true"
                        :size="inputComponentSize"
                        :rounded="innerRadius"
                        @update:modelValue="onSearchInput"
                        @clear="clearSearch"
                    />
                </div>

                <!-- Status Select Dropdown (menggunakan InputField type="select") -->
                <div v-if="showStatus || statusOptions.length > 0" class="w-full sm:w-auto sm:min-w-40">
                    <InputField
                        type="select"
                        :modelValue="localStatus"
                        :options="statusSelectOptions"
                        :placeholder="allStatusText || `Semua ${statusLabel}`"
                        :size="inputComponentSize"
                        :rounded="innerRadius"
                        :clearable="false"
                        @update:modelValue="onStatusChange"
                    />
                </div>

                <!-- Slot Kustom Filters (Opsi kustom tambahan dari developer) -->
                <slot name="filters" :innerRadius="innerRadius" :size="inputComponentSize" :buttonSize="buttonComponentSize" :colorTheme="effectiveColorTheme" />
                <slot :innerRadius="innerRadius" :size="inputComponentSize" :buttonSize="buttonComponentSize" :colorTheme="effectiveColorTheme" />

                <!-- Tombol Reset Filter Aktif (menggunakan CtaButton + Badge) -->
                <div v-if="showReset && (alwaysShowReset || hasActiveFilters)" class="w-full sm:w-auto shrink-0">
                    <CtaButton
                        type="direct"
                        variant="soft"
                        colorTheme="rose"
                        :size="buttonComponentSize"
                        :rounded="innerRadius"
                        :icon="resetIcon"
                        :label="resetLabel"
                        @click="handleReset"
                    >
                        <template #default>
                            <span class="flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-sm">{{ resetIcon }}</span>
                                <span>{{ resetLabel }}</span>
                                <Badge
                                    v-if="activeFiltersCount > 0"
                                    size="xs"
                                    color="rose"
                                    variant="solid"
                                >
                                    {{ activeFiltersCount }}
                                </Badge>
                            </span>
                        </template>
                    </CtaButton>
                </div>
            </div>

            <!-- Sisi Kanan: Action Buttons Slot (Export, Refresh, Tambah Data, dll) -->
            <div v-if="$slots.actions || props.table" class="flex items-center gap-2 shrink-0 self-end md:self-center">
                <slot name="actions" :innerRadius="innerRadius" :size="buttonComponentSize" :colorTheme="effectiveColorTheme" />

                <!-- Tombol Refresh Bawaan (jika terhubung ke useServerTable) -->
                <CtaButton
                    v-if="props.table && !$slots.actions"
                    type="direct"
                    variant="outline"
                    :colorTheme="effectiveColorTheme"
                    :size="buttonComponentSize"
                    :rounded="innerRadius"
                    :icon="refreshIcon"
                    :label="refreshLabel"
                    :loading="isLoading"
                    :disabled="isLoading"
                    @click="handleRefresh"
                />
            </div>
        </div>

        <!-- Slot Chips / Active Tag Filters (Opsional) -->
        <div v-if="$slots.chips || $slots.tags" class="pt-2">
            <slot name="chips" :innerRadius="innerRadius" :colorTheme="effectiveColorTheme" />
            <slot name="tags" :innerRadius="innerRadius" :colorTheme="effectiveColorTheme" />
        </div>

        <!-- Baris Kedua: Quick Date Presets Bar (Pills Segmented) -->
        <div
            v-if="showDatePresets && datePresets.length > 0"
            class="flex items-center gap-1.5 pt-1.5 overflow-x-auto no-scrollbar select-none -mx-1 px-1"
        >
            <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">{{ dateIcon }}</span>
                <span class="hidden sm:inline">{{ dateLabel }}</span>
            </span>

            <Tabs
                :tabs="datePresetTabs"
                :modelValue="localDatePreset"
                variant="segmented"
                :color="effectiveColorTheme"
                :size="tabsSize"
                :radius="tabsRadius"
                :showIcon="false"
                :showBadge="false"
                compactPanel
                class="shrink-0"
                @change="({ tab }) => selectDatePreset(tab.id)"
            />

            <!-- Slot Date Kustom Ekstra (misal: DateRangePicker custom) -->
            <slot name="date" :innerRadius="innerRadius" :size="presetButtonSize" :colorTheme="effectiveColorTheme" />
        </div>

        <!-- Slot Bottom Tambahan (misal: pilled status tabs atau summary bar) -->
        <div v-if="$slots.bottom" class="pt-2">
            <slot name="bottom" :innerRadius="innerRadius" :colorTheme="effectiveColorTheme" :pillRadiusClass="pillRadiusClass" :pillButtonRadius="pillButtonRadius" />
        </div>
    </div>
</template>
