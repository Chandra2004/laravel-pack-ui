<script setup>
import { ref, computed, watch } from 'vue';
import { usePopover } from '@/Composables/Pack/usePopover.js';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'date', // 'date', 'time', 'datetime-local'
    },
    pickerStyle: {
        type: String,
        default: 'calendar', // 'calendar', 'presets'
        validator: (v) => ['calendar', 'presets', 'default'].includes(v),
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
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'xl',
        validator: (val) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(val),
    },
    min: {
        type: String,
        default: '',
    },
    max: {
        type: String,
        default: '',
    },
    placement: {
        type: String,
        default: 'bottom',
        validator: (val) => ['bottom', 'top', 'left', 'right', 'bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(val),
    },
    popoverOffset: {
        type: Number,
        default: 8,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear']);

const triggerRef = ref(null);
const popoverRef = ref(null);
const isOpen = ref(false);

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

// Month names & Day abbreviations
const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Quick Time Slot Presets
const quickTimePresets = ['08:00', '09:00', '10:00', '12:00', '13:00', '14:00', '16:00', '19:00'];

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
    selectedMinute.value = (selectedMinute.value + 1) % 60;
    updateTime();
};

const decrementMinute = () => {
    selectedMinute.value = (selectedMinute.value - 1 + 60) % 60;
    updateTime();
};

const selectQuickTime = (slot) => {
    const parts = slot.split(':');
    selectedHour.value = parseInt(parts[0], 10);
    selectedMinute.value = parseInt(parts[1], 10);
    updateTime();
};

// 1. FOOTER ACTION: HAPUS
const clearValue = () => {
    emit('update:modelValue', '');
    emit('change', '');
    emit('clear');
    isOpen.value = false;
};

// 2. FOOTER ACTION: JAM INI (SET CURRENT HOUR & MINUTE)
const setNowTime = () => {
    const cur = new Date();
    selectedHour.value = cur.getHours();
    selectedMinute.value = cur.getMinutes();
    updateTime();
};

// 3. FOOTER ACTION: HARI INI (SET TODAY DATE)
const setToday = () => {
    const cur = new Date();
    currentYear.value = cur.getFullYear();
    currentMonth.value = cur.getMonth();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${cur.getFullYear()}-${mm}-${dd}`;

    if (props.type === 'date') {
        emit('update:modelValue', dateStr);
        emit('change', dateStr);
        isOpen.value = false;
    } else if (props.type === 'datetime-local') {
        const hr = String(selectedHour.value).padStart(2, '0');
        const min = String(selectedMinute.value).padStart(2, '0');
        const fullDateTime = `${dateStr}T${hr}:${min}`;
        emit('update:modelValue', fullDateTime);
        emit('change', fullDateTime);
    } else if (props.type === 'time') {
        setNowTime();
    }
};

// Set preset days (Besok, Lusa)
const setRelativeDay = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    currentYear.value = d.getFullYear();
    currentMonth.value = d.getMonth();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${mm}-${dd}`;

    if (props.type === 'date') {
        emit('update:modelValue', dateStr);
        emit('change', dateStr);
        isOpen.value = false;
    } else if (props.type === 'datetime-local') {
        const hr = String(selectedHour.value).padStart(2, '0');
        const min = String(selectedMinute.value).padStart(2, '0');
        const fullDateTime = `${dateStr}T${hr}:${min}`;
        emit('update:modelValue', fullDateTime);
        emit('change', fullDateTime);
    }
};

// 4. FOOTER ACTION: OK
const confirmOK = () => {
    if (!props.modelValue) {
        if (props.type === 'time') {
            updateTime();
        } else if (props.type === 'datetime-local' || props.type === 'date') {
            setToday();
        }
    }
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

// Size Classes
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                trigger: 'h-8 text-xs',
                icon: 'text-base',
                pl: props.icon ? 'pl-8' : 'pl-3',
            };
        case 'sm':
            return {
                trigger: 'h-9 text-xs',
                icon: 'text-lg',
                pl: props.icon ? 'pl-9' : 'pl-3.5',
            };
        case 'lg':
            return {
                trigger: 'h-12 text-base',
                icon: 'text-2xl',
                pl: props.icon ? 'pl-11' : 'pl-4',
            };
        case 'xl':
            return {
                trigger: 'h-14 text-lg',
                icon: 'text-2xl',
                pl: props.icon ? 'pl-12' : 'pl-4.5',
            };
        case 'md':
        default:
            return {
                trigger: 'h-10 text-sm',
                icon: 'text-xl',
                pl: props.icon ? 'pl-10' : 'pl-3.5',
            };
    }
});

