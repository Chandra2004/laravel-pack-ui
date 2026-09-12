<script setup>
import { ref, computed, useId } from 'vue';
import InputText from './Input/InputText.vue';
import InputSelect from './Input/InputSelect.vue';
import InputTextarea from './Input/InputTextarea.vue';
import InputRadio from './Input/InputRadio.vue';
import InputCheckbox from './Input/InputCheckbox.vue';
import InputSwitch from './Input/InputSwitch.vue';
import InputFile from './Input/InputFile.vue';
import InputColor from './Input/InputColor.vue';
import InputRange from './Input/InputRange.vue';
import InputDatePicker from './Input/InputDatePicker.vue';
import InputOtp from './Input/InputOtp.vue';
import InputMask from './Input/InputMask.vue';

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
        // 'text', 'email', 'password', 'number', 'tel', 'url', 'search',
        // 'date', 'time', 'datetime-local', 'month', 'week', 'currency',
        // 'textarea', 'select', 'checkbox', 'radio', 'switch', 'file', 'color', 'range',
        // 'otp', 'mask'
    },
    name: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
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
    hint: {
        type: String,
        default: '',
    },
    subtext: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    iconRight: {
        type: String,
        default: '',
    },
    prefix: {
        type: String,
        default: '',
    },
    suffix: {
        type: String,
        default: '',
    },
    autocomplete: {
        type: String,
        default: '',
    },
    maxlength: {
        type: [Number, String],
        default: null,
    },
    min: {
        type: [Number, String],
        default: null,
    },
    max: {
        type: [Number, String],
        default: null,
    },
    step: {
        type: [Number, String],
        default: null,
    },
    rows: {
        type: [Number, String],
        default: 3,
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
    },
    options: {
        type: Array,
        default: () => [],
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    accept: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    showPasswordToggle: {
        type: Boolean,
        default: true,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    chipDisplay: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    maxSize: {
        type: [Number, String],
        default: null,
    },
    maxFiles: {
        type: Number,
        default: null,
    },
    currency: {
        type: [Boolean, String],
        default: false,
    },
    rangeLabel: {
        type: String,
        default: 'Nilai',
    },
    rangeFormatter: {
        type: Function,
        default: null,
    },
    uploading: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: null,
    },
    variant: {
        type: String,
        default: '',
    },
    layout: {
        type: String,
        default: '',
    },
    liveValidation: {
        type: Boolean,
        default: true,
    },
    indeterminate: {
        type: Boolean,
        default: false,
    },
    value: {
        type: [String, Number, Boolean],
        default: null,
    },
    // OTP Props
    length: {
        type: Number,
        default: 6,
    },
    integerOnly: {
        type: Boolean,
        default: true,
    },
    masked: {
        type: Boolean,
        default: false,
    },
    separator: {
        type: String,
        default: '',
    },
    separatorAfter: {
        type: Number,
        default: null,
    },
    countdown: {
        type: Number,
        default: 0,
    },
    resendText: {
        type: String,
        default: 'Kirim Ulang Kode OTP',
    },
    // Mask Props
    mask: {
        type: String,
        default: '',
    },
    preset: {
        type: String,
        default: '',
    },
    slotChar: {
        type: String,
        default: '_',
    },
    emitRaw: {
        type: Boolean,
        default: true,
    },
});

const model = defineModel();
defineEmits(['change', 'blur', 'focus', 'clear', 'error', 'cancel-upload', 'validate', 'complete', 'resend']);

// SSR Hydration-safe Unique ID generator (Vue 3.5+)
const generatedId = useId();
const inputId = computed(() => props.id || props.name || generatedId);

// Character Counter
const charCount = computed(() => {
    if (typeof model.value === 'string') {
        return model.value.length;
    }
    return 0;
});

// Label Size typography
const labelSizeClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'text-xs';
        case 'lg':
            return 'text-sm font-bold';
        case 'md':
        default:
            return 'text-xs font-semibold';
    }
});

const controlRef = ref(null);

const focus = () => {
    if (controlRef.value?.focus) {
        controlRef.value.focus();
    }
};

const blur = () => {
    if (controlRef.value?.blur) {
        controlRef.value.blur();
    }
};

defineExpose({
    focus,
    blur,
    inputId,
    controlRef,
});
</script>

