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
        default: 'bar', // 'bar' (Inertia/NProgress style), 'floating-pill', 'circular', 'minimal'
        validator: (val) => ['bar', 'floating-pill', 'circular', 'minimal', 'inertia'].includes(val),
    },
    position: {
        type: String,
        default: 'top', // Bar: 'top', 'bottom', 'left', 'right'. Floating/Circular: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'bottom-center'
    },
    fixed: {
        type: Boolean,
        default: true,
    },
    zIndex: {
        type: [Number, String],
        default: 99999, // Standar Inertia/NProgress agar selalu di atas navigasi/header
    },

    // Inertia / NProgress Specific Options (seperti app.js: progress: { color: '#4B5563', showSpinner: true })
    color: {
        type: String,
        default: '', // Hex string seperti '#4B5563', '#29d', '#0ea5e9', dll
    },
    showSpinner: {
        type: Boolean,
        default: false, // Menampilkan spinner NProgress di pojok kanan atas saat scrolling
    },
    peg: {
        type: Boolean,
        default: true, // Efek bayangan pendaran NProgress "peg" di ujung kanan bar
    },

    // 5 Pilar - 1. Warna & Visual
    colorTheme: {
        type: String,
        default: 'dark', // 'default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark', 'rainbow'
        validator: (val) => ['default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark', 'rainbow'].includes(val),
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
        default: false, // Default false untuk Inertia style agar bersih tanpa rel abu-abu di atas layar
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
        default: 'sm', // Standar tipis Inertia: 'sm' (3px), 'xs' (2px), 'md' (4px), 'lg' (6px), atau number px
    },
    rounded: {
        type: String,
        default: 'none', // Standar Inertia: 'none' (menempel rata di tepi layar) atau 'full'
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
        default: false, // Default false agar bar selalu tampil presisi (0% saat di paling atas)
    },
    threshold: {
        type: Number,
        default: 1,
    },
});

const emit = defineEmits(['update:progress', 'complete', 'scroll-to-top']);

