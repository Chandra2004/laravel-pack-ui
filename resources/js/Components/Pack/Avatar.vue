<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    src: {
        type: String,
        default: '',
    },
    alt: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'full', // 'full', 'xl', 'lg', 'md'
        validator: (val) => ['full', 'xl', 'lg', 'md'].includes(val),
    },
    status: {
        type: String,
        default: '', // '', 'online', 'offline', 'away', 'busy'
        validator: (val) => ['', 'online', 'offline', 'away', 'busy'].includes(val),
    },
    statusPosition: {
        type: String,
        default: 'bottom-right', // 'top-right', 'bottom-right'
        validator: (val) => ['top-right', 'bottom-right'].includes(val),
    },
    icon: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '',
    },
    border: {
        type: Boolean,
        default: false,
    },
    clickable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['click', 'error']);

const imgFailed = ref(false);

const showImage = computed(() => props.src && !imgFailed.value);
const showInitials = computed(() => !showImage.value && props.name);
const showIcon = computed(() => !showImage.value && !showInitials.value);

const initials = computed(() => {
    if (!props.name) return '';
    const parts = props.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
});

// Auto-generate deterministic modern gradient/color from name
const hashColor = computed(() => {
    if (props.color) return props.color;
    if (!props.name) return '';
    const colors = [
        'bg-blue-600 text-white',
        'bg-emerald-600 text-white',
        'bg-amber-600 text-white',
        'bg-rose-600 text-white',
        'bg-violet-600 text-white',
        'bg-cyan-600 text-white',
        'bg-pink-600 text-white',
        'bg-teal-600 text-white',
        'bg-indigo-600 text-white',
        'bg-orange-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < props.name.length; i++) {
        hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
});

const isCustomColor = computed(() => props.color && props.color.startsWith('#'));

// Sizing metrics
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                container: 'w-6 h-6',
                text: 'text-[10px] font-bold',
                icon: 'text-xs',
                dot: 'w-2 h-2',
                border: 'ring-1.5',
                dotOffset: props.statusPosition === 'top-right' ? '-top-0.5 -right-0.5' : '-bottom-0.5 -right-0.5',
            };
        case 'sm':
            return {
                container: 'w-8 h-8',
                text: 'text-xs font-bold',
                icon: 'text-sm',
                dot: 'w-2.5 h-2.5',
                border: 'ring-2',
                dotOffset: props.statusPosition === 'top-right' ? '-top-0.5 -right-0.5' : '-bottom-0.5 -right-0.5',
            };
        case 'lg':
            return {
                container: 'w-14 h-14',
                text: 'text-lg font-bold',
                icon: 'text-2xl',
                dot: 'w-3.5 h-3.5',
                border: 'ring-2.5',
                dotOffset: props.statusPosition === 'top-right' ? 'top-0 right-0' : 'bottom-0 right-0',
            };
        case 'xl':
            return {
                container: 'w-20 h-20',
                text: 'text-2xl font-bold',
                icon: 'text-3xl',
                dot: 'w-4.5 h-4.5',
                border: 'ring-[3px]',
                dotOffset: props.statusPosition === 'top-right' ? 'top-0.5 right-0.5' : 'bottom-0.5 right-0.5',
            };
        case '2xl':
            return {
                container: 'w-28 h-28',
                text: 'text-3xl font-bold',
                icon: 'text-4xl',
                dot: 'w-6 h-6',
                border: 'ring-4',
                dotOffset: props.statusPosition === 'top-right' ? 'top-1 right-1' : 'bottom-1 right-1',
            };
        case 'md':
        default:
            return {
                container: 'w-10 h-10',
                text: 'text-sm font-bold',
                icon: 'text-lg',
                dot: 'w-3 h-3',
                border: 'ring-2',
                dotOffset: props.statusPosition === 'top-right' ? 'top-0 right-0' : 'bottom-0 right-0',
            };
    }
});

const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'full':
        default: return 'rounded-full';
    }
});

const statusColorClass = computed(() => {
    switch (props.status) {
        case 'online': return 'bg-emerald-500';
        case 'offline': return 'bg-slate-400 dark:bg-slate-500';
        case 'away': return 'bg-amber-400';
        case 'busy': return 'bg-rose-500';
        default: return '';
    }
});

const handleImgError = (e) => {
    imgFailed.value = true;
    emit('error', e);
};

const handleClick = (e) => {
    if (props.clickable) {
        emit('click', e);
    }
};
</script>

<template>
    <!-- Outer Relative Wrapper (NO overflow-hidden, so status bullet is never masked!) -->
    <div
        class="relative inline-flex shrink-0 select-none"
        :class="[
            sizeClasses.container,
            clickable ? 'cursor-pointer' : '',
        ]"
        :role="clickable ? 'button' : undefined"
        :tabindex="clickable ? 0 : undefined"
        @click="handleClick"
    >
        <!-- Inner Media Container (Clipped to circular / rounded shape) -->
        <div
            class="w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-150"
            :class="[
                roundedClass,
                border ? `${sizeClasses.border} ring-white dark:ring-slate-900 shadow-2xs` : '',
                clickable ? 'hover:opacity-90 active:scale-95' : '',
                showImage ? 'bg-slate-100 dark:bg-slate-800' : (isCustomColor ? '' : (showInitials ? hashColor : 'bg-slate-200 dark:bg-slate-700')),
            ]"
            :style="isCustomColor ? { backgroundColor: color } : {}"
        >
            <!-- 1. Real Image -->
            <img
                v-if="showImage"
                :src="src"
                :alt="alt || name"
                class="w-full h-full object-cover select-none pointer-events-none"
                @error="handleImgError"
            />

            <!-- 2. Auto Initials from Name -->
            <span
                v-else-if="showInitials"
                class="leading-none select-none tracking-tight"
                :class="sizeClasses.text"
            >
                {{ initials }}
            </span>

            <!-- 3. Icon Fallback -->
            <span
                v-else
                class="material-symbols-outlined text-slate-500 dark:text-slate-400 leading-none select-none"
                :class="sizeClasses.icon"
                aria-hidden="true"
            >
                {{ icon || 'person' }}
            </span>

            <!-- Custom Slot Override -->
            <slot />
        </div>

        <!-- 4. Status Dot (Placed outside overflow-hidden, 100% visible & unclipped!) -->
        <span
            v-if="status"
            class="absolute block rounded-full ring-2 ring-white dark:ring-slate-900 z-10 shadow-xs pointer-events-none"
            :class="[
                sizeClasses.dot,
                statusColorClass,
                sizeClasses.dotOffset,
            ]"
            :aria-label="`Status: ${status}`"
        />

        <!-- Optional Badge Slot (outside clipping) -->
        <slot name="badge" />
    </div>
</template>
