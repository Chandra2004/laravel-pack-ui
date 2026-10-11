<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Card from '../Card.vue';
import ButtonSubmit from '../ButtonSubmit.vue';
import Badge from '../Badge.vue';
import InputField from '../InputField.vue';
import Modal from '../Modal.vue';

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
        default: 5,
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
        default: 'bottom', // 'bottom', 'top', 'both', 'header', 'none'
        validator: (val) => ['bottom', 'top', 'both', 'header', 'none'].includes(val),
    },
    addAlignment: {
        type: String,
        default: 'left', // 'left', 'center', 'right', 'full'
        validator: (val) => ['left', 'center', 'right', 'full'].includes(val),
    },
    rounded: {
        type: String,
        default: '2xl', // 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
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
    draggable: {
        type: Boolean,
        default: true,
    },
    dragHandleOnly: {
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
        default: true,
    },
    confirmDeleteTitle: {
        type: String,
        default: 'Hapus Entri Formulir?',
    },
    confirmDeleteMessage: {
        type: String,
        default: 'Apakah Anda yakin ingin menghapus entri ini? Seluruh data yang telah dimasukkan tidak dapat dikembalikan.',
    },
    swipeToDelete: {
        type: Boolean,
        default: true,
    },
    cardVariant: {
        type: String,
        default: 'bordered', // 'bordered', 'flat', 'glass', 'default', 'elevated', 'accent'
        validator: (val) => ['bordered', 'flat', 'glass', 'default', 'elevated', 'accent'].includes(val),
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
    'drag-start',
    'drag-end',
    'delete-request',
    'delete-cancel',
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

// Internal Items State
const items = ref([]);

// Animation and State Tracking
const justAddedId = ref(null);
const duplicatedId = ref(null);
const movingId = ref(null);
const deletingId = ref(null);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const dropPosition = ref(null);

// Modal State
const showDeleteModal = ref(false);
const itemToDelete = ref(null); // { index, item, title, preview }

// Touch Swipe State (Mobile / Tablet)
const swipeOffsets = ref({});
const isSwiping = ref(false);
let touchStartX = 0;
let touchStartY = 0;
let activeSwipeId = null;
let isHorizontalGesture = null;

// Collapsed state mapping by unique item ID
const collapsedStates = ref({});

const isItemCollapsed = (item, index) => {
    const key = item._repeater_id || index;
    if (collapsedStates.value[key] !== undefined) {
        return collapsedStates.value[key];
    }
    return props.defaultCollapsed;
};

const toggleCollapse = (item) => {
    const key = item._repeater_id;
    if (key) {
        collapsedStates.value[key] = !isItemCollapsed(item);
    }
};

// Stable Key Resolver
const getItemKey = (item, index) => {
    ensureId(item);
    return item._repeater_id || `idx_${index}`;
};

// Minimum items constraint (strictly >= 1)
const effectiveMin = computed(() => Math.max(1, Number(props.min) || 1));

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
    return items.value.length > effectiveMin.value;
});

const countBadge = computed(() => {
    if (props.max !== null && props.max !== undefined) {
        return `${items.value.length} / ${props.max}`;
    }
    return `${items.value.length}`;
});

// Grid columns class mapping for mobile, tablet, and desktop (1 to 6 columns)
const gridClass = computed(() => {
    const colNum = Number(props.columns);
    switch (colNum) {
        case 1:
            return 'grid-cols-1';
        case 3:
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        case 4:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
        case 5:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
        case 6:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
        case 2:
        default:
            return 'grid-cols-1 sm:grid-cols-2';
    }
});

// Border radius class mapping
const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case '3xl': return 'rounded-3xl';
        case 'full': return 'rounded-3xl';
        case '2xl':
        default:
            return 'rounded-2xl';
    }
});

// Border radius right-side class for swipe tray
const roundedRightClass = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-r-none';
        case 'sm': return 'rounded-r-sm';
        case 'md': return 'rounded-r-md';
        case 'lg': return 'rounded-r-lg';
        case 'xl': return 'rounded-r-xl';
        case '3xl': return 'rounded-r-3xl';
        case 'full': return 'rounded-r-3xl';
        case '2xl':
        default:
            return 'rounded-r-2xl';
    }
});

// Premium Visual Card Variant Styling
const cardVariantClasses = computed(() => {
    switch (props.cardVariant) {
        case 'flat':
            return 'bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/50 shadow-none';
        case 'glass':
            return 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/25';
        case 'elevated':
            return 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-900/5 dark:shadow-black/20 hover:shadow-lg transition-shadow';
        case 'accent':
            return 'bg-white dark:bg-slate-900 border-l-4 border-l-primary-500 border border-slate-200 dark:border-slate-800 shadow-xs';
        case 'default':
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs';
        case 'bordered':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700';
    }
});

