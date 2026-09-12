<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'text', // 'text', 'circular', 'rectangular', 'rounded'
        validator: (val) => ['text', 'circular', 'rectangular', 'rounded'].includes(val),
    },
    width: {
        type: String,
        default: '',
    },
    height: {
        type: String,
        default: '',
    },
    lines: {
        type: Number,
        default: 1,
    },
    lineSpacing: {
        type: String,
        default: '3', // '2', '3', '4'
    },
    lastLineWidth: {
        type: String,
        default: '70%',
    },
    animation: {
        type: String,
        default: 'pulse', // 'pulse', 'wave', 'none'
        validator: (val) => ['pulse', 'wave', 'none'].includes(val),
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg'
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
});

const animationClass = computed(() => {
    switch (props.animation) {
        case 'wave': return 'skeleton-shimmer';
        case 'none': return '';
        case 'pulse':
        default: return 'animate-pulse';
    }
});

const baseClass = 'bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300/30 dark:border-slate-700/30';

const circularSize = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-8 h-8';
        case 'lg': return 'w-16 h-16';
        case 'md':
        default: return 'w-12 h-12';
    }
});

const textHeight = computed(() => {
    switch (props.size) {
        case 'sm': return 'h-3';
        case 'lg': return 'h-5';
        case 'md':
        default: return 'h-4';
    }
});

const rectHeight = computed(() => {
    if (props.height) return '';
    switch (props.size) {
        case 'sm': return 'h-20';
        case 'lg': return 'h-48';
        case 'md':
        default: return 'h-32';
    }
});

const spacingClass = computed(() => `space-y-${props.lineSpacing}`);

const widthStyle = computed(() => props.width || null);
const heightStyle = computed(() => props.height || null);

// Realistic natural paragraph widths
const getLineWidth = (index, totalLines) => {
    if (props.width) return props.width;
    if (totalLines === 1) return '100%';
    if (index === totalLines) return props.lastLineWidth;
    if (index % 3 === 2) return '92%';
    if (index % 3 === 0) return '96%';
    return '100%';
};
</script>

<template>
    <!-- 1. VARIANT: CIRCULAR -->
    <div
        v-if="variant === 'circular'"
        :class="[
            baseClass,
            animationClass,
            circularSize,
            'rounded-full shrink-0 overflow-hidden shadow-2xs'
        ]"
        :style="{ width: widthStyle, height: heightStyle || widthStyle }"
        role="status"
        aria-label="Memuat..."
    />

    <!-- 2. VARIANT: RECTANGULAR -->
    <div
        v-else-if="variant === 'rectangular'"
        :class="[
            baseClass,
            animationClass,
            rectHeight,
            'w-full rounded-none overflow-hidden'
        ]"
        :style="{ width: widthStyle, height: heightStyle }"
        role="status"
        aria-label="Memuat..."
    />

    <!-- 3. VARIANT: ROUNDED -->
    <div
        v-else-if="variant === 'rounded'"
        :class="[
            baseClass,
            animationClass,
            rectHeight,
            'w-full rounded-2xl overflow-hidden shadow-2xs'
        ]"
        :style="{ width: widthStyle, height: heightStyle }"
        role="status"
        aria-label="Memuat..."
    />

    <!-- 4. VARIANT: TEXT (Default) — Multi-line skeleton -->
    <div
        v-else
        :class="spacingClass"
        role="status"
        aria-label="Memuat..."
    >
        <div
            v-for="line in lines"
            :key="line"
            :class="[
                baseClass,
                animationClass,
                textHeight,
                'rounded-lg overflow-hidden shadow-2xs',
            ]"
            :style="{
                width: getLineWidth(line, lines),
                height: heightStyle,
            }"
        />
    </div>
</template>

<style scoped>
.skeleton-shimmer {
    position: relative;
    overflow: hidden;
}
.skeleton-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.45) 50%,
        transparent 100%
    );
    animation: shimmer 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
:where(.dark) .skeleton-shimmer::after {
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 100%
    );
}
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>
