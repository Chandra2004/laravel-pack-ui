<script setup>
import { ref, computed, watch } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'date', // 'date', 'time', 'datetime-local'
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
    size: {
        type: String,
        default: 'md',
    },
    min: {
        type: String,
        default: '',
    },
    max: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const containerRef = ref(null);
const isOpen = ref(false);

useClickOutside(containerRef, () => {
    if (isOpen.value) {
        isOpen.value = false;
        emit('blur');
    }
});

// Month names & Day abbreviations
const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Internal Calendar State
const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth());

// Time State
const selectedHour = ref(now.getHours());
const selectedMinute = ref(now.getMinutes());

// Synchronize state from modelValue
const syncFromModel = (val) => {
    if (!val) return;
    if (props.type === 'time') {
        const parts = val.split(':');
        if (parts.length >= 2) {
            selectedHour.value = parseInt(parts[0], 10) || 0;
            selectedMinute.value = parseInt(parts[1], 10) || 0;
        }
    } else {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            currentYear.value = d.getFullYear();
            currentMonth.value = d.getMonth();
            if (props.type === 'datetime-local') {
                selectedHour.value = d.getHours();
                selectedMinute.value = d.getMinutes();
            }
        }
    }
};

watch(() => props.modelValue, (newVal) => {
    syncFromModel(newVal);
}, { immediate: true });

// Formatted Display Text
const displayValue = computed(() => {
    if (!props.modelValue) return '';
    if (props.type === 'time') {
        return props.modelValue;
    }
    const d = new Date(props.modelValue);
    if (isNaN(d.getTime())) return props.modelValue;
    const day = String(d.getDate()).padStart(2, '0');
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    if (props.type === 'datetime-local') {
        const hr = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year}, ${hr}:${min}`;
    }
    return `${day} ${month} ${year}`;
});

// Calendar Days Grid Generation
const calendarDays = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // 1. Previous Month Filler Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        days.push({
            date: d,
            isCurrentMonth: false,
            fullDateString: '',
        });
    }

    // 2. Current Month Days
    const today = new Date();
    const isTodayYearMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let d = 1; d <= daysInMonth; d++) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const fullDateString = `${year}-${mm}-${dd}`;
        const isToday = isTodayYearMonth && today.getDate() === d;
        const isSelected = props.modelValue ? props.modelValue.startsWith(fullDateString) : false;

        let isDisabled = false;
        if (props.min && fullDateString < props.min) isDisabled = true;
        if (props.max && fullDateString > props.max) isDisabled = true;

        days.push({
            date: d,
            isCurrentMonth: true,
            fullDateString,
            isToday,
            isSelected,
            isDisabled,
        });
    }

    // 3. Next Month Filler Days (to complete 42 cells)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
        days.push({
            date: d,
            isCurrentMonth: false,
            fullDateString: '',
        });
    }

    return days;
});

const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
};

const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
};

const selectDate = (day) => {
    if (!day.isCurrentMonth || day.isDisabled) return;

    if (props.type === 'date') {
        emit('update:modelValue', day.fullDateString);
        emit('change', day.fullDateString);
        isOpen.value = false;
    } else if (props.type === 'datetime-local') {
        const hr = String(selectedHour.value).padStart(2, '0');
        const min = String(selectedMinute.value).padStart(2, '0');
        const fullDateTime = `${day.fullDateString}T${hr}:${min}`;
        emit('update:modelValue', fullDateTime);
        emit('change', fullDateTime);
    }
};

const updateTime = () => {
    const hr = String(selectedHour.value).padStart(2, '0');
    const min = String(selectedMinute.value).padStart(2, '0');
    if (props.type === 'time') {
        const timeVal = `${hr}:${min}`;
        emit('update:modelValue', timeVal);
        emit('change', timeVal);
    } else if (props.type === 'datetime-local') {
        const baseDate = props.modelValue ? props.modelValue.split('T')[0] : `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const fullDateTime = `${baseDate}T${hr}:${min}`;
        emit('update:modelValue', fullDateTime);
        emit('change', fullDateTime);
    }
};

const incrementHour = () => {
    selectedHour.value = (selectedHour.value + 1) % 24;
    updateTime();
};
const decrementHour = () => {
    selectedHour.value = (selectedHour.value - 1 + 24) % 24;
    updateTime();
};
const incrementMinute = () => {
    selectedMinute.value = (selectedMinute.value + 5) % 60;
    updateTime();
};
const decrementMinute = () => {
    selectedMinute.value = (selectedMinute.value - 5 + 60) % 60;
    updateTime();
};

