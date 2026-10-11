<script setup>
import { ref, computed, watch, useSlots } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    // Core Props (Backward Compatible)
    as: {
        type: String,
        default: 'button', // 'button', 'Link', 'a'
        validator: (val) => ['button', 'Link', 'a'].includes(val),
    },
    href: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        default: 'submit', // 'submit', 'button', 'reset'
    },
    variant: {
        type: String,
        default: 'primary',
        validator: (val) => [
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'outline',
            'ghost',
            'soft',
            'soft-primary',
            'soft-danger',
            'soft-success',
            'soft-warning',
            'soft-secondary',
            'gradient',
            'glass',
            'youtube',
            'instagram',
        ].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'xs', 'sm', 'md', 'lg', 'icon'
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'icon'].includes(val),
    },
    rounded: {
        type: String,
        default: 'default', // 'default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
        validator: (val) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    pill: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loadingText: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    iconLeft: {
        type: String,
        default: '',
    },
    iconRight: {
        type: String,
        default: '',
    },
    iconPosition: {
        type: String,
        default: 'left', // 'left', 'right'
        validator: (val) => ['left', 'right'].includes(val),
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    preserveScroll: {
        type: Boolean,
        default: true,
    },
    preserveState: {
        type: Boolean,
        default: true,
    },

    // Models & Themes
    model: {
        type: String,
        default: 'default', // 'default', 'like', 'subscribe', 'follow', 'split-like', 'bookmark'
        validator: (val) => ['default', 'like', 'subscribe', 'follow', 'split-like', 'bookmark'].includes(val),
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
    social: {
        type: String,
        default: 'none', // 'none', 'youtube', 'instagram'
        validator: (val) => ['none', 'youtube', 'instagram'].includes(val),
    },
    modelValue: {
        type: Boolean,
        default: undefined,
    },
    active: {
        type: Boolean,
        default: false,
    },
    activeLabel: {
        type: String,
        default: '',
    },
    activeIcon: {
        type: String,
        default: '',
    },
    activeVariant: {
        type: String,
        default: '',
    },
    count: {
        type: [Number, String],
        default: null,
    },
    showCount: {
        type: Boolean,
        default: true,
    },
    disliked: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    'click',
    'update:modelValue',
    'update:active',
    'toggle',
    'like',
    'dislike',
    'update:disliked',
    'subscribe',
]);

const slots = useSlots();

// Internal Toggled States & v-model Support
const isToggled = ref(props.modelValue !== undefined ? props.modelValue : props.active);
watch(() => props.modelValue, (val) => {
    if (val !== undefined) isToggled.value = val;
});
watch(() => props.active, (val) => {
    if (props.modelValue === undefined) isToggled.value = val;
});

const isDisliked = ref(props.disliked);
watch(() => props.disliked, (val) => {
    isDisliked.value = val;
});

const isAnimating = ref(false);
const isDisabled = computed(() => props.disabled || props.loading);

// URL Analysis & Anti Scroll-Jump Protocol (REQUEST.md Bagian 10)
const isExternalHref = computed(() => {
    if (!props.href) return false;
    return /^(https?:|\/\/|mailto:|tel:)/i.test(props.href);
});

const isDummyHref = computed(() => {
    if (!props.href) return false;
    const trimmed = props.href.trim();
    return trimmed === '#' || trimmed === 'javascript:void(0)' || trimmed === '';
});

const tag = computed(() => {
    if (props.as === 'Link') {
        if (!props.href || isDummyHref.value) return 'button';
        return Link;
    }
    if (props.as === 'a') {
        if (!props.href || isDummyHref.value) return 'button';
        return 'a';
    }
    // Jika props.as adalah 'button' default tetapi href diisi dengan URL valid:
    if (props.href && !isDummyHref.value) {
        return isExternalHref.value ? 'a' : Link;
    }
    return 'button';
});

const safeHref = computed(() => {
    if (isDisabled.value || !props.href || isDummyHref.value) return undefined;
    return props.href;
});

const safeType = computed(() => {
    if (tag.value !== 'button') return undefined;
    if (props.href && isDummyHref.value) return 'button';
    return props.type || 'submit';
});

// Calculate Display Count
const displayCount = computed(() => {
    if (props.count === null || props.count === undefined) return '';
    if (typeof props.count === 'number') {
        const adjusted = isToggled.value ? props.count + 1 : props.count;
        if (adjusted >= 1000000) return `${(adjusted / 1000000).toFixed(1)}M`;
        if (adjusted >= 1000) return `${(adjusted / 1000).toFixed(1)}k`;
        return String(adjusted);
    }
    return String(props.count);
});

// Trigger Micro-animation
const triggerAnimation = () => {
    isAnimating.value = true;
    setTimeout(() => {
        isAnimating.value = false;
    }, 400);
};

// Toggle State Helper
const toggleState = () => {
    isToggled.value = !isToggled.value;
    triggerAnimation();
    emit('update:modelValue', isToggled.value);
    emit('update:active', isToggled.value);
    emit('toggle', isToggled.value);
};

// Handle Click
const handleClick = (e) => {
    if (isDisabled.value) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    if (props.href && isDummyHref.value) {
        e.preventDefault();
    }

    if (props.model === 'like') {
        toggleState();
        emit('like', isToggled.value);
    } else if (props.model === 'subscribe') {
        toggleState();
        emit('subscribe', isToggled.value);
    } else if (props.model === 'follow') {
        toggleState();
    } else if (props.model === 'bookmark') {
        toggleState();
    } else if (props.modelValue !== undefined) {
        toggleState();
    }

    emit('click', e);
};

// Handle Split-Like
const handleSplitLike = (e) => {
    if (isDisabled.value) return;
    e.preventDefault();
    e.stopPropagation();
    isToggled.value = !isToggled.value;
    if (isToggled.value && isDisliked.value) {
        isDisliked.value = false;
        emit('update:disliked', false);
    }
    triggerAnimation();
    emit('update:modelValue', isToggled.value);
    emit('update:active', isToggled.value);
    emit('like', isToggled.value);
};

const handleSplitDislike = (e) => {
    if (isDisabled.value) return;
    e.preventDefault();
    e.stopPropagation();
    isDisliked.value = !isDisliked.value;
    if (isDisliked.value && isToggled.value) {
        isToggled.value = false;
        emit('update:modelValue', false);
        emit('update:active', false);
    }
    emit('update:disliked', isDisliked.value);
    emit('dislike', isDisliked.value);
};

// Active Theme Presets
const themeColorPresets = {
    default: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(100,116,139,0.3)]',
        gradient: 'bg-gradient-to-r from-slate-800 to-slate-950 text-white',
    },
    primary: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)]',
        gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white',
    },
    indigo: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(79,70,229,0.45)]',
        gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
    },
    emerald: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(5,150,105,0.45)]',
        gradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
    },
    purple: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(147,51,234,0.45)]',
        gradient: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white',
    },
    amber: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(217,119,6,0.45)]',
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    },
    rose: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(225,29,72,0.45)]',
        gradient: 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white',
    },
    cyan: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]',
        gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    },
    dark: {
        glow: 'shadow-[0_8px_20px_-6px_rgba(15,23,42,0.6)]',
        gradient: 'bg-gradient-to-r from-zinc-900 to-black text-white',
    },
};