// Comprehensive size styling configuration that scales the ENTIRE card
const sizeConfig = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                cardPadding: 'p-2.5 sm:p-3',
                headerPadding: 'pb-2',
                headerGap: 'gap-1.5 sm:gap-2',
                titleClass: 'text-xs font-bold text-slate-800 dark:text-slate-100',
                subtitleClass: 'text-[10px] text-slate-400 dark:text-slate-500',
                badgeClass: 'w-5 h-5 text-[10px] font-bold font-mono',
                badgeSize: 'xs',
                actionBtnClass: 'w-6! h-6! p-0!',
                actionIconClass: 'text-[15px] leading-none',
                dragHandleClass: 'w-5 h-5 text-[15px]',
                gridGap: 'gap-2.5 sm:gap-3',
                inputSize: 'sm',
                addBtnSize: 'xs',
                addBtnClass: 'text-xs py-1 px-3',
            };
        case 'lg':
            return {
                cardPadding: 'p-4 sm:p-5 md:p-6',
                headerPadding: 'pb-3.5 sm:pb-4',
                headerGap: 'gap-2.5 sm:gap-3.5',
                titleClass: 'text-base font-bold text-slate-800 dark:text-slate-100',
                subtitleClass: 'text-xs sm:text-sm text-slate-400 dark:text-slate-500',
                badgeClass: 'w-7 h-7 text-sm font-bold font-mono',
                badgeSize: 'md',
                actionBtnClass: 'w-8! h-8! p-0!',
                actionIconClass: 'text-lg leading-none',
                dragHandleClass: 'w-7 h-7 text-lg',
                gridGap: 'gap-4 sm:gap-5',
                inputSize: 'lg',
                addBtnSize: 'md',
                addBtnClass: 'text-sm py-2 px-4',
            };
        case 'md':
        default:
            return {
                cardPadding: 'p-3.5 sm:p-4.5',
                headerPadding: 'pb-2.5 sm:pb-3',
                headerGap: 'gap-2 sm:gap-2.5',
                titleClass: 'text-sm font-bold text-slate-800 dark:text-slate-100',
                subtitleClass: 'text-[11px] text-slate-400 dark:text-slate-500',
                badgeClass: 'w-6 h-6 text-xs font-bold font-mono',
                badgeSize: 'sm',
                actionBtnClass: 'w-7! h-7! p-0!',
                actionIconClass: 'text-base leading-none',
                dragHandleClass: 'w-6 h-6 text-base',
                gridGap: 'gap-3 sm:gap-3.5',
                inputSize: 'md',
                addBtnSize: 'sm',
                addBtnClass: 'text-xs py-1.5 px-3.5',
            };
    }
});

// Add button width helper
const addBtnWidthClass = computed(() => {
    return props.addAlignment === 'full' ? 'w-full justify-center' : 'w-full sm:w-auto';
});

// Initialization and sync with v-model
const initializeItems = () => {
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
        items.value = props.modelValue.map((it) => ensureId(it));
    } else {
        const initial = [];
        const targetCount = effectiveMin.value;
        for (let i = 0; i < targetCount; i++) {
            initial.push(ensureId(createBlankItem()));
        }
        items.value = initial;
        emit('update:modelValue', items.value);
    }
};

watch(
    () => props.modelValue,
    (newVal) => {
        if (!Array.isArray(newVal)) return;

        const isDifferentLength = newVal.length !== items.value.length;
        let isContentDifferent = isDifferentLength;

        if (!isDifferentLength) {
            for (let i = 0; i < newVal.length; i++) {
                if (newVal[i] !== items.value[i]) {
                    isContentDifferent = true;
                    break;
                }
            }
        }

        if (isContentDifferent) {
            items.value = newVal.map((it) => ensureId(it));
            if (items.value.length < effectiveMin.value) {
                const target = effectiveMin.value - items.value.length;
                for (let i = 0; i < target; i++) {
                    items.value.push(ensureId(createBlankItem()));
                }
                emit('update:modelValue', items.value);
            }
        }
    },
    { deep: true }
);

// Synchronously initialize items during setup
initializeItems();

