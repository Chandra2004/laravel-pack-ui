<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    radius: {
        type: String,
        default: '2xl',
    },
    padding: {
        type: String,
        default: 'p-5 sm:p-6',
    },
    color: {
        type: String,
        default: '',
    },
    bordered: {
        type: Boolean,
        default: true,
    },
});

const parentContext = inject('pack_skeleton_context', null);
const activeColor = computed(() => props.color || parentContext?.color?.value || 'slate');

const containerClasses = computed(() => {
    switch (activeColor.value) {
        case 'indigo':
            return 'bg-white/90 dark:bg-slate-900/90 border-indigo-100/90 dark:border-indigo-900/40';
        case 'primary':
        case 'blue':
            return 'bg-white/90 dark:bg-slate-900/90 border-blue-100/90 dark:border-blue-900/40';
        case 'emerald':
        case 'success':
            return 'bg-white/90 dark:bg-slate-900/90 border-emerald-100/90 dark:border-emerald-900/40';
        case 'purple':
        case 'violet':
            return 'bg-white/90 dark:bg-slate-900/90 border-purple-100/90 dark:border-purple-900/40';
        case 'amber':
        case 'warning':
            return 'bg-white/90 dark:bg-slate-900/90 border-amber-100/90 dark:border-amber-900/40';
        case 'rose':
        case 'danger':
            return 'bg-white/90 dark:bg-slate-900/90 border-rose-100/90 dark:border-rose-900/40';
        case 'cyan':
        case 'sky':
            return 'bg-white/90 dark:bg-slate-900/90 border-cyan-100/90 dark:border-cyan-900/40';
        case 'dark':
            return 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700';
        case 'slate':
        default:
            return 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800';
    }
});

const radiusClass = computed(() => {
    switch (props.radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-md';
        case 'md': return 'rounded-xl';
        case 'lg': return 'rounded-2xl';
        case 'xl': return 'rounded-2xl';
        case 'full': return 'rounded-3xl';
        default: return 'rounded-2xl';
    }
});
</script>

<template>
    <div
        :class="[
            'shadow-2xs overflow-hidden w-full flex flex-col justify-between space-y-4',
            bordered ? 'border' : '',
            containerClasses,
            radiusClass,
            padding,
        ]"
    >
        <slot />
    </div>
</template>
