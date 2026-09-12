<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: [Number, String],
        default: 0,
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    min: {
        type: [Number, String],
        default: 0,
    },
    max: {
        type: [Number, String],
        default: 100,
    },
    step: {
        type: [Number, String],
        default: 1,
    },
    rangeLabel: {
        type: String,
        default: 'Nilai',
    },
    rangeFormatter: {
        type: Function,
        default: null,
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

const numericValue = computed(() => Number(props.modelValue ?? props.min ?? 0));

const displayValue = computed(() => {
    if (typeof props.rangeFormatter === 'function') {
        return props.rangeFormatter(numericValue.value);
    }
    return numericValue.value;
});

const handleInput = (e) => {
    const val = Number(e.target.value);
    emit('update:modelValue', val);
    emit('change', val);
};
</script>

<template>
    <div class="space-y-2 w-full">
        <!-- Range Header (Customizable Label & Formatter) -->
        <div class="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
            <span>
                {{ rangeLabel }}:
                <strong class="text-blue-600 dark:text-blue-400 font-mono ml-1">{{ displayValue }}</strong>
            </span>
            <span class="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {{ min }} &ndash; {{ max }}
            </span>
        </div>

        <!-- Range Track with PrimeVue-inspired styled thumb -->
        <div class="relative flex items-center py-1">
            <input
                :id="id"
                :name="name"
                type="range"
                :min="min"
                :max="max"
                :step="step"
                :value="numericValue"
                :disabled="disabled"
                @input="handleInput"
                class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-slate-900"
                :class="error ? 'ring-2 ring-rose-500/20' : ''"
            />
        </div>
    </div>
</template>

