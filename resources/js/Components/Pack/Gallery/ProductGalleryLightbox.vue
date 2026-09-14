<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    items: {
        type: Array,
        default: () => [],
    },
    initialIndex: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits(['update:modelValue', 'close', 'change']);

const currentIndex = ref(props.initialIndex);
const zoomLevel = ref(1); // 1, 1.5, 2, 2.5, 3
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const isZoomed = computed(() => zoomLevel.value > 1);

const currentItem = computed(() => {
    return props.items[currentIndex.value] || {};
});

const resetZoom = () => {
    zoomLevel.value = 1;
    position.value = { x: 0, y: 0 };
    isDragging.value = false;
};

watch(() => props.initialIndex, (val) => {
    currentIndex.value = val;
    resetZoom();
});

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        currentIndex.value = props.initialIndex;
        resetZoom();
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }
    } else {
        resetZoom();
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    }
});

const zoomIn = () => {
    if (zoomLevel.value < 3) {
        zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.5).toFixed(1));
    }
};

const zoomOut = () => {
    if (zoomLevel.value > 1) {
        zoomLevel.value = Math.max(1, +(zoomLevel.value - 0.5).toFixed(1));
        if (zoomLevel.value <= 1) {
            resetZoom();
        }
    }
};

const toggleZoom = () => {
    if (isZoomed.value) {
        resetZoom();
    } else {
        zoomLevel.value = 2;
        position.value = { x: 0, y: 0 };
    }
};

const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        // Zoom in
        if (zoomLevel.value < 3) {
            zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2));
        }
    } else {
        // Zoom out
        if (zoomLevel.value > 1) {
            zoomLevel.value = Math.max(1, +(zoomLevel.value - 0.25).toFixed(2));
            if (zoomLevel.value <= 1) {
                resetZoom();
            }
        }
    }
};

const handleMouseDown = (e) => {
    if (zoomLevel.value <= 1) return;
    isDragging.value = true;
    dragStart.value = {
        x: e.clientX - position.value.x,
        y: e.clientY - position.value.y,
    };
};

const handleMouseMove = (e) => {
    if (!isDragging.value || zoomLevel.value <= 1) return;
    position.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y,
    };
};

const handleMouseUp = () => {
    isDragging.value = false;
};

const prev = () => {
    if (props.items.length <= 1) return;
    resetZoom();
    currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length;
    emit('change', currentIndex.value);
};

const next = () => {
    if (props.items.length <= 1) return;
    resetZoom();
    currentIndex.value = (currentIndex.value + 1) % props.items.length;
    emit('change', currentIndex.value);
};

const close = () => {
    resetZoom();
    emit('update:modelValue', false);
    emit('close');
};

