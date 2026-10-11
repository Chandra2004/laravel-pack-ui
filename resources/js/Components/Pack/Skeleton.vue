<script>
// Compound Components Export untuk komposisi kustomisasi bentuk & konten
export { default as SkeletonShape } from './Skeleton/SkeletonShape.vue';
export { default as SkeletonText } from './Skeleton/SkeletonText.vue';
export { default as SkeletonAvatar } from './Skeleton/SkeletonAvatar.vue';
export { default as SkeletonButton } from './Skeleton/SkeletonButton.vue';
export { default as SkeletonImage } from './Skeleton/SkeletonImage.vue';
export { default as SkeletonBadge } from './Skeleton/SkeletonBadge.vue';
export { default as SkeletonInput } from './Skeleton/SkeletonInput.vue';
export { default as SkeletonCard } from './Skeleton/SkeletonCard.vue';
export { default as SkeletonLayout } from './Skeleton/SkeletonLayout.vue';
</script>

<script setup>
import { computed, provide } from 'vue';
import SkeletonShape from './Skeleton/SkeletonShape.vue';
import SkeletonText from './Skeleton/SkeletonText.vue';
import SkeletonAvatar from './Skeleton/SkeletonAvatar.vue';
import SkeletonButton from './Skeleton/SkeletonButton.vue';
import SkeletonImage from './Skeleton/SkeletonImage.vue';
import SkeletonBadge from './Skeleton/SkeletonBadge.vue';
import SkeletonInput from './Skeleton/SkeletonInput.vue';
import SkeletonCard from './Skeleton/SkeletonCard.vue';
import SkeletonLayout from './Skeleton/SkeletonLayout.vue';

