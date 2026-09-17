<script setup>
import { ref, computed, useId, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    // Core Props (Backward Compatible)
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
    variant: {
        type: String,
        default: 'default', // 'default', 'bordered', 'elevated', 'flat', 'glass', 'gradient', 'accent'
        validator: (val) => ['default', 'bordered', 'elevated', 'flat', 'glass', 'gradient', 'accent'].includes(val),
    },
    padding: {
        type: String,
        default: 'md', // 'none', 'xs', 'sm', 'md', 'lg', 'xl'
        validator: (val) => ['none', 'xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: '2xl', // 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    collapsible: {
        type: Boolean,
        default: false,
    },
    collapsed: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    hoverable: {
        type: Boolean,
        default: false,
    },
    clickable: {
        type: Boolean,
        default: false,
    },
    showHeader: {
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
    overflow: {
        type: String,
        default: 'visible', // 'visible', 'hidden', 'auto', 'scroll'
        validator: (val) => ['visible', 'hidden', 'auto', 'scroll'].includes(val),
    },

    // 5 Pilar Tambahan: Mode / Tipe Kartu
    type: {
        type: String,
        default: 'default', // 'default', 'product', 'slider', 'flip'
        validator: (val) => ['default', 'product', 'slider', 'flip'].includes(val),
    },
    colorTheme: {
        type: String,
        default: 'default', // 'default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
        validator: (val) => ['default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(val),
    },
    glow: {
        type: Boolean,
        default: false,
    },
    accentBorder: {
        type: String,
        default: 'none', // 'none', 'top', 'left', 'bottom'
        validator: (val) => ['none', 'top', 'left', 'bottom'].includes(val),
    },
    iconVariant: {
        type: String,
        default: 'subtle', // 'subtle', 'solid', 'outline', 'none'
        validator: (val) => ['subtle', 'solid', 'outline', 'none'].includes(val),
    },
    iconColor: {
        type: String,
        default: '',
    },
    badge: {
        type: String,
        default: '',
    },
    badgeColor: {
        type: String,
        default: '',
    },
    badgeVariant: {
        type: String,
        default: 'soft', // 'soft', 'solid', 'outline'
        validator: (val) => ['soft', 'solid', 'outline'].includes(val),
    },

    // Inovasi: Interactive Spotlight & 3D Tilt
    spotlight: {
        type: Boolean,
        default: false,
    },
    tilt: {
        type: Boolean,
        default: false,
    },
    maxTilt: {
        type: Number,
        default: 8,
    },

    // Fitur Khusus: Product Card (type === 'product')
    image: {
        type: String,
        default: '',
    },
    hoverImage: {
        type: String,
        default: '',
    },
    imageAlt: {
        type: String,
        default: 'Product Image',
    },
    imageAspectRatio: {
        type: String,
        default: 'square', // 'square', 'video', 'tall', 'wide'
        validator: (val) => ['square', 'video', 'tall', 'wide'].includes(val),
    },
    category: {
        type: String,
        default: '',
    },
    price: {
        type: [String, Number],
        default: '',
    },
    originalPrice: {
        type: [String, Number],
        default: '',
    },
    discount: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviewCount: {
        type: [Number, String],
        default: 0,
    },
    stock: {
        type: Number,
        default: null,
    },
    maxStock: {
        type: Number,
        default: 100,
    },
    stockLabel: {
        type: String,
        default: '',
    },
    colors: {
        type: Array,
        default: () => [],
    },
    selectedColor: {
        type: [String, Object],
        default: null,
    },
    wishlistable: {
        type: Boolean,
        default: false,
    },
    isWishlisted: {
        type: Boolean,
        default: false,
    },
    countdown: {
        type: [String, Number],
        default: '',
    },
    actionText: {
        type: String,
        default: '+ Keranjang',
    },
    actionIcon: {
        type: String,
        default: 'shopping_bag',
    },
    actionLoading: {
        type: Boolean,
        default: false,
    },

    // Fitur Khusus: Card Slider (type === 'slider')
    slides: {
        type: Array,
        default: () => [],
    },
    autoplay: {
        type: Boolean,
        default: false,
    },
    autoplayInterval: {
        type: Number,
        default: 4000,
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
        default: 'sides', // 'sides', 'header', 'bottom'
        validator: (val) => ['sides', 'header', 'bottom'].includes(val),
    },
    showIndicators: {
        type: Boolean,
        default: true,
    },
    showCounter: {
        type: Boolean,
        default: false,
    },
    loop: {
        type: Boolean,
        default: true,
    },

    // Fitur Khusus: 3D Flip Card (type === 'flip')
    flipped: {
        type: Boolean,
        default: false,
    },
    flipOnHover: {
        type: Boolean,
        default: false,
    },
    flipTriggerButton: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits([
    'click',
    'update:collapsed',
    'update:wishlisted',
    'wishlist',
    'quick-view',
    'add-to-cart',
    'select-color',
    'slide-change',
    'update:flipped',
    'flip',
]);

const cardRef = ref(null);
const contentId = useId();

// --- STATE COLLAPSIBLE ---
const isCollapsed = ref(props.collapsed);
watch(() => props.collapsed, (val) => {
    isCollapsed.value = val;
});
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    emit('update:collapsed', isCollapsed.value);
};

// --- STATE PRODUCT WISHLIST & COLOR ---
const internalWishlisted = ref(props.isWishlisted);
watch(() => props.isWishlisted, (val) => {
    internalWishlisted.value = val;
});
const toggleWishlist = (e) => {
    e?.stopPropagation();
    internalWishlisted.value = !internalWishlisted.value;
    emit('update:wishlisted', internalWishlisted.value);
    emit('wishlist', internalWishlisted.value);
};

const activeColor = ref(props.selectedColor || (props.colors.length > 0 ? props.colors[0] : null));
const handleColorSelect = (c, e) => {
    e?.stopPropagation();
    activeColor.value = c;
    emit('select-color', c);
};

// --- STATE PRODUCT IMAGE HOVER SWAP ---
const isImageHovered = ref(false);

// --- STATE COUNTDOWN TIMER ---
const countdownDisplay = ref('');
let countdownTimer = null;

const initCountdown = () => {
    if (!props.countdown) return;

    const updateTimer = () => {
        let diff = 0;
        if (typeof props.countdown === 'number') {
            diff = props.countdown;
        } else {
            const targetDate = new Date(props.countdown).getTime();
            const now = new Date().getTime();
            diff = Math.max(0, Math.floor((targetDate - now) / 1000));
        }

        if (diff <= 0) {
            countdownDisplay.value = '00:00:00';
            if (countdownTimer) clearInterval(countdownTimer);
            return;
        }

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        countdownDisplay.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateTimer();
    countdownTimer = setInterval(updateTimer, 1000);
};

// --- STATE SPOTLIGHT & 3D TILT ---
const spotlightPos = ref({ x: 0, y: 0, opacity: 0 });
const tiltTransform = ref('');

const handleMouseMove = (e) => {
    if (!cardRef.value) return;
    const rect = cardRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (props.spotlight) {
        spotlightPos.value = { x, y, opacity: 1 };
    }

    if (props.tilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -props.maxTilt;
        const rotateY = ((x - centerX) / centerX) * props.maxTilt;
        tiltTransform.value = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    }
};

const handleMouseLeave = () => {
    if (props.spotlight) {
        spotlightPos.value.opacity = 0;
    }
    if (props.tilt) {
        tiltTransform.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (props.hoverImage) {
        isImageHovered.value = false;
    }
};

// --- STATE CARD SLIDER ---
const currentSlide = ref(0);
let autoplayTimer = null;
let touchStartX = 0;
let touchEndX = 0;

const totalSlides = computed(() => {
    return props.slides.length > 0 ? props.slides.length : 1;
});

const nextSlide = (e) => {
    e?.stopPropagation();
    if (currentSlide.value < totalSlides.value - 1) {
        currentSlide.value++;
    } else if (props.loop) {
        currentSlide.value = 0;
    }
    emit('slide-change', currentSlide.value);
};

const prevSlide = (e) => {
    e?.stopPropagation();
    if (currentSlide.value > 0) {
        currentSlide.value--;
    } else if (props.loop) {
        currentSlide.value = totalSlides.value - 1;
    }
    emit('slide-change', currentSlide.value);
};

const goToSlide = (idx, e) => {
    e?.stopPropagation();
    currentSlide.value = idx;
    emit('slide-change', idx);
};

const startAutoplay = () => {
    if (props.type === 'slider' && props.autoplay && !autoplayTimer && totalSlides.value > 1) {
        autoplayTimer = setInterval(() => {
            nextSlide();
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
    if (props.type !== 'slider') return;
    touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
    if (props.type !== 'slider') return;
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
};

// --- STATE 3D FLIP CARD ---
const isCardFlipped = ref(props.flipped);
watch(() => props.flipped, (val) => {
    isCardFlipped.value = val;
});
const toggleFlip = (e) => {
    e?.stopPropagation();
    isCardFlipped.value = !isCardFlipped.value;
    emit('update:flipped', isCardFlipped.value);
    emit('flip', isCardFlipped.value);
};

// Lifecycle
onMounted(() => {
    initCountdown();
    startAutoplay();
});

onBeforeUnmount(() => {
    if (countdownTimer) clearInterval(countdownTimer);
    stopAutoplay();
});

// Click card general
const handleClick = (e) => {
    if (props.clickable) {
        emit('click', e);
    }
};

// --- COMPUTED STYLES & CLASSES ---
const themePresets = {
    default: {
        border: 'border-slate-200/80 dark:border-slate-800',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-slate-400 dark:border-t-slate-500',
        accentLeft: 'border-l-4 border-l-slate-400 dark:border-l-slate-500',
        accentBottom: 'border-b-4 border-b-slate-400 dark:border-b-slate-500',
        iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        glow: 'shadow-[0_10px_35px_-10px_rgba(100,116,139,0.2)]',
        spotlight: 'rgba(148, 163, 184, 0.15)',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        textAccent: 'text-slate-900 dark:text-white',
    },
    primary: {
        border: 'border-blue-200/80 dark:border-blue-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-blue-600 dark:border-t-blue-500',
        accentLeft: 'border-l-4 border-l-blue-600 dark:border-l-blue-500',
        accentBottom: 'border-b-4 border-b-blue-600 dark:border-b-blue-500',
        iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(37,99,235,0.25)]',
        spotlight: 'rgba(59, 130, 246, 0.16)',
        badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40',
        textAccent: 'text-blue-600 dark:text-blue-400',
    },
    indigo: {
        border: 'border-indigo-200/80 dark:border-indigo-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-indigo-600 dark:border-t-indigo-500',
        accentLeft: 'border-l-4 border-l-indigo-600 dark:border-l-indigo-500',
        accentBottom: 'border-b-4 border-b-indigo-600 dark:border-b-indigo-500',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(79,70,229,0.25)]',
        spotlight: 'rgba(99, 102, 241, 0.16)',
        badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40',
        textAccent: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
        border: 'border-emerald-200/80 dark:border-emerald-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-emerald-600 dark:border-t-emerald-500',
        accentLeft: 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500',
        accentBottom: 'border-b-4 border-b-emerald-600 dark:border-b-emerald-500',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(5,150,105,0.25)]',
        spotlight: 'rgba(16, 185, 129, 0.16)',
        badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
    },
    purple: {
        border: 'border-purple-200/80 dark:border-purple-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-purple-600 dark:border-t-purple-500',
        accentLeft: 'border-l-4 border-l-purple-600 dark:border-l-purple-500',
        accentBottom: 'border-b-4 border-b-purple-600 dark:border-b-purple-500',
        iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(147,51,234,0.25)]',
        spotlight: 'rgba(168, 85, 247, 0.16)',
        badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40',
        textAccent: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
        border: 'border-amber-200/80 dark:border-amber-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-amber-500 dark:border-t-amber-400',
        accentLeft: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
        accentBottom: 'border-b-4 border-b-amber-500 dark:border-b-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(217,119,6,0.25)]',
        spotlight: 'rgba(245, 158, 11, 0.16)',
        badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
        textAccent: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
        border: 'border-rose-200/80 dark:border-rose-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-rose-600 dark:border-t-rose-500',
        accentLeft: 'border-l-4 border-l-rose-600 dark:border-l-rose-500',
        accentBottom: 'border-b-4 border-b-rose-600 dark:border-b-rose-500',
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(225,29,72,0.25)]',
        spotlight: 'rgba(244, 63, 94, 0.16)',
        badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40',
        textAccent: 'text-rose-600 dark:text-rose-400',
    },
    cyan: {
        border: 'border-cyan-200/80 dark:border-cyan-900/60',
        bg: 'bg-white dark:bg-slate-900',
        accentTop: 'border-t-4 border-t-cyan-500 dark:border-t-cyan-400',
        accentLeft: 'border-l-4 border-l-cyan-500 dark:border-l-cyan-400',
        accentBottom: 'border-b-4 border-b-cyan-500 dark:border-b-cyan-400',
        iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
        glow: 'shadow-[0_10px_35px_-10px_rgba(6,182,212,0.25)]',
        spotlight: 'rgba(6, 182, 212, 0.16)',
        badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40',
        textAccent: 'text-cyan-600 dark:text-cyan-400',
    },
    dark: {
        border: 'border-slate-800 dark:border-slate-700',
        bg: 'bg-slate-900 dark:bg-black',
        accentTop: 'border-t-4 border-t-slate-700 dark:border-t-slate-400',
        accentLeft: 'border-l-4 border-l-slate-700 dark:border-l-slate-400',
        accentBottom: 'border-b-4 border-b-slate-700 dark:border-b-slate-400',
        iconBg: 'bg-slate-800 text-slate-200',
        glow: 'shadow-[0_10px_35px_-10px_rgba(15,23,42,0.4)]',
        spotlight: 'rgba(255, 255, 255, 0.1)',
        badge: 'bg-slate-800 text-slate-200 border border-slate-700',
        textAccent: 'text-white',
    },
};

const currentTheme = computed(() => themePresets[props.colorTheme] || themePresets.default);

const variantClasses = computed(() => {
    const theme = currentTheme.value;
    switch (props.variant) {
        case 'bordered':
            return `bg-white dark:bg-slate-900 border ${theme.border}`;
        case 'elevated':
            return `bg-white dark:bg-slate-900 border ${theme.border} shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60`;
        case 'flat':
            return 'bg-slate-100/70 dark:bg-slate-800/60 border border-transparent';
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60 shadow-lg';
        case 'gradient':
            return `bg-gradient-to-br from-white via-slate-50 to-slate-100/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border ${theme.border} shadow-sm`;
        case 'accent':
            return `bg-slate-50/70 dark:bg-slate-900/70 border ${theme.border}`;
        case 'default':
        default:
            return `bg-white dark:bg-slate-900 border ${theme.border} shadow-xs`;
    }
});

const accentBorderClasses = computed(() => {
    const theme = currentTheme.value;
    switch (props.accentBorder) {
        case 'top': return theme.accentTop;
        case 'left': return theme.accentLeft;
        case 'bottom': return theme.accentBottom;
        default: return '';
    }
});

const paddingClasses = computed(() => {
    switch (props.padding) {
        case 'none': return 'p-0';
        case 'xs': return 'p-2.5';
        case 'sm': return 'p-3.5';
        case 'lg': return 'p-6 sm:p-7';
        case 'xl': return 'p-7 sm:p-9';
        case 'md':
        default: return 'p-4 sm:p-5';
    }
});

const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case '3xl': return 'rounded-3xl';
        case 'full': return 'rounded-4xl';
        case '2xl':
        default: return 'rounded-2xl';
    }
});

