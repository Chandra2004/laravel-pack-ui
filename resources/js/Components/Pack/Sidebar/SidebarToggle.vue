<script setup>
import { inject, computed } from 'vue';
import { useSidebar } from '@/Composables/Pack/useSidebar';
import ButtonSubmit from '../ButtonSubmit.vue';

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
            'absolute -right-3 top-6 z-30 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer select-none',
            colorTheme.toggleHover,
        ]"
    >
        <svg
            class="w-2.5 h-2.5 transition-transform duration-200"
            :class="isCollapsed ? 'rotate-180' : ''"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
        >
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 9-4-4 4-4"/>
        </svg>
    </button>

    <!-- 2. Varian Icon (Untuk Topbar / Header) -->
    <button
        v-else-if="variant === 'icon'"
        type="button"
        @click="handleToggle"
        class="inline-flex items-center justify-center p-2 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-slate-700 transition-colors cursor-pointer"
        :title="mobile ? (isMobileOpen ? 'Tutup Navigasi' : 'Buka Navigasi') : (isCollapsed ? 'Perluas Menu (Ctrl+B)' : 'Perkecil Menu (Ctrl+B)')"
        :aria-label="mobile ? (isMobileOpen ? 'Tutup Navigasi' : 'Buka Navigasi') : (isCollapsed ? 'Perluas Menu' : 'Perkecil Menu')"
    >
        <span class="sr-only">Toggle Sidebar</span>
        <svg v-if="!mobile || !isMobileOpen" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
        <svg v-else class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 12 12M13 1 1 13"/>
        </svg>
    </button>

    <!-- 3. Varian Button Teks -->
    <ButtonSubmit
        v-else
        type="button"
        variant="secondary"
        size="xs"
        @click="handleToggle"
    >
        <div class="flex items-center gap-2">
            <svg v-if="!mobile || !isMobileOpen" class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 12 12M13 1 1 13"/>
            </svg>
            <span v-if="mobile">
                {{ isMobileOpen ? 'Tutup' : label }}
            </span>
            <span v-else>
                {{ isCollapsed ? (collapsedLabel || label) : label }}
            </span>
        </div>
    </ButtonSubmit>
</template>
