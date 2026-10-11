<script setup>
import SkeletonShape from './SkeletonShape.vue';

const props = defineProps({
    label: {
        type: Boolean,
        default: true,
    },
    labelWidth: {
        type: String,
        default: '30%',
    },
    size: {
        type: String,
        default: 'md',
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
    type: {
        type: String,
        default: 'text', // 'text', 'textarea', 'select'
    },
});
</script>

<template>
    <div class="space-y-1.5 w-full">
        <!-- Label Line -->
        <SkeletonShape
            v-if="label"
            shape="caption"
            :width="labelWidth"
            :color="color"
            :animation="animation"
        />

        <!-- Input Box or Textarea -->
        <SkeletonShape
            v-if="type === 'textarea'"
            shape="rounded"
            height="5rem"
            :radius="radius"
            :color="color"
            :animation="animation"
        />
        <SkeletonShape
            v-else
            shape="input"
            :size="size"
            :height="height"
            :radius="radius"
            :color="color"
            :animation="animation"
        />
    </div>
</template>