onMounted(() => {
    if (items.value.length === 0) {
        initializeItems();
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

// -------------------------------------------------------------
// Core Actions & Animations
// -------------------------------------------------------------
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
    }, 1400);

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

    // Trigger smooth duplication highlight & floating pill
    duplicatedId.value = cloned._repeater_id;
    justAddedId.value = cloned._repeater_id;
    setTimeout(() => {
        if (duplicatedId.value === cloned._repeater_id) {
            duplicatedId.value = null;
        }
        if (justAddedId.value === cloned._repeater_id) {
            justAddedId.value = null;
        }
    }, 1800);

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
    }, 500);

    const [moved] = items.value.splice(index, 1);
    items.value.splice(index - 1, 0, moved);
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-move', { fromIndex: index, toIndex: index - 1, method: 'button' });
};

const moveDown = (index) => {
    if (index >= items.value.length - 1) return;
    const movedItem = items.value[index];
    movingId.value = movedItem._repeater_id;
    setTimeout(() => {
        if (movingId.value === movedItem._repeater_id) {
            movingId.value = null;
        }
    }, 500);

    const [moved] = items.value.splice(index, 1);
    items.value.splice(index + 1, 0, moved);
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-move', { fromIndex: index, toIndex: index + 1, method: 'button' });
};

// -------------------------------------------------------------
// Deletion with Confirmation Modal
// -------------------------------------------------------------
const promptDeleteItem = (index) => {
    if (!canRemove.value) return;
    const item = items.value[index];
    if (!item) return;

    if (props.confirmDelete) {
        const title = getItemTitle(item, index);
        // Build readable preview summary
        const summaryParts = [];
        props.fields.forEach((f) => {
            if (item[f.name] !== undefined && item[f.name] !== '' && item[f.name] !== null) {
                summaryParts.push(`${f.label || f.name}: ${item[f.name]}`);
            }
        });
        const preview = summaryParts.length > 0 ? summaryParts.slice(0, 3).join(' • ') : null;

        itemToDelete.value = {
            index,
            item,
            title,
            preview,
        };
        showDeleteModal.value = true;
        emit('delete-request', { index, item });
    } else {
        executeDelete(index);
    }
};

const executeDelete = (index) => {
    const item = items.value[index];
    if (!item) return;

    deletingId.value = item._repeater_id;
    if (item._repeater_id) {
        delete collapsedStates.value[item._repeater_id];
        delete swipeOffsets.value[item._repeater_id];
    }

    const removed = items.value.splice(index, 1)[0];
    emit('update:modelValue', items.value);
    emit('change', items.value);
    emit('item-remove', { item: removed, index });
};

const confirmDeleteModal = () => {
    if (itemToDelete.value && itemToDelete.value.index !== undefined) {
        const targetIndex = itemToDelete.value.index;
        showDeleteModal.value = false;
        executeDelete(targetIndex);
        itemToDelete.value = null;
    }
};

const cancelDeleteModal = () => {
    if (itemToDelete.value) {
        emit('delete-cancel', { index: itemToDelete.value.index, item: itemToDelete.value.item });
    }
    showDeleteModal.value = false;
    itemToDelete.value = null;
};

// Aliased for external callers/slots:
const removeItem = (index) => {
    promptDeleteItem(index);
};

const forceRemoveItem = (index) => {
    executeDelete(index);
};

// -------------------------------------------------------------
// Touch Swipe Gesture Handlers (Mobile & Tablet)
// -------------------------------------------------------------
const handleTouchStart = (e, item) => {
    if (!props.swipeToDelete || props.disabled || props.readonly || !canRemove.value) return;
    if (e.touches.length !== 1) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    activeSwipeId = item._repeater_id;
    isHorizontalGesture = null;
    isSwiping.value = true;
};

const handleTouchMove = (e, item) => {
    if (!isSwiping.value || activeSwipeId !== item._repeater_id) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    if (isHorizontalGesture === null) {
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
            isHorizontalGesture = Math.abs(diffX) > Math.abs(diffY);
        }
    }

    if (isHorizontalGesture) {
        if (e.cancelable) {
            e.preventDefault();
        }
        // Swiping left (negative diffX) with rubber-band limit
        if (diffX < 0) {
            const damped = diffX < -80 ? -80 + (diffX + 80) * 0.35 : diffX;
            swipeOffsets.value[item._repeater_id] = Math.max(-110, damped);
        } else {
            swipeOffsets.value[item._repeater_id] = Math.min(20, diffX * 0.2);
        }
    }
};

