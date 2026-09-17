<script setup>
import Card from './Card.vue';

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <Card type="product" v-bind="$attrs">
        <!-- Forward all slots dynamically -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData || {}" />
        </template>
    </Card>
</template>

