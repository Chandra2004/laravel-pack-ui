<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: [Boolean, Array],
        default: false,
    },
    value: {
        type: [String, Number, Boolean],
        default: null,
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
    subtext: {
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
    error: {
        type: String,
        default: '',
    },
    indeterminate: {
        type: Boolean,
        default: false,
    },
    options: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue', 'change']);

const hasOptions = computed(() => Array.isArray(props.options) && props.options.length > 0);

// Single checkbox input element ref to sync native indeterminate property
const singleInputRef = ref(null);

const syncIndeterminate = () => {
    if (singleInputRef.value) {
        singleInputRef.value.indeterminate = Boolean(props.indeterminate && !isSingleChecked.value);
    }
};

onMounted(() => {
    syncIndeterminate();
});

watch(() => props.indeterminate, () => {
    syncIndeterminate();
});

// Single Checkbox Check status
const isSingleChecked = computed(() => {
    if (Array.isArray(props.modelValue)) {
        if (props.value !== null) {
            return props.modelValue.includes(props.value);
        }
        return props.modelValue.length > 0;
    }
    return Boolean(props.modelValue);
});

const toggleSingle = () => {
    if (props.disabled) return;

    if (Array.isArray(props.modelValue)) {
        const current = [...props.modelValue];
        const val = props.value !== null ? props.value : true;
        const idx = current.indexOf(val);
        if (idx > -1) {
            current.splice(idx, 1);
        } else {
            current.push(val);
        }
        emit('update:modelValue', current);
        emit('change', current);
    } else {
        const newVal = !props.modelValue;
        emit('update:modelValue', newVal);
        emit('change', newVal);
    }
};

// Group Options Check status
const isOptionChecked = (optVal) => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(optVal);
    }
    return false;
};

const toggleOption = (optVal, isOptDisabled) => {
    if (props.disabled || isOptDisabled) return;

    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = current.indexOf(optVal);
    if (idx > -1) {
        current.splice(idx, 1);
    } else {
        current.push(optVal);
    }
    emit('update:modelValue', current);
    emit('change', current);
};

defineExpose({
    singleInputRef,
});
</script>

<template>
    <!-- 1. GROUP MODE: Renders list of checkboxes from options array -->
    <div v-if="hasOptions" class="space-y-3 pt-0.5">
        <label
            v-for="(opt, idx) in options"
            :key="idx"
            class="flex items-start gap-3 cursor-pointer select-none group"
            :class="{ 'opacity-50 cursor-not-allowed': disabled || (typeof opt === 'object' && opt.disabled) }"
            @click.prevent="toggleOption(typeof opt === 'object' ? opt.value : opt, typeof opt === 'object' ? opt.disabled : false)"
        >
            <div class="relative flex items-center justify-center pt-0.5">
                <input
                    :id="`${id}-${idx}`"
                    type="checkbox"
                    :name="name"
                    :value="typeof opt === 'object' ? opt.value : opt"
                    :checked="isOptionChecked(typeof opt === 'object' ? opt.value : opt)"
                    :disabled="disabled || (typeof opt === 'object' && opt.disabled)"
                    class="sr-only"
                />
                <div
                    class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150"
                    :class="[
                        isOptionChecked(typeof opt === 'object' ? opt.value : opt)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-4 ring-blue-500/15'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                        error ? 'border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/20' : '',
                    ]"
                >
                    <span
                        class="material-symbols-outlined text-sm font-bold leading-none transition-transform duration-150 ease-out"
                        :class="isOptionChecked(typeof opt === 'object' ? opt.value : opt) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                    >
                        check
                    </span>
                </div>
            </div>

            <!-- Label & Subtext per Option -->
            <div class="space-y-0.5">
                <span
                    class="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                >
                    {{ typeof opt === 'object' ? opt.label : opt }}
                </span>
                <p
                    v-if="typeof opt === 'object' && opt.subtext"
                    class="text-[11px] text-slate-400 dark:text-slate-500"
                >
                    {{ opt.subtext }}
                </p>
            </div>
        </label>
    </div>

    <!-- 2. SINGLE MODE: Standalone checkbox (supports boolean, array value, & indeterminate) -->
    <div
        v-else
        class="flex items-start gap-3 cursor-pointer select-none group pt-0.5"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @click.prevent="toggleSingle"
    >
        <!-- Custom Checkbox Indicator -->
        <div class="relative flex items-center justify-center pt-0.5">
            <input
                ref="singleInputRef"
                :id="id"
                type="checkbox"
                :name="name"
                :checked="isSingleChecked"
                :required="required"
                :disabled="disabled"
                :aria-checked="indeterminate ? 'mixed' : (isSingleChecked ? 'true' : 'false')"
                class="sr-only"
            />
            <div
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150"
                :class="[
                    (isSingleChecked || indeterminate)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-4 ring-blue-500/15'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                    error ? 'border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/20' : '',
                ]"
            >
                <!-- Indeterminate minus icon -->
                <span
                    v-if="indeterminate && !isSingleChecked"
                    class="material-symbols-outlined text-sm font-bold leading-none"
                >
                    remove
                </span>
                <!-- Crisp Checkmark -->
                <span
                    v-else
                    class="material-symbols-outlined text-sm font-bold leading-none transition-transform duration-150 ease-out"
                    :class="isSingleChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                >
                    check
                </span>
            </div>
        </div>

        <!-- Label & Subtext -->
        <div class="space-y-0.5">
            <span
                v-if="label || $slots.default"
                class="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
            >
                <slot>{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5">*</span>
            </span>
            <p v-if="subtext" class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ subtext }}
            </p>
        </div>
    </div>
</template>
