<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    steps: {
        type: Array,
        default: () => [],
        // [{ label: 'Akun', description: 'Buat akun baru', icon: 'person', optional: false }]
    },
    modelValue: {
        type: Number,
        default: 0,
    },
    orientation: {
        type: String,
        default: 'horizontal', // 'horizontal', 'vertical'
        validator: (val) => ['horizontal', 'vertical'].includes(val),
    },
    variant: {
        type: String,
        default: 'default', // 'default' (dot), 'numbered', 'icon'
        validator: (val) => ['default', 'numbered', 'icon'].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    linear: {
        type: Boolean,
        default: false,
    },
    clickable: {
        type: Boolean,
        default: true,
    },
    showDescription: {
        type: Boolean,
        default: true,
    },
    completedIcon: {
        type: String,
        default: 'check',
    },
    errorSteps: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue', 'step-click']);

const currentStep = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    currentStep.value = val;
});

const getStatus = (index) => {
    if (props.errorSteps.includes(index)) return 'error';
    if (index < currentStep.value) return 'completed';
    if (index === currentStep.value) return 'active';
    return 'pending';
};

const canClick = (index) => {
    if (!props.clickable) return false;
    if (props.linear) {
        // Linear mode: only allow clicking completed steps or next step
        return index <= currentStep.value;
    }
    return true;
};

const goTo = (index) => {
    if (index < 0 || index >= props.steps.length) return;
    if (!canClick(index)) return;
    currentStep.value = index;
    emit('update:modelValue', index);
    emit('step-click', index);
};

const next = () => {
    if (currentStep.value < props.steps.length - 1) {
        goTo(currentStep.value + 1);
    }
};

const prev = () => {
    if (currentStep.value > 0) {
        goTo(currentStep.value - 1);
    }
};

// Size classes
const indicatorSize = computed(() => {
    switch (props.size) {
        case 'sm': return { container: 'w-7 h-7', icon: 'text-xs', text: 'text-[10px] font-bold', dot: 'w-2.5 h-2.5', line: 'h-0.5' };
        case 'lg': return { container: 'w-11 h-11', icon: 'text-lg', text: 'text-sm font-bold', dot: 'w-4 h-4', line: 'h-1' };
        case 'md':
        default: return { container: 'w-9 h-9', icon: 'text-base', text: 'text-xs font-bold', dot: 'w-3 h-3', line: 'h-0.5' };
    }
});

const labelSize = computed(() => {
    switch (props.size) {
        case 'sm': return { label: 'text-[11px]', desc: 'text-[10px]' };
        case 'lg': return { label: 'text-sm', desc: 'text-xs' };
        case 'md':
        default: return { label: 'text-xs', desc: 'text-[11px]' };
    }
});

const statusClasses = (status) => {
    switch (status) {
        case 'completed':
            return {
                ring: 'bg-blue-600 dark:bg-blue-500 text-white border-2 border-blue-600 dark:border-blue-500',
                line: 'bg-blue-600 dark:bg-blue-500',
                label: 'text-blue-600 dark:text-blue-400 font-semibold',
            };
        case 'active':
            return {
                ring: 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/50',
                line: 'bg-slate-200 dark:bg-slate-700',
                label: 'text-slate-900 dark:text-white font-bold',
            };
        case 'error':
            return {
                ring: 'bg-rose-600 dark:bg-rose-500 text-white border-2 border-rose-600 dark:border-rose-500',
                line: 'bg-rose-300 dark:bg-rose-700',
                label: 'text-rose-600 dark:text-rose-400 font-semibold',
            };
        case 'pending':
        default:
            return {
                ring: 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-2 border-slate-300 dark:border-slate-700',
                line: 'bg-slate-200 dark:bg-slate-700',
                label: 'text-slate-400 dark:text-slate-500 font-medium',
            };
    }
};

defineExpose({ next, prev, goTo, currentStep });
</script>

