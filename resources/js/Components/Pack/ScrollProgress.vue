<script setup>
import { computed, toRef, unref } from 'vue';
import { useScrollProgress } from '@/Composables/Pack/useScrollProgress';

const props = defineProps({
    // Core & Target
    target: {
        type: [String, Object],
        default: 'auto', // 'auto' / null = otomatis mendeteksi window atau main container yang aktif di-scroll
    },
    type: {
        type: String,
        default: 'bar', // 'bar', 'floating-pill', 'circular', 'minimal', 'inertia'
        validator: (val) => ['bar', 'floating-pill', 'circular', 'minimal', 'inertia'].includes(val),
    },
    position: {
        type: String,
        default: 'top', // Bar: 'top', 'bottom', 'left', 'right', 'inline'. Floating/Circular: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'bottom-center', 'inline'
    },
    fixed: {
        type: Boolean,
        default: true,
    },
    zIndex: {
        type: [Number, String],
        default: 99999, // Standar agar selalu di atas navigasi/header
    },

    // Inertia / NProgress Specific Options
    color: {
        type: String,
        default: '', // Hex/RGB string kustom seperti '#6366f1', '#0ea5e9', '#10b981'
    },
    showSpinner: {
        type: Boolean,
        default: false, // Menampilkan spinner NProgress di pojok kanan atas saat scrolling
    },
    peg: {
        type: Boolean,
        default: false, // Default false agar bilah progres selalu bersih tanpa bayangan miring
    },

    // 5 Pilar - 1. Warna & Visual
    colorTheme: {
        type: String,
        default: 'indigo', // 'default', 'dark', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'rainbow'
        validator: (val) => ['default', 'dark', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'rainbow'].includes(val),
    },
    variant: {
        type: String,
        default: 'solid', // 'solid', 'surface', 'soft', 'gradient', 'glass', 'glow', 'outline'
        validator: (val) => ['solid', 'surface', 'soft', 'gradient', 'glass', 'glow', 'outline'].includes(val),
    },
    glow: {
        type: Boolean,
        default: false,
    },
    track: {
        type: Boolean,
        default: false, // Menampilkan rel latar belakang
    },
    trackColor: {
        type: String,
        default: '',
    },
    barColor: {
        type: String,
        default: '',
    },

    // 5 Pilar - 2. Bentuk & Dimensi
    thickness: {
        type: [String, Number],
        default: 'sm', // 'xs' (2px), 'sm' (3px), 'md' (4px), 'lg' (6px), 'xl' (8px), atau number px
    },
    rounded: {
        type: String,
        default: 'none', // 'none', 'sm', 'md', 'lg', 'full'
        validator: (val) => ['none', 'sm', 'md', 'lg', 'full'].includes(val),
    },
    headIndicator: {
        type: String,
        default: 'none', // 'none', 'dot', 'pulse', 'glow-spark', 'icon'
        validator: (val) => ['none', 'dot', 'pulse', 'glow-spark', 'icon'].includes(val),
    },
    size: {
        type: [Number, String],
        default: 56, // Ukuran diameter lingkaran untuk circular (px)
    },

    // 5 Pilar - 3. Teks Konten
    showPercentage: {
        type: Boolean,
        default: false,
    },
    showIcon: {
        type: Boolean,
        default: true,
    },
    showText: {
        type: Boolean,
        default: true,
    },
    percentagePosition: {
        type: String,
        default: 'follower', // 'inside', 'follower', 'center'
        validator: (val) => ['inside', 'follower', 'center'].includes(val),
    },
    label: {
        type: String,
        default: '',
    },
    showReadingTime: {
        type: Boolean,
        default: false,
    },
    wordsCount: {
        type: Number,
        default: 0,
    },
    wordsPerMinute: {
        type: Number,
        default: 200,
    },
    prefix: {
        type: String,
        default: '',
    },
    suffix: {
        type: String,
        default: '%',
    },

    // 5 Pilar - 4. Icon & Interaktivitas
    icon: {
        type: String,
        default: '',
    },
    completeIcon: {
        type: String,
        default: 'check_circle',
    },
    clickable: {
        type: Boolean,
        default: false,
    },
    backToTop: {
        type: Boolean,
        default: false,
    },
    hideAtTop: {
        type: Boolean,
        default: false, // Sembunyikan saat posisi scroll 0%
    },
    threshold: {
        type: Number,
        default: 1,
    },
});

