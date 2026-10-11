<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
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
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (val) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    telDelimiter: {
        type: String,
        default: '-',
    },
    telChunkSize: {
        type: [Number, String, Array],
        default: 4,
    },
    telPattern: {
        type: String,
        default: '',
    },
    searchSuggestions: {
        type: Boolean,
        default: true,
    },
    searchStyle: {
        type: String,
        default: 'dropdown', // 'dropdown', 'spotlight'
        validator: (val) => ['dropdown', 'spotlight'].includes(val),
    },
    emailErrorText: {
        type: String,
        default: '',
    },
    urlErrorText: {
        type: String,
        default: '',
    },
    urlProtocol: {
        type: String,
        default: 'https://',
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
    color: {
        type: String,
        default: 'primary', // 'indigo', 'primary', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
    },
    showStepper: {
        type: Boolean,
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
    showPasswordStrength: {
        type: Boolean,
        default: true,
    },
    passwordRules: {
        type: Object,
        default: () => ({
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true,
        }),
    },
    validator: {
        type: Function,
        default: null,
    },
    pattern: {
        type: [String, RegExp],
        default: null,
    },
    patternMessage: {
        type: String,
        default: 'Format input tidak sesuai ketentuan',
    },
    onWatch: {
        type: Function,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus', 'clear', 'validate', 'keydown']);

const containerRef = ref(null);
const isFocused = ref(false);
const showPassword = ref(false);
const showSuggestions = ref(false);
const highlightedSuggestionIndex = ref(-1);

useClickOutside(containerRef, () => {
    showSuggestions.value = false;
    highlightedSuggestionIndex.value = -1;
});

// Currency formatting support
const isCurrency = computed(() => props.currency !== false || props.type === 'currency');

const formatCurrencyNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('id-ID');
};

// Phone formatting helper: dynamic delimiter, chunk size, or pattern (e.g. 1###-2### or 12-32-43-11)
const formatPhoneNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const delim = props.telDelimiter !== undefined && props.telDelimiter !== null ? props.telDelimiter : '-';
    const pattern = props.telPattern || '';

    // 1. Pola kustom berbasis Masking / Pattern (misal: '1###-2###', '##-##-##-##', '(###) ###-####')
    if (pattern && pattern.includes('#')) {
        const rawDigits = String(val).replace(/\D/g, '');
        let formatted = '';
        let digitIndex = 0;

        for (let i = 0; i < pattern.length && digitIndex < rawDigits.length; i++) {
            const patternChar = pattern[i];
            if (patternChar === '#') {
                formatted += rawDigits[digitIndex];
                digitIndex++;
            } else {
                formatted += patternChar;
            }
        }
        return formatted;
    }

    // 2. Format Chunking Dinamis (misal: 2 digit '12-32-43-11', 4 digit '0812-3456-7890', atau array [3, 4, 4])
    const cleaned = String(val).replace(/\D/g, '');
    if (!cleaned) return '';

    let chunks = [];
    if (Array.isArray(props.telChunkSize)) {
        chunks = props.telChunkSize.map(Number).filter(n => n > 0);
    } else if (typeof props.telChunkSize === 'string' && props.telChunkSize.includes(',')) {
        chunks = props.telChunkSize.split(',').map(s => Number(s.trim())).filter(n => n > 0);
    } else if (typeof props.telChunkSize === 'string' && props.telChunkSize.includes('-')) {
        chunks = props.telChunkSize.split('-').map(s => Number(s.trim())).filter(n => n > 0);
    } else {
        const size = Number(props.telChunkSize) || 4;
        const totalLen = cleaned.length;
        for (let i = 0; i < totalLen; i += size) {
            chunks.push(size);
        }
    }

    if (chunks.length === 0) chunks = [4];

    const parts = [];
    let curIndex = 0;
    for (let i = 0; i < chunks.length && curIndex < cleaned.length; i++) {
        const size = chunks[i];
        parts.push(cleaned.slice(curIndex, curIndex + size));
        curIndex += size;
    }
    // Jika masih ada sisa digit di luar chunk awal yang ditentukan, teruskan per chunk terakhir
    if (curIndex < cleaned.length) {
        const remSize = chunks[chunks.length - 1] || 4;
        while (curIndex < cleaned.length) {
            parts.push(cleaned.slice(curIndex, curIndex + remSize));
            curIndex += remSize;
        }
    }

    return parts.join(delim);
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

watch([() => props.telDelimiter, () => props.telChunkSize, () => props.telPattern], () => {
    if (props.type === 'tel') {
        updateDisplayValue(props.modelValue);
    }
});

// Live Validation Rules & Feedback
const liveFeedback = ref('');

// Normalisasi password rules kustom
const activePasswordRules = computed(() => {
    const rules = props.passwordRules || {};
    return {
        minLength: typeof rules.minLength === 'number' ? rules.minLength : 8,
        requireUppercase: rules.requireUppercase !== false,
        requireLowercase: rules.requireLowercase !== false,
        requireNumbers: rules.requireNumbers !== false,
        requireSymbols: rules.requireSymbols !== false,
    };
});

const passwordCriteria = ref({
    minChar: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
});

// Hitung total kriteria yang aktif
const totalActiveRulesCount = computed(() => {
    let count = 0;
    const r = activePasswordRules.value;
    if (r.minLength > 0) count++;
    if (r.requireUppercase) count++;
    if (r.requireLowercase) count++;
    if (r.requireNumbers) count++;
    if (r.requireSymbols) count++;
    return Math.max(count, 1);
});

// Skor kekuatan sandi berdasarkan aturan aktif yang lolos
const passwordStrengthScore = computed(() => {
    let passed = 0;
    const r = activePasswordRules.value;
    if (r.minLength > 0 && passwordCriteria.value.minChar) passed++;
    if (r.requireUppercase && passwordCriteria.value.hasUppercase) passed++;
    if (r.requireLowercase && passwordCriteria.value.hasLowercase) passed++;
    if (r.requireNumbers && passwordCriteria.value.hasNumber) passed++;
    if (r.requireSymbols && passwordCriteria.value.hasSpecial) passed++;
    return passed;
});

const passwordStrengthLabel = computed(() => {
    const total = totalActiveRulesCount.value;
    const score = passwordStrengthScore.value;
    const ratio = score / total;

    if (ratio >= 1) {
        return { text: 'Sangat Kuat', color: 'text-emerald-500 bg-emerald-500' };
    } else if (ratio >= 0.75) {
        return { text: 'Kuat', color: 'text-blue-500 bg-blue-500' };
    } else if (ratio >= 0.5) {
        return { text: 'Sedang', color: 'text-amber-500 bg-amber-500' };
    } else {
        return { text: 'Lemah', color: 'text-rose-500 bg-rose-500' };
    }
});

const validateInput = (rawVal) => {
    const strVal = rawVal === null || rawVal === undefined ? '' : String(rawVal);

    // Panggil callback onWatch jika disediakan developer
    if (typeof props.onWatch === 'function') {
        try {
            props.onWatch(rawVal);
        } catch {}
    }

    if (!props.liveValidation) {
        return { valid: true, message: '' };
    }

    // 1. Prioritas Tertinggi: Validator Kustom Function
    if (typeof props.validator === 'function') {
        const result = props.validator(rawVal);
        if (result === true || (typeof result === 'object' && result?.valid === true)) {
            liveFeedback.value = '';
            const payload = { valid: true, message: '', value: rawVal };
            emit('validate', payload);
            return payload;
        } else {
            const msg = typeof result === 'string'
                ? result
                : (result?.message || 'Format data tidak valid');
            liveFeedback.value = msg;
            const payload = { valid: false, message: msg, value: rawVal };
            emit('validate', payload);
            return payload;
        }
    }

    // 2. Pola Regex Kustom (Pattern)
    if (props.pattern && strVal) {
        const regex = typeof props.pattern === 'string' ? new RegExp(props.pattern) : props.pattern;
        if (!regex.test(strVal)) {
            liveFeedback.value = props.patternMessage || 'Format input tidak sesuai ketentuan';
            const payload = { valid: false, message: liveFeedback.value, value: rawVal };
            emit('validate', payload);
            return payload;
        }
    }

    // 3. Validasi Built-in Berdasarkan Tipe
    if (props.type === 'email') {
        if (!strVal) {
            liveFeedback.value = '';
            const payload = { valid: true, message: '', value: rawVal };
            emit('validate', payload);
            return payload;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strVal)) {
            liveFeedback.value = props.emailErrorText || "Email harus mengandung karakter '@' dan domain valid (contoh: nama@domain.com)";
            const payload = { valid: false, message: liveFeedback.value, value: rawVal };
            emit('validate', payload);
            return payload;
        } else {
            liveFeedback.value = '';
            const payload = { valid: true, message: '', value: rawVal };
            emit('validate', payload);
            return payload;
        }
    } else if (props.type === 'url') {
        if (!strVal) {
            liveFeedback.value = '';
            const payload = { valid: true, message: '', value: rawVal };
            emit('validate', payload);
            return payload;
        }
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlRegex.test(strVal)) {
            liveFeedback.value = props.urlErrorText || "Format URL tidak valid (contoh: https://domain.com)";
            const payload = { valid: false, message: liveFeedback.value, value: rawVal };
            emit('validate', payload);
            return payload;
        } else {
            liveFeedback.value = '';
            const payload = { valid: true, message: '', value: rawVal };
            emit('validate', payload);
            return payload;
        }
    } else if (props.type === 'number') {
        if (strVal !== '') {
            const num = Number(strVal);
            if (props.min !== null && !isNaN(num) && num < Number(props.min)) {
                liveFeedback.value = `Nilai minimal adalah ${props.min}`;
                const payload = { valid: false, message: liveFeedback.value, value: rawVal };
                emit('validate', payload);
                return payload;
            }
            if (props.max !== null && !isNaN(num) && num > Number(props.max)) {
                liveFeedback.value = `Nilai maksimal adalah ${props.max}`;
                const payload = { valid: false, message: liveFeedback.value, value: rawVal };
                emit('validate', payload);
                return payload;
            }
        }
        liveFeedback.value = '';
        const payload = { valid: true, message: '', value: rawVal };
        emit('validate', payload);
        return payload;
    } else if (props.type === 'password') {
        const str = strVal;
        const r = activePasswordRules.value;
        passwordCriteria.value = {
            minChar: str.length >= r.minLength,
            hasUppercase: /[A-Z]/.test(str),
            hasLowercase: /[a-z]/.test(str),
            hasNumber: /\d/.test(str),
            hasSpecial: /[^A-Za-z0-9]/.test(str),
        };
        const isValid = passwordStrengthScore.value === totalActiveRulesCount.value;
        const payload = {
            valid: isValid,
            score: passwordStrengthScore.value,
            totalScore: totalActiveRulesCount.value,
            criteria: passwordCriteria.value,
            value: rawVal,
        };
        emit('validate', payload);
        return payload;
    } else if (props.type === 'tel') {
        const digits = strVal.replace(/\D/g, '');
        if (props.telPattern && props.telPattern.includes('#')) {
            const requiredCount = (props.telPattern.match(/#/g) || []).length;
            if (digits.length > 0 && digits.length < requiredCount) {
                liveFeedback.value = `Format harus sesuai pola ${props.telPattern} (diperlukan ${requiredCount} digit, saat ini: ${digits.length})`;
                const payload = { valid: false, message: liveFeedback.value, value: rawVal };
                emit('validate', payload);
                return payload;
            }
        } else if (digits.length > 0 && (digits.length < 4 || digits.length > 18)) {
            liveFeedback.value = `Nomor telepon/format nomor minimal 4 digit dan maksimal 18 digit (saat ini: ${digits.length} digit)`;
            const payload = { valid: false, message: liveFeedback.value, value: rawVal };
            emit('validate', payload);
            return payload;
        }
        liveFeedback.value = '';
        const payload = { valid: true, message: '', value: rawVal };
        emit('validate', payload);
        return payload;
    } else {
        liveFeedback.value = '';
        const payload = { valid: true, message: '', value: rawVal };
        emit('validate', payload);
        return payload;
    }
};

watch(() => props.modelValue, (newVal) => {
    validateInput(newVal);
});

const handleInput = (e) => {
    emit('input', e);
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
        highlightedSuggestionIndex.value = -1;
    }
};

const handleClear = () => {
    displayValue.value = '';
    emit('update:modelValue', isCurrency.value || props.type === 'number' ? null : '');
    emit('clear');
    liveFeedback.value = '';
    showSuggestions.value = false;
    highlightedSuggestionIndex.value = -1;
};

// Search suggestions (Supports mode 'none' via searchSuggestions: false)
const filteredSuggestions = computed(() => {
    if (props.type !== 'search' || !props.searchSuggestions || !props.options || props.options.length === 0) return [];
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
    highlightedSuggestionIndex.value = -1;
};

const handleKeydown = (e) => {
    if (props.type === 'search' && showSuggestions.value && filteredSuggestions.value.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedSuggestionIndex.value = (highlightedSuggestionIndex.value + 1) % filteredSuggestions.value.length;
            return;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedSuggestionIndex.value = (highlightedSuggestionIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length;
            return;
        } else if (e.key === 'Enter') {
            if (highlightedSuggestionIndex.value >= 0 && highlightedSuggestionIndex.value < filteredSuggestions.value.length) {
                e.preventDefault();
                selectSuggestion(filteredSuggestions.value[highlightedSuggestionIndex.value]);
                return;
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            showSuggestions.value = false;
            highlightedSuggestionIndex.value = -1;
            return;
        }
    }
    emit('keydown', e);
};

// 5 Dynamic Sizes (xs, sm, md, lg, xl) with proportional spacing
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                input: 'px-2.5 py-0.5 text-xs min-h-[28px] h-7',
                addon: 'px-2 text-[11px]',
                icon: 'text-[15px]',
                iconLeftWrapper: 'pl-2',
                iconPaddingLeft: 'pl-7',
                defaultPaddingLeft: 'pl-2.5',
                actionsRight: 'pr-2',
            };
        case 'sm':
            return {
                input: 'px-3 py-1 text-xs min-h-[32px] h-8',
                addon: 'px-2.5 text-xs',
                icon: 'text-[17px]',
                iconLeftWrapper: 'pl-2.5',
                iconPaddingLeft: 'pl-8',
                defaultPaddingLeft: 'pl-3',
                actionsRight: 'pr-2.5',
            };
        case 'lg':
            return {
                input: 'px-4 py-2 text-base min-h-[46px] h-12',
                addon: 'px-3.5 text-sm',
                icon: 'text-[22px]',
                iconLeftWrapper: 'pl-3.5',
                iconPaddingLeft: 'pl-11',
                defaultPaddingLeft: 'pl-4',
                actionsRight: 'pr-3.5',
            };
        case 'xl':
            return {
                input: 'px-5 py-2.5 text-lg min-h-[54px] h-14',
                addon: 'px-4 text-base font-medium',
                icon: 'text-[26px]',
                iconLeftWrapper: 'pl-4',
                iconPaddingLeft: 'pl-13',
                defaultPaddingLeft: 'pl-5',
                actionsRight: 'pr-4',
            };
        case 'md':
        default:
            return {
                input: 'px-3.5 py-1.5 text-sm min-h-[38px] h-10',
                addon: 'px-3 text-xs font-semibold',
                icon: 'text-[19px]',
                iconLeftWrapper: 'pl-3',
                iconPaddingLeft: 'pl-10',
                defaultPaddingLeft: 'pl-3.5',
                actionsRight: 'pr-3',
            };
    }
});