// Otomatisasi pemetaan tema jika colorTheme = 'default'
const resolvedThemeKey = computed(() => {
    if (props.colorTheme && props.colorTheme !== 'default') {
        return props.colorTheme;
    }
    if (props.variant === 'danger' || props.variant === 'soft-danger' || props.social === 'youtube') return 'rose';
    if (props.variant === 'success' || props.variant === 'soft-success') return 'emerald';
    if (props.variant === 'warning' || props.variant === 'soft-warning') return 'amber';
    if (props.variant === 'primary' || props.variant === 'soft-primary' || props.variant === 'soft') return 'primary';
    if (props.social === 'instagram') return 'purple';
    return 'default';
});

const currentTheme = computed(() => themeColorPresets[resolvedThemeKey.value] || themeColorPresets.default);

// Deteksi Tombol Pure Icon (Proporsional Kotak Sempurna)
const isIconOnly = computed(() => {
    if (props.size === 'icon') return true;
    const hasText = !!slots.default || !!props.loadingText || (isToggled.value && !!props.activeLabel);
    const hasCount = props.showCount && displayCount.value !== '';
    const hasIcon = !!effectiveIcon.value || !!props.activeIcon || props.model === 'bookmark' || props.model === 'like';
    return !hasText && !hasCount && hasIcon;
});

