<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // Array of { label, href, icon, active, external, clickable }
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
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
});

const emit = defineEmits(['click']);

const isMaterialIcon = computed(() => {
    return props.separator.length > 1 && /^[a-z0-9_]+$/.test(props.separator);
});

// Size Mapping (Mematuhi Standar REQUEST.md Bagian 7 & 8: Rasio Optik & Clearance Jarak Anti-Menempel)
const sizeStyles = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                ol: 'gap-1.5 text-xs',
                itemGap: 'gap-1.5',
                iconWrap: 'w-4 h-4',
                icon: 'text-[14px]',
                separatorWrap: 'w-3.5 h-3.5',
                separatorIcon: 'text-[13px]',
                separatorText: 'text-[11px]',
                ellipsis: 'h-5 px-1 text-[11px]',
            };
        case 'lg':
            return {
                ol: 'gap-2 sm:gap-2.5 text-sm sm:text-base',
                itemGap: 'gap-2 sm:gap-2.5',
                iconWrap: 'w-5 h-5',
                icon: 'text-[18px]',
                separatorWrap: 'w-4.5 h-4.5',
                separatorIcon: 'text-[17px]',
                separatorText: 'text-sm',
                ellipsis: 'h-7 px-2 text-sm',
            };
        case 'md':
        default:
            return {
                ol: 'gap-1.5 sm:gap-2 text-xs sm:text-sm',
                itemGap: 'gap-1.5 sm:gap-2',
                iconWrap: 'w-4.5 h-4.5',
                icon: 'text-[16px]',
                separatorWrap: 'w-4 h-4',
                separatorIcon: 'text-[15px]',
                separatorText: 'text-xs',
                ellipsis: 'h-6 px-1.5 text-xs',
            };
    }
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

// Anti Scroll-Jump & Safe Routing Helpers (Mematuhi REQUEST.md Bagian 10)
const isRealInertiaLink = (item) => {
    if (!item.href || item.active) return false;
    // Tautan dummy '#' atau hash fragmen lokal bukan rute Inertia riil
    if (item.href === '#' || item.href === 'javascript:void(0)' || item.href.startsWith('#')) {
        return false;
    }
    if (item.external) return false;
    return true;
};

const getItemComponent = (item) => {
    if (item.active) return 'span';
    if (item.external) return 'a';
    if (isRealInertiaLink(item)) return Link;
    // Gunakan button type="button" untuk tautan dummy agar tidak pernah memicu scroll jump ke atas
    return 'button';
};

const getItemProps = (item) => {
    if (item.active) {
        return {
            'aria-current': 'page',
        };
    }
    if (item.external) {
        return {
            href: item.href,
            target: '_blank',
            rel: 'noopener noreferrer',
        };
    }
    if (isRealInertiaLink(item)) {
        return {
            href: item.href,
        };
    }
    // Tombol dummy interaktif aman dari scroll jump
    return {
        type: 'button',
    };
};

const handleClick = (event, item) => {
    if (item.active) {
        event?.preventDefault?.();
        return;
    }
    emit('click', item);
    // Jika tautan dummy atau item interaktif non-Inertia, cegah scroll-jump bawaan peramban
    if (!isRealInertiaLink(item) && !item.external) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
    }
};
</script>

<template>
    <nav aria-label="Breadcrumb" class="select-none">
        <ol :class="['inline-flex items-center flex-wrap', sizeStyles.ol]">
            <template v-for="(item, index) in processedItems" :key="index">
                <!-- 1. ITEM NODE -->
                <li class="inline-flex items-center leading-none">
                    <!-- Collapsed Ellipsis -->
                    <span
                        v-if="item._collapsed"
                        :class="[
                            'inline-flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 font-bold select-none cursor-default bg-slate-100 dark:bg-slate-800/80',
                            sizeStyles.ellipsis,
                        ]"
                        title="Item direktori tersembunyi"
                        aria-label="Item tersembunyi"
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
                                :is="getItemComponent(item)"
                                v-bind="getItemProps(item)"
                                @click="handleClick($event, item)"
                                :class="[
                                    'inline-flex items-center transition-colors duration-150 py-0.5 border-0 bg-transparent p-0 font-inherit text-left',
                                    sizeStyles.itemGap,
                                    item.active
                                        ? 'text-slate-900 dark:text-white font-semibold cursor-default'
                                        : item.href || item.clickable
                                            ? 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                                            : 'text-slate-500 dark:text-slate-400 cursor-default',
                                ]"
                            >
                                <!-- Home Icon or Custom Item Icon (Rasio Optik 1:1 terhadap tinggi visual teks) -->
                                <span
                                    v-if="item.isHome || item.icon"
                                    :class="['inline-flex items-center justify-center shrink-0 select-none', sizeStyles.iconWrap]"
                                >
                                    <span
                                        :class="[
                                            'material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center',
                                            sizeStyles.icon,
                                        ]"
                                        aria-hidden="true"
                                    >
                                        {{ item.isHome ? homeIcon : item.icon }}
                                    </span>
                                </span>

                                <!-- Screen Reader Fallback untuk Icon-Only Home Node -->
                                <span
                                    v-if="item.isHome && !showHomeLabel"
                                    class="sr-only"
                                >
                                    {{ item.label || 'Beranda' }}
                                </span>

                                <!-- Text Label (True Center Vertical Alignment) -->
                                <span
                                    v-if="!item.isHome || showHomeLabel"
                                    class="leading-none inline-flex items-center truncate"
                                >
                                    {{ item.label }}
                                </span>
                            </component>
                        </slot>
                    </template>
                </li>

                <!-- 2. SEPARATOR NODE (Optical Spacing Simetris & Sumbu Rata Tengah) -->
                <li
                    v-if="index < processedItems.length - 1"
                    class="inline-flex items-center justify-center text-slate-400 dark:text-slate-600 select-none shrink-0"
                    aria-hidden="true"
                >
                    <slot name="separator">
                        <span
                            v-if="isMaterialIcon"
                            :class="['inline-flex items-center justify-center', sizeStyles.separatorWrap]"
                        >
                            <span
                                :class="[
                                    'material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center',
                                    sizeStyles.separatorIcon,
                                ]"
                            >
                                {{ separator }}
                            </span>
                        </span>
                        <span
                            v-else
                            :class="[
                                'inline-flex items-center justify-center font-normal leading-none select-none',
                                sizeStyles.separatorText,
                            ]"
                        >
                            {{ separator }}
                        </span>
                    </slot>
                </li>
            </template>
        </ol>
    </nav>
</template>