// Keyboard Hotkeys
const handleKeydown = (e) => {
    if (!props.modelValue) return;
    if (e.key === 'Escape') {
        close();
    } else if (e.key === 'ArrowLeft' && !isZoomed.value) {
        prev();
    } else if (e.key === 'ArrowRight' && !isZoomed.value) {
        next();
    } else if (e.key === '+' || e.key === '=') {
        zoomIn();
    } else if (e.key === '-') {
        zoomOut();
    } else if (e.key === '0') {
        resetZoom();
    }
};

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeydown);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
        document.body.style.overflow = '';
    }
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-250 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex flex-col bg-black/94 backdrop-blur-md select-none"
                role="dialog"
                aria-modal="true"
            >
                <!-- Lightbox Top Header Bar -->
                <div class="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-linear-to-b from-black/85 via-black/40 to-transparent">
                    <!-- Title & Photo Counter -->
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/15">
                            <span class="material-symbols-outlined text-sm">photo_camera</span>
                            <span>{{ currentIndex + 1 }} / {{ items.length }}</span>
                        </span>
                        <div class="min-w-0">
                            <p class="text-xs sm:text-sm font-bold text-white truncate">
                                {{ currentItem.label || currentItem.alt || 'Foto Detail Produk' }}
                            </p>
                        </div>
                    </div>

                    <!-- Right Controls (Interactive Zoom & Close) -->
                    <div class="flex items-center gap-1.5 sm:gap-2">
                        <!-- Zoom Level Percentage Pill -->
                        <div class="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15">
                            <!-- Zoom Out Button -->
                            <button
                                type="button"
                                @click="zoomOut"
                                :disabled="zoomLevel <= 1"
                                :class="[
                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                    zoomLevel <= 1
                                        ? 'text-white/30 cursor-not-allowed'
                                        : 'text-white hover:bg-white/20 cursor-pointer'
                                ]"
                                title="Perkecil Zoom (-)"
                                aria-label="Perkecil Zoom"
                            >
                                <span class="material-symbols-outlined text-base">zoom_out</span>
                            </button>

                            <!-- Current Zoom Indicator / Reset -->
                            <button
                                type="button"
                                @click="toggleZoom"
                                class="px-2 py-1 text-xs font-mono font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                                :title="isZoomed ? 'Klik untuk reset zoom (100%)' : 'Klik untuk perbesar 200%'"
                            >
                                {{ Math.round(zoomLevel * 100) }}%
                            </button>

                            <!-- Zoom In Button -->
                            <button
                                type="button"
                                @click="zoomIn"
                                :disabled="zoomLevel >= 3"
                                :class="[
                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                    zoomLevel >= 3
                                        ? 'text-white/30 cursor-not-allowed'
                                        : 'text-white hover:bg-white/20 cursor-pointer'
                                ]"
                                title="Perbesar Zoom (+)"
                                aria-label="Perbesar Zoom"
                            >
                                <span class="material-symbols-outlined text-base">zoom_in</span>
                            </button>
                        </div>

                        <!-- Reset Button jika sedang di-zoom -->
                        <button
                            v-if="isZoomed"
                            type="button"
                            @click="resetZoom"
                            class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Kembalikan Tampilan Normal (0)"
                            aria-label="Reset Zoom"
                        >
                            <span class="material-symbols-outlined text-lg">fit_screen</span>
                        </button>

                        <!-- Close Button -->
                        <button
                            type="button"
                            @click="close"
                            class="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                            title="Tutup Modal (Esc)"
                            aria-label="Tutup Modal"
                        >
                            <span class="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>

                <!-- Main Viewport Area with Pan & Drag -->
                <div
                    class="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
                    @wheel="handleWheel"
                    @mousedown="handleMouseDown"
                    @mousemove="handleMouseMove"
                    @mouseup="handleMouseUp"
                    @mouseleave="handleMouseUp"
                    @click.self="isZoomed ? resetZoom() : close()"
                >
                    <!-- Prev Button (Hanya jika tidak sedang zoom in) -->
                    <button
                        v-if="items.length > 1 && !isZoomed"
                        type="button"
                        @click="prev"
                        class="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-black/50 hover:bg-blue-600 text-white border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                        title="Foto Sebelumnya (Arrow Left)"
                        aria-label="Foto Sebelumnya"
                    >
                        <span class="material-symbols-outlined text-2xl sm:text-3xl leading-none">chevron_left</span>
                    </button>

                    <!-- Active Image Display Container -->
                    <div
                        class="max-w-full max-h-full flex items-center justify-center transition-all select-none"
                        :class="[
                            isZoomed
                                ? (isDragging ? 'cursor-grabbing' : 'cursor-grab')
                                : 'cursor-zoom-in'
                        ]"
                        @dblclick="toggleZoom"
                    >
                        <img
                            :key="currentIndex"
                            :src="currentItem.src"
                            :alt="currentItem.alt || 'Foto produk'"
                            :style="{
                                transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${zoomLevel})`,
                                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }"
                            class="object-contain rounded-xl shadow-2xl max-w-full max-h-[72vh] sm:max-h-[78vh] pointer-events-auto"
                            draggable="false"
                        />
                    </div>

                    <!-- Next Button (Hanya jika tidak sedang zoom in) -->
                    <button
                        v-if="items.length > 1 && !isZoomed"
                        type="button"
                        @click="next"
                        class="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-black/50 hover:bg-blue-600 text-white border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                        title="Foto Berikutnya (Arrow Right)"
                        aria-label="Foto Berikutnya"
                    >
                        <span class="material-symbols-outlined text-2xl sm:text-3xl leading-none">chevron_right</span>
                    </button>

                    <!-- Zoom Interaction Hint Bar -->
                    <div
                        v-if="isZoomed"
                        class="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white/90 text-xs font-medium border border-white/15 flex items-center gap-2 shadow-lg pointer-events-none"
                    >
                        <span class="material-symbols-outlined text-sm text-blue-400">pan_tool</span>
                        <span>Klik & geser untuk melihat detail • Scroll mouse untuk atur zoom • Klik ganda untuk reset</span>
                    </div>
                </div>

                <!-- Bottom Mini-Thumbnails Strip Jumper -->
                <div
                    v-if="items.length > 1"
                    class="relative z-10 px-4 py-3 bg-linear-to-t from-black/90 to-transparent flex items-center justify-center overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden gap-2 sm:gap-2.5"
                >
                    <button
                        v-for="(thumb, idx) in items"
                        :key="idx"
                        type="button"
                        @click="currentIndex = idx; resetZoom(); $emit('change', idx)"
                        :class="[
                            'w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0',
                            currentIndex === idx
                                ? 'border-blue-500 scale-105 opacity-100 shadow-md ring-2 ring-blue-500/40'
                                : 'border-transparent opacity-40 hover:opacity-80'
                        ]"
                    >
                        <img :src="thumb.thumb || thumb.src" :alt="thumb.alt || ''" class="w-full h-full object-cover" />
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
