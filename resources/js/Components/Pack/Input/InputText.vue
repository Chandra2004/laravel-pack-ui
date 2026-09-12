<script setup>
import { ref, computed, watch } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: '',
    },
    type: {
        type: String,
        default: 'text',
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
    autocomplete: {
        type: String,
        default: '',
    },
    maxlength: {
        type: [Number, String],
        default: null,
    },
    min: {
        type: [Number, String],
        default: null,
    },
    max: {
        type: [Number, String],
        default: null,
    },
    step: {
        type: [Number, String],
        default: null,
    },
    size: {
        type: String,
        default: 'md',
    },
    showPasswordToggle: {
        type: Boolean,
        default: true,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    currency: {
        type: [Boolean, String],
        default: false,
    },
    options: {
        type: Array,
        default: () => [], // Digunakan untuk suggestion list pada type="search" atau autocomplete
    },
    liveValidation: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear', 'validate']);

const containerRef = ref(null);
const isFocused = ref(false);
const showPassword = ref(false);
const showSuggestions = ref(false);

useClickOutside(containerRef, () => {
    showSuggestions.value = false;
});

// Currency formatting support
const isCurrency = computed(() => props.currency !== false || props.type === 'currency');

const formatCurrencyNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('id-ID');
};

// Phone formatting helper: 0812-3456-7890
const formatPhoneNumber = (val) => {
    if (!val) return '';
    const cleaned = String(val).replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

const displayValue = ref('');

const updateDisplayValue = (val) => {
    if (isCurrency.value) {
        displayValue.value = formatCurrencyNumber(val);
    } else if (props.type === 'tel') {
        displayValue.value = formatPhoneNumber(val);
    } else {
        displayValue.value = val === null || val === undefined ? '' : String(val);
    }
};

watch(() => props.modelValue, (newVal) => {
    updateDisplayValue(newVal);
}, { immediate: true });

// Live Validation Rules & Feedback
const liveFeedback = ref('');
const passwordCriteria = ref({
    minChar: false,
    hasUpperLower: false,
    hasNumber: false,
    hasSpecial: false,
});

const passwordStrengthScore = computed(() => {
    let score = 0;
    if (passwordCriteria.value.minChar) score++;
    if (passwordCriteria.value.hasUpperLower) score++;
    if (passwordCriteria.value.hasNumber) score++;
    if (passwordCriteria.value.hasSpecial) score++;
    return score;
});

const passwordStrengthLabel = computed(() => {
    switch (passwordStrengthScore.value) {
        case 4: return { text: 'Sangat Kuat', color: 'text-emerald-500 bg-emerald-500' };
        case 3: return { text: 'Kuat', color: 'text-blue-500 bg-blue-500' };
        case 2: return { text: 'Sedang', color: 'text-amber-500 bg-amber-500' };
        case 1:
        default: return { text: 'Lemah', color: 'text-rose-500 bg-rose-500' };
    }
});

const validateInput = (rawVal) => {
    if (!props.liveValidation) return;

    if (props.type === 'email') {
        if (!rawVal) {
            liveFeedback.value = '';
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(rawVal)) {
            liveFeedback.value = "Email harus mengandung karakter '@' dan domain valid (contoh: nama@domain.com)";
            emit('validate', { valid: false, message: liveFeedback.value });
        } else {
            liveFeedback.value = '';
            emit('validate', { valid: true, message: '' });
        }
    } else if (props.type === 'password') {
        const str = rawVal || '';
        passwordCriteria.value = {
            minChar: str.length >= 8,
            hasUpperLower: /[a-z]/.test(str) && /[A-Z]/.test(str),
            hasNumber: /\d/.test(str),
            hasSpecial: /[^A-Za-z0-9]/.test(str),
        };
        const isValid = str.length >= 8;
        emit('validate', { valid: isValid, score: passwordStrengthScore.value });
    } else if (props.type === 'tel') {
        const digits = String(rawVal).replace(/\D/g, '');
        if (digits.length > 0 && (digits.length < 10 || digits.length > 14)) {
            liveFeedback.value = `Nomor telepon harus antara 10 - 14 digit (saat ini: ${digits.length} digit)`;
            emit('validate', { valid: false, message: liveFeedback.value });
        } else {
            liveFeedback.value = '';
            emit('validate', { valid: true, message: '' });
        }
    }
};

watch(() => props.modelValue, (newVal) => {
    validateInput(newVal);
});

const handleInput = (e) => {
    const rawVal = e.target.value;

    if (isCurrency.value) {
        const cleanDigits = rawVal.replace(/[^\d]/g, '');
        if (cleanDigits === '') {
            displayValue.value = '';
            emit('update:modelValue', null);
            validateInput('');
            return;
        }
        const numericVal = Number(cleanDigits);
        displayValue.value = numericVal.toLocaleString('id-ID');
        emit('update:modelValue', numericVal);
        validateInput(numericVal);
    } else if (props.type === 'tel') {
        const formatted = formatPhoneNumber(rawVal);
        displayValue.value = formatted;
        const cleanDigits = rawVal.replace(/[^\d+]/g, '');
        emit('update:modelValue', cleanDigits);
        validateInput(cleanDigits);
    } else {
        displayValue.value = rawVal;
        const nextVal = props.type === 'number' && rawVal !== '' ? Number(rawVal) : rawVal;
        emit('update:modelValue', nextVal);
        validateInput(rawVal);
    }

    if (props.type === 'search' && filteredSuggestions.value.length > 0) {
        showSuggestions.value = true;
    }
};

const handleClear = () => {
    displayValue.value = '';
    emit('update:modelValue', isCurrency.value || props.type === 'number' ? null : '');
    emit('clear');
    liveFeedback.value = '';
    showSuggestions.value = false;
};

// Search suggestions
const filteredSuggestions = computed(() => {
    if (props.type !== 'search' || !props.options || props.options.length === 0) return [];
    if (!displayValue.value) return props.options;
    const query = String(displayValue.value).toLowerCase();
    return props.options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : String(opt);
        return label.toLowerCase().includes(query);
    });
});

