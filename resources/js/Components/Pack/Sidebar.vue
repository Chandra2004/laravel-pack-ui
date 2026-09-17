<script setup>
/**
 * Komponen Sidebar.vue (Alias kompatibilitas untuk SidebarComponent.vue)
 * Anda dapat mengimpor Sidebar.vue atau SidebarComponent.vue secara bergantian.
 */
import SidebarComponent from './SidebarComponent.vue';
import { ref } from 'vue';

const sidebarRef = ref(null);

defineExpose({
    toggleCollapse: () => sidebarRef.value?.toggleCollapse(),
    openMobile: () => sidebarRef.value?.openMobile(),
    closeMobile: () => sidebarRef.value?.closeMobile(),
});
</script>

<template>
    <SidebarComponent ref="sidebarRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </SidebarComponent>
</template>
