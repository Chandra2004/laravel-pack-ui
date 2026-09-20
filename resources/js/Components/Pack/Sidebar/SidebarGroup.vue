<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
    heading: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    separator: {
        type: Boolean,
        default: false,
    },
});

const context = inject('packSidebarContext', null);
const isCollapsed = computed(() => context?.isCollapsed?.value ?? false);
const groupHeading = computed(() => props.heading || props.title || '');
</script>

<template>
    <div class="space-y-0.5">
        <!-- Garis Pemisah (Divider) -->
        <div
            v-if="separator"
            class="my-2.5 border-t border-slate-200/60 dark:border-slate-800/60 transition-all"
            :class="isCollapsed ? 'mx-1' : 'mx-2'"
        />

        <!-- Heading Judul Kelompok -->
        <div
            v-if="groupHeading"
            class="transition-all select-none"
            :class="[
                isCollapsed
                    ? 'py-2 flex justify-center'
                    : 'px-3 pt-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400/90 dark:text-slate-500 uppercase'
            ]"
        >
            <span v-if="!isCollapsed" class="truncate block">
                {{ groupHeading }}
            </span>
            <span
                v-else
                class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 block"
                :title="groupHeading"
            />
        </div>

        <!-- Slot Daftar Item Navigasi di dalam Grup -->
        <slot />
    </div>
</template>
