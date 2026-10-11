<script setup>
import { computed } from 'vue';
import SkeletonShape from './SkeletonShape.vue';

const props = defineProps({
    size: {
        type: String,
        default: 'md',
    },
    shape: {
        type: String,
        default: 'circle', // 'circle' | 'rounded' | 'square'
    },
    width: {
        type: String,
        default: '',
    },
    height: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '',
    },
    animation: {
        type: String,
        default: '',
    },
    badge: {
        type: Boolean,
        default: false,
    },
});

const mappedShape = computed(() => {
    if (props.shape === 'square') return 'rectangular';
    if (props.shape === 'rounded') return 'rounded';
    return 'circular';
});

const badgeSizeClass = computed(() => {
    switch (props.size) {
        case 'xs': return 'w-2 h-2';
        case 'sm': return 'w-2.5 h-2.5';
        case 'lg': return 'w-4 h-4';
        case 'xl': return 'w-5 h-5';
        case 'md':
        default: return 'w-3 h-3';
    }
});
</script>

<template>
    <div class="relative inline-flex shrink-0">
        <SkeletonShape
            :shape="mappedShape"
            :size="size"
            :width="width"
            :height="height"
            :color="color"
            :animation="animation"
        />
        <!-- Optional status badge dot placeholder in corner -->
        <span
            v-if="badge"
            class="absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900"
            :class="badgeSizeClass"
        >
            <SkeletonShape
                shape="circle"
                :color="color"
                :animation="animation"
                width="100%"
                height="100%"
            />
        </span>
    </div>
</template>
