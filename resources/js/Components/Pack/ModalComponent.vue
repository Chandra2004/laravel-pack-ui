<script>
/**
 * Komponen ModalComponent.vue
 * Facade utama dan alias resmi untuk Modal
 */
export { default as Modal } from './Modal.vue';
</script>

<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';

defineOptions({
    inheritAttrs: false,
});

const modalRef = ref(null);

defineExpose({
    modalRef,
    open: () => modalRef.value?.open(),
    close: () => modalRef.value?.close(),
    get isOpen() { return modalRef.value?.isOpen; },
});
</script>

<template>
    <Modal
        ref="modalRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </Modal>
</template>
