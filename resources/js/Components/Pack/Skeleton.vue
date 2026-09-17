<script setup>
import { computed } from 'vue';

const props = defineProps({
    /**
     * Kontrol reaktif status pemuatan (Conditional Wrapper)
     * Jika loading=false dan default slot tersedia, komponen akan merender konten asli secara instan tanpa overhead memori.
     */
    loading: {
        type: Boolean,
        default: true,
    },
    /**
     * 2. BENTUK: Varian bentuk atomik
     * - 'text': Baris teks paragraf
     * - 'circular': Lingkaran (avatar / ikon bulat)
     * - 'rectangular': Persegi sudut lancip
     * - 'rounded': Persegi bersudut melengkung
     * - 'icon': Kotak ikon proporsional
     */
    variant: {
        type: String,
        default: 'text',
        validator: (val) => ['text', 'circular', 'rectangular', 'rounded', 'icon'].includes(val),
    },
    /**
     * 2. BENTUK: Preset skeleton halaman dinamis siap pakai:
     * - '': Gunakan varian atomik
     * - 'card': Kartu produk/media (gambar, badge, judul, teks, footer)
     * - 'table': Tabel data multi-kolom dan baris dengan header & paginasi
     * - 'stats' / 'dashboard': Kartu metrik KPI (ikon, nilai besar, badge tren)
     * - 'profile' / 'user': Baris profil pengguna (avatar, nama, status, tombol)
     * - 'form': Kerangka formulir input (label, input box, tombol submit)
     * - 'article' / 'post': Halaman artikel lengkap (kategori, judul, penulis, banner, paragraf)
     * - 'feed' / 'list': Item alur aktivitas beruntun
     */
    type: {
        type: String,
        default: '',
        validator: (val) => ['', 'custom', 'card', 'table', 'stats', 'dashboard', 'profile', 'user', 'form', 'article', 'post', 'feed', 'list'].includes(val),
    },
    /**
     * 1. WARNA: Palet aksen warna semantik
     */
    color: {
        type: String,
        default: 'slate',
        validator: (val) => [
            'slate', 'dark',
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
        ].includes(val),
    },
    /**
     * Efek animasi pemuatan:
     * - 'wave': Kilau shimmer menyapu halus (silky smooth)
     * - 'pulse': Redup-terang lembut
     * - 'none': Statis tanpa animasi (hemat baterai/daya)
     */
    animation: {
        type: String,
        default: 'wave',
        validator: (val) => ['wave', 'pulse', 'none'].includes(val),
    },
    /**
     * 2. BENTUK: Kelengkungan sudut (radius)
     */
    radius: {
        type: String,
        default: '',
        validator: (val) => ['', 'none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * 2. BENTUK: Skala ukuran
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
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
     * 3. TEKS KONTEN: Jumlah baris pada varian text
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
     * Jumlah perulangan kartu / item pada preset card, stats, profile
     */
    count: {
        type: Number,
        default: 1,
    },
});

// Normalisasi preset type
const normalizedType = computed(() => {
    if (props.type === 'dashboard') return 'stats';
    if (props.type === 'user') return 'profile';
    if (props.type === 'post') return 'article';
    if (props.type === 'list') return 'feed';
    return props.type;
});

// 1. WARNA: Palet tema terpadu dengan kontras dark mode
const colorTheme = computed(() => {
    const c = props.color;
    const map = {
        blue: 'primary',
        success: 'emerald',
        violet: 'purple',
        warning: 'amber',
        danger: 'rose',
        sky: 'cyan',
        dark: 'slate',
    };
    const key = map[c] || c;

    switch (key) {
        case 'primary':
            return {
                base: 'bg-blue-200/70 dark:bg-blue-950/50 border border-blue-300/40 dark:border-blue-900/40',
                subtle: 'bg-blue-100/70 dark:bg-blue-950/30',
                container: 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30',
                border: 'border-blue-200/60 dark:border-blue-800/40',
            };
        case 'indigo':
            return {
                base: 'bg-indigo-200/70 dark:bg-indigo-950/50 border border-indigo-300/40 dark:border-indigo-900/40',
                subtle: 'bg-indigo-100/70 dark:bg-indigo-950/30',
                container: 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/30',
                border: 'border-indigo-200/60 dark:border-indigo-800/40',
            };
        case 'emerald':
            return {
                base: 'bg-emerald-200/70 dark:bg-emerald-950/50 border border-emerald-300/40 dark:border-emerald-900/40',
                subtle: 'bg-emerald-100/70 dark:bg-emerald-950/30',
                container: 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30',
                border: 'border-emerald-200/60 dark:border-emerald-800/40',
            };
        case 'purple':
            return {
                base: 'bg-purple-200/70 dark:bg-purple-950/50 border border-purple-300/40 dark:border-purple-900/40',
                subtle: 'bg-purple-100/70 dark:bg-purple-950/30',
                container: 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-900/30',
                border: 'border-purple-200/60 dark:border-purple-800/40',
            };
        case 'amber':
            return {
                base: 'bg-amber-200/70 dark:bg-amber-950/50 border border-amber-300/40 dark:border-amber-900/40',
                subtle: 'bg-amber-100/70 dark:bg-amber-950/30',
                container: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30',
                border: 'border-amber-200/60 dark:border-amber-800/40',
            };
        case 'rose':
            return {
                base: 'bg-rose-200/70 dark:bg-rose-950/50 border border-rose-300/40 dark:border-rose-900/40',
                subtle: 'bg-rose-100/70 dark:bg-rose-950/30',
                container: 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30',
                border: 'border-rose-200/60 dark:border-rose-800/40',
            };
        case 'cyan':
            return {
                base: 'bg-cyan-200/70 dark:bg-cyan-950/50 border border-cyan-300/40 dark:border-cyan-900/40',
                subtle: 'bg-cyan-100/70 dark:bg-cyan-950/30',
                container: 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-200/50 dark:border-cyan-900/30',
                border: 'border-cyan-200/60 dark:border-cyan-800/40',
            };
        case 'slate':
        default:
            return {
                base: 'bg-slate-200/85 dark:bg-slate-800/90 border border-slate-300/30 dark:border-slate-700/30',
                subtle: 'bg-slate-100/80 dark:bg-slate-800/60',
                container: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800',
                border: 'border-slate-200/80 dark:border-slate-800',
            };
    }
});

// Efek animasi murni CSS
const animationClass = computed(() => {
    switch (props.animation) {
        case 'pulse': return 'animate-pulse';
        case 'none': return '';
        case 'wave':
        default: return 'skeleton-shimmer';
    }
});

// 2. BENTUK: Kelas Radius
const effectiveRadius = computed(() => {
    if (props.radius) {
        switch (props.radius) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'xl': return 'rounded-xl';
            case 'full': return 'rounded-full';
        }
    }
    switch (props.variant) {
        case 'circular': return 'rounded-full';
        case 'rectangular': return 'rounded-none';
        case 'icon': return 'rounded-xl';
        case 'rounded': return 'rounded-2xl';
        case 'text':
        default: return 'rounded-md';
    }
});

const containerRadius = computed(() => {
    if (props.radius) {
        switch (props.radius) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-md';
            case 'md': return 'rounded-lg';
            case 'lg': return 'rounded-xl';
            case 'xl':
            case 'full':
            default: return 'rounded-2xl';
        }
    }
    return 'rounded-2xl';
});

