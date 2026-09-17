<script setup>
import { ref, computed } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // [{ label, description, icon, iconColor, badge, badgeVariant, shortcut, selected, heading, separator, disabled, href, action, variant }]
    },
    align: {
        type: String,
        default: 'left',
        validator: (val) => ['left', 'right', 'center'].includes(val),
    },
    width: {
        type: String,
        default: '48',
        validator: (val) => ['auto', '32', '40', '48', '56', '64', '72', '80', '96', 'full'].includes(val),
    },
    contentClasses: {
        type: String,
        default: '',
    },
    closeOnClick: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    // Pilar 1: Warna
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    // Pilar 2: Bentuk & Tampilan (Anti-Monoton)
    variant: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'glassmorphic', 'rich', 'pills', 'bordered'].includes(v),
    },
    radius: {
        type: String,
        default: 'xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    // Pilar 4: Ikon & Trigger Default
    triggerIcon: {
        type: String,
        default: 'more_vert',
    },
    triggerLabel: {
        type: String,
        default: '',
    },
    showArrow: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select', 'open', 'close']);

const containerRef = ref(null);
const menuRef = ref(null);
const isOpen = ref(false);
const focusedIndex = ref(-1);

useClickOutside(containerRef, () => {
    if (isOpen.value) close();
});

const actionableItems = computed(() =>
    props.items
        .map((item, idx) => ({ ...item, _originalIndex: idx }))
        .filter((item) => !item.separator && !item.heading && !item.disabled)
);

const toggle = () => {
    if (props.disabled) return;
    isOpen.value ? close() : open();
};

const open = () => {
    if (props.disabled || isOpen.value) return;
    isOpen.value = true;
    focusedIndex.value = -1;
    emit('open');
};

const close = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    focusedIndex.value = -1;
    emit('close');
};

const selectItem = (item) => {
    if (item.disabled) return;
    if (typeof item.action === 'function') {
        item.action(item);
    }
    emit('select', item);
    if (props.closeOnClick && !item.href) {
        close();
    }
};

const handleKeydown = (e) => {
    if (!isOpen.value) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (actionableItems.value.length > 0) {
                focusedIndex.value = (focusedIndex.value + 1) % actionableItems.value.length;
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (actionableItems.value.length > 0) {
                focusedIndex.value = focusedIndex.value <= 0
                    ? actionableItems.value.length - 1
                    : focusedIndex.value - 1;
            }
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            if (focusedIndex.value >= 0 && focusedIndex.value < actionableItems.value.length) {
                selectItem(actionableItems.value[focusedIndex.value]);
            }
            break;
        case 'Escape':
            e.preventDefault();
            close();
            break;
        case 'Home':
            e.preventDefault();
            focusedIndex.value = 0;
            break;
        case 'End':
            e.preventDefault();
            if (actionableItems.value.length > 0) {
                focusedIndex.value = actionableItems.value.length - 1;
            }
            break;
    }
};

const isFocused = (item) => {
    if (focusedIndex.value < 0) return false;
    const focused = actionableItems.value[focusedIndex.value];
    return focused && focused._originalIndex === item._originalIndex;
};

