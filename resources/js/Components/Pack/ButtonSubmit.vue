<script setup>
import { ref, computed, watch } from 'vue';
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

    // 5 Pilar Tambahan: Model & Tema Warna
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
    'update:active',
    'toggle',
    'like',
    'dislike',
    'update:disliked',
    'subscribe',
]);

// Internal Toggled States
const isToggled = ref(props.active);
watch(() => props.active, (val) => {
    isToggled.value = val;
});

const isDisliked = ref(props.disliked);
watch(() => props.disliked, (val) => {
    isDisliked.value = val;
});

const isAnimating = ref(false);

const isDisabled = computed(() => props.disabled || props.loading);

const tag = computed(() => {
    if (props.as === 'Link') {
        if (!props.href) {
            console.warn('[ButtonSubmit] Prop "href" is missing while as="Link". Falling back to "button".');
            return 'button';
        }
        return Link;
    }
    if (props.as === 'a') {
        if (!props.href) {
            console.warn('[ButtonSubmit] Prop "href" is missing while as="a". Falling back to "button".');
            return 'button';
        }
        return 'a';
    }
    return 'button';
});

const safeHref = computed(() => {
    if (isDisabled.value) return undefined;
    return props.href;
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
    }, 450);
};

// Handle Click based on Model
const handleClick = (e) => {
    if (isDisabled.value) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    if (props.model === 'like') {
        isToggled.value = !isToggled.value;
        triggerAnimation();
        emit('update:active', isToggled.value);
        emit('toggle', isToggled.value);
        emit('like', isToggled.value);
    } else if (props.model === 'subscribe') {
        isToggled.value = !isToggled.value;
        triggerAnimation();
        emit('update:active', isToggled.value);
        emit('toggle', isToggled.value);
        emit('subscribe', isToggled.value);
    } else if (props.model === 'follow') {
        isToggled.value = !isToggled.value;
        triggerAnimation();
        emit('update:active', isToggled.value);
        emit('toggle', isToggled.value);
    } else if (props.model === 'bookmark') {
        isToggled.value = !isToggled.value;
        triggerAnimation();
        emit('update:active', isToggled.value);
        emit('toggle', isToggled.value);
    }

    emit('click', e);
};

// Handle Split-Like (YouTube Like / Dislike)
const handleSplitLike = (e) => {
    if (isDisabled.value) return;
    e.stopPropagation();
    isToggled.value = !isToggled.value;
    if (isToggled.value && isDisliked.value) {
        isDisliked.value = false;
        emit('update:disliked', false);
    }
    triggerAnimation();
    emit('update:active', isToggled.value);
    emit('like', isToggled.value);
};

const handleSplitDislike = (e) => {
    if (isDisabled.value) return;
    e.stopPropagation();
    isDisliked.value = !isDisliked.value;
    if (isDisliked.value && isToggled.value) {
        isToggled.value = false;
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

const currentTheme = computed(() => themeColorPresets[props.colorTheme] || themeColorPresets.default);

// Rounded Classes
const roundedClasses = computed(() => {
    if (props.pill || props.model === 'split-like' || (props.model === 'subscribe' && props.social === 'youtube')) {
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
                case 'xs': return 'rounded-lg';
                case 'sm': return 'rounded-xl';
                case 'lg': return 'rounded-2xl';
                case 'icon': return 'rounded-xl';
                case 'md':
                default: return 'rounded-xl';
            }
        }
    }
});

// Size Classes
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return 'px-2.5 py-1 text-[11px] font-medium gap-1 min-h-[28px]';
        case 'sm':
            return 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[34px]';
        case 'lg':
            return 'px-5 py-2.5 text-sm font-bold gap-2.5 min-h-[46px]';
        case 'icon':
            return 'w-9.5 h-9.5 p-0 justify-center text-sm font-semibold gap-1.5';
        case 'md':
        default:
            return 'px-4 py-2 text-xs sm:text-sm font-semibold gap-2 min-h-[38px]';
    }
});

const iconSizeClasses = computed(() => {
    switch (props.size) {
        case 'xs': return 'text-sm leading-none';
        case 'sm': return 'text-base leading-none';
        case 'lg': return 'text-xl leading-none';
        case 'icon': return 'text-lg leading-none';
        case 'md':
        default: return 'text-lg leading-none';
    }
});

