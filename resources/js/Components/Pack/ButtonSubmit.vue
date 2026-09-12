<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
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
        default: 'primary', // 'primary', 'secondary', 'danger', 'success', 'warning', 'outline', 'ghost', 'soft', 'soft-primary', 'soft-danger', 'soft-success', 'soft-warning', 'soft-secondary'
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
});

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

const handleClick = (e) => {
    if (isDisabled.value) {
        e.preventDefault();
        e.stopPropagation();
    }
};

const roundedClasses = computed(() => {
    if (props.pill) return 'rounded-full';
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

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'secondary':
            return 'bg-slate-100 hover:bg-slate-200/90 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs focus-visible:ring-slate-400';
        case 'danger':
            return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500 border border-transparent';
        case 'success':
            return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500 border border-transparent';
        case 'warning':
            return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold shadow-xs focus-visible:ring-amber-500 border border-transparent';
        case 'outline':
            return 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-750 text-slate-700 dark:text-slate-200 shadow-2xs focus-visible:ring-slate-400';
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
</script>

<template>
    <component
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
            'inline-flex items-center justify-center select-none transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1',
            sizeClasses,
            roundedClasses,
            variantClasses,
            fullWidth ? 'w-full' : '',
            isDisabled
                ? 'opacity-60 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer active:scale-98'
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
            v-else-if="icon && iconPosition === 'left'"
            class="material-symbols-outlined shrink-0 select-none"
            :class="iconSizeClasses"
            aria-hidden="true"
        >
            {{ icon }}
        </span>

        <!-- Text / Slot Content -->
        <span
            v-if="$slots.default || loadingText"
            class="truncate"
        >
            <template v-if="loading && loadingText">{{ loadingText }}</template>
            <slot v-else />
        </span>

        <!-- Icon Kanan -->
        <span
            v-if="icon && !loading && iconPosition === 'right'"
            class="material-symbols-outlined shrink-0 select-none"
            :class="iconSizeClasses"
            aria-hidden="true"
        >
            {{ icon }}
        </span>
    </component>
</template>
