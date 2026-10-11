<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

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
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (val) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    autoResize: {
        type: Boolean,
        default: false,
    },
    minRows: {
        type: [Number, String],
        default: null,
    },
    maxRows: {
        type: [Number, String],
        default: null,
    },
    resize: {
        type: String,
        default: 'vertical',
        validator: (val) => ['none', 'vertical', 'both', 'horizontal'].includes(val),
    },
    color: {
        type: String,
        default: 'primary', // 'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
    },
});

const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus']);

const textareaRef = ref(null);

const focus = () => {
    textareaRef.value?.focus();
};

const blur = () => {
    textareaRef.value?.blur();
};

const adjustHeight = () => {
    if (!props.autoResize || !textareaRef.value) return;
    const el = textareaRef.value;
    el.style.height = 'auto';

    let newHeight = el.scrollHeight;

    try {
        const computedStyle = window.getComputedStyle(el);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        const verticalPadding = paddingTop + paddingBottom + borderTop + borderBottom;

        const effectiveMinRows = props.minRows ? Number(props.minRows) : (props.rows ? Number(props.rows) : 1);
        const minHeight = (effectiveMinRows * lineHeight) + verticalPadding;
        if (newHeight < minHeight) {
            newHeight = minHeight;
        }

        if (props.maxRows) {
            const maxHeight = (Number(props.maxRows) * lineHeight) + verticalPadding;
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                el.style.overflowY = 'auto';
            } else {
                el.style.overflowY = 'hidden';
            }
        } else {
            el.style.overflowY = 'hidden';
        }
    } catch {
        // Fallback jika getComputedStyle gagal
    }

    el.style.height = `${newHeight}px`;
};

onMounted(() => {
    if (props.autoResize) {
        nextTick(adjustHeight);
    }
});

watch(() => props.modelValue, () => {
    if (props.autoResize) {
        nextTick(adjustHeight);
    }
});

const handleInput = (e) => {
    emit('input', e);
    emit('update:modelValue', e.target.value);
    if (props.autoResize) {
        adjustHeight();
    }
};

defineExpose({
    focus,
    blur,
    adjustHeight,
    textareaRef,
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return 'px-2 py-1 text-xs';
        case 'sm':
            return 'px-2.5 py-1.5 text-xs';
        case 'lg':
            return 'px-3.5 py-2.5 text-base';
        case 'xl':
            return 'px-4 py-3 text-lg';
        case 'md':
        default:
            return 'px-3 py-2 text-sm';
    }
});

const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case '2xl': return 'rounded-2xl';
        case '3xl':
        case 'full': return 'rounded-3xl';
        case 'xl':
        default: return 'rounded-xl';
    }
});

const resizeClass = computed(() => {
    if (props.autoResize) return 'resize-none';
    switch (props.resize) {
        case 'none': return 'resize-none';
        case 'both': return 'resize';
        case 'vertical':
        default: return 'resize-y';
    }
});

const focusRingClasses = computed(() => {
    switch (props.color) {
        case 'indigo':
            return 'focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';
        case 'emerald':
            return 'focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';
        case 'purple':
            return 'focus:border-purple-600 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15';
        case 'amber':
            return 'focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15';
        case 'rose':
            return 'focus:border-rose-600 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15';
        case 'cyan':
            return 'focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15';
        case 'dark':
            return 'focus:border-slate-800 dark:focus:border-slate-300 focus:ring-4 focus:ring-slate-500/15';
        case 'primary':
        default:
            return 'focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15';
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
            @input="handleInput"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            class="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border transition-all duration-150 focus:outline-hidden"
            :class="[
                sizeClasses,
                roundedClasses,
                resizeClass,
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                    : ['border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600', focusRingClasses],
                disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        />
    </div>
</template>
