<script setup>
import { computed } from 'vue';

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
    variant: {
        type: String,
        default: 'ios', // 'ios', 'icon', 'labeled', 'cyber', 'inset'
        validator: (v) => ['ios', 'icon', 'labeled', 'cyber', 'inset', 'default'].includes(v),
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    color: {
        type: String,
        default: 'primary', // 'primary', 'success', 'warning', 'danger', 'purple'
    },
    onText: {
        type: String,
        default: 'ON',
    },
    offText: {
        type: String,
        default: 'OFF',
    },
    onIcon: {
        type: String,
        default: 'check',
    },
    offIcon: {
        type: String,
        default: 'close',
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

// Color theme classes
const colorClasses = computed(() => {
    switch (props.color) {
        case 'indigo':
            return {
                bg: 'bg-indigo-600',
                ring: 'focus:ring-indigo-500/25',
                border: 'border-indigo-500',
                glow: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]',
            };
        case 'emerald':
        case 'success':
            return {
                bg: 'bg-emerald-600',
                ring: 'focus:ring-emerald-500/25',
                border: 'border-emerald-500',
                glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
            };
        case 'amber':
        case 'warning':
            return {
                bg: 'bg-amber-500',
                ring: 'focus:ring-amber-500/25',
                border: 'border-amber-500',
                glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
            };
        case 'rose':
        case 'danger':
            return {
                bg: 'bg-rose-600',
                ring: 'focus:ring-rose-500/25',
                border: 'border-rose-500',
                glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
            };
        case 'purple':
            return {
                bg: 'bg-purple-600',
                ring: 'focus:ring-purple-500/25',
                border: 'border-purple-500',
                glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
            };
        case 'cyan':
            return {
                bg: 'bg-cyan-600',
                ring: 'focus:ring-cyan-500/25',
                border: 'border-cyan-500',
                glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
            };
        case 'dark':
            return {
                bg: 'bg-slate-800 dark:bg-slate-200',
                ring: 'focus:ring-slate-500/25',
                border: 'border-slate-700 dark:border-slate-300',
                glow: 'shadow-[0_0_12px_rgba(30,41,59,0.4)]',
            };
        case 'primary':
        default:
            return {
                bg: 'bg-blue-600',
                ring: 'focus:ring-blue-500/25',
                border: 'border-blue-500',
                glow: 'shadow-[0_0_12px_rgba(37,99,235,0.4)]',
            };
    }
});

// Size dimensions
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                track: props.variant === 'labeled' ? 'h-5 w-12' : 'h-5 w-9',
                thumb: 'h-3.5 w-3.5',
                translate: props.variant === 'labeled' ? 'translate-x-7' : 'translate-x-4',
                icon: 'text-[10px]',
                text: 'text-[9px]',
            };
        case 'lg':
            return {
                track: props.variant === 'labeled' ? 'h-8 w-18' : 'h-8 w-15',
                thumb: 'h-6.5 w-6.5',
                translate: props.variant === 'labeled' ? 'translate-x-10' : 'translate-x-7',
                icon: 'text-sm',
                text: 'text-xs',
            };
        case 'md':
        default:
            return {
                track: props.variant === 'labeled' ? 'h-6.5 w-15' : 'h-6.5 w-12',
                thumb: 'h-5 w-5',
                translate: props.variant === 'labeled' ? 'translate-x-8.5' : 'translate-x-5.5',
                icon: 'text-xs',
                text: 'text-[10px]',
            };
    }
});
</script>

