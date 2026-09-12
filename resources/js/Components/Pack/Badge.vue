<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'soft', // 'soft', 'solid', 'outline', 'dot'
        validator: (val) => ['soft', 'solid', 'outline', 'dot'].includes(val),
    },
    color: {
        type: String,
        default: 'primary', // 'primary', 'success', 'danger', 'warning', 'info', 'purple', 'indigo', 'neutral'
        validator: (val) => [
            'primary', 'blue',
            'success', 'emerald',
            'danger', 'rose', 'red',
            'warning', 'amber',
            'info', 'sky',
            'purple', 'violet',
            'indigo',
            'neutral', 'slate', 'gray'
        ].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'xs', 'sm', 'md', 'lg'
        validator: (val) => ['xs', 'sm', 'md', 'lg'].includes(val),
    },
    rounded: {
        type: String,
        default: 'full', // 'none', 'sm', 'md', 'lg', 'xl', 'full'
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    dot: {
        type: Boolean,
        default: false,
    },
    ping: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: '',
    },
    removable: {
        type: Boolean,
        default: false,
    },
    removeLabel: {
        type: String,
        default: 'Hapus badge',
    },
    clickable: {
        type: Boolean,
        default: false,
    },
    as: {
        type: String,
        default: 'span',
    },
});

const emit = defineEmits(['click', 'remove']);

// Normalisasi Color Keys
const normalizedColor = computed(() => {
    const map = {
        blue: 'primary',
        emerald: 'success',
        rose: 'danger',
        red: 'danger',
        amber: 'warning',
        sky: 'info',
        violet: 'purple',
        gray: 'neutral',
        slate: 'neutral',
    };
    return map[props.color] || props.color;
});

// Color Scheme Definitions
const colorStyles = computed(() => {
    const color = normalizedColor.value;

    const styles = {
        primary: {
            soft: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
            solid: 'bg-blue-600 text-white border-transparent dark:bg-blue-600',
            outline: 'bg-transparent text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700',
            dotText: 'text-blue-700 dark:text-blue-300',
            dotBg: 'bg-blue-500',
            removeHover: 'hover:bg-blue-200/60 dark:hover:bg-blue-800/60 hover:text-blue-800 dark:hover:text-blue-200',
        },
        success: {
            soft: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
            solid: 'bg-emerald-600 text-white border-transparent dark:bg-emerald-600',
            outline: 'bg-transparent text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700',
            dotText: 'text-emerald-700 dark:text-emerald-300',
            dotBg: 'bg-emerald-500',
            removeHover: 'hover:bg-emerald-200/60 dark:hover:bg-emerald-800/60 hover:text-emerald-800 dark:hover:text-emerald-200',
        },
        danger: {
            soft: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
            solid: 'bg-rose-600 text-white border-transparent dark:bg-rose-600',
            outline: 'bg-transparent text-rose-600 border-rose-300 dark:text-rose-400 dark:border-rose-700',
            dotText: 'text-rose-700 dark:text-rose-300',
            dotBg: 'bg-rose-500',
            removeHover: 'hover:bg-rose-200/60 dark:hover:bg-rose-800/60 hover:text-rose-800 dark:hover:text-rose-200',
        },
        warning: {
            soft: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
            solid: 'bg-amber-500 text-white border-transparent dark:bg-amber-600',
            outline: 'bg-transparent text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700',
            dotText: 'text-amber-700 dark:text-amber-300',
            dotBg: 'bg-amber-500',
            removeHover: 'hover:bg-amber-200/60 dark:hover:bg-amber-800/60 hover:text-amber-800 dark:hover:text-amber-200',
        },
        info: {
            soft: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
            solid: 'bg-sky-600 text-white border-transparent dark:bg-sky-600',
            outline: 'bg-transparent text-sky-600 border-sky-300 dark:text-sky-400 dark:border-sky-700',
            dotText: 'text-sky-700 dark:text-sky-300',
            dotBg: 'bg-sky-500',
            removeHover: 'hover:bg-sky-200/60 dark:hover:bg-sky-800/60 hover:text-sky-800 dark:hover:text-sky-200',
        },
        purple: {
            soft: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
            solid: 'bg-purple-600 text-white border-transparent dark:bg-purple-600',
            outline: 'bg-transparent text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-700',
            dotText: 'text-purple-700 dark:text-purple-300',
            dotBg: 'bg-purple-500',
            removeHover: 'hover:bg-purple-200/60 dark:hover:bg-purple-800/60 hover:text-purple-800 dark:hover:text-purple-200',
        },
        indigo: {
            soft: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
            solid: 'bg-indigo-600 text-white border-transparent dark:bg-indigo-600',
            outline: 'bg-transparent text-indigo-600 border-indigo-300 dark:text-indigo-400 dark:border-indigo-700',
            dotText: 'text-indigo-700 dark:text-indigo-300',
            dotBg: 'bg-indigo-500',
            removeHover: 'hover:bg-indigo-200/60 dark:hover:bg-indigo-800/60 hover:text-indigo-800 dark:hover:text-indigo-200',
        },
        neutral: {
            soft: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
            solid: 'bg-slate-800 text-white border-transparent dark:bg-slate-700',
            outline: 'bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-700',
            dotText: 'text-slate-700 dark:text-slate-300',
            dotBg: 'bg-slate-400 dark:bg-slate-500',
            removeHover: 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white',
        },
    };

    return styles[color] || styles.primary;
});