const emit = defineEmits(['update:progress', 'complete', 'scroll-to-top']);

// Inisialisasi Composable dengan auto-detect & opsi reaktif
const {
    progress,
    scrollPercent,
    isScrolling,
    isAtTop,
    isComplete,
    readingTimeRemaining,
    scrollToTop,
    scrollToProgress,
} = useScrollProgress({
    target: toRef(props, 'target'),
    threshold: toRef(props, 'threshold'),
    wordsCount: toRef(props, 'wordsCount'),
    wordsPerMinute: toRef(props, 'wordsPerMinute'),
});

defineExpose({
    progress,
    scrollPercent,
    isScrolling,
    isAtTop,
    isComplete,
    readingTimeRemaining,
    scrollToTop,
    scrollToProgress,
});

// Watch progress untuk emit
const currentProgress = computed(() => {
    emit('update:progress', progress.value);
    if (isComplete.value) {
        emit('complete', progress.value);
    }
    return progress.value;
});

// Menentukan apakah orientasi vertikal
const isVertical = computed(() => {
    return (props.type === 'bar' || props.type === 'minimal' || props.type === 'inertia') && (props.position === 'left' || props.position === 'right');
});

// Resolusi warna heksadesimal / CSS untuk bar, peg, ring, dan glow
const themeHexMap = {
    default: '#6366f1', // Indigo modern
    dark: '#475569',    // Slate 600
    primary: '#0ea5e9', // Sky Blue
    indigo: '#6366f1',  // Indigo
    emerald: '#10b981', // Emerald
    purple: '#a855f7',  // Purple
    amber: '#f59e0b',   // Amber
    rose: '#f43f5e',    // Rose
    cyan: '#06b6d4',    // Cyan
    rainbow: '#6366f1',
};

const activeColor = computed(() => {
    if (props.color) return props.color;
    return themeHexMap[props.colorTheme] || '#6366f1';
});

// Preset ketebalan piksel
const presetThicknessMap = {
    xs: '2px',
    sm: '3px',
    md: '4px',
    lg: '6px',
    xl: '8px',
};

const thicknessValue = computed(() => {
    if (typeof props.thickness === 'number') {
        return `${props.thickness}px`;
    }
    return presetThicknessMap[props.thickness] || '3px';
});

// Style kontainer terluar bar
const containerStyle = computed(() => {
    const style = {
        zIndex: props.zIndex,
    };

    if (props.type === 'bar' || props.type === 'minimal' || props.type === 'inertia') {
        if (isVertical.value) {
            style.width = thicknessValue.value;
            style.height = '100%';
        } else {
            style.height = thicknessValue.value;
            style.width = '100%';
        }
    }

    return style;
});

// Kelengkungan sudut
const roundedClass = computed(() => {
    const map = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };
    return map[props.rounded] || 'rounded-none';
});

