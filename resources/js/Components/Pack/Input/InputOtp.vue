<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: '',
    },
    length: {
        type: [Number, String],
        default: 6,
    },
    // Karakter yang diizinkan: 'numeric' (angka), 'alpha' (huruf), 'symbol' (simbol), 'alphanumeric' (huruf+angka), 'any' (semua), 'custom' (regex)
    charType: {
        type: String,
        default: 'numeric',
        validator: (val) => ['numeric', 'alpha', 'alphanumeric', 'symbol', 'any', 'custom'].includes(val),
    },
    // Pola regex kustom (misal: '^[A-F0-9]$' untuk hex atau RegExp kustom)
    pattern: {
        type: [String, Object],
        default: null,
    },
    // Otomatis ubah huruf menjadi kapital (uppercase)
    uppercase: {
        type: Boolean,
        default: false,
    },
    integerOnly: {
        type: Boolean,
        default: true,
    },
    masked: {
        type: Boolean,
        default: false,
    },
    separator: {
        type: String,
        default: '',
    },
    separatorAfter: {
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
    autoFocus: {
        type: Boolean,
        default: false,
    },
    countdown: {
        type: [Number, String],
        default: 0, // detik, 0 = nonaktif
    },
    resendText: {
        type: String,
        default: 'Kirim Ulang Kode OTP',
    },
    color: {
        type: String,
        default: 'primary',
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'complete', 'resend']);

// Safe integer length (default 6, min 1)
const numLength = computed(() => {
    const n = parseInt(props.length, 10);
    return isNaN(n) || n < 1 ? 6 : n;
});


// Focus ring & active border tokens based on color prop
const colorFocusClasses = computed(() => {
    switch (props.color) {
        case 'indigo':
            return {
                active: 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20',
                focus: 'focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15',
            };
        case 'emerald':
        case 'success':
            return {
                active: 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20',
                focus: 'focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15',
            };
        case 'amber':
        case 'warning':
            return {
                active: 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20',
                focus: 'focus:border-amber-600 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15',
            };
        case 'rose':
        case 'danger':
            return {
                active: 'border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/20',
                focus: 'focus:border-rose-600 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15',
            };
        case 'purple':
            return {
                active: 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20',
                focus: 'focus:border-purple-600 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15',
            };
        case 'cyan':
            return {
                active: 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20',
                focus: 'focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15',
            };
        case 'dark':
            return {
                active: 'border-slate-800 dark:border-slate-200 ring-2 ring-slate-500/20',
                focus: 'focus:border-slate-900 dark:focus:border-white focus:ring-4 focus:ring-slate-500/15',
            };
        case 'primary':
        default:
            return {
                active: 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20',
                focus: 'focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
            };
    }
});

const digits = ref(Array(numLength.value).fill(''));
const inputRefs = ref([]);
const remainingSeconds = ref(Number(props.countdown) || 0);
let countdownTimer = null;

// Helper pengecekan karakter yang diizinkan sesuai charType / pattern / integerOnly
const isCharAllowed = (c) => {
    if (!c || c.length !== 1) return false;

    // 1. Pola regex kustom
    if (props.pattern) {
        try {
            const regex = typeof props.pattern === 'string' ? new RegExp(props.pattern) : props.pattern;
            return regex.test(c);
        } catch (e) {
            // fallback
        }
    }

    // 2. Mode karakter bawaan (fallback ke integerOnly jika charType default)
    const mode = props.charType || (props.integerOnly ? 'numeric' : 'any');

    switch (mode) {
        case 'numeric':
        case 'number':
        case 'digits':
            return /^\d$/.test(c);
        case 'alpha':
        case 'letters':
            return /^[a-zA-Z]$/.test(c);
        case 'symbol':
        case 'symbols':
            // Simbol: bukan huruf, bukan angka, dan bukan spasi/whitespace/newline
            return !/[a-zA-Z0-9\s\r\n\t]/.test(c);
        case 'alphanumeric':
            return /^[a-zA-Z0-9]$/.test(c);
        case 'any':
        case 'all':
        default:
            return !/[\r\n\t]/.test(c);
    }
};

