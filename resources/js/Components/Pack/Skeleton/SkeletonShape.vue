<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    /**
     * Bentuk atomik / semantik skeleton:
     * - 'text' | 'paragraph': Baris teks
     * - 'heading' | 'title': Baris judul tebal/besar
     * - 'caption' | 'subtitle': Baris teks kecil
     * - 'circular' | 'circle' | 'avatar': Lingkaran avatar
     * - 'rectangular' | 'rect': Persegi lancip
     * - 'rounded' | 'block': Persegi sudut halus
     * - 'icon': Kotak ikon proporsional
     * - 'button' | 'btn': Bentuk tombol aksi
     * - 'badge' | 'chip' | 'pill': Kapsul badge kecil
     * - 'input' | 'field': Kotak kolom isian formulir
     * - 'image' | 'media' | 'thumbnail': Kotak gambar/media dengan aspect ratio
     * - 'checkbox': Kotak centang formulir
     * - 'radio': Lingkaran opsi radio
     * - 'switch': Kapsul sakelar geser
     * - 'divider' | 'line': Garis pemisah horizontal
     * - 'card': Wadah kartu mandiri
     */
    shape: {
        type: String,
        default: 'rounded',
    },
    variant: {
        type: String,
        default: '',
    },
    /**
     * Skala ukuran: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
     */
    size: {
        type: String,
        default: '',
    },
    /**
     * Dimensi eksplisit (width & height inline style)
     */
    width: {
        type: String,
        default: '',
    },
    height: {
        type: String,
        default: '',
    },
    /**
     * Kelengkungan sudut: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
     */
    radius: {
        type: String,
        default: '',
    },
    /**
     * Rasio aspek untuk image/media: 'video' (16/9), 'square' (1/1), 'wide' (21/9), 'portrait' (3/4), 'banner' (3/1)
     */
    aspect: {
        type: String,
        default: '',
    },
    /**
     * Efek animasi: 'wave' | 'pulse' | 'none'
     */
    animation: {
        type: String,
        default: '',
    },
    /**
     * Palet warna: 'slate' | 'indigo' | 'primary' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'dark'
     */
    color: {
        type: String,
        default: '',
    },
    /**
     * Untuk bentuk 'text' / 'paragraph': jumlah baris
     */
    lines: {
        type: Number,
        default: 1,
    },
    lineSpacing: {
        type: [String, Number],
        default: '2.5',
    },
    lastLineWidth: {
        type: String,
        default: '70%',
    },
    /**
     * Tampilkan ikon placeholder di tengah (untuk image, icon, media)
     */
    iconPlaceholder: {
        type: [Boolean, String],
        default: false,
    },
});

// Ambil konteks dari parent Skeleton (jika ada)
const parentContext = inject('pack_skeleton_context', null);

// Normalisasi bentuk (shape / variant)
const activeShape = computed(() => {
    const s = (props.variant || props.shape || 'rounded').toLowerCase();
    if (s === 'title') return 'heading';
    if (s === 'paragraph') return 'text';
    if (s === 'subtitle') return 'caption';
    if (s === 'circle' || s === 'avatar') return 'circular';
    if (s === 'rect') return 'rectangular';
    if (s === 'block') return 'rounded';
    if (s === 'btn') return 'button';
    if (s === 'chip' || s === 'pill') return 'badge';
    if (s === 'field') return 'input';
    if (s === 'media' || s === 'thumbnail') return 'image';
    if (s === 'line') return 'divider';
    return s;
});

// Warna aktif
const activeColor = computed(() => props.color || parentContext?.color?.value || 'slate');

// Animasi aktif
const activeAnimation = computed(() => props.animation || parentContext?.animation?.value || 'wave');

// Ukuran aktif
const activeSize = computed(() => props.size || parentContext?.size?.value || 'md');

