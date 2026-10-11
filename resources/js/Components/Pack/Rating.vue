<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    /**
     * 1. NILAI UTAMA (v-model) & RANGE
     */
    modelValue: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: 5,
    },
    precision: {
        type: [Number, String],
        default: 0.1, // 1 | 0.5 | 0.1 | 'any'
    },

    /**
     * 2. PILAR WARNA (color & colorTheme & dynamic colors)
     */
    colorTheme: {
        type: String,
        default: '', // 'primary' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'dark'
    },
    color: {
        type: String,
        default: 'amber', // preset string atau custom hex/rgb/hsl
    },
    activeColor: {
        type: String,
        default: '', // alias eksplisit warna aktif (contoh: '#ff5722')
    },
    inactiveColor: {
        type: String,
        default: '', // custom hex / rgb / warna untuk bintang tidak aktif (contoh: '#cbd5e1')
    },
    colors: {
        type: [Object, Array],
        default: null, // threshold warna bertingkat dinamis berdasarkan skor: misal { 1: '#ef4444', 3: '#eab308', 5: '#10b981' } atau array
    },

    /**
     * 3. PILAR BENTUK (variant & radius)
     */
    variant: {
        type: String,
        default: 'default', // 'default' | 'card' | 'pill' | 'bordered'
    },
    radius: {
        type: String,
        default: 'xl', // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    },

    /**
     * 4. PILAR ICON
     */
    icon: {
        type: String,
        default: 'star',
    },
    unfilledIcon: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md', // xs | sm | md | lg | xl
    },
    animate: {
        type: Boolean,
        default: true,
    },

    /**
     * 5. PILAR TEKS KONTEN & DESKRIPSI
     */
    showValue: {
        type: Boolean,
        default: false,
    },
    valueFormat: {
        type: String,
        default: 'fraction', // 'fraction' (1.3 / 5) | 'single' (1.3) | 'percent' (26%) | 'descriptive'
    },
    valuePosition: {
        type: String,
        default: 'right', // 'right' | 'bottom'
    },
    showDescriptive: {
        type: Boolean,
        default: false,
    },
    locale: {
        type: String,
        default: 'id', // 'id' | 'en' | 'es' | 'fr'
    },
    descriptiveTexts: {
        type: [Object, Array, Function],
        default: null, // Kustomisasi deskripsi: Object { 1: 'Buruk', 5: 'Puas' }, Array ['E', 'D', 'C', 'B', 'A'], atau Function (val, max) => string
    },
    formatter: {
        type: Function,
        default: null, // Kustomisasi penuh teks nilai numerik (val, max) => string
    },
    count: {
        type: Number,
        default: 0,
    },
    countLabel: {
        type: String,
        default: '', // jika kosong, otomatis 'ulasan' (id) atau 'reviews' (en)
    },
    label: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    error: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },

    /**
     * 6. PILAR RESPONSIF & INTERAKSI
     */
    responsive: {
        type: Boolean,
        default: true,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    clearable: {
        type: Boolean,
        default: true,
    },
    allowHover: {
        type: Boolean,
        default: true,
    },
    id: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'hover']);

const uid = Math.random().toString(36).substring(2, 9);
const inputId = computed(() => props.id || `rating-${uid}`);

// Interactive Hover State
const hoverValue = ref(null);
const isHovering = ref(false);

const effectiveValue = computed(() => {
    if (isHovering.value && hoverValue.value !== null) {
        return hoverValue.value;
    }
    return Math.max(0, Math.min(props.max, Number(props.modelValue) || 0));
});

// Color Themes & Color mapping
const themeMap = {
    primary: '#2563eb',
    indigo: '#6366f1',
    emerald: '#10b981',
    purple: '#a855f7',
    amber: '#f59e0b',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    dark: '#334155',
};

const colorMap = {
    amber: '#f59e0b',
    yellow: '#eab308',
    rose: '#f43f5e',
    red: '#ef4444',
    emerald: '#10b981',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#a855f7',
    indigo: '#6366f1',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    orange: '#f97316',
    lime: '#84cc16',
    pink: '#ec4899',
    dark: '#334155',
    slate: '#64748b',
};

