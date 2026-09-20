<script setup>
import { ref, computed } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';
import SidebarComponent from '@/Components/Pack/SidebarComponent.vue';
import ButtonTheme from '@/Components/Pack/ButtonTheme.vue';
import Breadcrumb from '@/Components/Pack/Breadcrumb.vue';

const props = defineProps({
    /**
     * 3. TEKS KONTEN: Judul halaman utama pada topbar dan page header
     */
    title: {
        type: String,
        default: '',
    },
    /**
     * 3. TEKS KONTEN: Deskripsi halaman utama
     */
    description: {
        type: String,
        default: '',
    },
    /**
     * Daftar item breadcrumb: [{ label, href, icon }]
     */
    breadcrumbs: {
        type: Array,
        default: () => [],
    },
    /**
     * Daftar item navigasi sidebar (jika menggunakan Sidebar bawaan)
     */
    items: {
        type: Array,
        default: () => [],
    },
    sidebarItems: {
        type: Array,
        default: () => [],
    },
    /**
     * Data informasi pengguna yang sedang login
     */
    user: {
        type: Object,
        default: () => ({
            name: 'Pengguna',
            email: 'user@example.com',
            avatar: '',
            role: 'Merchant Admin',
        }),
    },
    /**
     * 1. WARNA: Palet aksen warna semantik layout & sidebar
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
     * 2. BENTUK: Varian gaya visual sidebar:
     * - 'default', 'bordered', 'floating'
     */
    sidebarVariant: {
        type: String,
        default: 'default',
        validator: (val) => ['default', 'bordered', 'floating'].includes(val),
    },
    /**
     * Status ciut awal desktop sidebar
     */
    sidebarCollapsed: {
        type: Boolean,
        default: false,
    },
    /**
     * 2. BENTUK: Lebar fluid penuh (true: w-full, false: max-w-7xl berpusat)
     */
    fluid: {
        type: Boolean,
        default: false,
    },
    /**
     * Topbar melayang / sticky pada posisi atas
     */
    fixedHeader: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan tombol pencarian cepat di topbar
     */
    showSearch: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan tombol ubah tema gelap/terang
     */
    showThemeToggle: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan lonceng notifikasi
     */
    showNotifications: {
        type: Boolean,
        default: true,
    },
    /**
     * Jumlah notifikasi belum dibaca
     */
    unreadNotifications: {
        type: Number,
        default: 0,
    },
    /**
     * Tampilkan footer halaman
     */
    showFooter: {
        type: Boolean,
        default: true,
    },
    /**
     * Teks kustom footer hak cipta
     */
    footerText: {
        type: String,
        default: '',
    },
    /**
     * 2. BENTUK: Kelengkungan sudut elemen layout
     */
    radius: {
        type: String,
        default: 'xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * Rute aktif saat ini
     */
    activeRoute: {
        type: String,
        default: '',
    },
});

const emit = defineEmits([
    'update:sidebarCollapsed',
    'search',
    'notifications-click',
    'logout',
    'navigate',
]);

const isCollapsed = ref(props.sidebarCollapsed);
const isMobileOpen = ref(false);
const sidebarRef = ref(null);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    emit('update:sidebarCollapsed', isCollapsed.value);
};

const openMobile = () => {
    isMobileOpen.value = true;
};

const closeMobile = () => {
    isMobileOpen.value = false;
};

// Gabungkan items / sidebarItems
const effectiveSidebarItems = computed(() => {
    return props.sidebarItems.length > 0 ? props.sidebarItems : props.items;
});

// Dropdown Profil Pengguna
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);

useClickOutside(userMenuRef, () => {
    if (isUserMenuOpen.value) isUserMenuOpen.value = false;
});

const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
};

