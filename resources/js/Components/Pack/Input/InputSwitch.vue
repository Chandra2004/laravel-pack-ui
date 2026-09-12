<script setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
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
        class="flex items-start justify-between gap-3 pt-0.5 cursor-pointer select-none group"
        :class="[
            disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @click="toggle"
    >
        <div class="space-y-0.5">
            <label
                :for="id"
                class="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-pointer"
            >
                <slot>{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <p v-if="subtext" class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ subtext }}
            </p>
        </div>

        <button
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="modelValue ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'"
        >
            <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
            />
        </button>
    </div>
</template>