// 2. BENTUK: Ukuran dimensi
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                circular: 'w-6 h-6',
                icon: 'w-6 h-6',
                text: 'h-2.5',
                rect: 'h-16',
                cardImg: 'h-28',
                cardPadding: 'p-3',
                statsPadding: 'p-3',
            };
        case 'sm':
            return {
                circular: 'w-8 h-8',
                icon: 'w-7 h-7',
                text: 'h-3',
                rect: 'h-20',
                cardImg: 'h-36',
                cardPadding: 'p-3.5',
                statsPadding: 'p-3.5',
            };
        case 'lg':
            return {
                circular: 'w-16 h-16',
                icon: 'w-12 h-12',
                text: 'h-5',
                rect: 'h-48',
                cardImg: 'h-56',
                cardPadding: 'p-6',
                statsPadding: 'p-6',
            };
        case 'xl':
            return {
                circular: 'w-20 h-20',
                icon: 'w-14 h-14',
                text: 'h-6',
                rect: 'h-64',
                cardImg: 'h-64',
                cardPadding: 'p-7',
                statsPadding: 'p-7',
            };
        case 'md':
        default:
            return {
                circular: 'w-12 h-12',
                icon: 'w-9 h-9',
                text: 'h-4',
                rect: 'h-32',
                cardImg: 'h-44',
                cardPadding: 'p-4',
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
</script>

<template>
    <!-- CONDITIONAL WRAPPER: Jika tidak sedang loading, tampilkan konten asli langsung tanpa overhead -->
    <slot v-if="!loading" />

    <!-- SKELETON PLACEHOLDER STATE -->
    <div
        v-else
        role="status"
        aria-busy="true"
        aria-label="Memuat konten..."
        class="w-full select-none"
    >
        <!-- ===================================================================================== -->
        <!-- PRESET HALAMAN DINAMIS (Cepat Muncul, Ringan Memori, Zero-JS) -->
        <!-- ===================================================================================== -->

        <!-- 1. PRESET: CARD / PRODUK / MEDIA -->
        <div
            v-if="normalizedType === 'card'"
            :class="[
                count > 1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5' : 'w-full'
            ]"
        >
            <div
                v-for="item in count"
                :key="item"
                :class="[
                    'border shadow-2xs overflow-hidden flex flex-col justify-between',
                    colorTheme.container,
                    containerRadius,
                    sizeClasses.cardPadding,
                ]"
            >
                <div>
                    <!-- Card Media Banner -->
                    <div
                        :class="[
                            'w-full overflow-hidden mb-3.5',
                            sizeClasses.cardImg,
                            effectiveRadius,
                            colorTheme.base,
                            animationClass,
                        ]"
                    />

                    <!-- Meta Tags -->
                    <div class="flex items-center justify-between gap-2 mb-2.5">
                        <div :class="['h-3.5 w-16 rounded-full', colorTheme.base, animationClass]" />
                        <div :class="['h-2.5 w-12 rounded-full', colorTheme.subtle, animationClass]" />
                    </div>

                    <!-- Title -->
                    <div :class="['h-4 w-4/5 rounded-md mb-2', colorTheme.base, animationClass]" />

                    <!-- Description Lines -->
                    <div class="space-y-1.5 mb-4">
                        <div :class="['h-3 w-full rounded', colorTheme.subtle, animationClass]" />
                        <div :class="['h-3 w-2/3 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                </div>

                <!-- Footer: Avatar + Name + Button -->
                <div :class="['pt-3 border-t flex items-center justify-between gap-2', colorTheme.border]">
                    <div class="flex items-center gap-2">
                        <div :class="['w-7 h-7 rounded-full shrink-0', colorTheme.base, animationClass]" />
                        <div :class="['h-3 w-20 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                    <div :class="['h-7 w-18 rounded-xl', colorTheme.base, animationClass]" />
                </div>
            </div>
        </div>

        <!-- 2. PRESET: TABLE (Data Table Multi-Kolom & Baris) -->
        <div
            v-else-if="normalizedType === 'table'"
            :class="[
                'border shadow-2xs overflow-hidden w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <!-- Table Header -->
            <div :class="['px-4 py-3 border-b flex items-center gap-4 bg-slate-50/60 dark:bg-slate-800/40', colorTheme.border]">
                <div
                    v-for="c in cols"
                    :key="c"
                    :class="[
                        'h-3.5 rounded-md flex-1',
                        c === 1 ? 'max-w-28' : '',
                        colorTheme.base,
                        animationClass,
                    ]"
                />
            </div>

            <!-- Table Rows -->
            <div class="divide-y" :class="colorTheme.border">
                <div
                    v-for="r in rows"
                    :key="r"
                    class="px-4 py-3.5 flex items-center gap-4"
                >
                    <div
                        v-for="c in cols"
                        :key="c"
                        :class="[
                            'h-3 rounded flex-1',
                            c === 1 ? 'max-w-32 font-bold' : (c === cols ? 'max-w-20' : ''),
                            c % 2 === 0 ? colorTheme.subtle : colorTheme.base,
                            animationClass,
                        ]"
                        :style="{ width: c === 1 ? '30%' : (c === cols ? '15%' : 'auto') }"
                    />
                </div>
            </div>

            <!-- Table Footer / Pagination -->
            <div :class="['px-4 py-3 border-t flex items-center justify-between gap-2 bg-slate-50/40 dark:bg-slate-800/20', colorTheme.border]">
                <div :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                <div class="flex items-center gap-1.5">
                    <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                    <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                    <div :class="['h-6 w-6 rounded-lg', colorTheme.base, animationClass]" />
                </div>
            </div>
        </div>

        <!-- 3. PRESET: STATS / DASHBOARD (KPI Metric Cards) -->
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
                <div class="flex items-center justify-between gap-3 mb-3">
                    <div :class="['w-10 h-10 rounded-xl shrink-0', colorTheme.base, animationClass]" />
                    <div :class="['h-4 w-14 rounded-full', colorTheme.subtle, animationClass]" />
                </div>
                <div :class="['h-7 w-2/3 rounded-lg mb-2', colorTheme.base, animationClass]" />
                <div :class="['h-3 w-4/5 rounded', colorTheme.subtle, animationClass]" />
            </div>
        </div>

        <!-- 4. PRESET: PROFILE / USER ROW -->
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
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div :class="['w-11 h-11 rounded-full shrink-0', colorTheme.base, animationClass]" />
                    <div class="space-y-1.5 min-w-0 flex-1">
                        <div :class="['h-4 w-44 rounded', colorTheme.base, animationClass]" />
                        <div :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                    </div>
                </div>
                <div :class="['h-8 w-20 rounded-xl shrink-0', colorTheme.base, animationClass]" />
            </div>
        </div>

        <!-- 5. PRESET: FORM (Input Form Group) -->
        <div
            v-else-if="normalizedType === 'form'"
            :class="[
                'border shadow-2xs p-5 space-y-4 w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <div v-for="r in rows" :key="r" class="space-y-1.5">
                <div :class="['h-3 w-28 rounded', colorTheme.subtle, animationClass]" />
                <div :class="['h-10 w-full rounded-xl', colorTheme.base, animationClass]" />
            </div>
            <div class="pt-2 flex items-center justify-end gap-2">
                <div :class="['h-9 w-20 rounded-xl', colorTheme.subtle, animationClass]" />
                <div :class="['h-9 w-28 rounded-xl', colorTheme.base, animationClass]" />
            </div>
        </div>

        <!-- 6. PRESET: ARTICLE / POST (Full Content Page) -->
        <div
            v-else-if="normalizedType === 'article'"
            :class="[
                'border shadow-2xs p-6 space-y-5 w-full',
                colorTheme.container,
                containerRadius,
            ]"
        >
            <!-- Badge & Title -->
            <div>
                <div :class="['h-4 w-24 rounded-full mb-3', colorTheme.subtle, animationClass]" />
                <div :class="['h-7 w-3/4 rounded-lg mb-2', colorTheme.base, animationClass]" />
                <div :class="['h-7 w-1/2 rounded-lg', colorTheme.base, animationClass]" />
            </div>

            <!-- Author info -->
            <div class="flex items-center gap-3 py-2">
                <div :class="['w-9 h-9 rounded-full shrink-0', colorTheme.base, animationClass]" />
                <div class="space-y-1">
                    <div :class="['h-3.5 w-32 rounded', colorTheme.base, animationClass]" />
                    <div :class="['h-2.5 w-20 rounded', colorTheme.subtle, animationClass]" />
                </div>
            </div>

            <!-- Hero Image Banner -->
            <div :class="['w-full h-56 rounded-2xl', colorTheme.base, animationClass]" />

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
        </div>

        <!-- 7. PRESET: FEED / TIMELINE LIST -->
        <div
            v-else-if="normalizedType === 'feed'"
            class="space-y-4 w-full"
        >
            <div
                v-for="item in count || rows"
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

        <!-- ===================================================================================== -->
        <!-- VARIAN ATOMIK DASAR (Text, Circular, Rectangular, Rounded, Icon) -->
        <!-- ===================================================================================== -->

        <!-- A. VARIANT: CIRCULAR -->
        <div
            v-else-if="variant === 'circular'"
            :class="[
                colorTheme.base,
                animationClass,
                sizeClasses.circular,
                'rounded-full shrink-0 overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle || widthStyle }"
        />

        <!-- B. VARIANT: ICON -->
        <div
            v-else-if="variant === 'icon'"
            :class="[
                colorTheme.base,
                animationClass,
                sizeClasses.icon,
                effectiveRadius,
                'shrink-0 overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle || widthStyle }"
        />

        <!-- C. VARIANT: RECTANGULAR -->
        <div
            v-else-if="variant === 'rectangular'"
            :class="[
                colorTheme.base,
                animationClass,
                heightStyle ? '' : sizeClasses.rect,
                'w-full rounded-none overflow-hidden'
            ]"
            :style="{ width: widthStyle, height: heightStyle }"
        />

        <!-- D. VARIANT: ROUNDED -->
        <div
            v-else-if="variant === 'rounded'"
            :class="[
                colorTheme.base,
                animationClass,
                heightStyle ? '' : sizeClasses.rect,
                effectiveRadius,
                'w-full overflow-hidden shadow-2xs'
            ]"
            :style="{ width: widthStyle, height: heightStyle }"
        />

        <!-- E. VARIANT: TEXT (Default Multi-Line) -->
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
