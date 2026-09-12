<script setup>
import { computed, onMounted } from 'vue';
import { useTheme } from '@/Composables/Pack/useTheme';

const props = defineProps({
    variant: {
        type: String,
        default: 'icon', // 'icon', 'button', 'switch', 'segmented'
        validator: (val) => ['icon', 'button', 'switch', 'segmented'].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    showLabel: {
        type: Boolean,
        default: false,
    },
    labelLight: {
        type: String,
        default: 'Mode Terang',
    },
    labelDark: {
        type: String,
        default: 'Mode Gelap',
    },
    labelSystem: {
        type: String,
        default: 'Mode Sistem',
    },
    cycle: {
        type: Boolean,
        default: false, // if true, toggleTheme cycles light -> dark -> system
    },
});

const { theme, isDark, toggleTheme, cycleTheme, setTheme, initTheme } = useTheme();

onMounted(() => {
    initTheme();
});

const handleToggle = () => {
    if (props.cycle) {
        cycleTheme();
    } else {
        toggleTheme();
    }
};

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                btn: 'w-8 h-8 rounded-lg',
                icon: 'text-base',
                text: 'text-xs',
                padding: 'px-2.5 py-1.5',
            };
        case 'lg':
            return {
                btn: 'w-11 h-11 rounded-2xl',
                icon: 'text-2xl',
                text: 'text-sm',
                padding: 'px-4 py-2.5',
            };
        case 'md':
        default:
            return {
                btn: 'w-9.5 h-9.5 rounded-xl',
                icon: 'text-xl',
                text: 'text-xs sm:text-sm',
                padding: 'px-3.5 py-2',
            };
    }
});
</script>

<template>
    <!-- 1. VARIANT: SEGMENTED (3-Option: Light, Dark, System) -->
    <div
        v-if="variant === 'segmented'"
        role="group"
        aria-label="Pilih tema tampilan"
        class="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 gap-1 select-none shadow-2xs"
    >
        <button
            type="button"
            @click="setTheme('light')"
            :aria-pressed="theme === 'light'"
            aria-label="Mode Terang"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
            :class="theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
            <span class="material-symbols-outlined text-base leading-none select-none">light_mode</span>
            <span>Terang</span>
        </button>

        <button
            type="button"
            @click="setTheme('dark')"
            :aria-pressed="theme === 'dark'"
            aria-label="Mode Gelap"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
            :class="theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
            <span class="material-symbols-outlined text-base leading-none select-none">dark_mode</span>
            <span>Gelap</span>
        </button>

        <button
            type="button"
            @click="setTheme('system')"
            :aria-pressed="theme === 'system'"
            aria-label="Mode Sistem"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
            :class="theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
            <span class="material-symbols-outlined text-base leading-none select-none">desktop_windows</span>
            <span>Sistem</span>
        </button>
    </div>

    <!-- 2. VARIANT: SWITCH (Standardized h-6 w-11 Toggle Slider) -->
    <div
        v-else-if="variant === 'switch'"
        class="inline-flex items-center gap-2.5 select-none"
    >
        <span
            v-if="showLabel"
            class="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            @click="handleToggle"
        >
            {{ isDark ? labelDark : labelLight }}
        </span>
        <button
            type="button"
            role="switch"
            :aria-checked="isDark"
            aria-label="Beralih tema tampilan"
            @click="handleToggle"
            :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden"
            :class="isDark ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'"
        >
            <span
                class="pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                :class="isDark ? 'translate-x-5 text-amber-500' : 'translate-x-0 text-slate-600'"
            >
                <span class="material-symbols-outlined text-[12px] leading-none select-none">
                    {{ isDark ? 'dark_mode' : 'light_mode' }}
                </span>
            </span>
        </button>
    </div>

    <!-- 3. VARIANT: BUTTON (Icon + Text Label) -->
    <button
        v-else-if="variant === 'button'"
        type="button"
        @click="handleToggle"
        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        aria-label="Beralih tema tampilan"
        :class="[
            'inline-flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs font-semibold active:scale-98 transition-all duration-200 cursor-pointer select-none',
            sizeClasses.padding,
            sizeClasses.text
        ]"
    >
        <div
            class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            :class="isDark ? 'bg-amber-400/15 text-amber-400' : 'bg-slate-100 text-slate-600'"
        >
            <span class="material-symbols-outlined text-base leading-none select-none">
                {{ isDark ? 'dark_mode' : 'light_mode' }}
            </span>
        </div>
        <span>{{ isDark ? labelDark : labelLight }}</span>
    </button>

    <!-- 4. VARIANT: ICON (Default Icon-Only Button) -->
    <button
        v-else
        type="button"
        @click="handleToggle"
        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        :aria-label="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        :class="[
            'inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer select-none group',
            sizeClasses.btn
        ]"
    >
        <span
            class="material-symbols-outlined leading-none transition-all duration-300 transform group-hover:scale-110 select-none"
            :class="[
                sizeClasses.icon,
                isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-slate-600 group-hover:text-blue-600'
            ]"
        >
            {{ isDark ? 'dark_mode' : 'light_mode' }}
        </span>
        <span v-if="showLabel" :class="['ml-2 font-semibold text-slate-700 dark:text-slate-200', sizeClasses.text]">
            {{ isDark ? labelDark : labelLight }}
        </span>
    </button>
</template>
