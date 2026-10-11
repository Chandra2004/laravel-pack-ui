<script>
/**
 * Komponen CtaButtonComponent.vue
 * Facade utama dan alias resmi untuk CtaButton
 */
export { default as CtaButton } from './CtaButton.vue';
</script>

<script setup>
import { ref } from 'vue';
import CtaButton from './CtaButton.vue';

defineOptions({
    inheritAttrs: false,
});

const ctaButtonRef = ref(null);

defineExpose({
    ctaButtonRef,
});
</script>

<template>
    <CtaButton
        ref="ctaButtonRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </CtaButton>
</template>