// Size Mapping
const sizeStyles = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                badge: 'text-[10px] px-1.5 py-0.5 gap-1 font-medium',
                dot: 'w-1 h-1',
                icon: 'text-[11px]',
                remove: 'w-3 h-3 text-[10px] -mr-0.5',
            };
        case 'sm':
            return {
                badge: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
                dot: 'w-1.5 h-1.5',
                icon: 'text-xs',
                remove: 'w-3.5 h-3.5 text-xs -mr-0.5',
            };
        case 'lg':
            return {
                badge: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
                dot: 'w-2 h-2',
                icon: 'text-base',
                remove: 'w-4.5 h-4.5 text-sm -mr-1',
            };
        case 'md':
        default:
            return {
                badge: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
                dot: 'w-1.5 h-1.5',
                icon: 'text-sm',
                remove: 'w-4 h-4 text-xs -mr-0.5',
            };
    }
});

// Rounded Mapping
const roundedClass = computed(() => {
    const map = {
        none: 'rounded-none',
        sm: 'rounded-xs',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };
    return map[props.rounded] || 'rounded-full';
});

// Variant Base Classes
const variantClass = computed(() => {
    const style = colorStyles.value;
    if (props.variant === 'solid') {
        return `${style.solid} border`;
    }
    if (props.variant === 'outline') {
        return `${style.outline} border`;
    }
    if (props.variant === 'dot') {
        return `${style.dotText} bg-transparent border-0 px-0 py-0`;
    }
    // Default: 'soft'
    return `${style.soft} border`;
});

const onBadgeClick = (event) => {
    if (props.clickable) {
        emit('click', event);
    }
};

const onRemove = (event) => {
    event.stopPropagation();
    emit('remove', event);
};
</script>

<template>
    <component
        :is="as"
        :class="[
            'inline-flex items-center justify-center tracking-tight transition-all select-none',
            variantClass,
            sizeStyles.badge,
            roundedClass,
            clickable ? 'cursor-pointer hover:opacity-85 active:scale-95' : '',
        ]"
        @click="onBadgeClick"
    >
        <!-- Status Dot / Pulsing Ping Indicator -->
        <span
            v-if="dot || variant === 'dot'"
            class="relative flex shrink-0 items-center justify-center"
        >
            <span
                v-if="ping"
                class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                :class="colorStyles.dotBg"
            ></span>
            <span
                class="relative inline-flex rounded-full"
                :class="[sizeStyles.dot, colorStyles.dotBg]"
            ></span>
        </span>

        <!-- Leading Icon -->
        <slot name="icon">
            <span
                v-if="icon"
                class="material-symbols-outlined select-none shrink-0"
                :class="sizeStyles.icon"
            >
                {{ icon }}
            </span>
        </slot>

        <!-- Badge Text Content -->
        <span class="truncate">
            <slot />
        </span>

        <!-- Removable Close Action -->
        <button
            v-if="removable"
            type="button"
            :aria-label="removeLabel"
            class="inline-flex items-center justify-center rounded-full transition-colors cursor-pointer focus:outline-hidden"
            :class="[sizeStyles.remove, colorStyles.removeHover]"
            @click="onRemove"
        >
            <span class="material-symbols-outlined select-none leading-none text-inherit">
                close
            </span>
        </button>
    </component>
</template>
