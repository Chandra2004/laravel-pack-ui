<script>
export { default as SidebarComponent } from './SidebarComponent.vue';
export { default as SidebarHeader } from './Sidebar/SidebarHeader.vue';
export { default as SidebarNav } from './Sidebar/SidebarNav.vue';
export { default as SidebarGroup } from './Sidebar/SidebarGroup.vue';
export { default as SidebarItem } from './SidebarItem.vue';
export { default as SidebarFooter } from './Sidebar/SidebarFooter.vue';
export { default as SidebarToggle } from './Sidebar/SidebarToggle.vue';
export { useSidebar } from '@/Composables/Pack/useSidebar';
</script>

<script setup>
/**
 * Komponen Sidebar.vue (Facade utama & ekspor compound sub-komponen)
 * Mendukung mode Config-Driven (:items="[...]"), mode Deklaratif (<slot />), dan Compound Components.
 */
import SidebarComponent from './SidebarComponent.vue';
import { ref, computed } from 'vue';

const sidebarRef = ref(null);

defineExpose({
    toggleCollapse: () => sidebarRef.value?.toggleCollapse(),
    openMobile: () => sidebarRef.value?.openMobile(),
    closeMobile: () => sidebarRef.value?.closeMobile(),
    isCollapsed: computed(() => sidebarRef.value?.isCollapsed),
    isMobileOpen: computed(() => sidebarRef.value?.isMobileOpen),
    isMobile: computed(() => sidebarRef.value?.isMobile),
    isTablet: computed(() => sidebarRef.value?.isTablet),
});
</script>

<template>
    <SidebarComponent ref="sidebarRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </SidebarComponent>
</template>
