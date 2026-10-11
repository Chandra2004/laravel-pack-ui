<script setup>
import { computed } from 'vue';
import SkeletonShape from './SkeletonShape.vue';
import SkeletonCard from './SkeletonCard.vue';

defineOptions({
    name: 'SkeletonLayout',
});

const props = defineProps({
    /**
     * Array definisi item layout yang akan dirender
     */
    items: {
        type: Array,
        default: () => [],
    },
    /**
     * Konfigurasi warisan
     */
    color: {
        type: String,
        default: '',
    },
    animation: {
        type: String,
        default: '',
    },
    radius: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: '',
    },
});

// Normalisasi item jika berupa string shorthand seperti 'avatar', 'button', 'text'
const normalizeItem = (item) => {
    if (typeof item === 'string') {
        return { shape: item };
    }
    return item || {};
};

// Builder kelas Flex
const getFlexClasses = (item) => {
    const isCol = item.flex === 'col' || item.direction === 'col' || item.direction === 'column';
    const classes = [
        'flex',
        isCol ? 'flex-col' : 'flex-row items-center',
        item.gap !== undefined ? `gap-${item.gap}` : 'gap-3',
    ];
    if (item.justify) {
        classes.push(`justify-${item.justify}`);
    }
    if (item.align) {
        classes.push(`items-${item.align}`);
    }
    if (item.wrap) {
        classes.push('flex-wrap');
    }
    if (item.class) {
        classes.push(item.class);
    }
    return classes.join(' ');
};

// Builder kelas Grid
const getGridClasses = (item) => {
    const cols = item.cols || 2;
    const gap = item.gap !== undefined ? item.gap : 4;
    return `grid grid-cols-1 sm:grid-cols-${cols} gap-${gap} ${item.class || ''}`;
};
</script>

<template>
    <div class="w-full space-y-3">
        <template v-for="(rawItem, index) in items" :key="index">
            <!-- 1. FLEX CONTAINER -->
            <div
                v-if="rawItem.flex || rawItem.direction"
                :class="getFlexClasses(rawItem)"
            >
                <template v-for="(subItem, subIdx) in (rawItem.items || [])" :key="subIdx">
                    <!-- Recursive Flex Container if nested -->
                    <SkeletonLayout
                        v-if="subItem.flex || subItem.grid || subItem.card"
                        :items="[subItem]"
                        :color="color"
                        :animation="animation"
                        :radius="radius"
                        :size="size"
                        :class="subItem.class || (subItem.flex1 ? 'flex-1' : '')"
                    />

                    <!-- Atomic Shape inside Flex -->
                    <div
                        v-else
                        :class="[
                            subItem.class || '',
                            subItem.flex1 ? 'flex-1 min-w-0' : '',
                            subItem.shrink0 ? 'shrink-0' : '',
                        ]"
                    >
                        <SkeletonShape
                            v-bind="normalizeItem(subItem)"
                            :color="subItem.color || color"
                            :animation="subItem.animation || animation"
                            :radius="subItem.radius || radius"
                            :size="subItem.size || size"
                        />
                    </div>
                </template>
            </div>

            <!-- 2. GRID CONTAINER -->
            <div
                v-else-if="rawItem.grid"
                :class="getGridClasses(rawItem)"
            >
                <div
                    v-for="(subItem, subIdx) in (rawItem.items || [])"
                    :key="subIdx"
                    :class="subItem.class || ''"
                >
                    <SkeletonLayout
                        v-if="subItem.flex || subItem.grid || subItem.card"
                        :items="[subItem]"
                        :color="color"
                        :animation="animation"
                        :radius="radius"
                        :size="size"
                    />
                    <SkeletonShape
                        v-else
                        v-bind="normalizeItem(subItem)"
                        :color="subItem.color || color"
                        :animation="subItem.animation || animation"
                        :radius="subItem.radius || radius"
                        :size="subItem.size || size"
                    />
                </div>
            </div>

            <!-- 3. CARD CONTAINER -->
            <SkeletonCard
                v-else-if="rawItem.card"
                :color="rawItem.color || color"
                :radius="rawItem.radius || radius"
                :padding="rawItem.padding"
                :class="rawItem.class || ''"
            >
                <SkeletonLayout
                    :items="rawItem.items || []"
                    :color="color"
                    :animation="animation"
                    :radius="radius"
                    :size="size"
                />
            </SkeletonCard>

            <!-- 4. ATOMIC SHAPE STANDALONE -->
            <div
                v-else
                :class="rawItem.class || ''"
            >
                <SkeletonShape
                    v-bind="normalizeItem(rawItem)"
                    :color="rawItem.color || color"
                    :animation="rawItem.animation || animation"
                    :radius="rawItem.radius || radius"
                    :size="rawItem.size || size"
                />
            </div>
        </template>
    </div>
</template>
