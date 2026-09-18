<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue';

const InputField = defineAsyncComponent(() => import('../InputField.vue'));

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [],
    },
    fields: {
        type: Array,
        default: () => [],
    },
    defaultItem: {
        type: Object,
        default: null,
    },
    min: {
        type: Number,
        default: 1,
    },
    max: {
        type: Number,
        default: null,
    },
    addButtonText: {
        type: String,
        default: 'Tambahkan Data',
    },
    addIcon: {
        type: String,
        default: 'add',
    },
    addPosition: {
        type: String,
        default: 'bottom', // 'bottom', 'header', 'both'
        validator: (val) => ['bottom', 'header', 'both'].includes(val),
    },
    itemTitle: {
        type: [String, Function],
        default: 'Item',
    },
    itemSubtitle: {
        type: [String, Function],
        default: '',
    },
    columns: {
        type: [Number, String],
        default: 2,
    },
    collapsible: {
        type: Boolean,
        default: false,
    },
    defaultCollapsed: {
        type: Boolean,
        default: false,
    },
    reorderable: {
        type: Boolean,
        default: true,
    },
    deletable: {
        type: Boolean,
        default: true,
    },
    duplicable: {
        type: Boolean,
        default: true,
    },
    confirmDelete: {
        type: Boolean,
        default: false,
    },
    cardVariant: {
        type: String,
        default: 'bordered', // 'bordered', 'flat', 'glass', 'default'
        validator: (val) => ['bordered', 'flat', 'glass', 'default'].includes(val),
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        default: 'items',
    },
    errors: {
        type: Object,
        default: () => ({}),
    },
    emptyTitle: {
        type: String,
        default: 'Belum ada data',
    },
    emptyDescription: {
        type: String,
        default: 'Klik tombol di bawah untuk menambahkan entri formulir pertama.',
    },
});

const emit = defineEmits([
    'update:modelValue',
    'change',
    'item-add',
    'item-remove',
    'item-duplicate',
    'item-move',
    'max-reached',
]);

// Unique ID generator for FLIP transition tracking
let idCounter = 0;
const generateId = () => `rep_${Date.now().toString(36)}_${++idCounter}_${Math.random().toString(36).substring(2, 6)}`;