const roundedClasses = computed(() => {
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

const effectivePlaceholder = computed(() => {
    if (props.placeholder) return props.placeholder;
    if (props.type === 'time') return 'Pilih Waktu (JJ:MM)...';
    if (props.type === 'datetime-local') return 'Pilih Tanggal & Waktu...';
    return 'Pilih Tanggal...';
});

const defaultIcon = computed(() => {
    if (props.icon) return props.icon;
    if (props.type === 'time') return 'schedule';
    if (props.type === 'datetime-local') return 'event';
    return 'calendar_today';
});
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
            :required="required && !modelValue"
        />

        <!-- Trigger Box -->
        <div
            role="button"
            tabindex="0"
            :aria-expanded="isOpen"
            :aria-haspopup="true"
            @click="toggleOpen"
            @keydown.enter.prevent="toggleOpen"
            @keydown.space.prevent="toggleOpen"
            class="w-full flex items-center justify-between bg-white dark:bg-slate-900 border shadow-2xs transition-all duration-150 select-none cursor-pointer focus:outline-hidden"
            :class="[
                roundedClasses,
                sizeClasses.trigger,
                sizeClasses.pl,
                'pr-8',
                isOpen ? 'border-blue-600 dark:border-blue-500 ring-4 ring-blue-500/15' : '',
                error
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/10'
                    : !isOpen ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15' : '',
                disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed pointer-events-none' : '',
                readonly ? 'bg-slate-50 dark:bg-slate-800/40 cursor-default' : '',
            ]"
        >
            <!-- Left Calendar/Clock Icon -->
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ defaultIcon }}</span>
            </div>

            <!-- Value / Placeholder -->
            <span
                class="truncate flex-1"
                :class="displayValue ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'"
            >
                {{ displayValue || effectivePlaceholder }}
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
                <!-- DEVELOPER CUSTOM POPOVER SLOT (Kebebasan Mendesain Popover Sendiri) -->
                <slot
                    name="popover"
                    :value="modelValue"
                    :close="closePopover"
                    :select-date="selectDate"
                    :clear="clearValue"
                    :today="setToday"
                    :now="setNowTime"
                    :current-date="currentDate"
                    :picker-style="pickerStyle"
                    :placement="currentPlacement"
                >
                    <!-- Optional Developer Popover Header Slot -->
                    <slot name="popover-header" :close="closePopover" :current-date="currentDate" />
                <!-- OPSI PICKER: PRESETS QUICK-SELECT -->
                <div v-if="pickerStyle === 'presets' && type !== 'time'" class="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Preset Tanggal Cepat</span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <button
                            type="button"
                            @click="setRelativeDay(0)"
                            class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-300 font-medium transition cursor-pointer"
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            @click="setRelativeDay(1)"
                            class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-300 font-medium transition cursor-pointer"
                        >
                            Besok
                        </button>
                        <button
                            type="button"
                            @click="setRelativeDay(2)"
                            class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-300 font-medium transition cursor-pointer"
                        >
                            Lusa
                        </button>
                        <button
                            type="button"
                            @click="setRelativeDay(7)"
                            class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-300 font-medium transition cursor-pointer"
                        >
                            +1 Minggu
                        </button>
                    </div>
                </div>

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
                    <!-- Quick Time Chips -->
                    <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            v-for="ts in quickTimePresets"
                            :key="ts"
                            type="button"
                            @click="selectQuickTime(ts)"
                            class="px-2 py-0.5 rounded-md text-[11px] font-mono border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-300 transition shrink-0 cursor-pointer"
                        >
                            {{ ts }}
                        </button>
                    </div>

                    <!-- Digital Stepper Clock -->
                    <div class="flex items-center justify-center gap-4 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 my-1">
                        <!-- Hour Column -->
                        <div class="flex flex-col items-center">
                            <button
                                type="button"
                                @click="incrementHour"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <span class="font-mono text-xl font-bold text-slate-800 dark:text-slate-100 py-0.5">
                                {{ String(selectedHour).padStart(2, '0') }}
                            </span>
                            <button
                                type="button"
                                @click="decrementHour"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <span class="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Jam</span>
                        </div>

                        <span class="text-xl font-bold text-slate-400 pb-4">:</span>

                        <!-- Minute Column -->
                        <div class="flex flex-col items-center">
                            <button
                                type="button"
                                @click="incrementMinute"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <span class="font-mono text-xl font-bold text-slate-800 dark:text-slate-100 py-0.5">
                                {{ String(selectedMinute).padStart(2, '0') }}
                            </span>
                            <button
                                type="button"
                                @click="decrementMinute"
                                class="w-8 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <span class="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <span class="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Menit</span>
                        </div>
                    </div>
                </div>

                <!-- =============================================================== -->
                <!-- 3. FOOTER ACTIONS: HAPUS | JAM INI | HARI INI | OK              -->
                <!-- =============================================================== -->
                <slot
                    name="popover-footer"
                    :close="closePopover"
                    :clear="clearValue"
                    :today="setToday"
                    :now="setNowTime"
                    :confirm="confirmOK"
                >
                    <div class="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <!-- Tombol 1: Hapus -->
                        <button
                            type="button"
                            @click="clearValue"
                            class="text-rose-500 hover:text-rose-700 font-medium transition cursor-pointer px-1 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                            Hapus
                        </button>

                        <!-- Tombol 2, 3, 4: Jam Ini, Hari Ini, OK -->
                        <div class="flex items-center gap-1 sm:gap-2">
                            <!-- Tombol Jam Ini -->
                            <button
                                v-if="type === 'time' || type === 'datetime-local'"
                                type="button"
                                @click="setNowTime"
                                class="text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-md transition cursor-pointer"
                                title="Atur ke jam dan menit saat ini"
                            >
                                Jam Ini
                            </button>

                            <!-- Tombol Hari Ini -->
                            <button
                                v-if="type !== 'time'"
                                type="button"
                                @click="setToday"
                                class="text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-md transition cursor-pointer"
                                title="Atur tanggal ke hari ini"
                            >
                                Hari Ini
                            </button>

                            <!-- Tombol OK -->
                            <button
                                type="button"
                                @click="confirmOK"
                                class="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-xs cursor-pointer"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </slot>
                </slot>
            </div>
        </Transition>
    </Teleport>
</template>