// Palet warna tema lengkap untuk 5 tipe dan 7 varian
const themeColors = computed(() => {
    const themes = {
        default: {
            bar: 'bg-indigo-600 dark:bg-indigo-500',
            softBar: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
            gradient: 'from-indigo-500 via-purple-500 to-pink-500',
            glowColor: 'rgba(99, 102, 241, 0.65)',
            text: 'text-indigo-600 dark:text-indigo-400',
            ring: 'stroke-indigo-600 dark:stroke-indigo-400',
            pill: 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/90 dark:bg-indigo-950/70',
        },
        dark: {
            bar: 'bg-slate-700 dark:bg-slate-400',
            softBar: 'bg-slate-500/20 text-slate-800 dark:text-slate-200 border-slate-500/30',
            gradient: 'from-slate-700 via-slate-600 to-zinc-900',
            glowColor: 'rgba(100, 116, 139, 0.65)',
            text: 'text-slate-700 dark:text-slate-300',
            ring: 'stroke-slate-700 dark:stroke-slate-400',
            pill: 'border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-900/90',
        },
        primary: {
            bar: 'bg-sky-500 dark:bg-sky-400',
            softBar: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
            gradient: 'from-sky-400 via-blue-500 to-indigo-600',
            glowColor: 'rgba(14, 165, 233, 0.65)',
            text: 'text-sky-600 dark:text-sky-400',
            ring: 'stroke-sky-500 dark:stroke-sky-400',
            pill: 'border-sky-200 dark:border-sky-800/60 bg-sky-50/90 dark:bg-sky-950/70',
        },
        indigo: {
            bar: 'bg-indigo-600 dark:bg-indigo-500',
            softBar: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
            gradient: 'from-indigo-500 via-purple-500 to-pink-500',
            glowColor: 'rgba(99, 102, 241, 0.65)',
            text: 'text-indigo-600 dark:text-indigo-400',
            ring: 'stroke-indigo-600 dark:stroke-indigo-400',
            pill: 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/90 dark:bg-indigo-950/70',
        },
        emerald: {
            bar: 'bg-emerald-500 dark:bg-emerald-400',
            softBar: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
            gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
            glowColor: 'rgba(16, 185, 129, 0.65)',
            text: 'text-emerald-600 dark:text-emerald-400',
            ring: 'stroke-emerald-500 dark:stroke-emerald-400',
            pill: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-emerald-950/70',
        },
        purple: {
            bar: 'bg-purple-600 dark:bg-purple-500',
            softBar: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
            gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
            glowColor: 'rgba(168, 85, 247, 0.65)',
            text: 'text-purple-600 dark:text-purple-400',
            ring: 'stroke-purple-600 dark:stroke-purple-400',
            pill: 'border-purple-200 dark:border-purple-800/60 bg-purple-50/90 dark:bg-purple-950/70',
        },
        amber: {
            bar: 'bg-amber-500 dark:bg-amber-400',
            softBar: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
            gradient: 'from-amber-400 via-orange-500 to-rose-500',
            glowColor: 'rgba(245, 158, 11, 0.65)',
            text: 'text-amber-600 dark:text-amber-400',
            ring: 'stroke-amber-500 dark:stroke-amber-400',
            pill: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/70',
        },
        rose: {
            bar: 'bg-rose-500 dark:bg-rose-400',
            softBar: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
            gradient: 'from-rose-500 via-pink-500 to-red-500',
            glowColor: 'rgba(244, 63, 94, 0.65)',
            text: 'text-rose-600 dark:text-rose-400',
            ring: 'stroke-rose-500 dark:stroke-rose-400',
            pill: 'border-rose-200 dark:border-rose-800/60 bg-rose-50/90 dark:bg-rose-950/70',
        },
        cyan: {
            bar: 'bg-cyan-500 dark:bg-cyan-400',
            softBar: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
            gradient: 'from-cyan-400 via-sky-500 to-blue-600',
            glowColor: 'rgba(6, 182, 212, 0.65)',
            text: 'text-cyan-600 dark:text-cyan-400',
            ring: 'stroke-cyan-500 dark:stroke-cyan-400',
            pill: 'border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/90 dark:bg-cyan-950/70',
        },
        rainbow: {
            bar: 'bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500',
            softBar: 'bg-gradient-to-r from-rose-500/30 via-emerald-400/30 to-purple-500/30 border-purple-500/40',
            gradient: 'from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500',
            glowColor: 'rgba(236, 72, 153, 0.65)',
            text: 'text-purple-600 dark:text-purple-400',
            ring: 'stroke-purple-500 dark:stroke-purple-400',
            pill: 'border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-slate-900/90',
        },
    };
    return themes[props.colorTheme] || themes.indigo;
});

// Bar Fill Class
const barFillClass = computed(() => {
    if (props.barColor) return props.barColor;
    if (props.color) return ''; // Gunakan style.backgroundColor

    if (props.variant === 'solid') {
        return themeColors.value.bar;
    }

    if (props.variant === 'gradient' || props.colorTheme === 'rainbow') {
        return isVertical.value
            ? `bg-gradient-to-b ${themeColors.value.gradient}`
            : `bg-gradient-to-r ${themeColors.value.gradient}`;
    }

    if (props.variant === 'soft') {
        return `${themeColors.value.softBar} border-y`;
    }

    if (props.variant === 'glass') {
        return 'bg-white/60 dark:bg-white/20 backdrop-blur-md border border-white/30 shadow-sm';
    }

    if (props.variant === 'surface') {
        return 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm';
    }

    if (props.variant === 'glow') {
        return themeColors.value.bar;
    }

    if (props.variant === 'outline') {
        return `${themeColors.value.bar} ring-1 ring-white/30`;
    }

    return themeColors.value.bar;
});

