<script setup>
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
    radius: {
        type: String,
        default: 'full',
    },
    color: {
        type: String,
        default: '',
    },
    animation: {
        type: String,
        default: '',
    },
});
</script>

<template>
    <div class="inline-flex shrink-0">
        <SkeletonShape
            shape="badge"
            :size="size"
            :width="width"
            :radius="radius"
            :color="color"
            :animation="animation"
        />
    </div>
</template>
