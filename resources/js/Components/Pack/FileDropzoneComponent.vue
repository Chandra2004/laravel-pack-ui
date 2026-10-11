<script>
/**
 * Komponen FileDropzoneComponent.vue
 * Facade utama dan alias resmi untuk FileDropzone
 */
export { default as FileDropzone } from './FileDropzone.vue';
</script>

<script setup>
import { ref } from 'vue';
import FileDropzone from './FileDropzone.vue';

const fileDropzoneRef = ref(null);

const triggerPicker = () => {
    fileDropzoneRef.value?.triggerPicker?.();
};

const clear = () => {
    fileDropzoneRef.value?.clear?.();
};

const removeFile = (idx) => {
    fileDropzoneRef.value?.removeFile?.(idx);
};

defineExpose({
    fileDropzoneRef,
    triggerPicker,
    clear,
    removeFile,
    get inputFileRef() { return fileDropzoneRef.value?.inputFileRef; },
    get fileInputRef() { return fileDropzoneRef.value?.fileInputRef; },
    get filePreviews() { return fileDropzoneRef.value?.filePreviews || []; },
});
</script>

<template>
    <FileDropzone
        ref="fileDropzoneRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </FileDropzone>
</template>
