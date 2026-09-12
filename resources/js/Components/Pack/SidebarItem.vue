<script setup>
import { ref, computed, watch } from 'vue';
import { Link } from '@inertiajs/vue3';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';

const props = defineProps({
    item: {
        type: Object,
        required: true,
        // { label, icon, href, badge, badgeVariant, children: [], separator, heading, active, disabled }
    },
    depth: {
        type: Number,
        default: 0,
    },
    isCollapsed: {
        type: Boolean,
        default: false,
    },
    isMobile: {
        type: Boolean,
        default: false,
    },
    activeRoute: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['navigate']);

const hasChildren = computed(() => {
    return Array.isArray(props.item.children) && props.item.children.length > 0;
});

// Check if this item is active
const isSelfActive = computed(() => {
    if (props.item.active) return true;
    if (props.activeRoute && props.item.href) {
        return props.activeRoute === props.item.href || props.activeRoute.startsWith(props.item.href + '/');
    }
    return false;
});

// Recursively check if any descendant child is active
const hasActiveDescendant = (item) => {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some((child) => {
        if (child.active) return true;
        if (props.activeRoute && child.href) {
            if (props.activeRoute === child.href || props.activeRoute.startsWith(child.href + '/')) {
                return true;
            }
        }
        return hasActiveDescendant(child);
    });
};

const isChildActive = computed(() => {
    return hasActiveDescendant(props.item);
});

// Auto-expand if a descendant is active
const isOpen = ref(isChildActive.value || props.item.expanded === true);

watch(isChildActive, (val) => {
    if (val) isOpen.value = true;
});

const toggleOpen = () => {
    isOpen.value = !isOpen.value;
};

// Popover flyout state for collapsed mode
const flyoutRef = ref(null);
const isFlyoutOpen = ref(false);

useClickOutside(flyoutRef, () => {
    if (isFlyoutOpen.value) isFlyoutOpen.value = false;
});

const handleFlyoutToggle = () => {
    if (props.isCollapsed && !props.isMobile) {
        isFlyoutOpen.value = !isFlyoutOpen.value;
    }
};

const handleFlyoutMouseEnter = () => {
    if (props.isCollapsed && !props.isMobile) {
        isFlyoutOpen.value = true;
    }
};

const handleFlyoutMouseLeave = () => {
    if (props.isCollapsed && !props.isMobile) {
        isFlyoutOpen.value = false;
    }
};

const handleNavigate = (navItem) => {
    emit('navigate', navItem);
    isFlyoutOpen.value = false;
};

// Indentation padding based on depth for expanded mode
const depthPaddingClass = computed(() => {
    if (props.depth === 0) return 'px-3';
    if (props.depth === 1) return 'pl-9 pr-3';
    if (props.depth === 2) return 'pl-12 pr-3';
    return 'pl-14 pr-3';
});

// Badge variant styling
const badgeClass = computed(() => {
    switch (props.item.badgeVariant) {
        case 'success':
            return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40';
        case 'warning':
            return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40';
        case 'danger':
            return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40';
        case 'primary':
        default:
            return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40';
    }
});
</script>

<template>
    <!-- 1. SEPARATOR -->
    <div
        v-if="item.separator"
        class="my-2 border-t border-slate-200/70 dark:border-slate-800/80 mx-2"
        role="separator"
    />

    <!-- 2. SECTION HEADING -->
    <div
        v-else-if="item.heading"
        class="pt-4 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none"
        :class="isCollapsed && !isMobile ? 'text-center px-1' : 'px-3'"
    >
        <template v-if="!isCollapsed || isMobile">
            {{ item.heading }}
        </template>
        <span
            v-else
            class="block w-4 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto rounded-full"
            :title="item.heading"
        />
    </div>

    <!-- 3. PARENT MENU ITEM (WITH CHILDREN / SUB-MENU) -->
    <div
        v-else-if="hasChildren"
        ref="flyoutRef"
        class="relative"
        @mouseenter="handleFlyoutMouseEnter"
        @mouseleave="handleFlyoutMouseLeave"
    >
        <!-- Parent Trigger Button -->
        <button
            type="button"
            @click="isCollapsed && !isMobile ? handleFlyoutToggle() : toggleOpen()"
            :aria-expanded="isCollapsed && !isMobile ? isFlyoutOpen : isOpen"
            :title="isCollapsed && !isMobile ? item.label : undefined"
            :class="[
                'w-full flex items-center gap-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none text-left group',
                depthPaddingClass,
                isSelfActive || isChildActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200',
                isCollapsed && !isMobile ? 'justify-center px-0 h-10 w-10 mx-auto' : '',
            ]"
        >
            <!-- Left Active Indicator Bar -->
            <span
                v-if="(!isCollapsed || isMobile) && (isSelfActive || isChildActive) && depth === 0"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
            />

            <!-- Icon -->
            <span
                v-if="item.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    depth === 0 ? 'text-lg' : 'text-base',
                    isSelfActive || isChildActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                ]"
                aria-hidden="true"
            >
                {{ item.icon }}
            </span>

            <!-- Sub-level Dot when no icon is present -->
            <span
                v-else-if="depth > 0 && (!isCollapsed || isMobile)"
                class="w-1.5 h-1.5 rounded-full shrink-0 select-none transition-all"
                :class="isSelfActive || isChildActive ? 'bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'bg-slate-300 dark:bg-slate-600'"
            />

            <!-- Label -->
            <span v-if="!isCollapsed || isMobile" class="flex-1 truncate">
                {{ item.label }}
            </span>

            <!-- Optional Badge -->
            <span
                v-if="item.badge && (!isCollapsed || isMobile)"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 select-none"
                :class="badgeClass"
            >
                {{ item.badge }}
            </span>

            <!-- Chevron Icon -->
            <span
                v-if="!isCollapsed || isMobile"
                class="material-symbols-outlined text-sm leading-none transition-transform duration-200 text-slate-400 dark:text-slate-500 shrink-0 select-none"
                :class="isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''"
            >
                expand_more
            </span>
        </button>

        <!-- A. EXPANDED ACCORDION SUB-ITEMS (Level 1, 2, 3...) -->
        <div
            v-if="!isCollapsed || isMobile"
            v-show="isOpen"
            class="relative space-y-0.5 my-0.5"
        >
            <!-- Continuous Vertical Branch Line for Depth Guides -->
            <div
                class="absolute top-0 bottom-0 border-l border-slate-200/80 dark:border-slate-800/80 pointer-events-none"
                :style="{ left: depth === 0 ? '1.35rem' : `${1.35 + depth * 0.75}rem` }"
            />

            <!-- Recursive Children -->
            <SidebarItem
                v-for="(child, cIdx) in item.children"
                :key="cIdx"
                :item="child"
                :depth="depth + 1"
                :is-collapsed="false"
                :is-mobile="isMobile"
                :active-route="activeRoute"
                @navigate="handleNavigate"
            />
        </div>

        <!-- B. COLLAPSED FLYOUT POPOVER (Desktop Mode Only) -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-x-1"
            enter-to-class="opacity-100 scale-100 translate-x-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-x-0"
            leave-to-class="opacity-0 scale-95 -translate-x-1"
        >
            <div
                v-if="isCollapsed && !isMobile && isFlyoutOpen"
                class="absolute left-full top-0 ml-2 z-50 w-56 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-800 select-none"
            >
                <!-- Flyout Header with Parent Title -->
                <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center gap-2">
                    <span
                        v-if="item.icon"
                        class="material-symbols-outlined text-base text-blue-600 dark:text-blue-400 select-none"
                    >
                        {{ item.icon }}
                    </span>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ item.label }}
                    </span>
                    <span
                        v-if="item.badge"
                        class="text-[9px] font-bold px-1.5 py-0.2 rounded-md ml-auto"
                        :class="badgeClass"
                    >
                        {{ item.badge }}
                    </span>
                </div>

                <!-- Flyout Recursive Sub-items -->
                <div class="space-y-0.5 max-h-72 overflow-y-auto pr-0.5">
                    <SidebarItem
                        v-for="(child, cIdx) in item.children"
                        :key="cIdx"
                        :item="child"
                        :depth="0"
                        :is-collapsed="false"
                        :is-mobile="false"
                        :active-route="activeRoute"
                        @navigate="handleNavigate"
                    />
                </div>
            </div>
        </Transition>
    </div>

    <!-- 4. LEAF MENU ITEM (LINK / BUTTON) -->
    <div v-else class="relative group">
        <component
            :is="item.href ? Link : 'button'"
            :href="item.href || undefined"
            :type="item.href ? undefined : 'button'"
            @click="handleNavigate(item)"
            :title="isCollapsed && !isMobile ? item.label : undefined"
            :class="[
                'w-full flex items-center gap-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none text-left',
                depthPaddingClass,
                isSelfActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200',
                isCollapsed && !isMobile ? 'justify-center px-0 h-10 w-10 mx-auto' : '',
            ]"
        >
            <!-- Left Active Indicator Bar (Desktop Expanded) -->
            <span
                v-if="(!isCollapsed || isMobile) && isSelfActive && depth === 0"
                class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
            />

            <!-- Icon -->
            <span
                v-if="item.icon"
                class="material-symbols-outlined shrink-0 select-none transition-colors"
                :class="[
                    depth === 0 ? 'text-lg' : 'text-base',
                    isSelfActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                ]"
                aria-hidden="true"
            >
                {{ item.icon }}
            </span>

            <!-- Sub-level Dot when no icon is present -->
            <span
                v-else-if="depth > 0 && (!isCollapsed || isMobile)"
                class="w-1.5 h-1.5 rounded-full shrink-0 select-none transition-all"
                :class="isSelfActive ? 'bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'bg-slate-300 dark:bg-slate-600'"
            />

            <!-- Label -->
            <span v-if="!isCollapsed || isMobile" class="flex-1 truncate">
                {{ item.label }}
            </span>

            <!-- Badge -->
            <span
                v-if="item.badge && (!isCollapsed || isMobile)"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 select-none"
                :class="badgeClass"
            >
                {{ item.badge }}
            </span>
        </component>

        <!-- Hover Tooltip for Collapsed Leaf Items -->
        <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 hidden group-hover:flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-lg whitespace-nowrap"
        >
            {{ item.label }}
            <span
                v-if="item.badge"
                class="ml-1.5 px-1.5 py-0.2 text-[9px] rounded-md bg-blue-600 text-white"
            >
                {{ item.badge }}
            </span>
        </div>
    </div>
</template>

