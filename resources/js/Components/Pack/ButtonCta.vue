<script setup>
import CtaButton from './CtaButton.vue';

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <CtaButton v-bind="$attrs">
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps" />
        </template>
    </CtaButton>
</template>