// Style inline untuk elemen bar
const barFillStyle = computed(() => {
    const style = {};

    if (props.color) {
        style.backgroundColor = props.color;
    } else if (props.variant === 'solid' && activeColor.value) {
        style.backgroundColor = activeColor.value;
    }

    if (isVertical.value) {
        style.height = `${currentProgress.value}%`;
        style.width = '100%';
    } else {
        style.width = `${currentProgress.value}%`;
        style.height = '100%';
    }

    if (props.glow || props.variant === 'glow') {
        const glowCol = props.color || themeColors.value.glowColor;
        style.boxShadow = `0 0 12px 1px ${glowCol}, 0 0 4px ${glowCol}`;
    }

    return style;
});

// Efek pendaran ujung bar (bersih, rata horizontal, tanpa artefak garis miring)
const pegStyle = computed(() => {
    if (!props.peg) return {};
    const col = props.color || activeColor.value;
    return {
        background: `linear-gradient(to right, transparent, ${col})`,
        boxShadow: `0 0 8px ${col}`,
        opacity: 0.85,
    };
});

// Track style
const trackFillClass = computed(() => {
    if (props.trackColor) return props.trackColor;
    if (!props.track || props.type === 'minimal') return 'bg-transparent';
    return 'bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-xs';
});

// Posisi bar
const positionClass = computed(() => {
    // 1. Mode Inline / Relative
    if (props.position === 'inline' || props.position === 'relative' || props.position === 'static') {
        return 'relative inline-flex';
    }

    const isFixed = props.fixed ? 'fixed' : 'absolute';

    // 2. Bar, Minimal, Inertia
    if (props.type === 'bar' || props.type === 'minimal' || props.type === 'inertia') {
        switch (props.position) {
            case 'bottom':
                return `${isFixed} bottom-0 left-0 w-full`;
            case 'left':
                return `${isFixed} left-0 top-0 h-full`;
            case 'right':
                return `${isFixed} right-0 top-0 h-full`;
            case 'top':
            default:
                return `${isFixed} top-0 left-0 w-full`;
        }
    }

    // 3. Floating & Circular
    if (!props.fixed && !['bottom-right', 'bottom-left', 'top-right', 'top-left', 'bottom-center'].includes(props.position)) {
        return 'relative inline-flex';
    }

    switch (props.position) {
        case 'bottom-left':
            return `${isFixed} bottom-4 left-4 sm:bottom-6 sm:left-6`;
        case 'top-right':
            return `${isFixed} top-4 right-4 sm:top-6 sm:right-6`;
        case 'top-left':
            return `${isFixed} top-4 left-4 sm:top-6 sm:left-6`;
        case 'bottom-center':
            return `${isFixed} bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2`;
        case 'bottom-right':
        default:
            return `${isFixed} bottom-4 right-4 sm:bottom-6 sm:right-6`;
    }
});

// Sembunyikan saat di posisi 0% hanya jika hideAtTop diaktifkan
const shouldHide = computed(() => {
    if (props.hideAtTop) {
        return currentProgress.value <= 0;
    }
    return false;
});

// Interaktivitas klik
const isClickable = computed(() => {
    return props.clickable || props.backToTop || props.type === 'circular' || props.type === 'floating-pill';
});

const handleClick = () => {
    if (isClickable.value) {
        scrollToTop();
        emit('scroll-to-top');
    }
};

// Tooltip Follower Clamping & Placement Logic
const followerPlacement = computed(() => {
    if (isVertical.value) {
        return props.position === 'left' ? 'left-side' : 'right-side';
    }
    // Jika bar di atas layar, tooltip wajib menggantung di bawah bar agar tidak keluar viewport / tidak tabrakan dengan header
    return props.position === 'bottom' ? 'above' : 'below';
});

// Transform translation dinamis: -0% saat 0, -50% saat 50, -100% saat 100 agar TIDAK PERNAH terpotong di tepi kiri maupun kanan layar!
const followerTranslateStyle = computed(() => {
    if (isVertical.value) {
        const ty = -currentProgress.value;
        return {
            transform: `translateY(${ty}%)`,
        };
    }
    const tx = -currentProgress.value;
    return {
        transform: `translateX(${tx}%)`,
    };
});

// Palet Solid & Soft Background Maps untuk Floating Pill & Circular
const solidBgMap = {
    default: 'bg-indigo-600 text-white',
    dark: 'bg-slate-900 dark:bg-slate-800 text-white',
    primary: 'bg-sky-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    amber: 'bg-amber-600 text-white',
    rose: 'bg-rose-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    rainbow: 'bg-slate-900 text-white',
};

