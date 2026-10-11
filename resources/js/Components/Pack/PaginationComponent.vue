<script>
/**
 * Komponen PaginationComponent.vue
 * Facade utama dan alias resmi untuk Pagination
 */
export { default as Pagination } from './Pagination.vue';
</script>

<script setup>
import { ref } from 'vue';
import Pagination from './Pagination.vue';

defineOptions({
    inheritAttrs: false,
});

const paginationRef = ref(null);

defineExpose({
    paginationRef,
    get currentPage() { return paginationRef.value?.currentPage; },
    get lastPage() { return paginationRef.value?.lastPage; },
    get totalItems() { return paginationRef.value?.totalItems; },
    handlePageClick: (page) => paginationRef.value?.handlePageClick(page),
    handleJump: () => paginationRef.value?.handleJump(),
    handlePerPageChange: (val) => paginationRef.value?.handlePerPageChange(val),
});
</script>

<template>
    <Pagination
        ref="paginationRef"
        v-bind="$attrs"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
        </template>
    </Pagination>
</template>