// Helper memfilter dan memformat string (misal saat paste atau sync)
const filterString = (str) => {
    if (!str) return '';
    let result = '';
    for (const c of String(str)) {
        if (isCharAllowed(c)) {
            result += props.uppercase ? c.toUpperCase() : c;
        }
    }
    return result;
};

// Split initial or updated modelValue into digits array
const syncFromModel = (val) => {
    const str = val !== null && val !== undefined ? String(val) : '';
    const filtered = filterString(str);
    const chars = filtered.split('').slice(0, numLength.value);
    const newDigits = Array(numLength.value).fill('');
    chars.forEach((c, idx) => {
        newDigits[idx] = c;
    });
    digits.value = newDigits;
};

// Watch modelValue changes from parent
watch(() => props.modelValue, (newVal) => {
    const currentCombined = digits.value.join('');
    const strVal = newVal !== null && newVal !== undefined ? String(newVal) : '';
    if (strVal !== currentCombined) {
        syncFromModel(strVal);
    }
}, { immediate: true });

// Watch length changes dynamically (misal dari 6 ke 4 atau 3)
watch(numLength, () => {
    inputRefs.value = [];
    syncFromModel(props.modelValue);
});

// Watch konfigurasi filter karakter (charType, pattern, uppercase, integerOnly)
watch([() => props.charType, () => props.pattern, () => props.uppercase, () => props.integerOnly], () => {
    syncFromModel(props.modelValue);
});

// Effective separator position: default is Math.floor(length / 2) jika tidak ditentukan
const effectiveSeparatorAfter = computed(() => {
    if (props.separatorAfter !== null && props.separatorAfter !== undefined && props.separatorAfter !== '') {
        const val = parseInt(props.separatorAfter, 10);
        if (!isNaN(val)) return val;
    }
    return Math.floor(numLength.value / 2);
});

// InputMode bawaan browser
const effectiveInputMode = computed(() => {
    const mode = props.charType || (props.integerOnly ? 'numeric' : 'any');
    if (mode === 'numeric' || mode === 'number' || mode === 'digits') {
        return 'numeric';
    }
    return 'text';
});

// Pattern bawaan browser
const effectivePattern = computed(() => {
    if (props.pattern && typeof props.pattern === 'string') {
        return props.pattern;
    }
    const mode = props.charType || (props.integerOnly ? 'numeric' : 'any');
    switch (mode) {
        case 'numeric':
        case 'number':
        case 'digits':
            return '[0-9]*';
        case 'alpha':
        case 'letters':
            return '[a-zA-Z]*';
        case 'alphanumeric':
            return '[a-zA-Z0-9]*';
        default:
            return undefined;
    }
});

// Focus specific slot index
const focusInput = (index) => {
    if (index < 0 || index >= numLength.value) return;
    nextTick(() => {
        const el = inputRefs.value[index];
        if (el) {
            el.focus();
            el.select?.();
        }
    });
};

onMounted(() => {
    if (props.autoFocus && !props.disabled) {
        focusInput(0);
    }
    if (Number(props.countdown) > 0) {
        startCountdown();
    }
});

onUnmounted(() => {
    stopCountdown();
});

watch(() => props.countdown, (newVal) => {
    remainingSeconds.value = Number(newVal) || 0;
    if (remainingSeconds.value > 0) {
        startCountdown();
    } else {
        stopCountdown();
    }
});

const startCountdown = () => {
    stopCountdown();
    remainingSeconds.value = Number(props.countdown) || 0;
    if (remainingSeconds.value <= 0) return;

    countdownTimer = setInterval(() => {
        if (remainingSeconds.value > 0) {
            remainingSeconds.value--;
        } else {
            stopCountdown();
        }
    }, 1000);
};

const stopCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
};

const handleResend = () => {
    if (remainingSeconds.value > 0 || props.disabled) return;
    emit('resend');
    if (Number(props.countdown) > 0) {
        startCountdown();
    }
};