// Pilar 1: Theme Presets
const themeClasses = computed(() => {
    const themes = {
        primary: {
            hoverItem: 'hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300',
            activeIndicator: 'text-blue-600 dark:text-blue-400',
            iconBox: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
            borderAccent: 'border-t-2 border-t-blue-600 dark:border-t-blue-500',
            triggerFocus: 'focus-visible:ring-blue-500/30 focus-visible:border-blue-500',
            badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
        },
        indigo: {
            hoverItem: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300',
            activeIndicator: 'text-indigo-600 dark:text-indigo-400',
            iconBox: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
            borderAccent: 'border-t-2 border-t-indigo-600 dark:border-t-indigo-500',
            triggerFocus: 'focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500',
            badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
        },
        emerald: {
            hoverItem: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300',
            activeIndicator: 'text-emerald-600 dark:text-emerald-400',
            iconBox: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
            borderAccent: 'border-t-2 border-t-emerald-600 dark:border-t-emerald-500',
            triggerFocus: 'focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
        },
        purple: {
            hoverItem: 'hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300',
            activeIndicator: 'text-purple-600 dark:text-purple-400',
            iconBox: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
            borderAccent: 'border-t-2 border-t-purple-600 dark:border-t-purple-500',
            triggerFocus: 'focus-visible:ring-purple-500/30 focus-visible:border-purple-500',
            badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
        },
        amber: {
            hoverItem: 'hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300',
            activeIndicator: 'text-amber-600 dark:text-amber-400',
            iconBox: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
            borderAccent: 'border-t-2 border-t-amber-500 dark:border-t-amber-400',
            triggerFocus: 'focus-visible:ring-amber-500/30 focus-visible:border-amber-500',
            badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
        },
        rose: {
            hoverItem: 'hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300',
            activeIndicator: 'text-rose-600 dark:text-rose-400',
            iconBox: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
            borderAccent: 'border-t-2 border-t-rose-600 dark:border-t-rose-500',
            triggerFocus: 'focus-visible:ring-rose-500/30 focus-visible:border-rose-500',
            badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        },
        cyan: {
            hoverItem: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-700 dark:hover:text-cyan-300',
            activeIndicator: 'text-cyan-600 dark:text-cyan-400',
            iconBox: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
            borderAccent: 'border-t-2 border-t-cyan-600 dark:border-t-cyan-500',
            triggerFocus: 'focus-visible:ring-cyan-500/30 focus-visible:border-cyan-500',
            badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
        },
        dark: {
            hoverItem: 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
            activeIndicator: 'text-slate-900 dark:text-white',
            iconBox: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
            borderAccent: 'border-t-2 border-t-slate-800 dark:border-t-slate-200',
            triggerFocus: 'focus-visible:ring-slate-500/30 focus-visible:border-slate-500',
            badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        },
    };
    return themes[props.colorTheme] || themes.primary;
});

// Pilar 2: Radius Classes
const radiusClasses = computed(() => {
    const rad = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-3xl', // Popover container sebaiknya 3xl saat prop full
    };
    return rad[props.radius] || 'rounded-xl';
});

const itemRadiusClass = computed(() => {
    if (props.variant === 'pills') return 'rounded-full';
    const rad = {
        none: 'rounded-none',
        sm: 'rounded-xs',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-lg',
        '2xl': 'rounded-xl',
        '3xl': 'rounded-2xl',
        full: 'rounded-full',
    };
    return rad[props.radius] || 'rounded-lg';
});

// Pilar 2: Size Classes
const sizeClasses = computed(() => {
    const sz = {
        sm: {
            item: 'px-2.5 py-1.5 text-xs gap-2',
            icon: 'text-[15px]',
            iconBox: 'w-6 h-6 text-xs',
            heading: 'px-2.5 py-1 text-[10px]',
            badge: 'text-[9px] px-1 py-0.2',
            shortcut: 'text-[9px]',
            header: 'px-2.5 py-1.5 text-xs',
            footer: 'px-2.5 py-1.5 text-xs',
        },
        md: {
            item: 'px-3 py-2 text-xs sm:text-sm gap-2.5',
            icon: 'text-base',
            iconBox: 'w-7 h-7 text-sm',
            heading: 'px-3 py-1.5 text-[11px]',
            badge: 'text-[10px] px-1.5 py-0.5',
            shortcut: 'text-[10px]',
            header: 'px-3 py-2 text-xs sm:text-sm',
            footer: 'px-3 py-2 text-xs sm:text-sm',
        },
        lg: {
            item: 'px-3.5 py-2.5 text-sm sm:text-base gap-3',
            icon: 'text-lg',
            iconBox: 'w-8 h-8 text-base',
            heading: 'px-3.5 py-2 text-xs',
            badge: 'text-xs px-2 py-0.5',
            shortcut: 'text-xs',
            header: 'px-3.5 py-2.5 text-sm',
            footer: 'px-3.5 py-2.5 text-sm',
        },
    };
    return sz[props.size] || sz.md;
});

