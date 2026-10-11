<script>
/**
 * Komponen SkeletonComponent.vue
 * Facade utama yang mengekspor komponen Skeleton dan seluruh compound sub-komponen
 * (SkeletonShape, SkeletonText, SkeletonAvatar, SkeletonButton, SkeletonImage, SkeletonBadge, SkeletonInput, SkeletonCard, SkeletonLayout)
 */
export { default as SkeletonShape } from './Skeleton/SkeletonShape.vue';
export { default as SkeletonText } from './Skeleton/SkeletonText.vue';
export { default as SkeletonAvatar } from './Skeleton/SkeletonAvatar.vue';
export { default as SkeletonButton } from './Skeleton/SkeletonButton.vue';
export { default as SkeletonImage } from './Skeleton/SkeletonImage.vue';
export { default as SkeletonBadge } from './Skeleton/SkeletonBadge.vue';
export { default as SkeletonInput } from './Skeleton/SkeletonInput.vue';
export { default as SkeletonCard } from './Skeleton/SkeletonCard.vue';
export { default as SkeletonLayout } from './Skeleton/SkeletonLayout.vue';
</script>

<script setup>
import Skeleton from './Skeleton.vue';
import { ref } from 'vue';

const skeletonRef = ref(null);

defineExpose({
    skeletonRef,
});
</script>

<template>
    <Skeleton ref="skeletonRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </Skeleton>
</template>