<template>
    <!-- HORIZONTAL -->
    <div
        v-if="orientation === 'horizontal'"
        class="w-full"
        role="navigation"
        aria-label="Langkah proses"
    >
        <ol class="flex items-center w-full">
            <li
                v-for="(step, index) in steps"
                :key="index"
                :class="[
                    'flex items-center',
                    index < steps.length - 1 ? 'flex-1' : '',
                ]"
            >
                <div class="flex flex-col items-center gap-1.5">
                    <!-- Step Indicator -->
                    <button
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        :aria-current="getStatus(index) === 'active' ? 'step' : undefined"
                        :aria-label="`Langkah ${index + 1}: ${step.label || ''}`"
                        :class="[
                            'inline-flex items-center justify-center rounded-full transition-all duration-200 shrink-0 select-none',
                            indicatorSize.container,
                            statusClasses(getStatus(index)).ring,
                            canClick(index) ? 'cursor-pointer' : 'cursor-default',
                        ]"
                    >
                        <slot name="step" :step="step" :index="index" :status="getStatus(index)">
                            <!-- Completed: Check icon -->
                            <span
                                v-if="getStatus(index) === 'completed'"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >
                                {{ completedIcon }}
                            </span>

                            <!-- Error: Error icon -->
                            <span
                                v-else-if="getStatus(index) === 'error'"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >
                                close
                            </span>

                            <!-- Icon variant -->
                            <span
                                v-else-if="variant === 'icon' && step.icon"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >
                                {{ step.icon }}
                            </span>

                            <!-- Numbered variant -->
                            <span v-else-if="variant === 'numbered'" :class="indicatorSize.text">
                                {{ index + 1 }}
                            </span>

                            <!-- Default: Dot -->
                            <span v-else :class="[indicatorSize.dot, 'rounded-full', getStatus(index) === 'active' ? 'bg-blue-600 dark:bg-blue-400' : 'bg-current']" />
                        </slot>
                    </button>

                    <!-- Label & Description -->
                    <div class="text-center min-w-0 max-w-24 sm:max-w-32">
                        <p
                            :class="[labelSize.label, statusClasses(getStatus(index)).label, 'leading-tight truncate']"
                        >
                            {{ step.label }}
                        </p>
                        <p
                            v-if="showDescription && step.description"
                            :class="[labelSize.desc, 'text-slate-400 dark:text-slate-500 leading-tight mt-0.5 line-clamp-2']"
                        >
                            {{ step.description }}
                        </p>
                        <span
                            v-if="step.optional"
                            :class="[labelSize.desc, 'text-slate-400 dark:text-slate-500 italic']"
                        >
                            Opsional
                        </span>
                    </div>
                </div>

                <!-- Connector Line -->
                <div
                    v-if="index < steps.length - 1"
                    class="flex-1 mx-2 sm:mx-4 mb-auto mt-4 sm:mt-[18px]"
                >
                    <div
                        :class="[
                            indicatorSize.line,
                            'w-full rounded-full transition-colors duration-300',
                            statusClasses(getStatus(index)).line,
                        ]"
                    />
                </div>
            </li>
        </ol>

        <!-- Step Content Slot -->
        <div v-if="$slots.content" class="mt-6">
            <slot name="content" :step="steps[currentStep]" :index="currentStep" />
        </div>
    </div>

    <!-- VERTICAL -->
    <div
        v-else
        role="navigation"
        aria-label="Langkah proses"
    >
        <ol class="space-y-0">
            <li
                v-for="(step, index) in steps"
                :key="index"
                class="flex gap-3"
            >
                <!-- Indicator Column -->
                <div class="flex flex-col items-center">
                    <!-- Step Circle -->
                    <button
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        :aria-current="getStatus(index) === 'active' ? 'step' : undefined"
                        :aria-label="`Langkah ${index + 1}: ${step.label || ''}`"
                        :class="[
                            'inline-flex items-center justify-center rounded-full transition-all duration-200 shrink-0 select-none',
                            indicatorSize.container,
                            statusClasses(getStatus(index)).ring,
                            canClick(index) ? 'cursor-pointer' : 'cursor-default',
                        ]"
                    >
                        <slot name="step" :step="step" :index="index" :status="getStatus(index)">
                            <span
                                v-if="getStatus(index) === 'completed'"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >{{ completedIcon }}</span>
                            <span
                                v-else-if="getStatus(index) === 'error'"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >close</span>
                            <span
                                v-else-if="variant === 'icon' && step.icon"
                                class="material-symbols-outlined leading-none select-none"
                                :class="indicatorSize.icon"
                            >{{ step.icon }}</span>
                            <span v-else-if="variant === 'numbered'" :class="indicatorSize.text">{{ index + 1 }}</span>
                            <span v-else :class="[indicatorSize.dot, 'rounded-full', getStatus(index) === 'active' ? 'bg-blue-600 dark:bg-blue-400' : 'bg-current']" />
                        </slot>
                    </button>

                    <!-- Vertical Connector -->
                    <div
                        v-if="index < steps.length - 1"
                        class="w-0.5 flex-1 min-h-6 my-1 rounded-full transition-colors duration-300"
                        :class="statusClasses(getStatus(index)).line"
                    />
                </div>

                <!-- Label Content Column -->
                <div :class="['pb-6 pt-1.5 min-w-0 flex-1', index === steps.length - 1 ? 'pb-0' : '']">
                    <p :class="[labelSize.label, statusClasses(getStatus(index)).label, 'leading-tight']">
                        {{ step.label }}
                        <span v-if="step.optional" class="text-slate-400 dark:text-slate-500 font-normal italic ml-1">
                            (Opsional)
                        </span>
                    </p>
                    <p
                        v-if="showDescription && step.description"
                        :class="[labelSize.desc, 'text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5']"
                    >
                        {{ step.description }}
                    </p>

                    <!-- Inline Step Content -->
                    <div v-if="$slots.content && index === currentStep" class="mt-3">
                        <slot name="content" :step="steps[currentStep]" :index="currentStep" />
                    </div>
                </div>
            </li>
        </ol>
    </div>
</template>

