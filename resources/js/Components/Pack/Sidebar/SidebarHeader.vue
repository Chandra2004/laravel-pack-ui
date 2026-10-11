<script setup>
import { inject, computed } from 'vue';
import ButtonSubmit from '../ButtonSubmit.vue';

const props = defineProps({
    brandName: {
        type: String,
        default: '',
    },
    brandSub: {
        type: String,
        default: '',
    },
    logoText: {
        type: String,
        default: 'P',
    },
    showToggle: {
        type: Boolean,
        default: false,
    },
});

const context = inject('packSidebarContext', null);

const isCollapsed = computed(() => context?.isCollapsed?.value ?? false);
const isRail = computed(() => context?.variant?.value === 'rail');
const isEffectivelyCollapsed = computed(() => isCollapsed.value || isRail.value);
const colorTheme = computed(() => context?.colorTheme?.value ?? {});

const toggleCollapse = () => {
    if (context?.toggleCollapse) {
        context.toggleCollapse();
    }
};
</script>

<template>
    <div
        class="flex items-center shrink-0 h-16 border-b border-slate-200/60 dark:border-slate-800/60 select-none transition-all duration-200"
        :class="isEffectivelyCollapsed ? 'justify-center px-0' : 'justify-between px-4'"
    >
        <!-- A. Mode Diperluas (Expanded) -->
        <div v-if="!isEffectivelyCollapsed" class="flex items-center gap-3 min-w-0 flex-1">
            <slot>
                <div class="flex items-center gap-2.5 min-w-0">
                    <div
                        class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                        :class="colorTheme.logoBg || 'bg-blue-600 text-white'"
                    >
                        {{ logoText }}
                    </div>
                    <div class="min-w-0 flex-1">
                        <span class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate block leading-tight">
                            {{ brandName || 'Dashboard' }}
                        </span>
                        <span v-if="brandSub" class="text-[10px] text-slate-400 font-medium truncate block leading-tight mt-0.5">
                            {{ brandSub }}
                        </span>
                    </div>
                </div>
            </slot>
        </div>

        <!-- In-Header Toggle Button (Flowbite Formal Hamburger) -->
        <div v-if="!isEffectivelyCollapsed" class="flex items-center gap-1 shrink-0">
            <slot name="actions" />
            <button
                v-if="showToggle"
                type="button"
                @click="toggleCollapse"
                class="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Ciutkan Menu (Ctrl+B)"
                aria-label="Ciutkan Menu"
            >
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
        </div>

        <!-- B. Mode Diciutkan (Collapsed) -->
        <div
            v-if="isEffectivelyCollapsed"
            class="w-full flex items-center justify-center cursor-pointer group"
            @click="toggleCollapse"
            title="Klik untuk memperluas menu (Ctrl+B)"
        >
            <slot name="collapsed">
                <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform"
                    :class="colorTheme.logoBg || 'bg-blue-600 text-white'"
                >
                    {{ logoText }}
                </div>
            </slot>
        </div>
    </div>
</template>
