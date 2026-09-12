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
        default: 'dropzone', // 'dropzone' (hero banner), 'grid' (multi gallery), 'list' (document rows), 'avatar' (profile)
    },
    layout: {
        type: String,
        default: '', // Alias untuk variant
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
        default: '', // Judul utama dropzone
    },
    subtext: {
        type: String,
        default: '', // Keterangan format/ukuran di bawah judul
    },
    accept: {
        type: String,
        default: '', // Contoh: 'image/*', '.pdf,.docx', 'image/*,.pdf'
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
        default: null, // Contoh: '5MB', '500KB', atau angka bytes
    },
    maxFiles: {
        type: Number,
        default: null, // Batas jumlah berkas untuk multiple upload
    },
    uploading: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: null, // 0 - 100
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'error', 'cancel-upload']);

const inputFileRef = ref(null);

// ID generator untuk mengaitkan label & input file secara andal
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

defineExpose({
    inputFileRef,
});
</script>

<template>
    <div class="space-y-1.5 w-full">
        <!-- Label & Metadata Header -->
        <div v-if="label || $slots.label || sublabel || $slots['label-right']" class="flex items-center justify-between gap-2 px-0.5">
            <label :for="fieldId" class="block text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
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
            @update:model-value="onFileUpdate"
            @change="onFileChange"
            @error="onFileError"
            @cancel-upload="onCancelUpload"
        />

        <!-- Hint Text (hanya tampil jika tidak ada error dari prop) -->
        <p v-if="hint && !error" class="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
            <slot name="hint">{{ hint }}</slot>
        </p>

        <!-- External Error Message dari props -->
        <p v-if="error" class="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 px-0.5" role="alert">
            <span class="material-symbols-outlined text-sm leading-none shrink-0">error</span>
            <span>{{ error }}</span>
        </p>

        <!-- Optional Footer Slot -->
        <div v-if="$slots.footer" class="pt-1">
            <slot name="footer" />
        </div>
    </div>
</template>
