<script>
/**
 * Komponen ProductGalleryComponent.vue
 * Facade utama dan alias resmi untuk ProductGallery
 */
export { default as ProductGallery } from './ProductGallery.vue';
</script>

<script setup>
import ProductGallery from './ProductGallery.vue';
import { ref } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const galleryRef = ref(null);

defineExpose({
    galleryRef,
    get currentIndex() { return galleryRef.value?.currentIndex; },
    next: () => galleryRef.value?.next(),
    prev: () => galleryRef.value?.prev(),
    selectImage: (idx) => galleryRef.value?.selectImage(idx),
    openLightbox: () => galleryRef.value?.openLightbox(),
    closeLightbox: () => galleryRef.value?.closeLightbox(),
});
</script>

<template>
    <ProductGallery
        ref="galleryRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </ProductGallery>
</template>
