<script setup>
import { ref, computed, watch } from 'vue';
import ProductGalleryThumbnails from './Gallery/ProductGalleryThumbnails.vue';
import ProductGalleryLightbox from './Gallery/ProductGalleryLightbox.vue';

const props = defineProps({
    /**
     * 1. FOTO PRODUK
     * Array string URL: ['/img1.jpg', '/img2.jpg']
     * atau Array object: [{ src, thumb, alt, label, badge }]
     */
    images: {
        type: Array,
        default: () => [],
    },
    modelValue: {
        type: Number,
        default: 0,
    },
    active: {
        type: Number,
        default: 0,
    },

    /**
     * 2. PILAR BENTUK (radius, aspect-ratio, fit, borderless)
     */
    aspectRatio: {
        type: String,
        default: 'aspect-video', // 'aspect-video' (16:9), 'aspect-16/10', 'aspect-4/3', 'aspect-square'
    },
    imageFit: {
        type: String,
        default: 'contain', // 'contain' (gambar utuh tanpa terpotong) | 'cover'
    },
    radius: {
        type: String,
        default: '2xl', // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    },
    rounded: {
        type: String,
        default: '', // Fallback backward compatibility
    },
    borderless: {
        type: Boolean,
        default: false,
    },

    /**
     * 3. PILAR WARNA (colorTheme)
     */
    colorTheme: {
        type: String,
        default: 'primary', // 'primary' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'dark'
    },

    /**
     * 4. PILAR TEKS KONTEN & BADGES KAYA
     * Mendukung array string: ['Servis AHASS', 'Bebas Asap']
     * atau array object: [{ title, description, icon, colorTheme, variant }]
     */
    badges: {
        type: Array,
        default: () => [],
    },
    badgeLayout: {
        type: String,
        default: 'column', // 'column' (kebawah lalu kesamping) | 'row' (kesamping) | 'compact'
    },
    badgePosition: {
        type: String,
        default: 'top-left', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    },
    watermark: {
        type: String,
        default: '',
    },
    showCounter: {
        type: Boolean,
        default: true,
    },

    /**
     * 5. THUMBNAILS & KONTROL
     */
    thumbnailsVariant: {
        type: String,
        default: 'compact', // 'compact' (ring sorot) | 'card' (caption label e.g. DASHBOARD)
    },
    thumbnailsPosition: {
        type: String,
        default: 'bottom', // 'bottom' | 'left' | 'right'
    },
    showThumbnails: {
        type: Boolean,
        default: true,
    },
    showArrows: {
        type: Boolean,
        default: true,
    },
    enableLightbox: {
        type: Boolean,
        default: true,
    },

    /**
     * 6. RESPONSIF & TOUCH GESTURE
     */
    enableSwipe: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits([
    'update:modelValue',
    'update:active',
    'change',
    'click-image',
    'open-lightbox',
]);

const currentIndex = ref(props.modelValue || props.active || 0);
const isLightboxOpen = ref(false);

watch(() => props.modelValue, (val) => {
    if (val !== undefined && val !== currentIndex.value) {
        currentIndex.value = val;
    }
});

watch(() => props.active, (val) => {
    if (val !== undefined && val !== currentIndex.value) {
        currentIndex.value = val;
    }
});

// Normalisasi struktur gambar agar seragam
const normalizedImages = computed(() => {
    if (!Array.isArray(props.images)) return [];
    return props.images.map((item, idx) => {
        if (typeof item === 'string') {
            return {
                src: item,
                thumb: item,
                alt: `Foto produk ${idx + 1}`,
                label: '',
                badge: '',
            };
        }
        return {
            src: item.src || item.url || '',
            thumb: item.thumb || item.thumbnail || item.src || item.url || '',
            alt: item.alt || item.label || `Foto produk ${idx + 1}`,
            label: item.label || '',
            badge: item.badge || '',
        };
    });
});

const currentImage = computed(() => {
    return normalizedImages.value[currentIndex.value] || { src: '', alt: '' };
});

// Radius Mapping
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

const heroRadiusClass = computed(() => {
    if (props.radius && radiusClasses[props.radius]) {
        return radiusClasses[props.radius];
    }
    return props.rounded || 'rounded-2xl';
});

// Normalisasi Floating Badges dengan Icon + Judul + Penjelasan
const normalizedBadges = computed(() => {
    if (!Array.isArray(props.badges)) return [];
    return props.badges.map((badge, idx) => {
        if (typeof badge === 'string') {
            return {
                title: badge,
                description: '',
                icon: 'verified',
                colorTheme: idx === 0 ? 'dark' : (props.colorTheme || 'primary'),
                variant: idx === 0 ? 'dark' : 'glass',
            };
        }
        return {
            title: badge.title || badge.label || '',
            description: badge.description || badge.penjelasan || badge.subtext || '',
            icon: badge.icon || 'verified',
            colorTheme: badge.colorTheme || (badge.variant === 'dark' ? 'dark' : (props.colorTheme || 'primary')),
            variant: badge.variant || 'glass',
        };
    });
});

// Posisi Badge Container
const badgePositionClasses = computed(() => {
    switch (props.badgePosition) {
        case 'top-right':
            return 'top-3 right-3 items-end';
        case 'bottom-left':
            return 'bottom-12 left-3 items-start';
        case 'bottom-right':
            return 'bottom-12 right-3 items-end';
        case 'top-left':
        default:
            return 'top-3 left-3 items-start';
    }
});

// Tata Letak Badges (Kebawah lalu kesamping)
const badgeLayoutClasses = computed(() => {
    switch (props.badgeLayout) {
        case 'row':
            return 'flex flex-row flex-wrap gap-2';
        case 'compact':
            return 'flex flex-col gap-1.5';
        case 'column':
        default:
            // "defaultnya kebawah terus kesamping, karena badge bisa lebih dari 1 juga"
            return 'flex flex-col flex-wrap max-h-[75%] sm:max-h-[85%] gap-2';
    }
});

// Gaya Kartu Badge
const getBadgeCardClasses = (badge) => {
    const isDark = badge.variant === 'dark' || badge.colorTheme === 'dark';

    if (isDark) {
        return 'bg-slate-950/85 text-white border border-white/15 shadow-md';
    }

    if (badge.variant === 'solid') {
        return 'bg-slate-900 text-white border border-slate-700 shadow-md';
    }

    // Glassmorphic standard (light/dark adaptif)
    return 'bg-white/90 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/15 shadow-sm hover:border-slate-300 dark:hover:border-white/30';
};

// Warna Ikon Badge Box
const getBadgeIconBoxClasses = (badge) => {
    const theme = badge.colorTheme || props.colorTheme;
    switch (theme) {
        case 'emerald':
            return 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400';
        case 'purple':
            return 'bg-purple-500/15 text-purple-500 dark:text-purple-400';
        case 'amber':
            return 'bg-amber-500/15 text-amber-500 dark:text-amber-400';
        case 'rose':
            return 'bg-rose-500/15 text-rose-500 dark:text-rose-400';
        case 'cyan':
            return 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400';
        case 'indigo':
            return 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400';
        case 'dark':
            return 'bg-white/15 text-amber-400';
        case 'primary':
        default:
            return 'bg-blue-500/15 text-blue-500 dark:text-blue-400';
    }
};

const selectImage = (idx) => {
    if (idx < 0 || idx >= normalizedImages.value.length) return;
    currentIndex.value = idx;
    emit('update:modelValue', idx);
    emit('update:active', idx);
    emit('change', idx);
};

const next = () => {
    if (normalizedImages.value.length <= 1) return;
    const nextIdx = (currentIndex.value + 1) % normalizedImages.value.length;
    selectImage(nextIdx);
};

const prev = () => {
    if (normalizedImages.value.length <= 1) return;
    const prevIdx = (currentIndex.value - 1 + normalizedImages.value.length) % normalizedImages.value.length;
    selectImage(prevIdx);
};

const handleHeroClick = () => {
    emit('click-image', currentImage.value, currentIndex.value);
    if (props.enableLightbox) {
        isLightboxOpen.value = true;
        emit('open-lightbox', currentIndex.value);
    }
};

const openLightbox = () => {
    isLightboxOpen.value = true;
    emit('open-lightbox', currentIndex.value);
};

const closeLightbox = () => {
    isLightboxOpen.value = false;
};

const onLightboxIndexChange = (idx) => {
    selectImage(idx);
};

// Mobile Touch Swipe Gesture Handling
const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwiping = ref(false);

const handleTouchStart = (e) => {
    if (!props.enableSwipe || e.touches.length !== 1) return;
    touchStartX.value = e.touches[0].clientX;
    touchStartY.value = e.touches[0].clientY;
    isSwiping.value = true;
};

const handleTouchEnd = (e) => {
    if (!isSwiping.value || !props.enableSwipe) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.value;
    const diffY = e.changedTouches[0].clientY - touchStartY.value;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
            next();
        } else {
            prev();
        }
    }
    isSwiping.value = false;
};

defineExpose({
    currentIndex,
    next,
    prev,
    selectImage,
    openLightbox,
    closeLightbox,
});
</script>

<template>
    <div
        :class="[
            'w-full flex transition-colors duration-200',
            thumbnailsPosition === 'left' ? 'flex-col-reverse md:flex-row items-start gap-3 sm:gap-4' : '',
            thumbnailsPosition === 'right' ? 'flex-col md:flex-row items-start gap-3 sm:gap-4' : '',
            thumbnailsPosition === 'bottom' ? 'flex-col gap-3' : '',
        ]"
    >
        <!-- Side Thumbnails (Left Position) -->
        <div
            v-if="showThumbnails && normalizedImages.length > 1 && thumbnailsPosition === 'left'"
            class="w-full md:w-24 lg:w-28 xl:w-32 shrink-0"
        >
            <ProductGalleryThumbnails
                :items="normalizedImages"
                :active-index="currentIndex"
                :variant="thumbnailsVariant"
                :color-theme="colorTheme"
                :radius="radius"
                position="left"
                @select="selectImage"
            />
        </div>

        <!-- Main Gallery Container -->
        <div class="flex-1 min-w-0 w-full space-y-3">
            <!-- Hero Main Image Viewer -->
            <div
                :class="[
                    'relative w-full overflow-hidden bg-slate-900 select-none group flex items-center justify-center touch-pan-y',
                    heroRadiusClass,
                    aspectRatio,
                    borderless
                        ? ''
                        : 'border border-slate-200/90 dark:border-slate-800 shadow-sm'
                ]"
                @touchstart.passive="handleTouchStart"
                @touchend.passive="handleTouchEnd"
            >
                <!-- Ambient Blurred Backdrop untuk gambar portrait dalam frame landscape -->
                <div
                    v-if="imageFit === 'contain'"
                    class="absolute inset-0 overflow-hidden pointer-events-none select-none"
                    aria-hidden="true"
                >
                    <img
                        :src="currentImage.src"
                        alt=""
                        class="w-full h-full object-cover blur-2xl opacity-25 scale-110"
                    />
                    <div class="absolute inset-0 bg-black/30"></div>
                </div>

                <!-- Hero Image Element: Utuh dari atas sampai bawah (Fit Vertically) -->
                <img
                    :key="currentImage.src"
                    :src="currentImage.src"
                    :alt="currentImage.alt"
                    :class="[
                        'relative z-1 transition-transform duration-300',
                        imageFit === 'cover'
                            ? 'w-full h-full object-cover'
                            : 'h-full w-auto max-w-full max-h-full object-contain mx-auto',
                        enableLightbox ? 'cursor-pointer group-hover:scale-[1.015]' : '',
                    ]"
                    @click="handleHeroClick"
                    loading="eager"
                />

                <!-- Click to Zoom Hover Overlay Indicator -->
                <div
                    v-if="enableLightbox"
                    @click="handleHeroClick"
                    class="absolute inset-0 z-2 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
                >
                    <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
                        <span class="material-symbols-outlined text-base leading-none">zoom_in</span>
                        <span>Klik untuk perbesar</span>
                    </span>
                </div>

                <!-- ================================================================= -->
                <!-- FLOATING BADGES: MEMILIKI ICON + JUDUL + PENJELASAN (KEBAWAH TERUS KESAMPING) -->
                <!-- ================================================================= -->
                <div
                    v-if="normalizedBadges.length > 0 || $slots.badges"
                    :class="[
                        'absolute z-10 max-w-[92%] sm:max-w-[85%] pointer-events-none',
                        badgePositionClasses
                    ]"
                >
                    <slot name="badges" :badges="normalizedBadges">
                        <div :class="[badgeLayoutClasses, 'pointer-events-auto']">
                            <div
                                v-for="(badge, bIdx) in normalizedBadges"
                                :key="bIdx"
                                class="inline-flex items-center gap-2.5 px-3 py-1.5 sm:py-2 rounded-xl backdrop-blur-md transition-transform duration-150 hover:scale-102 max-w-[260px] sm:max-w-xs text-left shrink-0"
                                :class="[getBadgeCardClasses(badge)]"
                            >
                                <slot name="badge" :badge="badge" :index="bIdx">
                                    <!-- Badge Icon -->
                                    <div
                                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        :class="getBadgeIconBoxClasses(badge)"
                                    >
                                        <span class="material-symbols-outlined text-base leading-none">
                                            {{ badge.icon }}
                                        </span>
                                    </div>

                                    <!-- Badge Content (Judul + Penjelasan Deskriptif) -->
                                    <div class="flex flex-col min-w-0 pr-0.5">
                                        <span class="text-xs font-bold leading-tight tracking-tight truncate">
                                            {{ badge.title }}
                                        </span>
                                        <span
                                            v-if="badge.description"
                                            class="text-[10px] sm:text-[10.5px] leading-tight opacity-75 mt-0.5 line-clamp-2"
                                        >
                                            {{ badge.description }}
                                        </span>
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </slot>
                </div>

                <!-- Bottom-Left Watermark / Showroom Credit Tag -->
                <div
                    v-if="watermark || $slots.watermark"
                    class="absolute bottom-3 left-3 z-10 pointer-events-none"
                >
                    <slot name="watermark">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/95 border border-white/10 shadow-xs">
                            {{ watermark }}
                        </span>
                    </slot>
                </div>

                <!-- Bottom-Right Photo Counter Badge (1/5 Foto) & Fullscreen Toggle -->
                <div
                    v-if="showCounter && normalizedImages.length > 0"
                    class="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 pointer-events-auto"
                >
                    <slot name="counter" :current="currentIndex + 1" :total="normalizedImages.length">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/75 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-xs transition-colors">
                            <span class="material-symbols-outlined text-sm leading-none">photo_camera</span>
                            <span>{{ currentIndex + 1 }}/{{ normalizedImages.length }} Foto</span>
                        </span>
                    </slot>

                    <!-- Expand Button -->
                    <button
                        v-if="enableLightbox"
                        type="button"
                        @click.stop="openLightbox"
                        class="w-7.5 h-7.5 rounded-lg bg-black/60 hover:bg-blue-600 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Perbesar Layar Penuh"
                        aria-label="Perbesar Layar Penuh"
                    >
                        <span class="material-symbols-outlined text-base leading-none">fullscreen</span>
                    </button>
                </div>

                <!-- Prev & Next Overlay Arrow Buttons -->
                <template v-if="showArrows && normalizedImages.length > 1">
                    <button
                        type="button"
                        @click.stop="prev"
                        class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-blue-600 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                        title="Foto Sebelumnya"
                        aria-label="Foto Sebelumnya"
                    >
                        <span class="material-symbols-outlined text-xl sm:text-2xl leading-none">chevron_left</span>
                    </button>

                    <button
                        type="button"
                        @click.stop="next"
                        class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-blue-600 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                        title="Foto Berikutnya"
                        aria-label="Foto Berikutnya"
                    >
                        <span class="material-symbols-outlined text-xl sm:text-2xl leading-none">chevron_right</span>
                    </button>
                </template>
            </div>

            <!-- Bottom Thumbnails (Default Position) -->
            <div
                v-if="showThumbnails && normalizedImages.length > 1 && thumbnailsPosition === 'bottom'"
                class="pt-0.5"
            >
                <ProductGalleryThumbnails
                    :items="normalizedImages"
                    :active-index="currentIndex"
                    :variant="thumbnailsVariant"
                    :color-theme="colorTheme"
                    :radius="radius"
                    position="bottom"
                    @select="selectImage"
                />
            </div>
        </div>

        <!-- Side Thumbnails (Right Position) -->
        <div
            v-if="showThumbnails && normalizedImages.length > 1 && thumbnailsPosition === 'right'"
            class="w-full md:w-24 lg:w-28 xl:w-32 shrink-0"
        >
            <ProductGalleryThumbnails
                :items="normalizedImages"
                :active-index="currentIndex"
                :variant="thumbnailsVariant"
                :color-theme="colorTheme"
                :radius="radius"
                position="right"
                @select="selectImage"
            />
        </div>

        <!-- Fullscreen Zoom Lightbox Modal Sub-Component -->
        <ProductGalleryLightbox
            v-if="enableLightbox"
            v-model="isLightboxOpen"
            :items="normalizedImages"
            :initial-index="currentIndex"
            @change="onLightboxIndexChange"
        />
    </div>
</template>