// 1. WARNA: Palet aksen warna topbar & layout
const colorTheme = computed(() => {
    const c = props.color;
    const map = {
        blue: 'primary',
        success: 'emerald',
        violet: 'purple',
        warning: 'amber',
        danger: 'rose',
        sky: 'cyan',
        slate: 'dark',
    };
    const key = map[c] || c;

    switch (key) {
        case 'indigo':
            return {
                badge: 'bg-indigo-600 text-white',
                avatarBg: 'bg-indigo-600 text-white',
                activeTab: 'text-indigo-600 dark:text-indigo-400',
                ring: 'focus:ring-indigo-500/20',
            };
        case 'emerald':
            return {
                badge: 'bg-emerald-600 text-white',
                avatarBg: 'bg-emerald-600 text-white',
                activeTab: 'text-emerald-600 dark:text-emerald-400',
                ring: 'focus:ring-emerald-500/20',
            };
        case 'purple':
            return {
                badge: 'bg-purple-600 text-white',
                avatarBg: 'bg-purple-600 text-white',
                activeTab: 'text-purple-600 dark:text-purple-400',
                ring: 'focus:ring-purple-500/20',
            };
        case 'amber':
            return {
                badge: 'bg-amber-500 text-white',
                avatarBg: 'bg-amber-500 text-white',
                activeTab: 'text-amber-600 dark:text-amber-400',
                ring: 'focus:ring-amber-500/20',
            };
        case 'rose':
            return {
                badge: 'bg-rose-600 text-white',
                avatarBg: 'bg-rose-600 text-white',
                activeTab: 'text-rose-600 dark:text-rose-400',
                ring: 'focus:ring-rose-500/20',
            };
        case 'cyan':
            return {
                badge: 'bg-cyan-600 text-white',
                avatarBg: 'bg-cyan-600 text-white',
                activeTab: 'text-cyan-600 dark:text-cyan-400',
                ring: 'focus:ring-cyan-500/20',
            };
        case 'dark':
            return {
                badge: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                avatarBg: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                activeTab: 'text-slate-900 dark:text-white',
                ring: 'focus:ring-slate-500/20',
            };
        case 'primary':
        default:
            return {
                badge: 'bg-blue-600 text-white',
                avatarBg: 'bg-blue-600 text-white',
                activeTab: 'text-blue-600 dark:text-blue-400',
                ring: 'focus:ring-blue-500/20',
            };
    }
});

defineExpose({ toggleCollapse, openMobile, closeMobile, isCollapsed, isMobileOpen });
</script>