const softBgMap = {
    default: 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    dark: 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
    primary: 'bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    purple: 'bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    amber: 'bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
    rainbow: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700',
};

// Kalkulasi SVG Circular
const circleSize = computed(() => Number(props.size) || 56);
const strokeWidth = computed(() => {
    if (typeof props.thickness === 'number') return props.thickness;
    const map = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 };
    return map[props.thickness] || 4;
});
const radius = computed(() => (circleSize.value - strokeWidth.value * 2) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const strokeDashoffset = computed(() => {
    return circumference.value - (currentProgress.value / 100) * circumference.value;
});

// Ikon aktif
const activeIcon = computed(() => {
    if (isComplete.value && props.completeIcon) {
        return props.completeIcon;
    }
    if (props.icon) return props.icon;
    return 'arrow_upward';
});

// Visibilitas Icon & Text pada Circular / Pill
const hasIcon = computed(() => {
    if (!props.showIcon) return false;
    return !!activeIcon.value;
});

const hasText = computed(() => {
    if (!props.showText) return false;
    return props.showPercentage || !!props.label;
});

const displayText = computed(() => {
    if (props.label) return props.label;
    return `${props.prefix}${Math.round(currentProgress.value)}${props.suffix}`;
});

// Ukuran Layout Icon & Text Proporsional di dalam Circular
const circularContentLayout = computed(() => {
    const s = circleSize.value;
    if (s >= 64) {
        return {
            iconSize: hasText.value ? 'text-[20px]' : 'text-[28px]',
            textSize: 'text-[12px]',
            gap: 'space-y-0.5',
        };
    } else if (s >= 52) {
        return {
            iconSize: hasText.value ? 'text-[16px]' : 'text-[22px]',
            textSize: 'text-[10px]',
            gap: '-space-y-0.5',
        };
    } else {
        return {
            iconSize: hasText.value ? 'text-[13px]' : 'text-[18px]',
            textSize: 'text-[9px]',
            gap: '-space-y-1',
        };
    }
});

// Styling Circular Button
const circularBtnClass = computed(() => {
    const classes = [
        'group relative flex items-center justify-center rounded-full transition-all duration-300 select-none shadow-lg',
        isClickable.value ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default',
    ];

    if (props.variant === 'solid') {
        if (!props.color) {
            classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
        }
    } else if (props.variant === 'soft') {
        classes.push(softBgMap[props.colorTheme] || softBgMap.default);
    } else if (props.variant === 'surface' || props.variant === 'outline') {
        classes.push('bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100');
    } else if (props.variant === 'gradient') {
        classes.push(`bg-gradient-to-br ${themeColors.value.gradient} text-white`);
    } else if (props.variant === 'glass') {
        classes.push('bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/60 text-slate-800 dark:text-slate-100');
    } else if (props.variant === 'glow') {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
    } else {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
    }

    return classes.join(' ');
});

const circularBtnStyle = computed(() => {
    const style = {
        width: `${circleSize.value}px`,
        height: `${circleSize.value}px`,
    };

    if (props.variant === 'solid' && props.color) {
        style.backgroundColor = props.color;
        style.color = '#ffffff';
    }

    if (props.glow || props.variant === 'glow') {
        const glowCol = props.color || themeColors.value.glowColor;
        style.boxShadow = `0 0 16px 2px ${glowCol}`;
    }

    return style;
});

// SVG Circular Track Class
const circularTrackClass = computed(() => {
    if (props.trackColor) return props.trackColor;
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return 'stroke-white/20';
    }
    if (props.variant === 'soft') {
        return 'stroke-current opacity-20';
    }
    return 'stroke-slate-200 dark:stroke-slate-700';
});

// SVG Circular Ring Class & Style
const circularRingClass = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return 'stroke-white';
    }
    if (props.color) {
        return '';
    }
    return themeColors.value.ring;
});

const circularRingStyle = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return { stroke: '#ffffff' };
    }
    if (props.color) {
        return { stroke: props.color };
    }
    return {};
});

// Warna Icon & Text di dalam Circular
const circularIconColorClass = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return 'text-white';
    }
    if (isComplete.value) {
        return 'text-emerald-500';
    }
    if (props.color) {
        return '';
    }
    return themeColors.value.text;
});

const circularIconColorStyle = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return { color: '#ffffff' };
    }
    if (isComplete.value) {
        return {};
    }
    if (props.color) {
        return { color: props.color };
    }
    return {};
});

