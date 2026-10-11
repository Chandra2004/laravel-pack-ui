<script>
/**
 * Komponen RatingComponent.vue
 * Facade utama dan alias resmi untuk Rating
 */
export { default as Rating } from './Rating.vue';
</script>

<script setup>
import Rating from './Rating.vue';
import { ref } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const ratingRef = ref(null);

defineExpose({
    ratingRef,
    get effectiveValue() {
        return ratingRef.value?.effectiveValue;
    },
    get hoverValue() {
        return ratingRef.value?.hoverValue;
    },
    get activeColorHex() {
        return ratingRef.value?.activeColorHex;
    },
    get inactiveColorHex() {
        return ratingRef.value?.inactiveColorHex;
    },
    get descriptiveText() {
        return ratingRef.value?.descriptiveText;
    },
    get formattedValue() {
        return ratingRef.value?.formattedValue;
    },
});
</script>

<template>
    <Rating ref="ratingRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </Rating>
</template>
