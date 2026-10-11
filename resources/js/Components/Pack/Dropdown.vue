<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useClickOutside } from '../../Composables/Pack/useClickOutside';
import Badge from './Badge.vue';
import ButtonSubmit from './ButtonSubmit.vue';
import InputField from './InputField.vue';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // [{ label, description, icon, iconColor, badge, badgeVariant, shortcut, selected, heading, separator, disabled, href, action, variant }]
    },
    // Penjajaran & Posisi
    align: {
        type: String,
        default: 'left',
        validator: (val) => ['left', 'right', 'center'].includes(val),
    },
    placement: {
        type: String,
        default: 'bottom',
        validator: (val) => ['bottom', 'top'].includes(val),
    },
    width: {
        type: String,
        default: '48',
        validator: (val) => ['auto', '28', '32', '40', '48', '56', '64', '72', '80', '96', 'full'].includes(val),
    },
    maxHeight: {
        type: String,
        default: 'auto',
        validator: (v) => ['auto', 'xs', 'sm', 'md', 'lg', 'xl', 'none'].includes(v),
    },
    contentClasses: {
        type: String,
        default: '',
    },
    // Perilaku Interaksi
    closeOnClick: {
        type: Boolean,
        default: true,
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    triggerType: {
        type: String,
        default: 'click', // 'click', 'hover'
        validator: (v) => ['click', 'hover'].includes(v),
    },
    // Pilar 1: Warna & Tema
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
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
    },
    // Tombol Pemicu (Trigger Button) Kustomisasi Komprehensif
    title: {
        type: String,
        default: '',
    },
    triggerLabel: {
        type: String,
        default: '',
    },
    iconLeft: {
        type: String,
        default: '',
    },
    triggerIcon: {
        type: String,
        default: 'more_vert',
    },
    iconRight: {
        type: String,
        default: '',
    },
    triggerIconRight: {
        type: String,
        default: '',
    },
    triggerVariant: {
        type: String,
        default: 'outline',
        validator: (v) => ['outline', 'solid', 'ghost', 'soft', 'subtle', 'secondary', 'gradient', 'glass', 'default'].includes(v),
    },
    triggerColor: {
        type: String,
        default: 'neutral',
        validator: (v) => ['neutral', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    triggerBlock: {
        type: Boolean,
        default: false,
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    showArrow: {
        type: Boolean,
        default: false,
    },
    // Searchable & Filter Props
    searchable: {
        type: Boolean,
        default: false,
    },
    searchPlaceholder: {
        type: String,
        default: 'Cari opsi...',
    },
    // Kustomisasi Tampilan Konten & Item
    dense: {
        type: Boolean,
        default: false,
    },
    showShortcuts: {
        type: Boolean,
        default: true,
    },
    showDescriptions: {
        type: Boolean,
        default: true,
    },
    headerText: {
        type: String,
        default: '',
    },
    footerText: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['select', 'open', 'close', 'search']);

const containerRef = ref(null);
const menuRef = ref(null);
const isOpen = ref(false);
const focusedIndex = ref(-1);
const searchQuery = ref('');
let hoverTimeout = null;

// Normalisasi Props Trigger Button
const effectiveTitle = computed(() => props.title || props.triggerLabel || '');
const effectiveIconLeft = computed(() => props.iconLeft || (props.triggerIcon !== 'more_vert' ? props.triggerIcon : (effectiveTitle.value ? '' : props.triggerIcon)));
const effectiveIconRight = computed(() => props.iconRight || props.triggerIconRight || '');
const isTriggerBlock = computed(() => props.triggerBlock || props.fullWidth);

useClickOutside(containerRef, () => {
    if (props.closeOnClickOutside && isOpen.value) {
        close();
    }
});

// Fitur Pencarian Dinamis
const filteredItems = computed(() => {
    if (!props.searchable || !searchQuery.value.trim()) {
        return props.items;
    }
    const q = searchQuery.value.toLowerCase().trim();
    return props.items.filter((item) => {
        if (item.separator || item.heading) return false;
        const matchLabel = item.label && item.label.toLowerCase().includes(q);
        const matchDesc = item.description && item.description.toLowerCase().includes(q);
        const matchBadge = item.badge && item.badge.toLowerCase().includes(q);
        return matchLabel || matchDesc || matchBadge;
    });
});

const actionableItems = computed(() =>
    filteredItems.value
        .map((item, idx) => ({ ...item, _originalIndex: idx }))
        .filter((item) => !item.separator && !item.heading && !item.disabled)
);

const toggle = () => {
    if (props.disabled) return;
    isOpen.value ? close() : open();
};

const open = () => {
    if (props.disabled || isOpen.value) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);
    isOpen.value = true;
    focusedIndex.value = -1;
    emit('open');
};

const close = () => {
    if (!isOpen.value) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);
    isOpen.value = false;
    focusedIndex.value = -1;
    searchQuery.value = '';
    emit('close');
};

