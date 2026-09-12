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
    },
    clearable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const presets = {
    'credit-card': '####-####-####-####',
    'npwp': '##.###.###.#-###.###',
    'nik': '################',
    'postal-code': '#####',
    'phone-id': '####-####-####',
    'expiry': '##/##',
    'cvv': '###',
};

const effectiveMask = computed(() => {
    if (props.mask) return props.mask;
    if (props.preset && presets[props.preset]) return presets[props.preset];
    return '';
});

const effectivePlaceholder = computed(() => {
    if (props.placeholder) return props.placeholder;
    if (effectiveMask.value) {
        return effectiveMask.value.replace(/[#A*]/g, props.slotChar);
    }
    return '';
});

// Format raw string with mask pattern
const formatWithMask = (rawStr, pattern) => {
    if (!rawStr || !pattern) return rawStr || '';
    const cleanRaw = String(rawStr);
    let result = '';
    let rawIndex = 0;

    for (let i = 0; i < pattern.length; i++) {
        if (rawIndex >= cleanRaw.length) break;

        const m = pattern[i];
        const r = cleanRaw[rawIndex];

        if (m === '#') {
            if (/\d/.test(r)) {
                result += r;
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else if (m === 'A') {
            if (/[a-zA-Z]/.test(r)) {
                result += r;
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else if (m === '*') {
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
        const c = formattedStr[i];
        const m = pattern[pIdx];

        if (m === '#' && /\d/.test(c)) {
            raw += c;
            pIdx++;
        } else if (m === 'A' && /[a-zA-Z]/.test(c)) {
            raw += c;
            pIdx++;
        } else if (m === '*' && /[a-zA-Z0-9]/.test(c)) {
            raw += c;
            pIdx++;
        } else if (m !== '#' && m !== 'A' && m !== '*') {
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

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                input: 'px-3 py-1 text-xs min-h-[32px]',
                addon: 'px-2.5 text-xs',
                icon: 'text-base',
            };
        case 'lg':
            return {
                input: 'px-4 py-2.5 text-base min-h-[44px]',
                addon: 'px-3.5 text-sm',
                icon: 'text-xl',
            };
        case 'md':
        default:
            return {
                input: 'px-3.5 py-1.5 text-sm min-h-[38px]',
                addon: 'px-3 text-xs font-semibold',
                icon: 'text-lg',
            };
    }
});
</script>

<template>
    <div class="relative flex items-center w-full">
        <!-- Addon Prefix Text -->
        <span
            v-if="prefix"
            class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl self-stretch select-none"
            :class="sizeClasses.addon"
        >
            {{ prefix }}
        </span>

        <!-- Prefix Icon -->
        <div
            v-if="icon"
            class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
            :class="prefix ? 'left-auto ml-11' : ''"
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
            class="w-full font-mono rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border transition-all duration-150 focus:outline-hidden"
            :class="[
                sizeClasses.input,
                prefix ? 'rounded-l-none' : '',
                suffix ? 'rounded-r-none' : '',
                icon ? 'pl-11' : '',
                (clearable || iconRight) ? 'pr-10' : 'pr-3.5',
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        />

        <!-- Right Action Icons (Clear, Suffix Icon) -->
        <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
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

        <!-- Addon Suffix Text -->
        <span
            v-if="suffix"
            class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-xl self-stretch select-none"
            :class="sizeClasses.addon"
        >
            {{ suffix }}
        </span>
    </div>
</template>

