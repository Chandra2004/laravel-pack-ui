<script setup>
import { computed, ref } from 'vue';

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
    variant: {
        type: String,
        default: 'glow', // 'glow', 'thick', 'stepper', 'minimal'
        validator: (v) => ['glow', 'thick', 'stepper', 'minimal', 'default'].includes(v),
    },
    color: {
        type: String,
        default: 'primary', // 'primary', 'success', 'warning', 'danger', 'purple'
    },
    rangeLabel: {
        type: String,
        default: 'Nilai',
    },
    rangeFormatter: {
        type: Function,
        default: null,
    },
    showTooltip: {
        type: Boolean,
        default: true,
    },
    showTicks: {
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

const isHovered = ref(false);
const isDragging = ref(false);

const numMin = computed(() => Number(props.min) || 0);
const numMax = computed(() => Number(props.max) || 100);
const numStep = computed(() => Number(props.step) || 1);
const numericValue = computed(() => Number(props.modelValue ?? numMin.value));

const percentage = computed(() => {
    const range = numMax.value - numMin.value;
    if (range <= 0) return 0;
    const pct = ((numericValue.value - numMin.value) / range) * 100;
    return Math.min(100, Math.max(0, pct));
});

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

const stepDown = () => {
    if (props.disabled) return;
    const nextVal = Math.max(numMin.value, numericValue.value - numStep.value);
    emit('update:modelValue', nextVal);
    emit('change', nextVal);
};

const stepUp = () => {
    if (props.disabled) return;
    const nextVal = Math.min(numMax.value, numericValue.value + numStep.value);
    emit('update:modelValue', nextVal);
    emit('change', nextVal);
};

// Theme color tokens
const colorStyles = computed(() => {
    switch (props.color) {
        case 'indigo':
            return {
                gradient: 'from-indigo-600 to-blue-500',
                solid: 'bg-indigo-600',
                thumb: 'border-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
                badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                ring: 'focus:ring-indigo-500/20',
            };
        case 'emerald':
        case 'success':
            return {
                gradient: 'from-emerald-500 to-teal-400',
                solid: 'bg-emerald-600',
                thumb: 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
                badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                ring: 'focus:ring-emerald-500/20',
            };
        case 'amber':
        case 'warning':
            return {
                gradient: 'from-amber-500 to-orange-400',
                solid: 'bg-amber-500',
                thumb: 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
                badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                ring: 'focus:ring-amber-500/20',
            };
        case 'rose':
        case 'danger':
            return {
                gradient: 'from-rose-500 to-pink-500',
                solid: 'bg-rose-600',
                thumb: 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
                badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                ring: 'focus:ring-rose-500/20',
            };
        case 'purple':
            return {
                gradient: 'from-purple-600 to-indigo-500',
                solid: 'bg-purple-600',
                thumb: 'border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
                badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
                ring: 'focus:ring-purple-500/20',
            };
        case 'cyan':
            return {
                gradient: 'from-cyan-500 to-blue-500',
                solid: 'bg-cyan-600',
                thumb: 'border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
                badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
                ring: 'focus:ring-cyan-500/20',
            };
        case 'dark':
            return {
                gradient: 'from-slate-800 to-slate-900',
                solid: 'bg-slate-800 dark:bg-slate-200',
                thumb: 'border-slate-800 dark:border-slate-300 shadow-[0_0_12px_rgba(30,41,59,0.5)]',
                badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
                ring: 'focus:ring-slate-500/20',
            };
        case 'primary':
        default:
            return {
                gradient: 'from-blue-600 to-cyan-500',
                solid: 'bg-blue-600',
                thumb: 'border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.5)]',
                badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                ring: 'focus:ring-blue-500/20',
            };
    }
});
</script>

<template>
    <div
        class="space-y-2.5 w-full select-none"
        :class="[disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '']"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <!-- Header Info -->
        <div class="flex items-center justify-between text-xs font-medium">
            <span class="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{{ rangeLabel }}</span>
                <span
                    class="font-mono font-bold px-2 py-0.5 rounded-md text-xs border"
                    :class="colorStyles.badge"
                >
                    {{ displayValue }}
                </span>
            </span>
            <span class="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {{ min }} &ndash; {{ max }}
            </span>
        </div>

        <!-- 1. VARIANT: STEPPER (Minus & Plus Buttons + Ticks) -->
        <div v-if="variant === 'stepper'" class="flex items-center gap-3">
            <button
                type="button"
                :disabled="disabled || numericValue <= numMin"
                @click="stepDown"
                class="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-40"
                title="Kurang"
            >
                <span class="material-symbols-outlined text-sm">remove</span>
            </button>

            <div class="relative flex-1 flex items-center py-2">
                <!-- Track Background -->
                <div class="absolute inset-x-0 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden pointer-events-none">
                    <div
                        class="h-full bg-linear-to-r transition-all duration-75"
                        :class="colorStyles.gradient"
                        :style="{ width: `${percentage}%` }"
                    />
                </div>

                <!-- Native Slider on top -->
                <input
                    :id="id"
                    :name="name"
                    type="range"
                    :min="numMin"
                    :max="numMax"
                    :step="numStep"
                    :value="numericValue"
                    :disabled="disabled"
                    @input="handleInput"
                    @mousedown="isDragging = true"
                    @mouseup="isDragging = false"
                    class="relative z-10 w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2"
                    :class="[
                        colorStyles.thumb,
                        error ? 'ring-2 ring-rose-500/20' : '',
                    ]"
                />
            </div>

            <button
                type="button"
                :disabled="disabled || numericValue >= numMax"
                @click="stepUp"
                class="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-40"
                title="Tambah"
            >
                <span class="material-symbols-outlined text-sm">add</span>
            </button>
        </div>

        <!-- 2. VARIANT: THICK / CAPSULE (Chunky Modern Capsule Progress Bar) -->
        <div v-else-if="variant === 'thick'" class="relative flex items-center py-1">
            <div class="absolute inset-x-0 h-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden pointer-events-none p-0.5 border border-slate-300/40 dark:border-slate-700">
                <div
                    class="h-full rounded-full bg-linear-to-r transition-all duration-75 flex items-center justify-end pr-2"
                    :class="colorStyles.gradient"
                    :style="{ width: `${percentage}%` }"
                >
                    <span v-if="percentage > 25" class="text-[9px] font-bold text-white font-mono drop-shadow-xs">
                        {{ Math.round(percentage) }}%
                    </span>
                </div>
            </div>

            <input
                :id="id"
                :name="name"
                type="range"
                :min="numMin"
                :max="numMax"
                :step="numStep"
                :value="numericValue"
                :disabled="disabled"
                @input="handleInput"
                class="relative z-10 w-full h-4 bg-transparent appearance-none cursor-pointer focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-105 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2"
                :class="colorStyles.thumb"
            />
        </div>

        <!-- 3. VARIANT: MINIMAL (Hairline sleek bar with ticks) -->
        <div v-else-if="variant === 'minimal'" class="relative flex flex-col py-1 space-y-1">
            <div class="relative flex items-center">
                <div class="absolute inset-x-0 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden pointer-events-none">
                    <div
                        class="h-full bg-linear-to-r transition-all duration-75"
                        :class="colorStyles.solid"
                        :style="{ width: `${percentage}%` }"
                    />
                </div>
                <input
                    :id="id"
                    :name="name"
                    type="range"
                    :min="numMin"
                    :max="numMax"
                    :step="numStep"
                    :value="numericValue"
                    :disabled="disabled"
                    @input="handleInput"
                    class="relative z-10 w-full h-1 bg-transparent appearance-none cursor-pointer focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2"
                    :class="colorStyles.thumb"
                />
            </div>
            <!-- Segmented ticks -->
            <div class="flex justify-between px-1 text-[10px] text-slate-400 font-mono">
                <span>{{ min }}</span>
                <span>{{ Math.round((numMin + numMax) / 2) }}</span>
                <span>{{ max }}</span>
            </div>
        </div>

        <!-- 4. VARIANT: GLOW / GRADIENT (Default Ultra-Modern with Floating Tooltip) -->
        <div v-else class="relative flex items-center py-2">
            <!-- Floating Bubble Value Tooltip -->
            <div
                v-if="showTooltip && (isHovered || isDragging)"
                class="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-bold shadow-lg pointer-events-none transition-all duration-75 z-20"
                :style="{ left: `${percentage}%` }"
            >
                {{ displayValue }}
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-white pointer-events-none" />
            </div>

            <!-- Gradient Track Background -->
            <div class="absolute inset-x-0 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden pointer-events-none">
                <div
                    class="h-full bg-linear-to-r transition-all duration-75"
                    :class="colorStyles.gradient"
                    :style="{ width: `${percentage}%` }"
                />
            </div>

            <!-- Native Range with Styling -->
            <input
                :id="id"
                :name="name"
                type="range"
                :min="numMin"
                :max="numMax"
                :step="numStep"
                :value="numericValue"
                :disabled="disabled"
                @input="handleInput"
                @mousedown="isDragging = true"
                @mouseup="isDragging = false"
                class="relative z-10 w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2"
                :class="[
                    colorStyles.thumb,
                    error ? 'ring-2 ring-rose-500/20' : '',
                ]"
            />
        </div>
    </div>
</template>