// Palet warna CSS
const colorTheme = computed(() => {
    switch (activeColor.value) {
        case 'indigo':
            return {
                base: 'bg-indigo-100/90 dark:bg-indigo-950/60',
                subtle: 'bg-indigo-50/80 dark:bg-indigo-950/30',
                border: 'border-indigo-100/80 dark:border-indigo-900/50',
                icon: 'text-indigo-300 dark:text-indigo-800',
            };
        case 'primary':
        case 'blue':
            return {
                base: 'bg-blue-100/90 dark:bg-blue-950/60',
                subtle: 'bg-blue-50/80 dark:bg-blue-950/30',
                border: 'border-blue-100/80 dark:border-blue-900/50',
                icon: 'text-blue-300 dark:text-blue-800',
            };
        case 'emerald':
        case 'success':
            return {
                base: 'bg-emerald-100/90 dark:bg-emerald-950/60',
                subtle: 'bg-emerald-50/80 dark:bg-emerald-950/30',
                border: 'border-emerald-100/80 dark:border-emerald-900/50',
                icon: 'text-emerald-300 dark:text-emerald-800',
            };
        case 'purple':
        case 'violet':
            return {
                base: 'bg-purple-100/90 dark:bg-purple-950/60',
                subtle: 'bg-purple-50/80 dark:bg-purple-950/30',
                border: 'border-purple-100/80 dark:border-purple-900/50',
                icon: 'text-purple-300 dark:text-purple-800',
            };
        case 'amber':
        case 'warning':
            return {
                base: 'bg-amber-100/90 dark:bg-amber-950/60',
                subtle: 'bg-amber-50/80 dark:bg-amber-950/30',
                border: 'border-amber-100/80 dark:border-amber-900/50',
                icon: 'text-amber-300 dark:text-amber-800',
            };
        case 'rose':
        case 'danger':
            return {
                base: 'bg-rose-100/90 dark:bg-rose-950/60',
                subtle: 'bg-rose-50/80 dark:bg-rose-950/30',
                border: 'border-rose-100/80 dark:border-rose-900/50',
                icon: 'text-rose-300 dark:text-rose-800',
            };
        case 'cyan':
        case 'sky':
            return {
                base: 'bg-cyan-100/90 dark:bg-cyan-950/60',
                subtle: 'bg-cyan-50/80 dark:bg-cyan-950/30',
                border: 'border-cyan-100/80 dark:border-cyan-900/50',
                icon: 'text-cyan-300 dark:text-cyan-800',
            };
        case 'dark':
            return {
                base: 'bg-slate-300 dark:bg-slate-700/80',
                subtle: 'bg-slate-200 dark:bg-slate-800/80',
                border: 'border-slate-300 dark:border-slate-700',
                icon: 'text-slate-400 dark:text-slate-600',
            };
        case 'slate':
        default:
            return {
                base: 'bg-slate-200/90 dark:bg-slate-700/60',
                subtle: 'bg-slate-100 dark:bg-slate-800/60',
                border: 'border-slate-200/80 dark:border-slate-800',
                icon: 'text-slate-300 dark:text-slate-600',
            };
    }
});

// Animasi CSS
const animationClass = computed(() => {
    switch (activeAnimation.value) {
        case 'pulse': return 'animate-pulse';
        case 'none': return '';
        case 'wave':
        default: return 'skeleton-shimmer';
    }
});

// Kelengkungan sudut (radius)
const effectiveRadius = computed(() => {
    const r = props.radius || parentContext?.radius?.value;
    if (r) {
        switch (r) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-xs';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'xl': return 'rounded-xl';
            case 'full': return 'rounded-full';
        }
    }
    // Bawaan bentuk
    switch (activeShape.value) {
        case 'circular':
        case 'radio':
        case 'badge':
        case 'switch':
            return 'rounded-full';
        case 'rectangular':
            return 'rounded-none';
        case 'button':
        case 'input':
        case 'image':
            return 'rounded-xl';
        case 'checkbox':
            return 'rounded-md';
        case 'heading':
        case 'caption':
        case 'text':
        case 'icon':
        default:
            return 'rounded-md';
    }
});

// Aspect ratio CSS class
const aspectClass = computed(() => {
    if (!props.aspect) return '';
    switch (props.aspect) {
        case 'video':
        case '16/9':
        case '16:9':
            return 'aspect-video';
        case 'square':
        case '1/1':
        case '1:1':
            return 'aspect-square';
        case 'wide':
        case '21/9':
        case '21:9':
            return 'aspect-21/9';
        case 'portrait':
        case '3/4':
        case '3:4':
            return 'aspect-[3/4]';
        case 'banner':
        case '3/1':
        case '3:1':
            return 'aspect-[3/1]';
        default:
            return '';
    }
});

