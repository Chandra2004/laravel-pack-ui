<script setup>
import { inject, computed } from 'vue';

const context = inject('packSidebarContext', null);
const isCollapsed = computed(() => context?.isCollapsed?.value ?? false);
</script>

<template>
    <div
        class="shrink-0 border-t border-slate-200/60 dark:border-slate-800/60 transition-all select-none"
        :class="isCollapsed ? 'p-2 flex justify-center' : 'p-3'"
    >
        <slot :is-collapsed="isCollapsed" />
    </div>
</template>