const activeColorHex = computed(() => {
    // 1. Threshold warna bertingkat dinamis (colors prop)
    if (props.colors) {
        const val = effectiveValue.value;
        const starLevel = Math.max(1, Math.min(props.max, Math.ceil(val) || 1));
        if (Array.isArray(props.colors)) {
            const idx = starLevel - 1;
            if (props.colors[idx]) {
                const c = props.colors[idx];
                return colorMap[c] || themeMap[c] || c;
            }
        } else if (typeof props.colors === 'object') {
            if (props.colors[starLevel]) {
                const c = props.colors[starLevel];
                return colorMap[c] || themeMap[c] || c;
            }
        }
    }

    // 2. Tema warna bawaan (colorTheme)
    if (props.colorTheme && themeMap[props.colorTheme]) {
        return themeMap[props.colorTheme];
    }

    // 3. Warna eksplisit (activeColor atau color)
    const target = props.activeColor || props.color || 'amber';
    return colorMap[target] || themeMap[target] || target;
});

const inactiveColorHex = computed(() => {
    if (!props.inactiveColor) return '';
    return colorMap[props.inactiveColor] || themeMap[props.inactiveColor] || props.inactiveColor;
});

// Radius mapping
const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
};

// Size mapping with responsive modifier
const sizeClasses = computed(() => {
    if (props.responsive) {
        const responsiveSizes = {
            xs: {
                icon: 'text-xs sm:text-sm w-3.5 sm:w-4 h-3.5 sm:h-4',
                text: 'text-[10px] sm:text-[11px]',
                gap: 'gap-0.5',
            },
            sm: {
                icon: 'text-sm sm:text-base w-4 sm:w-5 h-4 sm:h-5',
                text: 'text-xs',
                gap: 'gap-0.5 sm:gap-1',
            },
            md: {
                icon: 'text-base sm:text-xl md:text-2xl w-5 sm:w-5.5 md:w-6 h-5 sm:h-5.5 md:h-6',
                text: 'text-xs sm:text-sm',
                gap: 'gap-1',
            },
            lg: {
                icon: 'text-xl sm:text-2xl md:text-3xl w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8',
                text: 'text-xs sm:text-sm md:text-base',
                gap: 'gap-1 sm:gap-1.5',
            },
            xl: {
                icon: 'text-2xl sm:text-3xl md:text-4xl w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10',
                text: 'text-sm sm:text-base md:text-lg',
                gap: 'gap-1 sm:gap-1.5 md:gap-2',
            },
        };
        return responsiveSizes[props.size] || responsiveSizes.md;
    }

    const standardSizes = {
        xs: {
            icon: 'text-sm w-4 h-4',
            text: 'text-[11px]',
            gap: 'gap-0.5',
        },
        sm: {
            icon: 'text-lg w-5 h-5',
            text: 'text-xs',
            gap: 'gap-0.5',
        },
        md: {
            icon: 'text-2xl w-6 h-6',
            text: 'text-sm',
            gap: 'gap-1',
        },
        lg: {
            icon: 'text-3xl w-8 h-8',
            text: 'text-base',
            gap: 'gap-1.5',
        },
        xl: {
            icon: 'text-4xl w-10 h-10',
            text: 'text-lg',
            gap: 'gap-2',
        },
    };
    return standardSizes[props.size] || standardSizes.md;
});

// Container variant classes
const containerVariantClasses = computed(() => {
    const rad = radiusClasses[props.radius] || 'rounded-xl';
    switch (props.variant) {
        case 'card':
            return `p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs ${rad}`;
        case 'pill':
            return `px-3 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 ${rad}`;
        case 'bordered':
            return `p-2.5 border border-slate-200/80 dark:border-slate-800 ${rad}`;
        case 'default':
        default:
            return '';
    }
});

// Compute fill percentage for star at 1-based index
const getFillPercent = (index) => {
    const val = effectiveValue.value;
    if (val >= index) return 100;
    if (val <= index - 1) return 0;
    const decimal = val - (index - 1);
    return Math.round(Math.max(0, Math.min(1, decimal)) * 100);
};

// Calculate exact value from pointer or touch coordinate
const calculatePointerValue = (clientX, currentTarget, index) => {
    if (props.readonly || props.disabled) return null;
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const rawFraction = Math.max(0.01, Math.min(1, x / rect.width));
    let val = (index - 1) + rawFraction;

    if (props.precision !== 'any') {
        const step = Number(props.precision);
        if (step > 0) {
            val = Math.round(val / step) * step;
        }
    }

    val = Math.max(0, Math.min(props.max, Number(val.toFixed(2))));
    return val;
};

