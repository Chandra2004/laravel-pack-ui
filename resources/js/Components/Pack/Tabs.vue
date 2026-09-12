<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
    tabs: {
        type: Array,
        required: true,
        // Format item: { id: 'tab1', label: 'Tab 1', icon: 'settings', badge: '12', badgeVariant: 'primary', disabled: false }
        // atau array string: ['Tab 1', 'Tab 2']
    },
    modelValue: {
        type: [String, Number],
        default: null,
    },
    variant: {
        type: String,
        default: 'underline', // 'underline', 'pills', 'segmented', 'enclosed'
        validator: (val) => ['underline', 'pills', 'segmented', 'enclosed'].includes(val),
    },
    orientation: {
        type: String,
        default: 'horizontal', // 'horizontal', 'vertical'
        validator: (val) => ['horizontal', 'vertical'].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    color: {
        type: String,
        default: 'blue', // 'blue', 'indigo', 'emerald', 'violet', 'amber', 'rose', 'slate'
        validator: (val) => ['blue', 'indigo', 'emerald', 'violet', 'amber', 'rose', 'slate'].includes(val),
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    align: {
        type: String,
        default: 'left', // 'left', 'center', 'right'
        validator: (val) => ['left', 'center', 'right'].includes(val),
    },
    showIcon: {
        type: Boolean,
        default: true,
    },
    showBadge: {
        type: Boolean,
        default: true,
    },
    lazy: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'change']);

// Normalisasi tabs agar seragam { id, label, icon, badge, disabled }
const normalizedTabs = computed(() => {
    return props.tabs.map((tab, idx) => {
        if (typeof tab === 'string' || typeof tab === 'number') {
            return {
                id: String(tab),
                label: String(tab),
                icon: '',
                badge: null,
                disabled: false,
            };
        }
        return {
            id: tab.id ?? String(idx),
            label: tab.label ?? `Tab ${idx + 1}`,
            icon: tab.icon ?? '',
            badge: tab.badge ?? null,
            badgeVariant: tab.badgeVariant ?? 'default',
            disabled: Boolean(tab.disabled),
        };
    });
});

// Penentuan activeTab
const activeTabId = ref(
    props.modelValue !== null && props.modelValue !== undefined
        ? props.modelValue
        : normalizedTabs.value[0]?.id
);

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal !== null && newVal !== undefined && newVal !== activeTabId.value) {
            activeTabId.value = newVal;
        }
    }
);

const activeIndex = computed(() => {
    return normalizedTabs.value.findIndex((t) => t.id === activeTabId.value);
});

const currentTab = computed(() => {
    return normalizedTabs.value.find((t) => t.id === activeTabId.value) || normalizedTabs.value[0];
});

const selectTab = (tab, idx) => {
    if (tab.disabled) return;
    activeTabId.value = tab.id;
    emit('update:modelValue', tab.id);
    emit('change', { tab, index: idx });
};

// Keyboard Navigation (Arrow Keys)
const onKeydown = (event) => {
    const isHorizontal = props.orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key !== nextKey && event.key !== prevKey && event.key !== 'Home' && event.key !== 'End') {
        return;
    }

    event.preventDefault();
    const enabledTabs = normalizedTabs.value.filter((t) => !t.disabled);
    if (!enabledTabs.length) return;

    const currentEnabledIdx = enabledTabs.findIndex((t) => t.id === activeTabId.value);
    let targetTab = null;

    if (event.key === nextKey) {
        targetTab = enabledTabs[(currentEnabledIdx + 1) % enabledTabs.length];
    } else if (event.key === prevKey) {
        targetTab = enabledTabs[(currentEnabledIdx - 1 + enabledTabs.length) % enabledTabs.length];
    } else if (event.key === 'Home') {
        targetTab = enabledTabs[0];
    } else if (event.key === 'End') {
        targetTab = enabledTabs[enabledTabs.length - 1];
    }

    if (targetTab) {
        const originalIdx = normalizedTabs.value.findIndex((t) => t.id === targetTab.id);
        selectTab(targetTab, originalIdx);
    }
};

