<script setup>
import { computed } from 'vue';
import Avatar from './Avatar.vue';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    max: {
        type: Number,
        default: 4,
    },
    size: {
        type: String,
        default: 'md',
    },
    rounded: {
        type: String,
        default: 'full',
    },
    spacing: {
        type: String,
        default: 'normal', // 'tight', 'normal', 'loose'
        validator: (val) => ['tight', 'normal', 'loose'].includes(val),
    },
});

const visibleItems = computed(() => {
    if (!props.items || props.items.length === 0) return [];
    return props.items.slice(0, props.max);
});

const remainingCount = computed(() => {
    if (!props.items) return 0;
    return Math.max(0, props.items.length - props.max);
});

const spacingClass = computed(() => {
    const spacingMap = {
        xs: { tight: '-space-x-2', normal: '-space-x-1.5', loose: '-space-x-1' },
        sm: { tight: '-space-x-2.5', normal: '-space-x-2', loose: '-space-x-1.5' },
        md: { tight: '-space-x-3', normal: '-space-x-2.5', loose: '-space-x-1.5' },
        lg: { tight: '-space-x-4', normal: '-space-x-3', loose: '-space-x-2' },
        xl: { tight: '-space-x-6', normal: '-space-x-4.5', loose: '-space-x-3' },
        '2xl': { tight: '-space-x-8', normal: '-space-x-6', loose: '-space-x-4' },
        '3xl': { tight: '-space-x-10', normal: '-space-x-8', loose: '-space-x-5' },
    };
    const current = spacingMap[props.size] || spacingMap.md;
    return current[props.spacing] || current.normal;
});

const counterSizeClass = computed(() => {
    switch (props.size) {
        case 'xs': return 'w-6 h-6 text-[9px] font-semibold';
        case 'sm': return 'w-8 h-8 text-[11px] font-semibold';
        case 'lg': return 'w-12 h-12 text-xs font-semibold';
        case 'xl': return 'w-16 h-16 text-sm font-semibold';
        case '2xl': return 'w-20 h-20 text-base font-semibold';
        case '3xl': return 'w-26 h-26 text-lg font-bold';
        case 'md':
        default: return 'w-10 h-10 text-xs font-semibold';
    }
});

const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'squircle': return 'rounded-2xl';
        case 'none': return 'rounded-none';
        case 'full':
        default: return 'rounded-full';
    }
});
</script>

<template>
    <div
        class="inline-flex items-center select-none"
        :class="spacingClass"
        role="group"
        aria-label="Tumpukan avatar tim"
    >
        <!-- Prop-driven Items -->
        <template v-if="visibleItems.length > 0">
            <Avatar
                v-for="(item, idx) in visibleItems"
                :key="idx"
                :src="item.src"
                :name="item.name"
                :alt="item.alt"
                :status="item.status"
                :icon="item.icon"
                :color="item.color"
                :size="size"
                :rounded="rounded"
                border
                class="hover:z-10 hover:scale-105 transition-all duration-150 cursor-pointer"
            />

            <!-- Extra Counter Bubble -->
            <div
                v-if="remainingCount > 0"
                class="shrink-0 flex items-center justify-center font-sans tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900 shadow-2xs hover:scale-105 transition-all duration-150 cursor-pointer"
                :class="[counterSizeClass, roundedClass]"
                :title="`${remainingCount} anggota lainnya`"
            >
                +{{ remainingCount }}
            </div>
        </template>

        <!-- Slot-driven Items -->
        <slot v-else />
    </div>
</template>

