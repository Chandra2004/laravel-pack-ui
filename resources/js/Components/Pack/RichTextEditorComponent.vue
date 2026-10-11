<script>
/**
 * Komponen RichTextEditorComponent.vue
 * Facade utama dan alias resmi untuk RichTextEditor beserta sub-komponennya
 */
export { default as RichTextEditor } from './RichTextEditor.vue';
export { default as RichTextToolbar } from './RichText/RichTextToolbar.vue';
export { default as RichTextBubbleMenu } from './RichText/RichTextBubbleMenu.vue';
export { default as RichTextLinkModal } from './RichText/RichTextLinkModal.vue';
export { default as RichTextImageModal } from './RichText/RichTextImageModal.vue';
export { default as RichTextHelpModal } from './RichText/RichTextHelpModal.vue';
</script>

<script setup>
import RichTextEditor from './RichTextEditor.vue';
import { ref } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const editorRef = ref(null);

defineExpose({
    editorRef,
    get editor() {
        return editorRef.value?.editor;
    },
    getHTML: () => editorRef.value?.getHTML?.() || '',
    getRawHTML: () => editorRef.value?.getRawHTML?.() || '',
    getText: () => editorRef.value?.getText?.() || '',
    setContent: (html) => editorRef.value?.setContent?.(html),
    clear: () => editorRef.value?.clear?.(),
    clearFormatting: () => editorRef.value?.clearFormatting?.(),
    openLinkDialog: () => editorRef.value?.openLinkDialog?.(),
    openImageDialog: () => editorRef.value?.openImageDialog?.(),
    setMode: (mode) => editorRef.value?.setMode?.(mode),
    setPreviewDevice: (device) => editorRef.value?.setPreviewDevice?.(device),
    togglePreview: () => editorRef.value?.togglePreview?.(),
    toggleFullscreen: () => editorRef.value?.toggleFullscreen?.(),
    copyHtml: () => editorRef.value?.copyHtml?.(),
    downloadHtml: () => editorRef.value?.downloadHtml?.(),
    get mode() {
        return editorRef.value?.mode;
    },
    get previewDevice() {
        return editorRef.value?.previewDevice;
    },
    get showRawPanel() {
        return editorRef.value?.showRawPanel;
    },
});
</script>

<template>
    <RichTextEditor ref="editorRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </RichTextEditor>
</template>