// Mouse Interactions
const handleMouseMove = (event, index) => {
    if (props.readonly || props.disabled || !props.allowHover) return;
    const val = calculatePointerValue(event.clientX, event.currentTarget, index);
    if (val !== null) {
        hoverValue.value = val;
        isHovering.value = true;
        emit('hover', val);
    }
};

const handleMouseLeave = () => {
    if (props.readonly || props.disabled) return;
    hoverValue.value = null;
    isHovering.value = false;
    emit('hover', null);
};

const handleClick = (event, index) => {
    if (props.readonly || props.disabled) return;
    const val = calculatePointerValue(event.clientX, event.currentTarget, index);
    if (val === null) return;

    if (props.clearable && Math.abs(props.modelValue - val) < 0.05) {
        emit('update:modelValue', 0);
        emit('change', 0);
    } else {
        emit('update:modelValue', val);
        emit('change', val);
    }
};

// Touch Handling for Mobile responsiveness
const starsContainerRef = ref(null);

const calculateTouchValue = (touch) => {
    if (!starsContainerRef.value) return null;
    const rect = starsContainerRef.value.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const fraction = Math.max(0.01, Math.min(1, x / width));
    let val = fraction * props.max;

    if (props.precision !== 'any') {
        const step = Number(props.precision);
        if (step > 0) {
            val = Math.round(val / step) * step;
        }
    }

    return Math.max(0, Math.min(props.max, Number(val.toFixed(2))));
};

const handleTouchStart = (event) => {
    if (props.readonly || props.disabled) return;
    const touch = event.touches[0];
    const val = calculateTouchValue(touch);
    if (val !== null) {
        hoverValue.value = val;
        isHovering.value = true;
        emit('hover', val);
    }
};

const handleTouchMove = (event) => {
    if (props.readonly || props.disabled) return;
    const touch = event.touches[0];
    const val = calculateTouchValue(touch);
    if (val !== null) {
        hoverValue.value = val;
        isHovering.value = true;
        emit('hover', val);
    }
};

const handleTouchEnd = () => {
    if (props.readonly || props.disabled) return;
    if (hoverValue.value !== null) {
        const finalVal = hoverValue.value;
        if (props.clearable && Math.abs(props.modelValue - finalVal) < 0.05) {
            emit('update:modelValue', 0);
            emit('change', 0);
        } else {
            emit('update:modelValue', finalVal);
            emit('change', finalVal);
        }
    }
    isHovering.value = false;
    hoverValue.value = null;
    emit('hover', null);
};

const handleTouchCancel = () => {
    isHovering.value = false;
    hoverValue.value = null;
    emit('hover', null);
};

// Keyboard Accessibility
const handleKeyDown = (event) => {
    if (props.readonly || props.disabled) return;
    const step = props.precision === 'any' ? 0.5 : Number(props.precision) || 1;
    let nextVal = props.modelValue;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        nextVal = Math.min(props.max, Number((props.modelValue + step).toFixed(2)));
        emit('update:modelValue', nextVal);
        emit('change', nextVal);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        nextVal = Math.max(0, Number((props.modelValue - step).toFixed(2)));
        emit('update:modelValue', nextVal);
        emit('change', nextVal);
    } else if (event.key === 'Home') {
        event.preventDefault();
        emit('update:modelValue', 0);
        emit('change', 0);
    } else if (event.key === 'End') {
        event.preventDefault();
        emit('update:modelValue', props.max);
        emit('change', props.max);
    }
};

