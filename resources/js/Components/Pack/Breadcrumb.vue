<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // Array of { label, href, icon, active }
    },
    separator: {
        type: String,
        default: 'chevron_right', // Material icon name or character ('/', '>')
    },
    homeIcon: {
        type: String,
        default: 'home',
    },
    showHome: {
        type: Boolean,
        default: true,
    },
    showHomeLabel: {
        type: Boolean,
        default: false,
    },
    maxItems: {
        type: Number,
        default: 0, // 0 = show all
    },
});

const isMaterialIcon = computed(() => {
    return props.separator.length > 1 && /^[a-z_]+$/.test(props.separator);
});

// Process items with auto-collapse & home icon logic
const processedItems = computed(() => {
    if (!props.items || props.items.length === 0) return [];
    
    let list = props.items.map((item, index) => ({
        ...item,
        _index: index,
        isHome: index === 0 && props.showHome,
    }));

    if (!props.maxItems || props.maxItems <= 0 || list.length <= props.maxItems) {
        return list;
    }

    // Keep first item, last (maxItems - 1) items, and collapse the middle
    const first = list.slice(0, 1);
    const last = list.slice(-(props.maxItems - 1));
    return [...first, { _collapsed: true }, ...last];
});
</script>

<template>
    <nav aria-label="Breadcrumb" class="select-none">
        <ol class="inline-flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <template v-for="(item, index) in processedItems" :key="index">
                <!-- 1. ITEM NODE -->
                <li class="inline-flex items-center">
                    <!-- Collapsed Ellipsis -->
                    <span
                        v-if="item._collapsed"
                        class="inline-flex items-center justify-center h-6 px-1.5 rounded-md text-slate-400 dark:text-slate-500 font-bold select-none cursor-default text-xs"
                        title="Item direktori tersembunyi"
                    >
                        &hellip;
                    </span>

                    <!-- Regular Item / Home Item -->
                    <template v-else>
                        <slot
                            name="item"
                            :item="item"
                            :index="index"
                            :isLast="index === processedItems.length - 1"
                        >
                            <component
                                :is="item.href && !item.active ? Link : 'span'"
                                :href="item.href && !item.active ? item.href : undefined"
                                :aria-current="item.active ? 'page' : undefined"
                                class="inline-flex items-center gap-1.5 transition-colors duration-150 py-0.5"
                                :class="[
                                    item.active
                                        ? 'text-slate-900 dark:text-white font-semibold cursor-default'
                                        : item.href
                                            ? 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                                            : 'text-slate-500 dark:text-slate-400 cursor-default',
                                ]"
                            >
                                <!-- Home Icon or Custom Icon -->
                                <span
                                    v-if="item.isHome || item.icon"
                                    class="inline-flex items-center justify-center shrink-0 w-4.5 h-4.5 select-none"
                                >
                                    <span
                                        class="material-symbols-outlined text-[17px] leading-none"
                                        aria-hidden="true"
                                    >
                                        {{ item.isHome ? homeIcon : item.icon }}
                                    </span>
                                </span>

                                <!-- Text Label -->
                                <span
                                    v-if="!item.isHome || showHomeLabel || !item.isHome"
                                    class="leading-none truncate"
                                >
                                    {{ item.label }}
                                </span>
                            </component>
                        </slot>
                    </template>
                </li>

                <!-- 2. SEPARATOR NODE (Between crumbs, with perfectly uniform horizontal & vertical alignment) -->
                <li
                    v-if="index < processedItems.length - 1"
                    class="inline-flex items-center justify-center text-slate-400 dark:text-slate-600 select-none shrink-0"
                    aria-hidden="true"
                >
                    <slot name="separator">
                        <span
                            v-if="isMaterialIcon"
                            class="inline-flex items-center justify-center w-4 h-4"
                        >
                            <span class="material-symbols-outlined text-[15px] leading-none select-none">
                                {{ separator }}
                            </span>
                        </span>
                        <span
                            v-else
                            class="inline-flex items-center justify-center font-medium text-xs leading-none select-none"
                        >
                            {{ separator }}
                        </span>
                    </slot>
                </li>
            </template>
        </ol>
    </nav>
</template>
