<script setup>
import { computed } from 'vue';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    activeIndex: {
        type: Number,
        default: 0,
    },
    variant: {
        type: String,
        default: 'compact', // 'compact' (border ring) | 'card' (gradient label caption)
    },
    position: {
        type: String,
        default: 'bottom', // 'bottom' | 'left' | 'right'
    },
    aspectRatio: {
        type: String,
        default: '', // jika kosong, compact: aspect-4/3, card: aspect-video
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select', 'update:activeIndex']);

const effectiveAspect = computed(() => {
    if (props.aspectRatio) return props.aspectRatio;
    return props.variant === 'card' ? 'aspect-video' : 'aspect-4/3';
});

const isVertical = computed(() => {
    return ['left', 'right'].includes(props.position);
});

const handleSelect = (idx) => {
    if (props.disabled || idx === props.activeIndex) return;
    emit('select', idx);
    emit('update:activeIndex', idx);
};
</script>

<template>
    <div
        :class="[
            'w-full select-none',
            isVertical
                ? 'flex flex-col gap-2.5 overflow-y-auto max-h-115 md:max-h-130 scrollbar-none [&::-webkit-scrollbar]:hidden pr-0.5'
                : 'grid gap-2 sm:gap-2.5',
            !isVertical && (
                variant === 'card'
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
            )
        ]"
    >
        <button
            v-for="(item, idx) in items"
            :key="idx"
            type="button"
            :disabled="disabled"
            @click="handleSelect(idx)"
            :class="[
                'relative overflow-hidden rounded-xl transition-all duration-200 cursor-pointer group text-left shrink-0',
                effectiveAspect,
                // Variant: Card (Caption Label di bawah)
                variant === 'card'
                    ? [
                        'bg-slate-900 border',
                        activeIndex === idx
                            ? 'border-blue-600 ring-2 sm:ring-3 ring-blue-500/30 shadow-md scale-[1.01] opacity-100 z-1'
                            : 'border-slate-200/90 dark:border-slate-800 opacity-85 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    ]
                    : [
                        // Variant: Compact (Strip rapi e-commerce)
                        'bg-slate-100 dark:bg-slate-800 border',
                        activeIndex === idx
                            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-xs opacity-100 scale-[1.02] z-1'
                            : 'border-slate-200/80 dark:border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    ]
            ]"
            :aria-label="`Pilih foto ${idx + 1}: ${item.label || item.alt || 'Foto produk'}`"
            :title="item.label || item.alt || `Foto ${idx + 1}`"
        >
            <!-- Image Thumbnail -->
            <img
                :src="item.thumb || item.src"
                :alt="item.alt || item.label || `Thumbnail ${idx + 1}`"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />

            <!-- Card Variant Caption Label Bar (Gaya Natural Showroom Otomotif) -->
            <div
                v-if="variant === 'card' && item.label"
                class="absolute inset-x-0 bottom-0 pt-4 pb-1.5 px-1 bg-linear-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center text-center"
            >
                <span
                    :class="[
                        'text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-colors px-0.5 text-center leading-tight drop-shadow-xs line-clamp-1',
                        activeIndex === idx
                            ? 'text-white'
                            : 'text-slate-200 group-hover:text-white'
                    ]"
                >
                    {{ item.label }}
                </span>
            </div>

            <!-- Optional Mini Badge Top-Right jika ada -->
            <div
                v-if="item.badge"
                class="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider shadow-xs"
            >
                {{ item.badge }}
            </div>
        </button>
    </div>
</template>