const ensureId = (item) => {
    if (!item || typeof item !== 'object') return item;
    if (!item._repeater_id) {
        Object.defineProperty(item, '_repeater_id', {
            value: generateId(),
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }
    return item;
};

// Helper to construct a fresh item template
const createBlankItem = () => {
    if (props.defaultItem && typeof props.defaultItem === 'object') {
        return JSON.parse(JSON.stringify(props.defaultItem));
    }
    const blank = {};
    props.fields.forEach((f) => {
        if (f.name) {
            blank[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
        }
    });
    return blank;
};

// Internal list state
const items = ref([]);

// Visual animation indicators
const justAddedId = ref(null);
const movingId = ref(null);

// Track collapsed state keyed by item unique ID
const collapsedStates = ref({});

// Resolve persistent key for Vue TransitionGroup
const getItemKey = (item, index) => {
    if (item && item._repeater_id) return item._repeater_id;
    if (item && item.id !== undefined) return `item-id-${item.id}`;
    return `rep-row-${index}`;
};

// Collapse state helper (compatible with index or item object)
const isItemCollapsed = (item, index) => {
    const key = item && item._repeater_id ? item._repeater_id : (item && item.id !== undefined ? item.id : index);
    return !!collapsedStates.value[key];
};

const toggleCollapse = (target) => {
    let key;
    if (typeof target === 'number') {
        const item = items.value[target];
        key = item ? (item._repeater_id || item.id) : target;
    } else if (target && typeof target === 'object') {
        key = target._repeater_id || target.id;
    }
    if (key !== undefined) {
        collapsedStates.value[key] = !collapsedStates.value[key];
    }
};

// Initialize items ensuring min count
const initializeItems = () => {
    const source = Array.isArray(props.modelValue) ? props.modelValue : [];
    if (source.length === 0 && props.min > 0) {
        const initial = [];
        for (let i = 0; i < props.min; i++) {
            initial.push(ensureId(createBlankItem()));
        }
        items.value = initial;
        emit('update:modelValue', items.value);
    } else {
        items.value = source.map((item) => {
            const copy = JSON.parse(JSON.stringify(item));
            return ensureId(copy);
        });
    }

    if (props.defaultCollapsed) {
        items.value.forEach((item) => {
            if (item._repeater_id) {
                collapsedStates.value[item._repeater_id] = true;
            }
        });
    }
};

watch(
    () => props.modelValue,
    (newVal) => {
        if (Array.isArray(newVal)) {
            // Only update if reference or length or stringified value differs
            if (JSON.stringify(newVal) !== JSON.stringify(items.value)) {
                items.value = newVal.map((item, idx) => {
                    const copy = JSON.parse(JSON.stringify(item));
                    if (items.value[idx] && items.value[idx]._repeater_id && JSON.stringify(items.value[idx]) === JSON.stringify(item)) {
                        Object.defineProperty(copy, '_repeater_id', {
                            value: items.value[idx]._repeater_id,
                            enumerable: false,
                            writable: true,
                            configurable: true,
                        });
                        return copy;
                    }
                    return ensureId(copy);
                });
            }
        }
    },
    { deep: true }
);

onMounted(() => {
    initializeItems();
});

const isMaxReached = computed(() => {
    if (props.max === null || props.max === undefined) return false;
    return items.value.length >= Number(props.max);
});

const canAdd = computed(() => {
    if (props.disabled || props.readonly) return false;
    return !isMaxReached.value;
});

const canRemove = computed(() => {
    if (props.disabled || props.readonly || !props.deletable) return false;
    return items.value.length > Number(props.min);
});

const countBadge = computed(() => {
    if (props.max !== null && props.max !== undefined) {
        return `${items.value.length} / ${props.max}`;
    }
    return `${items.value.length}`;
});

// Grid columns class mapping
const gridClass = computed(() => {
    switch (Number(props.columns)) {
        case 1:
            return 'grid-cols-1';
        case 3:
            return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4:
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        case 2:
        default:
            return 'grid-cols-1 sm:grid-cols-2';
    }
});

// Card variant style mapping
const cardVariantClass = computed(() => {
    switch (props.cardVariant) {
        case 'flat':
            return 'bg-slate-50 dark:bg-slate-800/50 border border-transparent';
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60 shadow-sm';
        case 'default':
            return 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs';
        case 'bordered':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs';
    }
});

// Resolve dynamic item title
const getItemTitle = (item, index) => {
    if (typeof props.itemTitle === 'function') {
        return props.itemTitle(item, index);
    }
    return `${props.itemTitle} #${index + 1}`;
};

// Resolve dynamic item subtitle
const getItemSubtitle = (item, index) => {
    if (typeof props.itemSubtitle === 'function') {
        return props.itemSubtitle(item, index);
    }
    return props.itemSubtitle || '';
};

// Extract field error from Laravel/Inertia errors object
const getFieldError = (itemIndex, fieldName) => {
    if (!props.errors || typeof props.errors !== 'object') return '';

    const patterns = [
        `${props.name}.${itemIndex}.${fieldName}`,
        `items.${itemIndex}.${fieldName}`,
        `${itemIndex}.${fieldName}`,
    ];

    for (const p of patterns) {
        if (props.errors[p]) {
            return Array.isArray(props.errors[p]) ? props.errors[p][0] : props.errors[p];
        }
    }
    return '';
};

// Actions
const addItem = () => {
    if (!canAdd.value) {
        emit('max-reached', props.max);
        return;
    }
    const newItem = ensureId(createBlankItem());
    items.value.push(newItem);

    // Trigger smooth enter highlight
    justAddedId.value = newItem._repeater_id;
    setTimeout(() => {
        if (justAddedId.value === newItem._repeater_id) {
            justAddedId.value = null;
        }
    }, 1200);

    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-add', { item: newItem, index: items.value.length - 1 });

    if (isMaxReached.value) {
        emit('max-reached', props.max);
    }
};

const duplicateItem = (index) => {
    if (!canAdd.value) {
        emit('max-reached', props.max);
        return;
    }
    const cloned = JSON.parse(JSON.stringify(items.value[index]));
    ensureId(cloned);
    const insertAt = index + 1;
    items.value.splice(insertAt, 0, cloned);

    // Trigger smooth enter highlight
    justAddedId.value = cloned._repeater_id;
    setTimeout(() => {
        if (justAddedId.value === cloned._repeater_id) {
            justAddedId.value = null;
        }
    }, 1200);

    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-duplicate', { item: cloned, newIndex: insertAt });

    if (isMaxReached.value) {
        emit('max-reached', props.max);
    }
};

const moveUp = (index) => {
    if (index <= 0) return;
    const movedItem = items.value[index];
    movingId.value = movedItem._repeater_id;
    setTimeout(() => {
        if (movingId.value === movedItem._repeater_id) {
            movingId.value = null;
        }
    }, 450);

    const [moved] = items.value.splice(index, 1);
    items.value.splice(index - 1, 0, moved);
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-move', { fromIndex: index, toIndex: index - 1 });
};

const moveDown = (index) => {
    if (index >= items.value.length - 1) return;
    const movedItem = items.value[index];
    movingId.value = movedItem._repeater_id;
    setTimeout(() => {
        if (movingId.value === movedItem._repeater_id) {
            movingId.value = null;
        }
    }, 450);

    const [moved] = items.value.splice(index, 1);
    items.value.splice(index + 1, 0, moved);
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-move', { fromIndex: index, toIndex: index + 1 });
};

const removeItem = (index) => {
    if (!canRemove.value) return;

    if (props.confirmDelete) {
        const itemLabel = getItemTitle(items.value[index], index);
        if (!window.confirm(`Hapus ${itemLabel}? Data yang telah diisi akan hilang.`)) {
            return;
        }
    }

    const removed = items.value.splice(index, 1)[0];
    if (removed && removed._repeater_id) {
        delete collapsedStates.value[removed._repeater_id];
    }
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-remove', { item: removed, index });
};

// Lock dimensions and position on item leave for seamless FLIP transitions
const onBeforeLeave = (el) => {
    el.style.top = `${el.offsetTop}px`;
    el.style.left = `${el.offsetLeft}px`;
    el.style.width = `${el.offsetWidth}px`;
};

const updateFieldValue = (index, fieldName, value) => {
    if (!items.value[index]) return;
    items.value[index][fieldName] = value;
    emit('update:modelValue', items.value);
    emit('change', items.value);
};

// Colspan helper for field grid items
const getColSpanClass = (field) => {
    if (!field.colSpan) return 'col-span-1';
    if (field.colSpan === 'full' || field.colSpan === 2 || field.colSpan === '2') {
        return 'col-span-1 sm:col-span-2';
    }
    if (field.colSpan === 3 || field.colSpan === '3') {
        return 'col-span-1 sm:col-span-2 lg:col-span-3';
    }
    if (typeof field.colSpan === 'string' && field.colSpan.startsWith('col-span-')) {
        return field.colSpan;
    }
    return 'col-span-1';
};
</script>

<template>
    <div class="w-full space-y-3.5">
        <!-- Header Controls (Optional when addPosition is 'header' or 'both') -->
        <div
            v-if="['header', 'both'].includes(addPosition)"
            class="flex items-center justify-between pb-1"
        >
            <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total: <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ countBadge }}</strong>
                </span>
                <span
                    v-if="isMaxReached"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60"
                >
                    Maksimal Tercapai
                </span>
            </div>

            <slot
                name="add-button"
                :add="addItem"
                :can-add="canAdd"
                :count="items.length"
                :max="max"
                :is-max-reached="isMaxReached"
            >
                <button
                    type="button"
                    @click="addItem"
                    :disabled="!canAdd"
                    class="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:shadow-blue-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 shadow-2xs cursor-pointer"
                >
                    <span class="material-symbols-outlined text-sm leading-none transition-transform duration-200 group-hover:scale-110">{{ addIcon }}</span>
                    <span>{{ addButtonText }}</span>
                </button>
            </slot>
        </div>

        <!-- Repeated Items List with Buttery-Smooth FLIP TransitionGroup -->
        <TransitionGroup
            tag="div"
            enter-active-class="repeater-enter-active"
            enter-from-class="opacity-0 -translate-y-4 scale-[0.98]"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="repeater-leave-active"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
            move-class="repeater-card-move"
            class="flex flex-col gap-3.5 relative"
            @before-leave="onBeforeLeave"
        >
            <div
                v-for="(item, index) in items"
                :key="getItemKey(item, index)"
                class="rounded-2xl transition-all duration-300 relative"
                :class="[
                    cardVariantClass,
                    size === 'sm' ? 'p-3' : (size === 'lg' ? 'p-5' : 'p-4'),
                    justAddedId === item._repeater_id ? 'ring-2 ring-blue-500/60 shadow-md shadow-blue-500/15' : '',
                    movingId === item._repeater_id ? 'z-10 shadow-lg ring-1 ring-blue-500/40 -translate-y-0.5' : '',
                ]"
            >
                <!-- Item Card Header -->
                <div
                    class="flex items-center justify-between gap-3 select-none transition-all duration-200"
                    :class="collapsible && isItemCollapsed(item, index) ? 'pb-0 border-b-0' : 'pb-3 border-b border-slate-100 dark:border-slate-800/80'"
                >
                    <slot
                        name="item-header"
                        :item="item"
                        :index="index"
                        :title="getItemTitle(item, index)"
                        :remove="() => removeItem(index)"
                        :can-remove="canRemove"
                        :toggle-collapse="() => toggleCollapse(item)"
                        :is-collapsed="isItemCollapsed(item, index)"
                    >
                        <div class="flex items-center gap-2.5 min-w-0">
                            <!-- Index Badge Pill -->
                            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shrink-0 transition-colors">
                                {{ index + 1 }}
                            </span>

                            <!-- Title & Subtitle -->
                            <div class="min-w-0">
                                <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {{ getItemTitle(item, index) }}
                                </h4>
                                <p v-if="getItemSubtitle(item, index)" class="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                    {{ getItemSubtitle(item, index) }}
                                </p>
                            </div>
                        </div>

                        <!-- Action Controls (Reorder, Duplicate, Collapse, Delete) -->
                        <div class="flex items-center gap-1 shrink-0">
                            <!-- Move Up -->
                            <button
                                v-if="reorderable && items.length > 1"
                                type="button"
                                @click="moveUp(index)"
                                :disabled="index === 0 || disabled || readonly"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:-translate-y-0.5 active:scale-90 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-150 cursor-pointer"
                                title="Pindah ke Atas"
                            >
                                <span class="material-symbols-outlined text-base leading-none">arrow_upward</span>
                            </button>

                            <!-- Move Down -->
                            <button
                                v-if="reorderable && items.length > 1"
                                type="button"
                                @click="moveDown(index)"
                                :disabled="index === items.length - 1 || disabled || readonly"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:translate-y-0.5 active:scale-90 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-150 cursor-pointer"
                                title="Pindah ke Bawah"
                            >
                                <span class="material-symbols-outlined text-base leading-none">arrow_downward</span>
                            </button>

                            <!-- Duplicate -->
                            <button
                                v-if="duplicable"
                                type="button"
                                @click="duplicateItem(index)"
                                :disabled="!canAdd"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-105 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-150 cursor-pointer"
                                title="Duplikasi Baris"
                            >
                                <span class="material-symbols-outlined text-base leading-none">content_copy</span>
                            </button>

                            <!-- Collapse / Expand Toggle -->
                            <button
                                v-if="collapsible"
                                type="button"
                                @click="toggleCollapse(item)"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-90 transition-all duration-150 cursor-pointer"
                                :title="isItemCollapsed(item, index) ? 'Buka Form' : 'Lipat Form'"
                            >
                                <span
                                    class="material-symbols-outlined text-base leading-none transition-transform duration-300 ease-out"
                                    :class="isItemCollapsed(item, index) ? '-rotate-90' : 'rotate-0'"
                                >
                                    expand_more
                                </span>
                            </button>

                            <!-- Delete / Remove Button -->
                            <button
                                v-if="deletable"
                                type="button"
                                @click="removeItem(index)"
                                :disabled="!canRemove"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:scale-105 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-150 cursor-pointer ml-1"
                                :title="canRemove ? 'Hapus Pendaftar' : `Minimal ${min} data wajib ada`"
                            >
                                <span class="material-symbols-outlined text-base leading-none">delete</span>
                            </button>
                        </div>
                    </slot>
                </div>

                <!-- Item Fields Body (Smooth Rolling Accordion Transition) -->
                <div
                    class="grid transition-all duration-300 ease-in-out"
                    :class="collapsible && isItemCollapsed(item, index) ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
                >
                    <div class="overflow-hidden min-h-0">
                        <div class="pt-3.5">
                            <!-- Custom Slot Override -->
                            <slot
                                name="default"
                                :item="item"
                                :index="index"
                                :remove="() => removeItem(index)"
                                :can-remove="canRemove"
                                :is-first="index === 0"
                                :is-last="index === items.length - 1"
                                :move-up="() => moveUp(index)"
                                :move-down="() => moveDown(index)"
                                :duplicate="() => duplicateItem(index)"
                                :update-field="(field, val) => updateFieldValue(index, field, val)"
                            >
                                <!-- Default Automated Form Fields Grid -->
                                <div class="grid gap-3.5" :class="gridClass">
                                    <div
                                        v-for="field in fields"
                                        :key="`row-${item._repeater_id || index}-field-${field.name}`"
                                        :class="getColSpanClass(field)"
                                    >
                                        <slot
                                            :name="`field-${field.name}`"
                                            :item="item"
                                            :index="index"
                                            :field="field"
                                            :value="item[field.name]"
                                            :update="(val) => updateFieldValue(index, field.name, val)"
                                        >
                                            <InputField
                                                :id="`${name}_${index}_${field.name}`"
                                                :name="`${name}[${index}][${field.name}]`"
                                                v-model="item[field.name]"
                                                :type="field.type || 'text'"
                                                :label="field.label || ''"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required || false"
                                                :disabled="disabled || field.disabled || false"
                                                :readonly="readonly || field.readonly || false"
                                                :icon="field.icon || ''"
                                                :icon-right="field.iconRight || ''"
                                                :prefix="field.prefix || ''"
                                                :suffix="field.suffix || ''"
                                                :options="field.options || []"
                                                :rows="field.rows || 3"
                                                :hint="field.hint || ''"
                                                :size="field.size || size"
                                                :error="getFieldError(index, field.name)"
                                                v-bind="field.props || {}"
                                                @change="$emit('change', items)"
                                            />
                                        </slot>
                                    </div>
                                </div>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </TransitionGroup>

        <!-- Empty State with Smooth Fade Transition -->
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
            <div
                v-if="items.length === 0"
                class="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 select-none"
            >
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <span class="material-symbols-outlined text-xl">group_off</span>
                </div>
                <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ emptyTitle }}</h4>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">{{ emptyDescription }}</p>
            </div>
        </Transition>

        <!-- Bottom Add Button & Limitations Indicator -->
        <div
            v-if="['bottom', 'both'].includes(addPosition)"
            class="pt-1 space-y-2"
        >
            <slot
                name="add-button"
                :add="addItem"
                :can-add="canAdd"
                :count="items.length"
                :max="max"
                :is-max-reached="isMaxReached"
            >
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <button
                        type="button"
                        @click="addItem"
                        :disabled="!canAdd"
                        class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 shadow-sm shadow-blue-600/20 cursor-pointer"
                    >
                        <span class="material-symbols-outlined text-base leading-none transition-transform duration-200 group-hover:scale-110">{{ addIcon }}</span>
                        <span>{{ addButtonText }}</span>
                    </button>

                    <!-- Limit Indicator Pill -->
                    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1 font-medium">
                            <span class="material-symbols-outlined text-sm leading-none text-slate-400">info</span>
                            <span>Jumlah: <strong class="font-mono text-slate-700 dark:text-slate-200">{{ countBadge }}</strong></span>
                        </span>
                        <span
                            v-if="isMaxReached"
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60"
                        >
                            Batas Maksimal Tercapai
                        </span>
                    </div>
                </div>
            </slot>
        </div>
    </div>
</template>

<style scoped>
.repeater-card-move {
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.repeater-leave-active {
    position: absolute !important;
    pointer-events: none !important;
    z-index: 0 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.repeater-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
</style>
