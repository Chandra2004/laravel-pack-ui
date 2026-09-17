<script setup>
import InputTag from './InputTag.vue';

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <InputTag v-bind="$attrs" />
</template>
