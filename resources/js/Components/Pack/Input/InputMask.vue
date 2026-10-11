<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: '',
    },
    mask: {
        type: String,
        default: '',
    },
    preset: {
        type: String,
        default: '', // 'credit-card', 'npwp', 'nik', 'postal-code', 'phone-id', 'expiry', 'cvv'
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    slotChar: {
        type: String,
        default: '_',
    },
    emitRaw: {
        type: Boolean,
        default: true, // Emit nilai murni tanpa separator
    },
    required: {
        type: Boolean,
        default: false,
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
    icon: {
        type: String,
        default: '',
    },
    iconRight: {
        type: String,
        default: '',
    },
    prefix: {
        type: String,
        default: '',
    },
    suffix: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    uppercase: {
        type: Boolean,
        default: false,
    },
    showMaskHint: {
        type: Boolean,
        default: false,
    },
    color: {
        type: String,
        default: 'primary', // 'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const presets = {
    'credit-card': '####-####-####-####',
    'npwp': '##.###.###.#-###.###',
    'npwp-16': '####-####-####-####',
    'nik': '################',
    'postal-code': '#####',
    'phone-id': '####-####-####',
    'date-id': '##/##/####',
    'time-id': '##:##',
    'license-plate': 'A #### AA',
    'expiry': '##/##',
    'cvv': '###',
    'ip-address': '###.###.###.###',
    'mac-address': '**:**:**:**:**:**',
};

const effectiveMask = computed(() => {
    if (props.mask) return props.mask;
    if (props.preset && presets[props.preset]) return presets[props.preset];
    return '';
});

const isDigitSlot = (m) => m === '#' || m === '9' || m === 'd';
const isLetterSlot = (m) => m === 'A' || m === 'a';
const isAlphaNumSlot = (m) => m === '*';
const isSlotChar = (m) => isDigitSlot(m) || isLetterSlot(m) || isAlphaNumSlot(m);

const effectivePlaceholder = computed(() => {
    if (props.placeholder) return props.placeholder;
    if (effectiveMask.value) {
        return effectiveMask.value.replace(/[#9daA*]/g, props.slotChar);
    }
    return '';
});

// Format raw string with mask pattern (supports #, 9, d, A, a, *)
const formatWithMask = (rawStr, pattern) => {
    if (!rawStr || !pattern) return rawStr || '';
    const cleanRaw = String(rawStr);
    let result = '';
    let rawIndex = 0;

    for (let i = 0; i < pattern.length; i++) {
        if (rawIndex >= cleanRaw.length) break;

        const m = pattern[i];
        let r = cleanRaw[rawIndex];

        if (props.uppercase && typeof r === 'string') {
            r = r.toUpperCase();
        }

        if (isDigitSlot(m)) {
            if (/\d/.test(r)) {
                result += r;
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else if (isLetterSlot(m)) {
            if (/[a-zA-Z]/.test(r)) {
                result += r;
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else if (isAlphaNumSlot(m)) {
            if (/[a-zA-Z0-9]/.test(r)) {
                result += r;
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else {
            result += m;
            if (r === m) {
                rawIndex++;
            }
        }
    }
    return result;
};

// Extract raw unmasked characters
const extractRaw = (formattedStr, pattern) => {
    if (!formattedStr || !pattern) return formattedStr || '';
    let raw = '';
    let pIdx = 0;

    for (let i = 0; i < formattedStr.length; i++) {
        let c = formattedStr[i];
        const m = pattern[pIdx];

        if (props.uppercase && typeof c === 'string') {
            c = c.toUpperCase();
        }

        if (isDigitSlot(m) && /\d/.test(c)) {
            raw += c;
            pIdx++;
        } else if (isLetterSlot(m) && /[a-zA-Z]/.test(c)) {
            raw += c;
            pIdx++;
        } else if (isAlphaNumSlot(m) && /[a-zA-Z0-9]/.test(c)) {
            raw += c;
            pIdx++;
        } else if (!isSlotChar(m)) {
            if (c === m) {
                pIdx++;
            }
        }
    }
    return raw;
};

const displayValue = ref('');

const syncDisplay = (val) => {
    if (!val) {
        displayValue.value = '';
        return;
    }
    displayValue.value = formatWithMask(String(val), effectiveMask.value);
};

watch(() => props.modelValue, (newVal) => {
    syncDisplay(newVal);
}, { immediate: true });

watch(effectiveMask, () => {
    syncDisplay(props.modelValue);
});

const rawLength = computed(() => {
    return extractRaw(displayValue.value, effectiveMask.value).length;
});

const totalExpectedSlots = computed(() => {
    if (!effectiveMask.value) return 0;
    return (effectiveMask.value.match(/[#9daA*]/g) || []).length;
});

const handleInput = (e) => {
    const inputVal = e.target.value;
    const raw = extractRaw(inputVal, effectiveMask.value);
    const formatted = formatWithMask(raw, effectiveMask.value);

    displayValue.value = formatted;

    const valueToEmit = props.emitRaw ? raw : formatted;
    emit('update:modelValue', valueToEmit);
};

const handleClear = () => {
    displayValue.value = '';
    emit('update:modelValue', '');
    emit('clear');
};

const inputRef = ref(null);

const focus = () => {
    inputRef.value?.focus();
};

const blur = () => {
    inputRef.value?.blur();
};

defineExpose({
    focus,
    blur,
    inputRef,
});

const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none':
            return {
                base: 'rounded-none',
                left: 'rounded-l-none',
                right: 'rounded-r-none',
            };
        case 'sm':
            return {
                base: 'rounded-sm',
                left: 'rounded-l-sm',
                right: 'rounded-r-sm',
            };
        case 'md':
            return {
                base: 'rounded-md',
                left: 'rounded-l-md',
                right: 'rounded-r-md',
            };
        case 'lg':
            return {
                base: 'rounded-lg',
                left: 'rounded-l-lg',
                right: 'rounded-r-lg',
            };
        case '2xl':
            return {
                base: 'rounded-2xl',
                left: 'rounded-l-2xl',
                right: 'rounded-r-2xl',
            };
        case '3xl':
            return {
                base: 'rounded-3xl',
                left: 'rounded-l-3xl',
                right: 'rounded-r-3xl',
            };
        case 'full':
            return {
                base: 'rounded-full',
                left: 'rounded-l-full',
                right: 'rounded-r-full',
            };
        case 'xl':
        default:
            return {
                base: 'rounded-xl',
                left: 'rounded-l-xl',
                right: 'rounded-r-xl',
            };
    }
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                input: 'px-2.5 py-1 text-xs min-h-[28px]',
                addon: 'px-2 text-[11px] font-medium',
                icon: 'text-sm',
                iconPaddingLeft: 'pl-8',
                iconPaddingRight: 'pr-8',
                iconContainerLeft: 'pl-2',
                iconContainerRight: 'pr-2',
            };
        case 'sm':
            return {
                input: 'px-3 py-1.5 text-xs min-h-[32px]',
                addon: 'px-2.5 text-xs font-medium',
                icon: 'text-base',
                iconPaddingLeft: 'pl-9',
                iconPaddingRight: 'pr-9',
                iconContainerLeft: 'pl-2.5',
                iconContainerRight: 'pr-2.5',
            };
        case 'lg':
            return {
                input: 'px-4 py-2.5 text-base min-h-[46px]',
                addon: 'px-3.5 text-sm font-semibold',
                icon: 'text-xl',
                iconPaddingLeft: 'pl-11',
                iconPaddingRight: 'pr-11',
                iconContainerLeft: 'pl-3.5',
                iconContainerRight: 'pr-3.5',
            };
        case 'xl':
            return {
                input: 'px-5 py-3 text-lg min-h-[52px]',
                addon: 'px-4 text-base font-bold',
                icon: 'text-2xl',
                iconPaddingLeft: 'pl-12',
                iconPaddingRight: 'pr-12',
                iconContainerLeft: 'pl-4',
                iconContainerRight: 'pr-4',
            };
        case 'md':
        default:
            return {
                input: 'px-3.5 py-2 text-sm min-h-[38px]',
                addon: 'px-3 text-xs font-semibold',
                icon: 'text-lg',
                iconPaddingLeft: 'pl-10',
                iconPaddingRight: 'pr-10',
                iconContainerLeft: 'pl-3',
                iconContainerRight: 'pr-3',
            };
    }
});

const focusRingClasses = computed(() => {
    switch (props.color) {
        case 'indigo':
            return 'focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';
        case 'emerald':
            return 'focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15';
        case 'purple':
            return 'focus:border-purple-600 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15';
        case 'amber':
            return 'focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15';
        case 'rose':
            return 'focus:border-rose-600 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15';
        case 'cyan':
            return 'focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15';
        case 'dark':
            return 'focus:border-slate-800 dark:focus:border-slate-300 focus:ring-4 focus:ring-slate-500/15';
        case 'primary':
        default:
            return 'focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15';
    }
});
</script>

<template>
    <div class="w-full space-y-1">
        <div class="flex items-stretch w-full">
            <!-- Addon Prefix Text -->
            <span
                v-if="prefix"
                class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-r-0 border-slate-200 dark:border-slate-700 shrink-0 select-none"
                :class="[
                    sizeClasses.addon,
                    roundedClasses.left,
                ]"
            >
                {{ prefix }}
            </span>

            <!-- Input Container with Relative Positioning for Icons -->
            <div class="relative flex-1 min-w-0">
                <!-- Prefix Icon -->
                <div
                    v-if="icon"
                    class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
                    :class="sizeClasses.iconContainerLeft"
                >
                    <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ icon }}</span>
                </div>

                <!-- Masked Native Input -->
                <input
                    ref="inputRef"
                    :id="id"
                    :name="name"
                    type="text"
                    :value="displayValue"
                    :placeholder="effectivePlaceholder"
                    :required="required"
                    :disabled="disabled"
                    :readonly="readonly"
                    @input="handleInput"
                    @change="$emit('change', $event)"
                    @blur="$emit('blur', $event)"
                    @focus="$emit('focus', $event)"
                    class="w-full font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border transition-all duration-150 focus:outline-hidden"
                    :class="[
                        sizeClasses.input,
                        roundedClasses.base,
                        prefix ? 'rounded-l-none' : '',
                        suffix ? 'rounded-r-none' : '',
                        icon ? sizeClasses.iconPaddingLeft : '',
                        (clearable || iconRight) ? sizeClasses.iconPaddingRight : '',
                        error
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                            : ['border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600', focusRingClasses],
                        disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                        readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                    ]"
                />

                <!-- Right Action Icons (Clear, Suffix Icon) -->
                <div
                    class="absolute inset-y-0 right-0 flex items-center gap-1"
                    :class="sizeClasses.iconContainerRight"
                >
                    <button
                        v-if="clearable && displayValue && !disabled && !readonly"
                        type="button"
                        @click="handleClear"
                        class="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                        tabindex="-1"
                        title="Hapus"
                    >
                        <span class="material-symbols-outlined text-base leading-none">cancel</span>
                    </button>

                    <div
                        v-else-if="iconRight"
                        class="flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
                    >
                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ iconRight }}</span>
                    </div>
                </div>
            </div>

            <!-- Addon Suffix Text -->
            <span
                v-if="suffix"
                class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-l-0 border-slate-200 dark:border-slate-700 shrink-0 select-none"
                :class="[
                    sizeClasses.addon,
                    roundedClasses.right,
                ]"
            >
                {{ suffix }}
            </span>
        </div>

        <!-- Optional Mask Helper / Live Indicator -->
        <div
            v-if="showMaskHint && effectiveMask"
            class="flex items-center justify-between gap-2 px-1 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono select-none"
        >
            <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs text-blue-500 leading-none">pin</span>
                <span>Pola: <strong class="text-slate-700 dark:text-slate-200">{{ effectiveMask }}</strong></span>
            </span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Terisi: {{ rawLength }}/{{ totalExpectedSlots }}
            </span>
        </div>
    </div>
</template>
