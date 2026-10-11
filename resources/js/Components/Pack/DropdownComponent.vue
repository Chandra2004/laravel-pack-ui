<script>
/**
 * Komponen DropdownComponent.vue
 * Facade utama dan alias resmi untuk Dropdown
 */
export { default as Dropdown } from './Dropdown.vue';
</script>

<script setup>
import { ref } from 'vue';
import Dropdown from './Dropdown.vue';

const dropdownRef = ref(null);

const open = () => dropdownRef.value?.open?.();
const close = () => dropdownRef.value?.close?.();
const toggle = () => dropdownRef.value?.toggle?.();

defineExpose({
    dropdownRef,
    open,
    close,
    toggle,
    get isOpen() { return dropdownRef.value?.isOpen; },
});
</script>

<template>
    <Dropdown
        ref="dropdownRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </Dropdown>
</template>