// Size & Padding Classes (REQUEST.md: Kompak, Ramping, Proporsional)
const sizeClasses = computed(() => {
    if (isIconOnly.value) {
        switch (props.size) {
            case 'xs':
                return 'w-7 h-7 min-h-[28px] p-0 justify-center text-[11px]';
            case 'sm':
                return 'w-8.5 h-8.5 min-h-[34px] p-0 justify-center text-xs';
            case 'lg':
                return 'w-11 h-11 min-h-[44px] p-0 justify-center text-sm';
            case 'icon':
            case 'md':
            default:
                return 'w-9.5 h-9.5 min-h-[38px] p-0 justify-center text-xs sm:text-sm';
        }
    }

    switch (props.size) {
        case 'xs':
            return 'px-2.5 py-1 text-[11px] font-medium gap-1.5 min-h-[28px]';
        case 'sm':
            return 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[34px]';
        case 'lg':
            return 'px-4.5 py-2.5 text-sm font-bold gap-2.5 min-h-[44px]';
        case 'icon':
            return 'w-9.5 h-9.5 min-h-[38px] p-0 justify-center text-xs sm:text-sm';
        case 'md':
        default:
            return 'px-3.5 py-2 text-xs sm:text-sm font-semibold gap-2 min-h-[38px]';
    }
});

// Icon Scaling 1:1 terhadap Font Cap-Height (REQUEST.md Bagian 8)
const iconSizeClasses = computed(() => {
    switch (props.size) {
        case 'xs': return 'text-[13px] leading-none select-none shrink-0 flex items-center justify-center';
        case 'sm': return 'text-[14px] leading-none select-none shrink-0 flex items-center justify-center';
        case 'lg': return 'text-[18px] leading-none select-none shrink-0 flex items-center justify-center';
        case 'icon': return 'text-[18px] leading-none select-none shrink-0 flex items-center justify-center';
        case 'md':
        default: return 'text-[16px] leading-none select-none shrink-0 flex items-center justify-center';
    }
});

// Sizing Proporsional untuk Model Split-Like
const splitSizeStyles = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                wrapper: 'p-0.5 text-[11px]',
                like: 'gap-1 px-2 py-0.5 text-[11px]',
                dislike: 'px-1.5 py-0.5',
                divider: 'h-3 mx-0.5',
                icon: 'text-[13px]',
            };
        case 'sm':
            return {
                wrapper: 'p-0.5 text-xs',
                like: 'gap-1.5 px-2.5 py-1 text-xs',
                dislike: 'px-2 py-1',
                divider: 'h-3.5 mx-0.5',
                icon: 'text-[14px]',
            };
        case 'lg':
            return {
                wrapper: 'p-1 text-sm',
                like: 'gap-2 px-4 py-2 text-sm',
                dislike: 'px-3 py-2',
                divider: 'h-5 mx-1',
                icon: 'text-[18px]',
            };
        case 'md':
        default:
            return {
                wrapper: 'p-0.5 text-xs',
                like: 'gap-1.5 px-3 py-1.5 text-xs',
                dislike: 'px-2.5 py-1.5',
                divider: 'h-4 mx-0.5',
                icon: 'text-[16px]',
            };
    }
});

