<script setup>
import SkeletonShape from './SkeletonShape.vue';

const props = defineProps({
    aspect: {
        type: String,
        default: 'video', // 'video', 'square', 'wide', 'portrait', 'banner'
    },
    width: {
        type: String,
        default: '100%',
    },
    height: {
        type: String,
        default: '',
    },
    radius: {
        type: String,
        default: 'xl',
    },
    color: {
        type: String,
        default: '',
    },
    animation: {
        type: String,
        default: '',
    },
    icon: {
        type: [Boolean, String],
        default: true,
    },
});
</script>

<template>
    <div class="w-full overflow-hidden">
        <SkeletonShape
            shape="image"
            :aspect="aspect"
            :width="width"
            :height="height"
            :radius="radius"
            :color="color"
            :animation="animation"
            :icon-placeholder="icon"
        />
    </div>
</template>
