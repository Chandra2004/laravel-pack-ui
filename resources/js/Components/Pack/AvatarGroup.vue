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
    switch (props.spacing) {
        case 'tight': return '-space-x-3.5';
        case 'loose': return '-space-x-1.5';
        case 'normal':
        default: return '-space-x-2.5';
    }
});

const counterSizeClass = computed(() => {
    switch (props.size) {
        case 'xs': return 'w-6 h-6 text-[9px]';
        case 'sm': return 'w-8 h-8 text-xs';
        case 'lg': return 'w-14 h-14 text-sm';
        case 'xl': return 'w-20 h-20 text-base';
        case '2xl': return 'w-28 h-28 text-lg';
        case '3xl': return 'w-36 h-36 text-xl';
        case 'md':
        default: return 'w-10 h-10 text-xs';
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
    <div class="inline-flex items-center select-none" :class="spacingClass">
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
                class="shrink-0 flex items-center justify-center font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ring-2 ring-white dark:ring-slate-900 shadow-2xs hover:scale-105 transition-all duration-150 cursor-pointer"
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