const notifyChange = () => {
    const combined = digits.value.join('');
    emit('update:modelValue', combined);
    emit('change', combined);

    if (combined.length === numLength.value && !digits.value.includes('')) {
        emit('complete', combined);
    }
};

// Keystroke handler for auto-advance, backspace navigation, arrow navigation
const handleKeyDown = (e, index) => {
    if (props.disabled || props.readonly) return;

    // 1. Navigation Arrow Keys & Home/End
    if (e.key === 'ArrowLeft') {
        if (index > 0) {
            e.preventDefault();
            focusInput(index - 1);
        }
        return;
    }
    if (e.key === 'ArrowRight') {
        if (index < numLength.value - 1) {
            e.preventDefault();
            focusInput(index + 1);
        }
        return;
    }
    if (e.key === 'Home') {
        e.preventDefault();
        focusInput(0);
        return;
    }
    if (e.key === 'End') {
        e.preventDefault();
        focusInput(numLength.value - 1);
        return;
    }

    // 2. Backspace handler:
    // Jika bilah saat ini berisi karakter -> hapus karakter dan pindah mundur ke bilah sebelumnya
    // Jika bilah saat ini kosong -> hapus isi bilah sebelumnya dan pindah mundur ke bilah sebelumnya
    if (e.key === 'Backspace') {
        e.preventDefault();
        if (digits.value[index]) {
            digits.value[index] = '';
            notifyChange();
            if (index > 0) {
                focusInput(index - 1);
            }
        } else if (index > 0) {
            digits.value[index - 1] = '';
            notifyChange();
            focusInput(index - 1);
        }
        return;
    }

    // 3. Delete key (forward delete)
    if (e.key === 'Delete') {
        e.preventDefault();
        if (digits.value[index]) {
            digits.value[index] = '';
            notifyChange();
        }
        return;
    }

    // Lewati tombol kontrol browser (Ctrl+C, Ctrl+V, Tab, dll)
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Tab') {
        return;
    }

    // 4. Single printable character (angka / huruf / simbol)
    if (e.key.length === 1) {
        if (!isCharAllowed(e.key)) {
            // Blokir karakter jika tidak diizinkan oleh mode/pattern
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const finalChar = props.uppercase ? e.key.toUpperCase() : e.key;
        digits.value[index] = finalChar;
        notifyChange();

        // Otomatis pindah ke bilah selanjutnya tanpa tekan Tab
        if (index < numLength.value - 1) {
            focusInput(index + 1);
        }
    }
};

// Fallback input handler (untuk mobile keyboard, autofill, atau IME)
const handleInput = (e, index) => {
    let val = filterString(e.target.value);

    if (!val) {
        digits.value[index] = '';
        notifyChange();
        return;
    }

    // Jika lebih dari 1 karakter (biasanya dari autofill mobile SMS / paste)
    if (val.length > 1) {
        const chars = val.split('');
        const startIdx = chars.length >= numLength.value ? 0 : index;
        for (let i = 0; i < chars.length && (startIdx + i) < numLength.value; i++) {
            digits.value[startIdx + i] = chars[i];
        }
        notifyChange();
        const nextIndex = Math.min(startIdx + chars.length, numLength.value - 1);
        focusInput(nextIndex);
        return;
    }

    // 1 karakter (fallback jika keydown tidak dicegat browser tertentu)
    digits.value[index] = val;
    notifyChange();
    if (index < numLength.value - 1) {
        focusInput(index + 1);
    }
};

// Focus handler untuk otomatis select karakter agar mudah ditimpa
const handleFocus = (e) => {
    e.target?.select?.();
};

