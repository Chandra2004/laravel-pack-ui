<script>
/**
 * Komponen LocationPickerComponent.vue
 * Facade utama dan alias resmi untuk LocationPicker
 */
export { default as LocationPicker } from './LocationPicker.vue';
</script>

<script setup>
import { ref } from 'vue';
import LocationPicker from './LocationPicker.vue';

defineOptions({
    inheritAttrs: false,
});

const locationPickerRef = ref(null);

defineExpose({
    locationPickerRef,
    openMapModal: () => locationPickerRef.value?.openMapModal?.(),
    closeMapModal: () => locationPickerRef.value?.closeMapModal?.(),
    toggleInlineMap: () => locationPickerRef.value?.toggleInlineMap?.(),
    detectCurrentLocation: () => locationPickerRef.value?.detectCurrentLocation?.(),
    clearLocation: () => locationPickerRef.value?.clearLocation?.(),
    get currentLat() { return locationPickerRef.value?.currentLat; },
    get currentLng() { return locationPickerRef.value?.currentLng; },
    get currentAddress() { return locationPickerRef.value?.currentAddress; },
});
</script>

<template>
    <LocationPicker
        ref="locationPickerRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </LocationPicker>
</template>
