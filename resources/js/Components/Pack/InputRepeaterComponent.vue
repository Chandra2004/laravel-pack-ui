<script>
/**
 * Komponen InputRepeaterComponent.vue
 * Facade utama dan alias resmi untuk InputRepeater
 */
export { default as InputRepeater } from './InputRepeater.vue';
</script>

<script setup>
import { ref } from 'vue';
import InputRepeater from './InputRepeater.vue';

defineOptions({
    inheritAttrs: false,
});

const inputRepeaterRef = ref(null);

defineExpose({
    inputRepeaterRef,
    addItem: (...args) => inputRepeaterRef.value?.addItem?.(...args),
    removeItem: (...args) => inputRepeaterRef.value?.removeItem?.(...args),
    forceRemoveItem: (...args) => inputRepeaterRef.value?.forceRemoveItem?.(...args),
    promptDeleteItem: (...args) => inputRepeaterRef.value?.promptDeleteItem?.(...args),
    duplicateItem: (...args) => inputRepeaterRef.value?.duplicateItem?.(...args),
    moveUp: (...args) => inputRepeaterRef.value?.moveUp?.(...args),
    moveDown: (...args) => inputRepeaterRef.value?.moveDown?.(...args),
    toggleCollapse: (...args) => inputRepeaterRef.value?.toggleCollapse?.(...args),
    createBlankItem: (...args) => inputRepeaterRef.value?.createBlankItem?.(...args),
    items: inputRepeaterRef,
});
</script>

<template>
    <InputRepeater
        ref="inputRepeaterRef"
        v-bind="$attrs"
    >
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData || {}" />
        </template>
    </InputRepeater>
</template>