// Dynamic Rounded Classes (none, sm, md, lg, xl, 2xl, 3xl, full)
const roundedClasses = computed(() => {
    const r = props.rounded || 'xl';
    const hasPrefix = !!props.prefix;
    const hasSuffix = !!props.suffix;

    let baseRounded = 'rounded-xl';
    let leftRounded = 'rounded-l-xl';
    let rightRounded = 'rounded-r-xl';

    switch (r) {
        case 'none':
            baseRounded = 'rounded-none';
            leftRounded = 'rounded-none';
            rightRounded = 'rounded-none';
            break;
        case 'sm':
            baseRounded = 'rounded-sm';
            leftRounded = 'rounded-l-sm';
            rightRounded = 'rounded-r-sm';
            break;
        case 'md':
            baseRounded = 'rounded-md';
            leftRounded = 'rounded-l-md';
            rightRounded = 'rounded-r-md';
            break;
        case 'lg':
            baseRounded = 'rounded-lg';
            leftRounded = 'rounded-l-lg';
            rightRounded = 'rounded-r-lg';
            break;
        case '2xl':
            baseRounded = 'rounded-2xl';
            leftRounded = 'rounded-l-2xl';
            rightRounded = 'rounded-r-2xl';
            break;
        case '3xl':
            baseRounded = 'rounded-3xl';
            leftRounded = 'rounded-l-3xl';
            rightRounded = 'rounded-r-3xl';
            break;
        case 'full':
            baseRounded = 'rounded-full';
            leftRounded = 'rounded-l-full';
            rightRounded = 'rounded-r-full';
            break;
        case 'xl':
        default:
            baseRounded = 'rounded-xl';
            leftRounded = 'rounded-l-xl';
            rightRounded = 'rounded-r-xl';
            break;
    }

    let inputRounded = baseRounded;
    if (hasPrefix && hasSuffix) {
        inputRounded = 'rounded-none';
    } else if (hasPrefix) {
        inputRounded = `rounded-l-none ${rightRounded}`;
    } else if (hasSuffix) {
        inputRounded = `rounded-r-none ${leftRounded}`;
    }

    return {
        wrapper: baseRounded,
        prefix: leftRounded,
        suffix: rightRounded,
        input: inputRounded,
    };
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

const rightPaddingClass = computed(() => {
    let count = 0;
    if (props.type === 'number' && props.showStepper && !isCurrency.value) {
        return 'pr-16';
    }
    if (props.type === 'search' && props.searchStyle === 'spotlight') {
        return 'pr-16';
    }
    if (props.loading) count++;
    if (props.type === 'password' && props.showPasswordToggle) count++;
    if ((props.clearable || props.type === 'search') && displayValue.value && !props.disabled && !props.readonly) count++;
    if (props.iconRight && count === 0) count++;

    if (count >= 2) return 'pr-16';
    if (count === 1) return 'pr-10';
    return 'pr-3.5';
});

// Stepper Handlers for type="number"
const handleStepDown = () => {
    if (props.disabled || props.readonly) return;
    const cur = Number(displayValue.value) || 0;
    const st = Number(props.step) || 1;
    let next = cur - st;
    if (props.min !== null && props.min !== undefined && props.min !== '' && next < Number(props.min)) {
        next = Number(props.min);
    }
    displayValue.value = String(next);
    emit('update:modelValue', next);
    emit('change', next);
    validateInput(next);
};

const handleStepUp = () => {
    if (props.disabled || props.readonly) return;
    const cur = Number(displayValue.value) || 0;
    const st = Number(props.step) || 1;
    let next = cur + st;
    if (props.max !== null && props.max !== undefined && props.max !== '' && next > Number(props.max)) {
        next = Number(props.max);
    }
    displayValue.value = String(next);
    emit('update:modelValue', next);
    emit('change', next);
    validateInput(next);
};

// Spotlight Command Palette
const isSpotlightOpen = ref(false);
const spotlightInputRef = ref(null);
const spotlightQuery = ref('');
const highlightedSpotlightIndex = ref(0);

const spotlightFilteredSuggestions = computed(() => {
    if (!props.options || props.options.length === 0) return [];
    if (!spotlightQuery.value) return props.options;
    const q = spotlightQuery.value.toLowerCase();
    return props.options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : String(opt);
        const sub = typeof opt === 'object' && opt.subtext ? opt.subtext : '';
        return label.toLowerCase().includes(q) || sub.toLowerCase().includes(q);
    });
});

