<script>
/**
 * Komponen ScrollProgressComponent.vue
 * Facade utama dan alias resmi untuk ScrollProgress
 */
export { default as ScrollProgress } from './ScrollProgress.vue';
export { useScrollProgress } from '@/Composables/Pack/useScrollProgress';
</script>

<script setup>
import ScrollProgress from './ScrollProgress.vue';
import { ref, computed } from 'vue';

const scrollProgressRef = ref(null);

defineExpose({
    scrollProgressRef,
    scrollToTop: (...args) => scrollProgressRef.value?.scrollToTop?.(...args),
    scrollToProgress: (...args) => scrollProgressRef.value?.scrollToProgress?.(...args),
    progress: computed(() => scrollProgressRef.value?.progress),
    isComplete: computed(() => scrollProgressRef.value?.isComplete),
    readingTimeRemaining: computed(() => scrollProgressRef.value?.readingTimeRemaining),
});
</script>

<template>
    <ScrollProgress ref="scrollProgressRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </ScrollProgress>
</template>
