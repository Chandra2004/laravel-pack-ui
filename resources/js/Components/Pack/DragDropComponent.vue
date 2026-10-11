<script>
/**
 * Komponen DragDropComponent.vue
 * Facade utama dan alias resmi untuk DragDrop
 */
export { default as DragDrop } from './DragDrop.vue';
</script>

<script setup>
import { ref } from 'vue';
import DragDrop from './DragDrop.vue';

defineOptions({
    inheritAttrs: false,
});

const dragDropRef = ref(null);

defineExpose({
    dragDropRef,
});
</script>

<template>
    <DragDrop
        ref="dragDropRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </DragDrop>
</template>