const imageAspectClass = computed(() => {
    switch (props.imageAspectRatio) {
        case 'video': return 'aspect-video';
        case 'tall': return 'aspect-[3/4]';
        case 'wide': return 'aspect-[16/9]';
        case 'square':
        default: return 'aspect-square';
    }
});

const hasHeader = computed(() => {
    return props.showHeader && (props.title || props.icon || props.badge || props.collapsible || props.type === 'slider');
});

// Stock calculation for product
const stockPercentage = computed(() => {
    if (props.stock === null) return 0;
    return Math.min(100, Math.max(0, (props.stock / props.maxStock) * 100));
});
</script>

<template>
    <!-- FLIP CARD WRAPPER (type === 'flip') -->
    <div
        v-if="type === 'flip'"
        class="perspective-1000 w-full transition-transform duration-300"
        :class="clickable ? 'cursor-pointer' : ''"
        @click="flipOnHover ? null : toggleFlip($event)"
        @mouseenter="flipOnHover ? isCardFlipped = true : null"
        @mouseleave="flipOnHover ? isCardFlipped = false : null"
    >
        <div
            class="relative w-full transition-transform duration-500 transform-style-preserve-3d"
            :class="isCardFlipped ? 'rotate-y-180' : ''"
        >
            <!-- FRONT SIDE -->
            <div
                class="w-full backface-hidden"
                :class="[
                    variantClasses,
                    roundedClasses,
                    accentBorderClasses,
                    glow ? currentTheme.glow : '',
                    overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible',
                ]"
            >
                <slot name="front">
                    <!-- Standard front content fallback -->
                    <div :class="paddingClasses">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <span v-if="icon" class="material-symbols-outlined text-lg" :class="iconColor || currentTheme.textAccent">
                                    {{ icon }}
                                </span>
                                <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ title || 'Kartu Depan' }}</h3>
                            </div>
                            <span v-if="badge" class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="currentTheme.badge">
                                {{ badge }}
                            </span>
                        </div>
                        <slot />
                        <div v-if="flipTriggerButton" class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                @click.stop="toggleFlip"
                                class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                                <span>Lihat Detail / Balik</span>
                                <span class="material-symbols-outlined text-sm">cached</span>
                            </button>
                        </div>
                    </div>
                </slot>
            </div>

            <!-- BACK SIDE -->
            <div
                class="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
                :class="[
                    variantClasses,
                    roundedClasses,
                    accentBorderClasses,
                    glow ? currentTheme.glow : '',
                    overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible',
                ]"
            >
                <slot name="back">
                    <div :class="paddingClasses" class="h-full flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-bold text-slate-900 dark:text-white text-base">Informasi Detail</h3>
                                <button
                                    type="button"
                                    @click.stop="toggleFlip"
                                    class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <span class="material-symbols-outlined text-base">close</span>
                                </button>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Konten sisi belakang kartu untuk spesifikasi teknis, barcode transaksi, atau rincian tambahan.
                            </p>
                        </div>
                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                @click.stop="toggleFlip"
                                class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">arrow_back</span>
                                <span>Kembali ke Depan</span>
                            </button>
                        </div>
                    </div>
                </slot>
            </div>
        </div>
    </div>

    <!-- MAIN CARD CONTAINER (Default, Product, Slider) -->
    <div
        v-else
        ref="cardRef"
        :class="[
            variantClasses,
            roundedClasses,
            accentBorderClasses,
            type === 'product' ? 'overflow-hidden' : (overflow === 'hidden' ? 'overflow-hidden' : (overflow === 'auto' ? 'overflow-auto' : 'overflow-visible')),
            glow ? currentTheme.glow : '',
            'relative transition-all duration-250',
            collapsible && isCollapsed ? 'h-fit self-start' : '',
            hoverable ? 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-950/80 hover:border-slate-300 dark:hover:border-slate-700' : '',
            clickable ? 'cursor-pointer active:scale-[0.99]' : '',
        ]"
        :style="tilt ? { transform: tiltTransform, transition: tiltTransform ? 'transform 0.08s ease-out' : 'transform 0.4s ease' } : {}"
        @click="handleClick"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
    >
        <!-- SPOTLIGHT OVERLAY -->
        <div
            v-if="spotlight"
            class="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-[inherit]"
            :style="{
                opacity: spotlightPos.opacity,
                background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${currentTheme.spotlight}, transparent 80%)`,
            }"
        />

        <!-- ================= PRODUCT CARD MODE (type === 'product') ================= -->
        <div v-if="type === 'product'" class="relative z-1 flex flex-col h-full group/product">
            <!-- Product Media / Image Showcase -->
            <div
                class="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80"
                :class="[
                    imageAspectClass,
                    rounded === 'none' ? 'rounded-none' : 'rounded-t-[inherit]',
                ]"
                @mouseenter="hoverImage ? isImageHovered = true : null"
                @mouseleave="hoverImage ? isImageHovered = false : null"
            >
                <slot name="media">
                    <template v-if="image">
                        <!-- Primary Product Image (Smooth Zoom) -->
                        <img
                            :src="image"
                            :alt="imageAlt"
                            class="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover/product:scale-105"
                            :class="hoverImage ? 'opacity-100 group-hover/product:opacity-0' : ''"
                            loading="lazy"
                        />
                        <!-- Secondary Hover Image (Smooth Crossfade Zoom) -->
                        <img
                            v-if="hoverImage"
                            :src="hoverImage"
                            :alt="`${imageAlt} - preview`"
                            class="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover/product:opacity-100 scale-100 group-hover/product:scale-105 transition-all duration-700 ease-out"
                            loading="lazy"
                        />
                    </template>
                    <div v-else class="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <span class="material-symbols-outlined text-4xl">image</span>
                    </div>
                </slot>

                <!-- Soft Vignette Gradient on Hover -->
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 opacity-0 group-hover/product:opacity-100 transition-opacity duration-300" />

                <!-- Floating Badges (Top-Left) -->
                <div class="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center">
                    <span
                        v-if="discount"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-600/30 tracking-tight leading-none"
                    >
                        <span class="material-symbols-outlined text-xs leading-none">local_offer</span>
                        <span>{{ discount }}</span>
                    </span>
                    <span
                        v-if="badge"
                        class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs border border-white/20 dark:border-white/10 leading-none"
                        :class="badgeColor || currentTheme.badge"
                    >
                        {{ badge }}
                    </span>
                </div>

                <!-- Floating Wishlist (Top-Right) -->
                <div class="absolute top-3 right-3 z-10">
                    <button
                        v-if="wishlistable"
                        type="button"
                        @click.stop="toggleWishlist"
                        class="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110 active:scale-90 border border-white/60 dark:border-slate-700/60 transition-all duration-200 cursor-pointer"
                        :title="internalWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'"
                    >
                        <span
                            class="material-symbols-outlined text-lg leading-none transition-colors"
                            :class="internalWishlisted ? 'text-rose-500 fill-current' : ''"
                            :style="internalWishlisted ? 'font-variation-settings: \'FILL\' 1;' : ''"
                        >
                            favorite
                        </span>
                    </button>
                </div>

                <!-- Floating Quick View Pill Button (Bottom/Center on Media Hover) -->
                <div
                    v-if="$slots['quick-action'] || $attrs['onQuick-view']"
                    class="absolute inset-x-0 bottom-3.5 z-20 flex items-center justify-center opacity-0 translate-y-2 group-hover/product:opacity-100 group-hover/product:translate-y-0 transition-all duration-300 ease-out pointer-events-none"
                >
                    <slot name="quick-action">
                        <button
                            type="button"
                            @click.stop="emit('quick-view')"
                            class="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md shadow-xl border border-white/60 dark:border-slate-700/60 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                        >
                            <span class="material-symbols-outlined text-sm leading-none text-blue-600 dark:text-blue-400">visibility</span>
                            <span>Pratinjau Cepat</span>
                        </button>
                    </slot>
                </div>

                <!-- Flash Sale Floating HUD Pill (Bottom Media) -->
                <div
                    v-if="countdown && countdownDisplay"
                    class="absolute bottom-3 inset-x-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/85 dark:bg-black/85 backdrop-blur-md text-white border border-white/10 shadow-lg flex items-center justify-between transition-opacity duration-200"
                    :class="($slots['quick-action'] || $attrs['onQuick-view']) ? 'group-hover/product:opacity-0 pointer-events-none' : ''"
                >
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm animate-pulse text-amber-400 leading-none">bolt</span>
                        <span class="tracking-wider text-[10px] font-black uppercase text-amber-300">Flash Sale</span>
                    </div>
                    <div class="font-mono text-xs font-black tracking-widest bg-white/10 px-2 py-0.5 rounded-md border border-white/10 text-white leading-none">
                        {{ countdownDisplay }}
                    </div>
                </div>
            </div>

            <!-- Product Details Body -->
            <div :class="paddingClasses" class="flex-1 flex flex-col justify-between gap-3">
                <div class="space-y-2">
                    <!-- Category / Brand & Top Star Micro-Rating -->
                    <div class="flex items-center justify-between gap-2">
                        <span v-if="category" class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                            {{ category }}
                        </span>
                        <span v-else class="text-[11px] text-transparent select-none">.</span>

                        <!-- Rating Micro-Badge -->
                        <div
                            v-if="rating > 0"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-200/60 dark:border-amber-900/40 shrink-0"
                        >
                            <span
                                class="material-symbols-outlined text-[13px] leading-none fill-current"
                                style="font-variation-settings: 'FILL' 1;"
                            >
                                star
                            </span>
                            <span>{{ Number(rating).toFixed(1) }}</span>
                            <span v-if="reviewCount" class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({{ reviewCount }})</span>
                        </div>
                    </div>

                    <!-- Title -->
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover/product:text-blue-600 dark:group-hover/product:text-blue-400 transition-colors tracking-tight">
                        <slot name="title">{{ title }}</slot>
                    </h3>

                    <!-- Subtitle / Description -->
                    <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {{ subtitle }}
                    </p>

                    <!-- Interactive Color Swatches -->
                    <div v-if="colors && colors.length > 0" class="flex items-center gap-2 pt-0.5">
                        <span class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Warna:</span>
                        <div class="flex items-center gap-1.5">
                            <button
                                v-for="(c, idx) in colors"
                                :key="idx"
                                type="button"
                                @click="handleColorSelect(c, $event)"
                                class="w-4.5 h-4.5 rounded-full border transition-all duration-200 cursor-pointer relative"
                                :class="[
                                    (activeColor === c || activeColor?.hex === c || activeColor?.hex === c?.hex)
                                        ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-900 scale-110 border-white dark:border-slate-800'
                                        : 'border-slate-300 dark:border-slate-700 opacity-75 hover:opacity-100 hover:scale-105'
                                ]"
                                :style="{ backgroundColor: typeof c === 'string' ? c : c.hex }"
                                :title="typeof c === 'string' ? c : (c.name || c.hex)"
                            />
                        </div>
                    </div>
                </div>

                <!-- Price, Stock & Action Footer -->
                <div class="pt-2.5 space-y-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <!-- Urgency Stock Bar -->
                    <div v-if="stock !== null" class="space-y-1">
                        <div class="flex justify-between items-center text-[11px]">
                            <span
                                class="flex items-center gap-1 font-semibold"
                                :class="stock <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'"
                            >
                                <span v-if="stock <= 5" class="material-symbols-outlined text-[13px] leading-none animate-pulse">local_fire_department</span>
                                <span>{{ stockLabel || (stock <= 5 ? 'Hampir Habis!' : 'Stok Tersedia') }}</span>
                            </span>
                            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px]">{{ stock }} tersisa</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                class="h-full rounded-full transition-all duration-500"
                                :class="stock <= 5 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'"
                                :style="{ width: `${stockPercentage}%` }"
                            />
                        </div>
                    </div>

                    <!-- Price & CTA Button -->
                    <div class="flex items-center justify-between gap-3 pt-0.5">
                        <div class="min-w-0">
                            <span
                                v-if="originalPrice"
                                class="block text-[11px] text-slate-400 dark:text-slate-500 line-through font-mono font-medium leading-none mb-1"
                            >
                                {{ originalPrice }}
                            </span>
                            <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono leading-none">
                                {{ price }}
                            </span>
                        </div>

                        <slot name="actions">
                            <button
                                v-if="actionText"
                                type="button"
                                @click.stop="emit('add-to-cart')"
                                :disabled="actionLoading"
                                class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all duration-200 cursor-pointer shrink-0 shadow-sm shadow-blue-600/25 hover:shadow-blue-600/40"
                            >
                                <span v-if="actionLoading" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                <span v-else-if="actionIcon" class="material-symbols-outlined text-sm leading-none">{{ actionIcon }}</span>
                                <span>{{ actionText }}</span>
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= SLIDER CARD MODE (type === 'slider') ================= -->
        <div v-else-if="type === 'slider'" class="relative z-1 flex flex-col h-full">
            <!-- Slider Header with Optional Controls -->
            <div
                v-if="hasHeader || controlsPosition === 'header'"
                class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80"
            >
                <div class="flex items-center gap-2.5 min-w-0">
                    <span
                        v-if="icon"
                        class="material-symbols-outlined text-lg leading-none shrink-0 select-none"
                        :class="iconColor || currentTheme.textAccent"
                    >
                        {{ icon }}
                    </span>
                    <div v-if="title" class="min-w-0">
                        <h3 class="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
                            {{ title }}
                        </h3>
                        <p v-if="subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                            {{ subtitle }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <!-- Slide Counter (e.g. 01 / 05) -->
                    <span v-if="showCounter" class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 mr-1">
                        {{ String(currentSlide + 1).padStart(2, '0') }} / {{ String(totalSlides).padStart(2, '0') }}
                    </span>

                    <!-- Prev & Next in Header -->
                    <div v-if="showControls && controlsPosition === 'header'" class="flex items-center gap-1">
                        <button
                            type="button"
                            @click="prevSlide"
                            :disabled="!loop && currentSlide === 0"
                            class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                            title="Slide Sebelumnya"
                        >
                            <span class="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <button
                            type="button"
                            @click="nextSlide"
                            :disabled="!loop && currentSlide === totalSlides - 1"
                            class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                            title="Slide Selanjutnya"
                        >
                            <span class="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                    </div>

                    <slot name="header-actions" />
                </div>
            </div>

            <!-- Slides Track Container -->
            <div
                class="relative overflow-hidden w-full flex-1"
                @mouseenter="pauseOnHover ? stopAutoplay() : null"
                @mouseleave="pauseOnHover ? startAutoplay() : null"
            >
                <!-- Floating Side Prev / Next Buttons -->
                <template v-if="showControls && controlsPosition === 'sides' && totalSlides > 1">
                    <button
                        type="button"
                        @click="prevSlide"
                        :disabled="!loop && currentSlide === 0"
                        class="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                        title="Sebelumnya"
                    >
                        <span class="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button
                        type="button"
                        @click="nextSlide"
                        :disabled="!loop && currentSlide === totalSlides - 1"
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                        title="Selanjutnya"
                    >
                        <span class="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </template>

                <!-- Inner Slide Carousel Track -->
                <div
                    class="flex transition-transform duration-500 ease-out h-full"
                    :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
                >
                    <!-- Prop-driven Slides -->
                    <template v-if="slides && slides.length > 0">
                        <div
                            v-for="(slide, sIdx) in slides"
                            :key="sIdx"
                            class="w-full shrink-0 h-full"
                            :class="paddingClasses"
                        >
                            <slot name="slide" :slide="slide" :index="sIdx">
                                <div class="space-y-2">
                                    <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ slide.title || `Slide ${sIdx + 1}` }}</h4>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ slide.description || slide.text || '' }}</p>
                                </div>
                            </slot>
                        </div>
                    </template>

                    <!-- Slot-driven Fallback -->
                    <div v-else class="w-full shrink-0 h-full" :class="paddingClasses">
                        <slot />
                    </div>
                </div>
            </div>

            <!-- Slider Footer with Indicator Dots -->
            <div
                v-if="showIndicators || controlsPosition === 'bottom'"
                class="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs"
            >
                <!-- Indicator Dots -->
                <div class="flex items-center gap-1.5 mx-auto">
                    <button
                        v-for="dotIdx in totalSlides"
                        :key="dotIdx"
                        type="button"
                        @click="goToSlide(dotIdx - 1, $event)"
                        class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                        :class="[
                            (currentSlide === dotIdx - 1)
                                ? 'w-6 bg-blue-600 dark:bg-blue-400'
                                : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                        ]"
                        :title="`Slide ${dotIdx}`"
                    />
                </div>

                <!-- Bottom Controls if enabled -->
                <div v-if="showControls && controlsPosition === 'bottom'" class="flex items-center gap-1">
                    <button
                        type="button"
                        @click="prevSlide"
                        :disabled="!loop && currentSlide === 0"
                        class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                        <span class="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                        type="button"
                        @click="nextSlide"
                        :disabled="!loop && currentSlide === totalSlides - 1"
                        class="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                        <span class="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ================= DEFAULT CONTAINER CARD MODE (type === 'default') ================= -->
        <div v-else class="relative z-1 flex flex-col h-full">
            <!-- HEADER -->
            <div
                v-if="hasHeader || $slots.header || $slots['header-actions']"
                class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 select-none transition-colors"
                :class="[
                    (!collapsible || !isCollapsed) ? 'border-b border-slate-100 dark:border-slate-800/80' : ''
                ]"
            >
                <div class="flex items-center gap-2.5 min-w-0">
                    <slot name="header">
                        <!-- Icon with Variant styling -->
                        <div
                            v-if="icon"
                            class="flex items-center justify-center shrink-0 select-none transition-colors"
                            :class="[
                                iconVariant === 'solid' ? `w-8 h-8 rounded-lg ${currentTheme.iconBg}` : '',
                                iconVariant === 'outline' ? `w-8 h-8 rounded-lg border ${currentTheme.border} ${iconColor || currentTheme.textAccent}` : '',
                                iconVariant === 'subtle' ? `${iconColor || currentTheme.textAccent}` : '',
                            ]"
                        >
                            <span class="material-symbols-outlined text-lg leading-none" aria-hidden="true">
                                {{ icon }}
                            </span>
                        </div>

                        <!-- Title & Subtitle -->
                        <div v-if="title" class="min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                    <slot name="title">{{ title }}</slot>
                                </h3>
                                <span
                                    v-if="badge"
                                    class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                                    :class="badgeColor || currentTheme.badge"
                                >
                                    {{ badge }}
                                </span>
                            </div>
                            <p v-if="subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                                <slot name="subtitle">{{ subtitle }}</slot>
                            </p>
                        </div>
                    </slot>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <!-- Header Actions Slot -->
                    <slot name="header-actions" />
                    <slot name="action" />

                    <!-- Collapse Toggle Button -->
                    <button
                        v-if="collapsible"
                        type="button"
                        @click.stop="toggleCollapse"
                        :aria-expanded="!isCollapsed"
                        :aria-controls="contentId"
                        class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 cursor-pointer"
                        :title="isCollapsed ? 'Buka konten' : 'Tutup konten'"
                    >
                        <span
                            class="material-symbols-outlined text-lg leading-none transition-transform duration-300 select-none"
                            :class="isCollapsed ? '' : 'rotate-180'"
                        >
                            expand_more
                        </span>
                    </button>
                </div>
            </div>

            <!-- COLLAPSIBLE BODY -->
            <Transition
                enter-active-class="transition-all duration-250 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[2000px]"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[2000px]"
                leave-to-class="opacity-0 max-h-0"
            >
                <div
                    v-show="!collapsible || !isCollapsed"
                    :id="contentId"
                    class="flex-1 flex flex-col"
                    :class="collapsible ? 'overflow-hidden' : (overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible')"
                >
                    <div :class="paddingClasses" class="relative flex-1">
                        <!-- Loading Overlay -->
                        <div
                            v-if="loading"
                            class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1.5px] rounded-[inherit]"
                        >
                            <slot name="loading">
                                <div class="flex flex-col items-center gap-2">
                                    <span
                                        class="material-symbols-outlined text-2xl animate-spin select-none"
                                        :class="currentTheme.textAccent"
                                        aria-hidden="true"
                                    >
                                        progress_activity
                                    </span>
                                    <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Memuat...</span>
                                </div>
                            </slot>
                        </div>

                        <!-- Default Content -->
                        <slot />
                    </div>

                    <!-- FOOTER -->
                    <div
                        v-if="showFooter && $slots.footer"
                        class="px-4 sm:px-5 py-3 sm:py-3.5 border-t border-slate-100 dark:border-slate-800/80"
                    >
                        <slot name="footer" />
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}
.transform-style-preserve-3d {
    transform-style: preserve-3d;
}
.backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
    transform: rotateY(180deg);
}
</style>