<template>
    <div class="w-full space-y-1.5">
        <!-- 1. FIELD HEADER (Label & Char Counter) -->
        <div
            v-if="(label || $slots.label) && !['checkbox', 'radio', 'switch'].includes(type)"
            class="flex items-center justify-between gap-2 select-none"
        >
            <label
                :for="inputId"
                class="block text-slate-700 dark:text-slate-300"
                :class="labelSizeClass"
            >
                <slot name="label">{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
            </label>

            <!-- Char counter -->
            <span
                v-if="maxlength"
                class="text-[11px] font-mono tracking-tight"
                :class="charCount >= Number(maxlength) ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-slate-500'"
            >
                {{ charCount }}/{{ maxlength }}
            </span>
        </div>

        <!-- 2. CONTROL BODY (Delegated to Specialized Subcomponents) -->
        <!-- Checkbox -->
        <InputCheckbox
            v-if="type === 'checkbox'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :value="value"
            :name="name"
            :label="label"
            :subtext="subtext"
            :options="options"
            :indeterminate="indeterminate"
            :required="required"
            :disabled="disabled"
            :error="error"
            @change="$emit('change', $event)"
        >
            <slot />
        </InputCheckbox>

        <!-- Radio -->
        <InputRadio
            v-else-if="type === 'radio'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :label="label"
            :subtext="subtext"
            :options="options"
            :required="required"
            :disabled="disabled"
            :error="error"
            @change="$emit('change', $event)"
        >
            <slot />
        </InputRadio>

        <!-- Switch Toggle -->
        <InputSwitch
            v-else-if="type === 'switch'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :label="label"
            :subtext="subtext"
            :required="required"
            :disabled="disabled"
            :error="error"
            @change="$emit('change', $event)"
        >
            <slot />
        </InputSwitch>

        <!-- Textarea -->
        <InputTextarea
            v-else-if="type === 'textarea'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :rows="rows"
            :auto-resize="autoResize"
            :min-rows="minRows"
            :max-rows="maxRows"
            :resize="resize"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :maxlength="maxlength"
            :size="size"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
        />

        <!-- Select Dropdown -->
        <InputSelect
            v-else-if="type === 'select'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :placeholder="placeholder"
            :options="options"
            :multiple="multiple"
            :clearable="clearable"
            :chip-display="chipDisplay"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :icon="icon"
            :size="size"
            :loading="loading"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            @clear="$emit('clear')"
        >
            <slot />
        </InputSelect>

        <!-- OTP / PIN Input -->
        <InputOtp
            v-else-if="type === 'otp'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :length="length"
            :integer-only="integerOnly"
            :masked="masked"
            :separator="separator"
            :separator-after="separatorAfter"
            :countdown="countdown"
            :resend-text="resendText"
            :size="size"
            :disabled="disabled"
            :readonly="readonly"
            :error="error"
            @change="$emit('change', $event)"
            @complete="$emit('complete', $event)"
            @resend="$emit('resend')"
        />

        <!-- Masked Input (Credit Card, NPWP, NIK, dll) -->
        <InputMask
            v-else-if="type === 'mask'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :mask="mask"
            :preset="preset"
            :placeholder="placeholder"
            :slot-char="slotChar"
            :emit-raw="emitRaw"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :icon="icon"
            :icon-right="iconRight"
            :prefix="prefix"
            :suffix="suffix"
            :size="size"
            :clearable="clearable"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            @clear="$emit('clear')"
        />

        <!-- Color Picker -->
        <InputColor
            v-else-if="type === 'color'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :disabled="disabled"
            :readonly="readonly"
            :error="error"
            @change="$emit('change', $event)"
        />

        <!-- Range Slider -->
        <InputRange
            v-else-if="type === 'range'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :min="min"
            :max="max"
            :step="step"
            :range-label="rangeLabel"
            :range-formatter="rangeFormatter"
            :disabled="disabled"
            :error="error"
            @change="$emit('change', $event)"
        />

        <!-- File Upload -->
        <InputFile
            v-else-if="type === 'file'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :placeholder="placeholder"
            :subtext="subtext"
            :accept="accept"
            :multiple="multiple"
            :variant="variant || layout"
            :required="required"
            :disabled="disabled"
            :error="error"
            :max-size="maxSize"
            :max-files="maxFiles"
            :uploading="uploading"
            :progress="progress"
            @change="$emit('change', $event)"
            @error="$emit('error', $event)"
            @cancel-upload="$emit('cancel-upload')"
        />

        <!-- Date, Time & Datetime-Local Picker (PrimeVue Custom Popover) -->
        <InputDatePicker
            v-else-if="['date', 'time', 'datetime-local'].includes(type)"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :type="type"
            :name="name"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :icon="icon"
            :size="size"
            :min="min"
            :max="max"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            @clear="$emit('clear')"
        />

        <!-- Standard Textual & HTML5 Inputs (Text, Password, Number, Search, Currency, etc.) -->
        <InputText
            v-else
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :type="type"
            :name="name"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :autocomplete="autocomplete"
            :maxlength="maxlength"
            :min="min"
            :max="max"
            :step="step"
            :size="size"
            :icon="icon"
            :icon-right="iconRight"
            :prefix="prefix"
            :suffix="suffix"
            :show-password-toggle="showPasswordToggle"
            :clearable="clearable"
            :loading="loading"
            :currency="currency"
            :options="options"
            :live-validation="liveValidation"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            @clear="$emit('clear')"
            @validate="$emit('validate', $event)"
        />

        <!-- 3. FIELD FOOTER (Hint & Error Messages) -->
        <!-- Hint Text -->
        <p v-if="hint && !error" class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            <slot name="hint">{{ hint }}</slot>
        </p>

        <!-- Error Message with Google Icon -->
        <div
            v-if="error"
            class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5"
            role="alert"
        >
            <span class="material-symbols-outlined text-sm leading-none shrink-0">error</span>
            <span><slot name="error">{{ error }}</slot></span>
        </div>
    </div>
</template>