// Variant Classes
const variantClasses = computed(() => {
    // Model-specific variant overrides
    if (props.model === 'subscribe') {
        if (isToggled.value) {
            return 'bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 shadow-2xs';
        }
        if (props.social === 'youtube' || props.variant === 'danger') {
            return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-xs';
        }
        return 'bg-slate-900 hover:bg-slate-800 active:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold shadow-xs';
    }

    if (props.model === 'follow') {
        if (isToggled.value) {
            return 'bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-2xs';
        }
        return 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold shadow-xs';
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

    if (props.model === 'split-like') {
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs';
    }

    // Standard variants
    switch (props.variant) {
        case 'gradient':
            return `${currentTheme.value.gradient} shadow-md border border-transparent`;
        case 'glass':
            return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 shadow-sm hover:bg-white/85 dark:hover:bg-slate-800';
        case 'youtube':
            return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-xs';
        case 'instagram':
            return 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold shadow-xs';
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
});

// Active Icon Logic
const resolvedIcon = computed(() => {
    if (props.loading) return 'progress_activity';

    if (props.model === 'subscribe') {
        return isToggled.value ? (props.activeIcon || 'notifications_active') : (props.icon || '');
    }

    if (props.model === 'follow') {
        return isToggled.value ? (props.activeIcon || 'check') : (props.icon || 'person_add');
    }

    if (props.model === 'like') {
        if (props.social === 'instagram') {
            return 'favorite';
        }
        return 'thumb_up';
    }

    if (props.model === 'bookmark') {
        return 'bookmark';
    }

    if (isToggled.value && props.activeIcon) {
        return props.activeIcon;
    }

    return props.icon;
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
            'inline-flex items-center select-none rounded-full p-0.5 border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 shadow-2xs transition-all',
            glow ? currentTheme.glow : '',
            fullWidth ? 'w-full justify-center' : '',
            isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
        ]"
    >
        <!-- Left Half: Like + Count -->
        <button
            type="button"
            @click="handleSplitLike"
            :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-xs font-bold transition-all duration-150 cursor-pointer',
                isToggled
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            ]"
            title="Sukai video ini"
        >
            <span
                class="material-symbols-outlined text-base leading-none transition-transform duration-200"
                :class="[
                    isAnimating && isToggled ? 'scale-125 animate-heart-pop' : '',
                    isToggled ? 'fill-current' : ''
                ]"
                :style="isToggled ? 'font-variation-settings: \'FILL\' 1;' : ''"
            >
                thumb_up
            </span>
            <span v-if="displayCount" class="font-mono text-xs font-semibold">{{ displayCount }}</span>
            <span v-else-if="$slots.default"><slot /></span>
        </button>

        <!-- Divider Line -->
        <span class="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 shrink-0" aria-hidden="true" />

        <!-- Right Half: Dislike -->
        <button
            type="button"
            @click="handleSplitDislike"
            :class="[
                'inline-flex items-center px-2.5 py-1.5 rounded-r-full text-xs font-bold transition-all duration-150 cursor-pointer',
                isDisliked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            ]"
            title="Tidak menyukai video ini"
        >
            <span
                class="material-symbols-outlined text-base leading-none transition-transform duration-200"
                :class="[
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
        :type="tag === 'button' ? type : undefined"
        :preserve-scroll="tag === Link ? preserveScroll : undefined"
        :preserve-state="tag === Link ? preserveState : undefined"
        :disabled="tag === 'button' ? isDisabled : undefined"
        :aria-disabled="isDisabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :tabindex="isDisabled && tag !== 'button' ? -1 : undefined"
        @click="handleClick"
        :class="[
            'inline-flex items-center justify-center select-none transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1',
            sizeClasses,
            roundedClasses,
            variantClasses,
            glow ? currentTheme.glow : '',
            fullWidth ? 'w-full' : '',
            isDisabled
                ? 'opacity-60 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer active:scale-95'
        ]"
    >
        <!-- Loading Spinner -->
        <span
            v-if="loading"
            class="material-symbols-outlined animate-spin shrink-0 select-none"
            :class="iconSizeClasses"
            aria-hidden="true"
        >
            progress_activity
        </span>

        <!-- Icon Kiri -->
        <span
            v-else-if="resolvedIcon && iconPosition === 'left'"
            class="material-symbols-outlined shrink-0 select-none transition-all duration-200"
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

        <!-- Text Label / Slot Content / Counter -->
        <span
            v-if="$slots.default || loadingText || activeLabel || model !== 'default' || displayCount"
            class="truncate inline-flex items-center gap-1.5"
        >
            <!-- Loading Text -->
            <template v-if="loading && loadingText">{{ loadingText }}</template>

            <!-- Active Label if specified -->
            <template v-else-if="isToggled && activeLabel">{{ activeLabel }}</template>

            <!-- Subscribe Model Default Labels -->
            <template v-else-if="model === 'subscribe'">
                {{ isToggled ? (activeLabel || 'Subscribed') : ($slots.default ? null : 'Subscribe') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Follow Model Default Labels -->
            <template v-else-if="model === 'follow'">
                {{ isToggled ? (activeLabel || 'Following') : ($slots.default ? null : 'Follow') }}
                <slot v-if="!isToggled" />
            </template>

            <!-- Default Slot fallback -->
            <template v-else>
                <slot />
            </template>

            <!-- Count Indicator (e.g. for Like, Subscriber count) -->
            <span
                v-if="showCount && displayCount"
                class="font-mono text-xs font-bold opacity-90"
            >
                {{ displayCount }}
            </span>
        </span>

        <!-- Icon Kanan -->
        <span
            v-if="resolvedIcon && !loading && iconPosition === 'right'"
            class="material-symbols-outlined shrink-0 select-none transition-all duration-200"
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
