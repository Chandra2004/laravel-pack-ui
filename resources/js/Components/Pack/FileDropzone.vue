<script setup>
import { computed, useId, ref } from 'vue';
import InputFile from './Input/InputFile.vue';

const props = defineProps({
    modelValue: {
        type: [File, Array, String, Object],
        default: null,
    },
    variant: {
        type: String,
        default: 'dropzone', // 'dropzone', 'avatar', 'grid', 'list', 'button', 'compact', 'banner', 'paste'
    },
    layout: {
        type: String,
        default: '', // Alias untuk variant
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(v),
    },
    rounded: {
        type: String,
        default: '2xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    radius: {
        type: String,
        default: '',
    },
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'rose', 'amber', 'violet', 'cyan', 'dark'].includes(v),
    },
    color: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    sublabel: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    error: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    subtext: {
        type: String,
        default: '',
    },
    accept: {
        type: String,
        default: '',
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    maxSize: {
        type: [Number, String],
        default: null, // '2KB', '500KB', '5MB', '1GB', angka bytes
    },
    maxFiles: {
        type: Number,
        default: null,
    },
    uploading: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: null, // 0 - 100
    },
    simulateUpload: {
        type: Boolean,
        default: false,
    },
    minimal: {
        type: Boolean,
        default: false,
    },
    hideInfo: {
        type: Boolean,
        default: false,
    },
    existingFiles: {
        type: [Array, Object, String],
        default: null,
    },
});

const emit = defineEmits([
    'update:modelValue',
    'change',
    'error',
    'cancel-upload',
    'delete-existing',
    'upload-start',
    'upload-progress',
    'upload-complete',
]);

const inputFileRef = ref(null);

const generatedId = typeof useId === 'function' ? useId() : `dropzone-${Math.random().toString(36).substring(2, 9)}`;
const fieldId = computed(() => props.id || generatedId);

const effectiveVariant = computed(() => {
    return (props.variant || props.layout || 'dropzone').toLowerCase();
});

const onFileUpdate = (val) => {
    emit('update:modelValue', val);
};

const onFileChange = (val) => {
    emit('change', val);
};

const onFileError = (err) => {
    emit('error', err);
};

const onCancelUpload = () => {
    emit('cancel-upload');
};

const triggerPicker = () => {
    inputFileRef.value?.triggerPicker?.();
};

const clear = () => {
    inputFileRef.value?.clear?.();
};

const removeFile = (idx) => {
    inputFileRef.value?.removeFile?.(idx);
};

defineExpose({
    inputFileRef,
    triggerPicker,
    clear,
    removeFile,
    get fileInputRef() { return inputFileRef.value?.fileInputRef; },
    get filePreviews() { return inputFileRef.value?.filePreviews || []; },
});
</script>

<template>
    <div class="space-y-1.5 w-full">
        <!-- Label & Metadata Header -->
        <div v-if="label || $slots.label || sublabel || $slots['label-right']" class="flex items-center justify-between gap-2 px-0.5">
            <label
                :for="fieldId"
                class="block text-xs font-bold text-slate-700 dark:text-slate-200 select-none cursor-pointer"
                @click="triggerPicker"
            >
                <slot name="label">
                    <span>{{ label }}</span>
                    <span v-if="required" class="text-rose-500 ml-0.5" title="Wajib diisi">*</span>
                </slot>
            </label>

            <div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                <slot name="label-right">
                    <span>{{ sublabel }}</span>
                </slot>
            </div>
        </div>

        <!-- Core Dropzone File Engine (InputFile) -->
        <InputFile
            ref="inputFileRef"
            :id="fieldId"
            :name="name"
            :model-value="modelValue"
            :variant="effectiveVariant"
            :size="size"
            :rounded="rounded"
            :radius="radius"
            :color-theme="colorTheme"
            :color="color"
            :placeholder="placeholder"
            :subtext="subtext"
            :accept="accept"
            :multiple="multiple"
            :required="required"
            :disabled="disabled"
            :error="error"
            :max-size="maxSize"
            :max-files="maxFiles"
            :uploading="uploading"
            :progress="progress"
            :simulate-upload="simulateUpload"
            :minimal="minimal"
            :hide-info="hideInfo"
            :existing-files="existingFiles"
            @update:model-value="onFileUpdate"
            @change="onFileChange"
            @error="onFileError"
            @cancel-upload="onCancelUpload"
            @delete-existing="$emit('delete-existing', $event)"
            @upload-start="$emit('upload-start', $event)"
            @upload-progress="$emit('upload-progress', $event)"
            @upload-complete="$emit('upload-complete', $event)"
        >
            <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
                <slot :name="slotName" v-bind="slotData" />
            </template>
        </InputFile>

        <!-- Hint Text -->
        <div v-if="hint && !error" class="text-[11px] text-slate-500 dark:text-slate-400 px-0.5 m-0">
            <slot name="hint">{{ hint }}</slot>
        </div>

        <!-- External Error Message dari props -->
        <div v-if="error" class="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 px-0.5 m-0" role="alert">
            <span class="material-symbols-outlined text-sm leading-none shrink-0">error</span>
            <span>{{ error }}</span>
        </div>

        <!-- Optional Footer Slot -->
        <div v-if="$slots.footer" class="pt-1">
            <slot name="footer" />
        </div>
    </div>
</template>
