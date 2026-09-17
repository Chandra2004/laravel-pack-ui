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
     * 2. PILAR WARNA (color & colorTheme)
     */
    colorTheme: {
        type: String,
        default: '', // 'primary' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'dark'
    },
    color: {
        type: String,
        default: 'amber', // amber | yellow | rose | red | emerald | blue | purple | indigo | custom hex
    },
    inactiveColor: {
        type: String,
        default: '',
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
    descriptiveTexts: {
        type: Object,
        default: () => ({
            1: 'Sangat Buruk',
            2: 'Buruk',
            3: 'Cukup',
            4: 'Puas',
            5: 'Sangat Puas',
        }),
    },
    count: {
        type: Number,
        default: 0,
    },
    countLabel: {
        type: String,
        default: 'ulasan',
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
        default: false,
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
    blue: '#3b82f6',
    purple: '#a855f7',
    indigo: '#6366f1',
    cyan: '#06b6d4',
};

const activeColorHex = computed(() => {
    if (props.colorTheme && themeMap[props.colorTheme]) {
        return themeMap[props.colorTheme];
    }
    return colorMap[props.color] || props.color;
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
                gap: 'gap-0.5',
            },
            md: {
                icon: 'text-lg sm:text-2xl w-5 sm:w-6 h-5 sm:h-6',
                text: 'text-xs sm:text-sm',
                gap: 'gap-1',
            },
            lg: {
                icon: 'text-2xl sm:text-3xl w-6 sm:w-8 h-6 sm:h-8',
                text: 'text-sm sm:text-base',
                gap: 'gap-1.5',
            },
            xl: {
                icon: 'text-3xl sm:text-4xl w-8 sm:w-10 h-8 sm:h-10',
                text: 'text-base sm:text-lg',
                gap: 'gap-1.5 sm:gap-2',
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

const handleTouchMove = (event) => {
    if (props.readonly || props.disabled || !starsContainerRef.value) return;
    const touch = event.touches[0];
    const rect = starsContainerRef.value.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const fraction = Math.max(0, Math.min(1, x / width));
    let val = fraction * props.max;

    if (props.precision !== 'any') {
        const step = Number(props.precision);
        if (step > 0) {
            val = Math.round(val / step) * step;
        }
    }

    val = Math.max(0, Math.min(props.max, Number(val.toFixed(2))));
    hoverValue.value = val;
    isHovering.value = true;
    emit('hover', val);
};

const handleTouchEnd = () => {
    if (props.readonly || props.disabled) return;
    if (hoverValue.value !== null) {
        emit('update:modelValue', hoverValue.value);
        emit('change', hoverValue.value);
    }
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

// Formatted display text
const formattedValue = computed(() => {
    const val = effectiveValue.value;
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

// Descriptive label based on rounded star level
const descriptiveText = computed(() => {
    const starLevel = Math.ceil(effectiveValue.value);
    return props.descriptiveTexts[starLevel] || '';
});

defineExpose({
    effectiveValue,
    hoverValue,
    activeColorHex,
    descriptiveText,
});
</script>

<template>
    <div
        class="inline-flex flex-col text-left select-none"
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
                'inline-flex items-center flex-wrap',
                valuePosition === 'bottom' ? 'flex-col items-start gap-1.5' : 'flex-row gap-2.5',
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
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                :class="[
                    'inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded-lg touch-none',
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
                                inactiveColor ? '' : 'text-slate-200 dark:text-slate-700/80'
                            ]"
                            :style="[
                                inactiveColor ? { color: inactiveColor } : {},
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
                        ({{ count.toLocaleString('id-ID') }} {{ countLabel }})
                    </span>
                </slot>

                <slot name="suffix"></slot>
            </div>
        </div>

        <!-- Helper Hint & Error Messages -->
        <p v-if="error" class="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm leading-none">error</span>
            <slot name="error">{{ error }}</slot>
        </p>
        <p v-else-if="hint || $slots.hint" class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <slot name="hint">{{ hint }}</slot>
        </p>
    </div>
</template>
