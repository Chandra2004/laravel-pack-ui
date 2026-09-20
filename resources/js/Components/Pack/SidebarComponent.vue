<script setup>
import { ref, computed, watch, provide, onMounted, onUnmounted } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';
import { useSidebar } from '@/Composables/Pack/useSidebar';
import SidebarItem from './SidebarItem.vue';
import SidebarHeader from './Sidebar/SidebarHeader.vue';
import SidebarNav from './Sidebar/SidebarNav.vue';
import SidebarFooter from './Sidebar/SidebarFooter.vue';
import SidebarToggle from './Sidebar/SidebarToggle.vue';

const props = defineProps({
    /**
     * 3. TEKS KONTEN: Daftar item navigasi bertingkat (Mode Config-Driven)
     * Format item: { label, icon, href, badge, badgeVariant, children: [], separator, heading, active, disabled, target }
     */
    items: {
        type: Array,
        default: () => [],
    },
    /**
     * Status ciut/collapsed sidebar (v-model:collapsed)
     */
    collapsed: {
        type: Boolean,
        default: null,
    },
    /**
     * Apakah sidebar dapat diciutkan/diperluas
     */
    collapsible: {
        type: Boolean,
        default: true,
    },
    /**
     * Tombol ciut melayang di border samping (floating circular toggle button)
     */
    floatingToggle: {
        type: Boolean,
        default: true,
    },
    /**
     * Key penyimpanan preferensi ciut di localStorage (false untuk mematikan)
     */
    persistKey: {
        type: [String, Boolean],
        default: 'pack_sidebar_collapsed',
    },
    /**
     * Aktifkan shortcut keyboard Ctrl+B / Cmd+B untuk toggle collapse
     */
    enableShortcut: {
        type: Boolean,
        default: true,
    },
    /**
     * 2. BENTUK: Lebar sidebar saat diperluas (Tailwind spacing unit: '56', '64', '72', '80')
     */
    width: {
        type: String,
        default: '64',
    },
    /**
     * 2. BENTUK: Lebar sidebar saat diciutkan (Tailwind spacing unit: '14', '16', '18', '20')
     */
    collapsedWidth: {
        type: String,
        default: '16',
    },
    /**
     * 2. BENTUK: Varian gaya visual sidebar:
     * - 'default': Latar slate lembut dengan garis border samping
     * - 'bordered': Latar putih/gelap bersih dengan border pembatas tegas
     * - 'floating': Pulau kartu modern melayang dengan margin dan bayangan lembut
     */
    variant: {
        type: String,
        default: 'default',
        validator: (val) => ['default', 'bordered', 'floating'].includes(val),
    },
    /**
     * 1. WARNA: Palet aksen warna semantik untuk item aktif dan indikator
     */
    color: {
        type: String,
        default: 'primary',
        validator: (val) => [
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
            'dark', 'slate',
        ].includes(val),
    },
    /**
     * 1. WARNA: Gaya visual pewarnaan item aktif:
     * - 'soft': Latar pastel lembut dengan teks kontras semantik (default)
     * - 'solid': Latar warna pekat dengan teks putih
     * - 'outline': Border beraksen warna tegas dengan latar transparan
     */
    itemStyle: {
        type: String,
        default: 'soft',
        validator: (val) => ['soft', 'solid', 'outline'].includes(val),
    },
    /**
     * 2. BENTUK: Kelengkungan sudut item menu
     */
    radius: {
        type: String,
        default: 'xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * 2. BENTUK: Skala ukuran menu
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    /**
     * Tampilkan area logo header
     */
    showLogo: {
        type: Boolean,
        default: true,
    },
    /**
     * Nama Brand di header default
     */
    brandName: {
        type: String,
        default: '',
    },
    /**
     * Sub-nama brand di header default
     */
    brandSub: {
        type: String,
        default: '',
    },
    /**
     * Tampilkan area footer
     */
    showFooter: {
        type: Boolean,
        default: false,
    },
    /**
     * 5. RESPONSIF: Batas lebar layar mobile drawer (pixel)
     */
    mobileBreakpoint: {
        type: Number,
        default: 768,
    },
    /**
     * Status drawer mobile (v-model:mobileOpen)
     */
    mobileOpen: {
        type: Boolean,
        default: null,
    },
    /**
     * Rute yang sedang aktif saat ini
     */
    activeRoute: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:collapsed', 'update:mobileOpen', 'navigate']);

// Inisialisasi Composable useSidebar
const sidebarState = useSidebar({
    persistKey: props.persistKey,
    defaultCollapsed: props.collapsed ?? false,
    enableShortcut: props.enableShortcut,
});

const isCollapsed = ref(props.collapsed !== null ? props.collapsed : sidebarState.isCollapsed.value);
const isMobileOpen = ref(props.mobileOpen !== null ? props.mobileOpen : sidebarState.isMobileOpen.value);
const isMobile = ref(false);
const mobileDrawerRef = ref(null);

// Sinkronisasi props.collapsed dari parent
watch(() => props.collapsed, (val) => {
    if (val !== null && isCollapsed.value !== val) {
        isCollapsed.value = val;
        sidebarState.setCollapsed(val);
    }
});

// Sinkronisasi props.mobileOpen dari parent
watch(() => props.mobileOpen, (val) => {
    if (val !== null && isMobileOpen.value !== val) {
        isMobileOpen.value = val;
        sidebarState.setMobileOpen(val);
    }
});

// Sinkronisasi dari composable sidebarState (shortcut Ctrl+B atau trigger eksternal)
watch(sidebarState.isCollapsed, (val) => {
    if (isCollapsed.value !== val) {
        isCollapsed.value = val;
    }
});

watch(sidebarState.isMobileOpen, (val) => {
    if (isMobileOpen.value !== val) {
        isMobileOpen.value = val;
    }
});

// Emit perubahan internal ke parent & sinkron ke sidebarState
watch(isCollapsed, (val) => {
    emit('update:collapsed', val);
    if (sidebarState.isCollapsed.value !== val) {
        sidebarState.setCollapsed(val);
    }
});

watch(isMobileOpen, (val) => {
    emit('update:mobileOpen', val);
    if (sidebarState.isMobileOpen.value !== val) {
        sidebarState.setMobileOpen(val);
    }
});

// Aksi Toggle
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    sidebarState.setCollapsed(isCollapsed.value);
};

const openMobile = () => {
    isMobileOpen.value = true;
    sidebarState.openMobile();
};

const closeMobile = () => {
    isMobileOpen.value = false;
    sidebarState.closeMobile();
};

useClickOutside(mobileDrawerRef, () => {
    if (isMobileOpen.value) {
        closeMobile();
    }
});

const handleNavigate = (item) => {
    emit('navigate', item);
    if (isMobile.value || isMobileOpen.value) {
        closeMobile();
    }
};

const checkMobile = () => {
    if (typeof window === 'undefined') return;
    const wasMobile = isMobile.value;
    isMobile.value = window.innerWidth < props.mobileBreakpoint;
    if (wasMobile && !isMobile.value && isMobileOpen.value) {
        closeMobile();
    }
};

onMounted(() => {
    checkMobile();
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', checkMobile);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
    }
    // Pastikan mobile drawer selalu tertutup saat komponen unmount
    closeMobile();
});

// Lebar dinamis
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

// Varian gaya visual
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

// Palet warna ringkas & modular
const colorTheme = computed(() => {
    const aliasMap = {
        blue: 'primary',
        success: 'emerald',
        violet: 'purple',
        warning: 'amber',
        danger: 'rose',
        sky: 'cyan',
        slate: 'dark',
    };
    const key = aliasMap[props.color] || props.color;

    const themes = {
        indigo: {
            indicator: 'bg-indigo-600 dark:bg-indigo-500',
            soft: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold',
            solid: 'text-white bg-indigo-600 dark:bg-indigo-600 font-semibold shadow-xs shadow-indigo-600/20',
            outline: 'text-indigo-600 dark:text-indigo-400 border border-indigo-500/60 dark:border-indigo-400/50 font-semibold bg-transparent',
            iconActive: 'text-indigo-600 dark:text-indigo-400',
            iconSolid: 'text-white',
            badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
            logoBg: 'bg-indigo-600 text-white',
            toggleHover: 'hover:text-indigo-600 dark:hover:text-indigo-400',
        },
        emerald: {
            indicator: 'bg-emerald-600 dark:bg-emerald-500',
            soft: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold',
            solid: 'text-white bg-emerald-600 dark:bg-emerald-600 font-semibold shadow-xs shadow-emerald-600/20',
            outline: 'text-emerald-600 dark:text-emerald-400 border border-emerald-500/60 dark:border-emerald-400/50 font-semibold bg-transparent',
            iconActive: 'text-emerald-600 dark:text-emerald-400',
            iconSolid: 'text-white',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
            logoBg: 'bg-emerald-600 text-white',
            toggleHover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
        },
        purple: {
            indicator: 'bg-purple-600 dark:bg-purple-500',
            soft: 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40 font-semibold',
            solid: 'text-white bg-purple-600 dark:bg-purple-600 font-semibold shadow-xs shadow-purple-600/20',
            outline: 'text-purple-600 dark:text-purple-400 border border-purple-500/60 dark:border-purple-400/50 font-semibold bg-transparent',
            iconActive: 'text-purple-600 dark:text-purple-400',
            iconSolid: 'text-white',
            badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
            logoBg: 'bg-purple-600 text-white',
            toggleHover: 'hover:text-purple-600 dark:hover:text-purple-400',
        },
        amber: {
            indicator: 'bg-amber-500 dark:bg-amber-500',
            soft: 'text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 font-semibold',
            solid: 'text-white bg-amber-500 dark:bg-amber-500 font-semibold shadow-xs shadow-amber-500/20',
            outline: 'text-amber-600 dark:text-amber-400 border border-amber-500/60 dark:border-amber-400/50 font-semibold bg-transparent',
            iconActive: 'text-amber-600 dark:text-amber-400',
            iconSolid: 'text-white',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
            logoBg: 'bg-amber-500 text-white',
            toggleHover: 'hover:text-amber-600 dark:hover:text-amber-400',
        },
        rose: {
            indicator: 'bg-rose-600 dark:bg-rose-500',
            soft: 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 font-semibold',
            solid: 'text-white bg-rose-600 dark:bg-rose-600 font-semibold shadow-xs shadow-rose-600/20',
            outline: 'text-rose-600 dark:text-rose-400 border border-rose-500/60 dark:border-rose-400/50 font-semibold bg-transparent',
            iconActive: 'text-rose-600 dark:text-rose-400',
            iconSolid: 'text-white',
            badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
            logoBg: 'bg-rose-600 text-white',
            toggleHover: 'hover:text-rose-600 dark:hover:text-rose-400',
        },
        cyan: {
            indicator: 'bg-cyan-600 dark:bg-cyan-500',
            soft: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 font-semibold',
            solid: 'text-white bg-cyan-600 dark:bg-cyan-600 font-semibold shadow-xs shadow-cyan-600/20',
            outline: 'text-cyan-600 dark:text-cyan-400 border border-cyan-500/60 dark:border-cyan-400/50 font-semibold bg-transparent',
            iconActive: 'text-cyan-600 dark:text-cyan-400',
            iconSolid: 'text-white',
            badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
            logoBg: 'bg-cyan-600 text-white',
            toggleHover: 'hover:text-cyan-600 dark:hover:text-cyan-400',
        },
        dark: {
            indicator: 'bg-slate-900 dark:bg-white',
            soft: 'text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-800/60 font-semibold',
            solid: 'text-white dark:text-slate-900 bg-slate-900 dark:bg-white font-semibold shadow-xs shadow-slate-900/20',
            outline: 'text-slate-900 dark:text-white border border-slate-700 dark:border-slate-300 font-semibold bg-transparent',
            iconActive: 'text-slate-900 dark:text-white',
            iconSolid: 'text-white dark:text-slate-900',
            badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
            logoBg: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
            toggleHover: 'hover:text-slate-900 dark:hover:text-white',
        },
        primary: {
            indicator: 'bg-blue-600 dark:bg-blue-500',
            soft: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 font-semibold',
            solid: 'text-white bg-blue-600 dark:bg-blue-600 font-semibold shadow-xs shadow-blue-600/20',
            outline: 'text-blue-600 dark:text-blue-400 border border-blue-500/60 dark:border-blue-400/50 font-semibold bg-transparent',
            iconActive: 'text-blue-600 dark:text-blue-400',
            iconSolid: 'text-white',
            badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
            logoBg: 'bg-blue-600 text-white',
            toggleHover: 'hover:text-blue-600 dark:hover:text-blue-400',
        },
    };

    return themes[key] || themes.primary;
});

// Kelas radius
const radiusClass = computed(() => {
    switch (props.radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'full': return 'rounded-full';
        case 'xl':
        default: return 'rounded-xl';
    }
});

// Context Provider Terpusat via provide()
provide('packSidebarContext', {
    colorTheme,
    itemStyle: computed(() => props.itemStyle),
    radiusClass,
    size: computed(() => props.size),
    isCollapsed,
    isMobileOpen,
    isMobile,
    activeRoute: computed(() => props.activeRoute),
    items: computed(() => props.items),
    toggleCollapse,
    openMobile,
    closeMobile,
    toggleMobile: () => {
        isMobileOpen.value = !isMobileOpen.value;
    },
    navigate: handleNavigate,
});

defineExpose({
    toggleCollapse,
    openMobile,
    closeMobile,
    isCollapsed,
    isMobileOpen,
});
</script>

<template>
    <!-- ========================================================================= -->
    <!-- 1. DESKTOP ASIDE (Tampil pada layar >= mobileBreakpoint)                   -->
    <!-- ========================================================================= -->
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
        <SidebarToggle
            v-if="collapsible && floatingToggle"
            variant="floating"
        />

        <!-- HEADER / LOGO (Desktop) -->
        <SidebarHeader
            v-if="showLogo"
            :brand-name="brandName"
            :brand-sub="brandSub"
            :show-toggle="collapsible && !floatingToggle"
        >
            <template #default>
                <slot name="logo" />
            </template>
            <template #collapsed>
                <slot name="logo-collapsed" />
            </template>
            <template #actions>
                <slot name="header-extra" />
            </template>
        </SidebarHeader>

        <!-- TOP SLOT (Pencarian / Workspace Switcher) -->
        <div v-if="$slots.top" :class="isCollapsed ? 'px-1 py-2' : 'px-3 py-2'">
            <slot name="top" :is-collapsed="isCollapsed" />
        </div>

        <!-- DESKTOP NAVIGATION ITEMS (Hybrid: Slot Deklaratif atau Looping Props) -->
        <SidebarNav>
            <slot>
                <!-- Fallback otomatis jika tidak ada slot anak: loop prop items -->
                <SidebarItem
                    v-for="(item, index) in items"
                    :key="index"
                    :item="item"
                    :depth="0"
                    @navigate="handleNavigate"
                >
                    <template v-if="$slots.item" #default="itemProps">
                        <slot name="item" v-bind="itemProps" />
                    </template>
                </SidebarItem>
            </slot>
        </SidebarNav>

        <!-- FOOTER (Desktop: Profil / Logout / Pengaturan) -->
        <SidebarFooter v-if="showFooter || $slots.footer">
            <slot name="footer" :is-collapsed="isCollapsed" />
        </SidebarFooter>
    </aside>

    <!-- ========================================================================= -->
    <!-- 2. MOBILE DRAWER (Teleported ke Body)                                      -->
    <!-- ========================================================================= -->
    <Teleport to="body">
        <div v-if="isMobile || isMobileOpen">
            <!-- Backdrop Overlay dengan Blur Lembut -->
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
                                <div
                                    class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                                    :class="colorTheme.logoBg"
                                >
                                    P
                                </div>
                                <span class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                    {{ brandName || 'Dashboard' }}
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
                        <slot name="top" :is-collapsed="false" />
                    </div>

                    <!-- Mobile Navigation List (Hybrid Slot atau Items) -->
                    <SidebarNav>
                        <slot>
                            <SidebarItem
                                v-for="(item, index) in items"
                                :key="index"
                                :item="item"
                                :depth="0"
                                @navigate="handleNavigate"
                            >
                                <template v-if="$slots.item" #default="itemProps">
                                    <slot name="item" v-bind="itemProps" />
                                </template>
                            </SidebarItem>
                        </slot>
                    </SidebarNav>

                    <!-- Mobile Drawer Footer -->
                    <SidebarFooter v-if="showFooter || $slots.footer || $slots['mobile-footer']">
                        <slot name="mobile-footer">
                            <slot name="footer" :is-collapsed="false" />
                        </slot>
                    </SidebarFooter>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>