// Paste handler yang otomatis mendistribusikan kode OTP ke bilah-bilah input
const handlePaste = (e, targetIndex = 0) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.disabled || props.readonly) return;

    const clipboardData = e.clipboardData || window.clipboardData;
    let pasted = clipboardData ? clipboardData.getData('text') : '';
    if (!pasted) return;

    pasted = filterString(pasted);
    if (!pasted) return;

    const chars = pasted.split('');
    // Jika panjang teks hasil copy >= total bilah atau jika targetIndex = 0, sebarkan dari awal (indeks 0)
    const startIdx = (chars.length >= numLength.value || targetIndex === 0) ? 0 : targetIndex;

    for (let i = 0; i < chars.length && (startIdx + i) < numLength.value; i++) {
        digits.value[startIdx + i] = chars[i];
    }

    notifyChange();

    // Pindahkan fokus ke bilah selanjutnya atau bilah terakhir jika terisi penuh
    const focusIdx = Math.min(startIdx + chars.length, numLength.value - 1);
    focusInput(focusIdx);
};

const clear = () => {
    digits.value = Array(numLength.value).fill('');
    notifyChange();
    focusInput(0);
};

const getValue = () => digits.value.join('');

defineExpose({
    focus: () => focusInput(0),
    blur: () => {
        inputRefs.value.forEach(el => el?.blur?.());
    },
    clear,
    getValue,
    startCountdown,
    stopCountdown,
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return 'w-7 sm:w-8 h-8 sm:h-9 text-xs font-semibold';
        case 'sm':
            return 'w-8 sm:w-9 h-9 sm:h-10 text-sm font-semibold';
        case 'lg':
            return 'w-12 sm:w-14 h-13 sm:h-14 text-xl font-bold';
        case 'xl':
            return 'w-14 sm:w-16 h-15 sm:h-16 text-2xl font-black';
        case 'md':
        default:
            return 'w-10 sm:w-12 h-11 sm:h-12 text-lg font-bold';
    }
});

const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case '2xl': return 'rounded-2xl';
        case '3xl': return 'rounded-3xl';
        case 'full': return 'rounded-full';
        case 'xl':
        default: return 'rounded-xl';
    }
});
</script>

<template>
    <div class="space-y-2 w-full">
        <!-- OTP Slots Container -->
        <div
            class="flex flex-wrap items-center gap-2 sm:gap-2.5 select-none"
            @paste="handlePaste($event, 0)"
        >
            <template v-for="(_, index) in numLength" :key="index">
                <!-- Slot Input Box -->
                <input
                    :ref="(el) => { if (el) inputRefs[index] = el }"
                    :type="masked ? 'password' : 'text'"
                    :inputmode="effectiveInputMode"
                    :pattern="effectivePattern"
                    autocomplete="one-time-code"
                    maxlength="1"
                    :value="digits[index]"
                    :disabled="disabled"
                    :readonly="readonly"
                    @input="handleInput($event, index)"
                    @keydown="handleKeyDown($event, index)"
                    @focus="handleFocus"
                    @paste="handlePaste($event, index)"
                    class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono shadow-2xs border transition-all duration-150 focus:outline-hidden"
                    :class="[
                        sizeClasses,
                        roundedClass,
                        digits[index] ? colorFocusClasses.active : '',
                        error
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10'
                            : `border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 ${colorFocusClasses.focus}`,
                        disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed' : '',
                        readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                    ]"
                />

                <!-- Separator Divider (misal '-' setelah index tertentu) -->
                <span
                    v-if="separator && (index + 1) === effectiveSeparatorAfter && (index + 1) < numLength"
                    class="text-slate-400 dark:text-slate-500 font-bold px-0.5 select-none"
                >
                    {{ separator }}
                </span>
            </template>
        </div>

        <!-- Built-in Countdown & Resend Button -->
        <div v-if="Number(countdown) > 0" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 select-none">
            <span v-if="remainingSeconds > 0" class="flex items-center gap-1 font-medium">
                <span class="material-symbols-outlined text-sm leading-none text-primary-500">schedule</span>
                Kirim ulang dalam <strong class="font-mono text-primary-600 dark:text-primary-400">{{ remainingSeconds }}d</strong>
            </span>
            <button
                v-else
                type="button"
                :disabled="disabled"
                @click="handleResend"
                class="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
                <span class="material-symbols-outlined text-sm leading-none">refresh</span>
                {{ resendText }}
            </button>
        </div>
    </div>
</template>
