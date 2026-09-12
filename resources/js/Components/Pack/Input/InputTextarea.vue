<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    modelValue: {
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
    placeholder: {
        type: String,
        default: '',
    },
    rows: {
        type: [Number, String],
        default: 3,
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    maxlength: {
        type: [Number, String],
        default: null,
    },
    size: {
        type: String,
        default: 'md',
    },
});

defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

const textareaRef = ref(null);

const focus = () => {
    textareaRef.value?.focus();
};

const blur = () => {
    textareaRef.value?.blur();
};

defineExpose({
    focus,
    blur,
    textareaRef,
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'px-2.5 py-1.5 text-xs';
        case 'lg':
            return 'px-3.5 py-3 text-base';
        case 'md':
        default:
            return 'px-3 py-2 text-sm';
    }
});
</script>

<template>
    <div class="relative w-full">
        <textarea
            ref="textareaRef"
            :id="id"
            :name="name"
            :rows="rows"
            :value="modelValue"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :maxlength="maxlength"
            @input="$emit('update:modelValue', $event.target.value)"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            class="w-full rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border transition-all duration-150 focus:outline-hidden"
            :class="[
                sizeClasses,
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        />
    </div>
</template>