// Style Presets
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                button: 'px-3 py-1.5 text-xs gap-1.5',
                icon: 'text-sm',
                badge: 'text-[10px] px-1.5 py-0.2',
            };
        case 'lg':
            return {
                button: 'px-5 py-3 text-sm font-semibold gap-2.5',
                icon: 'text-lg',
                badge: 'text-xs px-2 py-0.5',
            };
        case 'md':
        default:
            return {
                button: 'px-4 py-2 text-xs font-medium gap-2',
                icon: 'text-base',
                badge: 'text-[11px] px-2 py-0.5',
            };
    }
});

const colorClasses = computed(() => {
    const colors = {
        blue: {
            underline: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400',
            pill: 'bg-blue-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-800',
        },
        indigo: {
            underline: 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400',
            pill: 'bg-indigo-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-800',
        },
        emerald: {
            underline: 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400',
            pill: 'bg-emerald-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800',
        },
        violet: {
            underline: 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400',
            pill: 'bg-violet-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-slate-200 dark:border-slate-800',
        },
        amber: {
            underline: 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400',
            pill: 'bg-amber-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-800',
        },
        rose: {
            underline: 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400',
            pill: 'bg-rose-600 text-white shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-slate-200 dark:border-slate-800',
        },
        slate: {
            underline: 'border-slate-800 text-slate-900 dark:border-white dark:text-white',
            pill: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs',
            segmented: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs',
            enclosed: 'border-b-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800',
        },
    };
    return colors[props.color] || colors.blue;
});

