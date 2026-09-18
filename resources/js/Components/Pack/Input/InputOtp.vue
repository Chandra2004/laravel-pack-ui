<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    length: {
        type: Number,
        default: 6,
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
        type: Number,
        default: null,
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
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
        type: Number,
        default: 0, // detik, 0 = nonaktif
    },
    resendText: {
        type: String,
        default: 'Kirim Ulang Kode OTP',
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'complete', 'resend']);

const digits = ref(Array(props.length).fill(''));
const inputRefs = ref([]);
const remainingSeconds = ref(props.countdown);
let countdownTimer = null;

// Split initial or updated modelValue into digits array
const syncFromModel = (val) => {
    const chars = (val || '').split('').slice(0, props.length);
    const newDigits = Array(props.length).fill('');
    chars.forEach((c, idx) => {
        newDigits[idx] = c;
    });
    digits.value = newDigits;
};

watch(() => props.modelValue, (newVal) => {
    const currentCombined = digits.value.join('');
    if (newVal !== currentCombined) {
        syncFromModel(newVal);
    }
}, { immediate: true });

// Effective separator position: default is length / 2 jika tidak ditentukan
const effectiveSeparatorAfter = computed(() => {
    if (props.separatorAfter !== null) return props.separatorAfter;
    return Math.floor(props.length / 2);
});

// Focus first empty slot or specified slot index
const focusInput = (index) => {
    nextTick(() => {
        if (inputRefs.value[index]) {
            inputRefs.value[index].focus();
            inputRefs.value[index].select?.();
        }
    });
};

onMounted(() => {
    if (props.autoFocus && !props.disabled) {
        focusInput(0);
    }
    if (props.countdown > 0) {
        startCountdown();
    }
});

onUnmounted(() => {
    stopCountdown();
});

const startCountdown = () => {
    stopCountdown();
    remainingSeconds.value = props.countdown;
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
    if (props.countdown > 0) {
        startCountdown();
    }
};

const notifyChange = () => {
    const combined = digits.value.join('');
    emit('update:modelValue', combined);
    emit('change', combined);

    if (combined.length === props.length) {
        emit('complete', combined);
    }
};

const handleInput = (e, index) => {
    let val = e.target.value;

    if (props.integerOnly) {
        val = val.replace(/\D/g, '');
    }

    if (!val) {
        digits.value[index] = '';
        notifyChange();
        return;
    }

    // Jika lebih dari 1 karakter (biasanya dari autofill mobile)
    if (val.length > 1) {
        const chars = val.split('');
        for (let i = 0; i < chars.length && (index + i) < props.length; i++) {
            digits.value[index + i] = chars[i];
        }
        notifyChange();
        const nextIndex = Math.min(index + chars.length, props.length - 1);
        focusInput(nextIndex);
        return;
    }

    digits.value[index] = val;
    notifyChange();

    // Auto-advance ke slot berikutnya
    if (index < props.length - 1) {
        focusInput(index + 1);
    }
};

const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
        if (!digits.value[index] && index > 0) {
            e.preventDefault();
            digits.value[index - 1] = '';
            notifyChange();
            focusInput(index - 1);
        } else {
            digits.value[index] = '';
            notifyChange();
        }
    } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < props.length - 1) {
        e.preventDefault();
        focusInput(index + 1);
    }
};

const handlePaste = (e) => {
    e.preventDefault();
    if (props.disabled || props.readonly) return;

    let pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
    if (props.integerOnly) {
        pasted = pasted.replace(/\D/g, '');
    }

    if (!pasted) return;

    const chars = pasted.split('').slice(0, props.length);
    chars.forEach((c, idx) => {
        digits.value[idx] = c;
    });

    notifyChange();

    const focusIdx = Math.min(chars.length, props.length - 1);
    focusInput(focusIdx);
};

const clear = () => {
    digits.value = Array(props.length).fill('');
    notifyChange();
    focusInput(0);
};

const getValue = () => digits.value.join('');

defineExpose({
    focus: () => focusInput(0),
    clear,
    getValue,
    startCountdown,
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'w-8 h-10 text-sm font-semibold';
        case 'lg':
            return 'w-12 sm:w-14 h-14 text-xl font-bold';
        case 'md':
        default:
            return 'w-10 sm:w-12 h-12 text-lg font-bold';
    }
});
</script>

<template>
    <div class="space-y-2 w-full">
        <!-- OTP Slots Container -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 select-none" @paste="handlePaste">
            <template v-for="(_, index) in length" :key="index">
                <!-- Slot Input Box -->
                <input
                    :ref="(el) => { if (el) inputRefs[index] = el }"
                    :type="masked ? 'password' : 'text'"
                    :inputmode="integerOnly ? 'numeric' : 'text'"
                    :pattern="integerOnly ? '[0-9]*' : undefined"
                    maxlength="1"
                    :value="digits[index]"
                    :disabled="disabled"
                    :readonly="readonly"
                    @input="handleInput($event, index)"
                    @keydown="handleKeyDown($event, index)"
                    class="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono shadow-2xs border transition-all duration-150 focus:outline-hidden"
                    :class="[
                        sizeClasses,
                        digits[index] ? 'border-blue-500 dark:border-blue-500' : '',
                        error
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                        disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed' : '',
                        readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
                    ]"
                />

                <!-- Separator Divider (misal '-' setelah 3 digit) -->
                <span
                    v-if="separator && index + 1 === effectiveSeparatorAfter && index + 1 < length"
                    class="text-slate-400 dark:text-slate-500 font-bold px-0.5 select-none"
                >
                    {{ separator }}
                </span>
            </template>
        </div>

        <!-- Built-in Countdown & Resend Button -->
        <div v-if="countdown > 0" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 select-none">
            <span v-if="remainingSeconds > 0" class="flex items-center gap-1 font-medium">
                <span class="material-symbols-outlined text-sm leading-none text-blue-500">schedule</span>
                Kirim ulang dalam <strong class="font-mono text-blue-600 dark:text-blue-400">{{ remainingSeconds }}d</strong>
            </span>
            <button
                v-else
                type="button"
                :disabled="disabled"
                @click="handleResend"
                class="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
                <span class="material-symbols-outlined text-sm leading-none">refresh</span>
                {{ resendText }}
            </button>
        </div>
    </div>
</template>