// Rounded Classes (REQUEST.md: Geometri Ramping & Proporsional)
const roundedClasses = computed(() => {
    if (props.pill || (props.model === 'subscribe' && props.social === 'youtube' && props.rounded === 'default')) {
        return 'rounded-full';
    }
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case '2xl': return 'rounded-2xl';
        case '3xl': return 'rounded-3xl';
        case 'full': return 'rounded-full';
        case 'default':
        default: {
            switch (props.size) {
                case 'xs': return 'rounded-md';
                case 'sm': return 'rounded-lg';
                case 'lg': return 'rounded-xl';
                case 'icon':
                case 'md':
                default: return 'rounded-lg';
            }
        }
    }
});

// Variant Style Helper
const getVariantClasses = (variantName) => {
    switch (variantName) {
        case 'gradient':
            return `${currentTheme.value.gradient} shadow-md border border-transparent`;
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 shadow-sm hover:bg-white/85 dark:hover:bg-slate-800';
        case 'youtube':
            return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-xs border border-transparent';
        case 'instagram':
            return 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold shadow-xs border border-transparent';
        case 'secondary':
            return 'bg-slate-100 hover:bg-slate-200/90 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs focus-visible:ring-slate-400';
        case 'danger':
            return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500 border border-transparent';
        case 'success':
            return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500 border border-transparent';
        case 'warning':
            return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold shadow-xs focus-visible:ring-amber-500 border border-transparent';
        case 'outline':
            return 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs focus-visible:ring-slate-400';
        case 'ghost':
            return 'bg-transparent hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 focus-visible:ring-slate-400 border border-transparent';
        case 'soft':
        case 'soft-primary':
            return 'bg-blue-50/90 hover:bg-blue-100 active:bg-blue-200/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:active:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs focus-visible:ring-blue-400';
        case 'soft-danger':
            return 'bg-rose-50/90 hover:bg-rose-100 active:bg-rose-200/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:active:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-2xs focus-visible:ring-rose-400';
        case 'soft-success':
            return 'bg-emerald-50/90 hover:bg-emerald-100 active:bg-emerald-200/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:active:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs focus-visible:ring-emerald-400';
        case 'soft-warning':
            return 'bg-amber-50/90 hover:bg-amber-100 active:bg-amber-200/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:active:bg-amber-900/80 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs focus-visible:ring-amber-400';
        case 'soft-secondary':
            return 'bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs focus-visible:ring-slate-400';
        case 'primary':
        default:
            return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs focus-visible:ring-blue-500 border border-transparent';
    }
};

// Variant Classes (Mendukung props.activeVariant saat aktif)
const variantClasses = computed(() => {
    // 1. Dukungan activeVariant eksplisit
    if (isToggled.value && props.activeVariant) {
        return getVariantClasses(props.activeVariant);
    }

    // 2. Model-specific overrides
    if (props.model === 'subscribe') {
        if (isToggled.value) {
            return 'bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 shadow-2xs';
        }
        if (props.social === 'youtube' || props.variant === 'danger') {
            return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-xs border border-transparent';
        }
        return 'bg-slate-900 hover:bg-slate-800 active:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold shadow-xs border border-transparent';
    }

    if (props.model === 'follow') {
        if (isToggled.value) {
            return 'bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-2xs';
        }
        return 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold shadow-xs border border-transparent';
    }

    if (props.model === 'like') {
        if (props.social === 'instagram') {
            if (isToggled.value) {
                return 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 shadow-xs';
            }
            return 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80';
        }
        if (isToggled.value) {
            return 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shadow-xs';
        }
        return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60';
    }

    return getVariantClasses(props.variant);
});

// Effective Icon & Position (Mendukung props.icon, props.iconLeft, dan props.iconRight)
const effectiveIcon = computed(() => {
    return props.iconLeft || props.iconRight || props.icon || '';
});

const effectiveIconPosition = computed(() => {
    if (props.iconRight) return 'right';
    if (props.iconLeft) return 'left';
    return props.iconPosition;
});