const getTabClass = (tab, isActive) => {
    const base = [
        'relative inline-flex items-center justify-center transition-all select-none focus:outline-hidden',
        sizeClasses.value.button,
        props.fullWidth ? 'flex-1' : '',
    ];

    if (tab.disabled) {
        return [...base, 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'].join(' ');
    }

    base.push('cursor-pointer');

    // Variant: Underline
    if (props.variant === 'underline') {
        if (props.orientation === 'vertical') {
            base.push('border-l-2 text-left justify-start rounded-r-lg');
            if (isActive) {
                base.push(colorClasses.value.underline, 'bg-slate-50/70 dark:bg-slate-800/40 font-semibold');
            } else {
                base.push('border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30');
            }
        } else {
            base.push('border-b-2 -mb-px rounded-t-lg');
            if (isActive) {
                base.push(colorClasses.value.underline, 'font-semibold');
            } else {
                base.push('border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700');
            }
        }
    }

    // Variant: Pills
    else if (props.variant === 'pills') {
        base.push('rounded-xl');
        if (isActive) {
            base.push(colorClasses.value.pill, 'font-semibold');
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200');
        }
    }

    // Variant: Segmented
    else if (props.variant === 'segmented') {
        base.push('rounded-lg');
        if (isActive) {
            base.push(colorClasses.value.segmented, 'font-semibold');
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200');
        }
    }

    // Variant: Enclosed (Boxed tabs)
    else if (props.variant === 'enclosed') {
        base.push('rounded-t-xl border border-transparent -mb-px');
        if (isActive) {
            base.push(colorClasses.value.enclosed, 'font-semibold');
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/50');
        }
    }

    return base.join(' ');
};

const getBadgeClass = (variant = 'default', isActive) => {
    if (isActive && props.variant === 'pills') {
        return 'bg-white/20 text-white';
    }
    const variants = {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        primary: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    };
    return variants[variant] || variants.default;
};

const alignClass = computed(() => {
    if (props.fullWidth) return 'w-full';
    switch (props.align) {
        case 'center':
            return 'justify-center';
        case 'right':
            return 'justify-end';
        case 'left':
        default:
            return 'justify-start';
    }
});
</script>

<template>
    <div
        class="w-full"
        :class="orientation === 'vertical' ? 'flex flex-col md:flex-row gap-6 items-start' : 'space-y-4'"
    >
        <!-- Tab List Header Container -->
        <div
            :class="[
                orientation === 'vertical' ? 'w-full md:w-64 shrink-0' : 'w-full',
                variant === 'underline' && orientation === 'horizontal' ? 'border-b border-slate-200 dark:border-slate-800' : '',
                variant === 'enclosed' && orientation === 'horizontal' ? 'border-b border-slate-200 dark:border-slate-800' : '',
            ]"
        >
            <div
                role="tablist"
                :aria-orientation="orientation"
                @keydown="onKeydown"
                tabindex="0"
                class="outline-hidden"
                :class="[
                    orientation === 'vertical' ? 'flex flex-col space-y-1' : 'flex items-center overflow-x-auto scrollbar-none',
                    alignClass,
                    variant === 'segmented' ? 'p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl inline-flex' : '',
                    variant === 'pills' && orientation === 'horizontal' ? 'gap-1.5' : '',
                ]"
            >
                <button
                    v-for="(tab, index) in normalizedTabs"
                    :key="tab.id"
                    role="tab"
                    type="button"
                    :id="`tab-${tab.id}`"
                    :aria-selected="activeTabId === tab.id"
                    :aria-controls="`tabpanel-${tab.id}`"
                    :disabled="tab.disabled"
                    :tabindex="activeTabId === tab.id ? 0 : -1"
                    :class="getTabClass(tab, activeTabId === tab.id)"
                    @click="selectTab(tab, index)"
                >
                    <!-- Custom Tab Slot -->
                    <slot name="tab" :tab="tab" :active="activeTabId === tab.id" :index="index">
                        <!-- Icon -->
                        <span
                            v-if="showIcon && tab.icon"
                            class="material-symbols-outlined select-none"
                            :class="sizeClasses.icon"
                        >
                            {{ tab.icon }}
                        </span>

                        <!-- Label -->
                        <span>{{ tab.label }}</span>

                        <!-- Badge -->
                        <span
                            v-if="showBadge && tab.badge !== null && tab.badge !== undefined"
                            class="inline-flex items-center justify-center rounded-full font-bold transition-colors"
                            :class="[sizeClasses.badge, getBadgeClass(tab.badgeVariant, activeTabId === tab.id)]"
                        >
                            {{ tab.badge }}
                        </span>
                    </slot>
                </button>
            </div>

            <!-- Extra actions slot (Header samping tab) -->
            <div v-if="$slots.extra && orientation === 'horizontal'" class="hidden sm:flex items-center ml-auto">
                <slot name="extra" />
            </div>
        </div>

        <!-- Tab Content Panel Container -->
        <div class="flex-1 w-full min-w-0">
            <!-- Dynamic / Named Slots per Tab ID -->
            <div
                v-for="(tab, index) in normalizedTabs"
                :key="tab.id"
                role="tabpanel"
                :id="`tabpanel-${tab.id}`"
                :aria-labelledby="`tab-${tab.id}`"
                tabindex="0"
                class="focus:outline-hidden"
                :class="activeTabId === tab.id ? 'block animate-in fade-in duration-200' : 'hidden'"
            >
                <!-- Render panel if active or if non-lazy -->
                <template v-if="!lazy || activeTabId === tab.id">
                    <!-- Named slot per Tab ID (cth: #general, #security, #billing) -->
                    <slot
                        :name="tab.id"
                        :tab="tab"
                        :active="activeTabId === tab.id"
                        :index="index"
                    >
                        <!-- Fallback ke Default Slot jika named slot tidak disediakan -->
                        <slot
                            :tab="tab"
                            :active-tab="currentTab"
                            :active-index="activeIndex"
                        />
                    </slot>
                </template>
            </div>
        </div>
    </div>
</template>
