<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { usePopover } from '@/Composables/Pack/usePopover.js';

const props = defineProps({
    modelValue: {
        type: [String, Number, Array],
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Pilih opsi...',
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (val) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    options: {
        type: Array,
        default: () => [],
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    searchable: {
        type: Boolean,
        default: null, // Otomatis jika opsi > 5
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    chipDisplay: {
        type: Boolean,
        default: true,
    },
    dropdownStyle: {
        type: String,
        default: 'modern', // 'modern', 'cards', 'compact'
        validator: (v) => ['modern', 'cards', 'compact', 'default'].includes(v),
    },
    placement: {
        type: String,
        default: 'bottom',
        validator: (v) => ['bottom', 'top', 'left', 'right', 'auto', 'bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v),
    },
    popoverOffset: {
        type: Number,
        default: 6,
    },
    color: {
        type: String,
        default: 'primary', // 'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const containerRef = ref(null);
const popoverRef = ref(null);
const searchInputRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);

const closeDropdown = () => {
    if (isOpen.value) {
        isOpen.value = false;
        searchQuery.value = '';
        highlightedIndex.value = -1;
        emit('blur');
    }
};

const openDropdown = () => {
    isOpen.value = true;
    searchQuery.value = '';
    highlightedIndex.value = -1;
    emit('focus');
    nextTick(() => {
        updatePosition();
        if (isSearchVisible.value && searchInputRef.value) {
            searchInputRef.value.focus();
        }
    });
};

const toggleDropdown = () => {
    if (props.disabled || props.readonly || props.loading) return;
    if (isOpen.value) {
        closeDropdown();
    } else {
        openDropdown();
    }
};

const { popoverStyle, currentPlacement, updatePosition } = usePopover({
    triggerRef: containerRef,
    popoverRef,
    isOpen,
    placement: computed(() => props.placement),
    offset: props.popoverOffset,
    matchWidth: computed(() => props.placement === 'bottom' || props.placement === 'top' || props.placement === 'auto'),
    onClose: closeDropdown,
});

// Normalize options to uniform array of objects: { value, label, subtext, group, disabled, icon, badge }
const normalizedOptions = computed(() => {
    const list = [];
    if (!Array.isArray(props.options)) return list;

    props.options.forEach((opt) => {
        // Mendukung format nested optgroup: { group: 'Frontend', options: [...] } atau { label: 'Frontend', items: [...] }
        if (opt && typeof opt === 'object' && (Array.isArray(opt.options) || Array.isArray(opt.items))) {
            const groupName = opt.group || opt.label || 'Grup';
            const childItems = opt.options || opt.items || [];
            childItems.forEach((child) => {
                if (typeof child === 'object' && child !== null) {
                    list.push({
                        value: child.value,
                        label: child.label !== undefined ? child.label : child.value,
                        subtext: child.subtext || '',
                        group: child.group || groupName,
                        icon: child.icon || '',
                        badge: child.badge || '',
                        disabled: !!child.disabled,
                    });
                } else {
                    list.push({
                        value: child,
                        label: String(child),
                        subtext: '',
                        group: groupName,
                        icon: '',
                        badge: '',
                        disabled: false,
                    });
                }
            });
        } else if (typeof opt === 'object' && opt !== null) {
            list.push({
                value: opt.value,
                label: opt.label !== undefined ? opt.label : opt.value,
                subtext: opt.subtext || '',
                group: opt.group || '',
                icon: opt.icon || '',
                badge: opt.badge || '',
                disabled: !!opt.disabled,
            });
        } else {
            list.push({
                value: opt,
                label: String(opt),
                subtext: '',
                group: '',
                icon: '',
                badge: '',
                disabled: false,
            });
        }
    });

    return list;
});

// Filtered options based on search query
const filteredOptions = computed(() => {
    if (!searchQuery.value.trim()) return normalizedOptions.value;
    const query = searchQuery.value.toLowerCase();
    return normalizedOptions.value.filter(opt =>
        String(opt.label).toLowerCase().includes(query) ||
        String(opt.subtext).toLowerCase().includes(query) ||
        String(opt.group).toLowerCase().includes(query)
    );
});

// Detect whether grouping is used
const hasGrouping = computed(() => normalizedOptions.value.some(o => Boolean(o.group)));

// Well-coordinated grouped structure
const groupedFilteredOptions = computed(() => {
    if (!hasGrouping.value) {
        return [{ name: null, items: filteredOptions.value }];
    }
    const groups = [];
    const map = new Map();

    filteredOptions.value.forEach(item => {
        const gName = item.group || '';
        if (!map.has(gName)) {
            const gObj = { name: gName, items: [] };
            map.set(gName, gObj);
            groups.push(gObj);
        }
        map.get(gName).items.push(item);
    });

    return groups;
});

// Determine if search box should be visible
const isSearchVisible = computed(() => {
    if (props.searchable !== null) return props.searchable;
    return normalizedOptions.value.length > 5;
});

// Selected label for display in trigger
const selectedLabel = computed(() => {
    if (props.multiple && Array.isArray(props.modelValue)) {
        if (props.modelValue.length === 0) return '';
        const labels = props.modelValue.map(val => {
            const found = normalizedOptions.value.find(o => o.value === val);
            return found ? found.label : val;
        });
        return labels.join(', ');
    }
    const found = normalizedOptions.value.find(o => String(o.value) === String(props.modelValue));
    return found ? found.label : '';
});

// Selected items as array of objects for Chips rendering
const selectedChips = computed(() => {
    if (!props.multiple || !Array.isArray(props.modelValue)) return [];
    return props.modelValue.map(val => {
        const found = normalizedOptions.value.find(o => o.value === val);
        return found ? found : { value: val, label: val };
    });
});

const isSelected = (val) => {
    if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(val);
    }
    return String(props.modelValue) === String(val);
};

const hasValue = computed(() => {
    if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.length > 0;
    }
    return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
});

// Placement & positioning are handled by usePopover composable

const selectOption = (opt) => {
    if (opt.disabled) return;

    if (props.multiple) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        const index = current.indexOf(opt.value);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(opt.value);
        }
        emit('update:modelValue', current);
        emit('change', current);
    } else {
        emit('update:modelValue', opt.value);
        emit('change', opt.value);
        closeDropdown();
    }
};

const removeChip = (val) => {
    if (props.disabled || props.readonly) return;
    if (props.multiple && Array.isArray(props.modelValue)) {
        const current = props.modelValue.filter(v => v !== val);
        emit('update:modelValue', current);
        emit('change', current);
    }
};

const handleClear = () => {
    const emptyVal = props.multiple ? [] : '';
    emit('update:modelValue', emptyVal);
    emit('change', emptyVal);
    emit('clear');
};

// Size classes mapping
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                trigger: 'min-h-8 py-1 px-2.5 text-xs',
                icon: 'text-sm',
                chip: 'text-[10px] px-1.5 py-0.5',
            };
        case 'sm':
            return {
                trigger: 'min-h-9 py-1.5 px-3 text-xs',
                icon: 'text-base',
                chip: 'text-[11px] px-2 py-0.5',
            };
        case 'lg':
            return {
                trigger: 'min-h-12 py-3 px-4 text-base',
                icon: 'text-2xl',
                chip: 'text-sm px-3 py-1',
            };
        case 'xl':
            return {
                trigger: 'min-h-14 py-3.5 px-4.5 text-lg',
                icon: 'text-2xl',
                chip: 'text-base px-3.5 py-1.5',
            };
        case 'md':
        default:
            return {
                trigger: 'min-h-10 py-2 px-3.5 text-sm',
                icon: 'text-xl',
                chip: 'text-xs px-2.5 py-1',
            };
    }
});

