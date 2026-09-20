<script setup>
import { inject, computed } from 'vue';
import SidebarItem from '../SidebarItem.vue';

const props = defineProps({
    items: {
        type: Array,
        default: null,
    },
});

const context = inject('packSidebarContext', null);

const isCollapsed = computed(() => context?.isCollapsed?.value ?? false);
const resolvedItems = computed(() => props.items || context?.items?.value || []);

const handleNavigate = (item) => {
    if (context?.navigate) {
        context.navigate(item);
    }
};
</script>

<template>
    <nav
        class="flex-1 py-3 space-y-0.5 select-none transition-all scrollbar-thin"
        :class="[
            isCollapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-3',
        ]"
        aria-label="Navigasi Sidebar"
    >
        <!-- A. Slot Deklaratif (Compound Components) -->
        <slot>
            <!-- B. Fallback Otomatis: Render dari items jika slot kosong -->
            <SidebarItem
                v-for="(item, index) in resolvedItems"
                :key="index"
                :item="item"
                :depth="0"
                @navigate="handleNavigate"
            />
        </slot>
    </nav>
</template>
