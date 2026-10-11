<script setup>
import { ref, computed, watch, inject, provide } from 'vue';
import { Link } from '@inertiajs/vue3';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';
import SidebarFlyoutProvider from './Sidebar/SidebarFlyoutProvider.vue';
import Badge from './Badge.vue';

const props = defineProps({
    /**
     * Data item konfigurasi (Mode Config-Driven)
     */
    item: {
        type: Object,
        default: () => ({}),
    },
    /**
     * Properti Deklaratif (Mode Compound Components)
     */
    label: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    href: {
        type: String,
        default: '',
    },
    badge: {
        type: [String, Number],
        default: '',
    },
    badgeVariant: {
        type: String,
        default: '',
    },
    children: {
        type: Array,
        default: () => [],
    },
    active: {
        type: Boolean,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    target: {
        type: String,
        default: '',
    },
    expanded: {
        type: Boolean,
        default: false,
    },
    separator: {
        type: Boolean,
        default: false,
    },
    heading: {
        type: String,
        default: '',
    },
    /**
     * Hirarki kedalaman (depth)
     */
    depth: {
        type: Number,
        default: 0,
    },
    /**
     * Override context (opsional)
     */
    isCollapsed: {
        type: Boolean,
        default: null,
    },
    isMobile: {
        type: Boolean,
        default: null,
    },
    activeRoute: {
        type: String,
        default: null,
    },
    colorTheme: {
        type: Object,
        default: null,
    },
    itemStyle: {
        type: String,
        default: null,
    },
    radiusClass: {
        type: String,
        default: null,
    },
    size: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['navigate']);

// Injeksi Context Terpusat dari Sidebar / SidebarComponent
const context = inject('packSidebarContext', null);

// Injeksi konteks apakah item ini berada di dalam flyout popover
const isInFlyout = inject('packSidebarInFlyout', false);
const closeFlyoutContext = inject('packSidebarCloseFlyout', null);

// Injeksi dan penyediaan kedalaman hirarki submenu otomatis
const injectedDepth = inject('packSidebarItemDepth', 0);
const effectiveDepth = computed(() => {
    if (props.depth > 0) return props.depth;
    return typeof injectedDepth === 'object' && injectedDepth !== null && 'value' in injectedDepth
        ? injectedDepth.value
        : Number(injectedDepth) || 0;
});
provide('packSidebarItemDepth', computed(() => effectiveDepth.value + 1));

// Resolusi Properti Reaktif (Prop Eksplisit -> Konfigurasi Item -> Injeksi Context -> Default)
const resolvedVariant = computed(() => {
    return context?.variant?.value ?? 'default';
});

const resolvedCollapsed = computed(() => {
    if (props.isCollapsed !== null) return props.isCollapsed;
    // Sub-item (depth > 0) atau item yang berada di dalam popover flyout tidak boleh collapsed
    if (isInFlyout || effectiveDepth.value > 0) return false;
    if (resolvedVariant.value === 'rail') return true;
    return context?.isCollapsed?.value ?? false;
});

const resolvedMobile = computed(() => {
    if (props.isMobile !== null) return props.isMobile;
    return context?.isMobile?.value ?? false;
});

const resolvedActiveRoute = computed(() => {
    if (props.activeRoute !== null) return props.activeRoute;
    return context?.activeRoute?.value ?? '';
});

const resolvedColorTheme = computed(() => {
    if (props.colorTheme !== null) return props.colorTheme;
    return context?.colorTheme?.value ?? {
        indicator: 'bg-blue-600 dark:bg-blue-500',
        soft: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 font-semibold',
        solid: 'text-white bg-blue-600 dark:bg-blue-600 font-semibold shadow-xs shadow-blue-600/20',
        outline: 'text-blue-600 dark:text-blue-400 border border-blue-500/60 dark:border-blue-400/50 font-semibold bg-transparent',
        iconActive: 'text-blue-600 dark:text-blue-400',
        iconSolid: 'text-white',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    };
});

const resolvedItemStyle = computed(() => {
    if (props.itemStyle !== null) return props.itemStyle;
    return context?.itemStyle?.value ?? 'soft';
});

const resolvedRadiusClass = computed(() => {
    if (props.radiusClass !== null) return props.radiusClass;
    return context?.radiusClass?.value ?? 'rounded-xl';
});

const resolvedSize = computed(() => {
    if (props.size !== null) return props.size;
    return context?.size?.value ?? 'md';
});

// Penyatuan Data Item (Config-Driven vs Declarative)
const resolvedItem = computed(() => {
    const base = props.item && Object.keys(props.item).length > 0 ? props.item : {};
    return {
        label: props.label || base.label || '',
        icon: props.icon || base.icon || '',
        href: props.href || base.href || '',
        badge: props.badge !== '' ? props.badge : (base.badge || ''),
        badgeVariant: props.badgeVariant || base.badgeVariant || 'primary',
        children: props.children?.length ? props.children : (base.children || []),
        active: props.active !== null ? props.active : base.active,
        disabled: props.disabled || base.disabled || false,
        separator: props.separator || base.separator || false,
        heading: props.heading || base.heading || '',
        target: props.target || base.target || '',
        expanded: props.expanded || base.expanded || false,
    };
});

const hasChildren = computed(() => {
    return Array.isArray(resolvedItem.value.children) && resolvedItem.value.children.length > 0;
});

const isSelfActive = computed(() => {
    if (resolvedItem.value.active) return true;
    if (resolvedActiveRoute.value && resolvedItem.value.href) {
        return resolvedActiveRoute.value === resolvedItem.value.href || resolvedActiveRoute.value.startsWith(resolvedItem.value.href + '/');
    }
    return false;
});

const hasActiveDescendant = (item) => {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some((child) => {
        if (child.active) return true;
        if (resolvedActiveRoute.value && child.href) {
            if (resolvedActiveRoute.value === child.href || resolvedActiveRoute.value.startsWith(child.href + '/')) {
                return true;
            }
        }
        return hasActiveDescendant(child);
    });
};

const isChildActive = computed(() => {
    return hasActiveDescendant(resolvedItem.value);
});

const isOpen = ref(isChildActive.value || resolvedItem.value.expanded === true);

watch(isChildActive, (val) => {
    if (val) isOpen.value = true;
});

const toggleOpen = () => {
    isOpen.value = !isOpen.value;
};

// Popover flyout untuk mode diciutkan (desktop)
const flyoutRef = ref(null);
const popoverPanelRef = ref(null);
const isFlyoutOpen = ref(false);
const flyoutStyle = ref({ top: '0px', left: '0px' });

provide('packSidebarCloseFlyout', () => {
    isFlyoutOpen.value = false;
});

const updateFlyoutPosition = () => {
    if (flyoutRef.value) {
        const rect = flyoutRef.value.getBoundingClientRect();
        flyoutStyle.value = {
            top: `${Math.max(8, rect.top)}px`,
            left: `${rect.right + 8}px`,
        };
    }
};

useClickOutside(flyoutRef, (e) => {
    if (popoverPanelRef.value && popoverPanelRef.value.contains(e.target)) {
        return;
    }
    if (isFlyoutOpen.value) isFlyoutOpen.value = false;
});

const handleFlyoutToggle = () => {
    if (resolvedCollapsed.value && !resolvedMobile.value) {
        updateFlyoutPosition();
        isFlyoutOpen.value = !isFlyoutOpen.value;
    }
};

const handleFlyoutMouseEnter = () => {
    if (resolvedCollapsed.value && !resolvedMobile.value) {
        updateFlyoutPosition();
        isFlyoutOpen.value = true;
    }
};

const handleFlyoutMouseLeave = () => {
    if (resolvedCollapsed.value && !resolvedMobile.value) {
        isFlyoutOpen.value = false;
    }
};

watch(resolvedCollapsed, (val) => {
    if (!val) {
        isFlyoutOpen.value = false;
    }
});

const handleNavigate = (navItem) => {
    emit('navigate', navItem);
    if (context?.navigate) {
        context.navigate(navItem);
    }
    isFlyoutOpen.value = false;
    if (closeFlyoutContext) {
        closeFlyoutContext();
    }
};

// Skala ukuran dinamis
const sizeClass = computed(() => {
    if (isInFlyout) {
        return {
            item: effectiveDepth.value === 0 ? 'py-1.5 text-xs gap-2.5' : 'py-1 text-[11px] gap-2',
            icon: effectiveDepth.value === 0 ? 'text-[17px]' : 'text-[15px]',
            badge: 'text-[9px] px-1.5 py-0.2',
            collapsed: 'h-10 w-10',
        };
    }
    switch (resolvedSize.value) {
        case 'sm':
            return {
                item: 'py-1.5 text-[11px] gap-2',
                icon: effectiveDepth.value === 0 ? 'text-base' : 'text-[15px]',
                badge: 'text-[9px] px-1.5 py-0.2',
                collapsed: 'h-8 w-8',
            };
        case 'lg':
            return {
                item: 'py-2.5 text-sm gap-3',
                icon: effectiveDepth.value === 0 ? 'text-xl' : 'text-lg',
                badge: 'text-xs px-2 py-0.5',
                collapsed: 'h-11 w-11',
            };
        case 'md':
        default:
            return {
                item: 'py-2 text-xs gap-2.5',
                icon: effectiveDepth.value === 0 ? 'text-lg' : 'text-base',
                badge: 'text-[10px] px-1.5 py-0.5',
                collapsed: 'h-10 w-10',
            };
    }
});

// Indentasi padding kedalaman bertingkat (menyesuaikan container pohon hirarki)
const depthPaddingClass = computed(() => {
    if (isInFlyout) {
        if (effectiveDepth.value === 0) return 'px-2.5';
        if (effectiveDepth.value === 1) return 'pl-3 pr-2';
        if (effectiveDepth.value === 2) return 'pl-5 pr-2';
        return 'pl-7 pr-2';
    }
    if (effectiveDepth.value === 0) return 'px-3';
    if (effectiveDepth.value === 1) return 'px-2.5';
    if (effectiveDepth.value === 2) return 'px-2.5';
    return 'px-2';
});

// Kelas status tidak aktif berdasarkan varian
const inactiveItemClasses = computed(() => {
    const v = resolvedVariant.value;
    if (v === 'rail') {
        return 'text-slate-400 hover:text-white hover:bg-slate-800/80';
    }
    if (v === 'gradient') {
        return 'text-slate-300 hover:text-white hover:bg-white/10';
    }
    if (v === 'glass') {
        return 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 backdrop-blur-xs';
    }
    return 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200';
});

// Kelas aktif berdasarkan gaya pewarnaan item dan varian
const activeItemClasses = computed(() => {
    const t = resolvedColorTheme.value;
    const v = resolvedVariant.value;

    if (v === 'glass') {
        if (resolvedItemStyle.value === 'solid') {
            return 'text-white bg-slate-900/80 dark:bg-white/20 backdrop-blur-md border border-white/20 font-semibold shadow-xs';
        }
        return `${t.soft} bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 font-semibold shadow-xs`;
    }

    if (v === 'gradient') {
        if (resolvedItemStyle.value === 'solid') {
            return t.solid;
        }
        return `${t.soft} bg-white/15 dark:bg-white/10 text-white font-semibold border border-white/15 backdrop-blur-xs`;
    }

    if (v === 'rail') {
        if (resolvedItemStyle.value === 'solid') {
            return t.solid;
        }
        return `${t.soft} ring-1 ring-current/25 shadow-xs`;
    }

    if (resolvedItemStyle.value === 'solid') {
        return t.solid;
    }
    if (resolvedItemStyle.value === 'outline') {
        return t.outline;
    }
    if (resolvedItemStyle.value === 'pill') {
        return `${t.soft} rounded-full`;
    }
    return t.soft;
});

// Badge variant styling mapping to Pack Badge Component
const resolvedBadgeColor = computed(() => {
    const bv = resolvedItem.value.badgeVariant;
    if (['success', 'emerald'].includes(bv)) return 'emerald';
    if (['warning', 'amber'].includes(bv)) return 'amber';
    if (['danger', 'rose', 'red'].includes(bv)) return 'rose';
    if (['indigo', 'purple', 'primary', 'blue', 'neutral', 'slate'].includes(bv)) return bv;
    if (resolvedColorTheme.value?.name && ['indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'blue', 'primary'].includes(resolvedColorTheme.value.name)) {
        return resolvedColorTheme.value.name;
    }
    return 'primary';
});

const resolvedBadgeVariant = computed(() => {
    const bv = resolvedItem.value.badgeVariant;
    if (['solid', 'outline'].includes(bv)) return bv;
    return 'soft';
});

const resolvedBadgeSize = computed(() => {
    return resolvedSize.value === 'lg' ? 'sm' : 'xs';
});

const isInternalLink = computed(() => {
    const href = resolvedItem.value.href;
    if (!href || href === '#' || href.startsWith('javascript:')) return false;
    return !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//');
});
</script>

<template>
    <!-- 1. SEPARATOR -->
    <div
        v-if="resolvedItem.separator"
        :class="[
            'my-2 mx-2 border-t',
            resolvedVariant === 'gradient'
                ? 'border-indigo-500/20'
                : resolvedVariant === 'rail'
                ? 'border-slate-800'
                : resolvedVariant === 'glass'
                ? 'border-white/20 dark:border-white/10'
                : 'border-slate-200/70 dark:border-slate-800/80',
        ]"
        role="separator"
    />

    <!-- 2. SECTION HEADING -->
    <div
        v-else-if="resolvedItem.heading"
        class="pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider select-none"
        :class="[
            resolvedCollapsed && !resolvedMobile ? 'text-center px-1' : 'px-3',
            resolvedVariant === 'gradient'
                ? 'text-indigo-300/70'
                : resolvedVariant === 'rail'
                ? 'text-slate-500'
                : resolvedVariant === 'glass'
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-400 dark:text-slate-500',
        ]"
    >
        <template v-if="!resolvedCollapsed || resolvedMobile">
            {{ resolvedItem.heading }}
        </template>
        <span
            v-else
            class="block w-4 h-0.5 mx-auto rounded-full"
            :class="resolvedVariant === 'gradient' ? 'bg-indigo-500/40' : (resolvedVariant === 'rail' ? 'bg-slate-700' : 'bg-slate-300 dark:bg-slate-700')"
            :title="resolvedItem.heading"
        />
    </div>

    <!-- 3. PARENT MENU ITEM (DENGAN ANAK SUB-MENU / SLOT SUBMENU) -->
    <div
        v-else-if="hasChildren || $slots.default"
        ref="flyoutRef"
        class="relative"
        @mouseenter="handleFlyoutMouseEnter"
        @mouseleave="handleFlyoutMouseLeave"
    >
        <!-- Parent Trigger Button -->
        <button
            type="button"
            @click="resolvedCollapsed && !resolvedMobile ? handleFlyoutToggle() : toggleOpen()"
            :aria-expanded="resolvedCollapsed && !resolvedMobile ? isFlyoutOpen : isOpen"
            :title="resolvedCollapsed && !resolvedMobile ? resolvedItem.label : undefined"
            :class="[
                'w-full flex items-center font-medium transition-all duration-150 cursor-pointer select-none text-left group',
                resolvedRadiusClass,
                sizeClass.item,
                depthPaddingClass,
                isSelfActive || isChildActive
                    ? activeItemClasses
                    : inactiveItemClasses,
                resolvedCollapsed && !resolvedMobile ? `justify-center px-0 mx-auto ${sizeClass.collapsed}` : '',
            ]"
        >
            <!-- Left Active Indicator Bar -->
            <span
                v-if="(!resolvedCollapsed || resolvedMobile) && !isInFlyout && (isSelfActive || isChildActive) && effectiveDepth === 0 && resolvedItemStyle !== 'solid'"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                :class="resolvedColorTheme.indicator"
            />

            <!-- Icon -->
            <span
                v-if="resolvedItem.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    sizeClass.icon,
                    (isSelfActive || isChildActive)
                        ? (resolvedItemStyle === 'solid' ? resolvedColorTheme.iconSolid : resolvedColorTheme.iconActive)
                        : (resolvedVariant === 'rail' ? 'text-slate-400 group-hover:text-white' : (resolvedVariant === 'gradient' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')),
                ]"
            >
                {{ resolvedItem.icon }}
            </span>
            <span
                v-else-if="effectiveDepth > 0 || isInFlyout"
                class="w-1.5 h-1.5 rounded-full mx-1 shrink-0 transition-colors"
                :class="(isSelfActive || isChildActive) ? resolvedColorTheme.indicator : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-400'"
            />

            <!-- Label & Chevron (Hanya tampil saat terbuka atau mobile) -->
            <template v-if="!resolvedCollapsed || resolvedMobile">
                <span class="flex-1 truncate tracking-tight">
                    {{ resolvedItem.label }}
                </span>

                <!-- Badge Component -->
                <Badge
                    v-if="resolvedItem.badge"
                    :variant="resolvedBadgeVariant"
                    :color="resolvedBadgeColor"
                    :size="resolvedBadgeSize"
                    rounded="full"
                    class="shrink-0"
                >
                    {{ resolvedItem.badge }}
                </Badge>

                <!-- Flowbite Formal Submenu Chevron SVG -->
                <svg
                    class="w-3 h-3 transition-transform duration-200 shrink-0"
                    :class="[
                        isOpen ? 'rotate-180' : '',
                        isSelfActive || isChildActive
                            ? (resolvedItemStyle === 'solid' ? 'text-white' : resolvedColorTheme.iconActive)
                            : (resolvedVariant === 'gradient' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'),
                    ]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                </svg>
            </template>
        </button>

        <!-- A. Accordion Submenu Biasa (Mode Diperluas & Mobile) -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out overflow-hidden"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[800px] opacity-100"
            leave-active-class="transition-all duration-150 ease-in overflow-hidden"
            leave-from-class="max-h-[800px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
        >
            <div
                v-if="(!resolvedCollapsed || resolvedMobile) && isOpen"
                :class="[
                    'mt-0.5 space-y-0.5 border-l transition-all',
                    resolvedVariant === 'gradient'
                        ? 'border-indigo-500/30'
                        : resolvedVariant === 'glass'
                        ? 'border-white/20 dark:border-white/10'
                        : 'border-slate-200/70 dark:border-slate-800/80',
                    effectiveDepth === 0 ? 'ml-5 pl-2' : 'ml-4 pl-1.5',
                ]"
            >
                <!-- 1. Render deklaratif via slot -->
                <slot>
                    <!-- 2. Fallback: Render dari array children (Multi-level bersarang) -->
                    <SidebarItem
                        v-for="(child, idx) in resolvedItem.children"
                        :key="idx"
                        :item="child"
                        :depth="effectiveDepth + 1"
                        @navigate="handleNavigate"
                    />
                </slot>
            </div>
        </Transition>

        <!-- B. Flyout Popover Floating (Saat Ciut / Collapsed Desktop) -->
        <Teleport to="body" v-if="resolvedCollapsed && !resolvedMobile">
            <Transition
                enter-active-class="transition-all duration-150 ease-out"
                enter-from-class="opacity-0 translate-x-1"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-100 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 translate-x-1"
            >
                <div
                    v-if="isFlyoutOpen"
                    ref="popoverPanelRef"
                    class="fixed z-50 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl shadow-slate-900/20 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 min-w-52 max-w-64 select-none space-y-1"
                    :style="flyoutStyle"
                    @mouseenter="isFlyoutOpen = true"
                    @mouseleave="isFlyoutOpen = false"
                >
                    <!-- Header Popover -->
                    <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
                        <span class="truncate">{{ resolvedItem.label }}</span>
                        <Badge
                            v-if="resolvedItem.badge"
                            :variant="resolvedBadgeVariant"
                            :color="resolvedBadgeColor"
                            size="xs"
                            rounded="full"
                            class="shrink-0"
                        >
                            {{ resolvedItem.badge }}
                        </Badge>
                    </div>

                    <!-- Daftar Sub-menu di Popover dibungkus SidebarFlyoutProvider -->
                    <SidebarFlyoutProvider>
                        <slot>
                            <SidebarItem
                                v-for="(child, idx) in resolvedItem.children"
                                :key="idx"
                                :item="child"
                                :depth="0"
                                :is-collapsed="false"
                                @navigate="handleNavigate"
                            />
                        </slot>
                    </SidebarFlyoutProvider>
                </div>
            </Transition>
        </Teleport>
    </div>

    <!-- 4. SINGLE LINK / ACTION ITEM (TANPA SUB-MENU) -->
    <div v-else class="relative">
        <!-- A. Inertia Link -->
        <Link
            v-if="isInternalLink && !resolvedItem.disabled"
            :href="resolvedItem.href"
            :target="resolvedItem.target || undefined"
            @click="handleNavigate(resolvedItem)"
            :title="resolvedCollapsed && !resolvedMobile ? resolvedItem.label : undefined"
            :class="[
                'flex items-center font-medium transition-all duration-150 select-none group',
                resolvedRadiusClass,
                sizeClass.item,
                depthPaddingClass,
                isSelfActive
                    ? activeItemClasses
                    : inactiveItemClasses,
                resolvedCollapsed && !resolvedMobile ? `justify-center px-0 mx-auto ${sizeClass.collapsed}` : '',
            ]"
        >
            <!-- Left Active Indicator Bar -->
            <span
                v-if="(!resolvedCollapsed || resolvedMobile) && !isInFlyout && isSelfActive && effectiveDepth === 0 && resolvedItemStyle !== 'solid'"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                :class="resolvedColorTheme.indicator"
            />

            <!-- Icon -->
            <span
                v-if="resolvedItem.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    sizeClass.icon,
                    isSelfActive
                        ? (resolvedItemStyle === 'solid' ? resolvedColorTheme.iconSolid : resolvedColorTheme.iconActive)
                        : (resolvedVariant === 'rail' ? 'text-slate-400 group-hover:text-white' : (resolvedVariant === 'gradient' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')),
                ]"
            >
                {{ resolvedItem.icon }}
            </span>
            <span
                v-else-if="effectiveDepth > 0 || isInFlyout"
                class="w-1.5 h-1.5 rounded-full mx-1 shrink-0 transition-colors"
                :class="isSelfActive ? resolvedColorTheme.indicator : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-400'"
            />

            <!-- Label -->
            <span v-if="!resolvedCollapsed || resolvedMobile" class="flex-1 truncate tracking-tight">
                {{ resolvedItem.label }}
            </span>

            <!-- Badge Component -->
            <Badge
                v-if="(!resolvedCollapsed || resolvedMobile) && resolvedItem.badge"
                :variant="resolvedBadgeVariant"
                :color="resolvedBadgeColor"
                :size="resolvedBadgeSize"
                rounded="full"
                class="shrink-0"
            >
                {{ resolvedItem.badge }}
            </Badge>
        </Link>

        <!-- B. External Link / Anchor -->
        <a
            v-else-if="resolvedItem.href && resolvedItem.href !== '#' && !resolvedItem.disabled"
            :href="resolvedItem.href"
            :target="resolvedItem.target || '_blank'"
            rel="noopener noreferrer"
            @click="handleNavigate(resolvedItem)"
            :title="resolvedCollapsed && !resolvedMobile ? resolvedItem.label : undefined"
            :class="[
                'flex items-center font-medium transition-all duration-150 select-none group',
                resolvedRadiusClass,
                sizeClass.item,
                depthPaddingClass,
                isSelfActive
                    ? activeItemClasses
                    : inactiveItemClasses,
                resolvedCollapsed && !resolvedMobile ? `justify-center px-0 mx-auto ${sizeClass.collapsed}` : '',
            ]"
        >
            <span
                v-if="(!resolvedCollapsed || resolvedMobile) && !isInFlyout && isSelfActive && effectiveDepth === 0 && resolvedItemStyle !== 'solid'"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                :class="resolvedColorTheme.indicator"
            />

            <span
                v-if="resolvedItem.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    sizeClass.icon,
                    isSelfActive
                        ? (resolvedItemStyle === 'solid' ? resolvedColorTheme.iconSolid : resolvedColorTheme.iconActive)
                        : (resolvedVariant === 'rail' ? 'text-slate-400 group-hover:text-white' : (resolvedVariant === 'gradient' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')),
                ]"
            >
                {{ resolvedItem.icon }}
            </span>
            <span
                v-else-if="effectiveDepth > 0 || isInFlyout"
                class="w-1.5 h-1.5 rounded-full mx-1 shrink-0 transition-colors"
                :class="isSelfActive ? resolvedColorTheme.indicator : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-400'"
            />

            <span v-if="!resolvedCollapsed || resolvedMobile" class="flex-1 truncate tracking-tight">
                {{ resolvedItem.label }}
            </span>

            <Badge
                v-if="(!resolvedCollapsed || resolvedMobile) && resolvedItem.badge"
                :variant="resolvedBadgeVariant"
                :color="resolvedBadgeColor"
                :size="resolvedBadgeSize"
                rounded="full"
                class="shrink-0"
            >
                {{ resolvedItem.badge }}
            </Badge>
        </a>

        <!-- C. Button / Click Action -->
        <button
            v-else
            type="button"
            :disabled="resolvedItem.disabled"
            @click="handleNavigate(resolvedItem)"
            :title="resolvedCollapsed && !resolvedMobile ? resolvedItem.label : undefined"
            :class="[
                'w-full flex items-center font-medium transition-all duration-150 select-none text-left group',
                resolvedItem.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                resolvedRadiusClass,
                sizeClass.item,
                depthPaddingClass,
                isSelfActive
                    ? activeItemClasses
                    : inactiveItemClasses,
                resolvedCollapsed && !resolvedMobile ? `justify-center px-0 mx-auto ${sizeClass.collapsed}` : '',
            ]"
        >
            <span
                v-if="(!resolvedCollapsed || resolvedMobile) && !isInFlyout && isSelfActive && effectiveDepth === 0 && resolvedItemStyle !== 'solid'"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                :class="resolvedColorTheme.indicator"
            />

            <span
                v-if="resolvedItem.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    sizeClass.icon,
                    isSelfActive
                        ? (resolvedItemStyle === 'solid' ? resolvedColorTheme.iconSolid : resolvedColorTheme.iconActive)
                        : (resolvedVariant === 'rail' ? 'text-slate-400 group-hover:text-white' : (resolvedVariant === 'gradient' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')),
                ]"
            >
                {{ resolvedItem.icon }}
            </span>
            <span
                v-else-if="effectiveDepth > 0 || isInFlyout"
                class="w-1.5 h-1.5 rounded-full mx-1 shrink-0 transition-colors"
                :class="isSelfActive ? resolvedColorTheme.indicator : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-400'"
            />

            <span v-if="!resolvedCollapsed || resolvedMobile" class="flex-1 truncate tracking-tight">
                {{ resolvedItem.label }}
            </span>

            <Badge
                v-if="(!resolvedCollapsed || resolvedMobile) && resolvedItem.badge"
                :variant="resolvedBadgeVariant"
                :color="resolvedBadgeColor"
                :size="resolvedBadgeSize"
                rounded="full"
                class="shrink-0"
            >
                {{ resolvedItem.badge }}
            </Badge>
        </button>
    </div>
</template>