const handleTouchEnd = (e, item, index) => {
    if (!isSwiping.value || activeSwipeId !== item._repeater_id) return;
    isSwiping.value = false;
    const currentOffset = swipeOffsets.value[item._repeater_id] || 0;

    if (currentOffset < -65) {
        swipeOffsets.value[item._repeater_id] = 0;
        promptDeleteItem(index);
    } else {
        swipeOffsets.value[item._repeater_id] = 0;
    }
    activeSwipeId = null;
    isHorizontalGesture = null;
};

// -------------------------------------------------------------
// Drag & Drop Handlers
// -------------------------------------------------------------
const handleDragStart = (e, index) => {
    if (props.disabled || props.readonly || !props.reorderable || !props.draggable) return;
    draggedIndex.value = index;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    }
    emit('drag-start', { index, item: items.value[index] });
};

const handleDragOver = (e, index) => {
    if (draggedIndex.value === null) return;
    if (draggedIndex.value === index) {
        dragOverIndex.value = null;
        dropPosition.value = null;
        return;
    }

    dragOverIndex.value = index;
    const targetRect = e.currentTarget.getBoundingClientRect();
    const midY = targetRect.top + targetRect.height / 2;
    dropPosition.value = e.clientY < midY ? 'before' : 'after';

    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
};

const handleDragEnter = (e, index) => {
    if (draggedIndex.value === null || draggedIndex.value === index) return;
    dragOverIndex.value = index;
};

const handleDragLeave = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
        e.clientX <= rect.left ||
        e.clientX >= rect.right ||
        e.clientY <= rect.top ||
        e.clientY >= rect.bottom
    ) {
        if (dragOverIndex.value === index) {
            dragOverIndex.value = null;
            dropPosition.value = null;
        }
    }
};

const handleDrop = (e, index) => {
    if (draggedIndex.value === null || draggedIndex.value === index) {
        handleDragEnd();
        return;
    }

    const fromIndex = draggedIndex.value;
    let toIndex = index;

    if (dropPosition.value === 'after' && fromIndex < toIndex) {
        // stay at target
    } else if (dropPosition.value === 'before' && fromIndex > toIndex) {
        // stay at target
    } else if (dropPosition.value === 'after' && fromIndex > toIndex) {
        toIndex = toIndex + 1;
    } else if (dropPosition.value === 'before' && fromIndex < toIndex) {
        toIndex = toIndex - 1;
    }

    toIndex = Math.max(0, Math.min(items.value.length - 1, toIndex));

    if (fromIndex !== toIndex) {
        const movedItem = items.value[fromIndex];
        movingId.value = movedItem._repeater_id;
        setTimeout(() => {
            if (movingId.value === movedItem._repeater_id) {
                movingId.value = null;
            }
        }, 550);

        const [moved] = items.value.splice(fromIndex, 1);
        items.value.splice(toIndex, 0, moved);

        emit('update:modelValue', items.value);
        emit('change', items.value);
        emit('item-move', { fromIndex, toIndex, method: 'drag' });
    }

    handleDragEnd();
};

const handleDragEnd = () => {
    if (draggedIndex.value !== null) {
        emit('drag-end', { index: draggedIndex.value });
    }
    draggedIndex.value = null;
    dragOverIndex.value = null;
    dropPosition.value = null;
};

// Lock dimensions and position on item leave for seamless FLIP transitions
const onBeforeLeave = (el) => {
    el.style.top = `${el.offsetTop}px`;
    el.style.left = `${el.offsetLeft}px`;
    el.style.width = `${el.offsetWidth}px`;
    el.style.height = `${el.offsetHeight}px`;
};

const updateFieldValue = (index, fieldName, value) => {
    if (!items.value[index]) return;
    items.value[index][fieldName] = value;
    emit('update:modelValue', items.value);
    emit('change', items.value);
};

// Responsive Colspan helper for field grid items across breakpoints
const getColSpanClass = (field) => {
    if (!field.colSpan) return 'col-span-1';
    const cols = Number(props.columns);

    if (field.colSpan === 'full') {
        if (cols === 1) return 'col-span-1';
        if (cols === 2) return 'col-span-1 sm:col-span-2';
        if (cols === 3) return 'col-span-1 sm:col-span-2 lg:col-span-3';
        if (cols === 4) return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4';
        if (cols === 5) return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5';
        if (cols >= 6) return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6';
    }

    if (field.colSpan === 2 || field.colSpan === '2') {
        return 'col-span-1 sm:col-span-2';
    }
    if (field.colSpan === 3 || field.colSpan === '3') {
        return 'col-span-1 sm:col-span-2 lg:col-span-3';
    }
    if (field.colSpan === 4 || field.colSpan === '4') {
        return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4';
    }
    if (field.colSpan === 5 || field.colSpan === '5') {
        return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5';
    }
    if (field.colSpan === 6 || field.colSpan === '6') {
        return 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6';
    }
    if (typeof field.colSpan === 'string' && field.colSpan.startsWith('col-span-')) {
        return field.colSpan;
    }
    return 'col-span-1';
};

