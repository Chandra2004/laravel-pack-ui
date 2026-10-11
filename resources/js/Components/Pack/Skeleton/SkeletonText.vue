<script setup>
import SkeletonShape from './SkeletonShape.vue';

const props = defineProps({
    lines: {
        type: Number,
        default: 3,
    },
    lineSpacing: {
        type: [String, Number],
        default: '2.5',
    },
    lastLineWidth: {
        type: String,
        default: '70%',
    },
    size: {
        type: String,
        default: '',
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
    heading: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="space-y-2 w-full">
        <!-- Optional heading line on top -->
        <SkeletonShape
            v-if="heading"
            shape="heading"
            :size="size"
            :color="color"
            :animation="animation"
            :radius="radius"
            width="60%"
        />

        <!-- Paragraph lines -->
        <SkeletonShape
            shape="text"
            :lines="lines"
            :line-spacing="lineSpacing"
            :last-line-width="lastLineWidth"
            :size="size"
            :width="width"
            :height="height"
            :radius="radius"
            :color="color"
            :animation="animation"
        />
    </div>
</template>
