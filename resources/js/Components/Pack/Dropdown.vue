<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
        // [{ label, icon, href, action, disabled, separator, variant }]
    },
    align: {
        type: String,
        default: 'left', // 'left', 'right'
        validator: (val) => ['left', 'right'].includes(val),
    },
    width: {
        type: String,
        default: '48', // '32', '40', '48', '56', '64', 'full'
        validator: (val) => ['32', '40', '48', '56', '64', 'full'].includes(val),
    },
    contentClasses: {
        type: String,
        default: '',
    },
    closeOnClick: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select', 'open', 'close']);

const containerRef = ref(null);
const menuRef = ref(null);
const isOpen = ref(false);
const focusedIndex = ref(-1);

useClickOutside(containerRef, () => {
    if (isOpen.value) close();
});

const actionableItems = computed(() =>
    props.items
        .map((item, idx) => ({ ...item, _originalIndex: idx }))
        .filter((item) => !item.separator && !item.disabled)
);

const toggle = () => {
    if (props.disabled) return;
    isOpen.value ? close() : open();
};

const open = () => {
    if (props.disabled || isOpen.value) return;
    isOpen.value = true;
    focusedIndex.value = -1;
    emit('open');
};

const close = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    focusedIndex.value = -1;
    emit('close');
};

const selectItem = (item) => {
    if (item.disabled) return;
    if (typeof item.action === 'function') {
        item.action(item);
    }
    emit('select', item);
    if (props.closeOnClick && !item.href) {
        close();
    }
};

const handleKeydown = (e) => {
    if (!isOpen.value) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            focusedIndex.value = (focusedIndex.value + 1) % actionableItems.value.length;
            break;
        case 'ArrowUp':
            e.preventDefault();
            focusedIndex.value = focusedIndex.value <= 0
                ? actionableItems.value.length - 1
                : focusedIndex.value - 1;
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            if (focusedIndex.value >= 0 && focusedIndex.value < actionableItems.value.length) {
                selectItem(actionableItems.value[focusedIndex.value]);
            }
            break;
        case 'Escape':
            e.preventDefault();
            close();
            break;
        case 'Home':
            e.preventDefault();
            focusedIndex.value = 0;
            break;
        case 'End':
            e.preventDefault();
            focusedIndex.value = actionableItems.value.length - 1;
            break;
    }
};

const isFocused = (item) => {
    if (focusedIndex.value < 0) return false;
    const focused = actionableItems.value[focusedIndex.value];
    return focused && focused._originalIndex === item._originalIndex;
};

const widthClass = computed(() => {
    switch (props.width) {
        case '32': return 'w-32';
        case '40': return 'w-40';
        case '56': return 'w-56';
        case '64': return 'w-64';
        case 'full': return 'w-full';
        case '48':
        default: return 'w-48';
    }
});

const alignClass = computed(() => {
    return props.align === 'right' ? 'right-0' : 'left-0';
});

const variantItemClass = (variant) => {
    switch (variant) {
        case 'danger':
            return 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40';
        case 'success':
            return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40';
        case 'warning':
            return 'text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40';
        default:
            return 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800';
    }
};

defineExpose({ open, close, toggle, isOpen });
</script>

<template>
    <div ref="containerRef" class="relative inline-block" @keydown="handleKeydown">
        <!-- Trigger -->
        <div @click="toggle" :aria-expanded="isOpen" aria-haspopup="true">
            <slot name="trigger">
                <button
                    type="button"
                    class="inline-flex items-center justify-center w-9.5 h-9.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 shadow-2xs transition-all duration-150 cursor-pointer select-none"
                    :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
                    :disabled="disabled"
                >
                    <span class="material-symbols-outlined text-lg leading-none select-none">more_vert</span>
                </button>
            </slot>
        </div>

        <!-- Dropdown Panel -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
            <div
                v-show="isOpen"
                ref="menuRef"
                role="menu"
                :class="[
                    widthClass,
                    alignClass,
                    contentClasses,
                    'absolute z-50 mt-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden origin-top',
                ]"
            >
                <!-- Header Slot -->
                <div v-if="$slots.header" class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <slot name="header" />
                </div>

                <!-- Menu Items -->
                <template v-for="(item, index) in items" :key="index">
                    <!-- Separator -->
                    <div
                        v-if="item.separator"
                        class="my-1 border-t border-slate-100 dark:border-slate-800"
                    />

                    <!-- Heading -->
                    <div
                        v-else-if="item.heading"
                        class="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none"
                    >
                        {{ item.heading }}
                    </div>

                    <!-- Regular Item -->
                    <component
                        v-else
                        :is="item.href ? 'a' : 'button'"
                        :href="item.href || undefined"
                        :type="item.href ? undefined : 'button'"
                        role="menuitem"
                        :tabindex="item.disabled ? -1 : 0"
                        @click="!item.disabled && selectItem(item)"
                        :class="[
                            'w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm transition-colors duration-100 cursor-pointer select-none text-left',
                            item.disabled
                                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                                : variantItemClass(item.variant),
                            isFocused(item)
                                ? 'bg-slate-100 dark:bg-slate-800'
                                : '',
                        ]"
                    >
                        <slot name="item" :item="item" :index="index">
                            <!-- Icon -->
                            <span
                                v-if="item.icon"
                                class="material-symbols-outlined text-base leading-none shrink-0 select-none"
                                aria-hidden="true"
                            >
                                {{ item.icon }}
                            </span>

                            <!-- Label -->
                            <span class="flex-1 truncate">{{ item.label }}</span>

                            <!-- Badge / Shortcut -->
                            <span
                                v-if="item.badge"
                                class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0"
                            >
                                {{ item.badge }}
                            </span>
                            <span
                                v-if="item.shortcut"
                                class="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0"
                            >
                                {{ item.shortcut }}
                            </span>
                        </slot>
                    </component>
                </template>

                <!-- Footer Slot -->
                <div v-if="$slots.footer" class="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                    <slot name="footer" />
                </div>
            </div>
        </Transition>
    </div>
</template>

