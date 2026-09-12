<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';
import SidebarItem from './SidebarItem.vue';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // Array of { label, icon, href, badge, badgeVariant, children: [], separator, heading, active, disabled }
    },
    collapsed: {
        type: Boolean,
        default: false,
    },
    collapsible: {
        type: Boolean,
        default: true,
    },
    floatingToggle: {
        type: Boolean,
        default: true, // Modern floating circular button on the border
    },
    width: {
        type: String,
        default: '64', // '56', '64', '72', '80'
        validator: (val) => ['56', '64', '72', '80'].includes(val),
    },
    collapsedWidth: {
        type: String,
        default: '16', // '14', '16', '18', '20'
        validator: (val) => ['14', '16', '18', '20'].includes(val),
    },
    variant: {
        type: String,
        default: 'default', // 'default', 'bordered', 'floating'
        validator: (val) => ['default', 'bordered', 'floating'].includes(val),
    },
    showLogo: {
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: false,
    },
    mobileBreakpoint: {
        type: Number,
        default: 768,
    },
    mobileOpen: {
        type: Boolean,
        default: false,
    },
    activeRoute: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:collapsed', 'update:mobileOpen', 'navigate']);

const isCollapsed = ref(props.collapsed);
const isMobileOpen = ref(props.mobileOpen);
const isMobile = ref(false);
const mobileDrawerRef = ref(null);

watch(() => props.collapsed, (val) => { isCollapsed.value = val; });
watch(() => props.mobileOpen, (val) => {
    isMobileOpen.value = val;
    handleBodyScrollLock(val);
});

// Lock body scrolling when mobile drawer is opened
const handleBodyScrollLock = (lock) => {
    if (typeof document === 'undefined') return;
    if (lock) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    emit('update:collapsed', isCollapsed.value);
};

const openMobile = () => {
    isMobileOpen.value = true;
    emit('update:mobileOpen', true);
    handleBodyScrollLock(true);
};

const closeMobile = () => {
    isMobileOpen.value = false;
    emit('update:mobileOpen', false);
    handleBodyScrollLock(false);
};

useClickOutside(mobileDrawerRef, () => {
    if (isMobile.value && isMobileOpen.value) {
        closeMobile();
    }
});

const handleNavigate = (item) => {
    emit('navigate', item);
    if (isMobile.value) {
        closeMobile();
    }
};

// Responsive window resize observer
const checkMobile = () => {
    const wasMobile = isMobile.value;
    isMobile.value = window.innerWidth < props.mobileBreakpoint;
    if (wasMobile && !isMobile.value && isMobileOpen.value) {
        closeMobile();
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
    handleBodyScrollLock(false);
});

// Width classes
const widthClass = computed(() => {
    switch (props.width) {
        case '56': return 'w-56';
        case '72': return 'w-72';
        case '80': return 'w-80';
        case '64':
        default: return 'w-64';
    }
});

const collapsedWidthClass = computed(() => {
    switch (props.collapsedWidth) {
        case '14': return 'w-14';
        case '18': return 'w-18';
        case '20': return 'w-20';
        case '16':
        default: return 'w-16';
    }
});

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'bordered':
            return 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800';
        case 'floating':
            return 'bg-white dark:bg-slate-900 m-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl';
        case 'default':
        default:
            return 'bg-slate-50/90 dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80';
    }
});

defineExpose({ toggleCollapse, openMobile, closeMobile, isCollapsed, isMobileOpen });
</script>

