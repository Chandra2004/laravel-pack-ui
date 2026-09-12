<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

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
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const containerRef = ref(null);
const searchInputRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);

useClickOutside(containerRef, () => {
    if (isOpen.value) {
        closeDropdown();
    }
});

// Normalize options to uniform array of objects: { value, label, subtext, disabled }
const normalizedOptions = computed(() => {
    return props.options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                value: opt.value,
                label: opt.label !== undefined ? opt.label : opt.value,
                subtext: opt.subtext || '',
                disabled: !!opt.disabled,
            };
        }
        return {
            value: opt,
            label: String(opt),
            subtext: '',
            disabled: false,
        };
    });
});

// Filtered options based on search query
const filteredOptions = computed(() => {
    if (!searchQuery.value.trim()) return normalizedOptions.value;
    const query = searchQuery.value.toLowerCase();
    return normalizedOptions.value.filter(opt =>
        opt.label.toLowerCase().includes(query) ||
        opt.subtext.toLowerCase().includes(query)
    );
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

const isSelected = (val) => {
    if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(val);
    }
    return String(props.modelValue) === String(val);
};

const toggleDropdown = () => {
    if (props.disabled || props.readonly || props.loading) return;
    if (isOpen.value) {
        closeDropdown();
    } else {
        openDropdown();
    }
};

const openDropdown = () => {
    isOpen.value = true;
    searchQuery.value = '';
    highlightedIndex.value = -1;
    emit('focus');
    nextTick(() => {
        if (isSearchVisible.value && searchInputRef.value) {
            searchInputRef.value.focus();
        }
    });
};

const closeDropdown = () => {
    isOpen.value = false;
    searchQuery.value = '';
    highlightedIndex.value = -1;
    emit('blur');
};

const selectOption = (opt) => {
    if (opt.disabled) return;

    if (props.multiple) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        const idx = current.indexOf(opt.value);
        if (idx > -1) {
            current.splice(idx, 1);
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

const handleKeyDown = (e) => {
    if (!isOpen.value) {
        if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            openDropdown();
        }
        return;
    }

    switch (e.key) {
        case 'Escape':
            e.preventDefault();
            closeDropdown();
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (filteredOptions.value.length > 0) {
                highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length;
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (filteredOptions.value.length > 0) {
                highlightedIndex.value = (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length;
            }
            break;
        case 'Enter':
            e.preventDefault();
            if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
                selectOption(filteredOptions.value[highlightedIndex.value]);
            }
            break;
    }
};

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                trigger: 'px-2.5 py-1 text-xs min-h-[32px]',
                icon: 'text-base',
            };
        case 'lg':
            return {
                trigger: 'px-3.5 py-2.5 text-base min-h-[44px]',
                icon: 'text-xl',
            };
        case 'md':
        default:
            return {
                trigger: 'px-3 py-1.5 text-sm min-h-[38px]',
                icon: 'text-lg',
            };
    }
});

const triggerButtonRef = ref(null);

const focus = () => {
    triggerButtonRef.value?.focus();
};

defineExpose({
    open: openDropdown,
    close: closeDropdown,
    focus,
    isOpen,
    triggerButtonRef,
});
</script>

<template>
    <div ref="containerRef" class="relative w-full" @keydown="handleKeyDown">
        <!-- Hidden Native Input for standard Form submissions -->
        <input
            :id="id"
            type="hidden"
            :name="name"
            :value="Array.isArray(modelValue) ? modelValue.join(',') : modelValue"
            :required="required && !modelValue"
        />

        <!-- PrimeVue Styled Dropdown Trigger Button -->
        <button
            ref="triggerButtonRef"
            type="button"
            role="combobox"
            :aria-expanded="isOpen"
            :aria-controls="`listbox-${id}`"
            :disabled="disabled || loading"
            @click="toggleDropdown"
            class="w-full flex items-center justify-between text-left rounded-xl bg-white dark:bg-slate-900 border shadow-2xs transition-all duration-150 select-none focus:outline-hidden cursor-pointer"
            :class="[
                sizeClasses.trigger,
                icon ? 'pl-11' : '',
                isOpen ? 'border-blue-600 dark:border-blue-500 ring-4 ring-blue-500/15' : '',
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                    : !isOpen ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15' : '',
                disabled || loading ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed' : '',
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

            <!-- Value / Placeholder Text -->
            <span
                class="truncate flex-1 mr-2"
                :class="selectedLabel ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'"
            >
                {{ selectedLabel || placeholder }}
            </span>

            <!-- Right Icon (Chevron / Loading Spinner) -->
            <div class="flex items-center gap-1 shrink-0 text-slate-400 dark:text-slate-500">
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
        </button>

        <!-- PrimeVue Styled Floating Popover Panel -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-1"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-1"
        >
            <div
                v-if="isOpen"
                :id="`listbox-${id}`"
                role="listbox"
                class="absolute left-0 right-0 z-50 mt-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            >
                <!-- Search Filter Input (PrimeVue Header Filter) -->
                <div v-if="isSearchVisible" class="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                    <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-2.5 text-slate-400 text-base leading-none pointer-events-none">
                            search
                        </span>
                        <input
                            ref="searchInputRef"
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari opsi..."
                            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            @click.stop
                        />
                        <button
                            v-if="searchQuery"
                            type="button"
                            @click.stop="searchQuery = ''"
                            class="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <span class="material-symbols-outlined text-sm leading-none">close</span>
                        </button>
                    </div>
                </div>

                <!-- Options List Container (Smooth Scrollable) -->
                <ul class="max-h-60 overflow-y-auto overscroll-contain p-1.5 space-y-0.5 focus:outline-hidden divide-y divide-transparent">
                    <li
                        v-for="(opt, idx) in filteredOptions"
                        :key="idx"
                        role="option"
                        :aria-selected="isSelected(opt.value)"
                        @click.stop="selectOption(opt)"
                        class="relative flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg cursor-pointer select-none transition-colors duration-100"
                        :class="[
                            isSelected(opt.value)
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                                : highlightedIndex === idx
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80',
                            opt.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
                        ]"
                    >
                        <div class="space-y-0.5 min-w-0 flex-1 mr-2">
                            <div class="truncate">{{ opt.label }}</div>
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
                    </li>

                    <!-- Empty Search State -->
                    <li
                        v-if="filteredOptions.length === 0"
                        class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500 select-none"
                    >
                        Tidak ada pilihan yang cocok
                    </li>
                </ul>
            </div>
        </Transition>
    </div>
</template>
