<script setup>
import { ref, computed, watch } from 'vue';
import ProductGalleryThumbnails from './Gallery/ProductGalleryThumbnails.vue';
import ProductGalleryLightbox from './Gallery/ProductGalleryLightbox.vue';

const props = defineProps({
    /**
     * Daftar foto produk.
     * Menerima array string URL: ['/img1.jpg', '/img2.jpg']
     * atau array object: [{ src: '', thumb: '', alt: '', label: '', badge: '' }]
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
    aspectRatio: {
        type: String,
        default: 'aspect-video', // 'aspect-video' (16:9), 'aspect-[16/10]', 'aspect-4/3', 'aspect-square'
    },
    imageFit: {
        type: String,
        default: 'contain', // 'contain' (gambar utuh dari atas ke bawah, tidak di-zoom/crop) | 'cover'
    },
    thumbnailsVariant: {
        type: String,
        default: 'compact', // 'compact' (border ring) | 'card' (caption label e.g. EXTERIOR, DASHBOARD)
    },
    thumbnailsPosition: {
        type: String,
        default: 'bottom', // 'bottom' | 'left' | 'right'
    },
    showThumbnails: {
        type: Boolean,
        default: true,
    },
    showCounter: {
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
    badges: {
        type: Array,
        default: () => [],
        // ['Servis Rutin AHASS', '100% Bebas Asap'] atau [{ label, icon, variant }]
    },
    watermark: {
        type: String,
        default: '', // contoh: 'Galeri Foto Resmi LUMINO'
    },
    rounded: {
        type: String,
        default: 'rounded-2xl',
    },
    borderless: {
        type: Boolean,
        default: false,
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
                position="left"
                @select="selectImage"
            />
        </div>

        <!-- Main Gallery Container -->
        <div class="flex-1 min-w-0 w-full space-y-3">
            <!-- Hero Main Image Viewer -->
            <div
                :class="[
                    'relative w-full overflow-hidden bg-slate-900 select-none group flex items-center justify-center',
                    rounded,
                    aspectRatio,
                    borderless
                        ? ''
                        : 'border border-slate-200/90 dark:border-slate-800 shadow-sm'
                ]"
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

                <!-- Top-Left Floating Badges (Gaya Showroom Otomotif Asli) -->
                <div class="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5 max-w-[85%] pointer-events-none">
                    <slot name="badges">
                        <div
                            v-for="(badge, bIdx) in badges"
                            :key="bIdx"
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md"
                            :class="[
                                (typeof badge === 'object' && badge.variant === 'dark') || (typeof badge !== 'object' && bIdx === 0)
                                    ? 'bg-slate-950/85 text-white border border-white/15'
                                    : 'bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                            ]"
                        >
                            <span class="material-symbols-outlined text-[15px] leading-none text-blue-500">
                                {{ typeof badge === 'object' && badge.icon ? badge.icon : 'verified' }}
                            </span>
                            <span>{{ typeof badge === 'object' ? badge.label : badge }}</span>
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