// Inisialisasi Composable dengan auto-detect
const {
    progress,
    scrollPercent,
    isScrolling,
    isAtTop,
    isComplete,
    readingTimeRemaining,
    scrollToTop,
} = useScrollProgress({
    target: toRef(props, 'target'),
    threshold: props.threshold,
    wordsCount: props.wordsCount,
    wordsPerMinute: props.wordsPerMinute,
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

// Resolusi warna heksadesimal / CSS untuk NProgress bar, peg, dan spinner
const activeColor = computed(() => {
    if (props.color) return props.color;

    const hexThemes = {
        default: '#4B5563', // Warna default Inertia di app.js
        dark: '#4B5563',    // #4B5563 (Slate Gray)
        primary: '#0ea5e9', // Sky Blue
        indigo: '#6366f1',  // Indigo
        emerald: '#10b981', // Emerald
        purple: '#a855f7',  // Purple
        amber: '#f59e0b',   // Amber
        rose: '#f43f5e',    // Rose
        cyan: '#06b6d4',    // Cyan
        rainbow: null,
    };

    return hexThemes[props.colorTheme] || '#4B5563';
});

// Preset ketebalan piksel
const presetThicknessMap = {
    xs: '2px',
    sm: '3px',   // Standar Inertia/NProgress
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

// Style kontainer terluar bar (PASTIKAN SELALU MEMILIKI TINGGI/LEBAR FISIK YANG NYATA)
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

// Palet warna tema bawaan
const themeColors = computed(() => {
    const themes = {
        default: {
            bar: 'bg-[#4B5563]',
            gradient: 'from-slate-600 via-zinc-700 to-zinc-900',
            glow: 'rgba(75, 85, 99, 0.5)',
            text: 'text-zinc-600 dark:text-zinc-400',
            ring: 'stroke-[#4B5563]',
            pill: 'border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90',
        },
        dark: {
            bar: 'bg-[#4B5563]',
            gradient: 'from-slate-600 via-zinc-700 to-zinc-900',
            glow: 'rgba(75, 85, 99, 0.5)',
            text: 'text-zinc-700 dark:text-zinc-300',
            ring: 'stroke-[#4B5563]',
            pill: 'border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90',
        },
        primary: {
            bar: 'bg-sky-500',
            gradient: 'from-sky-400 via-primary-500 to-indigo-600',
            glow: 'rgba(14, 165, 233, 0.5)',
            text: 'text-primary-600 dark:text-primary-400',
            ring: 'stroke-primary-500',
            pill: 'border-primary-200 dark:border-primary-800/60 bg-primary-50/80 dark:bg-primary-950/70',
        },
        indigo: {
            bar: 'bg-indigo-600',
            gradient: 'from-indigo-500 via-purple-600 to-violet-600',
            glow: 'rgba(99, 102, 241, 0.5)',
            text: 'text-indigo-600 dark:text-indigo-400',
            ring: 'stroke-indigo-600',
            pill: 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/70',
        },
        emerald: {
            bar: 'bg-emerald-500',
            gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
            glow: 'rgba(16, 185, 129, 0.5)',
            text: 'text-emerald-600 dark:text-emerald-400',
            ring: 'stroke-emerald-500',
            pill: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/70',
        },
        purple: {
            bar: 'bg-purple-600',
            gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
            glow: 'rgba(168, 85, 247, 0.5)',
            text: 'text-purple-600 dark:text-purple-400',
            ring: 'stroke-purple-600',
            pill: 'border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/70',
        },
        amber: {
            bar: 'bg-amber-500',
            gradient: 'from-amber-400 via-orange-500 to-rose-500',
            glow: 'rgba(245, 158, 11, 0.5)',
            text: 'text-amber-600 dark:text-amber-400',
            ring: 'stroke-amber-500',
            pill: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/70',
        },
        rose: {
            bar: 'bg-rose-500',
            gradient: 'from-rose-500 via-red-500 to-orange-500',
            glow: 'rgba(244, 63, 94, 0.5)',
            text: 'text-rose-600 dark:text-rose-400',
            ring: 'stroke-rose-500',
            pill: 'border-rose-200 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/70',
        },
        cyan: {
            bar: 'bg-cyan-500',
            gradient: 'from-cyan-400 via-sky-500 to-blue-600',
            glow: 'rgba(6, 182, 212, 0.5)',
            text: 'text-cyan-600 dark:text-cyan-400',
            ring: 'stroke-cyan-500',
            pill: 'border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/80 dark:bg-cyan-950/70',
        },
        rainbow: {
            bar: 'bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500',
            gradient: 'from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-500',
            glow: 'rgba(236, 72, 153, 0.5)',
            text: 'text-purple-600 dark:text-purple-400',
            ring: 'stroke-purple-500',
            pill: 'border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90',
        },
    };
    return themes[props.colorTheme] || themes.default;
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

    if (props.variant === 'glass') {
        return `${themeColors.value.bar} opacity-80 backdrop-blur-md`;
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
        const glowColor = props.color || themeColors.value.glow;
        style.boxShadow = `0 0 10px ${glowColor}, 0 0 5px ${glowColor}`;
    }

    return style;
});

// Efek bayangan NProgress peg di ujung kanan bar
const pegStyle = computed(() => {
    if (!props.peg) return {};
    const col = props.color || activeColor.value || '#4B5563';
    return {
        boxShadow: `0 0 12px ${col}, 0 0 6px ${col}`,
        transform: 'rotate(3deg) translate(0px, -4px)',
    };
});

// Track style
const trackFillClass = computed(() => {
    if (props.trackColor) return props.trackColor;
    if (!props.track || props.type === 'minimal') return 'bg-transparent';
    return 'bg-zinc-200/50 dark:bg-zinc-800/50';
});

// Posisi bar
const positionClass = computed(() => {
    // 1. Mode Inline / Relative (untuk preview, kartu komponen, atau diletakkan di dalam kontainer flex/grid)
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
    // Jika fixed=false dan posisi bukan salah satu koordinat sudut layar eksplisit, render inline agar tidak lari ke pojok layar
    if (!props.fixed && !['bottom-right', 'bottom-left', 'top-right', 'top-left', 'bottom-center'].includes(props.position)) {
        return 'relative inline-flex';
    }

    switch (props.position) {
        case 'bottom-left':
            return `${isFixed} bottom-6 left-6`;
        case 'top-right':
            return `${isFixed} top-6 right-6`;
        case 'top-left':
            return `${isFixed} top-6 left-6`;
        case 'bottom-center':
            return `${isFixed} bottom-6 left-1/2 -translate-x-1/2`;
        case 'bottom-right':
        default:
            return `${isFixed} bottom-6 right-6`;
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

// Palet Solid & Soft Background Maps
const solidBgMap = {
    default: 'bg-slate-900 dark:bg-slate-800 text-white',
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
    default: 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
    dark: 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
    primary: 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    purple: 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    amber: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
    rainbow: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
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

// Visibilitas Icon & Text pada Circular
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
        'group relative flex items-center justify-center rounded-full transition-all duration-200 select-none',
        isClickable.value ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default',
    ];

    if (props.variant === 'solid') {
        if (!props.color) {
            classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
        }
        classes.push('shadow-lg');
    } else if (props.variant === 'soft') {
        classes.push(softBgMap[props.colorTheme] || softBgMap.default, 'shadow-md');
    } else if (props.variant === 'surface' || props.variant === 'outline') {
        classes.push('bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md');
    } else if (props.variant === 'gradient') {
        classes.push(`bg-gradient-to-br ${themeColors.value.gradient} text-white shadow-lg`);
    } else if (props.variant === 'glass') {
        classes.push('bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg');
    } else {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default, 'shadow-lg');
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

    return style;
});

// SVG Circular Track Class
const circularTrackClass = computed(() => {
    if (props.trackColor) return props.trackColor;
    if (props.variant === 'solid') {
        return 'stroke-white/25';
    }
    if (props.variant === 'gradient') {
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
        'group flex items-center gap-2.5 px-3.5 py-2 rounded-full transition-all duration-200 select-none',
        isClickable.value ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default',
    ];

    if (props.variant === 'solid') {
        if (!props.color) {
            classes.push(solidBgMap[props.colorTheme] || solidBgMap.default);
        }
        classes.push('shadow-lg');
    } else if (props.variant === 'soft') {
        classes.push(softBgMap[props.colorTheme] || softBgMap.default, 'shadow-md');
    } else if (props.variant === 'surface' || props.variant === 'outline') {
        classes.push('bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-md');
    } else {
        classes.push(solidBgMap[props.colorTheme] || solidBgMap.default, 'shadow-lg');
    }

    return classes.join(' ');
});

const floatingPillStyle = computed(() => {
    const style = {};
    if (props.variant === 'solid' && props.color) {
        style.backgroundColor = props.color;
        style.color = '#ffffff';
    }
    return style;
});
</script>

<template>
    <!-- MODE 1, 4, & INERTIA: LINEAR TOP BAR (PERSIS SEPERTI APP.JS / NPROGRESS) -->
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
                <!-- Inertia / NProgress Signature Peg (Glow Shadow di Ujung Bar) -->
                <div
                    v-if="peg && currentProgress > 0 && !isVertical"
                    class="absolute right-0 top-0 w-24 h-full pointer-events-none opacity-100"
                    :style="pegStyle"
                />

                <!-- Percentage Inside Bar -->
                <span
                    v-if="showPercentage && percentagePosition === 'inside' && !isVertical"
                    class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white leading-none select-none drop-shadow-sm"
                >
                    <slot name="percentage" :progress="currentProgress">
                        {{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}
                    </slot>
                </span>

                <!-- Head Indicator Opsional (Dot / Pulse / Glow Spark / Icon) -->
                <div
                    v-if="headIndicator !== 'none' && currentProgress > 0"
                    :class="[
                        'absolute flex items-center justify-center transition-all duration-75',
                        isVertical
                            ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
                            : 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
                    ]"
                >
                    <!-- Dot -->
                    <span
                        v-if="headIndicator === 'dot'"
                        class="w-2.5 h-2.5 rounded-full bg-white shadow-md border border-neutral-300 dark:border-neutral-700"
                    />

                    <!-- Pulse Radar -->
                    <span v-else-if="headIndicator === 'pulse'" class="relative flex h-3 w-3">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                        />
                        <span
                            class="relative inline-flex rounded-full h-3 w-3 bg-white shadow-md border border-neutral-200"
                        />
                    </span>

                    <!-- Glow Spark -->
                    <span
                        v-else-if="headIndicator === 'glow-spark'"
                        class="w-3.5 h-3.5 rounded-full bg-white blur-[1px] shadow-[0_0_10px_2px_rgba(255,255,255,0.9)]"
                    />

                    <!-- Moving Icon -->
                    <span
                        v-else-if="headIndicator === 'icon'"
                        class="w-5 h-5 rounded-full bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center border border-neutral-200 dark:border-neutral-700"
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

                <!-- Follower Badge (Persentase Melayang Mengikuti Ujung Bar) -->
                <div
                    v-if="showPercentage && percentagePosition === 'follower' && !isVertical"
                    class="absolute -top-7 right-0 translate-x-1/2 px-1.5 py-0.5 rounded bg-neutral-900/90 dark:bg-neutral-100/90 text-white dark:text-neutral-900 text-[10px] font-bold shadow-md pointer-events-none backdrop-blur-sm select-none"
                >
                    <slot name="percentage" :progress="currentProgress">
                        {{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}
                    </slot>
                </div>
            </div>
        </div>

        <!-- Inertia NProgress Spinner (Pojok Kanan Atas) -->
        <div
            v-if="showSpinner"
            :class="[
                'fixed top-3.5 right-4 pointer-events-none transition-all duration-300 z-[99999]',
                (isScrolling || currentProgress > 0) ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
            ]"
        >
            <div
                class="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                :style="{
                    borderTopColor: color || activeColor || '#4B5563',
                    borderLeftColor: color || activeColor || '#4B5563',
                }"
            />
        </div>
    </div>

    <!-- MODE 2: FLOATING PILL BADGE (SOLID, SURFACE & SOFT) -->
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
            <div
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                :class="variant === 'solid' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'"
            >
                <slot name="icon" :is-complete="isComplete">
                    <span
                        class="material-symbols-outlined text-[15px] leading-none"
                    >
                        {{ activeIcon }}
                    </span>
                </slot>
            </div>

            <div class="flex flex-col text-left">
                <div class="flex items-center gap-2">
                    <span
                        v-if="label"
                        class="text-[11px] font-semibold hidden sm:inline"
                        :class="variant === 'solid' ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
                    >
                        {{ label }}
                    </span>

                    <span
                        v-if="showReadingTime && readingTimeRemaining > 0"
                        class="text-[10px] font-normal"
                        :class="variant === 'solid' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'"
                    >
                        ~{{ readingTimeRemaining }} mnt
                    </span>

                    <span
                        v-if="showPercentage"
                        class="text-xs font-black leading-none"
                        :class="variant === 'solid' ? 'text-white' : 'text-slate-900 dark:text-white'"
                    >
                        <slot name="percentage" :progress="currentProgress">
                            {{ prefix }}{{ Math.round(currentProgress) }}{{ suffix }}
                        </slot>
                    </span>
                </div>

                <div
                    class="w-20 h-1 mt-1 rounded-full overflow-hidden"
                    :class="variant === 'solid' ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'"
                >
                    <div
                        class="h-full rounded-full transition-[width] duration-75 ease-out"
                        :class="variant === 'solid' ? 'bg-white' : themeColors.bar"
                        :style="{ width: `${currentProgress}%` }"
                    />
                </div>
            </div>
        </button>
    </div>

    <!-- MODE 3: CIRCULAR SVG RING (WITH BACK-TO-TOP & SOLID ICON + TEKS) -->
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
                <circle
                    :cx="circleSize / 2"
                    :cy="circleSize / 2"
                    :r="radius"
                    :stroke-width="strokeWidth"
                    fill="transparent"
                    :class="[circularTrackClass, 'transition-colors']"
                />

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

            <!-- KONTEN GABUNGAN ICON + TEKS (SOLID, TERPUSAT, BERSIH) -->
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
                        class="font-black leading-none tracking-tight"
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
