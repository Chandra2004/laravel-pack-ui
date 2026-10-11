<script setup>
import { computed } from 'vue';
import SkeletonShape from './SkeletonShape.vue';

const props = defineProps({
    size: {
        type: String,
        default: 'md',
    },
    width: {
        type: String,
        default: '',
    },
    height: {
        type: String,
        default: '',
    },
    radius: {
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
    block: {
        type: Boolean,
        default: false,
    },
});

const computedWidth = computed(() => {
    if (props.block) return '100%';
    return props.width || undefined;
});
</script>

<template>
    <div :class="block ? 'w-full' : 'inline-flex shrink-0'">
        <SkeletonShape
            shape="button"
            :size="size"
            :width="computedWidth"
            :height="height"
            :radius="radius"
            :color="color"
            :animation="animation"
        />
    </div>
</template>
