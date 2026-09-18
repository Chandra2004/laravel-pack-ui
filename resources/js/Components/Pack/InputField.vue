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
import InputLocation from './Input/InputLocation.vue';
import InputTag from './Input/InputTag.vue';
import InputRepeater from './Input/InputRepeater.vue';

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
        // 'otp', 'mask', 'location', 'tag', 'tags'
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
    // Tag Props
    allowCustom: {
        type: Boolean,
        default: true,
    },
    separatorKeys: {
        type: Array,
        default: () => ['Tab', 'Enter', ','],
    },
    allowDuplicates: {
        type: Boolean,
        default: false,
    },
    maxTags: {
        type: Number,
        default: null,
    },
    tagVariant: {
        type: String,
        default: 'default',
    },
    pasteSeparators: {
        type: [RegExp, String],
        default: () => /[,;\n\t]+/,
    },
    addOnBlur: {
        type: Boolean,
        default: true,
    },
    removeOnBackspace: {
        type: Boolean,
        default: true,
    },
    lowercase: {
        type: Boolean,
        default: false,
    },
    tagStyle: {
        type: String,
        default: 'soft',
    },
    tagIcon: {
        type: String,
        default: '',
    },
    radius: {
        type: String,
        default: 'xl',
    },
    // Repeater / Multiple Form Props
    fields: {
        type: Array,
        default: () => [],
    },
    defaultItem: {
        type: Object,
        default: null,
    },
    addButtonText: {
        type: String,
        default: 'Tambahkan Data',
    },
    addIcon: {
        type: String,
        default: 'add',
    },
    addPosition: {
        type: String,
        default: 'bottom',
    },
    itemTitle: {
        type: [String, Function],
        default: 'Item',
    },
    itemSubtitle: {
        type: [String, Function],
        default: '',
    },
    columns: {
        type: [Number, String],
        default: 2,
    },
    collapsible: {
        type: Boolean,
        default: false,
    },
    defaultCollapsed: {
        type: Boolean,
        default: false,
    },
    reorderable: {
        type: Boolean,
        default: true,
    },
    deletable: {
        type: Boolean,
        default: true,
    },
    duplicable: {
        type: Boolean,
        default: true,
    },
    confirmDelete: {
        type: Boolean,
        default: false,
    },
    cardVariant: {
        type: String,
        default: 'bordered',
    },
    errors: {
        type: Object,
        default: () => ({}),
    },
    emptyTitle: {
        type: String,
        default: 'Belum ada data',
    },
    emptyDescription: {
        type: String,
        default: 'Klik tombol di bawah untuk menambahkan entri formulir pertama.',
    },
});

const model = defineModel();
defineEmits([
    'change',
    'blur',
    'focus',
    'clear',
    'error',
    'cancel-upload',
    'validate',
    'complete',
    'resend',
    'tag-add',
    'tag-remove',
    'max-reached',
    'item-add',
    'item-remove',
    'item-duplicate',
    'item-move',
]);

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

        <!-- Location Picker (Leaflet + OpenStreetMap & GPS) -->
        <InputLocation
            v-else-if="type === 'location'"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :error="error"
            @change="$emit('change', $event)"
        />

        <!-- Tag / Tags Input (Random & Preset Options) -->
        <InputTag
            v-else-if="['tag', 'tags'].includes(type)"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :options="options"
            :allow-custom="allowCustom"
            :separator-keys="separatorKeys"
            :allow-duplicates="allowDuplicates"
            :max-tags="maxTags"
            :tag-variant="tagVariant"
            :tag-style="tagStyle"
            :tag-icon="tagIcon"
            :icon="icon"
            :radius="radius"
            :paste-separators="pasteSeparators"
            :add-on-blur="addOnBlur"
            :remove-on-backspace="removeOnBackspace"
            :lowercase="lowercase"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :clearable="clearable"
            :size="size"
            :error="error"
            @change="$emit('change', $event)"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
            @clear="$emit('clear')"
            @tag-add="$emit('tag-add', $event)"
            @tag-remove="$emit('tag-remove', $event)"
            @max-reached="$emit('max-reached', $event)"
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

        <!-- Dynamic Form Repeater (Multiple Input Form) -->
        <InputRepeater
            v-else-if="['repeater', 'form-repeater', 'multiple-form'].includes(type)"
            ref="controlRef"
            :id="inputId"
            v-model="model"
            :name="name"
            :fields="fields"
            :default-item="defaultItem"
            :min="min !== null ? Number(min) : 1"
            :max="max !== null ? Number(max) : null"
            :add-button-text="addButtonText"
            :add-icon="addIcon"
            :add-position="addPosition"
            :item-title="itemTitle"
            :item-subtitle="itemSubtitle"
            :columns="columns"
            :collapsible="collapsible"
            :default-collapsed="defaultCollapsed"
            :reorderable="reorderable"
            :deletable="deletable"
            :duplicable="duplicable"
            :confirm-delete="confirmDelete"
            :card-variant="cardVariant"
            :size="size"
            :disabled="disabled"
            :readonly="readonly"
            :errors="errors"
            :empty-title="emptyTitle"
            :empty-description="emptyDescription"
            @change="$emit('change', $event)"
            @item-add="$emit('item-add', $event)"
            @item-remove="$emit('item-remove', $event)"
            @item-duplicate="$emit('item-duplicate', $event)"
            @item-move="$emit('item-move', $event)"
            @max-reached="$emit('max-reached', $event)"
        >
            <!-- Forward dynamic slots -->
            <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps || {}" />
            </template>
        </InputRepeater>

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