const selectSuggestion = (opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    displayValue.value = typeof opt === 'object' ? opt.label : String(opt);
    emit('update:modelValue', val);
    emit('change', val);
    showSuggestions.value = false;
};

// Size classes (PrimeVue proportional sizing)
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

const effectiveType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    if (isCurrency.value || props.type === 'tel') {
        return 'text';
    }
    return props.type;
});

const rightPaddingClass = computed(() => {
    let count = 0;
    if (props.loading) count++;
    if (props.type === 'password' && props.showPasswordToggle) count++;
    if ((props.clearable || props.type === 'search') && displayValue.value && !props.disabled && !props.readonly) count++;
    if (props.iconRight && count === 0) count++;

    if (count >= 2) return 'pr-16';
    if (count === 1) return 'pr-10';
    return 'pr-3.5';
});

const handleFocus = (e) => {
    isFocused.value = true;
    if (props.type === 'search' && filteredSuggestions.value.length > 0) {
        showSuggestions.value = true;
    }
    emit('focus', e);
};

const handleBlur = (e) => {
    isFocused.value = false;
    emit('blur', e);
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
</script>

<template>
    <div ref="containerRef" class="relative w-full space-y-1">
        <div class="relative flex items-center w-full">
            <!-- Addon Prefix Text -->
            <span
                v-if="prefix"
                class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl self-stretch select-none"
                :class="sizeClasses.addon"
            >
                {{ prefix }}
            </span>

            <!-- Prefix Icon (Properly spaced from text: pl-3.5) -->
            <div
                v-if="icon"
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"
                :class="prefix ? 'left-auto ml-11' : ''"
            >
                <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ icon }}</span>
            </div>

            <!-- HTML5 Native Input with Generous pl-11 Spacing when Icon is Active -->
            <input
                ref="inputRef"
                :id="id"
                :name="name"
                :type="effectiveType"
                :value="displayValue"
                :placeholder="placeholder"
                :required="required"
                :disabled="disabled"
                :readonly="readonly"
                :autocomplete="autocomplete"
                :maxlength="maxlength"
                :min="min"
                :max="max"
                :step="step"
                @input="handleInput"
                @change="$emit('change', $event)"
                @blur="handleBlur"
                @focus="handleFocus"
                class="w-full rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs border transition-all duration-150 focus:outline-hidden"
                :class="[
                    sizeClasses.input,
                    prefix ? 'rounded-l-none' : '',
                    suffix ? 'rounded-r-none' : '',
                    icon ? 'pl-11' : '',
                    rightPaddingClass,
                    (error || liveFeedback)
                        ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                    disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                    readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                ]"
            />

            <!-- Right Action Icons (Clear, Loading, Password Toggle, Suffix Icon) -->
            <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                <!-- Clear Button for Search & Inputs -->
                <button
                    v-if="(clearable || type === 'search') && displayValue && !disabled && !readonly"
                    type="button"
                    @click="handleClear"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                    tabindex="-1"
                    title="Batal / Hapus input"
                    aria-label="Batal / Hapus input"
                >
                    <span class="material-symbols-outlined text-base leading-none">cancel</span>
                </button>

                <!-- Loading Spinner -->
                <span
                    v-if="loading"
                    class="material-symbols-outlined text-base leading-none text-blue-600 dark:text-blue-400 animate-spin select-none"
                    title="Memuat..."
                >
                    progress_activity
                </span>

                <!-- Password Reveal Toggle -->
                <button
                    v-if="type === 'password' && showPasswordToggle"
                    type="button"
                    @click="showPassword = !showPassword"
                    class="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                    tabindex="-1"
                    :aria-label="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                    :title="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                >
                    <span class="material-symbols-outlined text-lg leading-none">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                </button>

                <!-- Suffix Icon -->
                <div
                    v-else-if="iconRight && !loading"
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

        <!-- Live Validation Alert for Email & Phone -->
        <div
            v-if="liveFeedback && !error"
            class="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium px-0.5"
        >
            <span class="material-symbols-outlined text-xs leading-none shrink-0">info</span>
            <span>{{ liveFeedback }}</span>
        </div>

        <!-- PrimeVue Style Password Strength Meter & Live Checklist -->
        <div
            v-if="type === 'password' && isFocused && displayValue"
            class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-2 select-none"
        >
            <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-600 dark:text-slate-400">Kekuatan Sandi:</span>
                <span class="font-bold text-xs" :class="passwordStrengthLabel.color">{{ passwordStrengthLabel.text }}</span>
            </div>

            <!-- 4-Stage Strength Bar -->
            <div class="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="h-full rounded-full transition-colors duration-200"
                    :class="i <= passwordStrengthScore ? passwordStrengthLabel.color : 'bg-slate-200 dark:bg-slate-800'"
                />
            </div>

            <!-- Requirements Checklist -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div class="flex items-center gap-1.5" :class="passwordCriteria.minChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'">
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.minChar ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Min. 8 karakter</span>
                </div>
                <div class="flex items-center gap-1.5" :class="passwordCriteria.hasUpperLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'">
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasUpperLower ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Huruf besar & kecil</span>
                </div>
                <div class="flex items-center gap-1.5" :class="passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'">
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasNumber ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Mengandung angka</span>
                </div>
                <div class="flex items-center gap-1.5" :class="passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'">
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasSpecial ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Simbol (!@#$%^&*)</span>
                </div>
            </div>
        </div>

        <!-- Floating Scrollable Search Results / Suggestions Dropdown -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-1"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-1"
        >
            <div
                v-if="type === 'search' && showSuggestions && filteredSuggestions.length > 0"
                class="absolute left-0 right-0 z-50 mt-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            >
                <div class="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Saran Pencarian ({{ filteredSuggestions.length }})</span>
                    <button
                        type="button"
                        @click="showSuggestions = false"
                        class="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
                <ul class="max-h-56 overflow-y-auto p-1 space-y-0.5">
                    <li
                        v-for="(item, idx) in filteredSuggestions"
                        :key="idx"
                        @click="selectSuggestion(item)"
                        class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                        <span class="material-symbols-outlined text-sm text-slate-400">search</span>
                        <span class="truncate flex-1">{{ typeof item === 'object' ? item.label : item }}</span>
                    </li>
                </ul>
            </div>
        </Transition>
    </div>
</template>
