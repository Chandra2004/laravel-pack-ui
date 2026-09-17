<script setup>
import LocationPicker from '../LocationPicker.vue';

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <LocationPicker v-bind="$attrs" />
</template>
