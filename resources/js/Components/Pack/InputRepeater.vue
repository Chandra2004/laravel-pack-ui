<script setup>
import { ref } from 'vue';
import BaseInputRepeater from './Input/InputRepeater.vue';

defineOptions({
    inheritAttrs: false,
});

const repeaterRef = ref(null);

defineExpose({
    addItem: (...args) => repeaterRef.value?.addItem?.(...args),
    removeItem: (...args) => repeaterRef.value?.removeItem?.(...args),
    forceRemoveItem: (...args) => repeaterRef.value?.forceRemoveItem?.(...args),
    promptDeleteItem: (...args) => repeaterRef.value?.promptDeleteItem?.(...args),
    duplicateItem: (...args) => repeaterRef.value?.duplicateItem?.(...args),
    moveUp: (...args) => repeaterRef.value?.moveUp?.(...args),
    moveDown: (...args) => repeaterRef.value?.moveDown?.(...args),
    toggleCollapse: (...args) => repeaterRef.value?.toggleCollapse?.(...args),
    createBlankItem: (...args) => repeaterRef.value?.createBlankItem?.(...args),
    items: repeaterRef,
});
</script>

<template>
    <BaseInputRepeater ref="repeaterRef" v-bind="$attrs">
        <!-- Forward all slots dynamically -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData || {}" />
        </template>
    </BaseInputRepeater>
</template>

