<script setup>
import { ref, computed, watch } from 'vue';
import { usePopover } from '@/Composables/Pack/usePopover.js';

const props = defineProps({
    modelValue: {
        type: String,
        default: '#2563EB',
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    triggerStyle: {
        type: String,
        default: 'button', // 'button', 'pill', 'inline-palette'
        validator: (v) => ['button', 'pill', 'inline-palette', 'default'].includes(v),
    },
    pickerStyle: {
        type: String,
        default: 'palette', // 'palette', 'slider', 'minimal'
        validator: (v) => ['palette', 'slider', 'minimal', 'default'].includes(v),
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
    },
    rounded: {
        type: String,
        default: 'xl',
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
    placement: {
        type: String,
        default: 'bottom',
        validator: (v) => ['bottom', 'top', 'left', 'right', 'bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v),
    },
    popoverOffset: {
        type: Number,
        default: 8,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

const triggerRef = ref(null);
const popoverRef = ref(null);
const isOpen = ref(false);
const copied = ref(false);
const activePaletteTab = ref('brand'); // 'brand', 'vivid', 'pastel', 'dark'
const hueValue = ref(220); // 0 to 360
const lightnessValue = ref(50); // 0 to 100

const closePopover = () => {
    if (isOpen.value) {
        isOpen.value = false;
        emit('blur');
    }
};

const { popoverStyle, currentPlacement } = usePopover({
    triggerRef,
    popoverRef,
    isOpen,
    placement: computed(() => props.placement),
    offset: props.popoverOffset,
    onClose: closePopover,
});

const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

const hexInput = ref(props.modelValue || '#2563EB');

watch(() => props.modelValue, (newVal) => {
    if (newVal && isValidHex(newVal)) {
        hexInput.value = newVal.toUpperCase();
    }
}, { immediate: true });

// Curated palette categories
const paletteCategories = {
    brand: [
        '#2563EB', '#3B82F6', '#0284C7', '#0EA5E9',
        '#0D9488', '#10B981', '#16A34A', '#84CC16',
        '#EAB308', '#F59E0B', '#F97316', '#EF4444'
    ],
    vivid: [
        '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
        '#6366F1', '#3B82F6', '#06B6D4', '#14B8A6',
        '#22C55E', '#EAB308', '#FF0055', '#FF5500'
    ],
    pastel: [
        '#BFDBFE', '#BAE6FD', '#A7F3D0', '#BBF7D0',
        '#FEF08A', '#FED7AA', '#FECDD3', '#FBCFE8',
        '#E9D5FF', '#DDD6FE', '#C7D2FE', '#E2E8F0'
    ],
    dark: [
        '#020617', '#0F172A', '#1E293B', '#334155',
        '#475569', '#64748B', '#1C1917', '#292524',
        '#44403C', '#57534E', '#18181B', '#27272A'
    ]
};

// Inline quick colors
const quickInlineColors = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0F172A'
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

// HSL Slider converter
const updateFromSliders = () => {
    const h = hueValue.value;
    const l = lightnessValue.value;
    const s = 90; // Fixed saturation for vibrant picker
    // Convert HSL to HEX
    const hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };
    selectColor(hslToHex(h, s, l));
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

// Eyedropper API
const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

const pickFromScreen = async () => {
    if (!hasEyeDropper) return;
    try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
            selectColor(result.sRGBHex);
        }
    } catch (e) {}
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
    <!-- Trigger Container -->
    <div
        ref="triggerRef"
        class="relative w-full"
    >
        <input
            :id="id"
            type="hidden"
            :name="name"
            :value="modelValue"
        />

        <!-- =================================================================== -->
        <!-- TRIGGER DESIGNS (button, pill, inline-palette)                      -->
        <!-- =================================================================== -->

        <!-- 1. TRIGGER: PILL / COMPACT -->
        <div
            v-if="triggerStyle === 'pill'"
            class="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
            :class="[
                isOpen ? 'ring-4 ring-blue-500/20 border-blue-500' : '',
                disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
            ]"
            @click="toggleOpen"
        >
            <span
                class="w-6 h-6 rounded-full shadow-inner border border-black/10 shrink-0"
                :style="{ backgroundColor: isValidHex(hexInput) ? hexInput : '#2563EB' }"
            />
            <span class="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 uppercase">
                {{ isValidHex(hexInput) ? hexInput : '#2563EB' }}
            </span>
            <span class="material-symbols-outlined text-sm text-slate-400">expand_more</span>
        </div>

        <!-- 2. TRIGGER: INLINE PALETTE CHIPS -->
        <div
            v-else-if="triggerStyle === 'inline-palette'"
            class="flex items-center gap-2 flex-wrap"
        >
            <!-- Active Swatch -->
            <button
                type="button"
                :disabled="disabled || readonly"
                @click="toggleOpen"
                class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center shrink-0 cursor-pointer transition hover:scale-105"
                :style="{ backgroundColor: isValidHex(hexInput) ? hexInput : '#2563EB' }"
                title="Buka pemilih warna lengkap"
            >
                <span class="material-symbols-outlined text-xs text-white drop-shadow-sm">palette</span>
            </button>

            <!-- Quick Dots -->
            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <button
                    v-for="c in quickInlineColors"
                    :key="c"
                    type="button"
                    :disabled="disabled || readonly"
                    @click="selectColor(c)"
                    class="w-6 h-6 rounded-lg transition-transform hover:scale-115 flex items-center justify-center cursor-pointer shadow-2xs"
                    :class="[hexInput.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-blue-500 scale-110' : '']"
                    :style="{ backgroundColor: c }"
                >
                    <span
                        v-if="hexInput.toUpperCase() === c.toUpperCase()"
                        class="material-symbols-outlined text-[10px] text-white font-bold"
                    >
                        check
                    </span>
                </button>
            </div>

            <!-- Hex code badge -->
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold uppercase ml-1">
                {{ hexInput }}
            </span>
        </div>

        <!-- 3. TRIGGER: BUTTON / SWATCH (Default) -->
        <div v-else class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full select-none">
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

            <!-- Helper Text & Eyedropper button -->
            <div class="flex items-center gap-1.5">
                <button
                    v-if="hasEyeDropper"
                    type="button"
                    :disabled="disabled || readonly"
                    @click="pickFromScreen"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Ambil warna dari layar (Eyedropper)"
                >
                    <span class="material-symbols-outlined text-sm">colorize</span>
                </button>
                <span class="text-xs text-slate-400 dark:text-slate-500">
                    Klik swatch untuk palet
                </span>
            </div>
        </div>
    </div>

    <!-- =================================================================== -->
    <!-- FLOATING POPOVER TELEPORTED KE BODY (BEBAS DARI OVERFLOW & Z-INDEX) -->
    <!-- =================================================================== -->
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <div
                v-if="isOpen"
                ref="popoverRef"
                :style="popoverStyle"
                class="fixed z-[99999] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 select-none w-76 sm:w-84 max-w-[calc(100vw-24px)]"
            >
                <!-- DEVELOPER CUSTOM POPOVER SLOT -->
                <slot
                    name="popover"
                    :value="modelValue"
                    :close="closePopover"
                    :select-color="selectColor"
                    :current-color="hexInput"
                    :picker-style="pickerStyle"
                    :placement="currentPlacement"
                >
                    <!-- Header with Eyedropper & Current Color -->
                    <slot name="popover-header" :close="closePopover" :hex="hexInput">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div class="flex items-center gap-2">
                        <span class="w-4 h-4 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: hexInput }" />
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                            {{ hexInput }}
                        </span>
                    </div>

                    <div class="flex items-center gap-1.5">
                        <button
                            v-if="hasEyeDropper"
                            type="button"
                            @click="pickFromScreen"
                            class="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                            title="Ambil warna layar"
                        >
                            <span class="material-symbols-outlined text-base">colorize</span>
                        </button>
                        <button
                            type="button"
                            @click="copyHex"
                            class="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1"
                        >
                            <span class="material-symbols-outlined text-xs">{{ copied ? 'check' : 'content_copy' }}</span>
                            {{ copied ? 'Disalin' : 'Salin' }}
                        </button>
                            </div>
                        </div>
                    </slot>

                <!-- 1. PICKER STYLE: SLIDER / SPECTRUM CANVAS -->
                <div v-if="pickerStyle === 'slider'" class="space-y-3 pt-3">
                    <!-- Hue Rainbow Slider -->
                    <div class="space-y-1">
                        <div class="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>Spektrum Hue (0-360)</span>
                            <span class="font-mono">{{ hueValue }}°</span>
                        </div>
                        <input
                            v-model.number="hueValue"
                            type="range"
                            min="0"
                            max="360"
                            @input="updateFromSliders"
                            class="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-800 [&::-webkit-slider-thumb]:shadow-md"
                        />
                    </div>

                    <!-- Lightness Slider -->
                    <div class="space-y-1">
                        <div class="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>Kecerahan / Lightness</span>
                            <span class="font-mono">{{ lightnessValue }}%</span>
                        </div>
                        <input
                            v-model.number="lightnessValue"
                            type="range"
                            min="10"
                            max="90"
                            @input="updateFromSliders"
                            class="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-black via-slate-500 to-white focus:outline-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-800 [&::-webkit-slider-thumb]:shadow-md"
                        />
                    </div>
                </div>

                <!-- 2. PICKER STYLE: PALETTE TABS (Default Curated Categories) -->
                <div v-else class="space-y-2.5 pt-2.5">
                    <!-- Palette Category Tabs -->
                    <div class="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                        <button
                            v-for="(label, key) in { brand: 'Brand', vivid: 'Vivid', pastel: 'Pastel', dark: 'Dark' }"
                            :key="key"
                            type="button"
                            @click="activePaletteTab = key"
                            class="flex-1 py-1 rounded-md transition text-center capitalize cursor-pointer"
                            :class="activePaletteTab === key ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
                        >
                            {{ label }}
                        </button>
                    </div>

                    <!-- Palette Grid -->
                    <div class="grid grid-cols-6 gap-2">
                        <button
                            v-for="c in paletteCategories[activePaletteTab]"
                            :key="c"
                            type="button"
                            @click="selectColor(c)"
                            class="w-9 h-9 rounded-xl border border-black/10 shadow-2xs transition-transform hover:scale-115 flex items-center justify-center cursor-pointer"
                            :class="[hexInput.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 scale-105' : '']"
                            :style="{ backgroundColor: c }"
                            :title="c"
                        >
                            <span
                                v-if="hexInput.toUpperCase() === c.toUpperCase()"
                                class="material-symbols-outlined text-sm font-bold drop-shadow-sm"
                                :class="c === '#FFFFFF' || activePaletteTab === 'pastel' ? 'text-slate-900' : 'text-white'"
                            >
                                check
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Footer with Native Color Picker & Close -->
                <slot name="popover-footer" :close="closePopover" :select-color="selectColor">
                    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <label class="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium">
                            <span class="material-symbols-outlined text-xs">colorize</span>
                            Pilih warna bebas...
                            <input
                                type="color"
                                :value="isValidHex(hexInput) ? hexInput : '#2563EB'"
                                @input="(e) => selectColor(e.target.value)"
                                class="sr-only"
                            />
                        </label>
                        <button
                            type="button"
                            @click="closePopover"
                            class="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </slot>
            </slot>
        </div>
    </Transition>
</Teleport>
</template>
