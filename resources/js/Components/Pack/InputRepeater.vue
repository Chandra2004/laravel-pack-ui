<script setup>
import InputRepeater from './Input/InputRepeater.vue';

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <InputRepeater v-bind="$attrs">
        <!-- Forward all slots dynamically -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData || {}" />
        </template>
    </InputRepeater>
</template>

