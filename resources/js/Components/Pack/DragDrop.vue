<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Badge from './Badge.vue';
import ButtonSubmit from './ButtonSubmit.vue';
import InputField from './InputField.vue';

const props = defineProps({
    modelValue: {
        type: [Array, Object],
        default: () => [],
    },
    mode: {
        type: String,
        default: 'list', // 'list' | 'grid' | 'kanban' | 'transfer'
        validator: (val) => ['list', 'grid', 'kanban', 'transfer'].includes(val),
    },
    direction: {
        type: String,
        default: 'vertical', // 'vertical' | 'horizontal'
        validator: (val) => ['vertical', 'horizontal'].includes(val),
    },
    columns: {
        type: [Number, String],
        default: 3, // For grid mode: 1, 2, 3, 4, 5, 6
    },
    kanbanColumns: {
        type: [Number, String],
        default: 'auto', // 'auto', 2, 3, 4, 5
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    handle: {
        type: Boolean,
        default: true,
    },
    handlePosition: {
        type: String,
        default: 'left', // 'left' | 'right'
        validator: (val) => ['left', 'right'].includes(val),
    },
    cardVariant: {
        type: String,
        default: 'bordered', // 'bordered' | 'flat' | 'glass' | 'elevated' | 'glow' | 'pills' | 'gradient' | 'brutalist' | 'default'
        validator: (val) => ['bordered', 'flat', 'glass', 'elevated', 'glow', 'pills', 'gradient', 'brutalist', 'default'].includes(val),
    },
    colorTheme: {
        type: String,
        default: 'indigo', // 'primary' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'dark'
        validator: (val) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(val),
    },
    radius: {
        type: String,
        default: 'default', // 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    },
    size: {
        type: String,
        default: 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    dense: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    emptyText: {
        type: String,
        default: 'Tarik atau letakkan item di sini',
    },
    transferTitles: {
        type: Array,
        default: () => ['Item Tersedia', 'Item Terpilih'],
    },
    transferSearchable: {
        type: Boolean,
        default: true,
    },
    allowAddCard: {
        type: Boolean,
        default: false,
    },
    dropIndicatorClass: {
        type: String,
        default: '',
    },
    ghostClass: {
        type: String,
        default: '',
    },
    animation: {
        type: Number,
        default: 300,
    },
});

const emit = defineEmits([
    'update:modelValue',
    'change',
    'drag-start',
    'drag-end',
    'reorder',
    'transfer',
    'add-card',
]);

// Internal synchronized state
const localData = ref([]);

// Drag state tracking
const isDragging = ref(false);
const draggedItem = ref(null);
const draggedSource = ref({ index: -1, columnId: null });
const dragOverTarget = ref({ index: -1, columnId: null, position: 'before' });
const isHandleActive = ref(false);

// Mobile / Touch state tracking
const touchCoord = ref({ x: 0, y: 0, active: false });

// Keyboard Reorder State (WAI-ARIA Accessibility)
const pickedUpItem = ref(null);
const pickedUpSource = ref({ index: -1, columnId: null });

// Transfer mode reactive search & selection state
const transferSourceSearch = ref('');
const transferTargetSearch = ref('');
const selectedSourceId = ref(null);
const selectedTargetId = ref(null);

// Generate unique key helper
let idCounter = 0;
const getItemUniqueKey = (item, index) => {
    if (!item) return `dnd-row-${index}`;
    if (typeof item === 'object') {
        if (item[props.itemKey] !== undefined) return item[props.itemKey];
        if (item._dnd_id) return item._dnd_id;

        Object.defineProperty(item, '_dnd_id', {
            value: `dnd_${Date.now().toString(36)}_${++idCounter}`,
            enumerable: false,
            writable: true,
            configurable: true,
        });
        return item._dnd_id;
    }
    return `dnd-val-${item}-${index}`;
};

// Sync from modelValue
const syncFromProps = () => {
    if (props.mode === 'transfer') {
        if (Array.isArray(props.modelValue) && props.modelValue.length === 2 && props.modelValue[0]?.items) {
            localData.value = JSON.parse(JSON.stringify(props.modelValue));
        } else if (props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue)) {
            localData.value = [
                {
                    id: 'source',
                    title: props.transferTitles[0] || 'Item Tersedia',
                    items: Array.isArray(props.modelValue.source) ? JSON.parse(JSON.stringify(props.modelValue.source)) : [],
                },
                {
                    id: 'target',
                    title: props.transferTitles[1] || 'Item Terpilih',
                    items: Array.isArray(props.modelValue.target) ? JSON.parse(JSON.stringify(props.modelValue.target)) : [],
                },
            ];
        } else {
            localData.value = [
                { id: 'source', title: props.transferTitles[0] || 'Item Tersedia', items: [] },
                { id: 'target', title: props.transferTitles[1] || 'Item Terpilih', items: [] },
            ];
        }
    } else if (Array.isArray(props.modelValue)) {
        localData.value = JSON.parse(JSON.stringify(props.modelValue));
    } else {
        localData.value = [];
    }
};

watch(
    () => props.modelValue,
    (newVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) {
            syncFromProps();
        }
    },
    { deep: true }
);

onMounted(() => {
    syncFromProps();
});

// Color Theme mapping
const colorThemeMap = {
    primary: {
        indicator: 'bg-blue-600 shadow-blue-600/50',
        ghost: 'ring-blue-500/60',
        colHighlight: 'ring-2 ring-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20',
        glowBorder: 'border-blue-500/40 shadow-blue-500/15 hover:border-blue-500/70',
        activePill: 'ring-2 ring-blue-500/80 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    },
    indigo: {
        indicator: 'bg-indigo-600 shadow-indigo-600/50',
        ghost: 'ring-indigo-500/60',
        colHighlight: 'ring-2 ring-indigo-500/40 bg-indigo-50/20 dark:bg-indigo-950/20',
        glowBorder: 'border-indigo-500/40 shadow-indigo-500/15 hover:border-indigo-500/70',
        activePill: 'ring-2 ring-indigo-500/80 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
    },
    emerald: {
        indicator: 'bg-emerald-600 shadow-emerald-600/50',
        ghost: 'ring-emerald-500/60',
        colHighlight: 'ring-2 ring-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20',
        glowBorder: 'border-emerald-500/40 shadow-emerald-500/15 hover:border-emerald-500/70',
        activePill: 'ring-2 ring-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
    },
    purple: {
        indicator: 'bg-purple-600 shadow-purple-600/50',
        ghost: 'ring-purple-500/60',
        colHighlight: 'ring-2 ring-purple-500/40 bg-purple-50/20 dark:bg-purple-950/20',
        glowBorder: 'border-purple-500/40 shadow-purple-500/15 hover:border-purple-500/70',
        activePill: 'ring-2 ring-purple-500/80 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
    },
    amber: {
        indicator: 'bg-amber-500 shadow-amber-500/50',
        ghost: 'ring-amber-500/60',
        colHighlight: 'ring-2 ring-amber-500/40 bg-amber-50/20 dark:bg-amber-950/20',
        glowBorder: 'border-amber-500/40 shadow-amber-500/15 hover:border-amber-500/70',
        activePill: 'ring-2 ring-amber-500/80 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    },
    rose: {
        indicator: 'bg-rose-600 shadow-rose-600/50',
        ghost: 'ring-rose-500/60',
        colHighlight: 'ring-2 ring-rose-500/40 bg-rose-50/20 dark:bg-rose-950/20',
        glowBorder: 'border-rose-500/40 shadow-rose-500/15 hover:border-rose-500/70',
        activePill: 'ring-2 ring-rose-500/80 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300',
    },
    cyan: {
        indicator: 'bg-cyan-600 shadow-cyan-600/50',
        ghost: 'ring-cyan-500/60',
        colHighlight: 'ring-2 ring-cyan-500/40 bg-cyan-50/20 dark:bg-cyan-950/20',
        glowBorder: 'border-cyan-500/40 shadow-cyan-500/15 hover:border-cyan-500/70',
        activePill: 'ring-2 ring-cyan-500/80 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300',
    },
    dark: {
        indicator: 'bg-slate-700 dark:bg-slate-300 shadow-slate-700/50',
        ghost: 'ring-slate-500/60',
        colHighlight: 'ring-2 ring-slate-500/40 bg-slate-100/40 dark:bg-slate-800/40',
        glowBorder: 'border-slate-500/40 shadow-slate-500/15 hover:border-slate-500/70',
        activePill: 'ring-2 ring-slate-700/80 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100',
    },
};

const activeThemeTokens = computed(() => {
    return colorThemeMap[props.colorTheme] || colorThemeMap.indigo;
});

// Radius class mapping
const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
};

const computedRadiusClass = computed(() => {
    if (props.cardVariant === 'pills') return 'rounded-full';
    if (props.radius && props.radius !== 'default' && radiusMap[props.radius]) {
        return radiusMap[props.radius];
    }
    switch (props.size) {
        case 'xs': return 'rounded-lg';
        case 'sm': return 'rounded-xl';
        case 'lg': return 'rounded-2xl';
        case 'xl': return 'rounded-2xl';
        case 'md':
        default: return 'rounded-xl';
    }
});

// Grid columns CSS class mapping
const gridColsClass = computed(() => {
    switch (Number(props.columns)) {
        case 1:
            return 'grid-cols-1';
        case 2:
            return 'grid-cols-1 sm:grid-cols-2';
        case 4:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
        case 5:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
        case 6:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
        case 3:
        default:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
});

// Kanban responsive layout class mapping
const kanbanGridClass = computed(() => {
    const colCount = Array.isArray(localData.value) ? localData.value.length : 3;
    if (props.kanbanColumns && props.kanbanColumns !== 'auto') {
        const k = Number(props.kanbanColumns);
        if (k === 2) return 'md:grid-cols-2';
        if (k === 3) return 'md:grid-cols-2 lg:grid-cols-3';
        if (k === 4) return 'md:grid-cols-2 lg:grid-cols-4';
        if (k === 5) return 'md:grid-cols-3 lg:grid-cols-5';
    }
    if (colCount <= 2) return 'md:grid-cols-2';
    if (colCount === 3) return 'md:grid-cols-2 lg:grid-cols-3';
    if (colCount === 4) return 'md:grid-cols-2 lg:grid-cols-4';
    return 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
});

// Card variant style mapping (9 Visual Variants)
const cardVariantClass = computed(() => {
    switch (props.cardVariant) {
        case 'flat':
            return 'bg-slate-50 dark:bg-slate-800/60 border border-transparent';
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60 shadow-xs';
        case 'elevated':
            return 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md hover:shadow-lg';
        case 'glow':
            return `bg-white dark:bg-slate-900 border ${activeThemeTokens.value.glowBorder} shadow-sm`;
        case 'pills':
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs px-4';
        case 'gradient':
            return 'bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-2xs';
        case 'brutalist':
            return 'bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]';
        case 'default':
            return 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs';
        case 'bordered':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs';
    }
});

// Size class mapping (5 scales: xs, sm, md, lg, xl + dense mode)
const sizeClass = computed(() => {
    const pad = props.dense
        ? { xs: 'p-1.5 text-[11px]', sm: 'p-2 text-xs', md: 'p-2.5 text-xs sm:text-sm', lg: 'p-3 text-sm sm:text-base', xl: 'p-3.5 text-base' }
        : { xs: 'p-2 text-xs', sm: 'p-2.5 text-xs', md: 'p-3.5 text-sm', lg: 'p-4 text-base', xl: 'p-5 text-lg' };

    return `${pad[props.size] || pad.md} ${computedRadiusClass.value}`;
});

const handleSizeClass = computed(() => {
    switch (props.size) {
        case 'xs':
            return 'w-5 h-5 text-xs';
        case 'sm':
            return 'w-5.5 h-5.5 text-sm';
        case 'lg':
            return 'w-7 h-7 text-xl';
        case 'xl':
            return 'w-8 h-8 text-2xl';
        case 'md':
        default:
            return 'w-6 h-6 text-base';
    }
});

// Priority color resolver
const getPriorityColor = (priority) => {
    if (!priority) return 'neutral';
    const p = String(priority).toLowerCase();
    if (p.includes('crit') || p.includes('urg') || p.includes('tinggi') || p.includes('high')) return 'rose';
    if (p.includes('med') || p.includes('sedang') || p.includes('prog')) return 'amber';
    if (p.includes('low') || p.includes('rendah')) return 'slate';
    if (p.includes('done') || p.includes('selesai')) return 'emerald';
    return props.colorTheme || 'primary';
};

// Drag Handle Activation Handlers
const onHandleMouseDown = () => {
    if (!props.disabled) isHandleActive.value = true;
};
const onHandleMouseUp = () => {
    isHandleActive.value = false;
};

// Check whether dragging is currently permitted for an item
const isItemDraggable = computed(() => {
    if (props.disabled) return false;
    if (props.handle) return isHandleActive.value;
    return true;
});

// --- HTML5 Drag and Drop Event Handlers ---

const handleDragStart = (e, item, index, columnId = null) => {
    if (props.disabled) {
        e.preventDefault();
        return;
    }

    isDragging.value = true;
    draggedItem.value = item;
    draggedSource.value = { index, columnId };
    dragOverTarget.value = { index, columnId, position: 'before' };

    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        try {
            e.dataTransfer.setData('text/plain', JSON.stringify(item));
        } catch {
            e.dataTransfer.setData('text/plain', String(index));
        }
    }

    emit('drag-start', { item, index, columnId });
};

const handleDragOver = (e, item, index, columnId = null) => {
    if (!isDragging.value || props.disabled) return;
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let isAfter = false;

    if (props.mode === 'grid' || props.direction === 'horizontal') {
        const midX = rect.left + rect.width / 2;
        isAfter = e.clientX > midX;
    } else {
        const midY = rect.top + rect.height / 2;
        isAfter = e.clientY > midY;
    }

    dragOverTarget.value = {
        index,
        columnId,
        position: isAfter ? 'after' : 'before',
    };
};

const handleDragLeave = (e) => {
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
};

const handleDrop = (e, targetItem, targetIndex, targetColumnId = null) => {
    if (!isDragging.value || props.disabled) return;
    e.preventDefault();

    const fromCol = draggedSource.value.columnId;
    const toCol = targetColumnId;
    const fromIdx = draggedSource.value.index;
    let toIdx = targetIndex;

    if (dragOverTarget.value.position === 'after') {
        toIdx += 1;
    }

    executeMove(fromCol, toCol, fromIdx, toIdx);
    resetDragState();
};

const handleColumnDragOver = (e) => {
    if (!isDragging.value || props.disabled) return;
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
};

const handleColumnDrop = (e, columnId) => {
    if (!isDragging.value || props.disabled) return;
    e.preventDefault();

    const fromCol = draggedSource.value.columnId;
    const fromIdx = draggedSource.value.index;

    const col = localData.value.find((c) => c.id === columnId);
    const toIdx = col && Array.isArray(col.items) ? col.items.length : 0;

    executeMove(fromCol, columnId, fromIdx, toIdx);
    resetDragState();
};

const handleDragEnd = () => {
    resetDragState();
    isHandleActive.value = false;
};

const resetDragState = () => {
    isDragging.value = false;
    draggedItem.value = null;
    draggedSource.value = { index: -1, columnId: null };
    dragOverTarget.value = { index: -1, columnId: null, position: 'before' };
    isHandleActive.value = false;
    touchCoord.value.active = false;
};

// --- Execution & State Mutator ---

const executeMove = (fromCol, toCol, fromIdx, toIdx) => {
    if (fromIdx < 0) return;

    if (props.mode === 'kanban' || props.mode === 'transfer') {
        const sourceColObj = localData.value.find((c) => c.id === fromCol);
        const targetColObj = localData.value.find((c) => c.id === toCol);

        if (!sourceColObj || !targetColObj) return;

        if (fromCol === toCol) {
            if (fromIdx === toIdx || fromIdx === toIdx - 1) return;
            const items = sourceColObj.items;
            const [moved] = items.splice(fromIdx, 1);
            const destinationIndex = fromIdx < toIdx ? toIdx - 1 : toIdx;
            items.splice(destinationIndex, 0, moved);

            emit('update:modelValue', localData.value);
            emit('change', {
                type: 'reorder',
                column: toCol,
                item: moved,
                fromIndex: fromIdx,
                toIndex: destinationIndex,
            });
            emit('reorder', localData.value);
        } else {
            const [moved] = sourceColObj.items.splice(fromIdx, 1);
            const destinationIndex = Math.min(toIdx, targetColObj.items.length);
            targetColObj.items.splice(destinationIndex, 0, moved);

            emit('update:modelValue', localData.value);
            emit('change', {
                type: 'transfer',
                item: moved,
                fromColumn: fromCol,
                toColumn: toCol,
                fromIndex: fromIdx,
                toIndex: destinationIndex,
            });
            emit('transfer', {
                item: moved,
                fromColumn: fromCol,
                toColumn: toCol,
            });
        }
    } else {
        if (fromIdx === toIdx || fromIdx === toIdx - 1) return;
        const [moved] = localData.value.splice(fromIdx, 1);
        const destinationIndex = fromIdx < toIdx ? toIdx - 1 : toIdx;
        localData.value.splice(destinationIndex, 0, moved);

        emit('update:modelValue', localData.value);
        emit('change', {
            type: 'reorder',
            item: moved,
            fromIndex: fromIdx,
            toIndex: destinationIndex,
        });
        emit('reorder', localData.value);
    }

    emit('drag-end', {
        item: draggedItem.value,
        fromColumn: fromCol,
        toColumn: toCol,
        fromIndex: fromIdx,
        toIndex,
    });
};

// Transfer mode helpers
const transferAll = (fromId, toId) => {
    if (props.disabled) return;
    const fromCol = localData.value.find((c) => c.id === fromId);
    const toCol = localData.value.find((c) => c.id === toId);
    if (!fromCol || !toCol || !fromCol.items?.length) return;

    const moved = [...fromCol.items];
    fromCol.items = [];
    toCol.items = [...toCol.items, ...moved];

    emit('update:modelValue', localData.value);
    emit('change', {
        type: 'transfer-all',
        fromColumn: fromId,
        toColumn: toId,
        items: moved,
    });
    emit('transfer', {
        type: 'transfer-all',
        fromColumn: fromId,
        toColumn: toId,
        items: moved,
    });
};

const transferSelected = (fromId, toId, targetKey) => {
    if (props.disabled) return;
    const targetItemId = targetKey === 'source' ? selectedSourceId.value : selectedTargetId.value;
    if (!targetItemId) return;

    const fromCol = localData.value.find((c) => c.id === fromId);
    if (!fromCol) return;

    const idx = fromCol.items.findIndex((it) => (it[props.itemKey] || it.id) === targetItemId);
    if (idx < 0) return;

    executeMove(fromId, toId, idx, 0);

    if (targetKey === 'source') selectedSourceId.value = null;
    else selectedTargetId.value = null;
};

const transferItem = (fromId, toId, item, index) => {
    if (props.disabled) return;
    executeMove(fromId, toId, index, 0);
};

// Filtered items in Transfer Mode
const filteredTransferItems = (colIndex) => {
    const col = localData.value[colIndex];
    if (!col || !Array.isArray(col.items)) return [];
    const query = (colIndex === 0 ? transferSourceSearch.value : transferTargetSearch.value).toLowerCase().trim();
    if (!query) return col.items;

    return col.items.filter((it) => {
        const title = (typeof it === 'object' ? (it.title || it.label || it.name) : String(it)).toLowerCase();
        return title.includes(query);
    });
};

// --- Mobile / Touch Fallback Support ---

const handleTouchStart = (e, item, index, columnId = null) => {
    if (props.disabled) return;
    isHandleActive.value = true;
    isDragging.value = true;
    draggedItem.value = item;
    draggedSource.value = { index, columnId };

    const touch = e.touches[0];
    if (touch) {
        touchCoord.value = { x: touch.clientX, y: touch.clientY, active: true };
    }
    if (navigator?.vibrate) navigator.vibrate(15);
};

const handleTouchMove = (e) => {
    if (!isDragging.value) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    touchCoord.value = { x: touch.clientX, y: touch.clientY, active: true };

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;

    const targetCard = el.closest('[data-dnd-item]');
    if (targetCard) {
        const targetIndex = Number(targetCard.dataset.dndIndex);
        const targetCol = targetCard.dataset.dndColumn || null;

        const rect = targetCard.getBoundingClientRect();
        let isAfter = false;
        if (props.mode === 'grid' || props.direction === 'horizontal') {
            isAfter = touch.clientX > rect.left + rect.width / 2;
        } else {
            isAfter = touch.clientY > rect.top + rect.height / 2;
        }

        dragOverTarget.value = {
            index: targetIndex,
            columnId: targetCol,
            position: isAfter ? 'after' : 'before',
        };
    } else {
        const targetColEl = el.closest('[data-dnd-column]');
        if (targetColEl) {
            const colId = targetColEl.dataset.columnId;
            const col = (props.mode === 'kanban' || props.mode === 'transfer')
                ? localData.value.find((c) => c.id === colId)
                : null;
            const toIdx = col && Array.isArray(col.items) ? col.items.length : 0;
            dragOverTarget.value = {
                index: toIdx,
                columnId: colId,
                position: 'after',
            };
        }
    }
};

const handleTouchEnd = () => {
    if (!isDragging.value) return;
    if (dragOverTarget.value.index >= 0) {
        let toIdx = dragOverTarget.value.index;
        if (dragOverTarget.value.position === 'after') {
            toIdx += 1;
        }
        executeMove(
            draggedSource.value.columnId,
            dragOverTarget.value.columnId,
            draggedSource.value.index,
            toIdx
        );
    }
    resetDragState();
};

// Keyboard Navigation (WAI-ARIA Accessibility)
const isItemPickedUp = (index, columnId = null) => {
    return (
        pickedUpItem.value !== null &&
        pickedUpSource.value.index === index &&
        pickedUpSource.value.columnId === columnId
    );
};

const handleKeyDown = (e, item, index, columnId = null) => {
    if (props.disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isItemPickedUp(index, columnId)) {
            pickedUpItem.value = null;
            pickedUpSource.value = { index: -1, columnId: null };
            emit('drag-end', { item, fromIndex: index, toIndex: index, fromColumn: columnId, toColumn: columnId });
        } else {
            pickedUpItem.value = item;
            pickedUpSource.value = { index, columnId };
            emit('drag-start', { item, index, columnId });
        }
    } else if (e.key === 'Escape') {
        if (pickedUpItem.value) {
            e.preventDefault();
            pickedUpItem.value = null;
            pickedUpSource.value = { index: -1, columnId: null };
        }
    } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        if (isItemPickedUp(index, columnId)) {
            e.preventDefault();
            if (index > 0) {
                executeMove(columnId, columnId, index, index - 1);
                pickedUpSource.value.index = index - 1;
            }
        }
    } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
        if (isItemPickedUp(index, columnId)) {
            e.preventDefault();
            const col = (props.mode === 'kanban' || props.mode === 'transfer')
                ? localData.value.find((c) => c.id === columnId)
                : null;
            const maxIdx = col && Array.isArray(col.items) ? col.items.length - 1 : localData.value.length - 1;
            if (index < maxIdx) {
                executeMove(columnId, columnId, index, index + 2);
                pickedUpSource.value.index = index + 1;
            }
        }
    }
};

