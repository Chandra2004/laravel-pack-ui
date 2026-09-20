<script setup>
/**
 * Komponen DashboardLayout.vue (Alias untuk backward-compatibility, mengarah ke @/Layouts/Pack/UIDashboardLayout.vue)
 */
import UIDashboardLayout from '@/Layouts/Pack/UIDashboardLayout.vue';
import { ref } from 'vue';

const layoutRef = ref(null);

defineExpose({
    toggleCollapse: () => layoutRef.value?.toggleCollapse(),
    openMobile: () => layoutRef.value?.openMobile(),
    closeMobile: () => layoutRef.value?.closeMobile(),
});
</script>

<template>
    <UIDashboardLayout ref="layoutRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </UIDashboardLayout>
</template>

