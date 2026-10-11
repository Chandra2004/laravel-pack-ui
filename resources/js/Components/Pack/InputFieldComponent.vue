<script>
/**
 * Komponen InputFieldComponent.vue
 * Facade utama dan alias resmi untuk InputField
 */
export { default as InputField } from './InputField.vue';
</script>

<script setup>
import { ref } from 'vue';
import InputField from './InputField.vue';

const inputFieldRef = ref(null);

const focus = () => { inputFieldRef.value?.focus?.(); };
const blur = () => { inputFieldRef.value?.blur?.(); };
const clear = () => { inputFieldRef.value?.clear?.(); };
const validate = () => { return inputFieldRef.value?.validate?.(); };
const triggerPicker = () => { inputFieldRef.value?.triggerPicker?.(); };
const removeFile = (idx) => { inputFieldRef.value?.removeFile?.(idx); };

defineExpose({
    inputFieldRef,
    focus,
    blur,
    clear,
    validate,
    triggerPicker,
    removeFile,
    get inputId() { return inputFieldRef.value?.inputId; },
    get controlRef() { return inputFieldRef.value?.controlRef; },
    get inputRef() { return inputFieldRef.value?.inputRef; },
    get inputFileRef() { return inputFieldRef.value?.inputFileRef; },
    get fileInputRef() { return inputFieldRef.value?.fileInputRef; },
    get filePreviews() { return inputFieldRef.value?.filePreviews || []; },
    get value() { return inputFieldRef.value?.value; },
});
</script>

<template>
    <InputField
        ref="inputFieldRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </InputField>
</template>