const circularTextColorClass = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return 'text-white';
    }
    if (props.color) {
        return '';
    }
    return themeColors.value.text;
});

const circularTextColorStyle = computed(() => {
    if (props.variant === 'solid' || props.variant === 'gradient') {
        return { color: '#ffffff' };
    }
    if (props.color) {
        return { color: props.color };
    }
    return {};
});

// Styling Floating Pill
const floatingPillClass = computed(() => {
    const classes = [
        'group flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-300 select-none shadow-xl',
        isClickable.value ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]' : 'cursor-default',
    ];

    if (props.variant === 'solid') {
        if (!props.color) {
            classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
        }
    } else if (props.variant === 'soft') {
        classes.push(softBgMap[props.colorTheme] || softBgMap.default);
    } else if (props.variant === 'surface' || props.variant === 'outline') {
        classes.push('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100');
    } else if (props.variant === 'gradient') {
        classes.push(`bg-gradient-to-r ${themeColors.value.gradient} text-white`);
    } else if (props.variant === 'glass') {
        classes.push('bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/60 text-slate-800 dark:text-slate-100');
    } else if (props.variant === 'glow') {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
    } else {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
    }

    return classes.join(' ');
});

const floatingPillStyle = computed(() => {
    const style = {};
    if (props.variant === 'solid' && props.color) {
        style.backgroundColor = props.color;
        style.color = '#ffffff';
    }
    if (props.glow || props.variant === 'glow') {
        const glowCol = props.color || themeColors.value.glowColor;
        style.boxShadow = `0 0 16px 2px ${glowCol}`;
    }
    return style;
});
</script>

