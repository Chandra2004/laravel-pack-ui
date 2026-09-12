<script setup>
const props = defineProps({
    modelValue: {
        type: [Boolean, Array],
        default: false,
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
});

const emit = defineEmits(['update:modelValue', 'change']);

const toggle = () => {
    if (props.disabled) return;
    const newVal = !props.modelValue;
    emit('update:modelValue', newVal);
    emit('change', newVal);
};
</script>

<template>
    <div
        class="flex items-start gap-3 cursor-pointer select-none group pt-0.5"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @click.prevent="toggle"
    >
        <!-- Custom PrimeVue Checkbox Indicator -->
        <div class="relative flex items-center justify-center pt-0.5">
            <input
                :id="id"
                type="checkbox"
                :name="name"
                :checked="!!modelValue"
                :required="required"
                :disabled="disabled"
                class="sr-only"
            />
            <div
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150"
                :class="[
                    modelValue
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-4 ring-blue-500/15'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                    error ? 'border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/20' : '',
                ]"
            >
                <!-- Crisp Checkmark -->
                <span
                    class="material-symbols-outlined text-sm font-bold leading-none transition-transform duration-150 ease-out"
                    :class="modelValue ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
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