const props = defineProps({
    /**
     * Kontrol reaktif status pemuatan (Conditional Wrapper)
     * Jika loading=false dan default slot tersedia, komponen akan merender konten asli secara instan.
     */
    loading: {
        type: Boolean,
        default: true,
    },
    /**
     * BENTUK ATOMIK / SEMANTIK (variant atau shape):
     * - 'text' | 'paragraph': Baris teks paragraf
     * - 'heading' | 'title': Baris judul tebal
     * - 'caption' | 'subtitle': Baris teks kecil
     * - 'circular' | 'circle' | 'avatar': Lingkaran / avatar
     * - 'rectangular' | 'rect': Persegi lancip
     * - 'rounded' | 'block': Persegi bersudut melengkung
     * - 'icon': Kotak ikon proporsional
     * - 'button' | 'btn': Bentuk tombol aksi
     * - 'badge' | 'chip' | 'pill': Badge kapsul
     * - 'input' | 'field': Kolom input formulir
     * - 'image' | 'media' | 'thumbnail': Kotak gambar dengan aspect ratio
     * - 'checkbox' | 'radio' | 'switch': Kontrol formulir
     * - 'divider' | 'line': Garis pemisah horizontal
     * - 'card': Wadah kartu
     * - 'avatar-text': Kombo avatar dan 2 baris teks
     */
    variant: {
        type: String,
        default: 'text',
    },
    shape: {
        type: String,
        default: '',
    },
    /**
     * PRESET HALAMAN SIAP PAKAI:
     * - '': Gunakan varian atomik atau prop layout
     * - 'custom': Gunakan slot #skeleton kustom presisi 1:1
     * - 'card': Kartu produk/media/status (gambar/avatar, badge, judul, teks, footer)
     * - 'product' / 'ecommerce': Kartu belanja e-commerce (foto, badge diskon, judul, bintang rating, harga, tombol beli)
     * - 'comment' / 'chat': Balasan komentar / gelembung chat (avatar, nama, waktu, gelembung pesan, aksi balas)
     * - 'table': Tabel data multi-kolom dan baris dengan header & paginasi
     * - 'stats' / 'dashboard': Kartu metrik KPI (ikon, nilai besar, badge tren, sparkline)
     * - 'profile' / 'user': Baris profil pengguna (avatar, nama, bio, status, tombol aksi)
     * - 'form': Kerangka formulir input (label, input box, tombol submit)
     * - 'article' / 'post': Halaman artikel lengkap (kategori, judul, penulis, banner, paragraf)
     * - 'feed' / 'list': Item alur aktivitas linimasa
     * - 'list-item': Baris item daftar ringkas
     */
    type: {
        type: String,
        default: '',
    },
    /**
     * KUSTOMISASI ISI KONTEN BERBASIS SKEMA / ARRAY (Config-Driven Layout):
     * Memungkinkan developer mendefinisikan struktur konten skeleton apa pun secara deklaratif
     * Contoh:
     * :layout="[
     *    { shape: 'avatar', size: 'lg' },
     *    { shape: 'heading', width: '50%' },
     *    { shape: 'text', lines: 3 },
     *    { shape: 'button', width: '120px' }
     * ]"
     */
    layout: {
        type: Array,
        default: () => null,
    },
    /**
     * Shorthand bentuk kustomisasi isi:
     * Contoh: :shapes="['avatar', 'heading', 'text', 'button']"
     */
    shapes: {
        type: Array,
        default: () => null,
    },
    /**
     * WARNA: Palet aksen warna semantik
     */
    color: {
        type: String,
        default: 'slate',
        validator: (val) => [
            'slate', 'neutral', 'dark',
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
        ].includes(val),
    },
    colorTheme: {
        type: String,
        default: '',
    },
    /**
     * Efek animasi pemuatan:
     * - 'wave': Kilau shimmer menyapu halus (silky smooth)
     * - 'pulse': Redup-terang lembut
     * - 'none': Statis tanpa animasi
     */
    animation: {
        type: String,
        default: 'wave',
        validator: (val) => ['wave', 'pulse', 'none'].includes(val),
    },
    /**
     * Kelengkungan sudut (radius)
     */
    radius: {
        type: String,
        default: '',
        validator: (val) => ['', 'none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * Skala ukuran
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['', 'xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    /**
     * Dimensi kustom (width & height inline style)
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
     * Rasio aspek untuk bentuk image/media ('video', 'square', 'wide', 'portrait', 'banner')
     */
    aspect: {
        type: String,
        default: '',
    },
    /**
     * Placeholder ikon di tengah media
     */
    iconPlaceholder: {
        type: [Boolean, String],
        default: false,
    },
    /**
     * TEKS KONTEN: Jumlah baris pada varian text
     */
    lines: {
        type: Number,
        default: 1,
    },
    lineSpacing: {
        type: [String, Number],
        default: '3',
    },
    lastLineWidth: {
        type: String,
        default: '70%',
    },
    /**
     * Jumlah baris & kolom untuk preset tabel atau formulir
     */
    rows: {
        type: Number,
        default: 4,
    },
    cols: {
        type: Number,
        default: 4,
    },
    /**
     * Jumlah perulangan kartu / item pada preset card, stats, profile, feed
     */
    count: {
        type: Number,
        default: 1,
    },
    /**
     * KUSTOMISASI PRESET CARD
     */
    cardMedia: {
        type: Boolean,
        default: true,
    },
    cardMediaAspect: {
        type: String,
        default: 'video', // 'video', 'square', 'wide'
    },
    cardAvatar: {
        type: Boolean,
        default: false,
    },
    cardBadge: {
        type: Boolean,
        default: true,
    },
    cardRating: {
        type: Boolean,
        default: false,
    },
    cardPrice: {
        type: Boolean,
        default: false,
    },
    cardLines: {
        type: Number,
        default: 2,
    },
    cardFooter: {
        type: Boolean,
        default: true,
    },
    cardAction: {
        type: Boolean,
        default: true,
    },
    /**
     * KUSTOMISASI PRESET PRODUCT / E-COMMERCE
     */
    productRating: {
        type: Boolean,
        default: true,
    },
    productBadge: {
        type: Boolean,
        default: true,
    },
    productAction: {
        type: Boolean,
        default: true,
    },
    /**
     * KUSTOMISASI PRESET COMMENT / CHAT
     */
    commentAvatar: {
        type: Boolean,
        default: true,
    },
    commentAction: {
        type: Boolean,
        default: true,
    },
    /**
     * KUSTOMISASI PRESET TABLE
     */
    tableHeader: {
        type: Boolean,
        default: true,
    },
    tableFooter: {
        type: Boolean,
        default: true,
    },
    tableCheckbox: {
        type: Boolean,
        default: false,
    },
    tableAvatar: {
        type: Boolean,
        default: false,
    },
    colWidths: {
        type: Array,
        default: () => [],
    },
    /**
     * KUSTOMISASI PRESET STATS
     */
    statsIcon: {
        type: Boolean,
        default: true,
    },
    statsTrend: {
        type: Boolean,
        default: true,
    },
    statsSparkline: {
        type: Boolean,
        default: false,
    },
    /**
     * KUSTOMISASI PRESET PROFILE
     */
    profileAction: {
        type: Boolean,
        default: true,
    },
    profileBio: {
        type: Boolean,
        default: true,
    },
    profileBadge: {
        type: Boolean,
        default: false,
    },
    profileAvatarShape: {
        type: String,
        default: 'circle', // 'circle' | 'rounded'
    },
    /**
     * KUSTOMISASI PRESET FORM
     */
    formAction: {
        type: Boolean,
        default: true,
    },
    /**
     * KUSTOMISASI PRESET ARTICLE
     */
    articleBanner: {
        type: Boolean,
        default: true,
    },
    articleAuthor: {
        type: Boolean,
        default: true,
    },
    articleTags: {
        type: Boolean,
        default: true,
    },
});

// Normalisasi bentuk aktif (variant atau shape)
const activeShape = computed(() => {
    const s = (props.shape || props.variant || 'text').toLowerCase();
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

// Normalisasi preset type
const normalizedType = computed(() => {
    if (props.type === 'dashboard') return 'stats';
    if (props.type === 'user') return 'profile';
    if (props.type === 'post') return 'article';
    if (props.type === 'list') return 'feed';
    if (props.type === 'ecommerce') return 'product';
    if (props.type === 'chat') return 'comment';
    return props.type;
});

// Skema layout aktif (jika ada prop layout atau shapes)
const activeLayoutItems = computed(() => {
    if (props.layout && Array.isArray(props.layout) && props.layout.length > 0) {
        return props.layout;
    }
    if (props.shapes && Array.isArray(props.shapes) && props.shapes.length > 0) {
        return props.shapes.map(s => (typeof s === 'string' ? { shape: s } : s));
    }
    return null;
});

// Normalisasi warna aktif (color atau alias colorTheme)
const activeColor = computed(() => {
    const c = props.colorTheme || props.color || 'slate';
    if (c === 'neutral') return 'slate';
    return c;
});

// 1. PALET WARNA SEMANTIK (Light & Dark Mode)
const colorTheme = computed(() => {
    switch (activeColor.value) {
        case 'indigo':
            return {
                base: 'bg-indigo-100/90 dark:bg-indigo-950/60',
                subtle: 'bg-indigo-50/80 dark:bg-indigo-950/30',
                border: 'border-indigo-100/80 dark:border-indigo-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-indigo-900/40',
                icon: 'text-indigo-400 dark:text-indigo-600',
            };
        case 'primary':
        case 'blue':
            return {
                base: 'bg-blue-100/90 dark:bg-blue-950/60',
                subtle: 'bg-blue-50/80 dark:bg-blue-950/30',
                border: 'border-blue-100/80 dark:border-blue-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-blue-100 dark:border-blue-900/40',
                icon: 'text-blue-400 dark:text-blue-600',
            };
        case 'emerald':
        case 'success':
            return {
                base: 'bg-emerald-100/90 dark:bg-emerald-950/60',
                subtle: 'bg-emerald-50/80 dark:bg-emerald-950/30',
                border: 'border-emerald-100/80 dark:border-emerald-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-emerald-100 dark:border-emerald-900/40',
                icon: 'text-emerald-400 dark:text-emerald-600',
            };
        case 'purple':
        case 'violet':
            return {
                base: 'bg-purple-100/90 dark:bg-purple-950/60',
                subtle: 'bg-purple-50/80 dark:bg-purple-950/30',
                border: 'border-purple-100/80 dark:border-purple-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-purple-100 dark:border-purple-900/40',
                icon: 'text-purple-400 dark:text-purple-600',
            };
        case 'amber':
        case 'warning':
            return {
                base: 'bg-amber-100/90 dark:bg-amber-950/60',
                subtle: 'bg-amber-50/80 dark:bg-amber-950/30',
                border: 'border-amber-100/80 dark:border-amber-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-amber-100 dark:border-amber-900/40',
                icon: 'text-amber-400 dark:text-amber-600',
            };
        case 'rose':
        case 'danger':
            return {
                base: 'bg-rose-100/90 dark:bg-rose-950/60',
                subtle: 'bg-rose-50/80 dark:bg-rose-950/30',
                border: 'border-rose-100/80 dark:border-rose-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-rose-100 dark:border-rose-900/40',
                icon: 'text-rose-400 dark:text-rose-600',
            };
        case 'cyan':
        case 'sky':
            return {
                base: 'bg-cyan-100/90 dark:bg-cyan-950/60',
                subtle: 'bg-cyan-50/80 dark:bg-cyan-950/30',
                border: 'border-cyan-100/80 dark:border-cyan-900/50',
                container: 'bg-white/80 dark:bg-slate-900/80 border-cyan-100 dark:border-cyan-900/40',
                icon: 'text-cyan-400 dark:text-cyan-600',
            };
        case 'dark':
            return {
                base: 'bg-slate-300 dark:bg-slate-700/80',
                subtle: 'bg-slate-200 dark:bg-slate-800/80',
                border: 'border-slate-300 dark:border-slate-700',
                container: 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700',
                icon: 'text-slate-500 dark:text-slate-400',
            };
        case 'slate':
        default:
            return {
                base: 'bg-slate-200/90 dark:bg-slate-700/60',
                subtle: 'bg-slate-100 dark:bg-slate-800/60',
                border: 'border-slate-200/80 dark:border-slate-800',
                container: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800',
                icon: 'text-slate-400 dark:text-slate-500',
            };
    }
});

// 2. KELAS EFEK ANIMASI
const animationClass = computed(() => {
    switch (props.animation) {
        case 'pulse':
            return 'animate-pulse';
        case 'none':
            return '';
        case 'wave':
        default:
            return 'skeleton-shimmer';
    }
});

// 3. KELENGKUNGAN SUDUT (Radius)
const effectiveRadius = computed(() => {
    if (props.radius) {
        switch (props.radius) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'xl': return 'rounded-xl';
            case 'full': return 'rounded-full';
            default: return 'rounded-md';
        }
    }
    // Fallback bawaan varian bentuk
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
        case 'icon':
            return 'rounded-lg';
        case 'rounded':
            return 'rounded-xl';
        case 'heading':
        case 'caption':
        case 'text':
        default:
            return 'rounded-md';
    }
});

const containerRadius = computed(() => {
    if (props.radius) {
        switch (props.radius) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-md';
            case 'md': return 'rounded-xl';
            case 'lg': return 'rounded-2xl';
            case 'xl': return 'rounded-2xl';
            case 'full': return 'rounded-3xl';
        }
    }
    return 'rounded-2xl';
});

// 4. SKALA UKURAN PROPORSIONAL
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                circular: 'w-6 h-6',
                icon: 'w-5 h-5',
                text: 'h-2.5',
                heading: 'h-4',
                rect: 'h-16',
                button: 'h-7 w-16',
                badge: 'h-4 w-12',
                input: 'h-8',
                cardImg: 'h-28',
                cardPadding: 'p-3',
                statsPadding: 'p-3',
            };
        case 'sm':
            return {
                circular: 'w-8 h-8',
                icon: 'w-7 h-7',
                text: 'h-3',
                heading: 'h-5',
                rect: 'h-20',
                button: 'h-8 w-20',
                badge: 'h-4.5 w-14',
                input: 'h-9',
                cardImg: 'h-36',
                cardPadding: 'p-3.5',
                statsPadding: 'p-3.5',
            };
        case 'lg':
            return {
                circular: 'w-16 h-16',
                icon: 'w-12 h-12',
                text: 'h-5',
                heading: 'h-7',
                rect: 'h-48',
                button: 'h-11 w-32',
                badge: 'h-6 w-20',
                input: 'h-11',
                cardImg: 'h-56',
                cardPadding: 'p-6',
                statsPadding: 'p-6',
            };
        case 'xl':
            return {
                circular: 'w-20 h-20',
                icon: 'w-14 h-14',
                text: 'h-6',
                heading: 'h-8',
                rect: 'h-64',
                button: 'h-12 w-36',
                badge: 'h-7 w-24',
                input: 'h-12',
                cardImg: 'h-64',
                cardPadding: 'p-7',
                statsPadding: 'p-7',
            };
        case 'md':
        default:
            return {
                circular: 'w-12 h-12',
                icon: 'w-9 h-9',
                text: 'h-3.5',
                heading: 'h-6',
                rect: 'h-32',
                button: 'h-9.5 w-24',
                badge: 'h-5 w-16',
                input: 'h-10',
                cardImg: 'h-44',
                cardPadding: 'p-4 sm:p-5',
                statsPadding: 'p-5',
            };
    }
});