<template>
    <!-- ========================================== -->
    <!-- 1. DESKTOP ASIDE (Hidden on Mobile)        -->
    <!-- ========================================== -->
    <aside
        v-if="!isMobile"
        :class="[
            'relative flex flex-col h-full select-none transition-[width] duration-300 ease-in-out shrink-0',
            isCollapsed ? collapsedWidthClass : widthClass,
            variantClasses,
            variant === 'floating' ? 'h-[calc(100%-24px)]' : '',
        ]"
    >
        <!-- Floating Border Toggle Button (Linear / Notion Style) -->
        <button
            v-if="collapsible && floatingToggle"
            type="button"
            @click="toggleCollapse"
            :title="isCollapsed ? 'Perluas Menu (Ctrl+B)' : 'Perkecil Menu (Ctrl+B)'"
            :aria-label="isCollapsed ? 'Perluas Menu' : 'Perkecil Menu'"
            class="absolute -right-3.5 top-5 z-30 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
            <span
                class="material-symbols-outlined text-base leading-none transition-transform duration-300 select-none"
                :class="isCollapsed ? 'rotate-180' : ''"
            >
                chevron_left
            </span>
        </button>

        <!-- HEADER / LOGO (Desktop) -->
        <div
            v-if="showLogo"
            class="flex items-center shrink-0 h-16 border-b border-slate-200/60 dark:border-slate-800/60"
            :class="isCollapsed ? 'justify-center px-0' : 'justify-between px-4'"
        >
            <!-- A. Expanded Logo -->
            <div v-if="!isCollapsed" class="flex items-center gap-3 min-w-0 flex-1">
                <slot name="logo">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            P
                        </div>
                        <span class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                            Dashboard
                        </span>
                    </div>
                </slot>
            </div>

            <!-- In-header Collapse Toggle (When floatingToggle is false) -->
            <button
                v-if="collapsible && !floatingToggle && !isCollapsed"
                type="button"
                @click="toggleCollapse"
                class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer shrink-0"
                title="Tutup sidebar"
            >
                <span class="material-symbols-outlined text-base leading-none select-none">
                    menu_open
                </span>
            </button>

            <!-- B. Collapsed Logo (Cleanly Centered, Perfectly Aligned) -->
            <div
                v-if="isCollapsed"
                class="w-full flex items-center justify-center cursor-pointer group"
                @click="toggleCollapse"
                title="Klik untuk memperluas menu"
            >
                <slot name="logo-collapsed">
                    <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                        P
                    </div>
                </slot>
            </div>
        </div>

        <!-- TOP SLOT -->
        <div v-if="$slots.top" :class="isCollapsed ? 'px-1 py-2' : 'px-3 py-2'">
            <slot name="top" />
        </div>

        <!-- DESKTOP NAVIGATION ITEMS -->
        <nav
            class="flex-1 py-3 space-y-0.5"
            :class="[
                isCollapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-3',
            ]"
            aria-label="Navigasi sidebar desktop"
        >
            <SidebarItem
                v-for="(item, index) in items"
                :key="index"
                :item="item"
                :depth="0"
                :is-collapsed="isCollapsed"
                :is-mobile="false"
                :active-route="activeRoute"
                @navigate="handleNavigate"
            />
        </nav>

        <!-- FOOTER (Desktop) -->
        <div
            v-if="showFooter && $slots.footer"
            class="shrink-0 border-t border-slate-200/60 dark:border-slate-800/60"
            :class="isCollapsed ? 'p-2 flex justify-center' : 'p-3'"
        >
            <slot name="footer" :is-collapsed="isCollapsed" />
        </div>
    </aside>

    <!-- ========================================== -->
    <!-- 2. MOBILE DRAWER (Teleported to Body)       -->
    <!-- ========================================== -->
    <Teleport to="body">
        <div v-if="isMobile || isMobileOpen">
            <!-- Backdrop Overlay -->
            <Transition
                enter-active-class="transition-opacity duration-300 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="isMobileOpen"
                    class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs select-none"
                    @click="closeMobile"
                    aria-hidden="true"
                />
            </Transition>

            <!-- Slide-in Drawer Panel -->
            <Transition
                enter-active-class="transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
                enter-from-class="-translate-x-full"
                enter-to-class="translate-x-0"
                leave-active-class="transition-transform duration-200 ease-in"
                leave-from-class="translate-x-0"
                leave-to-class="-translate-x-full"
            >
                <div
                    v-if="isMobileOpen"
                    ref="mobileDrawerRef"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu Navigasi Mobile"
                    class="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden select-none"
                >
                    <!-- Mobile Drawer Header -->
                    <div class="flex items-center justify-between px-4 h-16 border-b border-slate-200/70 dark:border-slate-800 shrink-0">
                        <slot name="logo">
                            <div class="flex items-center gap-2.5 min-w-0">
                                <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                                    P
                                </div>
                                <span class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                    Dashboard
                                </span>
                            </div>
                        </slot>

                        <!-- Sleek Circular Close Button -->
                        <button
                            type="button"
                            @click="closeMobile"
                            class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none"
                            aria-label="Tutup menu"
                        >
                            <span class="material-symbols-outlined text-lg leading-none">
                                close
                            </span>
                        </button>
                    </div>

                    <!-- Top Slot (Mobile) -->
                    <div v-if="$slots.top" class="px-4 py-2 shrink-0">
                        <slot name="top" />
                    </div>

                    <!-- Mobile Navigation List -->
                    <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-1" aria-label="Navigasi mobile">
                        <SidebarItem
                            v-for="(item, index) in items"
                            :key="index"
                            :item="item"
                            :depth="0"
                            :is-collapsed="false"
                            :is-mobile="true"
                            :active-route="activeRoute"
                            @navigate="handleNavigate"
                        />
                    </nav>

                    <!-- Mobile Drawer Footer -->
                    <div
                        v-if="showFooter && $slots.footer"
                        class="shrink-0 p-4 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                    >
                        <slot name="footer" :is-collapsed="false" />
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>
