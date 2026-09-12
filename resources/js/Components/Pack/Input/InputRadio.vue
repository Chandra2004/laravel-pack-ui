<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
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
    subtext: {
        type: String,
        default: '',
    },
    options: {
        type: Array,
        default: () => [],
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

const hasOptions = computed(() => props.options && props.options.length > 0);

const isOptionSelected = (optVal) => {
    return String(props.modelValue) === String(optVal);
};

const selectOption = (optVal, isOptDisabled) => {
    if (props.disabled || isOptDisabled) return;
    emit('update:modelValue', optVal);
    emit('change', optVal);
};
</script>

<template>
    <!-- 1. GROUP MODE: Renders list of options -->
    <div v-if="hasOptions" class="space-y-3 pt-0.5">
        <label
            v-for="(opt, idx) in options"
            :key="idx"
            class="flex items-start gap-3 cursor-pointer select-none group"
            :class="{ 'opacity-50 cursor-not-allowed': disabled || (typeof opt === 'object' && opt.disabled) }"
            @click.prevent="selectOption(typeof opt === 'object' ? opt.value : opt, typeof opt === 'object' ? opt.disabled : false)"
        >
            <!-- Custom PrimeVue Radio Button Indicator -->
            <div class="relative flex items-center justify-center pt-0.5">
                <input
                    :id="`${id}-${idx}`"
                    type="radio"
                    :name="name"
                    :value="typeof opt === 'object' ? opt.value : opt"
                    :checked="isOptionSelected(typeof opt === 'object' ? opt.value : opt)"
                    :disabled="disabled || (typeof opt === 'object' && opt.disabled)"
                    class="sr-only"
                />
                <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150"
                    :class="[
                        isOptionSelected(typeof opt === 'object' ? opt.value : opt)
                            ? 'border-blue-600 bg-white dark:bg-slate-900 ring-4 ring-blue-500/15'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                        error ? 'border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/20' : '',
                    ]"
                >
                    <!-- Inner Dot -->
                    <div
                        class="w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform duration-150 ease-out"
                        :class="isOptionSelected(typeof opt === 'object' ? opt.value : opt) ? 'scale-100' : 'scale-0'"
                    />
                </div>
            </div>

            <!-- Option Text & Subtext -->
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

    <!-- 2. SINGLE MODE: Backwards compatibility when options is not provided -->
    <div
        v-else
        class="flex items-start gap-3 cursor-pointer select-none group pt-0.5"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @click.prevent="selectOption(modelValue ? '' : true, disabled)"
    >
        <div class="relative flex items-center justify-center pt-0.5">
            <input
                :id="id"
                type="radio"
                :name="name"
                :checked="!!modelValue"
                :disabled="disabled"
                class="sr-only"
            />
            <div
                class="w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150"
                :class="[
                    modelValue
                        ? 'border-blue-600 bg-white dark:bg-slate-900 ring-4 ring-blue-500/15'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500',
                    error ? 'border-rose-500 dark:border-rose-500 ring-4 ring-rose-500/20' : '',
                ]"
            >
                <div
                    class="w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform duration-150 ease-out"
                    :class="modelValue ? 'scale-100' : 'scale-0'"
                />
            </div>
        </div>

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

