<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Array,
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
        default: 3, // For grid mode: 1, 2, 3, 4, 6
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    handle: {
        type: Boolean,
        default: true, // Only draggable via grip handle
    },
    handlePosition: {
        type: String,
        default: 'left', // 'left' | 'right'
        validator: (val) => ['left', 'right'].includes(val),
    },
    cardVariant: {
        type: String,
        default: 'bordered', // 'bordered' | 'flat' | 'glass' | 'default'
        validator: (val) => ['bordered', 'flat', 'glass', 'default'].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'sm' | 'md' | 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    emptyText: {
        type: String,
        default: 'Tarik atau letakkan item di sini',
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
]);

// Internal synchronized state
const localData = ref([]);

// Drag state tracking
const isDragging = ref(false);
const draggedItem = ref(null);
const draggedSource = ref({ index: -1, columnId: null });
const dragOverTarget = ref({ index: -1, columnId: null, position: 'before' });
const isHandleActive = ref(false);

// Generate unique key helper
let idCounter = 0;
const getItemUniqueKey = (item, index) => {
    if (!item) return `dnd-row-${index}`;
    if (item[props.itemKey] !== undefined) return item[props.itemKey];
    if (item._dnd_id) return item._dnd_id;

    // Assign non-enumerable id if missing
    Object.defineProperty(item, '_dnd_id', {
        value: `dnd_${Date.now().toString(36)}_${++idCounter}`,
        enumerable: false,
        writable: true,
        configurable: true,
    });
    return item._dnd_id;
};

