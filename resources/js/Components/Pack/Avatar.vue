<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';

const props = defineProps({
    // Core Props (Backward Compatible)
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
        default: 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(val),
    },
    rounded: {
        type: String,
        default: 'full', // 'full', 'xl', 'lg', 'md', 'squircle', 'none'
        validator: (val) => ['full', 'xl', 'lg', 'md', 'squircle', 'none'].includes(val),
    },
    status: {
        type: String,
        default: '', // '', 'online', 'offline', 'away', 'busy'
        validator: (val) => ['', 'online', 'offline', 'away', 'busy'].includes(val),
    },
    statusPosition: {
        type: String,
        default: 'bottom-right', // 'top-right', 'bottom-right', 'top-left', 'bottom-left'
        validator: (val) => ['top-right', 'bottom-right', 'top-left', 'bottom-left'].includes(val),
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

    // 5 Pilar Tambahan & Fitur Khusus
    colorTheme: {
        type: String,
        default: 'default', // 'default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'
        validator: (val) => ['default', 'primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(val),
    },
    variant: {
        type: String,
        default: 'default', // 'default', 'gradient', 'glass', 'outline', 'soft'
        validator: (val) => ['default', 'gradient', 'glass', 'outline', 'soft'].includes(val),
    },
    glow: {
        type: Boolean,
        default: false,
    },
    pulse: {
        type: Boolean,
        default: false, // Animasi radar ping pada status online
    },
    story: {
        type: String,
        default: 'none', // 'none', 'gradient', 'unread', 'live', 'emerald'
        validator: (val) => ['none', 'gradient', 'unread', 'live', 'emerald'].includes(val),
    },
    verified: {
        type: Boolean,
        default: false, // Badge centang biru resmi
    },
    badge: {
        type: [String, Number],
        default: '', // Notifikasi counter angka (e.g. '3', 'VIP')
    },
    badgeColor: {
        type: String,
        default: '',
    },
    showInfo: {
        type: Boolean,
        default: false, // Menampilkan nama & subteks di samping avatar
    },
    subtext: {
        type: String,
        default: '', // Email / role jabatan
    },

    // Fitur Dropdown
    dropdown: {
        type: Boolean,
        default: false, // Mengaktifkan profile dropdown menu popover
    },
    dropdownAlign: {
        type: String,
        default: 'right', // 'left', 'right', 'center'
        validator: (val) => ['left', 'right', 'center'].includes(val),
    },
    menuItems: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits([
    'click',
    'error',
    'toggle-dropdown',
    'menu-click',
    'change-status',
]);

const avatarContainerRef = ref(null);
const imgFailed = ref(false);
const isDropdownOpen = ref(false);

// Close dropdown on click outside
useClickOutside(avatarContainerRef, () => {
    if (isDropdownOpen.value) {
        isDropdownOpen.value = false;
        emit('toggle-dropdown', false);
    }
});

// Escape key to close dropdown
const handleKeydown = (e) => {
    if (e.key === 'Escape' && isDropdownOpen.value) {
        isDropdownOpen.value = false;
        emit('toggle-dropdown', false);
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

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
const themePresets = {
    default: {
        gradient: 'from-slate-700 to-slate-900 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(100,116,139,0.35)]',
        soft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    primary: {
        gradient: 'from-blue-600 to-indigo-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(37,99,235,0.45)]',
        soft: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    },
    indigo: {
        gradient: 'from-indigo-600 to-purple-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(79,70,229,0.45)]',
        soft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    emerald: {
        gradient: 'from-emerald-500 to-teal-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(5,150,105,0.45)]',
        soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    purple: {
        gradient: 'from-purple-600 to-pink-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(147,51,234,0.45)]',
        soft: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    },
    amber: {
        gradient: 'from-amber-500 to-orange-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(217,119,6,0.45)]',
        soft: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    },
    rose: {
        gradient: 'from-rose-500 to-red-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(225,29,72,0.45)]',
        soft: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    cyan: {
        gradient: 'from-cyan-500 to-blue-600 text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(6,182,212,0.45)]',
        soft: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
    },
    dark: {
        gradient: 'from-zinc-800 to-black text-white',
        glow: 'shadow-[0_4px_16px_-2px_rgba(0,0,0,0.5)]',
        soft: 'bg-slate-800 text-slate-200 dark:bg-zinc-800 dark:text-zinc-200',
    },
};

const currentTheme = computed(() => themePresets[props.colorTheme] || themePresets.default);

const hashColor = computed(() => {
    if (props.color) return props.color;
    if (props.colorTheme !== 'default') {
        return `bg-gradient-to-br ${currentTheme.value.gradient}`;
    }
    if (!props.name) return 'bg-slate-600 text-white';

    const colors = [
        'bg-gradient-to-br from-blue-600 to-indigo-600 text-white',
        'bg-gradient-to-br from-emerald-600 to-teal-700 text-white',
        'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
        'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
        'bg-gradient-to-br from-purple-600 to-violet-700 text-white',
        'bg-gradient-to-br from-cyan-600 to-blue-600 text-white',
        'bg-gradient-to-br from-teal-600 to-emerald-600 text-white',
        'bg-gradient-to-br from-indigo-600 to-purple-600 text-white',
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
                storyPad: 'p-0.5',
                text: 'text-[9px] font-bold',
                icon: 'text-xs',
                dot: 'w-2 h-2',
                border: 'ring-1.5',
                badge: 'text-[8px] px-1 py-0',
                verified: 'w-2.5 h-2.5 text-[8px]',
                dotOffset: getDotOffset('xs'),
            };
        case 'sm':
            return {
                container: 'w-8 h-8',
                storyPad: 'p-0.5',
                text: 'text-xs font-bold',
                icon: 'text-sm',
                dot: 'w-2.5 h-2.5',
                border: 'ring-2',
                badge: 'text-[9px] px-1.5 py-0.2',
                verified: 'w-3 h-3 text-[10px]',
                dotOffset: getDotOffset('sm'),
            };
        case 'lg':
            return {
                container: 'w-14 h-14',
                storyPad: 'p-1',
                text: 'text-lg font-bold',
                icon: 'text-2xl',
                dot: 'w-3.5 h-3.5',
                border: 'ring-2.5',
                badge: 'text-xs px-2 py-0.5',
                verified: 'w-4.5 h-4.5 text-xs',
                dotOffset: getDotOffset('lg'),
            };
        case 'xl':
            return {
                container: 'w-20 h-20',
                storyPad: 'p-1',
                text: 'text-2xl font-bold',
                icon: 'text-3xl',
                dot: 'w-4.5 h-4.5',
                border: 'ring-[3px]',
                badge: 'text-xs px-2 py-0.5',
                verified: 'w-5.5 h-5.5 text-sm',
                dotOffset: getDotOffset('xl'),
            };
        case '2xl':
            return {
                container: 'w-28 h-28',
                storyPad: 'p-1.5',
                text: 'text-3xl font-bold',
                icon: 'text-4xl',
                dot: 'w-6 h-6',
                border: 'ring-4',
                badge: 'text-sm px-2.5 py-0.5',
                verified: 'w-7 h-7 text-base',
                dotOffset: getDotOffset('2xl'),
            };
        case '3xl':
            return {
                container: 'w-36 h-36',
                storyPad: 'p-2',
                text: 'text-4xl font-black',
                icon: 'text-5xl',
                dot: 'w-7 h-7',
                border: 'ring-4',
                badge: 'text-sm px-3 py-1',
                verified: 'w-8 h-8 text-lg',
                dotOffset: getDotOffset('3xl'),
            };
        case 'md':
        default:
            return {
                container: 'w-10 h-10',
                storyPad: 'p-0.5',
                text: 'text-sm font-bold',
                icon: 'text-lg',
                dot: 'w-3 h-3',
                border: 'ring-2',
                badge: 'text-[10px] px-1.5 py-0.2',
                verified: 'w-3.5 h-3.5 text-[10px]',
                dotOffset: getDotOffset('md'),
            };
    }
});

function getDotOffset(sz) {
    const isTop = props.statusPosition.startsWith('top');
    const isLeft = props.statusPosition.endsWith('left');

    let y = isTop ? 'top-0' : 'bottom-0';
    let x = isLeft ? 'left-0' : 'right-0';

    if (sz === 'xs' || sz === 'sm') {
        y = isTop ? '-top-0.5' : '-bottom-0.5';
        x = isLeft ? '-left-0.5' : '-right-0.5';
    } else if (sz === 'xl' || sz === '2xl' || sz === '3xl') {
        y = isTop ? 'top-0.5' : 'bottom-0.5';
        x = isLeft ? 'left-0.5' : 'right-0.5';
    }
    return `${y} ${x}`;
}

const roundedClass = computed(() => {
    switch (props.rounded) {
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'squircle': return 'rounded-2xl';
        case 'none': return 'rounded-none';
        case 'full':
        default: return 'rounded-full';
    }
});

// Story Ring Classes
const storyClass = computed(() => {
    switch (props.story) {
        case 'gradient':
        case 'unread':
            return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 ring-2 ring-white dark:ring-slate-900';
        case 'emerald':
            return 'bg-emerald-500 ring-2 ring-white dark:ring-slate-900';
        case 'live':
            return 'bg-rose-600 animate-pulse ring-2 ring-white dark:ring-slate-900';
        case 'none':
        default:
            return '';
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

const handleAvatarClick = (e) => {
    if (props.dropdown) {
        e.stopPropagation();
        isDropdownOpen.value = !isDropdownOpen.value;
        emit('toggle-dropdown', isDropdownOpen.value);
    }
    if (props.clickable || props.dropdown) {
        emit('click', e);
    }
};

const handleMenuItemClick = (item, e) => {
    if (item.disabled) return;
    if (item.action) item.action(e);
    emit('menu-click', item);
    isDropdownOpen.value = false;
};

// Dropdown Alignment
const dropdownAlignClass = computed(() => {
    switch (props.dropdownAlign) {
        case 'left': return 'left-0 origin-top-left';
        case 'center': return 'left-1/2 -translate-x-1/2 origin-top';
        case 'right':
        default: return 'right-0 origin-top-right';
    }
});
</script>

<template>
    <!-- Outer Relative Wrapper (with Click Outside listener) -->
    <div
        ref="avatarContainerRef"
        class="relative inline-flex items-center gap-2.5 select-none"
        :class="[
            (clickable || dropdown) ? 'cursor-pointer' : '',
        ]"
    >
        <!-- Story Ring Container (if story !== 'none') -->
        <div
            class="relative inline-flex items-center justify-center shrink-0 transition-transform duration-200"
            :class="[
                story !== 'none' ? `${sizeClasses.storyPad} ${storyClass} ${roundedClass}` : '',
                glow ? currentTheme.glow : '',
                (clickable || dropdown) ? 'hover:scale-105 active:scale-95' : '',
            ]"
            @click="handleAvatarClick"
        >
            <!-- Inner Avatar Container -->
            <div
                class="relative inline-flex shrink-0 items-center justify-center overflow-hidden transition-all duration-150"
                :class="[
                    sizeClasses.container,
                    roundedClass,
                    border ? `${sizeClasses.border} ring-white dark:ring-slate-900 shadow-xs` : '',
                    story !== 'none' ? 'ring-2 ring-white dark:ring-slate-900' : '',
                    variant === 'glass' ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60' : '',
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
                    class="leading-none select-none tracking-tight font-black"
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

                <!-- Custom Slot Inside Media -->
                <slot />
            </div>

            <!-- 4. Presence Status Dot (Unmasked, perfectly circular outside overflow-hidden) -->
            <span
                v-if="status"
                class="absolute block rounded-full ring-2 ring-white dark:ring-slate-900 z-10 shadow-xs pointer-events-none"
                :class="[
                    sizeClasses.dot,
                    statusColorClass,
                    sizeClasses.dotOffset,
                ]"
                :aria-label="`Status: ${status}`"
            >
                <!-- Pulse radar ping for online status -->
                <span
                    v-if="pulse && status === 'online'"
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                />
            </span>

            <!-- 5. Verified Official Badge -->
            <span
                v-if="verified"
                class="absolute -bottom-0.5 -right-0.5 z-10 flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none"
                :class="sizeClasses.verified"
                title="Verified Official"
            >
                <span class="material-symbols-outlined text-[inherit] leading-none">check</span>
            </span>

            <!-- 6. Counter / Text Badge (e.g. '3', 'VIP') -->
            <span
                v-if="badge"
                class="absolute -top-1 -right-1 z-10 font-bold font-mono rounded-full text-white shadow-xs pointer-events-none"
                :class="[
                    sizeClasses.badge,
                    badgeColor || 'bg-rose-500 ring-1.5 ring-white dark:ring-slate-900'
                ]"
            >
                {{ badge }}
            </span>

            <!-- 7. LIVE Badge on Story -->
            <span
                v-if="story === 'live'"
                class="absolute -bottom-1.5 inset-x-0 mx-auto w-fit z-10 px-1 py-0.2 rounded-sm bg-rose-600 text-white font-black text-[8px] tracking-wider uppercase shadow-xs pointer-events-none"
            >
                LIVE
            </span>
        </div>

        <!-- USER INFO TEXT (showInfo === true) -->
        <div
            v-if="showInfo"
            class="min-w-0 text-left cursor-pointer"
            @click="handleAvatarClick"
        >
            <div class="flex items-center gap-1.5">
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {{ name || 'Pengguna' }}
                </span>
                <span v-if="verified" class="material-symbols-outlined text-blue-500 text-xs shrink-0">
                    verified
                </span>
            </div>
            <p v-if="subtext" class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ subtext }}
            </p>
        </div>

        <!-- DROPDOWN ARROW INDICATOR (if dropdown === true) -->
        <span
            v-if="dropdown"
            class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-base transition-transform duration-200 cursor-pointer"
            :class="isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''"
            @click="handleAvatarClick"
            aria-hidden="true"
        >
            expand_more
        </span>

        <!-- ================= AVATAR DROPDOWN MENU POPOVER ================= -->
        <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95 -translate-y-1"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 -translate-y-1"
        >
            <div
                v-if="dropdown && isDropdownOpen"
                class="absolute top-full mt-2 w-64 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 overflow-hidden select-none text-xs"
                :class="dropdownAlignClass"
            >
                <!-- Custom Dropdown Slot -->
                <slot name="dropdown" :close="() => isDropdownOpen = false">
                    <!-- Default Profile Card Header -->
                    <div class="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-white">
                                <img v-if="showImage" :src="src" :alt="alt || name" class="w-full h-full object-cover" />
                                <span v-else-if="name">{{ initials }}</span>
                                <span v-else class="material-symbols-outlined text-base">person</span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1">
                                    <h4 class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ name || 'Pengguna Speed' }}</h4>
                                    <span v-if="verified" class="material-symbols-outlined text-blue-500 text-xs">verified</span>
                                </div>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ subtext || 'user@example.com' }}</p>
                            </div>
                        </div>

                        <!-- Status Quick Switcher -->
                        <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span class="text-slate-400">Status Akun:</span>
                            <div class="flex items-center gap-1.5">
                                <button
                                    v-for="s in ['online', 'away', 'busy', 'offline']"
                                    :key="s"
                                    type="button"
                                    @click="emit('change-status', s)"
                                    class="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 cursor-pointer"
                                    :class="[
                                        s === 'online' ? 'bg-emerald-500' : (s === 'away' ? 'bg-amber-400' : (s === 'busy' ? 'bg-rose-500' : 'bg-slate-400')),
                                        status === s ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
                                    ]"
                                    :title="`Ubah ke ${s}`"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Custom or Prop-driven Menu Items -->
                    <div class="p-1.5 space-y-0.5">
                        <slot name="menu" :close="() => isDropdownOpen = false">
                            <template v-if="menuItems && menuItems.length > 0">
                                <template v-for="(item, idx) in menuItems" :key="idx">
                                    <div v-if="item.divider" class="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                    <button
                                        v-else
                                        type="button"
                                        @click="handleMenuItemClick(item, $event)"
                                        :disabled="item.disabled"
                                        class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer"
                                        :class="[
                                            item.danger
                                                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
                                            item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                        ]"
                                    >
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <span v-if="item.icon" class="material-symbols-outlined text-base shrink-0">
                                                {{ item.icon }}
                                            </span>
                                            <span class="truncate">{{ item.label }}</span>
                                        </div>
                                        <span v-if="item.badge" class="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                            {{ item.badge }}
                                        </span>
                                    </button>
                                </template>
                            </template>

                            <!-- Default Fallback Menu -->
                            <template v-else>
                                <button
                                    type="button"
                                    @click="isDropdownOpen = false"
                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <span class="material-symbols-outlined text-base">person</span>
                                    <span>Profil Saya</span>
                                </button>
                                <button
                                    type="button"
                                    @click="isDropdownOpen = false"
                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <span class="material-symbols-outlined text-base">settings</span>
                                    <span>Pengaturan Akun</span>
                                </button>
                                <button
                                    type="button"
                                    @click="isDropdownOpen = false"
                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <span class="material-symbols-outlined text-base">receipt_long</span>
                                    <span>Billing & Transaksi</span>
                                </button>
                                <div class="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                <button
                                    type="button"
                                    @click="isDropdownOpen = false"
                                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer font-semibold"
                                >
                                    <span class="material-symbols-outlined text-base">logout</span>
                                    <span>Keluar (Log Out)</span>
                                </button>
                            </template>
                        </slot>
                    </div>
                </slot>
            </div>
        </Transition>
    </div>
</template>