const openSpotlight = () => {
    if (props.disabled || props.readonly) return;
    isSpotlightOpen.value = true;
    spotlightQuery.value = displayValue.value || '';
    highlightedSpotlightIndex.value = 0;
    nextTick(() => {
        spotlightInputRef.value?.focus();
    });
};

const closeSpotlight = () => {
    isSpotlightOpen.value = false;
};

const selectSpotlightItem = (item) => {
    const val = typeof item === 'object' ? item.value : item;
    displayValue.value = typeof item === 'object' ? item.label : String(item);
    emit('update:modelValue', val);
    emit('change', val);
    closeSpotlight();
};

const handleSpotlightKeydown = (e) => {
    const list = spotlightFilteredSuggestions.value;
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (list.length > 0) {
            highlightedSpotlightIndex.value = (highlightedSpotlightIndex.value + 1) % list.length;
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.length > 0) {
            highlightedSpotlightIndex.value = (highlightedSpotlightIndex.value - 1 + list.length) % list.length;
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (list.length > 0 && highlightedSpotlightIndex.value >= 0 && highlightedSpotlightIndex.value < list.length) {
            selectSpotlightItem(list[highlightedSpotlightIndex.value]);
        }
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSpotlight();
    }
};

const onGlobalKeydown = (e) => {
    if (props.type === 'search' && props.searchStyle === 'spotlight') {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (isSpotlightOpen.value) {
                closeSpotlight();
            } else {
                openSpotlight();
            }
        }
    }
};

onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown);
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
    clear: handleClear,
    openSpotlight,
    closeSpotlight,
    validate: () => validateInput(displayValue.value),
    inputRef,
});
</script>

<template>
    <div
        ref="containerRef"
        class="relative w-full space-y-1"
    >
        <!-- Input Group Wrapper (Preserves outer borders and rounded corners) -->
        <div class="relative flex items-stretch w-full shadow-2xs" :class="roundedClasses.wrapper">
            <!-- Addon Prefix Text -->
            <span
                v-if="prefix"
                class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-r-0 border-slate-200 dark:border-slate-700 self-stretch select-none shrink-0"
                :class="[sizeClasses.addon, roundedClasses.prefix]"
            >
                {{ prefix }}
            </span>

            <!-- Inner Input Container (Isolates Icon and HTML Input so Prefix never clashes with Icon) -->
            <div class="relative flex-1 flex items-center min-w-0">
                <!-- Left Icon: Always cleanly positioned inside the input element area -->
                <div
                    v-if="icon"
                    class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10"
                    :class="sizeClasses.iconLeftWrapper"
                >
                    <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ icon }}</span>
                </div>

                <!-- HTML5 Native Input Element -->
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
                    @keydown="handleKeydown"
                    class="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border transition-all duration-150 focus:outline-hidden"
                    :class="[
                        sizeClasses.input,
                        roundedClasses.input,
                        icon ? sizeClasses.iconPaddingLeft : sizeClasses.defaultPaddingLeft,
                        rightPaddingClass,
                        (error || liveFeedback)
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10 dark:bg-rose-950/10'
                            : ['border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600', focusRingClasses],
                        disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed select-none' : '',
                        readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                    ]"
                />

                <!-- Right Action Icons (Clear, Stepper, Spotlight, Loading, Password Toggle, Suffix Icon) -->
                <div class="absolute inset-y-0 right-0 flex items-center gap-1 z-10" :class="sizeClasses.actionsRight">
                    <!-- Clear Button for Search & Inputs -->
                    <button
                        v-if="(clearable || (type === 'search' && searchStyle !== 'spotlight')) && displayValue && !disabled && !readonly"
                        type="button"
                        @click="handleClear"
                        class="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                        tabindex="-1"
                        title="Batal / Hapus input"
                        aria-label="Batal / Hapus input"
                    >
                        <span class="material-symbols-outlined text-base leading-none">cancel</span>
                    </button>

                    <!-- Stepper Buttons for type="number" -->
                    <div
                        v-if="type === 'number' && showStepper && !isCurrency"
                        class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 select-none"
                    >
                        <button
                            type="button"
                            :disabled="disabled || readonly || (min !== null && min !== '' && Number(displayValue) <= Number(min))"
                            @click="handleStepDown"
                            class="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-30 cursor-pointer"
                            title="Kurangi nilai"
                        >
                            <span class="material-symbols-outlined text-[13px] leading-none">remove</span>
                        </button>
                        <div class="w-px h-3 bg-slate-200 dark:border-slate-700" />
                        <button
                            type="button"
                            :disabled="disabled || readonly || (max !== null && max !== '' && Number(displayValue) >= Number(max))"
                            @click="handleStepUp"
                            class="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-30 cursor-pointer"
                            title="Tambah nilai"
                        >
                            <span class="material-symbols-outlined text-[13px] leading-none">add</span>
                        </button>
                    </div>

                    <!-- Spotlight Command Palette Trigger Badge -->
                    <button
                        v-if="type === 'search' && searchStyle === 'spotlight'"
                        type="button"
                        @click="openSpotlight"
                        class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition flex items-center gap-0.5 select-none"
                        title="Buka Spotlight (Cmd+K / Ctrl+K)"
                    >
                        <span class="text-[9px]">⌘</span>K
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
            </div>

            <!-- Addon Suffix Text -->
            <span
                v-if="suffix"
                class="inline-flex items-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-l-0 border-slate-200 dark:border-slate-700 self-stretch select-none shrink-0"
                :class="[sizeClasses.addon, roundedClasses.suffix]"
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
            v-if="type === 'password' && showPasswordStrength && isFocused && displayValue"
            class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-2 select-none"
        >
            <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-600 dark:text-slate-400">Kekuatan Sandi:</span>
                <span class="font-bold text-xs" :class="passwordStrengthLabel.color">{{ passwordStrengthLabel.text }}</span>
            </div>

            <!-- Dynamic Strength Bar based on totalActiveRulesCount -->
            <div
                class="grid gap-1.5 h-1.5 w-full"
                :style="{ gridTemplateColumns: `repeat(${totalActiveRulesCount}, minmax(0, 1fr))` }"
            >
                <div
                    v-for="i in totalActiveRulesCount"
                    :key="i"
                    class="h-full rounded-full transition-colors duration-200"
                    :class="i <= passwordStrengthScore ? passwordStrengthLabel.color : 'bg-slate-200 dark:bg-slate-800'"
                />
            </div>

            <!-- Requirements Checklist (Only show active rules) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div
                    v-if="activePasswordRules.minLength > 0"
                    class="flex items-center gap-1.5"
                    :class="passwordCriteria.minChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'"
                >
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.minChar ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Min. {{ activePasswordRules.minLength }} karakter</span>
                </div>
                <div
                    v-if="activePasswordRules.requireUppercase"
                    class="flex items-center gap-1.5"
                    :class="passwordCriteria.hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'"
                >
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasUppercase ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Huruf besar (A-Z)</span>
                </div>
                <div
                    v-if="activePasswordRules.requireLowercase"
                    class="flex items-center gap-1.5"
                    :class="passwordCriteria.hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'"
                >
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasLowercase ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Huruf kecil (a-z)</span>
                </div>
                <div
                    v-if="activePasswordRules.requireNumbers"
                    class="flex items-center gap-1.5"
                    :class="passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'"
                >
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasNumber ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Mengandung angka</span>
                </div>
                <div
                    v-if="activePasswordRules.requireSymbols"
                    class="flex items-center gap-1.5"
                    :class="passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'"
                >
                    <span class="material-symbols-outlined text-xs leading-none">{{ passwordCriteria.hasSpecial ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span>Simbol (!@#$%^&*)</span>
                </div>
            </div>
        </div>

        <!-- Floating Scrollable Search Results / Suggestions (z-9999 PALING DEPAN) -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-1"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-1"
        >
            <div
                v-if="type === 'search' && showSuggestions && (filteredSuggestions.length > 0 || displayValue)"
                class="absolute left-0 right-0 z-9999 mt-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
                :class="[
                    searchStyle === 'spotlight'
                        ? 'p-2 ring-1 ring-blue-500/20 backdrop-blur-md'
                        : ''
                ]"
            >
                <!-- Optional Header Slot / Default Header -->
                <slot
                    name="header"
                    :count="filteredSuggestions.length"
                    :close="() => showSuggestions = false"
                >
                    <div
                        class="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium select-none"
                    >
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm text-blue-500">search</span>
                            <span>{{ searchStyle === 'spotlight' ? 'Spotlight Suggestions' : 'Saran Pencarian' }}</span>
                            <span class="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                {{ filteredSuggestions.length }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span v-if="searchStyle === 'spotlight'" class="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                                [↑↓ Navigasi | Enter Pilih | Esc Tutup]
                            </span>
                            <button
                                type="button"
                                @click="showSuggestions = false"
                                class="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer text-[11px]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </slot>

                <!-- Suggestions List -->
                <ul v-if="filteredSuggestions.length > 0" class="max-h-60 overflow-y-auto p-1.5 space-y-1">
                    <li
                        v-for="(item, idx) in filteredSuggestions"
                        :key="idx"
                        @click="selectSuggestion(item)"
                        class="transition-all duration-150 cursor-pointer"
                    >
                        <!-- Developer Custom Item Slot -->
                        <slot
                            name="item"
                            :item="item"
                            :index="idx"
                            :selected="highlightedSuggestionIndex === idx"
                            :select="() => selectSuggestion(item)"
                        >
                            <!-- Default Suggestion Item Design -->
                            <div
                                class="flex items-center justify-between gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors"
                                :class="[
                                    highlightedSuggestionIndex === idx
                                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                ]"
                            >
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span
                                        class="material-symbols-outlined text-base shrink-0"
                                        :class="highlightedSuggestionIndex === idx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'"
                                    >
                                        {{ typeof item === 'object' && item.icon ? item.icon : 'search' }}
                                    </span>
                                    <div class="truncate">
                                        <span class="block truncate">
                                            {{ typeof item === 'object' ? item.label : item }}
                                        </span>
                                        <span
                                            v-if="typeof item === 'object' && item.subtext"
                                            class="block text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate"
                                        >
                                            {{ item.subtext }}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    v-if="typeof item === 'object' && item.group"
                                    class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0"
                                >
                                    {{ item.group }}
                                </span>
                            </div>
                        </slot>
                    </li>
                </ul>

                <!-- Empty State (Developer Customizable via #empty Slot) -->
                <div v-else class="p-6 text-center select-none">
                    <slot name="empty">
                        <span class="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600 mb-1">search_off</span>
                        <p class="text-xs font-semibold text-slate-600 dark:text-slate-400">Tidak ada hasil ditemukan</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Coba kata kunci lain atau periksa ejaan Anda</p>
                    </slot>
                </div>
            </div>
        </Transition>
        <!-- Spotlight Command Palette Modal (Teleported to body for true spotlight UX) -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
                <div
                    v-if="type === 'search' && searchStyle === 'spotlight' && isSpotlightOpen"
                    class="fixed inset-0 z-99999 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm select-none"
                    @click.self="closeSpotlight"
                >
                    <div
                        class="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        @keydown="handleSpotlightKeydown"
                    >
                        <!-- Spotlight Search Header -->
                        <div class="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <span class="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400 shrink-0">
                                search
                            </span>
                            <input
                                ref="spotlightInputRef"
                                v-model="spotlightQuery"
                                type="text"
                                :placeholder="placeholder || 'Ketik untuk mencari di Command Palette...'"
                                class="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-lg focus:outline-hidden"
                            />
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                    ESC
                                </span>
                                <button
                                    type="button"
                                    @click="closeSpotlight"
                                    class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title="Tutup (Esc)"
                                >
                                    <span class="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        </div>

                        <!-- Spotlight Results Body -->
                        <div class="flex-1 overflow-y-auto p-2 space-y-1 max-h-96">
                            <div
                                v-if="spotlightFilteredSuggestions.length > 0"
                                class="space-y-1"
                            >
                                <div
                                    v-for="(item, idx) in spotlightFilteredSuggestions"
                                    :key="idx"
                                    @click="selectSpotlightItem(item)"
                                    class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-all duration-150"
                                    :class="[
                                        highlightedSpotlightIndex === idx
                                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                                    ]"
                                >
                                    <div class="flex items-center gap-3 min-w-0">
                                        <div
                                            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            :class="highlightedSpotlightIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
                                        >
                                            <span class="material-symbols-outlined text-lg">
                                                {{ typeof item === 'object' && item.icon ? item.icon : 'manage_search' }}
                                            </span>
                                        </div>
                                        <div class="truncate">
                                            <p class="truncate font-medium">
                                                {{ typeof item === 'object' ? item.label : item }}
                                            </p>
                                            <p
                                                v-if="typeof item === 'object' && item.subtext"
                                                class="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate"
                                            >
                                                {{ item.subtext }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <span
                                            v-if="typeof item === 'object' && item.group"
                                            class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300"
                                        >
                                            {{ item.group }}
                                        </span>
                                        <span
                                            v-if="highlightedSpotlightIndex === idx"
                                            class="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400"
                                        >
                                            keyboard_return
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="p-8 text-center select-none space-y-1.5">
                                <span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
                                    search_off
                                </span>
                                <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Tidak ada hasil yang sesuai
                                </p>
                                <p class="text-xs text-slate-400">
                                    Coba kata kunci pencarian yang lain
                                </p>
                            </div>
                        </div>

                        <!-- Spotlight Keyboard Navigation Footer -->
                        <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <div class="flex items-center gap-3">
                                <span class="flex items-center gap-1 font-mono">
                                    <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">↑↓</kbd> Navigasi
                                </span>
                                <span class="flex items-center gap-1 font-mono">
                                    <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">↵</kbd> Pilih
                                </span>
                                <span class="flex items-center gap-1 font-mono">
                                    <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">esc</kbd> Batal
                                </span>
                            </div>
                            <span class="font-medium text-slate-500 dark:text-slate-400">
                                {{ spotlightFilteredSuggestions.length }} hasil tersedia
                            </span>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
/* Reset browser native spin buttons on input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    appearance: none !important;
    margin: 0 !important;
}
input[type="number"] {
    -moz-appearance: textfield !important;
    appearance: textfield !important;
}

/* Reset browser native search cancel and decorations */
input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none !important;
    appearance: none !important;
    display: none !important;
}
</style>