const setToday = () => {
    const today = new Date();
    currentYear.value = today.getFullYear();
    currentMonth.value = today.getMonth();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${mm}-${dd}`;

    if (props.type === 'date') {
        emit('update:modelValue', dateStr);
        emit('change', dateStr);
        isOpen.value = false;
    } else if (props.type === 'datetime-local') {
        const hr = String(selectedHour.value).padStart(2, '0');
        const min = String(selectedMinute.value).padStart(2, '0');
        const val = `${dateStr}T${hr}:${min}`;
        emit('update:modelValue', val);
        emit('change', val);
    } else if (props.type === 'time') {
        selectedHour.value = today.getHours();
        selectedMinute.value = today.getMinutes();
        updateTime();
        isOpen.value = false;
    }
};

const clearValue = () => {
    emit('update:modelValue', '');
    emit('clear');
    isOpen.value = false;
};

const toggleOpen = () => {
    if (props.disabled || props.readonly) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        syncFromModel(props.modelValue);
        emit('focus');
    } else {
        emit('blur');
    }
};

// Size classes
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                trigger: 'px-2.5 py-1 text-xs min-h-[32px]',
                icon: 'text-base',
            };
        case 'lg':
            return {
                trigger: 'px-3.5 py-2.5 text-base min-h-[44px]',
                icon: 'text-xl',
            };
        case 'md':
        default:
            return {
                trigger: 'px-3 py-1.5 text-sm min-h-[38px]',
                icon: 'text-lg',
            };
    }
});

const defaultIcon = computed(() => {
    if (props.icon) return props.icon;
    if (props.type === 'time') return 'schedule';
    if (props.type === 'datetime-local') return 'event';
    return 'calendar_today';
});
</script>

<template>
    <div ref="containerRef" class="relative w-full">
        <!-- Hidden Native Input for Form compatibility -->
        <input
            :id="id"
            type="hidden"
            :name="name"
            :value="modelValue"
            :required="required && !modelValue"
        />

        <!-- PrimeVue Styled Trigger Box -->
        <div
            role="button"
            tabindex="0"
            :aria-expanded="isOpen"
            :aria-haspopup="true"
            @click="toggleOpen"
            @keydown.enter.prevent="toggleOpen"
            @keydown.space.prevent="toggleOpen"
            class="w-full flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border shadow-2xs transition-all duration-150 select-none cursor-pointer focus:outline-hidden"
            :class="[
                sizeClasses.trigger,
                'pl-11 pr-8',
                isOpen ? 'border-blue-600 dark:border-blue-500 ring-4 ring-blue-500/15' : '',
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10'
                    : !isOpen ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15' : '',
                disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        >
            <!-- Left Calendar/Clock Icon (Spaced pl-3.5) -->
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ defaultIcon }}</span>
            </div>

            <!-- Value / Placeholder -->
            <span
                class="truncate flex-1"
                :class="displayValue ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'"
            >
                {{ displayValue || placeholder || (type === 'time' ? 'Pilih Jam...' : 'Pilih Tanggal...') }}
            </span>

            <!-- Clear Action Button -->
            <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                <button
                    v-if="modelValue && !disabled && !readonly"
                    type="button"
                    @click.stop="clearValue"
                    class="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Hapus"
                >
                    <span class="material-symbols-outlined text-sm leading-none">close</span>
                </button>
            </div>
        </div>

        <!-- PrimeVue Styled Floating Popover -->
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
                class="absolute left-0 z-50 mt-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 select-none w-72 sm:w-80"
            >
                <!-- 1. CALENDAR VIEW (Date & Datetime) -->
                <div v-if="type !== 'time'">
                    <!-- Month & Year Navigation Header -->
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span class="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {{ monthNames[currentMonth] }} {{ currentYear }}
                        </span>
                        <div class="flex items-center gap-1">
                            <button
                                type="button"
                                @click="prevMonth"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Bulan Sebelumnya"
                            >
                                <span class="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            <button
                                type="button"
                                @click="nextMonth"
                                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Bulan Berikutnya"
                            >
                                <span class="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <!-- Days of Week Header Grid -->
                    <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 pt-2 pb-1">
                        <span v-for="d in dayHeaders" :key="d">{{ d }}</span>
                    </div>

                    <!-- Day Cells 6x7 Grid -->
                    <div class="grid grid-cols-7 gap-1 text-center text-xs">
                        <button
                            v-for="(day, idx) in calendarDays"
                            :key="idx"
                            type="button"
                            :disabled="!day.isCurrentMonth || day.isDisabled"
                            @click="selectDate(day)"
                            class="h-8 w-8 mx-auto rounded-full flex items-center justify-center transition-colors duration-100"
                            :class="[
                                !day.isCurrentMonth ? 'text-slate-300 dark:text-slate-700 pointer-events-none' : '',
                                day.isCurrentMonth && !day.isSelected ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : '',
                                day.isToday && !day.isSelected ? 'font-bold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40' : '',
                                day.isSelected ? 'bg-blue-600 text-white font-bold shadow-xs hover:bg-blue-700' : '',
                                day.isDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                            ]"
                        >
                            {{ day.date }}
                        </button>
                    </div>
                </div>

                <!-- 2. TIME PICKER SECTION (Time & Datetime-Local) -->
                <div
                    v-if="type === 'time' || type === 'datetime-local'"
                    class="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2"
                >
                    <div class="flex items-center justify-center gap-4 py-2">
                        <!-- Hour Column -->
                        <div class="flex flex-col items-center">
                            <button
                                type="button"
                                @click="incrementHour"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <span class="font-mono text-lg font-bold text-slate-800 dark:text-slate-100 py-0.5">
                                {{ String(selectedHour).padStart(2, '0') }}
                            </span>
                            <button
                                type="button"
                                @click="decrementHour"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Jam</span>
                        </div>

                        <span class="text-xl font-bold text-slate-400 pb-4">:</span>

                        <!-- Minute Column -->
                        <div class="flex flex-col items-center">
                            <button
                                type="button"
                                @click="incrementMinute"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <span class="font-mono text-lg font-bold text-slate-800 dark:text-slate-100 py-0.5">
                                {{ String(selectedMinute).padStart(2, '0') }}
                            </span>
                            <button
                                type="button"
                                @click="decrementMinute"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Menit</span>
                        </div>
                    </div>
                </div>

                <!-- 3. FOOTER ACTIONS (Today & Clear & Done) -->
                <div class="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                        type="button"
                        @click="clearValue"
                        class="text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                    >
                        Hapus
                    </button>
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            @click="setToday"
                            class="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                        >
                            Hari Ini
                        </button>
                        <button
                            v-if="type !== 'date'"
                            type="button"
                            @click="isOpen = false"
                            class="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-xs cursor-pointer"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