// Default dimension classes berdasarkan ukuran (size)
const sizeDimensionClasses = computed(() => {
    const sz = activeSize.value;
    switch (activeShape.value) {
        case 'circular':
            switch (sz) {
                case 'xs': return 'w-6 h-6';
                case 'sm': return 'w-8 h-8';
                case 'lg': return 'w-16 h-16';
                case 'xl': return 'w-20 h-20';
                case 'md':
                default: return 'w-12 h-12';
            }
        case 'icon':
            switch (sz) {
                case 'xs': return 'w-5 h-5';
                case 'sm': return 'w-7 h-7';
                case 'lg': return 'w-12 h-12';
                case 'xl': return 'w-14 h-14';
                case 'md':
                default: return 'w-9 h-9';
            }
        case 'button':
            switch (sz) {
                case 'xs': return 'h-7 w-16';
                case 'sm': return 'h-8 w-20';
                case 'lg': return 'h-11 w-32';
                case 'xl': return 'h-12 w-36';
                case 'md':
                default: return 'h-9.5 w-24';
            }
        case 'badge':
            switch (sz) {
                case 'xs': return 'h-4 w-12';
                case 'sm': return 'h-4.5 w-14';
                case 'lg': return 'h-6 w-20';
                case 'xl': return 'h-7 w-24';
                case 'md':
                default: return 'h-5 w-16';
            }
        case 'input':
            switch (sz) {
                case 'xs': return 'h-8 w-full';
                case 'sm': return 'h-9 w-full';
                case 'lg': return 'h-11 w-full';
                case 'xl': return 'h-12 w-full';
                case 'md':
                default: return 'h-10 w-full';
            }
        case 'heading':
            switch (sz) {
                case 'xs': return 'h-4 w-2/3';
                case 'sm': return 'h-5 w-3/4';
                case 'lg': return 'h-7 w-3/4';
                case 'xl': return 'h-8 w-4/5';
                case 'md':
                default: return 'h-6 w-3/4';
            }
        case 'caption':
            switch (sz) {
                case 'xs': return 'h-2 w-1/2';
                case 'sm': return 'h-2.5 w-1/2';
                case 'lg': return 'h-3.5 w-1/2';
                case 'xl': return 'h-4 w-1/2';
                case 'md':
                default: return 'h-3 w-1/2';
            }
        case 'checkbox':
            return 'w-4.5 h-4.5';
        case 'radio':
            return 'w-4.5 h-4.5';
        case 'switch':
            return 'w-9 h-5';
        case 'divider':
            return 'h-px w-full';
        case 'image':
            if (props.aspect) return 'w-full';
            switch (sz) {
                case 'xs': return 'h-24 w-full';
                case 'sm': return 'h-32 w-full';
                case 'lg': return 'h-56 w-full';
                case 'xl': return 'h-64 w-full';
                case 'md':
                default: return 'h-44 w-full';
            }
        case 'rounded':
        case 'rectangular':
            switch (sz) {
                case 'xs': return 'h-16 w-full';
                case 'sm': return 'h-20 w-full';
                case 'lg': return 'h-48 w-full';
                case 'xl': return 'h-64 w-full';
                case 'md':
                default: return 'h-32 w-full';
            }
        case 'text':
        default:
            switch (sz) {
                case 'xs': return 'h-2.5';
                case 'sm': return 'h-3';
                case 'lg': return 'h-5';
                case 'xl': return 'h-6';
                case 'md':
                default: return 'h-3.5';
            }
    }
});

// Generator lebar baris paragraf natural
const getLineWidth = (index, totalLines) => {
    if (props.width) return props.width;
    if (totalLines === 1) return '100%';
    if (index === totalLines) return props.lastLineWidth;
    if (index % 3 === 2) return '92%';
    if (index % 3 === 0) return '96%';
    return '100%';
};

// Ikon bawaan untuk placeholder
const iconSymbol = computed(() => {
    if (typeof props.iconPlaceholder === 'string' && props.iconPlaceholder) {
        return props.iconPlaceholder;
    }
    if (activeShape.value === 'image') return 'image';
    if (activeShape.value === 'icon') return 'category';
    return '';
});
</script>

<template>
    <!-- 1. MULTI-LINE TEXT / PARAGRAPH -->
    <div
        v-if="activeShape === 'text' && lines > 1"
        :class="`space-y-${lineSpacing} w-full`"
    >
        <div
            v-for="l in lines"
            :key="l"
            :class="[
                colorTheme.base,
                animationClass,
                sizeDimensionClasses,
                effectiveRadius,
                'overflow-hidden shadow-2xs'
            ]"
            :style="{
                width: getLineWidth(l, lines),
                height: height || undefined,
            }"
        />
    </div>

    <!-- 2. SHAPE WITH CENTER ICON (Image / Media Placeholder) -->
    <div
        v-else-if="iconPlaceholder || iconSymbol"
        :class="[
            colorTheme.base,
            animationClass,
            sizeDimensionClasses,
            aspectClass,
            effectiveRadius,
            'relative overflow-hidden flex items-center justify-center shrink-0 select-none shadow-2xs'
        ]"
        :style="{
            width: width || undefined,
            height: height || undefined,
        }"
    >
        <span
            v-if="iconSymbol"
            class="material-symbols-outlined text-2xl sm:text-3xl opacity-40"
            :class="colorTheme.icon"
        >
            {{ iconSymbol }}
        </span>
    </div>

    <!-- 3. ATOMIC SHAPE GENERIK (Single Line Text, Button, Avatar, Input, Badge, dll) -->
    <div
        v-else
        :class="[
            colorTheme.base,
            animationClass,
            sizeDimensionClasses,
            aspectClass,
            effectiveRadius,
            activeShape === 'circular' || activeShape === 'icon' || activeShape === 'checkbox' || activeShape === 'radio' ? 'shrink-0' : '',
            'overflow-hidden shadow-2xs'
        ]"
        :style="{
            width: width || undefined,
            height: height || undefined,
        }"
    />
</template>

<style scoped>
.skeleton-shimmer {
    position: relative;
    overflow: hidden;
    will-change: transform;
}
.skeleton-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.6) 50%,
        transparent 100%
    );
    animation: shimmer 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
:where(.dark) .skeleton-shimmer::after {
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 100%
    );
}
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>