<template>
    <!-- MODE 1, 4, & INERTIA: LINEAR BAR -->
    <div
        v-if="type === 'bar' || type === 'minimal' || type === 'inertia'"
        :class="[
            positionClass,
            trackFillClass,
            'pointer-events-none transition-opacity duration-200 overflow-visible',
            shouldHide ? 'opacity-0' : 'opacity-100',
        ]"
        :style="containerStyle"
    >
        <!-- Bar Progress Wrapper -->
        <div
            :class="[
                'relative w-full h-full overflow-visible',
                isClickable ? 'pointer-events-auto cursor-pointer' : '',
            ]"
            @click="handleClick"
        >
            <!-- Progress Fill Element (Dengan lebar/tinggi dinamis dan animasi halus) -->
            <div
                :class="[
                    barFillClass,
                    roundedClass,
                    'relative transition-[width,height] duration-75 ease-out h-full',
                ]"
                :style="barFillStyle"
            >
                <!-- Inertia / NProgress Signature Peg (Glow Rata di Ujung Bar) -->
                <div
                    v-if="peg && currentProgress > 0 && !isVertical"
                    class="absolute right-0 top-0 w-16 h-full pointer-events-none"
                    :style="pegStyle"
                />

                <!-- Percentage Inside Bar (Untuk Bar dengan Ketebalan Cukup) -->
                <span
                    v-if="showPercentage && percentagePosition === 'inside' && !isVertical"
                    class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white leading-none select-none drop-shadow-sm font-mono"
                >
                    <slot name="percentage" :progress="currentProgress">
                        {{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}
                    </slot>
                </span>

                <!-- Head Indicator Refined (Dot / Pulse / Glow Spark / Icon) -->
                <div
                    v-if="headIndicator !== 'none' && currentProgress > 0"
                    :class="[
                        'absolute flex items-center justify-center transition-all duration-75 z-10',
                        isVertical
                            ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
                            : 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
                    ]"
                >
                    <!-- Dot: Precision Jewel Dot -->
                    <span
                        v-if="headIndicator === 'dot'"
                        class="w-3 h-3 rounded-full bg-white shadow-md ring-2 transition-transform"
                        :style="{
                            boxShadow: `0 2px 6px rgba(0,0,0,0.25)`,
                            borderColor: activeColor,
                        }"
                        :class="[themeColors.text, 'border-2']"
                    />

                    <!-- Pulse: High-Tech Radar Radar -->
                    <span v-else-if="headIndicator === 'pulse'" class="relative flex items-center justify-center h-4 w-4">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            :style="{ backgroundColor: activeColor }"
                        />
                        <span
                            class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-md ring-2 ring-white/80"
                            :style="{ backgroundColor: '#ffffff' }"
                        />
                    </span>

                    <!-- Glow Spark: Brilliant Radiant Spark Head (No Blurry Smudge) -->
                    <span
                        v-else-if="headIndicator === 'glow-spark'"
                        class="relative flex items-center justify-center"
                    >
                        <span
                            class="w-3.5 h-3.5 rounded-full absolute opacity-90 animate-pulse"
                            :style="{
                                background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)`,
                                transform: 'scale(2.2)',
                            }"
                        />
                        <span
                            class="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/95 shadow-md relative z-10"
                            :style="{
                                boxShadow: `0 0 10px 2px ${activeColor}`,
                            }"
                        />
                    </span>

                    <!-- Moving Icon: Directional Navigator -->
                    <span
                        v-else-if="headIndicator === 'icon'"
                        class="w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700"
                    >
                        <slot name="icon" :is-complete="isComplete">
                            <span
                                class="material-symbols-outlined text-[13px] transition-transform duration-200"
                                :class="[themeColors.text, isVertical ? 'rotate-180' : 'rotate-90']"
                            >
                                {{ activeIcon }}
                            </span>
                        </slot>
                    </span>
                </div>

                <!-- Follower Badge Refined (Persentase Melayang Mengikuti Ujung Bar) -->
                <!-- Menggunakan smart placement: jika bar di top, tooltip menggantung di bawah bar dengan caret ke atas -->
                <div
                    v-if="showPercentage && percentagePosition === 'follower'"
                    :class="[
                        'absolute pointer-events-none select-none z-30 transition-all duration-75',
                        followerPlacement === 'below' ? 'top-full mt-2 right-0' : '',
                        followerPlacement === 'above' ? 'bottom-full mb-2 right-0' : '',
                        followerPlacement === 'left-side' ? 'left-full ml-2 bottom-0' : '',
                        followerPlacement === 'right-side' ? 'right-full mr-2 bottom-0' : '',
                    ]"
                    :style="followerTranslateStyle"
                >
                    <div
                        class="relative flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/95 dark:bg-slate-950/95 text-white border border-white/15 shadow-xl backdrop-blur-md text-[11px] font-mono font-bold tracking-tight whitespace-nowrap"
                    >
                        <!-- Caret Arrow (Pointing to the bar) -->
                        <span
                            v-if="followerPlacement === 'below'"
                            class="absolute -top-1 right-2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-t border-l border-white/15"
                        />
                        <span
                            v-else-if="followerPlacement === 'above'"
                            class="absolute -bottom-1 right-2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-b border-r border-white/15"
                        />
                        <span
                            v-else-if="followerPlacement === 'left-side'"
                            class="absolute -left-1 bottom-1.5 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-b border-l border-white/15"
                        />
                        <span
                            v-else-if="followerPlacement === 'right-side'"
                            class="absolute -right-1 bottom-1.5 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-t border-r border-white/15"
                        />

                        <!-- Percentage Content Slot -->
                        <slot name="percentage" :progress="currentProgress">
                            <span>{{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}</span>
                        </slot>

                        <!-- Optional Reading Time inside follower -->
                        <span
                            v-if="showReadingTime && readingTimeRemaining > 0"
                            class="text-[9px] font-normal text-slate-300 border-l border-white/20 pl-1.5"
                        >
                            ~{{ readingTimeRemaining }}m
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Inertia NProgress Spinner (Pojok Kanan Atas) -->
        <div
            v-if="showSpinner"
            :class="[
                'fixed top-3.5 right-4 pointer-events-none transition-all duration-300',
                (isScrolling || currentProgress > 0) ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
            ]"
            :style="{ zIndex: zIndex }"
        >
            <div
                class="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                :style="{
                    borderTopColor: color || activeColor,
                    borderLeftColor: color || activeColor,
                }"
            />
        </div>
    </div>

    <!-- MODE 2: FLOATING PILL (DYNAMIC ISLAND CAPSULE WITH PROGRESS & READING TIME) -->
    <div
        v-else-if="type === 'floating-pill'"
        :class="[
            positionClass,
            'transition-all duration-300 transform select-none',
            shouldHide ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0',
        ]"
        :style="{ zIndex: zIndex }"
    >
        <button
            type="button"
            :class="floatingPillClass"
            :style="floatingPillStyle"
            :title="isClickable ? 'Scroll kembali ke atas' : ''"
            @click="handleClick"
        >
            <!-- Left Action Icon -->
            <div
                v-if="hasIcon"
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 shadow-xs"
                :class="variant === 'solid' || variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'"
            >
                <slot name="icon" :is-complete="isComplete">
                    <span class="material-symbols-outlined text-[16px] leading-none">
                        {{ activeIcon }}
                    </span>
                </slot>
            </div>

            <!-- Content Details: Label, Reading Time, Percentage, Micro-bar -->
            <div class="flex flex-col text-left">
                <div class="flex items-center gap-2">
                    <span
                        v-if="label"
                        class="text-[11px] font-semibold hidden sm:inline"
                        :class="variant === 'solid' || variant === 'gradient' ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
                    >
                        {{ label }}
                    </span>

                    <span
                        v-if="showReadingTime && readingTimeRemaining > 0"
                        class="text-[10px] font-medium"
                        :class="variant === 'solid' || variant === 'gradient' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'"
                    >
                        ~{{ readingTimeRemaining }} mnt
                    </span>

                    <span
                        v-if="showPercentage"
                        class="text-xs font-mono font-bold leading-none"
                        :class="variant === 'solid' || variant === 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white'"
                    >
                        <slot name="percentage" :progress="currentProgress">
                            {{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}
                        </slot>
                    </span>
                </div>

                <!-- Integrated Micro Progress Bar -->
                <div
                    class="w-24 h-1.5 mt-1.5 rounded-full overflow-hidden"
                    :class="variant === 'solid' || variant === 'gradient' ? 'bg-white/25' : 'bg-slate-200 dark:bg-slate-700'"
                >
                    <div
                        class="h-full rounded-full transition-[width] duration-75 ease-out"
                        :class="variant === 'solid' || variant === 'gradient' ? 'bg-white' : themeColors.bar"
                        :style="{ width: `${currentProgress}%` }"
                    />
                </div>
            </div>
        </button>
    </div>

    <!-- MODE 3: CIRCULAR SVG GAUGE (WITH BACK-TO-TOP & PROPORTIONAL CONTENT) -->
    <div
        v-else-if="type === 'circular'"
        :class="[
            positionClass,
            'transition-all duration-300 transform select-none',
            shouldHide ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100',
        ]"
        :style="{ zIndex: zIndex }"
    >
        <button
            type="button"
            :class="circularBtnClass"
            :style="circularBtnStyle"
            :title="isClickable ? 'Scroll kembali ke atas' : ''"
            @click="handleClick"
        >
            <svg
                :width="circleSize"
                :height="circleSize"
                class="absolute inset-0 -rotate-90 transform pointer-events-none"
            >
                <!-- Track Ring -->
                <circle
                    :cx="circleSize / 2"
                    :cy="circleSize / 2"
                    :r="radius"
                    :stroke-width="strokeWidth"
                    fill="transparent"
                    :class="[circularTrackClass, 'transition-colors']"
                />

                <!-- Active Progress Ring -->
                <circle
                    :cx="circleSize / 2"
                    :cy="circleSize / 2"
                    :r="radius"
                    :stroke-width="strokeWidth"
                    fill="transparent"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="strokeDashoffset"
                    stroke-linecap="round"
                    :class="[
                        circularRingClass,
                        'transition-[stroke-dashoffset] duration-75 ease-out',
                    ]"
                    :style="circularRingStyle"
                />
            </svg>

            <!-- Centered Content: Icon & Percentage Text -->
            <div
                class="relative z-10 flex flex-col items-center justify-center text-center select-none pointer-events-none"
                :class="circularContentLayout.gap"
            >
                <slot name="default" :progress="currentProgress" :is-complete="isComplete">
                    <!-- Icon -->
                    <span
                        v-if="hasIcon"
                        class="material-symbols-outlined leading-none transition-transform duration-200 group-hover:-translate-y-0.5"
                        :class="[
                            circularContentLayout.iconSize,
                            circularIconColorClass,
                        ]"
                        :style="circularIconColorStyle"
                    >
                        {{ activeIcon }}
                    </span>

                    <!-- Teks / Percentage -->
                    <span
                        v-if="hasText"
                        class="font-mono font-bold leading-none tracking-tight"
                        :class="[
                            circularContentLayout.textSize,
                            circularTextColorClass,
                        ]"
                        :style="circularTextColorStyle"
                    >
                        <slot name="percentage" :progress="currentProgress">
                            {{ displayText }}
                        </slot>
                    </span>
                </slot>
            </div>
        </button>
    </div>
</template>