// Built-in localization dictionaries
const defaultLocales = {
    id: {
        5: { 1: 'Sangat Buruk', 2: 'Buruk', 3: 'Cukup', 4: 'Puas', 5: 'Sangat Puas' },
        10: { 1: 'Mengerikan', 2: 'Sangat Buruk', 3: 'Buruk', 4: 'Kurang', 5: 'Cukup', 6: 'Lumayan', 7: 'Baik', 8: 'Bagus', 9: 'Sangat Bagus', 10: 'Luar Biasa' },
    },
    en: {
        5: { 1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' },
        10: { 1: 'Terrible', 2: 'Very Bad', 3: 'Bad', 4: 'Poor', 5: 'Average', 6: 'Fair', 7: 'Good', 8: 'Very Good', 9: 'Great', 10: 'Masterpiece' },
    },
    es: {
        5: { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' },
        10: { 1: 'Pésimo', 2: 'Muy malo', 3: 'Malo', 4: 'Deficiente', 5: 'Regular', 6: 'Aceptable', 7: 'Bueno', 8: 'Muy bueno', 9: 'Fantástico', 10: 'Excelente' },
    },
    fr: {
        5: { 1: 'Très mauvais', 2: 'Mauvais', 3: 'Moyen', 4: 'Bon', 5: 'Excellent' },
        10: { 1: 'Terrible', 2: 'Très mauvais', 3: 'Mauvais', 4: 'Médiocre', 5: 'Moyen', 6: 'Passable', 7: 'Bon', 8: 'Très bon', 9: 'Génial', 10: 'Parfait' },
    },
};

const resolvedCountLabel = computed(() => {
    if (props.countLabel) return props.countLabel;
    switch (props.locale) {
        case 'en': return 'reviews';
        case 'es': return 'reseñas';
        case 'fr': return 'avis';
        default: return 'ulasan';
    }
});

// Descriptive label based on rounded star level, custom function, or custom dictionary
const descriptiveText = computed(() => {
    const val = effectiveValue.value;
    if (val <= 0) return '';
    const starLevel = Math.max(1, Math.min(props.max, Math.ceil(val)));

    // 1. Jika descriptiveTexts adalah Function callback (val, max) => string
    if (typeof props.descriptiveTexts === 'function') {
        return props.descriptiveTexts(val, props.max);
    }

    // 2. Jika descriptiveTexts adalah Array ['Buruk', ..., 'Puas']
    if (Array.isArray(props.descriptiveTexts)) {
        const item = props.descriptiveTexts[starLevel - 1];
        if (item !== undefined) return String(item);
    }

    // 3. Jika descriptiveTexts adalah Object kustom { 1: '...', 5: '...' }
    if (props.descriptiveTexts && typeof props.descriptiveTexts === 'object') {
        if (props.descriptiveTexts[starLevel] !== undefined) {
            return String(props.descriptiveTexts[starLevel]);
        }
    }

    // 4. Fallback ke kamus bahasa bawaan (locale: id, en, es, fr)
    const loc = defaultLocales[props.locale] || defaultLocales.id;
    const tier = props.max > 5 && loc[10] ? loc[10] : (loc[5] || loc[10]);
    if (tier && tier[starLevel]) {
        return tier[starLevel];
    }

    // Interpolasi proporsional 5 bintang jika skala bintang kustom > 5
    const normalized5 = Math.max(1, Math.min(5, Math.ceil((val / props.max) * 5)));
    return loc[5]?.[normalized5] || '';
});

// Formatted display text
const formattedValue = computed(() => {
    const val = effectiveValue.value;
    if (typeof props.formatter === 'function') {
        return props.formatter(val, props.max);
    }
    const rounded = Number.isInteger(val) ? val.toString() : val.toFixed(1);

    if (props.valueFormat === 'single') {
        return rounded;
    }
    if (props.valueFormat === 'percent') {
        return `${Math.round((val / props.max) * 100)}%`;
    }
    if (props.valueFormat === 'descriptive') {
        return descriptiveText.value || `${rounded} / ${props.max}`;
    }
    return `${rounded} / ${props.max}`;
});

defineExpose({
    effectiveValue,
    hoverValue,
    activeColorHex,
    inactiveColorHex,
    descriptiveText,
    formattedValue,
});
</script>

<template>
    <div
        class="inline-flex flex-col text-left select-none max-w-full"
        :class="containerVariantClasses"
    >
        <!-- Label Header -->
        <label
            v-if="label || $slots.label"
            :for="inputId"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
            <slot name="label">{{ label }}</slot>
            <span v-if="required" class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
        </label>

        <!-- Rating Container (Horizontal or Vertical) -->
        <div
            :class="[
                'inline-flex items-center flex-wrap max-w-full',
                valuePosition === 'bottom' ? 'flex-col items-start gap-1 sm:gap-1.5' : 'flex-row gap-2 sm:gap-2.5',
                disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            ]"
        >
            <!-- Stars/Icons Row -->
            <div
                :id="inputId"
                ref="starsContainerRef"
                role="slider"
                :aria-valuenow="modelValue"
                aria-valuemin="0"
                :aria-valuemax="max"
                :aria-label="label || 'Penilaian Bintang'"
                :aria-readonly="readonly"
                :aria-disabled="disabled"
                :tabindex="readonly || disabled ? -1 : 0"
                @keydown="handleKeyDown"
                @mouseleave="handleMouseLeave"
                @touchstart.passive="handleTouchStart"
                @touchmove.passive="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchCancel"
                :class="[
                    'inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded-lg touch-none max-w-full overflow-x-auto sm:overflow-visible py-0.5',
                    sizeClasses.gap,
                    readonly ? 'cursor-default' : (disabled ? 'cursor-not-allowed' : 'cursor-pointer')
                ]"
            >
                <div
                    v-for="index in max"
                    :key="index"
                    class="relative inline-flex items-center justify-center transition-transform duration-150 ease-out"
                    :class="[
                        animate && !readonly && !disabled && 'hover:scale-110 active:scale-95'
                    ]"
                    @mousemove="handleMouseMove($event, index)"
                    @click="handleClick($event, index)"
                >
                    <!-- Custom Slot for Complete Rendering Customization -->
                    <slot
                        name="icon"
                        :index="index"
                        :active="effectiveValue >= index"
                        :fill-percent="getFillPercent(index)"
                        :color="activeColorHex"
                    >
                        <!-- Background Unfilled Icon (Outlined / Muted Slate) -->
                        <span
                            :class="[
                                'material-symbols-outlined flex items-center justify-center leading-none transition-colors select-none',
                                sizeClasses.icon,
                                inactiveColorHex ? '' : 'text-slate-200 dark:text-slate-700/80'
                            ]"
                            :style="[
                                inactiveColorHex ? { color: inactiveColorHex } : {},
                                { fontVariationSettings: `'FILL' 0, 'wght' 400` }
                            ]"
                        >
                            {{ unfilledIcon || icon }}
                        </span>

                        <!-- Foreground Fractional Filled Icon (Width Clip) -->
                        <div
                            class="absolute top-0 left-0 h-full overflow-hidden transition-[width] duration-75 pointer-events-none flex items-center"
                            :style="{ width: `${getFillPercent(index)}%` }"
                        >
                            <span
                                :class="[
                                    'material-symbols-outlined flex items-center justify-center leading-none shrink-0 drop-shadow-2xs select-none',
                                    sizeClasses.icon
                                ]"
                                :style="{
                                    color: activeColorHex,
                                    fontVariationSettings: `'FILL' 1, 'wght' 600`
                                }"
                            >
                                {{ icon }}
                            </span>
                        </div>
                    </slot>
                </div>
            </div>

            <!-- Value Badge / Label Text -->
            <div
                v-if="showValue || count > 0 || showDescriptive || $slots.value"
                class="inline-flex items-center gap-1.5 font-medium leading-none"
                :class="sizeClasses.text"
            >
                <slot
                    name="value"
                    :value="effectiveValue"
                    :formatted="formattedValue"
                    :count="count"
                    :descriptive="descriptiveText"
                >
                    <!-- Numeric Rating Badge -->
                    <span
                        v-if="showValue"
                        class="font-bold text-slate-800 dark:text-slate-100 tracking-tight"
                    >
                        {{ formattedValue }}
                    </span>

                    <!-- Descriptive Text (e.g. "Sangat Puas") -->
                    <span
                        v-if="showDescriptive && descriptiveText"
                        class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                        <slot name="descriptive" :value="effectiveValue" :text="descriptiveText">
                            {{ descriptiveText }}
                        </slot>
                    </span>

                    <!-- Review Count (e.g. 1.284 ulasan) -->
                    <span
                        v-if="count > 0"
                        class="text-slate-400 dark:text-slate-500 font-normal"
                    >
                        ({{ count.toLocaleString(locale === 'en' ? 'en-US' : (locale === 'es' ? 'es-ES' : (locale === 'fr' ? 'fr-FR' : 'id-ID'))) }} {{ resolvedCountLabel }})
                    </span>
                </slot>

                <slot name="suffix"></slot>
            </div>
        </div>

        <!-- Helper Hint & Error Messages -->
        <span v-if="error" class="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm leading-none">error</span>
            <slot name="error">{{ error }}</slot>
        </span>
        <span v-else-if="hint || $slots.hint" class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 block">
            <slot name="hint">{{ hint }}</slot>
        </span>
    </div>
</template>