// Width Classes
const widthClass = computed(() => {
    const map = {
        auto: 'w-auto min-w-[160px]',
        '32': 'w-32',
        '40': 'w-40',
        '48': 'w-48',
        '56': 'w-56',
        '64': 'w-64',
        '72': 'w-72',
        '80': 'w-80',
        '96': 'w-96',
        full: 'w-full',
    };
    return map[props.width] || 'w-48';
});

// Alignment Classes
const alignClass = computed(() => {
    switch (props.align) {
        case 'right':
            return 'right-0 origin-top-right';
        case 'center':
            return 'left-1/2 -translate-x-1/2 origin-top';
        case 'left':
        default:
            return 'left-0 origin-top-left';
    }
});

// Popover Panel Styling sesuai Varian
const panelVariantClasses = computed(() => {
    switch (props.variant) {
        case 'glassmorphic':
            return 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-slate-800/80 shadow-2xl';
        case 'rich':
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl p-1.5';
        case 'pills':
            return 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-1.5';
        case 'bordered':
            return [
                'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-lg',
                themeClasses.value.borderAccent,
            ];
        case 'default':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg';
    }
});

// Item Variant Classes
const variantItemClass = (variant, isSelected) => {
    if (isSelected) {
        return [
            themeClasses.value.hoverItem,
            'font-semibold bg-slate-50 dark:bg-slate-800/60',
        ];
    }

    switch (variant) {
        case 'danger':
            return 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium';
        case 'success':
            return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium';
        case 'warning':
            return 'text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium';
        case 'primary':
            return 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium';
        case 'info':
            return 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 font-medium';
        default:
            return [
                'text-slate-700 dark:text-slate-200',
                themeClasses.value.hoverItem,
            ];
    }
};

defineExpose({ open, close, toggle, isOpen });
</script>