const handleMouseEnter = () => {
    if (props.triggerType !== 'hover' || props.disabled) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);
    open();
};

const handleMouseLeave = () => {
    if (props.triggerType !== 'hover' || props.disabled) return;
    hoverTimeout = setTimeout(() => {
        close();
    }, 180);
};

onUnmounted(() => {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
});

const handleSearchInput = () => {
    emit('search', searchQuery.value);
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
            if (e.target && e.target.tagName === 'INPUT') return;
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
            if (e.target && e.target.tagName === 'INPUT') return;
            e.preventDefault();
            focusedIndex.value = 0;
            break;
        case 'End':
            if (e.target && e.target.tagName === 'INPUT') return;
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
        full: 'rounded-3xl',
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

// Pilar 2: Skala Ukuran Dinamis (5 Tingkat: xs, sm, md, lg, xl)
const sizeClasses = computed(() => {
    const sz = {
        xs: {
            item: 'px-2 py-1 text-[11px] gap-1.5',
            icon: 'text-[13px]',
            iconBox: 'w-5 h-5 text-[11px]',
            heading: 'px-2 py-0.5 text-[9px]',
            badge: 'text-[8px] px-1 py-0.2',
            shortcut: 'text-[8px]',
            header: 'px-2 py-1 text-[11px]',
            footer: 'px-2 py-1 text-[11px]',
        },
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
        xl: {
            item: 'px-4 py-3 text-base sm:text-lg gap-3.5',
            icon: 'text-xl',
            iconBox: 'w-10 h-10 text-lg',
            heading: 'px-4 py-2.5 text-sm',
            badge: 'text-xs px-2.5 py-1',
            shortcut: 'text-xs',
            header: 'px-4 py-3 text-base',
            footer: 'px-4 py-3 text-base',
        },
    };
    return sz[props.size] || sz.md;
});

// Width Classes (11 Pilihan Lengkap)
const widthClass = computed(() => {
    const map = {
        auto: 'w-auto min-w-[140px]',
        '28': 'w-28',
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

// Max Height Classes (7 Pilihan Lengkap)
const maxHeightClass = computed(() => {
    switch (props.maxHeight) {
        case 'xs':
            return 'max-h-36 overflow-y-auto';
        case 'sm':
            return 'max-h-48 overflow-y-auto';
        case 'md':
            return 'max-h-64 overflow-y-auto';
        case 'lg':
            return 'max-h-80 overflow-y-auto';
        case 'xl':
            return 'max-h-96 overflow-y-auto';
        case 'none':
            return 'max-h-none overflow-y-visible';
        case 'auto':
        default:
            return 'max-h-[85vh] sm:max-h-[75vh] overflow-y-auto';
    }
});

// Placement & Alignment Dynamic Classes
const placementClasses = computed(() => {
    if (props.placement === 'top') {
        switch (props.align) {
            case 'right':
                return 'bottom-full mb-1.5 right-0 origin-bottom-right';
            case 'center':
                return 'bottom-full mb-1.5 left-1/2 -translate-x-1/2 origin-bottom';
            case 'left':
            default:
                return 'bottom-full mb-1.5 left-0 origin-bottom-left';
        }
    }
    // bottom
    switch (props.align) {
        case 'right':
            return 'top-full mt-1.5 right-0 origin-top-right';
        case 'center':
            return 'top-full mt-1.5 left-1/2 -translate-x-1/2 origin-top';
        case 'left':
        default:
            return 'top-full mt-1.5 left-0 origin-top-left';
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

// Varian Tombol ButtonSubmit Mapping
const buttonSubmitVariant = computed(() => {
    switch (props.triggerVariant) {
        case 'solid':
            return 'primary';
        case 'subtle':
        case 'soft':
            return 'soft';
        case 'ghost':
            return 'ghost';
        case 'secondary':
            return 'secondary';
        case 'gradient':
            return 'gradient';
        case 'glass':
            return 'glass';
        case 'outline':
        case 'default':
        default:
            return 'outline';
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
    <div
        ref="containerRef"
        :class="['relative inline-block', isTriggerBlock ? 'w-full block' : '']"
        @keydown="handleKeydown"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <!-- Trigger Slot / Default Trigger Button (Menggunakan ButtonSubmit Atomik) -->
        <div
            @click="toggle"
            :aria-expanded="isOpen"
            aria-haspopup="true"
            :class="[isTriggerBlock ? 'w-full block' : 'inline-block']"
        >
            <slot name="trigger" :is-open="isOpen" :toggle="toggle" :open="open" :close="close">
                <ButtonSubmit
                    type="button"
                    :disabled="disabled"
                    :variant="buttonSubmitVariant"
                    :color-theme="triggerColor === 'neutral' ? 'default' : triggerColor"
                    :size="size === 'xl' ? 'lg' : (size === 'xs' ? 'xs' : size)"
                    :rounded="radius === 'full' ? 'full' : (radius === 'none' ? 'none' : 'default')"
                    :full-width="isTriggerBlock"
                    :class="[
                        radiusClasses,
                        'transition-all duration-150 select-none cursor-pointer',
                        isTriggerBlock ? 'w-full justify-between' : '',
                        isOpen ? 'ring-2 ring-primary-500/30 dark:ring-primary-400/30' : ''
                    ]"
                >
                    <div class="inline-flex items-center gap-1.5 min-w-0 truncate">
                        <span
                            v-if="effectiveIconLeft"
                            class="material-symbols-outlined leading-none shrink-0"
                            :class="sizeClasses.icon"
                        >
                            {{ effectiveIconLeft }}
                        </span>
                        <span v-if="effectiveTitle" class="truncate font-medium">
                            {{ effectiveTitle }}
                        </span>
                    </div>

                    <span
                        v-if="effectiveIconRight || showArrow"
                        class="material-symbols-outlined leading-none shrink-0 transition-transform duration-200"
                        :class="[
                            sizeClasses.icon,
                            showArrow && isOpen ? (placement === 'top' ? '-rotate-180' : 'rotate-180') : '',
                            effectiveTitle || effectiveIconLeft ? 'ml-auto sm:ml-1.5' : ''
                        ]"
                    >
                        {{ effectiveIconRight || (placement === 'top' ? 'expand_less' : 'expand_more') }}
                    </span>
                </ButtonSubmit>
            </slot>
        </div>

        <!-- Dropdown Popover Panel -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            :enter-from-class="placement === 'top' ? 'opacity-0 scale-95 translate-y-1.5' : 'opacity-0 scale-95 -translate-y-1.5'"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-100 scale-100 translate-y-0"
            :leave-to-class="placement === 'top' ? 'opacity-0 scale-95 translate-y-1.5' : 'opacity-0 scale-95 -translate-y-1.5'"
        >
            <div
                v-show="isOpen"
                ref="menuRef"
                role="menu"
                :class="[
                    widthClass,
                    placementClasses,
                    radiusClasses,
                    panelVariantClasses,
                    maxHeightClass,
                    contentClasses,
                    'absolute z-50 py-1 overflow-hidden transition-all duration-150 max-w-[calc(100vw-2rem)]',
                ]"
            >
                <!-- Full Content Replacement Slot -->
                <slot name="content" :close="close">
                    <!-- Live Search Filter Input (Menggunakan InputField Pack UI) -->
                    <div v-if="searchable" class="p-2 border-b border-slate-100 dark:border-slate-800" @click.stop>
                        <InputField
                            v-model="searchQuery"
                            type="search"
                            :placeholder="searchPlaceholder"
                            size="xs"
                            icon="search"
                            :clearable="true"
                            class="w-full"
                            @input="handleSearchInput"
                        />
                    </div>

                    <!-- Header Slot / Default Header Text -->
                    <div
                        v-if="$slots.header || headerText"
                        :class="[
                            'border-b border-slate-100 dark:border-slate-800/80',
                            sizeClasses.header
                        ]"
                    >
                        <slot name="header" :close="close">
                            <div class="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                                {{ headerText }}
                            </div>
                        </slot>
                    </div>

                    <!-- Menu Items List -->
                    <div class="space-y-0.5" :class="variant === 'pills' || variant === 'rich' ? 'px-0.5' : ''">
                        <!-- Empty Search Result -->
                        <div
                            v-if="searchable && searchQuery && filteredItems.length === 0"
                            class="py-6 px-3 text-center text-xs text-slate-400"
                        >
                            <span class="material-symbols-outlined text-xl mb-1 text-slate-300 dark:text-slate-600 block">search_off</span>
                            Tidak ada opsi yang cocok
                        </div>

                        <template v-for="(item, index) in filteredItems" :key="index">
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
                                    dense ? 'px-2 py-1 text-xs gap-1.5' : sizeClasses.item,
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
                                            dense ? 'w-5 h-5 text-xs' : sizeClasses.iconBox,
                                            item.iconColor || themeClasses.iconBox
                                        ]"
                                    >
                                        <span class="material-symbols-outlined leading-none" :class="dense ? 'text-xs' : sizeClasses.icon">{{ item.icon }}</span>
                                    </div>

                                    <!-- Standard Icon -->
                                    <span
                                        v-else-if="item.icon"
                                        class="material-symbols-outlined leading-none shrink-0 select-none"
                                        :class="[dense ? 'text-xs' : sizeClasses.icon, item.iconColor || 'text-slate-400 dark:text-slate-500 group-hover:text-current']"
                                        aria-hidden="true"
                                    >
                                        {{ item.icon }}
                                    </span>

                                    <!-- Label & Subtext / Description -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <span class="truncate font-medium">{{ item.label }}</span>
                                            <!-- Item Badge (Reusing Pack Badge Component) -->
                                            <Badge
                                                v-if="item.badge"
                                                size="xs"
                                                :variant="item.badgeVariant ? 'soft' : 'subtle'"
                                                :color="item.badgeColor || item.badgeVariant || (colorTheme === 'dark' ? 'neutral' : colorTheme)"
                                                class="shrink-0"
                                            >
                                                {{ item.badge }}
                                            </Badge>
                                        </div>
                                        <div
                                            v-if="item.description && showDescriptions"
                                            class="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-tight font-normal"
                                        >
                                            {{ item.description }}
                                        </div>
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
                                        v-if="item.shortcut && showShortcuts"
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

                    <!-- Footer Slot / Default Footer Text -->
                    <div
                        v-if="$slots.footer || footerText"
                        :class="[
                            'border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40',
                            sizeClasses.footer
                        ]"
                    >
                        <slot name="footer" :close="close">
                            <div class="text-[11px] text-slate-500 dark:text-slate-400">
                                {{ footerText }}
                            </div>
                        </slot>
                    </div>
                </slot>
            </div>
        </Transition>
    </div>
</template>
