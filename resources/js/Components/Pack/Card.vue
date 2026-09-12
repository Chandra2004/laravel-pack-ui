<script setup>
import { ref, computed, useId, watch } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'default', // 'default', 'bordered', 'elevated', 'flat'
        validator: (val) => ['default', 'bordered', 'elevated', 'flat'].includes(val),
    },
    padding: {
        type: String,
        default: 'md', // 'none', 'sm', 'md', 'lg'
        validator: (val) => ['none', 'sm', 'md', 'lg'].includes(val),
    },
    rounded: {
        type: String,
        default: '2xl', // 'none', 'md', 'lg', 'xl', '2xl', '3xl'
        validator: (val) => ['none', 'md', 'lg', 'xl', '2xl', '3xl'].includes(val),
    },
    collapsible: {
        type: Boolean,
        default: false,
    },
    collapsed: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    hoverable: {
        type: Boolean,
        default: false,
    },
    clickable: {
        type: Boolean,
        default: false,
    },
    showHeader: {
        type: Boolean,
        default: true,
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['click', 'update:collapsed']);

const contentId = useId();

const isCollapsed = ref(props.collapsed);

// Sync with v-model:collapsed
watch(() => props.collapsed, (val) => {
    isCollapsed.value = val;
});

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    emit('update:collapsed', isCollapsed.value);
};

const handleClick = (e) => {
    if (props.clickable) {
        emit('click', e);
    }
};

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'bordered':
            return 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800';
        case 'elevated':
            return 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-lg';
        case 'flat':
            return 'bg-slate-50 dark:bg-slate-800/50 border border-transparent';
        case 'default':
        default:
            return 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs';
    }
});

const paddingClasses = computed(() => {
    switch (props.padding) {
        case 'none': return 'p-0';
        case 'sm': return 'p-3';
        case 'lg': return 'p-6 sm:p-8';
        case 'md':
        default: return 'p-4 sm:p-5';
    }
});

const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none': return 'rounded-none';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case '3xl': return 'rounded-3xl';
        case '2xl':
        default: return 'rounded-2xl';
    }
});

const hasHeader = computed(() => {
    return props.showHeader && (props.title || props.icon || props.collapsible);
});
</script>

<template>
    <div
        :class="[
            variantClasses,
            roundedClasses,
            'overflow-hidden transition-all duration-200',
            collapsible && isCollapsed ? 'h-fit self-start' : '',
            hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-shadow' : '',
            clickable ? 'cursor-pointer active:scale-[0.99]' : '',
        ]"
        @click="handleClick"
    >
        <!-- HEADER -->
        <div
            v-if="hasHeader || $slots.header || $slots['header-actions']"
            class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 select-none transition-colors"
            :class="[
                (!collapsible || !isCollapsed) ? 'border-b border-slate-100 dark:border-slate-800/80' : ''
            ]"
        >
            <div class="flex items-center gap-2.5 min-w-0">
                <slot name="header">
                    <!-- Icon -->
                    <span
                        v-if="icon"
                        class="material-symbols-outlined text-lg leading-none text-slate-500 dark:text-slate-400 shrink-0 select-none"
                        aria-hidden="true"
                    >
                        {{ icon }}
                    </span>

                    <!-- Title & Subtitle -->
                    <div v-if="title" class="min-w-0">
                        <h3 class="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
                            {{ title }}
                        </h3>
                        <p v-if="subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                            {{ subtitle }}
                        </p>
                    </div>
                </slot>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <!-- Header Actions Slot -->
                <slot name="header-actions" />

                <!-- Collapse Toggle Button -->
                <button
                    v-if="collapsible"
                    type="button"
                    @click.stop="toggleCollapse"
                    :aria-expanded="!isCollapsed"
                    :aria-controls="contentId"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 cursor-pointer"
                    :title="isCollapsed ? 'Buka konten' : 'Tutup konten'"
                >
                    <span
                        class="material-symbols-outlined text-lg leading-none transition-transform duration-300 select-none"
                        :class="isCollapsed ? '' : 'rotate-180'"
                    >
                        expand_more
                    </span>
                </button>
            </div>
        </div>

        <!-- COLLAPSIBLE BODY -->
        <Transition
            enter-active-class="transition-all duration-250 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[2000px]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[2000px]"
            leave-to-class="opacity-0 max-h-0"
        >
            <div
                v-show="!collapsible || !isCollapsed"
                :id="contentId"
                class="overflow-hidden"
            >
                <div :class="paddingClasses" class="relative">
                    <!-- Loading Overlay -->
                    <div
                        v-if="loading"
                        class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px]"
                    >
                        <slot name="loading">
                            <span
                                class="material-symbols-outlined text-2xl text-blue-500 animate-spin select-none"
                                aria-hidden="true"
                            >
                                progress_activity
                            </span>
                        </slot>
                    </div>

                    <!-- Default Content -->
                    <slot />
                </div>

                <!-- FOOTER -->
                <div
                    v-if="showFooter && $slots.footer"
                    class="px-4 sm:px-5 py-3 sm:py-3.5 border-t border-slate-100 dark:border-slate-800/80"
                >
                    <slot name="footer" />
                </div>
            </div>
        </Transition>
    </div>
</template>