<template>
    <div
        class="flex items-start justify-between gap-3 pt-0.5 cursor-pointer select-none group"
        :class="[disabled ? 'opacity-50 cursor-not-allowed' : '']"
        @click="toggle"
    >
        <!-- Label & Subtext (Klik pada label/subteks mengaktifkan toggle secara presisi) -->
        <div v-if="label || subtext || $slots.default" class="space-y-0.5">
            <span
                class="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-pointer"
            >
                <slot>{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5">*</span>
            </span>
            <p v-if="subtext" class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ subtext }}
            </p>
        </div>

        <!-- 1. VARIANT: CYBER / TECH MODERN (Square Bevel & LED Indicator) -->
        <button
            v-if="variant === 'cyber'"
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex items-center shrink-0 p-0.5 cursor-pointer rounded-lg border transition-all duration-200 focus:outline-hidden focus:ring-4"
            :class="[
                sizeClasses.track,
                colorClasses.ring,
                modelValue
                    ? `${colorClasses.bg} border-transparent ${colorClasses.glow}`
                    : 'bg-slate-900 border-slate-700 dark:bg-slate-950',
                error ? 'ring-2 ring-rose-500/30 border-rose-500' : '',
            ]"
        >
            <span
                class="pointer-events-none flex items-center justify-center rounded-md bg-white dark:bg-slate-100 shadow-md transition-transform duration-200 ease-in-out font-mono font-bold text-[9px] text-slate-900"
                :class="[
                    sizeClasses.thumb,
                    modelValue ? sizeClasses.translate : 'translate-x-0',
                ]"
            >
                <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="modelValue ? colorClasses.bg : 'bg-slate-400'"
                />
            </span>
        </button>

        <!-- 2. VARIANT: LABELED (Track with inner ON/OFF or YA/TIDAK text) -->
        <button
            v-else-if="variant === 'labeled'"
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex items-center shrink-0 p-0.5 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-4 select-none overflow-hidden"
            :class="[
                sizeClasses.track,
                colorClasses.ring,
                modelValue ? colorClasses.bg : 'bg-slate-300 dark:bg-slate-700',
                error ? 'ring-2 ring-rose-500/30' : '',
            ]"
        >
            <!-- Background Text Label (ON / OFF) -->
            <span
                class="absolute font-bold uppercase tracking-wider font-mono select-none"
                :class="[
                    sizeClasses.text,
                    modelValue ? 'left-2 text-white' : 'right-2 text-slate-500 dark:text-slate-400',
                ]"
            >
                {{ modelValue ? onText : offText }}
            </span>

            <!-- Sliding Thumb -->
            <span
                class="pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out z-10"
                :class="[
                    sizeClasses.thumb,
                    modelValue ? sizeClasses.translate : 'translate-x-0',
                ]"
            />
        </button>

        <!-- 3. VARIANT: ICON / MATERIAL (Thumb with check/close icon) -->
        <button
            v-else-if="variant === 'icon'"
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex items-center shrink-0 p-0.5 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-4"
            :class="[
                sizeClasses.track,
                colorClasses.ring,
                modelValue ? colorClasses.bg : 'bg-slate-300 dark:bg-slate-700',
                error ? 'ring-2 ring-rose-500/30' : '',
            ]"
        >
            <span
                class="pointer-events-none flex items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out"
                :class="[
                    sizeClasses.thumb,
                    modelValue ? `${sizeClasses.translate} text-blue-600` : 'translate-x-0 text-slate-400',
                ]"
            >
                <span class="material-symbols-outlined leading-none font-bold" :class="sizeClasses.icon">
                    {{ modelValue ? onIcon : offIcon }}
                </span>
            </span>
        </button>

        <!-- 4. VARIANT: INSET / NEUMORPHIC (Recessed track & tactile 3D thumb) -->
        <button
            v-else-if="variant === 'inset'"
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex items-center shrink-0 p-1 cursor-pointer rounded-full transition-all duration-200 shadow-inner focus:outline-hidden focus:ring-4"
            :class="[
                sizeClasses.track,
                colorClasses.ring,
                modelValue
                    ? 'bg-slate-900 dark:bg-slate-950 border border-slate-700'
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
                error ? 'ring-2 ring-rose-500/30 border-rose-500' : '',
            ]"
        >
            <span
                class="pointer-events-none flex items-center justify-center rounded-full shadow-lg transition-transform duration-200 ease-in-out border border-black/10"
                :class="[
                    sizeClasses.thumb,
                    modelValue
                        ? `${sizeClasses.translate} ${colorClasses.bg} text-white`
                        : 'translate-x-0 bg-white dark:bg-slate-200 text-slate-400',
                ]"
            >
                <span class="w-1.5 h-1.5 rounded-full" :class="modelValue ? 'bg-white' : 'bg-slate-400'" />
            </span>
        </button>

        <!-- 5. VARIANT: IOS / CAPSULE (Default ultra-sleek modern) -->
        <button
            v-else
            :id="id"
            type="button"
            role="switch"
            :name="name"
            :aria-checked="!!modelValue"
            :disabled="disabled"
            @click.stop="toggle"
            class="relative inline-flex items-center shrink-0 p-0.5 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-4"
            :class="[
                sizeClasses.track,
                colorClasses.ring,
                modelValue ? `${colorClasses.bg} ${colorClasses.glow}` : 'bg-slate-300 dark:bg-slate-700',
                error ? 'ring-2 ring-rose-500/30' : '',
            ]"
        >
            <span
                class="pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out"
                :class="[
                    sizeClasses.thumb,
                    modelValue ? sizeClasses.translate : 'translate-x-0',
                ]"
            />
        </button>
    </div>
</template>
