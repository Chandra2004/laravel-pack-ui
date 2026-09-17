<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    badge: {
        type: String,
        default: '',
    },
    slides: {
        type: Array,
        default: () => [],
    },
    itemsPerView: {
        type: [Number, String],
        default: 1, // 1, 2, 3, 4
    },
    gap: {
        type: String,
        default: 'md', // 'none', 'sm', 'md', 'lg'
        validator: (val) => ['none', 'sm', 'md', 'lg'].includes(val),
    },
    autoplay: {
        type: Boolean,
        default: false,
    },
    autoplayInterval: {
        type: Number,
        default: 4500,
    },
    pauseOnHover: {
        type: Boolean,
        default: true,
    },
    showControls: {
        type: Boolean,
        default: true,
    },
    controlsPosition: {
        type: String,
        default: 'header', // 'header', 'sides', 'bottom'
        validator: (val) => ['header', 'sides', 'bottom'].includes(val),
    },
    showIndicators: {
        type: Boolean,
        default: true,
    },
    showCounter: {
        type: Boolean,
        default: true,
    },
    loop: {
        type: Boolean,
        default: true,
    },
    variant: {
        type: String,
        default: 'default',
    },
    rounded: {
        type: String,
        default: '2xl',
    },
    colorTheme: {
        type: String,
        default: 'default',
    },
});

const emit = defineEmits(['slide-change', 'reach-end', 'reach-start']);

const trackRef = ref(null);
const currentIndex = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);
let autoplayTimer = null;
let touchStartX = 0;
let touchEndX = 0;

const totalItems = computed(() => {
    return props.slides.length > 0 ? props.slides.length : 1;
});

const maxIndex = computed(() => {
    const perView = Number(props.itemsPerView) || 1;
    return Math.max(0, totalItems.value - perView);
});

const updateScrollButtons = () => {
    if (!trackRef.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.value;
    canScrollLeft.value = scrollLeft > 5;
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 5;
};

const scrollToIndex = (index) => {
    if (!trackRef.value) return;
    const targetIdx = Math.max(0, Math.min(index, maxIndex.value));
    const itemWidth = trackRef.value.clientWidth / (Number(props.itemsPerView) || 1);

    trackRef.value.scrollTo({
        left: targetIdx * itemWidth,
        behavior: 'smooth',
    });
    currentIndex.value = targetIdx;
    emit('slide-change', targetIdx);
};

const next = () => {
    if (currentIndex.value < maxIndex.value) {
        scrollToIndex(currentIndex.value + 1);
    } else if (props.loop) {
        scrollToIndex(0);
    } else {
        emit('reach-end');
    }
};

const prev = () => {
    if (currentIndex.value > 0) {
        scrollToIndex(currentIndex.value - 1);
    } else if (props.loop) {
        scrollToIndex(maxIndex.value);
    } else {
        emit('reach-start');
    }
};

const handleScroll = () => {
    if (!trackRef.value) return;
    updateScrollButtons();
    const itemWidth = trackRef.value.clientWidth / (Number(props.itemsPerView) || 1);
    if (itemWidth > 0) {
        const active = Math.round(trackRef.value.scrollLeft / itemWidth);
        currentIndex.value = Math.min(active, maxIndex.value);
    }
};

const startAutoplay = () => {
    if (props.autoplay && !autoplayTimer && totalItems.value > 1) {
        autoplayTimer = setInterval(() => {
            next();
        }, props.autoplayInterval);
    }
};

const stopAutoplay = () => {
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
};

const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
        if (diff > 0) next();
        else prev();
    }
};

onMounted(() => {
    startAutoplay();
    updateScrollButtons();
});

onBeforeUnmount(() => {
    stopAutoplay();
});

const gapClass = computed(() => {
    switch (props.gap) {
        case 'none': return 'gap-0';
        case 'sm': return 'gap-3';
        case 'lg': return 'gap-6';
        case 'md':
        default: return 'gap-4';
    }
});