<template>
    <div class="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        <!-- WRAPPER UTAMA: SIDEBAR + CONTENT -->
        <div class="flex-1 flex w-full h-screen overflow-hidden">
            <!-- ========================================================================= -->
            <!-- 1. SIDEBAR AREA (Bawaan atau Kustom via Slot #sidebar)                   -->
            <!-- ========================================================================= -->
            <slot
                name="sidebar"
                :collapsed="isCollapsed"
                :mobile-open="isMobileOpen"
                :toggle-collapse="toggleCollapse"
                :open-mobile="openMobile"
                :close-mobile="closeMobile"
            >
                <SidebarComponent
                    ref="sidebarRef"
                    :items="effectiveSidebarItems"
                    v-model:collapsed="isCollapsed"
                    v-model:mobile-open="isMobileOpen"
                    :variant="sidebarVariant"
                    :color="color"
                    :radius="radius"
                    :active-route="activeRoute"
                    @navigate="emit('navigate', $event)"
                >
                    <template v-if="$slots.logo" #logo>
                        <slot name="logo" />
                    </template>
                    <template v-if="$slots['logo-collapsed']" #logo-collapsed>
                        <slot name="logo-collapsed" />
                    </template>
                    <template v-if="$slots['sidebar-top']" #top="topProps">
                        <slot name="sidebar-top" v-bind="topProps" />
                    </template>
                    <template v-if="$slots['sidebar-footer']" #footer="footerProps">
                        <slot name="sidebar-footer" v-bind="footerProps" />
                    </template>
                </SidebarComponent>
            </slot>

            <!-- ========================================================================= -->
            <!-- 2. MAIN COLUMN (Topbar + Content Area + Footer)                           -->
            <!-- ========================================================================= -->
            <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
                <!-- TOPBAR / HEADER -->
                <header
                    :class="[
                        'shrink-0 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none',
                        fixedHeader ? 'sticky top-0 z-20' : 'relative',
                    ]"
                >
                    <slot
                        name="topbar"
                        :collapsed="isCollapsed"
                        :open-mobile="openMobile"
                        :toggle-collapse="toggleCollapse"
                    >
                        <!-- Topbar Left: Hamburger Toggle & Breadcrumbs/Title -->
                        <div class="flex items-center gap-3 min-w-0">
                            <!-- Mobile Hamburger Button (Layar < 768px) -->
                            <button
                                type="button"
                                @click="openMobile"
                                class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                aria-label="Buka navigasi mobile"
                            >
                                <span class="material-symbols-outlined text-xl leading-none">menu</span>
                            </button>

                            <!-- Desktop Sidebar Toggle Button (Jika Sidebar FloatingToggle dimatikan) -->
                            <button
                                v-if="!$slots.sidebar"
                                type="button"
                                @click="toggleCollapse"
                                class="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                :title="isCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar'"
                            >
                                <span class="material-symbols-outlined text-lg leading-none">
                                    {{ isCollapsed ? 'menu' : 'menu_open' }}
                                </span>
                            </button>

                            <!-- Breadcrumbs atau Judul Halaman Mini -->
                            <div class="min-w-0 flex items-center">
                                <slot name="breadcrumbs">
                                    <Breadcrumb v-if="breadcrumbs && breadcrumbs.length > 0" :items="breadcrumbs" />
                                    <h2 v-else-if="title" class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {{ title }}
                                    </h2>
                                </slot>
                            </div>
                        </div>

                        <!-- Topbar Right: Search, Notifications, Theme, User Menu -->
                        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
                            <!-- Search Trigger Button -->
                            <slot name="search">
                                <button
                                    v-if="showSearch"
                                    type="button"
                                    @click="emit('search')"
                                    class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-colors cursor-pointer"
                                >
                                    <span class="material-symbols-outlined text-base leading-none">search</span>
                                    <span class="hidden md:inline">Cari cepat...</span>
                                    <kbd class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                                        ⌘K
                                    </kbd>
                                </button>
                            </slot>

                            <!-- Notifications Bell -->
                            <slot name="notifications">
                                <button
                                    v-if="showNotifications"
                                    type="button"
                                    @click="emit('notifications-click')"
                                    class="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    aria-label="Lihat notifikasi"
                                >
                                    <span class="material-symbols-outlined text-lg leading-none">notifications</span>
                                    <!-- Unread Ping Badge -->
                                    <span
                                        v-if="unreadNotifications > 0"
                                        class="absolute top-1.5 right-1.5 flex h-2 w-2"
                                    >
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                                    </span>
                                </button>
                            </slot>

                            <!-- Theme Mode Toggle -->
                            <slot name="theme">
                                <ButtonTheme
                                    v-if="showThemeToggle"
                                    variant="icon"
                                    size="sm"
                                />
                            </slot>

                            <!-- Header Actions Custom Slot -->
                            <slot name="header-actions" />

                            <div class="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

                            <!-- User Profile Menu -->
                            <div ref="userMenuRef" class="relative">
                                <slot
                                    name="user"
                                    :user="user"
                                    :is-open="isUserMenuOpen"
                                    :toggle="toggleUserMenu"
                                >
                                    <button
                                        type="button"
                                        @click="toggleUserMenu"
                                        class="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer select-none text-left"
                                        aria-haspopup="true"
                                        :aria-expanded="isUserMenuOpen"
                                    >
                                        <!-- Avatar -->
                                        <div
                                            v-if="user?.avatar"
                                            class="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700"
                                        >
                                            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                                        </div>
                                        <div
                                            v-else
                                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                                            :class="colorTheme.avatarBg"
                                        >
                                            {{ (user?.name || 'U').charAt(0).toUpperCase() }}
                                        </div>

                                        <!-- Name & Role -->
                                        <div class="hidden sm:block min-w-0 pr-1">
                                            <p class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-28">
                                                {{ user?.name || 'Pengguna' }}
                                            </p>
                                            <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-28">
                                                {{ user?.role || 'User' }}
                                            </p>
                                        </div>

                                        <span class="material-symbols-outlined text-sm text-slate-400 leading-none">
                                            expand_more
                                        </span>
                                    </button>
                                </slot>

                                <!-- User Dropdown Menu Popup -->
                                <Transition
                                    enter-active-class="transition duration-150 ease-out"
                                    enter-from-class="opacity-0 scale-95 translate-y-1"
                                    enter-to-class="opacity-100 scale-100 translate-y-0"
                                    leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100 scale-100 translate-y-0"
                                    leave-to-class="opacity-0 scale-95 translate-y-1"
                                >
                                    <div
                                        v-if="isUserMenuOpen"
                                        class="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl p-1.5 z-50 select-none text-xs"
                                    >
                                        <slot name="user-menu" :user="user" :close="() => isUserMenuOpen = false">
                                            <!-- User Header Info -->
                                            <div class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                                                <p class="font-bold text-slate-900 dark:text-white truncate">{{ user?.name }}</p>
                                                <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{{ user?.email }}</p>
                                                <span class="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {{ user?.role || 'Merchant' }}
                                                </span>
                                            </div>

                                            <!-- Menu Items -->
                                            <div class="space-y-0.5">
                                                <button
                                                    type="button"
                                                    @click="isUserMenuOpen = false"
                                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                                                >
                                                    <span class="material-symbols-outlined text-base text-slate-400">person</span>
                                                    <span>Profil Pengguna</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="isUserMenuOpen = false"
                                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                                                >
                                                    <span class="material-symbols-outlined text-base text-slate-400">settings</span>
                                                    <span>Pengaturan Akun</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="isUserMenuOpen = false"
                                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                                                >
                                                    <span class="material-symbols-outlined text-base text-slate-400">help</span>
                                                    <span>Bantuan & Dokumentasi</span>
                                                </button>
                                            </div>

                                            <div class="my-1 border-t border-slate-100 dark:border-slate-800/80" />

                                            <!-- Logout Button -->
                                            <button
                                                type="button"
                                                @click="isUserMenuOpen = false; emit('logout')"
                                                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer font-semibold"
                                            >
                                                <span class="material-symbols-outlined text-base text-rose-500">logout</span>
                                                <span>Keluar dari Akun</span>
                                            </button>
                                        </slot>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </slot>
                </header>

                <!-- PAGE CONTENT CONTAINER -->
                <main class="flex-1 flex flex-col">
                    <div
                        :class="[
                            fluid ? 'w-full px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8',
                            'py-6 flex-1 flex flex-col',
                        ]"
                    >
                        <!-- PAGE HEADER BANNER (Title, Description, Header Actions) -->
                        <div
                            v-if="title || description || $slots['page-header'] || $slots['page-actions']"
                            class="mb-6 shrink-0"
                        >
                            <slot name="page-header">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h1 v-if="title" class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {{ title }}
                                        </h1>
                                        <p v-if="description" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            {{ description }}
                                        </p>
                                    </div>
                                    <div v-if="$slots['page-actions']" class="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                        <slot name="page-actions" />
                                    </div>
                                </div>
                            </slot>
                        </div>

                        <!-- DEFAULT SLOT: KONTEN UTAMA HALAMAN -->
                        <div class="flex-1">
                            <slot />
                        </div>
                    </div>
                </main>

                <!-- FOOTER -->
                <footer
                    v-if="showFooter"
                    class="shrink-0 border-t border-slate-200/70 dark:border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs select-none"
                >
                    <slot name="footer">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{{ footerText || `© ${new Date().getFullYear()} Laravel Pack UI. Seluruh hak cipta dilindungi.` }}</span>
                            <div class="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                                <a href="#" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Bantuan</a>
                                <a href="#" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privasi</a>
                                <a href="#" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Ketentuan Layanan</a>
                            </div>
                        </div>
                    </slot>
                </footer>
            </div>
        </div>
    </div>
</template>