const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case '2xl': return 'rounded-2xl';
        case '3xl': return 'rounded-3xl';
        case 'full': return 'rounded-full';
        case 'xl':
        default: return 'rounded-xl';
    }
});

const colorStyles = computed(() => {
    switch (props.color) {
        case 'indigo':
            return {
                open: 'border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/15',
                focus: 'focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15',
                chip: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800',
            };
        case 'emerald':
            return {
                open: 'border-emerald-600 dark:border-emerald-500 ring-4 ring-emerald-500/15',
                focus: 'focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15',
                chip: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
            };
        case 'purple':
            return {
                open: 'border-purple-600 dark:border-purple-500 ring-4 ring-purple-500/15',
                focus: 'focus:border-purple-600 focus:ring-4 focus:ring-purple-500/15',
                chip: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800',
            };
        case 'amber':
            return {
                open: 'border-amber-600 dark:border-amber-500 ring-4 ring-amber-500/15',
                focus: 'focus:border-amber-600 focus:ring-4 focus:ring-amber-500/15',
                chip: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
            };
        case 'rose':
            return {
                open: 'border-rose-600 dark:border-rose-500 ring-4 ring-rose-500/15',
                focus: 'focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15',
                chip: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800',
            };
        case 'cyan':
            return {
                open: 'border-cyan-600 dark:border-cyan-500 ring-4 ring-cyan-500/15',
                focus: 'focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/15',
                chip: 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800',
            };
        case 'dark':
            return {
                open: 'border-slate-800 dark:border-slate-300 ring-4 ring-slate-500/15',
                focus: 'focus:border-slate-800 focus:ring-4 focus:ring-slate-500/15',
                chip: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
            };
        case 'primary':
        default:
            return {
                open: 'border-blue-600 dark:border-blue-500 ring-4 ring-blue-500/15',
                focus: 'focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15',
                chip: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
            };
    }
});
</script>

