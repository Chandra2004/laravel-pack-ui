<script setup>
import { inject, computed } from 'vue';
import { useSidebar } from '@/Composables/Pack/useSidebar';

const props = defineProps({
    /**
     * Varian tombol:
     * - 'floating': Lingkaran melayang di border samping
     * - 'icon': Tombol ikon minimalis untuk navbar / header
     * - 'button': Tombol lengkap dengan label teks
     */
    variant: {
        type: String,
        default: 'floating',
        validator: (val) => ['floating', 'icon', 'button'].includes(val),
    },
    mobile: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        default: 'Menu',
    },
    collapsedLabel: {
        type: String,
        default: '',
    },
});

const context = inject('packSidebarContext', null);
const fallbackSidebar = useSidebar({ enableShortcut: false });

const isCollapsed = computed(() => {
    return context?.isCollapsed?.value ?? fallbackSidebar.isCollapsed.value;
});

const isMobileOpen = computed(() => {
    return context?.isMobileOpen?.value ?? fallbackSidebar.isMobileOpen.value;
});

const colorTheme = computed(() => {
    return context?.colorTheme?.value ?? {};
});

const handleToggle = () => {
    if (props.mobile) {
        if (context?.toggleMobile) {
            context.toggleMobile();
        } else if (context?.openMobile) {
            if (isMobileOpen.value) {
                context.closeMobile();
            } else {
                context.openMobile();
            }
        } else {
            fallbackSidebar.toggleMobile();
        }
        return;
    }

    if (context?.toggleCollapse) {
        context.toggleCollapse();
    } else {
        fallbackSidebar.toggleCollapse();
    }
};
</script>

<template>
    <!-- 1. Varian Floating (Di border samping) -->
    <button
        v-if="variant === 'floating'"
        type="button"
        @click="handleToggle"
        :title="isCollapsed ? 'Perluas Menu (Ctrl+B)' : 'Perkecil Menu (Ctrl+B)'"
        :aria-label="isCollapsed ? 'Perluas Menu' : 'Perkecil Menu'"
        :class="[
            'absolute -right-3.5 top-5 z-30 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-400 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none',
            colorTheme.toggleHover || 'hover:text-blue-600 dark:hover:text-blue-400',
        ]"
    >
        <span
            class="material-symbols-outlined text-base leading-none transition-transform duration-300 select-none"
            :class="isCollapsed ? 'rotate-180' : ''"
        >
            chevron_left
        </span>
    </button>

    <!-- 2. Varian Icon (Untuk Topbar / Header) -->
    <button
        v-else-if="variant === 'icon'"
        type="button"
        @click="handleToggle"
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
        :title="mobile ? (isMobileOpen ? 'Tutup Navigasi' : 'Buka Navigasi') : (isCollapsed ? 'Perluas Menu (Ctrl+B)' : 'Perkecil Menu (Ctrl+B)')"
        :aria-label="mobile ? (isMobileOpen ? 'Tutup Navigasi' : 'Buka Navigasi') : (isCollapsed ? 'Perluas Menu' : 'Perkecil Menu')"
    >
        <span class="material-symbols-outlined text-xl leading-none select-none">
            <template v-if="mobile">
                {{ isMobileOpen ? 'close' : 'menu' }}
            </template>
            <template v-else>
                {{ isCollapsed ? 'menu' : 'menu_open' }}
            </template>
        </span>
    </button>

    <!-- 3. Varian Button Teks -->
    <button
        v-else
        type="button"
        @click="handleToggle"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer select-none"
    >
        <span class="material-symbols-outlined text-sm leading-none select-none">
            <template v-if="mobile">
                {{ isMobileOpen ? 'close' : 'menu' }}
            </template>
            <template v-else>
                {{ isCollapsed ? 'menu' : 'menu_open' }}
            </template>
        </span>
        <span>
            <template v-if="mobile">
                {{ isMobileOpen ? 'Tutup' : label }}
            </template>
            <template v-else>
                {{ isCollapsed ? (collapsedLabel || label) : label }}
            </template>
        </span>
    </button>
</template>