// Active Icon Logic (Mendahulukan props.activeIcon & props.icon yang diberikan pengguna)
const resolvedIcon = computed(() => {
    if (props.loading) return 'progress_activity';

    if (isToggled.value) {
        if (props.activeIcon) return props.activeIcon;
        if (props.model === 'subscribe') return 'notifications_active';
        if (props.model === 'follow') return 'check';
        if (props.model === 'like') return props.social === 'instagram' ? 'favorite' : 'thumb_up';
        if (props.model === 'bookmark') return 'bookmark';
        if (effectiveIcon.value) return effectiveIcon.value;
        return '';
    }

    if (effectiveIcon.value) return effectiveIcon.value;
    if (props.model === 'subscribe') return props.social === 'youtube' ? 'subscriptions' : '';
    if (props.model === 'follow') return 'person_add';
    if (props.model === 'like') return props.social === 'instagram' ? 'favorite' : 'thumb_up';
    if (props.model === 'bookmark') return 'bookmark';

    return '';
});

// Is Filled Icon
const isFilledIcon = computed(() => {
    if (props.model === 'like') return isToggled.value;
    if (props.model === 'bookmark') return isToggled.value;
    if (props.model === 'subscribe' && isToggled.value) return true;
    return false;
});
</script>

<template>
    <!-- MODEL: SPLIT-LIKE (YouTube Segmented Like & Dislike Pill) -->
    <div
        v-if="model === 'split-like'"
        :class="[
            'inline-flex items-center select-none rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 shadow-2xs transition-all',
            splitSizeStyles.wrapper,
            glow ? currentTheme.glow : '',
            fullWidth ? 'flex w-full justify-center' : '',
            isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
        ]"
    >
        <!-- Left Half: Like + Count -->
        <button
            type="button"
            @click="handleSplitLike"
            :class="[
                'inline-flex items-center rounded-l-full font-bold transition-all duration-150 cursor-pointer',
                splitSizeStyles.like,
                isToggled
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            ]"
            title="Sukai video ini"
        >
            <span
                class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center transition-transform duration-200"
                :class="[
                    splitSizeStyles.icon,
                    isAnimating && isToggled ? 'scale-125 animate-heart-pop' : '',
                    isToggled ? 'fill-current' : ''
                ]"
                :style="isToggled ? 'font-variation-settings: \'FILL\' 1;' : ''"
            >
                {{ isToggled ? (activeIcon || effectiveIcon || 'thumb_up') : (effectiveIcon || 'thumb_up') }}
            </span>
            <span v-if="showCount && displayCount" class="font-mono font-semibold">{{ displayCount }}</span>
            <span v-else-if="$slots.default"><slot /></span>
        </button>

        <!-- Divider Line -->
        <span
            class="w-px bg-slate-300 dark:bg-slate-700 shrink-0"
            :class="splitSizeStyles.divider"
            aria-hidden="true"
        />

        <!-- Right Half: Dislike -->
        <button
            type="button"
            @click="handleSplitDislike"
            :class="[
                'inline-flex items-center rounded-r-full font-bold transition-all duration-150 cursor-pointer',
                splitSizeStyles.dislike,
                isDisliked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            ]"
            title="Tidak menyukai video ini"
        >
            <span
                class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center transition-transform duration-200"
                :class="[
                    splitSizeStyles.icon,
                    isDisliked ? 'fill-current' : ''
                ]"
                :style="isDisliked ? 'font-variation-settings: \'FILL\' 1;' : ''"
            >
                thumb_down
            </span>
        </button>
    </div>

    <!-- STANDARD & ALL OTHER MODELS -->
    <component
        v-else
        :is="tag"
        :href="safeHref"
        :type="safeType"
        :preserve-scroll="tag === Link ? preserveScroll : undefined"
        :preserve-state="tag === Link ? preserveState : undefined"
        :disabled="tag === 'button' ? isDisabled : undefined"
        :aria-disabled="isDisabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :tabindex="isDisabled && tag !== 'button' ? -1 : undefined"
        @click="handleClick"
        :class="[
            'items-center justify-center select-none transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
            fullWidth ? 'flex w-full' : 'inline-flex',
            sizeClasses,
            roundedClasses,
            variantClasses,
            glow ? currentTheme.glow : '',
            isDisabled
                ? 'opacity-60 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer active:scale-[0.98]'
        ]"
    >
        <!-- Loading Spinner (Left) -->
        <span
            v-if="loading && effectiveIconPosition === 'left'"
            class="material-symbols-outlined animate-spin shrink-0 select-none leading-none flex items-center justify-center"
            :class="iconSizeClasses"
            aria-hidden="true"
        >
            progress_activity
        </span>

        <!-- Icon Kiri -->
        <span
            v-else-if="resolvedIcon && effectiveIconPosition === 'left'"
            class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center transition-all duration-200"
            :class="[
                iconSizeClasses,
                isAnimating ? (model === 'like' ? 'animate-heart-pop' : (model === 'subscribe' ? 'animate-bell-ring' : 'scale-110')) : '',
                (model === 'like' && social === 'instagram' && isToggled) ? 'text-rose-500' : ''
            ]"
            :style="isFilledIcon ? 'font-variation-settings: \'FILL\' 1;' : ''"
            aria-hidden="true"
        >
            {{ resolvedIcon }}
        </span>

        <!-- Text Label / Slot Content / Counter (True Center Alignment) -->
        <span
            v-if="$slots.default || loadingText || activeLabel || model !== 'default' || (showCount && displayCount)"
            class="truncate leading-none inline-flex items-center gap-1.5"
        >
            <!-- Loading Text -->
            <template v-if="loading && loadingText">{{ loadingText }}</template>

            <!-- Active Label if specified -->
            <template v-else-if="isToggled && activeLabel">{{ activeLabel }}</template>

            <!-- Subscribe Model Default Labels -->
            <template v-else-if="model === 'subscribe'">
                {{ isToggled ? 'Subscribed' : ($slots.default ? null : 'Subscribe') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Follow Model Default Labels -->
            <template v-else-if="model === 'follow'">
                {{ isToggled ? 'Following' : ($slots.default ? null : 'Follow') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Like Model Default Labels -->
            <template v-else-if="model === 'like'">
                {{ isToggled ? 'Liked' : ($slots.default ? null : 'Like') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Bookmark Model Default Labels -->
            <template v-else-if="model === 'bookmark'">
                {{ isToggled ? 'Saved' : ($slots.default ? null : 'Save') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Default Slot fallback -->
            <template v-else>
                <slot />
            </template>

            <!-- Count Indicator -->
            <span
                v-if="showCount && displayCount"
                class="font-mono font-bold leading-none inline-flex items-center px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10"
                :class="[
                    size === 'xs' ? 'text-[10px]' : (size === 'lg' ? 'text-xs' : 'text-[11px]')
                ]"
            >
                {{ displayCount }}
            </span>
        </span>

        <!-- Loading Spinner (Right) -->
        <span
            v-if="loading && effectiveIconPosition === 'right'"
            class="material-symbols-outlined animate-spin shrink-0 select-none leading-none flex items-center justify-center"
            :class="iconSizeClasses"
            aria-hidden="true"
        >
            progress_activity
        </span>

        <!-- Icon Kanan -->
        <span
            v-else-if="resolvedIcon && !loading && effectiveIconPosition === 'right'"
            class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center transition-all duration-200"
            :class="[
                iconSizeClasses,
                isAnimating ? (model === 'like' ? 'animate-heart-pop' : (model === 'subscribe' ? 'animate-bell-ring' : 'scale-110')) : '',
                (model === 'like' && social === 'instagram' && isToggled) ? 'text-rose-500' : ''
            ]"
            :style="isFilledIcon ? 'font-variation-settings: \'FILL\' 1;' : ''"
            aria-hidden="true"
        >
            {{ resolvedIcon }}
        </span>
    </component>
</template>

<style scoped>
@keyframes heartPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.35); }
    100% { transform: scale(1); }
}

@keyframes bellRing {
    0%, 100% { transform: rotate(0); }
    20%, 60% { transform: rotate(18deg); }
    40%, 80% { transform: rotate(-18deg); }
}

.animate-heart-pop {
    animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-bell-ring {
    animation: bellRing 0.45s ease-in-out;
}
</style>
