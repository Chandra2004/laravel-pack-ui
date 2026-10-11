<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import Badge from '../Badge.vue';

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
    colorTheme: {
        type: String,
        default: 'primary',
    },
    radius: {
        type: String,
        default: 'xl',
    },
    showBadges: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select', 'update:activeIndex']);

const thumbRefs = ref([]);
const setThumbRef = (el, idx) => {
    if (el) thumbRefs.value[idx] = el;
};

// Scroll thumbnail aktif ke viewport secara otomatis
watch(() => props.activeIndex, (newIdx) => {
    nextTick(() => {
        if (thumbRefs.value[newIdx] && typeof thumbRefs.value[newIdx].scrollIntoView === 'function') {
            thumbRefs.value[newIdx].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    });
});

const effectiveAspect = computed(() => {
    if (props.aspectRatio) return props.aspectRatio;
    return props.variant === 'card' ? 'aspect-video' : 'aspect-4/3';
});

const isVertical = computed(() => {
    return ['left', 'right'].includes(props.position);
});

// Lebar thumbnail disesuaikan agar tidak gepeng atau overlap saat scroll horizontal maupun vertikal
const itemWidthClass = computed(() => {
    if (isVertical.value) {
        return 'w-20 sm:w-24 md:w-full snap-start';
    }
    // Posisi horizontal ('bottom' atau 'top'): lebar tetap dengan shrink-0 agar scroll kesamping
    if (props.variant === 'card') {
        return 'w-28 sm:w-32 md:w-36 snap-start';
    }
    return 'w-18 sm:w-20 md:w-24 snap-start';
});

// Radius Classes
const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
};

const currentRadius = computed(() => radiusClasses[props.radius] || 'rounded-xl');

// Theme border & ring styles
const themeActiveRing = computed(() => {
    switch (props.colorTheme) {
        case 'indigo':
            return 'border-indigo-600 ring-2 ring-indigo-500/30';
        case 'emerald':
            return 'border-emerald-600 ring-2 ring-emerald-500/30';
        case 'purple':
            return 'border-purple-600 ring-2 ring-purple-500/30';
        case 'amber':
            return 'border-amber-500 ring-2 ring-amber-500/30';
        case 'rose':
            return 'border-rose-600 ring-2 ring-rose-500/30';
        case 'cyan':
            return 'border-cyan-600 ring-2 ring-cyan-500/30';
        case 'dark':
            return 'border-slate-800 dark:border-white ring-2 ring-slate-500/30';
        case 'primary':
        default:
            return 'border-blue-600 ring-2 ring-blue-500/30';
    }
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
            'w-full max-w-full select-none',
            isVertical
                ? 'flex md:flex-col flex-row gap-2 sm:gap-2.5 overflow-x-auto md:overflow-y-auto md:h-full md:max-h-full scrollbar-none md:[&::-webkit-scrollbar]:w-1.5 md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:md:[&::-webkit-scrollbar-thumb]:bg-slate-700 md:[&::-webkit-scrollbar-thumb]:rounded-full hover:md:[&::-webkit-scrollbar-thumb]:bg-slate-400 pb-1 md:pb-0 pr-0 md:pr-1 snap-x snap-mandatory md:snap-y'
                : 'flex flex-row flex-nowrap items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 pb-1.5 pt-0.5 snap-x snap-mandatory'
        ]"
    >
        <button
            v-for="(item, idx) in items"
            :key="idx"
            :ref="el => setThumbRef(el, idx)"
            type="button"
            :disabled="disabled"
            @click="handleSelect(idx)"
            :class="[
                'relative overflow-hidden transition-all duration-200 cursor-pointer group text-left shrink-0 outline-none focus:outline-none ring-0',
                itemWidthClass,
                effectiveAspect,
                currentRadius,
                // Variant: Card (Caption Label di bawah)
                variant === 'card'
                    ? [
                        'bg-slate-900 border',
                        activeIndex === idx
                            ? `${themeActiveRing} shadow-md scale-[1.01] opacity-100 z-1`
                            : 'border-slate-200/90 dark:border-slate-800 opacity-85 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    ]
                    : [
                        // Variant: Compact (Strip rapi e-commerce)
                        'bg-slate-100 dark:bg-slate-800 border',
                        activeIndex === idx
                            ? `${themeActiveRing} shadow-xs opacity-100 scale-[1.02] z-1`
                            : 'border-slate-200/80 dark:border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    ]
            ]"
            :aria-label="`Pilih media ${idx + 1}: ${item.label || item.alt || 'Foto produk'}`"
            :title="item.label || item.alt || `Media ${idx + 1}`"
        >
            <!-- Image Thumbnail -->
            <img
                :src="item.thumb || item.src"
                :alt="item.alt || item.label || `Thumbnail ${idx + 1}`"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />

            <!-- Video Overlay Play Indicator if media is video -->
            <div
                v-if="item.type === 'video'"
                class="absolute inset-0 z-2 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition-colors pointer-events-none"
            >
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center shadow-md border border-white/30">
                    <span class="material-symbols-outlined text-sm sm:text-base leading-none translate-x-0.2">play_arrow</span>
                </div>
            </div>

            <!-- Card Variant Caption Label Bar (Gaya Natural Showroom Otomotif) -->
            <div
                v-if="variant === 'card' && item.label"
                class="absolute inset-x-0 bottom-0 pt-4 pb-1.5 px-1 bg-linear-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center text-center z-3"
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

            <!-- Optional Mini Badge Top-Right jika ada dan showBadges bernilai true -->
            <div
                v-if="showBadges && item.badge"
                class="absolute top-1 right-1 pointer-events-none z-3"
            >
                <Badge
                    variant="solid"
                    color="neutral"
                    size="xs"
                    rounded="md"
                    class="bg-black/70! backdrop-blur-xs! text-white! uppercase tracking-wider text-[9px]! px-1.5! py-0.5! shadow-xs border-0!"
                >
                    {{ item.badge }}
                </Badge>
            </div>
        </button>
    </div>
</template>
