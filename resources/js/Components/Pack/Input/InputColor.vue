<script setup>
import { ref, computed, watch } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const props = defineProps({
    modelValue: {
        type: String,
        default: '#2563eb',
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
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
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

const containerRef = ref(null);
const isOpen = ref(false);
const copied = ref(false);

useClickOutside(containerRef, () => {
    if (isOpen.value) {
        isOpen.value = false;
        emit('blur');
    }
});

const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

const hexInput = ref(props.modelValue || '#2563EB');

watch(() => props.modelValue, (newVal) => {
    if (newVal && isValidHex(newVal)) {
        hexInput.value = newVal.toUpperCase();
    }
}, { immediate: true });

// Popular modern palette presets
const presetColors = [
    '#2563EB', '#3B82F6', '#06B6D4', '#10B981',
    '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
    '#6366F1', '#0F172A', '#64748B', '#FFFFFF'
];

const selectColor = (color) => {
    hexInput.value = color.toUpperCase();
    emit('update:modelValue', color.toUpperCase());
    emit('change', color.toUpperCase());
};

const handleTextInput = (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#') && val.length > 0) {
        val = '#' + val;
    }
    hexInput.value = val.toUpperCase();
    if (isValidHex(val)) {
        emit('update:modelValue', val.toUpperCase());
        emit('change', val.toUpperCase());
    }
};

const handleTextBlur = () => {
    if (!isValidHex(hexInput.value)) {
        hexInput.value = (props.modelValue && isValidHex(props.modelValue)) ? props.modelValue.toUpperCase() : '#2563EB';
    }
};

const toggleOpen = () => {
    if (props.disabled || props.readonly) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        emit('focus');
    } else {
        emit('blur');
    }
};

// Eyedropper API support (Chrome, Edge, Opera)
const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

const pickFromScreen = async () => {
    if (!hasEyeDropper) return;
    try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
            selectColor(result.sRGBHex);
        }
    } catch (e) {
        // User canceled eyedropper
    }
};

const copyHex = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(hexInput.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 1500);
    }
};
</script>

<template>
    <div ref="containerRef" class="relative w-full">
        <!-- Hidden Native Input for standard Form submissions -->
        <input
            :id="id"
            type="hidden"
            :name="name"
            :value="modelValue"
        />

        <!-- PrimeVue Trigger (Swatch Box + HEX Input) -->
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full select-none">
            <!-- Swatch Trigger Button -->
            <button
                type="button"
                :disabled="disabled || readonly"
                @click="toggleOpen"
                class="relative w-11 h-10 rounded-xl border shadow-2xs shrink-0 cursor-pointer transition-all duration-150 flex items-center justify-center focus:outline-hidden"
                :class="[
                    isOpen ? 'ring-4 ring-blue-500/20 border-blue-500' : '',
                    error
                        ? 'border-rose-500 ring-4 ring-rose-500/15'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                    disabled ? 'opacity-60 cursor-not-allowed' : '',
                ]"
                :style="{ backgroundColor: isValidHex(hexInput) ? hexInput : '#2563EB' }"
                title="Buka pemilih warna"
            >
                <span
                    class="material-symbols-outlined text-base transition-transform"
                    :class="[
                        isOpen ? 'rotate-180' : '',
                        isValidHex(hexInput) && hexInput.toUpperCase() === '#FFFFFF' ? 'text-slate-800' : 'text-white drop-shadow-sm'
                    ]"
                >
                    expand_more
                </span>
            </button>

            <!-- Validated Hex Code Input -->
            <input
                type="text"
                :value="hexInput"
                maxlength="7"
                placeholder="#000000"
                :disabled="disabled"
                :readonly="readonly"
                @input="handleTextInput"
                @blur="handleTextBlur"
                class="w-28 font-mono text-xs uppercase px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border shadow-2xs transition-all duration-150 focus:outline-hidden"
                :class="[
                    error
                        ? 'border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15',
                    disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed' : '',
                ]"
            />

            <!-- Helper Text -->
            <span class="text-xs text-slate-400 dark:text-slate-500">
                Klik swatch untuk palet warna
            </span>
        </div>

        <!-- PrimeVue Styled Floating Color Panel Popover -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-1"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-1"
        >
            <div
                v-if="isOpen"
                class="absolute left-0 z-50 mt-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 select-none w-72"
            >
                <!-- Header with Title & Eyedropper -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        Palet Warna
                    </span>
                    <div class="flex items-center gap-1">
                        <button
                            v-if="hasEyeDropper"
                            type="button"
                            @click="pickFromScreen"
                            class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                            title="Ambil warna dari layar (Eyedropper)"
                        >
                            <span class="material-symbols-outlined text-base">colorize</span>
                        </button>
                    </div>
                </div>

                <!-- Color Swatch Large Preview with Copy Button -->
                <div class="flex items-center gap-3 my-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                        class="w-12 h-10 rounded-lg shadow-inner border border-black/10 shrink-0"
                        :style="{ backgroundColor: isValidHex(hexInput) ? hexInput : '#2563EB' }"
                    />
                    <div class="min-w-0 flex-1">
                        <div class="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                            {{ isValidHex(hexInput) ? hexInput : '#2563EB' }}
                        </div>
                        <div class="text-[10px] text-slate-400 font-medium">Warna Aktif</div>
                    </div>
                    <button
                        type="button"
                        @click="copyHex"
                        class="px-2 py-1 text-[11px] rounded-md font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs transition cursor-pointer flex items-center gap-1"
                        title="Salin Kode HEX"
                    >
                        <span class="material-symbols-outlined text-xs leading-none">
                            {{ copied ? 'check' : 'content_copy' }}
                        </span>
                        {{ copied ? 'Disalin' : 'Salin' }}
                    </button>
                </div>

                <!-- Preset Swatch Palette Grid -->
                <div class="space-y-1.5">
                    <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Pilihan Cepat</span>
                    <div class="grid grid-cols-6 gap-2">
                        <button
                            v-for="c in presetColors"
                            :key="c"
                            type="button"
                            @click="selectColor(c)"
                            class="w-9 h-9 rounded-lg border border-black/10 shadow-2xs transition-transform duration-100 hover:scale-110 flex items-center justify-center cursor-pointer"
                            :class="[
                                hexInput.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900' : ''
                            ]"
                            :style="{ backgroundColor: c }"
                            :title="c"
                        >
                            <span
                                v-if="hexInput.toUpperCase() === c.toUpperCase()"
                                class="material-symbols-outlined text-sm font-bold drop-shadow-sm"
                                :class="c === '#FFFFFF' ? 'text-slate-900' : 'text-white'"
                            >
                                check
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Native Color Picker Fallback Link -->
                <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <label class="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">palette</span>
                        Pilih warna kustom...
                        <input
                            type="color"
                            :value="isValidHex(hexInput) ? hexInput : '#2563EB'"
                            @input="(e) => selectColor(e.target.value)"
                            class="sr-only"
                        />
                    </label>
                    <button
                        type="button"
                        @click="isOpen = false"
                        class="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>