const spacingClass = computed(() => `space-y-${props.lineSpacing}`);
const widthStyle = computed(() => props.width || null);
const heightStyle = computed(() => props.height || null);

// Generator lebar baris paragraf natural
const getLineWidth = (index, totalLines) => {
    if (props.width) return props.width;
    if (totalLines === 1) return '100%';
    if (index === totalLines) return props.lastLineWidth;
    if (index % 3 === 2) return '92%';
    if (index % 3 === 0) return '96%';
    return '100%';
};

// Generator lebar kolom tabel kustom
const getColWidth = (c, isRow = false) => {
    if (props.colWidths && props.colWidths[c - 1]) {
        return props.colWidths[c - 1];
    }
    if (isRow) {
        return c === 1 ? '30%' : (c === props.cols ? '15%' : 'auto');
    }
    return 'auto';
};

// Provide context agar compound child components dapat mewarisi tema & animasi
provide('pack_skeleton_context', {
    colorTheme,
    animationClass,
    color: computed(() => activeColor.value),
    animation: computed(() => props.animation),
    radius: computed(() => props.radius),
    size: computed(() => props.size),
});
</script>

<template>
    <!-- ===================================================================================== -->
    <!-- CONDITIONAL WRAPPER: Jika loading=false, tampilkan konten asli langsung tanpa overhead -->
    <!-- ===================================================================================== -->
    <slot v-if="!loading" />

    <!-- ===================================================================================== -->
    <!-- SKELETON PLACEHOLDER STATE                                                            -->
    <!-- ===================================================================================== -->
    <div
        v-else
        role="status"
        aria-busy="true"
        aria-label="Memuat konten..."
        class="w-full select-none"
    >
        <!-- 0. KUSTOMISASI ISI KONTEN VIA SKEMA LAYOUT (Config-Driven Layout :layout="[...]") -->
        <SkeletonLayout
            v-if="activeLayoutItems"
            :items="activeLayoutItems"
            :color="color"
            :animation="animation"
            :radius="radius"
            :size="size"
        />

        <!-- 1. SLOT KUSTOM EKSPLISIT: Hanya jika type='custom' ATAU slot diberikan tanpa type preset -->
        <slot
            v-else-if="normalizedType === 'custom' || (!normalizedType && ($slots.skeleton || $slots.placeholder))"
            name="skeleton"
            :color-theme="colorTheme"
            :animation-class="animationClass"
            :effective-radius="effectiveRadius"
            :size-classes="sizeClasses"
            :container-radius="containerRadius"
            :get-line-width="getLineWidth"
            :get-col-width="getColWidth"
            :shape="SkeletonShape"
            :text="SkeletonText"
            :avatar="SkeletonAvatar"
            :button="SkeletonButton"
            :image="SkeletonImage"
            :badge="SkeletonBadge"
            :input="SkeletonInput"
            :card="SkeletonCard"
            :layout="SkeletonLayout"
        >
            <slot
                name="placeholder"
                :color-theme="colorTheme"
                :animation-class="animationClass"
                :effective-radius="effectiveRadius"
                :size-classes="sizeClasses"
                :container-radius="containerRadius"
                :get-line-width="getLineWidth"
                :get-col-width="getColWidth"
                :shape="SkeletonShape"
                :text="SkeletonText"
                :avatar="SkeletonAvatar"
                :button="SkeletonButton"
                :image="SkeletonImage"
                :badge="SkeletonBadge"
                :input="SkeletonInput"
                :card="SkeletonCard"
                :layout="SkeletonLayout"
            />
        </slot>

        <!-- ===================================================================================== -->
        <!-- 2. PRESET HALAMAN DINAMIS TERKUSTOMISASI                                              -->
        <!-- ===================================================================================== -->

        <!-- PRESET A: CARD (Media / Avatar / Status / Generic) -->
        <div
            v-else-if="normalizedType === 'card'"
            :class="[
                count > 1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5' : 'w-full'
            ]"
        >
            <div
                v-for="item in count"
                :key="item"
                :class="[
                    'border shadow-2xs overflow-hidden flex flex-col justify-between space-y-3.5',
                    colorTheme.container,
                    containerRadius,
                    sizeClasses.cardPadding,
                ]"
            >
                <div>
                    <!-- Slot Media Banner -->
                    <slot name="card-media" :animation-class="animationClass" :color-theme="colorTheme">
                        <div
                            v-if="cardMedia"
                            :class="[
                                'w-full overflow-hidden mb-3.5 relative flex items-center justify-center',
                                cardMediaAspect === 'square' ? 'aspect-square' : cardMediaAspect === 'wide' ? 'aspect-21/9' : sizeClasses.cardImg,
                                effectiveRadius,
                                colorTheme.base,
                                animationClass,
                            ]"
                        >
                            <span v-if="iconPlaceholder" class="material-symbols-outlined text-3xl opacity-35" :class="colorTheme.icon">
                                {{ typeof iconPlaceholder === 'string' ? iconPlaceholder : 'image' }}
                            </span>
                        </div>
                    </slot>

                    <!-- Slot Header / Avatar / Badge -->
                    <slot name="card-header" :animation-class="animationClass" :color-theme="colorTheme">
                        <!-- Mode Avatar Header -->
                        <div v-if="cardAvatar" class="flex items-center justify-between gap-3 mb-3">
                            <div class="flex items-center gap-3">
                                <div :class="['w-10 h-10 rounded-full shrink-0', colorTheme.base, animationClass]" />
                                <div class="space-y-1.5">
                                    <div :class="['h-3.5 w-28 rounded-md', colorTheme.base, animationClass]" />
                                    <div :class="['h-2.5 w-18 rounded', colorTheme.subtle, animationClass]" />
                                </div>
                            </div>
                            <div v-if="cardBadge" :class="['h-5 w-16 rounded-full', colorTheme.base, animationClass]" />
                        </div>

                        <!-- Mode Meta Tags / Badge Bar -->
                        <div v-else-if="cardBadge || cardRating" class="flex items-center justify-between gap-2 mb-2.5">
                            <div v-if="cardBadge" :class="['h-4.5 w-16 rounded-full', colorTheme.base, animationClass]" />
                            <div v-if="cardRating" :class="['h-3 w-14 rounded-full', colorTheme.subtle, animationClass]" />
                        </div>
                    </slot>

                    <!-- Slot Title & Description Lines -->
                    <slot name="card-body" :animation-class="animationClass" :color-theme="colorTheme">
                        <!-- Title Line -->
                        <div :class="['h-4.5 w-4/5 rounded-md mb-2', colorTheme.base, animationClass]" />

                        <!-- Description Lines -->
                        <div class="space-y-1.5 mb-3">
                            <div
                                v-for="l in cardLines"
                                :key="l"
                                :class="[
                                    'h-3 rounded',
                                    l === cardLines ? 'w-2/3' : 'w-full',
                                    colorTheme.subtle,
                                    animationClass
                                ]"
                            />
                        </div>

                        <!-- Price Tag Line opsional -->
                        <div v-if="cardPrice" class="flex items-center justify-between pt-1">
                            <div :class="['h-5 w-24 rounded-md', colorTheme.base, animationClass]" />
                        </div>
                    </slot>
                </div>

                <!-- Slot Footer -->
                <slot v-if="cardFooter" name="card-footer" :animation-class="animationClass" :color-theme="colorTheme">
                    <div :class="['pt-3 border-t flex items-center justify-between gap-2', colorTheme.border]">
                        <div class="flex items-center gap-2">
                            <div :class="['w-7 h-7 rounded-full shrink-0', colorTheme.base, animationClass]" />
                            <div :class="['h-3 w-20 rounded', colorTheme.subtle, animationClass]" />
                        </div>
                        <div v-if="cardAction" :class="['h-7.5 w-20 rounded-xl', colorTheme.base, animationClass]" />
                    </div>
                </slot>
            </div>
        </div>

        <!-- PRESET B: PRODUCT / ECOMMERCE -->
        <div
            v-else-if="normalizedType === 'product'"
            :class="[
                count > 1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'w-full max-w-sm'
            ]"
        >
            <div
                v-for="item in count"
                :key="item"
                :class="[
                    'border shadow-2xs overflow-hidden flex flex-col justify-between p-4',
                    colorTheme.container,
                    containerRadius,
                ]"
            >
                <div>
                    <!-- Product Image -->
                    <slot name="product-media" :animation-class="animationClass" :color-theme="colorTheme">
                        <div
                            :class="[
                                'w-full aspect-square overflow-hidden mb-3 relative flex items-center justify-center',
                                effectiveRadius,
                                colorTheme.base,
                                animationClass,
                            ]"
                        >
                            <span class="material-symbols-outlined text-3xl opacity-35" :class="colorTheme.icon">
                                shopping_bag
                            </span>
                        </div>
                    </slot>

                    <!-- Category Badge & Rating -->
                    <slot name="product-header" :animation-class="animationClass" :color-theme="colorTheme">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <div v-if="productBadge" :class="['h-4 w-16 rounded-full', colorTheme.subtle, animationClass]" />
                            <div v-if="productRating" :class="['h-3.5 w-12 rounded', colorTheme.subtle, animationClass]" />
                        </div>
                    </slot>

                    <!-- Product Title -->
                    <slot name="product-body" :animation-class="animationClass" :color-theme="colorTheme">
                        <div :class="['h-4 w-full rounded mb-1.5', colorTheme.base, animationClass]" />
                        <div :class="['h-4 w-3/4 rounded mb-3', colorTheme.base, animationClass]" />
                    </slot>
                </div>

                <!-- Price & Buy Button Footer -->
                <slot name="product-footer" :animation-class="animationClass" :color-theme="colorTheme">
                    <div class="pt-2 border-t flex items-center justify-between gap-2" :class="colorTheme.border">
                        <div :class="['h-5 w-20 rounded-md', colorTheme.base, animationClass]" />
                        <div v-if="productAction" :class="['h-8 w-22 rounded-xl', colorTheme.base, animationClass]" />
                    </div>
                </slot>
            </div>
        </div>

        <!-- PRESET C: COMMENT / CHAT -->
        <div
            v-else-if="normalizedType === 'comment'"
            class="space-y-3.5 w-full"
        >
            <div
                v-for="item in count"
                :key="item"
                class="flex items-start gap-3 w-full"
            >
                <!-- Avatar -->
                <slot name="comment-avatar" :animation-class="animationClass" :color-theme="colorTheme">
                    <div v-if="commentAvatar" :class="['w-9 h-9 rounded-full shrink-0', colorTheme.base, animationClass]" />
                </slot>

                <!-- Comment Bubble -->
                <div class="flex-1 min-w-0 space-y-1.5">
                    <slot name="comment-header" :animation-class="animationClass" :color-theme="colorTheme">
                        <div class="flex items-center gap-2">
                            <div :class="['h-3.5 w-28 rounded', colorTheme.base, animationClass]" />
                            <div :class="['h-2.5 w-14 rounded', colorTheme.subtle, animationClass]" />
                        </div>
                    </slot>

                    <slot name="comment-body" :animation-class="animationClass" :color-theme="colorTheme">
                        <div
                            :class="[
                                'p-3.5 rounded-2xl border space-y-2',
                                colorTheme.container,
                            ]"
                        >
                            <div :class="['h-3 w-full rounded', colorTheme.subtle, animationClass]" />
                            <div :class="['h-3 w-4/5 rounded', colorTheme.subtle, animationClass]" />
                        </div>
                    </slot>

                    <!-- Reply/Like Actions -->
                    <div v-if="commentAction" class="flex items-center gap-3 pt-0.5 px-1">
                        <div :class="['h-2.5 w-10 rounded', colorTheme.subtle, animationClass]" />
                        <div :class="['h-2.5 w-12 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                </div>
            </div>
        </div>

        <!-- PRESET D: TABLE -->
        <div
            v-else-if="normalizedType === 'table'"
            :class="[
                'border shadow-2xs overflow-hidden w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <div class="w-full overflow-x-auto scrollbar-none">
                <div class="min-w-125 sm:min-w-0">
                    <!-- Table Header -->
                    <slot v-if="tableHeader" name="table-header" :cols="cols" :animation-class="animationClass" :color-theme="colorTheme">
                        <div :class="['px-4 py-3 border-b flex items-center gap-4 bg-slate-50/60 dark:bg-slate-800/40', colorTheme.border]">
                            <div v-if="tableCheckbox" :class="['w-4 h-4 rounded shrink-0', colorTheme.base, animationClass]" />
                            <div
                                v-for="c in cols"
                                :key="c"
                                :class="[
                                    'h-3.5 rounded-md flex-1',
                                    c === 1 ? 'max-w-28' : '',
                                    colorTheme.base,
                                    animationClass,
                                ]"
                                :style="{ width: getColWidth(c) }"
                            />
                        </div>
                    </slot>

                    <!-- Table Rows -->
                    <slot name="table-row" :rows="rows" :cols="cols" :animation-class="animationClass" :color-theme="colorTheme">
                        <div class="divide-y" :class="colorTheme.border">
                            <div
                                v-for="r in rows"
                                :key="r"
                                class="px-4 py-3.5 flex items-center gap-4"
                            >
                                <div v-if="tableCheckbox" :class="['w-4 h-4 rounded shrink-0', colorTheme.subtle, animationClass]" />
                                <div v-if="tableAvatar" :class="['w-8 h-8 rounded-full shrink-0', colorTheme.base, animationClass]" />
                                <div
                                    v-for="c in cols"
                                    :key="c"
                                    :class="[
                                        'h-3 rounded flex-1',
                                        c === 1 ? 'max-w-32 font-bold' : (c === cols ? 'max-w-20' : ''),
                                        c % 2 === 0 ? colorTheme.subtle : colorTheme.base,
                                        animationClass,
                                    ]"
                                    :style="{ width: getColWidth(c, true) }"
                                />
                            </div>
                        </div>
                    </slot>

                    <!-- Table Footer / Pagination -->
                    <slot v-if="tableFooter" name="table-footer" :animation-class="animationClass" :color-theme="colorTheme">
                        <div :class="['px-4 py-3 border-t flex items-center justify-between gap-2 bg-slate-50/40 dark:bg-slate-800/20', colorTheme.border]">
                            <div :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                            <div class="flex items-center gap-1.5">
                                <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                                <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                                <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                            </div>
                        </div>
                    </slot>
                </div>
            </div>
        </div>

        <!-- PRESET E: STATS / DASHBOARD -->
        <div
            v-else-if="normalizedType === 'stats'"
            :class="[
                count > 1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'w-full'
            ]"
        >
            <div
                v-for="item in count"
                :key="item"
                :class="[
                    'border shadow-2xs',
                    colorTheme.container,
                    containerRadius,
                    sizeClasses.statsPadding,
                ]"
            >
                <slot name="stats-body" :item="item" :animation-class="animationClass" :color-theme="colorTheme">
                    <div v-if="statsIcon || statsTrend" class="flex items-center justify-between gap-3 mb-3">
                        <div v-if="statsIcon" :class="['w-10 h-10 rounded-xl shrink-0', colorTheme.base, animationClass]" />
                        <div v-if="statsTrend" :class="['h-4 w-14 rounded-full', colorTheme.subtle, animationClass]" />
                    </div>
                    <div :class="['h-7 w-2/3 rounded-lg mb-2', colorTheme.base, animationClass]" />
                    <div :class="['h-3 w-4/5 rounded', colorTheme.subtle, animationClass]" />

                    <!-- Sparkline bar chart mockup -->
                    <div v-if="statsSparkline" class="pt-3 mt-3 border-t flex items-end gap-1.5 h-12" :class="colorTheme.border">
                        <div
                            v-for="bar in 8"
                            :key="bar"
                            :class="['flex-1 rounded-xs', colorTheme.base, animationClass]"
                            :style="{ height: `${20 + (bar * 9) % 80}%` }"
                        />
                    </div>
                </slot>
            </div>
        </div>

        <!-- PRESET F: PROFILE / USER ROW -->
        <div
            v-else-if="normalizedType === 'profile'"
            :class="[
                'border shadow-2xs divide-y w-full',
                colorTheme.container,
                containerRadius,
                colorTheme.border,
            ]"
        >
            <div
                v-for="item in count"
                :key="item"
                class="p-4 flex items-center justify-between gap-3.5"
            >
                <slot name="profile-body" :item="item" :animation-class="animationClass" :color-theme="colorTheme">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            :class="[
                                'w-11 h-11 shrink-0',
                                profileAvatarShape === 'rounded' ? 'rounded-xl' : 'rounded-full',
                                colorTheme.base,
                                animationClass
                            ]"
                        />
                        <div class="space-y-1.5 min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                                <div :class="['h-4 w-36 rounded', colorTheme.base, animationClass]" />
                                <div v-if="profileBadge" :class="['h-3.5 w-12 rounded-full', colorTheme.subtle, animationClass]" />
                            </div>
                            <div v-if="profileBio" :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                        </div>
                    </div>
                    <div v-if="profileAction" :class="['h-8 w-20 rounded-xl shrink-0', colorTheme.base, animationClass]" />
                </slot>
            </div>
        </div>

        <!-- PRESET G: FORM -->
        <div
            v-else-if="normalizedType === 'form'"
            :class="[
                'border shadow-2xs p-5 space-y-4 w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <slot name="form-body" :rows="rows" :animation-class="animationClass" :color-theme="colorTheme">
                <div v-for="r in rows" :key="r" class="space-y-1.5">
                    <div :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                    <div :class="['h-10 w-full rounded-xl', colorTheme.base, animationClass]" />
                </div>
                <div v-if="formAction" class="pt-2 flex items-center justify-end gap-2">
                    <div :class="['h-9 w-20 rounded-xl', colorTheme.subtle, animationClass]" />
                    <div :class="['h-9 w-28 rounded-xl', colorTheme.base, animationClass]" />
                </div>
            </slot>
        </div>

        <!-- PRESET H: ARTICLE / POST -->
        <div
            v-else-if="normalizedType === 'article'"
            :class="[
                'border shadow-2xs p-6 space-y-5 w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <slot name="article-body" :animation-class="animationClass" :color-theme="colorTheme">
                <!-- Badge & Title -->
                <div>
                    <div v-if="articleTags" :class="['h-4 w-24 rounded-full mb-3', colorTheme.subtle, animationClass]" />
                    <div :class="['h-7 w-3/4 rounded-lg mb-2', colorTheme.base, animationClass]" />
                    <div :class="['h-7 w-1/2 rounded-lg', colorTheme.base, animationClass]" />
                </div>

                <!-- Author info -->
                <div v-if="articleAuthor" class="flex items-center gap-3 py-2">
                    <div :class="['w-9 h-9 rounded-full shrink-0', colorTheme.base, animationClass]" />
                    <div class="space-y-1">
                        <div :class="['h-3.5 w-32 rounded', colorTheme.base, animationClass]" />
                        <div :class="['h-2.5 w-20 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                </div>

                <!-- Hero Image Banner -->
                <div v-if="articleBanner" :class="['w-full h-56 rounded-2xl', colorTheme.base, animationClass]" />

                <!-- Paragraph 1 -->
                <div class="space-y-2 pt-2">
                    <div :class="['h-3.5 w-full rounded', colorTheme.subtle, animationClass]" />
                    <div :class="['h-3.5 w-full rounded', colorTheme.subtle, animationClass]" />
                    <div :class="['h-3.5 w-4/5 rounded', colorTheme.subtle, animationClass]" />
                </div>

                <!-- Paragraph 2 -->
                <div class="space-y-2">
                    <div :class="['h-3.5 w-full rounded', colorTheme.subtle, animationClass]" />
                    <div :class="['h-3.5 w-11/12 rounded', colorTheme.subtle, animationClass]" />
                    <div :class="['h-3.5 w-3/5 rounded', colorTheme.subtle, animationClass]" />
                </div>
            </slot>
        </div>

        <!-- PRESET I: FEED / TIMELINE -->
        <div
            v-else-if="normalizedType === 'feed'"
            class="space-y-4 w-full"
        >
            <div
                v-for="item in (count || rows)"
                :key="item"
                class="flex gap-3.5"
            >
                <div class="flex flex-col items-center">
                    <div :class="['w-8 h-8 rounded-full shrink-0', colorTheme.base, animationClass]" />
                    <div v-if="item < (count || rows)" :class="['w-0.5 flex-1 min-h-8 my-1 rounded-full', colorTheme.subtle]" />
                </div>
                <div class="flex-1 pb-4 space-y-2">
                    <div class="flex items-center justify-between">
                        <div :class="['h-3.5 w-44 rounded', colorTheme.base, animationClass]" />
                        <div :class="['h-2.5 w-16 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                    <div :class="['h-3 w-full rounded', colorTheme.subtle, animationClass]" />
                </div>
            </div>
        </div>

        <!-- PRESET J: LIST-ITEM -->
        <div
            v-else-if="normalizedType === 'list-item'"
            class="space-y-2 w-full"
        >
            <div
                v-for="item in count"
                :key="item"
                :class="[
                    'border p-3.5 flex items-center justify-between gap-3 shadow-2xs',
                    colorTheme.container,
                    containerRadius,
                ]"
            >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div :class="['w-8 h-8 rounded-lg shrink-0', colorTheme.base, animationClass]" />
                    <div class="space-y-1.5 flex-1 min-w-0">
                        <div :class="['h-3.5 w-36 rounded', colorTheme.base, animationClass]" />
                        <div :class="['h-2.5 w-24 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                </div>
                <div :class="['h-6 w-14 rounded-full shrink-0', colorTheme.subtle, animationClass]" />
            </div>
        </div>

        <!-- ===================================================================================== -->
        <!-- 3. VARIAN ATOMIK & SEMANTIK LENGKAP (Variant / Shape)                                  -->
        <!-- ===================================================================================== -->

        <!-- A. VARIANT: AVATAR-TEXT (Combo avatar bulat + 2 baris teks) -->
        <div
            v-else-if="activeShape === 'avatar-text'"
            class="flex items-center gap-3 w-full"
        >
            <div
                :class="[
                    colorTheme.base,
                    animationClass,
                    sizeClasses.circular,
                    'rounded-full shrink-0 overflow-hidden shadow-2xs'
                ]"
            />
            <div class="flex-1 space-y-2">
                <div :class="[colorTheme.base, animationClass, 'h-3.5 w-2/3 rounded-md']" />
                <div :class="[colorTheme.subtle, animationClass, 'h-2.5 w-1/3 rounded']" />
            </div>
        </div>

        <!-- B. VARIANT: BUTTON -->
        <div
            v-else-if="activeShape === 'button'"
            :class="widthStyle === 'full' || widthStyle === '100%' ? 'w-full' : 'inline-flex shrink-0'"
        >
            <div
                :class="[
                    colorTheme.base,
                    animationClass,
                    sizeClasses.button,
                    effectiveRadius,
                    'overflow-hidden shadow-2xs'
                ]"
                :style="{ width: widthStyle, height: heightStyle }"
            />
        </div>

        <!-- C. VARIANT: BADGE -->
        <div
            v-else-if="activeShape === 'badge'"
            class="inline-flex shrink-0"
        >
            <div
                :class="[
                    colorTheme.base,
                    animationClass,
                    sizeClasses.badge,
                    effectiveRadius,
                    'overflow-hidden shadow-2xs'
                ]"
                :style="{ width: widthStyle, height: heightStyle }"
            />
        </div>

        <!-- D. VARIANT: INPUT -->
        <div
            v-else-if="activeShape === 'input'"
            class="w-full"
        >
            <div
                :class="[
                    colorTheme.base,
                    animationClass,
                    sizeClasses.input,
                    effectiveRadius,
                    'w-full overflow-hidden shadow-2xs'
                ]"
                :style="{ width: widthStyle, height: heightStyle }"
            />
        </div>

        <!-- E. VARIANT: HEADING -->
        <div
            v-else-if="activeShape === 'heading'"
            :class="[
                colorTheme.base,
                animationClass,
                sizeClasses.heading,
                effectiveRadius,
                'overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle || '75%', height: heightStyle }"
        />

        <!-- F. VARIANT: CAPTION -->
        <div
            v-else-if="activeShape === 'caption'"
            :class="[
                colorTheme.subtle,
                animationClass,
                'h-2.5 rounded',
                effectiveRadius,
                'overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle || '50%', height: heightStyle }"
        />

        <!-- G. VARIANT: IMAGE / MEDIA -->
        <div
            v-else-if="activeShape === 'image'"
            :class="[
                colorTheme.base,
                animationClass,
                aspect === 'square' ? 'aspect-square' : aspect === 'wide' ? 'aspect-21/9' : aspect === 'video' ? 'aspect-video' : (heightStyle ? '' : sizeClasses.cardImg),
                effectiveRadius,
                'w-full overflow-hidden relative flex items-center justify-center shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle }"
        >
            <span v-if="iconPlaceholder" class="material-symbols-outlined text-3xl opacity-40" :class="colorTheme.icon">
                {{ typeof iconPlaceholder === 'string' ? iconPlaceholder : 'image' }}
            </span>
        </div>

        <!-- H. VARIANT: CIRCULAR / AVATAR -->
        <div
            v-else-if="activeShape === 'circular'"
            :class="[
                colorTheme.base,
                animationClass,
                sizeClasses.circular,
                'rounded-full shrink-0 overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle || widthStyle }"
        />

        <!-- I. VARIANT: ICON -->
        <div
            v-else-if="activeShape === 'icon'"
            :class="[
                colorTheme.base,
                animationClass,
                sizeClasses.icon,
                effectiveRadius,
                'shrink-0 overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle || widthStyle }"
        />

        <!-- J. VARIANT: RECTANGULAR -->
        <div
            v-else-if="activeShape === 'rectangular'"
            :class="[
                colorTheme.base,
                animationClass,
                heightStyle ? '' : sizeClasses.rect,
                'w-full rounded-none overflow-hidden'
            ]"
            :style="{ width: widthStyle, height: heightStyle }"
        />

        <!-- K. VARIANT: ROUNDED / BLOCK -->
        <div
            v-else-if="activeShape === 'rounded'"
            :class="[
                colorTheme.base,
                animationClass,
                heightStyle ? '' : sizeClasses.rect,
                effectiveRadius,
                'w-full overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle }"
        />

        <!-- L. VARIANT: CHECKBOX -->
        <div
            v-else-if="activeShape === 'checkbox'"
            :class="[
                colorTheme.base,
                animationClass,
                'w-4.5 h-4.5 rounded shrink-0 overflow-hidden shadow-2xs'
            ]"
        />

        <!-- M. VARIANT: RADIO -->
        <div
            v-else-if="activeShape === 'radio'"
            :class="[
                colorTheme.base,
                animationClass,
                'w-4.5 h-4.5 rounded-full shrink-0 overflow-hidden shadow-2xs'
            ]"
        />

        <!-- N. VARIANT: SWITCH -->
        <div
            v-else-if="activeShape === 'switch'"
            :class="[
                colorTheme.base,
                animationClass,
                'w-9 h-5 rounded-full shrink-0 overflow-hidden shadow-2xs'
            ]"
        />

        <!-- O. VARIANT: DIVIDER -->
        <div
            v-else-if="activeShape === 'divider'"
            :class="[
                colorTheme.subtle,
                'h-px w-full'
            ]"
        />

        <!-- P. VARIANT: TEXT (Default Multi-Line) -->
        <div
            v-else
            :class="spacingClass"
        >
            <div
                v-for="line in lines"
                :key="line"
                :class="[
                    colorTheme.base,
                    animationClass,
                    sizeClasses.text,
                    effectiveRadius,
                    'overflow-hidden shadow-2xs',
                ]"
                :style="{
                    width: getLineWidth(line, lines),
                    height: heightStyle,
                }"
            />
        </div>
    </div>
</template>

<style scoped>
/* Pure CSS GPU-Accelerated Shimmer Wave */
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