const isItemDragging = (item, index, columnId = null) => {
    if (!isDragging.value || !draggedItem.value) return false;
    return (
        draggedSource.value.index === index &&
        draggedSource.value.columnId === columnId
    );
};

const isDropTargetIndicator = (index, columnId = null, pos = 'before') => {
    if (!isDragging.value) return false;
    return (
        dragOverTarget.value.index === index &&
        dragOverTarget.value.columnId === columnId &&
        dragOverTarget.value.position === pos
    );
};
</script>

<template>
    <div
        class="w-full select-none"
        :style="{ '--dnd-duration': `${animation}ms` }"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
        <!-- Floating Drag Avatar on Mobile / Touch Dragging -->
        <Teleport to="body">
            <div
                v-if="isDragging && touchCoord.active && draggedItem"
                class="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-indigo-500 shadow-2xl backdrop-blur-md flex items-center gap-2.5 max-w-xs transition-none"
                :style="{ left: `${touchCoord.x}px`, top: `${touchCoord.y}px` }"
            >
                <span class="material-symbols-outlined text-indigo-600 text-base">drag_pan</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ typeof draggedItem === 'object' ? (draggedItem.title || draggedItem.name || draggedItem.label) : draggedItem }}
                </span>
            </div>
        </Teleport>

        <!-- ========================================== -->
        <!-- 1. MODE: LIST & GRID                       -->
        <!-- ========================================== -->
        <div v-if="['list', 'grid'].includes(mode)">
            <TransitionGroup
                tag="div"
                name="dnd-flip"
                class="relative transition-all"
                :class="[
                    mode === 'grid'
                        ? `grid gap-3 sm:gap-3.5 md:gap-4 ${gridColsClass}`
                        : (direction === 'horizontal' ? 'flex flex-row gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory' : 'flex flex-col gap-2.5')
                ]"
            >
                <div
                    v-for="(item, index) in localData"
                    :key="getItemUniqueKey(item, index)"
                    data-dnd-item="true"
                    :data-dnd-index="index"
                    :draggable="isItemDraggable"
                    tabindex="0"
                    role="listitem"
                    :aria-grabbed="isItemPickedUp(index, null)"
                    @dragstart="handleDragStart($event, item, index)"
                    @dragover="handleDragOver($event, item, index)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, item, index)"
                    @dragend="handleDragEnd"
                    @keydown="handleKeyDown($event, item, index, null)"
                    class="group/dnd relative transition-all duration-200 outline-hidden"
                    :class="[
                        cardVariantClass,
                        sizeClass,
                        direction === 'horizontal' && mode === 'list' ? 'shrink-0 min-w-50 sm:min-w-60 snap-start' : '',
                        isItemDragging(item, index)
                            ? (ghostClass || `opacity-35 scale-[0.98] ring-2 ${activeThemeTokens.ghost} shadow-xl rotate-1 z-20`)
                            : 'hover:shadow-xs',
                        isItemPickedUp(index, null) ? 'ring-2 ring-offset-2 ring-indigo-500 scale-[1.02] shadow-lg z-20' : '',
                        disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                    ]"
                >
                    <!-- Drop Indicator Bar: Before (Horizontal vs Vertical Aware) -->
                    <div
                        v-if="isDropTargetIndicator(index, null, 'before')"
                        class="absolute rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
                        :class="[
                            direction === 'horizontal' || mode === 'grid'
                                ? '-left-1.5 top-0 bottom-0 w-1'
                                : '-top-1.5 left-0 right-0 h-1',
                            activeThemeTokens.indicator,
                            dropIndicatorClass
                        ]"
                    />

                    <!-- Card Body Content with Slot Support -->
                    <div class="flex items-center gap-3 w-full">
                        <!-- Drag Handle Icon (Left) -->
                        <div
                            v-if="handle && handlePosition === 'left' && !disabled"
                            class="shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                            :class="handleSizeClass"
                            style="touch-action: none;"
                            @mousedown="onHandleMouseDown"
                            @mouseup="onHandleMouseUp"
                            @touchstart="handleTouchStart($event, item, index)"
                            title="Tarik untuk memindahkan"
                        >
                            <slot name="drag-handle">
                                <span class="material-symbols-outlined leading-none" :class="handleSizeClass">drag_indicator</span>
                            </slot>
                        </div>

                        <!-- Scoped Slot or Default Item Content -->
                        <div class="flex-1 min-w-0">
                            <slot
                                name="item"
                                :item="item"
                                :index="index"
                                :is-dragging="isItemDragging(item, index)"
                                :is-picked-up="isItemPickedUp(index, null)"
                                :handle-props="{
                                    onMousedown: onHandleMouseDown,
                                    onMouseup: onHandleMouseUp,
                                    onTouchstart: (e) => handleTouchStart(e, item, index)
                                }"
                            >
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-medium text-slate-800 dark:text-slate-100 truncate">
                                        {{ typeof item === 'object' ? (item.title || item.name || item.label || JSON.stringify(item)) : item }}
                                    </span>
                                    <Badge
                                        v-if="item && item.badge"
                                        size="xs"
                                        variant="soft"
                                        :color="item.badgeVariant || item.badgeColor || colorTheme"
                                    >
                                        {{ item.badge }}
                                    </Badge>
                                </div>
                            </slot>
                        </div>

                        <!-- Drag Handle Icon (Right) -->
                        <div
                            v-if="handle && handlePosition === 'right' && !disabled"
                            class="shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                            :class="handleSizeClass"
                            style="touch-action: none;"
                            @mousedown="onHandleMouseDown"
                            @mouseup="onHandleMouseUp"
                            @touchstart="handleTouchStart($event, item, index)"
                            title="Tarik untuk memindahkan"
                        >
                            <slot name="drag-handle">
                                <span class="material-symbols-outlined leading-none" :class="handleSizeClass">drag_indicator</span>
                            </slot>
                        </div>
                    </div>

                    <!-- Drop Indicator Bar: After (Horizontal vs Vertical Aware) -->
                    <div
                        v-if="isDropTargetIndicator(index, null, 'after')"
                        class="absolute rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
                        :class="[
                            direction === 'horizontal' || mode === 'grid'
                                ? '-right-1.5 top-0 bottom-0 w-1'
                                : '-bottom-1.5 left-0 right-0 h-1',
                            activeThemeTokens.indicator,
                            dropIndicatorClass
                        ]"
                    />
                </div>
            </TransitionGroup>

            <!-- Empty State -->
            <div
                v-if="localData.length === 0"
                class="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 select-none"
            >
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <span class="material-symbols-outlined text-xl">drag_pan</span>
                </div>
                <div class="text-xs font-semibold text-slate-600 dark:text-slate-300 m-0">{{ emptyText }}</div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 2. MODE: KANBAN BOARD (RESPONSIVE)         -->
        <!-- ========================================== -->
        <div
            v-else-if="mode === 'kanban'"
            class="w-full flex flex-nowrap overflow-x-auto md:grid gap-4 md:gap-5 items-start pb-3 scrollbar-thin snap-x snap-mandatory"
            :class="kanbanGridClass"
        >
            <div
                v-for="(column, colIdx) in localData"
                :key="column.id || `col-${colIdx}`"
                data-dnd-column="true"
                :data-column-id="column.id"
                @dragover="handleColumnDragOver"
                @drop="handleColumnDrop($event, column.id)"
                class="flex flex-col rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3 min-h-90 w-full min-w-67.5 max-w-85 md:min-w-0 md:max-w-none shrink-0 snap-start transition-colors"
                :class="dragOverTarget.columnId === column.id && isDragging ? activeThemeTokens.colHighlight : ''"
            >
                <!-- Column Header -->
                <slot
                    name="column-header"
                    :column="column"
                    :index="colIdx"
                    :count="column.items ? column.items.length : 0"
                >
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                        <div class="flex items-center gap-2">
                            <span
                                v-if="column.color"
                                class="w-2.5 h-2.5 rounded-full shrink-0"
                                :class="`bg-${column.color}-500`"
                            />
                            <div class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 m-0">
                                {{ column.title || column.name }}
                            </div>
                        </div>
                        <Badge size="xs" variant="soft" color="neutral" class="font-mono font-bold">
                            {{ column.items ? column.items.length : 0 }}
                        </Badge>
                    </div>
                </slot>

                <!-- Column Items TransitionGroup List -->
                <TransitionGroup
                    tag="div"
                    name="dnd-flip"
                    class="flex flex-col gap-2.5 flex-1 relative min-h-20"
                >
                    <div
                        v-for="(item, index) in (column.items || [])"
                        :key="getItemUniqueKey(item, index)"
                        data-dnd-item="true"
                        :data-dnd-index="index"
                        :data-dnd-column="column.id"
                        :draggable="isItemDraggable"
                        tabindex="0"
                        role="listitem"
                        :aria-grabbed="isItemPickedUp(index, column.id)"
                        @dragstart="handleDragStart($event, item, index, column.id)"
                        @dragover="handleDragOver($event, item, index, column.id)"
                        @dragleave="handleDragLeave"
                        @drop.stop="handleDrop($event, item, index, column.id)"
                        @dragend="handleDragEnd"
                        @keydown="handleKeyDown($event, item, index, column.id)"
                        class="group/dnd relative transition-all duration-200 outline-hidden"
                        :class="[
                            cardVariantClass,
                            sizeClass,
                            isItemDragging(item, index, column.id)
                                ? (ghostClass || `opacity-35 scale-[0.98] ring-2 ${activeThemeTokens.ghost} shadow-xl rotate-1 z-20`)
                                : 'hover:shadow-xs',
                            isItemPickedUp(index, column.id) ? 'ring-2 ring-offset-2 ring-indigo-500 scale-[1.02] shadow-lg z-20' : '',
                            disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                        ]"
                    >
                        <!-- Drop Indicator Bar: Before -->
                        <div
                            v-if="isDropTargetIndicator(index, column.id, 'before')"
                            class="absolute -top-1.5 left-0 right-0 h-1 rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
                            :class="[activeThemeTokens.indicator, dropIndicatorClass]"
                        />

                        <!-- Item Content -->
                        <div class="flex items-start gap-2.5 w-full">
                            <!-- Drag Handle (Left) -->
                            <div
                                v-if="handle && handlePosition === 'left' && !disabled"
                                class="shrink-0 mt-0.5 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                                :class="handleSizeClass"
                                style="touch-action: none;"
                                @mousedown="onHandleMouseDown"
                                @mouseup="onHandleMouseUp"
                                @touchstart="handleTouchStart($event, item, index, column.id)"
                                title="Pindahkan tugas"
                            >
                                <slot name="drag-handle">
                                    <span class="material-symbols-outlined leading-none" :class="handleSizeClass">drag_indicator</span>
                                </slot>
                            </div>

                            <!-- Custom Item Slot -->
                            <div class="flex-1 min-w-0">
                                <slot
                                    name="item"
                                    :item="item"
                                    :index="index"
                                    :column="column"
                                    :is-dragging="isItemDragging(item, index, column.id)"
                                    :is-picked-up="isItemPickedUp(index, column.id)"
                                    :handle-props="{
                                         onMousedown: onHandleMouseDown,
                                         onMouseup: onHandleMouseUp,
                                         onTouchstart: (e) => handleTouchStart(e, item, index, column.id)
                                    }"
                                >
                                    <div class="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug m-0">
                                        {{ item.title || item.name }}
                                    </div>
                                    <div v-if="item.description" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-normal m-0">
                                        {{ item.description }}
                                    </div>
                                    <div v-if="item.tag || item.priority" class="flex items-center gap-1.5 mt-2">
                                        <Badge
                                            v-if="item.priority"
                                            size="xs"
                                            variant="soft"
                                            :color="getPriorityColor(item.priority)"
                                        >
                                            {{ item.priority }}
                                        </Badge>
                                        <span v-if="item.tag" class="text-[10px] text-slate-400 font-medium">
                                            #{{ item.tag }}
                                        </span>
                                    </div>
                                </slot>
                            </div>
                        </div>

                        <!-- Drop Indicator Bar: After -->
                        <div
                            v-if="isDropTargetIndicator(index, column.id, 'after')"
                            class="absolute -bottom-1.5 left-0 right-0 h-1 rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
                            :class="[activeThemeTokens.indicator, dropIndicatorClass]"
                        />
                    </div>
                </TransitionGroup>

                <!-- Empty Column Dropzone Placeholder -->
                <div
                    v-if="!column.items || column.items.length === 0"
                    class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center select-none"
                >
                    <span class="material-symbols-outlined text-xl text-slate-300 dark:text-slate-600">inbox</span>
                    <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                        {{ emptyText }}
                    </span>
                </div>

                <!-- Column Footer Slot (e.g. + Add Card button) -->
                <slot
                    name="column-footer"
                    :column="column"
                    :index="colIdx"
                >
                    <ButtonSubmit
                        v-if="allowAddCard && !disabled"
                        type="button"
                        size="xs"
                        variant="ghost"
                        icon="add"
                        class="w-full text-slate-500 dark:text-slate-400 justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800"
                        @click="emit('add-card', { column, index: colIdx })"
                    >
                        Tambah Kartu
                    </ButtonSubmit>
                </slot>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 3. MODE: DUAL LIST TRANSFER (SEARCHABLE)   -->
        <!-- ========================================== -->
        <div
            v-else-if="mode === 'transfer'"
            class="w-full grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center"
        >
            <!-- Left Panel: Source -->
            <div
                v-if="localData[0]"
                data-dnd-column="true"
                :data-column-id="localData[0].id"
                @dragover="handleColumnDragOver"
                @drop="handleColumnDrop($event, localData[0].id)"
                class="flex flex-col rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3 min-h-80 transition-colors"
                :class="dragOverTarget.columnId === localData[0].id && isDragging ? activeThemeTokens.colHighlight : ''"
            >
                <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0">
                        <span class="material-symbols-outlined text-base text-indigo-500">source</span>
                        {{ localData[0].title || transferTitles[0] || 'Item Tersedia' }}
                    </div>
                    <Badge size="xs" variant="soft" color="neutral" class="font-mono font-bold">
                        {{ localData[0].items ? localData[0].items.length : 0 }}
                    </Badge>
                </div>

                <!-- Instant Search Input (Source) -->
                <div v-if="transferSearchable">
                    <InputField
                        v-model="transferSourceSearch"
                        type="search"
                        size="xs"
                        :clearable="true"
                        placeholder="Cari item tersedia..."
                    />
                </div>

                <TransitionGroup
                    tag="div"
                    name="dnd-flip"
                    class="flex flex-col gap-2 flex-1 relative min-h-35 max-h-90 overflow-y-auto pr-1"
                >
                    <div
                        v-for="(item, index) in filteredTransferItems(0)"
                        :key="getItemUniqueKey(item, index)"
                        data-dnd-item="true"
                        :data-dnd-index="index"
                        :data-dnd-column="localData[0].id"
                        :draggable="isItemDraggable"
                        @dragstart="handleDragStart($event, item, index, localData[0].id)"
                        @dragover="handleDragOver($event, item, index, localData[0].id)"
                        @dragleave="handleDragLeave"
                        @drop.stop="handleDrop($event, item, index, localData[0].id)"
                        @dragend="handleDragEnd"
                        @click="selectedSourceId = (selectedSourceId === (item[itemKey] || item.id) ? null : (item[itemKey] || item.id))"
                        @dblclick="transferItem(localData[0].id, localData[1]?.id, item, index)"
                        class="group/dnd relative transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer"
                        :class="[
                            cardVariantClass,
                            sizeClass,
                            selectedSourceId === (item[itemKey] || item.id) ? activeThemeTokens.activePill : '',
                            isItemDragging(item, index, localData[0].id)
                                ? (ghostClass || `opacity-35 scale-[0.98] ring-2 ${activeThemeTokens.ghost} shadow-xl rotate-1 z-20`)
                                : 'hover:shadow-xs',
                            disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                        ]"
                    >
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                                v-if="handle && handlePosition === 'left' && !disabled"
                                class="shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                                :class="handleSizeClass"
                                style="touch-action: none;"
                                @mousedown="onHandleMouseDown"
                                @mouseup="onHandleMouseUp"
                                @touchstart="handleTouchStart($event, item, index, localData[0].id)"
                            >
                                <slot name="drag-handle">
                                    <span class="material-symbols-outlined leading-none" :class="handleSizeClass">drag_indicator</span>
                                </slot>
                            </div>

                            <div class="min-w-0 flex-1">
                                <slot name="item" :item="item" :index="index" :column="localData[0]">
                                    <span class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate block">
                                        {{ typeof item === 'object' ? (item.title || item.name || item.label) : item }}
                                    </span>
                                </slot>
                            </div>
                        </div>

                        <ButtonSubmit
                            v-if="!disabled && localData[1]"
                            type="button"
                            size="xs"
                            variant="ghost"
                            icon="chevron_right"
                            @click.stop="transferItem(localData[0].id, localData[1].id, item, index)"
                            title="Pindahkan ke kanan"
                        />
                    </div>
                </TransitionGroup>

                <div
                    v-if="!localData[0].items || localData[0].items.length === 0"
                    class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center select-none"
                >
                    <span class="material-symbols-outlined text-xl text-slate-300 dark:text-slate-600">inbox</span>
                    <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Kosong</span>
                </div>
            </div>

            <!-- Center Action Controls (Single & Mass Transfer) -->
            <div class="flex flex-row md:flex-col justify-center items-center gap-2 py-2 md:py-0">
                <ButtonSubmit
                    type="button"
                    size="sm"
                    variant="outline"
                    icon="chevron_right"
                    :disabled="disabled || !selectedSourceId"
                    @click="transferSelected(localData[0]?.id, localData[1]?.id, 'source')"
                    title="Pindahkan item yang dipilih ke kanan"
                />
                <ButtonSubmit
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon="keyboard_double_arrow_right"
                    :disabled="disabled || !localData[0]?.items?.length"
                    @click="transferAll(localData[0]?.id, localData[1]?.id)"
                    title="Pindahkan semua item ke kanan"
                />
                <ButtonSubmit
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon="keyboard_double_arrow_left"
                    :disabled="disabled || !localData[1]?.items?.length"
                    @click="transferAll(localData[1]?.id, localData[0]?.id)"
                    title="Pindahkan semua item ke kiri"
                />
                <ButtonSubmit
                    type="button"
                    size="sm"
                    variant="outline"
                    icon="chevron_left"
                    :disabled="disabled || !selectedTargetId"
                    @click="transferSelected(localData[1]?.id, localData[0]?.id, 'target')"
                    title="Pindahkan item yang dipilih ke kiri"
                />
            </div>

            <!-- Right Panel: Target -->
            <div
                v-if="localData[1]"
                data-dnd-column="true"
                :data-column-id="localData[1].id"
                @dragover="handleColumnDragOver"
                @drop="handleColumnDrop($event, localData[1].id)"
                class="flex flex-col rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3 min-h-80 transition-colors"
                :class="dragOverTarget.columnId === localData[1].id && isDragging ? activeThemeTokens.colHighlight : ''"
            >
                <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0">
                        <span class="material-symbols-outlined text-base text-emerald-500">task_alt</span>
                        {{ localData[1].title || transferTitles[1] || 'Item Terpilih' }}
                    </div>
                    <Badge size="xs" variant="soft" color="emerald" class="font-mono font-bold">
                        {{ localData[1].items ? localData[1].items.length : 0 }}
                    </Badge>
                </div>

                <!-- Instant Search Input (Target) -->
                <div v-if="transferSearchable">
                    <InputField
                        v-model="transferTargetSearch"
                        type="search"
                        size="xs"
                        :clearable="true"
                        placeholder="Cari item terpilih..."
                    />
                </div>

                <TransitionGroup
                    tag="div"
                    name="dnd-flip"
                    class="flex flex-col gap-2 flex-1 relative min-h-35 max-h-90 overflow-y-auto pr-1"
                >
                    <div
                        v-for="(item, index) in filteredTransferItems(1)"
                        :key="getItemUniqueKey(item, index)"
                        data-dnd-item="true"
                        :data-dnd-index="index"
                        :data-dnd-column="localData[1].id"
                        :draggable="isItemDraggable"
                        @dragstart="handleDragStart($event, item, index, localData[1].id)"
                        @dragover="handleDragOver($event, item, index, localData[1].id)"
                        @dragleave="handleDragLeave"
                        @drop.stop="handleDrop($event, item, index, localData[1].id)"
                        @dragend="handleDragEnd"
                        @click="selectedTargetId = (selectedTargetId === (item[itemKey] || item.id) ? null : (item[itemKey] || item.id))"
                        @dblclick="transferItem(localData[1].id, localData[0]?.id, item, index)"
                        class="group/dnd relative transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer"
                        :class="[
                            cardVariantClass,
                            sizeClass,
                            selectedTargetId === (item[itemKey] || item.id) ? activeThemeTokens.activePill : '',
                            isItemDragging(item, index, localData[1].id)
                                ? (ghostClass || `opacity-35 scale-[0.98] ring-2 ${activeThemeTokens.ghost} shadow-xl rotate-1 z-20`)
                                : 'hover:shadow-xs',
                            disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                        ]"
                    >
                        <ButtonSubmit
                            v-if="!disabled && localData[0]"
                            type="button"
                            size="xs"
                            variant="ghost"
                            icon="chevron_left"
                            @click.stop="transferItem(localData[1].id, localData[0].id, item, index)"
                            title="Pindahkan ke kiri"
                        />

                        <div class="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                            <div class="min-w-0 flex-1 text-right">
                                <slot name="item" :item="item" :index="index" :column="localData[1]">
                                    <span class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate block">
                                        {{ typeof item === 'object' ? (item.title || item.name || item.label) : item }}
                                    </span>
                                </slot>
                            </div>

                            <div
                                v-if="handle && handlePosition === 'right' && !disabled"
                                class="shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                                :class="handleSizeClass"
                                style="touch-action: none;"
                                @mousedown="onHandleMouseDown"
                                @mouseup="onHandleMouseUp"
                                @touchstart="handleTouchStart($event, item, index, localData[1].id)"
                            >
                                <slot name="drag-handle">
                                    <span class="material-symbols-outlined leading-none" :class="handleSizeClass">drag_indicator</span>
                                </slot>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>

                <div
                    v-if="!localData[1].items || localData[1].items.length === 0"
                    class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center select-none"
                >
                    <span class="material-symbols-outlined text-xl text-slate-300 dark:text-slate-600">inbox</span>
                    <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Kosong</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dnd-flip-move {
    transition: transform var(--dnd-duration, 300ms) cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