defineExpose({
    items,
    addItem,
    removeItem,
    forceRemoveItem,
    promptDeleteItem,
    duplicateItem,
    moveUp,
    moveDown,
    toggleCollapse,
    createBlankItem,
    showDeleteModal,
});
</script>

<template>
    <div class="w-full space-y-3.5">
        <!-- Top Add Button Controls (When addPosition is 'top' or 'both') -->
        <div
            v-if="['top', 'both'].includes(addPosition)"
            class="flex items-center w-full"
            :class="[
                addAlignment === 'center' ? 'justify-center' : '',
                addAlignment === 'right' ? 'justify-end' : '',
                addAlignment === 'left' ? 'justify-start' : '',
                addAlignment === 'full' ? 'justify-stretch' : '',
            ]"
        >
            <slot
                name="add-button"
                :add="addItem"
                :can-add="canAdd"
                :count="items.length"
                :max="max"
                :is-max-reached="isMaxReached"
            >
                <ButtonSubmit
                    type="button"
                    variant="primary"
                    :size="sizeConfig.addBtnSize"
                    :icon="addIcon"
                    :disabled="!canAdd"
                    :rounded="rounded"
                    :class="addBtnWidthClass"
                    @click="addItem"
                >
                    <template #icon>
                        <slot name="add-icon">
                            <span v-if="addIcon" class="material-symbols-outlined text-base">{{ addIcon }}</span>
                        </slot>
                    </template>
                    {{ addButtonText }}
                </ButtonSubmit>
            </slot>
        </div>

        <!-- Header Controls (When addPosition is 'header') -->
        <div
            v-if="addPosition === 'header'"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1"
        >
            <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total: <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ countBadge }}</strong>
                </span>
                <Badge
                    v-if="isMaxReached"
                    variant="soft"
                    color="warning"
                    size="xs"
                    icon="warning"
                >
                    Maksimal Tercapai
                </Badge>
            </div>

            <slot
                name="add-button"
                :add="addItem"
                :can-add="canAdd"
                :count="items.length"
                :max="max"
                :is-max-reached="isMaxReached"
            >
                <ButtonSubmit
                    type="button"
                    variant="primary"
                    :size="sizeConfig.addBtnSize"
                    :icon="addIcon"
                    :disabled="!canAdd"
                    :rounded="rounded"
                    :class="addBtnWidthClass"
                    @click="addItem"
                >
                    <template #icon>
                        <slot name="add-icon">
                            <span v-if="addIcon" class="material-symbols-outlined text-base">{{ addIcon }}</span>
                        </slot>
                    </template>
                    {{ addButtonText }}
                </ButtonSubmit>
            </slot>
        </div>

        <!-- Repeated Items List with Drag & Drop, Swipe Gestures, and FLIP TransitionGroup -->
        <TransitionGroup
            tag="div"
            enter-active-class="repeater-enter-active"
            enter-from-class="opacity-0 -translate-y-5 scale-[0.96]"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="repeater-leave-active"
            leave-from-class="opacity-100 scale-100 translate-x-0"
            leave-to-class="opacity-0 scale-95 -translate-x-12"
            move-class="repeater-card-move"
            class="flex flex-col gap-3.5 relative"
            @before-leave="onBeforeLeave"
        >
            <div
                v-for="(item, index) in items"
                :key="getItemKey(item, index)"
                class="relative overflow-hidden group/repeater-wrapper select-none transition-all duration-300"
                :class="[
                    roundedClass,
                    draggedIndex === index ? 'opacity-35 scale-[0.98]' : '',
                    dragOverIndex === index && draggedIndex !== index ? (dropPosition === 'before' ? 'translate-y-1' : '-translate-y-1') : '',
                ]"
                :draggable="!dragHandleOnly && reorderable && draggable && items.length > 1 && !disabled && !readonly"
                @dragstart="!dragHandleOnly && handleDragStart($event, index)"
                @dragover.prevent="handleDragOver($event, index)"
                @dragenter.prevent="handleDragEnter($event, index)"
                @dragleave="handleDragLeave($event, index)"
                @drop.prevent="handleDrop($event, index)"
                @dragend="handleDragEnd"
                @touchstart="handleTouchStart($event, item)"
                @touchmove="handleTouchMove($event, item)"
                @touchend="handleTouchEnd($event, item, index)"
                @touchcancel="handleTouchEnd($event, item, index)"
            >
                <!-- Background Swipe Action Tray (Revealed on Swipe Left for Mobile / Touch) -->
                <div
                    v-if="deletable && canRemove && !disabled && !readonly"
                    class="absolute inset-y-0 right-0 w-28 bg-linear-to-l from-rose-600 via-rose-600 to-rose-500 text-white flex items-center justify-center gap-1.5 pr-2 z-0 cursor-pointer"
                    :class="roundedRightClass"
                    title="Ketuk untuk menghapus"
                    @click="promptDeleteItem(index)"
                >
                    <span class="material-symbols-outlined text-xl">delete</span>
                    <span class="text-xs font-bold uppercase tracking-wider">Hapus</span>
                </div>

                <!-- Drop Indicator Line (Top) -->
                <div
                    v-if="dragOverIndex === index && dropPosition === 'before' && draggedIndex !== index"
                    class="absolute -top-1 left-3 right-3 h-1 bg-linear-to-r from-primary-500 via-indigo-400 to-primary-500 rounded-full z-30 shadow-md shadow-primary-500/40 flex items-center justify-between pointer-events-none transition-all duration-200"
                >
                    <span class="w-2.5 h-2.5 -ml-1 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                    <span class="w-2.5 h-2.5 -mr-1 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                </div>

                <!-- Drop Indicator Line (Bottom) -->
                <div
                    v-if="dragOverIndex === index && dropPosition === 'after' && draggedIndex !== index"
                    class="absolute -bottom-1 left-3 right-3 h-1 bg-linear-to-r from-primary-500 via-indigo-400 to-primary-500 rounded-full z-30 shadow-md shadow-primary-500/40 flex items-center justify-between pointer-events-none transition-all duration-200"
                >
                    <span class="w-2.5 h-2.5 -ml-1 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                    <span class="w-2.5 h-2.5 -mr-1 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                </div>

                <!-- Main Card Component -->
                <Card
                    :variant="cardVariant"
                    padding="none"
                    :rounded="rounded"
                    class="w-full relative z-10 transition-all duration-300 overflow-visible"
                    :class="[
                        cardVariantClasses,
                        duplicatedId === item._repeater_id ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-400/50 shadow-md shadow-emerald-500/10' : '',
                        justAddedId === item._repeater_id && duplicatedId !== item._repeater_id ? 'ring-2 ring-primary-500/60 shadow-md shadow-primary-500/15' : '',
                        movingId === item._repeater_id ? 'z-20 ring-2 ring-primary-500/50 shadow-lg -translate-y-0.5' : '',
                        dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-primary-500/40' : '',
                    ]"
                    :style="{
                        transform: swipeOffsets[item._repeater_id] ? `translateX(${swipeOffsets[item._repeater_id]}px)` : undefined,
                        transition: isSwiping && activeSwipeId === item._repeater_id ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    }"
                >
                    <div :class="[sizeConfig.cardPadding, 'w-full']">
                        <!-- Item Card Header: drag drop | title | up | down | duplicate | trash | collapse -->
                        <div
                            class="flex items-center justify-between select-none transition-all duration-200"
                            :class="[
                                sizeConfig.headerGap,
                                collapsible && isItemCollapsed(item, index) ? 'pb-0 border-b-0' : [sizeConfig.headerPadding, 'border-b border-slate-100 dark:border-slate-800/80']
                            ]"
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
                                :drag-handle-props="{
                                    draggable: true,
                                    onDragstart: (e) => handleDragStart(e, index),
                                    onDragend: handleDragEnd,
                                }"
                                :is-dragging="draggedIndex === index"
                                :is-drag-over="dragOverIndex === index"
                            >
                                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                    <!-- 1. Drag Handle Indicator -->
                                    <div
                                        v-if="reorderable && draggable && items.length > 1 && !disabled && !readonly"
                                        draggable="true"
                                        @dragstart.stop="handleDragStart($event, index)"
                                        @dragend.stop="handleDragEnd"
                                        class="rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-grab active:cursor-grabbing transition-colors select-none shrink-0"
                                        :class="sizeConfig.dragHandleClass"
                                        title="Tarik & lepas untuk mengubah posisi (Drag & Drop)"
                                    >
                                        <span class="material-symbols-outlined leading-none pointer-events-none" :class="sizeConfig.actionIconClass">drag_indicator</span>
                                    </div>

                                    <!-- 2. Index Badge Pill -->
                                    <Badge
                                        variant="soft"
                                        color="primary"
                                        :size="sizeConfig.badgeSize"
                                        rounded="full"
                                        :class="[sizeConfig.badgeClass, 'p-0! flex items-center justify-center font-black font-mono shrink-0']"
                                    >
                                        {{ index + 1 }}
                                    </Badge>

                                    <!-- 2 (cont). Title, Inline Duplication Chip, & Subtitle with responsive truncate -->
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2 flex-wrap min-w-0">
                                            <h4 :class="[sizeConfig.titleClass, 'truncate']">
                                                {{ getItemTitle(item, index) }}
                                            </h4>

                                            <!-- Refined Inline Duplication Chip -->
                                            <Transition
                                                enter-active-class="transition duration-300 ease-out"
                                                enter-from-class="opacity-0 -translate-x-1.5 scale-95"
                                                enter-to-class="opacity-100 translate-x-0 scale-100"
                                                leave-active-class="transition duration-250 ease-in"
                                                leave-from-class="opacity-100 scale-100"
                                                leave-to-class="opacity-0 scale-95"
                                            >
                                                <span
                                                    v-if="duplicatedId === item._repeater_id"
                                                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs shrink-0 select-none"
                                                >
                                                    <span class="relative flex h-1.5 w-1.5">
                                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                    </span>
                                                    <span class="material-symbols-outlined text-[13px] leading-none text-emerald-600 dark:text-emerald-400">content_copy</span>
                                                    <span>Hasil Duplikasi</span>
                                                </span>
                                            </Transition>
                                        </div>
                                        <p v-if="getItemSubtitle(item, index)" :class="[sizeConfig.subtitleClass, 'truncate']">
                                            {{ getItemSubtitle(item, index) }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Action Controls in strict order: up | down | duplicate | trash | collapse -->
                                <div class="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto">
                                    <!-- 3. Move Up -->
                                    <ButtonSubmit
                                        v-if="reorderable && items.length > 1"
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="arrow_upward"
                                        :disabled="index === 0 || disabled || readonly"
                                        rounded="lg"
                                        :class="[sizeConfig.actionBtnClass, 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400']"
                                        title="Pindah ke Atas"
                                        @click="moveUp(index)"
                                    />

                                    <!-- 4. Move Down -->
                                    <ButtonSubmit
                                        v-if="reorderable && items.length > 1"
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="arrow_downward"
                                        :disabled="index === items.length - 1 || disabled || readonly"
                                        rounded="lg"
                                        :class="[sizeConfig.actionBtnClass, 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400']"
                                        title="Pindah ke Bawah"
                                        @click="moveDown(index)"
                                    />

                                    <!-- 5. Duplicate -->
                                    <ButtonSubmit
                                        v-if="duplicable"
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="content_copy"
                                        :disabled="!canAdd"
                                        rounded="lg"
                                        :class="[sizeConfig.actionBtnClass, 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400']"
                                        title="Duplikasi Baris"
                                        @click="duplicateItem(index)"
                                    />

                                    <!-- 6. Trash (Hapus) - Urutan sebelum collapse -->
                                    <ButtonSubmit
                                        v-if="deletable"
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="delete"
                                        :disabled="!canRemove"
                                        rounded="lg"
                                        :class="[sizeConfig.actionBtnClass, 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50']"
                                        :title="canRemove ? 'Hapus' : `Minimal ${effectiveMin} data wajib ada`"
                                        @click="promptDeleteItem(index)"
                                    />

                                    <!-- 7. Collapse (Lipat/Buka) - Paling kanan -->
                                    <ButtonSubmit
                                        v-if="collapsible"
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        :icon="isItemCollapsed(item, index) ? 'expand_more' : 'expand_less'"
                                        rounded="lg"
                                        :class="[sizeConfig.actionBtnClass, 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200']"
                                        :title="isItemCollapsed(item, index) ? 'Buka Form' : 'Lipat Form'"
                                        @click="toggleCollapse(item)"
                                    />
                                </div>
                            </slot>
                        </div>

                        <!-- Item Fields Body (Smooth Rolling Accordion Transition) -->
                        <div
                            class="grid transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            :class="collapsible && isItemCollapsed(item, index) ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
                        >
                            <div class="overflow-hidden min-h-0">
                                <div class="pt-3 sm:pt-3.5">
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
                                        <div class="grid" :class="[gridClass, sizeConfig.gridGap]">
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
                                                        :size="field.size || sizeConfig.inputSize"
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
                </Card>
            </div>
        </TransitionGroup>

        <!-- Empty State with Smooth Fade Transition (Menggunakan Card Pack UI) -->
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
            <Card
                v-if="items.length === 0"
                variant="bordered"
                padding="lg"
                :rounded="rounded"
                class="border-dashed! border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-center select-none"
            >
                <div class="py-3 sm:py-5 flex flex-col items-center justify-center space-y-2.5">
                    <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                        <span class="material-symbols-outlined text-2xl">post_add</span>
                    </div>
                    <div class="space-y-1 max-w-sm mx-auto">
                        <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{{ emptyTitle }}</h4>
                        <p class="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{{ emptyDescription }}</p>
                    </div>
                    <ButtonSubmit
                        v-if="canAdd"
                        type="button"
                        variant="primary"
                        :size="sizeConfig.addBtnSize"
                        :icon="addIcon"
                        :rounded="rounded"
                        class="mt-1"
                        @click="addItem"
                    >
                        <template #icon>
                            <slot name="add-icon">
                                <span v-if="addIcon" class="material-symbols-outlined text-base">{{ addIcon }}</span>
                            </slot>
                        </template>
                        {{ addButtonText }}
                    </ButtonSubmit>
                </div>
            </Card>
        </Transition>

        <!-- Bottom Add Button & Limitations Indicator -->
        <div
            v-if="['bottom', 'both'].includes(addPosition)"
            class="pt-1 space-y-2"
        >
            <div
                class="flex flex-col gap-2.5"
                :class="[
                    addAlignment === 'full' ? 'w-full' : (
                        addAlignment === 'center' ? 'items-center' : (
                            addAlignment === 'right' ? 'items-end' : 'items-start sm:flex-row sm:items-center sm:justify-between'
                        )
                    )
                ]"
            >
                <slot
                    name="add-button"
                    :add="addItem"
                    :can-add="canAdd"
                    :count="items.length"
                    :max="max"
                    :is-max-reached="isMaxReached"
                >
                    <ButtonSubmit
                        type="button"
                        variant="primary"
                        :size="sizeConfig.addBtnSize"
                        :icon="addIcon"
                        :disabled="!canAdd"
                        :rounded="rounded"
                        :class="addBtnWidthClass"
                        @click="addItem"
                    >
                        <template #icon>
                            <slot name="add-icon">
                                <span v-if="addIcon" class="material-symbols-outlined text-base">{{ addIcon }}</span>
                            </slot>
                        </template>
                        {{ addButtonText }}
                    </ButtonSubmit>
                </slot>

                <!-- Limit Indicator Pill -->
                <div
                    class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                    :class="[
                        addAlignment === 'full' ? 'justify-between pt-1' : '',
                        addAlignment === 'center' ? 'justify-center' : '',
                        addAlignment === 'right' ? 'justify-end' : '',
                    ]"
                >
                    <span class="flex items-center gap-1 font-medium">
                        <span class="material-symbols-outlined text-sm leading-none text-slate-400">info</span>
                        <span>Jumlah: <strong class="font-mono text-slate-700 dark:text-slate-200">{{ countBadge }}</strong></span>
                    </span>
                    <Badge
                        v-if="isMaxReached"
                        variant="soft"
                        color="warning"
                        size="xs"
                        icon="warning"
                    >
                        Batas Maksimal
                    </Badge>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal (Pack UI Modal Component) -->
        <Modal
            v-model="showDeleteModal"
            variant="danger"
            icon="delete_forever"
            :title="confirmDeleteTitle"
            context="Konfirmasi Hapus"
            max-width="sm"
            confirm-text="Ya, Hapus Entri"
            cancel-text="Batal"
            @confirm="confirmDeleteModal"
            @close="cancelDeleteModal"
        >
            <div class="space-y-3.5">
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Apakah Anda yakin ingin menghapus <strong>{{ itemToDelete?.title || 'entri ini' }}</strong>?
                </p>

                <div
                    v-if="itemToDelete?.preview"
                    class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                >
                    <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Rincian Data:
                    </span>
                    <div class="font-mono text-slate-700 dark:text-slate-300 line-clamp-2">
                        {{ itemToDelete.preview }}
                    </div>
                </div>

                <div class="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300">
                    <span class="material-symbols-outlined text-base shrink-0 text-rose-500">warning</span>
                    <span>{{ confirmDeleteMessage }}</span>
                </div>
            </div>
        </Modal>
    </div>
</template>

<style scoped>
.repeater-card-move {
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.repeater-enter-active {
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.repeater-leave-active {
    position: absolute !important;
    width: 100% !important;
    pointer-events: none !important;
    z-index: 10 !important;
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>