// Sync from modelValue
const syncFromProps = () => {
    if (Array.isArray(props.modelValue)) {
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

// Grid columns CSS class mapping
const gridColsClass = computed(() => {
    switch (Number(props.columns)) {
        case 1:
            return 'grid-cols-1';
        case 2:
            return 'grid-cols-1 sm:grid-cols-2';
        case 4:
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        case 6:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
        case 3:
        default:
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
});

// Card variant style mapping
const cardVariantClass = computed(() => {
    switch (props.cardVariant) {
        case 'flat':
            return 'bg-slate-50 dark:bg-slate-800/60 border border-transparent';
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60 shadow-sm';
        case 'default':
            return 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs';
        case 'bordered':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs';
    }
});

// Size class mapping
const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'p-2.5 text-xs rounded-xl';
        case 'lg':
            return 'p-4 text-base rounded-2xl';
        case 'md':
        default:
            return 'p-3 text-sm rounded-xl';
    }
});

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

    // Configure HTML5 DataTransfer
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        try {
            e.dataTransfer.setData('text/plain', JSON.stringify(item));
        } catch (err) {
            // fallback
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

    // Determine whether cursor is in before or after half of element
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

const handleDragLeave = (e, item, index, columnId = null) => {
    // Only reset if exiting to unrelated element
    if (e.currentTarget.contains(e.relatedTarget)) return;
};

const handleDrop = (e, targetItem, targetIndex, targetColumnId = null) => {
    if (!isDragging.value || props.disabled) return;
    e.preventDefault();

    const fromCol = draggedSource.value.columnId;
    const toCol = targetColumnId;
    const fromIdx = draggedSource.value.index;
    let toIdx = targetIndex;

    // Adjust destination index based on 'after' position
    if (dragOverTarget.value.position === 'after') {
        toIdx += 1;
    }

    // Execute move logic
    executeMove(fromCol, toCol, fromIdx, toIdx);
    resetDragState();
};

const handleColumnDragOver = (e, columnId) => {
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

    // Find column in localData
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
};

// --- Execution & State Mutator ---

const executeMove = (fromCol, toCol, fromIdx, toIdx) => {
    if (fromIdx < 0) return;

    if (props.mode === 'kanban') {
        // Multi-column Kanban Move
        const sourceColObj = localData.value.find((c) => c.id === fromCol);
        const targetColObj = localData.value.find((c) => c.id === toCol);

        if (!sourceColObj || !targetColObj) return;

        if (fromCol === toCol) {
            // Same column reorder
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
            // Cross-column transfer
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
        // List or Grid Mode
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

// --- Mobile / Touch Fallback Support ---

let touchCurrentEl = null;

const handleTouchStart = (e, item, index, columnId = null) => {
    if (props.disabled) return;
    isHandleActive.value = true;
    isDragging.value = true;
    draggedItem.value = item;
    draggedSource.value = { index, columnId };
    touchCurrentEl = e.currentTarget;
    if (navigator.vibrate) navigator.vibrate(10);
};

const handleTouchMove = (e) => {
    if (!isDragging.value) return;
    const touch = e.touches[0];
    if (!touch) return;

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;

    const targetCard = el.closest('[data-dnd-item]');
    if (targetCard) {
        const targetIndex = Number(targetCard.dataset.dndIndex);
        const targetCol = targetCard.dataset.dndColumn || null;
        dragOverTarget.value = { index: targetIndex, columnId: targetCol, position: 'before' };
    }
};

const handleTouchEnd = () => {
    if (!isDragging.value) return;
    if (dragOverTarget.value.index >= 0) {
        executeMove(
            draggedSource.value.columnId,
            dragOverTarget.value.columnId,
            draggedSource.value.index,
            dragOverTarget.value.index
        );
    }
    resetDragState();
};

// Check if specific item is currently being dragged
const isItemDragging = (item, index, columnId = null) => {
    if (!isDragging.value || !draggedItem.value) return false;
    return (
        draggedSource.value.index === index &&
        draggedSource.value.columnId === columnId
    );
};

// Check if specific slot has drop indicator
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
    <div class="w-full select-none" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
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
                        ? `grid gap-3.5 ${gridColsClass}`
                        : (direction === 'horizontal' ? 'flex flex-row gap-3 overflow-x-auto pb-2' : 'flex flex-col gap-2.5')
                ]"
            >
                <div
                    v-for="(item, index) in localData"
                    :key="getItemUniqueKey(item, index)"
                    data-dnd-item="true"
                    :data-dnd-index="index"
                    :draggable="isItemDraggable"
                    @dragstart="handleDragStart($event, item, index)"
                    @dragover="handleDragOver($event, item, index)"
                    @dragleave="handleDragLeave($event, item, index)"
                    @drop="handleDrop($event, item, index)"
                    @dragend="handleDragEnd"
                    class="group/dnd relative transition-all duration-200"
                    :class="[
                        cardVariantClass,
                        sizeClass,
                        isItemDragging(item, index)
                            ? (ghostClass || 'opacity-35 scale-[0.98] ring-2 ring-blue-500/60 shadow-xl rotate-1 z-20')
                            : 'hover:shadow-xs',
                        disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                    ]"
                >
                    <!-- Drop Indicator Bar: Before -->
                    <div
                        v-if="isDropTargetIndicator(index, null, 'before')"
                        class="absolute -top-1.5 left-0 right-0 h-1 bg-blue-600 rounded-full z-30 pointer-events-none shadow-sm shadow-blue-600/50 animate-pulse"
                    />

                    <!-- Card Body Content with Slot Support -->
                    <div class="flex items-center gap-3 w-full">
                        <!-- Drag Handle Icon (Left) -->
                        <div
                            v-if="handle && handlePosition === 'left' && !disabled"
                            class="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                            @mousedown="onHandleMouseDown"
                            @mouseup="onHandleMouseUp"
                            @touchstart="handleTouchStart($event, item, index)"
                            title="Tarik untuk memindahkan"
                        >
                            <slot name="drag-handle">
                                <span class="material-symbols-outlined text-lg leading-none">drag_indicator</span>
                            </slot>
                        </div>

                        <!-- Scoped Slot or Default Item Content -->
                        <div class="flex-1 min-w-0">
                            <slot
                                name="item"
                                :item="item"
                                :index="index"
                                :is-dragging="isItemDragging(item, index)"
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
                                    <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                        {{ item.badge }}
                                    </span>
                                </div>
                            </slot>
                        </div>

                        <!-- Drag Handle Icon (Right) -->
                        <div
                            v-if="handle && handlePosition === 'right' && !disabled"
                            class="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                            @mousedown="onHandleMouseDown"
                            @mouseup="onHandleMouseUp"
                            @touchstart="handleTouchStart($event, item, index)"
                            title="Tarik untuk memindahkan"
                        >
                            <slot name="drag-handle">
                                <span class="material-symbols-outlined text-lg leading-none">drag_indicator</span>
                            </slot>
                        </div>
                    </div>

                    <!-- Drop Indicator Bar: After -->
                    <div
                        v-if="isDropTargetIndicator(index, null, 'after')"
                        class="absolute -bottom-1.5 left-0 right-0 h-1 bg-blue-600 rounded-full z-30 pointer-events-none shadow-sm shadow-blue-600/50 animate-pulse"
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
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">{{ emptyText }}</p>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 2. MODE: KANBAN BOARD                      -->
        <!-- ========================================== -->
        <div
            v-else-if="mode === 'kanban'"
            class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
        >
            <div
                v-for="(column, colIdx) in localData"
                :key="column.id || `col-${colIdx}`"
                data-dnd-column="true"
                :data-column-id="column.id"
                @dragover="handleColumnDragOver($event, column.id)"
                @drop="handleColumnDrop($event, column.id)"
                class="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3 min-h-[360px] transition-colors"
                :class="dragOverTarget.columnId === column.id && isDragging ? 'ring-2 ring-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20' : ''"
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
                            <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                {{ column.title || column.name }}
                            </h4>
                        </div>
                        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {{ column.items ? column.items.length : 0 }}
                        </span>
                    </div>
                </slot>

                <!-- Column Items TransitionGroup List -->
                <TransitionGroup
                    tag="div"
                    name="dnd-flip"
                    class="flex flex-col gap-2.5 flex-1 relative min-h-[80px]"
                >
                    <div
                        v-for="(item, index) in (column.items || [])"
                        :key="getItemUniqueKey(item, index)"
                        data-dnd-item="true"
                        :data-dnd-index="index"
                        :data-dnd-column="column.id"
                        :draggable="isItemDraggable"
                        @dragstart="handleDragStart($event, item, index, column.id)"
                        @dragover="handleDragOver($event, item, index, column.id)"
                        @dragleave="handleDragLeave($event, item, index, column.id)"
                        @drop.stop="handleDrop($event, item, index, column.id)"
                        @dragend="handleDragEnd"
                        class="group/dnd relative transition-all duration-200"
                        :class="[
                            cardVariantClass,
                            sizeClass,
                            isItemDragging(item, index, column.id)
                                ? (ghostClass || 'opacity-35 scale-[0.98] ring-2 ring-blue-500/60 shadow-xl rotate-1 z-20')
                                : 'hover:shadow-xs',
                            disabled ? 'cursor-default' : (handle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'),
                        ]"
                    >
                        <!-- Drop Indicator Bar: Before -->
                        <div
                            v-if="isDropTargetIndicator(index, column.id, 'before')"
                            class="absolute -top-1.5 left-0 right-0 h-1 bg-blue-600 rounded-full z-30 pointer-events-none shadow-sm shadow-blue-600/50 animate-pulse"
                        />

                        <!-- Item Content -->
                        <div class="flex items-start gap-2.5 w-full">
                            <!-- Drag Handle (Left) -->
                            <div
                                v-if="handle && handlePosition === 'left' && !disabled"
                                class="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
                                @mousedown="onHandleMouseDown"
                                @mouseup="onHandleMouseUp"
                                @touchstart="handleTouchStart($event, item, index, column.id)"
                                title="Pindahkan tugas"
                            >
                                <slot name="drag-handle">
                                    <span class="material-symbols-outlined text-base leading-none">drag_indicator</span>
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
                                    :handle-props="{
                                        onMousedown: onHandleMouseDown,
                                        onMouseup: onHandleMouseUp,
                                        onTouchstart: (e) => handleTouchStart(e, item, index, column.id)
                                    }"
                                >
                                    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                                        {{ item.title || item.name }}
                                    </h5>
                                    <p v-if="item.description" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-normal">
                                        {{ item.description }}
                                    </p>
                                    <div v-if="item.tag || item.priority" class="flex items-center gap-1.5 mt-2">
                                        <span v-if="item.priority" class="px-2 py-0.5 rounded text-[10px] font-bold" :class="item.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                                            {{ item.priority }}
                                        </span>
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
                            class="absolute -bottom-1.5 left-0 right-0 h-1 bg-blue-600 rounded-full z-30 pointer-events-none shadow-sm shadow-blue-600/50 animate-pulse"
                        />
                    </div>
                </TransitionGroup>

                <!-- Empty Column Dropzone Placeholder -->
                <div
                    v-if="!column.items || column.items.length === 0"
                    class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center select-none"
                >
                    <span class="material-symbols-outlined text-xl text-slate-300 dark:text-slate-600">move_to_inbox</span>
                    <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                        {{ emptyText }}
                    </span>
                </div>

                <!-- Column Footer Slot (e.g. + Add Card button) -->
                <slot
                    name="column-footer"
                    :column="column"
                    :index="colIdx"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.dnd-flip-move {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>