const itemWidthStyle = computed(() => {
    const n = Number(props.itemsPerView) || 1;
    if (n <= 1) return { width: '100%', flexShrink: 0 };
    return { width: `calc(${100 / n}% - 12px)`, flexShrink: 0 };
});
</script>

<template>
    <div
        class="w-full relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col"
        @mouseenter="pauseOnHover ? stopAutoplay() : null"
        @mouseleave="pauseOnHover ? startAutoplay() : null"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
    >
        <!-- SLIDER HEADER -->
        <div
            v-if="title || icon || badge || (showControls && controlsPosition === 'header')"
            class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 select-none"
        >
            <div class="flex items-center gap-2.5 min-w-0">
                <span v-if="icon" class="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400 shrink-0">
                    {{ icon }}
                </span>
                <div v-if="title" class="min-w-0">
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{{ title }}</h3>
                        <span v-if="badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            {{ badge }}
                        </span>
                    </div>
                    <p v-if="subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ subtitle }}</p>
                </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <!-- Slide Counter -->
                <span v-if="showCounter && totalItems > 1" class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 mr-1">
                    {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(maxIndex + 1).padStart(2, '0') }}
                </span>

                <!-- Prev & Next in Header -->
                <div v-if="showControls && controlsPosition === 'header'" class="flex items-center gap-1">
                    <button
                        type="button"
                        @click="prev"
                        :disabled="!loop && !canScrollLeft"
                        class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer"
                        title="Geser Sebelumnya"
                    >
                        <span class="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                        type="button"
                        @click="next"
                        :disabled="!loop && !canScrollRight"
                        class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer"
                        title="Geser Selanjutnya"
                    >
                        <span class="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>

                <slot name="header-actions" />
            </div>
        </div>

        <!-- TRACK & SLIDES -->
        <div class="relative w-full p-4 sm:p-5 flex-1">
            <!-- Floating Side Buttons -->
            <template v-if="showControls && controlsPosition === 'sides' && totalItems > 1">
                <button
                    type="button"
                    @click="prev"
                    :disabled="!loop && !canScrollLeft"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                    title="Sebelumnya"
                >
                    <span class="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                    type="button"
                    @click="next"
                    :disabled="!loop && !canScrollRight"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                    title="Selanjutnya"
                >
                    <span class="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </template>

            <!-- Scrollable Track -->
            <div
                ref="trackRef"
                @scroll="handleScroll"
                class="flex overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory"
                :class="gapClass"
            >
                <template v-if="slides && slides.length > 0">
                    <div
                        v-for="(slide, sIdx) in slides"
                        :key="sIdx"
                        class="snap-start shrink-0"
                        :style="itemWidthStyle"
                    >
                        <slot name="slide" :slide="slide" :index="sIdx">
                            <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ slide.title || `Item ${sIdx + 1}` }}</h4>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ slide.description || '' }}</p>
                            </div>
                        </slot>
                    </div>
                </template>

                <!-- Default slot for custom children cards -->
                <slot v-else />
            </div>
        </div>

        <!-- FOOTER WITH INDICATORS -->
        <div
            v-if="showIndicators || controlsPosition === 'bottom'"
            class="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
        >
            <div class="flex items-center gap-1.5 mx-auto">
                <button
                    v-for="dotIdx in (maxIndex + 1)"
                    :key="dotIdx"
                    type="button"
                    @click="scrollToIndex(dotIdx - 1)"
                    class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    :class="[
                        (currentIndex === dotIdx - 1)
                            ? 'w-6 bg-blue-600 dark:bg-blue-400'
                            : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    ]"
                    :title="`Pergi ke slide ${dotIdx}`"
                />
            </div>

            <!-- Bottom Controls -->
            <div v-if="showControls && controlsPosition === 'bottom'" class="flex items-center gap-1">
                <button
                    type="button"
                    @click="prev"
                    :disabled="!loop && !canScrollLeft"
                    class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer"
                >
                    <span class="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                    type="button"
                    @click="next"
                    :disabled="!loop && !canScrollRight"
                    class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer"
                >
                    <span class="material-symbols-outlined text-base">chevron_right</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

