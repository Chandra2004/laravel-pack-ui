<script setup>
import { inject, provide, computed } from 'vue';

const parentContext = inject('packSidebarContext', null);

// Sediakan context turunan untuk subtree flyout popover:
// isCollapsed SELALU false agar item merender label teks, ikon, dan tautan lengkap
if (parentContext) {
    provide('packSidebarContext', {
        ...parentContext,
        isCollapsed: computed(() => false),
    });
}

// Reset kedalaman (depth) menjadi 0 untuk item level pertama di dalam flyout
provide('packSidebarItemDepth', computed(() => 0));

// Tandai bahwa item berada di dalam flyout popover
provide('packSidebarInFlyout', true);
</script>

<template>
    <div class="p-1 space-y-0.5 max-h-72 overflow-y-auto">
        <slot />
    </div>
</template>
