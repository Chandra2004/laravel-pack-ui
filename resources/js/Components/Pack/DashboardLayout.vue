<script setup>
/**
 * Komponen DashboardLayout.vue (Bisa diimpor via @/Components/Pack/DashboardLayout.vue atau @/Layouts/DashboardLayout.vue)
 */
import DashboardLayout from '@/Layouts/DashboardLayout.vue';
import { ref } from 'vue';

const layoutRef = ref(null);

defineExpose({
    toggleCollapse: () => layoutRef.value?.toggleCollapse(),
    openMobile: () => layoutRef.value?.openMobile(),
    closeMobile: () => layoutRef.value?.closeMobile(),
});
</script>

<template>
    <DashboardLayout ref="layoutRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </DashboardLayout>
</template>