<template>
    <div
        ref="containerRef"
        class="relative w-full"
    >
        <input
            :id="id"
            type="hidden"
            :name="name"
            :value="Array.isArray(modelValue) ? JSON.stringify(modelValue) : modelValue"
            :required="required && !hasValue"
        />

        <!-- Trigger Box -->
        <div
            role="combobox"
            tabindex="0"
            :aria-expanded="isOpen"
            :aria-disabled="disabled || loading"
            @click="toggleDropdown"
            class="w-full flex items-center justify-between text-left bg-white dark:bg-slate-900 border shadow-2xs transition-all duration-150 select-none focus:outline-hidden cursor-pointer"
            :class="[
                roundedClasses,
                sizeClasses.trigger,
                icon ? 'pl-11' : '',
                isOpen ? colorStyles.open : '',
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                    : !isOpen ? ['border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600', colorStyles.focus] : '',
                disabled || loading ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed pointer-events-none' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        >
            <!-- Left Prefix Icon -->
            <div
                v-if="icon"
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
            >
                <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ icon }}</span>
            </div>

            <!-- Value Display: Chips or Text / Placeholder -->
            <div class="flex-1 min-w-0 mr-2">
                <slot name="selected" :selected="selectedChips" :label="selectedLabel">
                    <!-- Multiple Mode: Chips -->
                    <div
                        v-if="multiple && chipDisplay && selectedChips.length > 0"
                        class="flex flex-wrap items-center gap-1.5 py-0.5"
                    >
                        <span
                            v-for="chip in selectedChips"
                            :key="chip.value"
                            class="inline-flex items-center gap-1 rounded-lg border font-medium"
                            :class="[sizeClasses.chip, colorStyles.chip]"
                        >
                            <span class="truncate max-w-37.5">{{ chip.label }}</span>
                            <button
                                v-if="!disabled && !readonly"
                                type="button"
                                @click.stop="removeChip(chip.value)"
                                class="hover:text-blue-900 dark:hover:text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
                                title="Hapus"
                            >
                                <span class="material-symbols-outlined text-xs leading-none">close</span>
                            </button>
                        </span>
                    </div>

                    <!-- Single Mode: Label / Placeholder -->
                    <span
                        v-else
                        class="truncate block"
                        :class="selectedLabel ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'"
                    >
                        {{ selectedLabel || placeholder }}
                    </span>
                </slot>
            </div>

            <!-- Right Action Icons: Clear & Chevron -->
            <div class="flex items-center gap-1 shrink-0 text-slate-400 dark:text-slate-500">
                <button
                    v-if="clearable && hasValue && !disabled && !readonly"
                    type="button"
                    @click.stop="handleClear"
                    class="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Hapus Pilihan"
                >
                    <span class="material-symbols-outlined text-sm leading-none">cancel</span>
                </button>

                <span
                    v-if="loading"
                    class="material-symbols-outlined text-base leading-none text-blue-600 dark:text-blue-400 animate-spin"
                >
                    progress_activity
                </span>

                <span
                    v-else
                    class="material-symbols-outlined text-lg leading-none transition-transform duration-200 ease-out"
                    :class="{ 'rotate-180 text-blue-600 dark:text-blue-400': isOpen }"
                >
                    expand_more
                </span>
            </div>
        </div>

        <!-- =================================================================== -->
        <!-- FLOATING POPOVER TELEPORTED KE BODY (BEBAS DARI OVERFLOW & Z-INDEX) -->
        <!-- =================================================================== -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
            >
                <div
                    v-if="isOpen"
                    ref="popoverRef"
                    :style="popoverStyle"
                    class="fixed z-99999 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden select-none"
                    :class="[
                        props.placement === 'left' || props.placement === 'right' ? 'w-72 max-w-[calc(100vw-24px)]' : 'max-w-[calc(100vw-24px)]'
                    ]"
                >
                    <!-- DEVELOPER CUSTOM POPOVER SLOT -->
                    <slot
                        name="popover"
                        :options="filteredOptions"
                        :grouped-options="groupedFilteredOptions"
                        :selected="modelValue"
                        :select="selectOption"
                        :close="closeDropdown"
                        :search="searchQuery"
                        :set-search="(val) => searchQuery = val"
                        :placement="currentPlacement"
                    >
                        <!-- Optional Header Slot -->
                        <slot name="header" />

                        <!-- Search Filter Input Inside Dropdown -->
                        <div
                            v-if="isSearchVisible"
                            class="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 sticky top-0 z-20 backdrop-blur-md"
                        >
                            <div class="relative flex items-center w-full">
                                <!-- Presisi Center Vertikal Kiri: Search Icon -->
                                <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <span class="material-symbols-outlined text-[17px] leading-none">search</span>
                                </div>

                                <input
                                    ref="searchInputRef"
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Ketik untuk mencari opsi..."
                                    class="w-full h-8.5 pl-8.5 pr-8.5 py-1.5 text-xs rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-150 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-2xs"
                                    @click.stop
                                />

                                <!-- Presisi Center Vertikal Kanan: Clear Button -->
                                <div
                                    v-if="searchQuery"
                                    class="absolute inset-y-0 right-0 pr-1.5 flex items-center"
                                >
                                    <button
                                        type="button"
                                        @click.stop="searchQuery = ''"
                                        class="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <span class="material-symbols-outlined text-[14px] leading-none">close</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Options List Container -->
                        <ul
                            class="max-h-64 overflow-y-auto overscroll-contain p-1.5 space-y-0.5 focus:outline-hidden scrollbar-thin"
                            :class="[dropdownStyle === 'compact' ? 'grid grid-cols-2 gap-1 space-y-0' : '']"
                        >
                            <template v-for="(groupObj, gIdx) in groupedFilteredOptions" :key="gIdx">
                                <!-- Group Header with Hierarchy & Count Badge -->
                                <li
                                    v-if="groupObj.name"
                                    class="px-2.5 pt-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between col-span-full select-none"
                                    :class="[gIdx > 0 ? 'mt-1 pt-2.5 border-t border-slate-100 dark:border-slate-800/80' : '']"
                                >
                                    <div class="flex items-center gap-1.5 min-w-0">
                                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0"></span>
                                        <span class="truncate">{{ groupObj.name }}</span>
                                    </div>
                                    <span class="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                        {{ groupObj.items.length }}
                                    </span>
                                </li>

                                <!-- Option Items (Developer Customizable via #option Slot) -->
                                <li
                                    v-for="opt in groupObj.items"
                                    :key="opt.value"
                                    role="option"
                                    :aria-selected="isSelected(opt.value)"
                                    @click.stop="selectOption(opt)"
                                    class="relative flex items-center justify-between py-2 text-xs sm:text-sm rounded-xl cursor-pointer select-none transition-all duration-100"
                                    :class="[
                                        groupObj.name ? 'pl-3.5 pr-2.5 ml-1' : 'px-3',
                                        dropdownStyle === 'cards' ? 'border border-slate-100 dark:border-slate-800/80 mb-1 hover:border-blue-300 dark:hover:border-blue-700' : '',
                                        isSelected(opt.value)
                                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80',
                                        opt.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
                                    ]"
                                >
                                    <!-- DEVELOPER SLOT: #option -->
                                    <slot
                                        name="option"
                                        :option="opt"
                                        :selected="isSelected(opt.value)"
                                    >
                                        <!-- DEFAULT FALLBACK OPTION DESIGN -->
                                        <div class="space-y-0.5 min-w-0 flex-1 mr-2">
                                            <div class="flex items-center gap-1.5">
                                                <span v-if="opt.icon" class="material-symbols-outlined text-base leading-none text-slate-400">
                                                    {{ opt.icon }}
                                                </span>
                                                <span class="truncate font-medium">{{ opt.label }}</span>
                                                <span
                                                    v-if="opt.badge"
                                                    class="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono"
                                                >
                                                    {{ opt.badge }}
                                                </span>
                                            </div>
                                            <div v-if="opt.subtext" class="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                                {{ opt.subtext }}
                                            </div>
                                        </div>

                                        <!-- Checkmark Indicator -->
                                        <span
                                            v-if="isSelected(opt.value)"
                                            class="material-symbols-outlined text-base text-blue-600 dark:text-blue-400 leading-none shrink-0"
                                        >
                                            check
                                        </span>
                                    </slot>
                                </li>
                            </template>

                            <!-- Empty State -->
                            <li
                                v-if="filteredOptions.length === 0"
                                class="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500 select-none col-span-full"
                            >
                                <slot name="empty">
                                    <div class="space-y-1">
                                        <span class="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600">search_off</span>
                                        <p>Tidak ada opsi yang cocok dengan pencarian.</p>
                                    </div>
                                </slot>
                            </li>
                        </ul>

                        <!-- Optional Footer Slot -->
                        <slot name="footer" />
                    </slot>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
