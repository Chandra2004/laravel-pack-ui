<script>
/**
 * Komponen FilterToolbarComponent.vue
 * Facade utama dan alias resmi untuk FilterToolbar
 */
export { default as FilterToolbar } from './FilterToolbar.vue';
</script>

<script setup>
import { ref } from 'vue';
import FilterToolbar from './FilterToolbar.vue';

defineOptions({
    inheritAttrs: false,
});

const filterToolbarRef = ref(null);

defineExpose({
    filterToolbarRef,
    clearSearch: () => filterToolbarRef.value?.clearSearch(),
    handleReset: () => filterToolbarRef.value?.handleReset(),
    handleRefresh: () => filterToolbarRef.value?.handleRefresh(),
    get activeFiltersCount() { return filterToolbarRef.value?.activeFiltersCount; },
    get hasActiveFilters() { return filterToolbarRef.value?.hasActiveFilters; },
});
</script>

<template>
    <FilterToolbar
        ref="filterToolbarRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </FilterToolbar>
</template>