<template>
    <div ref="containerRef" class="relative inline-block" @keydown="handleKeydown">
        <!-- Trigger Slot / Default Trigger Button -->
        <div @click="toggle" :aria-expanded="isOpen" aria-haspopup="true">
            <slot name="trigger" :is-open="isOpen" :toggle="toggle" :open="open" :close="close">
                <button
                    type="button"
                    :disabled="disabled"
                    :class="[
                        'inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-2xs transition-all duration-150 cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2',
                        radiusClasses,
                        themeClasses.triggerFocus,
                        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
                        isOpen ? 'ring-2 ring-slate-400/20 dark:ring-slate-600/30' : ''
                    ]"
                >
                    <span
                        v-if="triggerIcon"
                        class="material-symbols-outlined text-base leading-none shrink-0"
                    >
                        {{ triggerIcon }}
                    </span>
                    <span v-if="triggerLabel">{{ triggerLabel }}</span>
                    <span
                        v-if="showArrow"
                        class="material-symbols-outlined text-sm leading-none transition-transform duration-200 ml-0.5"
                        :class="isOpen ? 'rotate-180' : ''"
                    >
                        expand_more
                    </span>
                </button>
            </slot>
        </div>

        <!-- Dropdown Popover Panel -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1.5"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1.5"
        >
            <div
                v-show="isOpen"
                ref="menuRef"
                role="menu"
                :class="[
                    widthClass,
                    alignClass,
                    radiusClasses,
                    panelVariantClasses,
                    contentClasses,
                    'absolute z-50 mt-1.5 py-1 overflow-hidden transition-all duration-150',
                ]"
            >
                <!-- Full Content Replacement Slot -->
                <slot name="content" :close="close">
                    <!-- Header Slot -->
                    <div
                        v-if="$slots.header"
                        :class="[
                            'border-b border-slate-100 dark:border-slate-800/80',
                            sizeClasses.header
                        ]"
                    >
                        <slot name="header" :close="close" />
                    </div>

                    <!-- Menu Items List -->
                    <div class="space-y-0.5" :class="variant === 'pills' || variant === 'rich' ? 'px-0.5' : ''">
                        <template v-for="(item, index) in items" :key="index">
                            <!-- Separator -->
                            <div
                                v-if="item.separator"
                                class="my-1 border-t border-slate-100 dark:border-slate-800"
                                role="separator"
                            />

                            <!-- Heading Category -->
                            <div
                                v-else-if="item.heading"
                                :class="[
                                    'font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none',
                                    sizeClasses.heading
                                ]"
                            >
                                {{ item.heading }}
                            </div>

                            <!-- Interactive Menu Item -->
                            <component
                                v-else
                                :is="item.href ? 'a' : 'button'"
                                :href="item.href || undefined"
                                :type="item.href ? undefined : 'button'"
                                role="menuitem"
                                :tabindex="item.disabled ? -1 : 0"
                                @click="!item.disabled && selectItem(item)"
                                :class="[
                                    'w-full flex items-center transition-colors duration-100 cursor-pointer select-none text-left',
                                    sizeClasses.item,
                                    itemRadiusClass,
                                    item.disabled
                                        ? 'opacity-40 cursor-not-allowed pointer-events-none'
                                        : variantItemClass(item.variant, item.selected),
                                    isFocused(item)
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                        : '',
                                ]"
                            >
                                <slot name="item" :item="item" :index="index" :close="close" :is-selected="item.selected" :is-focused="isFocused(item)">
                                    <!-- Rich Variant Icon Box -->
                                    <div
                                        v-if="variant === 'rich' && item.icon"
                                        :class="[
                                            'inline-flex items-center justify-center rounded-lg shrink-0 select-none',
                                            sizeClasses.iconBox,
                                            item.iconColor || themeClasses.iconBox
                                        ]"
                                    >
                                        <span class="material-symbols-outlined leading-none" :class="sizeClasses.icon">{{ item.icon }}</span>
                                    </div>

                                    <!-- Standard Icon -->
                                    <span
                                        v-else-if="item.icon"
                                        class="material-symbols-outlined leading-none shrink-0 select-none"
                                        :class="[sizeClasses.icon, item.iconColor || 'text-slate-400 dark:text-slate-500 group-hover:text-current']"
                                        aria-hidden="true"
                                    >
                                        {{ item.icon }}
                                    </span>

                                    <!-- Label & Subtext / Description -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <span class="truncate font-medium">{{ item.label }}</span>
                                            <!-- Item Badge -->
                                            <span
                                                v-if="item.badge"
                                                :class="[
                                                    'font-semibold rounded-md shrink-0',
                                                    sizeClasses.badge,
                                                    item.badgeVariant ? `bg-${item.badgeVariant}-50 text-${item.badgeVariant}-600 dark:bg-${item.badgeVariant}-950/60 dark:text-${item.badgeVariant}-400` : themeClasses.badgeBg
                                                ]"
                                            >
                                                {{ item.badge }}
                                            </span>
                                        </div>
                                        <p
                                            v-if="item.description"
                                            class="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-tight font-normal"
                                        >
                                            {{ item.description }}
                                        </p>
                                    </div>

                                    <!-- Selected Indicator Checkmark -->
                                    <span
                                        v-if="item.selected"
                                        class="material-symbols-outlined text-base leading-none shrink-0"
                                        :class="themeClasses.activeIndicator"
                                        aria-hidden="true"
                                    >
                                        check
                                    </span>

                                    <!-- Keyboard Shortcut -->
                                    <span
                                        v-if="item.shortcut"
                                        :class="[
                                            'font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-1',
                                            sizeClasses.shortcut
                                        ]"
                                    >
                                        {{ item.shortcut }}
                                    </span>
                                </slot>
                            </component>
                        </template>
                    </div>

                    <!-- Footer Slot -->
                    <div
                        v-if="$slots.footer"
                        :class="[
                            'border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40',
                            sizeClasses.footer
                        ]"
                    >
                        <slot name="footer" :close="close" />
                    </div>
                </slot>
            </div>
        </Transition>
    </div>
</template>
