<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useClickOutside } from '../../Composables/Pack/useClickOutside';

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

    // 5 Dimensi Desain Paten Proyek
    design: {
        type: String,
        default: 'default', // 'default', 'minimal', 'bordered', 'floating', 'modern'
        validator: (val) => ['default', 'minimal', 'bordered', 'floating', 'modern'].includes(val),
    },
    style: {
        type: String,
        default: undefined, // 'solid', 'soft', 'outline', 'pill', 'default', 'gradient', 'glass'
    },
    radius: {
        type: String,
        default: undefined, // 'full', 'xl', 'lg', 'md', 'sm', 'none', 'squircle', 'pill'
    },
    isLog: {
        type: Boolean,
        default: false,
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
    'log',
]);

// Telemetri Logging Helper
const emitLog = (eventName, detail, level = 'info') => {
    if (!props.isLog) return;
    const payload = {
        component: 'Avatar',
        event: eventName,
        detail,
        level,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
    };
    if (typeof console !== 'undefined' && console[level]) {
        console[level](`[Pack UI][Avatar] @${eventName} -> ${detail}`);
    }
    emit('log', payload);
};

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
        soft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    primary: {
        gradient: 'from-blue-600 to-indigo-600 text-white',
        soft: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    },
    indigo: {
        gradient: 'from-indigo-600 to-purple-600 text-white',
        soft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    emerald: {
        gradient: 'from-emerald-500 to-teal-600 text-white',
        soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    purple: {
        gradient: 'from-purple-600 to-pink-600 text-white',
        soft: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    },
    amber: {
        gradient: 'from-amber-500 to-orange-600 text-white',
        soft: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    },
    rose: {
        gradient: 'from-rose-500 to-red-600 text-white',
        soft: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    cyan: {
        gradient: 'from-cyan-500 to-blue-600 text-white',
        soft: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
    },
    dark: {
        gradient: 'from-zinc-800 to-black text-white',
        soft: 'bg-slate-800 text-slate-200 dark:bg-zinc-800 dark:text-zinc-200',
    },
};

const resolvedRadius = computed(() => props.radius || props.rounded);
const resolvedVariant = computed(() => {
    if (props.style) {
        if (props.style === 'solid') return 'default';
        return props.style;
    }
    return props.variant;
});
const resolvedColorTheme = computed(() => {
    if (props.color && ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(props.color)) {
        return props.color;
    }
    return props.colorTheme;
});

const currentTheme = computed(() => themePresets[resolvedColorTheme.value] || themePresets.default);

const designClass = computed(() => {
    switch (props.design) {
        case 'minimal':
            return 'shadow-none ring-0';
        case 'bordered':
            return 'ring-2 ring-slate-300 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900';
        case 'floating':
            return 'shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:shadow-xl transition-shadow';
        case 'modern':
            return 'ring-2 ring-primary-500/40 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 shadow-sm';
        case 'default':
        default:
            return '';
    }
});

const hashColor = computed(() => {
    if (props.color && props.color.startsWith('#')) return props.color;
    if (resolvedColorTheme.value !== 'default') {
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

// Sizing metrics (Minimalis, Kompak & Ramping sesuai REQUEST.md)
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                container: 'w-6 h-6',
                text: 'text-[10px] font-semibold',
                icon: 'text-[13px]',
                dot: 'w-1.5 h-1.5',
                border: 'ring-1.5',
                badge: 'min-w-3 h-3 px-0.5 text-[8px]',
                verified: 'w-2.5 h-2.5',
                verifiedIcon: 'w-3 h-3',
                nameText: 'text-xs font-semibold',
                subText: 'text-[10px]',
                infoGap: 'gap-1.5',
                dotOffset: getDotOffset('xs'),
            };
        case 'sm':
            return {
                container: 'w-8 h-8',
                text: 'text-xs font-semibold',
                icon: 'text-[16px]',
                dot: 'w-2 h-2',
                border: 'ring-1.5',
                badge: 'min-w-3.5 h-3.5 px-0.5 text-[9px]',
                verified: 'w-3 h-3',
                verifiedIcon: 'w-3 h-3',
                nameText: 'text-xs font-semibold',
                subText: 'text-[11px]',
                infoGap: 'gap-2',
                dotOffset: getDotOffset('sm'),
            };
        case 'lg':
            return {
                container: 'w-12 h-12',
                text: 'text-sm font-semibold',
                icon: 'text-[24px]',
                dot: 'w-2.5 h-2.5',
                border: 'ring-2',
                badge: 'min-w-4.5 h-4.5 px-1 text-[10px]',
                verified: 'w-3.5 h-3.5',
                verifiedIcon: 'w-3.5 h-3.5',
                nameText: 'text-sm font-semibold',
                subText: 'text-xs',
                infoGap: 'gap-2',
                dotOffset: getDotOffset('lg'),
            };
        case 'xl':
            return {
                container: 'w-16 h-16',
                text: 'text-base font-semibold',
                icon: 'text-[30px]',
                dot: 'w-3 h-3',
                border: 'ring-2',
                badge: 'min-w-5 h-5 px-1 text-xs',
                verified: 'w-4 h-4',
                verifiedIcon: 'w-4 h-4',
                nameText: 'text-base font-semibold',
                subText: 'text-xs',
                infoGap: 'gap-2.5',
                dotOffset: getDotOffset('xl'),
            };
        case '2xl':
            return {
                container: 'w-20 h-20',
                text: 'text-xl font-semibold',
                icon: 'text-[38px]',
                dot: 'w-3.5 h-3.5',
                border: 'ring-2.5',
                badge: 'min-w-6 h-6 px-1.5 text-xs',
                verified: 'w-5 h-5',
                verifiedIcon: 'w-5 h-5',
                nameText: 'text-lg font-semibold',
                subText: 'text-sm',
                infoGap: 'gap-3',
                dotOffset: getDotOffset('2xl'),
            };
        case '3xl':
            return {
                container: 'w-26 h-26',
                text: 'text-2xl font-bold',
                icon: 'text-[48px]',
                dot: 'w-4 h-4',
                border: 'ring-3',
                badge: 'min-w-7 h-7 px-2 text-sm',
                verified: 'w-6 h-6',
                verifiedIcon: 'w-6 h-6',
                nameText: 'text-xl font-bold',
                subText: 'text-sm',
                infoGap: 'gap-3.5',
                dotOffset: getDotOffset('3xl'),
            };
        case 'md':
        default:
            return {
                container: 'w-10 h-10',
                text: 'text-sm font-semibold',
                icon: 'text-[19px]',
                dot: 'w-2 h-2',
                border: 'ring-2',
                badge: 'min-w-4 h-4 px-1 text-[10px]',
                verified: 'w-3.5 h-3.5',
                verifiedIcon: 'w-3.5 h-3.5',
                nameText: 'text-sm font-semibold',
                subText: 'text-xs',
                infoGap: 'gap-2',
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
    }
    return `${y} ${x}`;
}

const roundedClass = computed(() => {
    const r = resolvedRadius.value;
    switch (r) {
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'squircle': return 'rounded-2xl';
        case 'none': return 'rounded-none';
        case 'full':
        case 'pill':
        default: return 'rounded-full';
    }
});

// Story Ring Classes (Ramping tanpa ring ganda)
const storyClass = computed(() => {
    switch (props.story) {
        case 'gradient':
        case 'unread':
            return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600';
        case 'emerald':
            return 'bg-emerald-500';
        case 'live':
            return 'bg-rose-600 animate-pulse';
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
    emitLog('error', 'URL foto profil gagal dimuat', 'warn');
};

const handleAvatarClick = (e) => {
    if (e) {
        e.stopPropagation();
    }
    if (props.dropdown) {
        isDropdownOpen.value = !isDropdownOpen.value;
        emit('toggle-dropdown', isDropdownOpen.value);
        emitLog('toggle-dropdown', isDropdownOpen.value ? 'Dropdown dibuka' : 'Dropdown ditutup');
    }
    if (props.clickable || props.dropdown) {
        emit('click', e);
        emitLog('click', `Avatar ${props.name || 'Anonymous'} diklik`);
    }
};

const handleMenuItemClick = (item, e) => {
    if (item.disabled) return;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (item.action) item.action(e);
    emit('menu-click', item);
    emitLog('menu-click', `Menu "${item.label}" dipilih`);
    isDropdownOpen.value = false;
};

const handleChangeStatus = (statusKey, e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    emit('change-status', statusKey);
    emitLog('change-status', `Status diubah ke: ${statusKey}`);
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
        class="relative inline-flex items-center select-none"
        :class="[
            sizeClasses.infoGap,
            (clickable || dropdown) ? 'cursor-pointer focus:outline-hidden' : '',
        ]"
        :role="(clickable || dropdown) ? 'button' : undefined"
        :tabindex="(clickable || dropdown) ? 0 : undefined"
        :aria-haspopup="dropdown ? 'menu' : undefined"
        :aria-expanded="dropdown ? isDropdownOpen : undefined"
        @keydown.enter="handleAvatarClick"
        @keydown.space.prevent="handleAvatarClick"
    >
        <!-- Story Ring Container (if story !== 'none') -->
        <div
            class="relative inline-flex items-center justify-center shrink-0 transition-transform duration-200"
            :class="[
                story !== 'none' ? `p-0.5 ${storyClass} ${roundedClass}` : '',
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
                    designClass,
                    border ? `${sizeClasses.border} ring-white dark:ring-slate-900 shadow-xs` : '',
                    story !== 'none' ? 'border-[1.5px] border-white dark:border-slate-900' : '',
                    resolvedVariant === 'glass' ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800/60' : '',
                    resolvedVariant === 'outline' ? 'border-2 border-primary-500 bg-transparent text-primary-600 dark:text-primary-400' : '',
                    resolvedVariant === 'soft' && !showImage ? currentTheme.soft : '',
                    showImage ? 'bg-slate-100 dark:bg-slate-800' : (isCustomColor ? '' : (showInitials ? (resolvedVariant === 'soft' ? currentTheme.soft : hashColor) : 'bg-slate-200 dark:bg-slate-700')),
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
                    class="leading-none select-none tracking-normal font-semibold flex items-center justify-center"
                    :class="sizeClasses.text"
                >
                    {{ initials }}
                </span>

                <!-- 3. Icon Fallback -->
                <span
                    v-else
                    class="material-symbols-outlined text-slate-400 dark:text-slate-500 leading-none select-none flex items-center justify-center shrink-0"
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
                class="absolute block rounded-full ring-1.5 ring-white dark:ring-slate-900 z-10 shadow-xs pointer-events-none"
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

            <!-- 5. Verified Official Badge (only when not showInfo to prevent duplication) -->
            <span
                v-if="verified && !showInfo"
                class="absolute -bottom-0.5 -right-0.5 z-10 flex items-center justify-center rounded-full bg-blue-500 text-white ring-1.5 ring-white dark:ring-slate-900 shadow-xs pointer-events-none"
                :class="sizeClasses.verified"
                title="Verified Official"
            >
                <svg class="w-3/5 h-3/5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="2.5 6 4.5 8.5 9.5 3.5"></polyline>
                </svg>
            </span>

            <!-- 6. Counter / Text Badge (e.g. '3', 'VIP') -->
            <span
                v-if="badge"
                class="absolute -top-1 -right-1 z-10 inline-flex items-center justify-center font-bold tracking-tight rounded-full ring-1.5 ring-white dark:ring-slate-900 shadow-xs pointer-events-none text-white select-none"
                :class="[
                    sizeClasses.badge,
                    badgeColor || 'bg-rose-500'
                ]"
            >
                {{ badge }}
            </span>

            <!-- 7. LIVE Badge on Story -->
            <span
                v-if="story === 'live'"
                class="absolute -bottom-1 inset-x-0 mx-auto w-fit z-10 px-1 py-0.2 rounded-xs bg-rose-600 text-white font-bold text-[7px] tracking-wider uppercase shadow-xs pointer-events-none leading-none"
            >
                LIVE
            </span>
        </div>

        <!-- USER INFO TEXT (showInfo === true) -->
        <div
            v-if="showInfo"
            class="min-w-0 flex flex-col justify-center text-left m-0 p-0 leading-tight"
            :class="(clickable || dropdown) ? 'cursor-pointer' : ''"
            @click="handleAvatarClick"
        >
            <div class="flex items-center gap-1 leading-none m-0 p-0">
                <span class="text-slate-900 dark:text-white truncate font-semibold m-0 p-0" :class="sizeClasses.nameText">
                    {{ name || 'Pengguna' }}
                </span>
                <svg
                    v-if="verified"
                    class="text-blue-500 shrink-0 inline-block drop-shadow-2xs"
                    :class="sizeClasses.verifiedIcon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-label="Terverifikasi"
                >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div
                v-if="subtext"
                class="text-slate-400 dark:text-slate-500 truncate leading-none mt-1 m-0 p-0"
                :class="sizeClasses.subText"
            >
                {{ subtext }}
            </div>
        </div>

        <!-- DROPDOWN ARROW INDICATOR (if dropdown === true) -->
        <span
            v-if="dropdown"
            class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[16px] transition-transform duration-200 cursor-pointer -ml-0.5 leading-none shrink-0"
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
                class="absolute top-full mt-1 w-52 z-50 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-900/10 dark:shadow-black/50 overflow-hidden select-none text-xs m-0 p-0"
                :class="dropdownAlignClass"
            >
                <!-- Custom Dropdown Slot -->
                <slot name="dropdown" :close="() => isDropdownOpen = false">
                    <!-- Default Profile Card Header -->
                    <div class="p-2 bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 m-0">
                        <div class="flex items-center gap-2 m-0 p-0">
                            <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-[11px] text-slate-800 dark:text-white leading-none">
                                <img v-if="showImage" :src="src" :alt="alt || name" class="w-full h-full object-cover" />
                                <span v-else-if="name">{{ initials }}</span>
                                <span v-else class="material-symbols-outlined text-[15px] select-none leading-none shrink-0 flex items-center justify-center">person</span>
                            </div>
                            <div class="min-w-0 flex-1 leading-none m-0 p-0">
                                <div class="flex items-center gap-1 leading-none m-0 p-0">
                                    <div class="font-semibold text-slate-900 dark:text-white text-xs truncate m-0 p-0 leading-none">{{ name || 'Pengguna' }}</div>
                                    <svg v-if="verified" class="w-3 h-3 text-blue-500 shrink-0 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 m-0 p-0 leading-none">{{ subtext || 'user@example.com' }}</div>
                            </div>
                        </div>

                        <!-- Status Quick Switcher -->
                        <div class="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between m-0">
                            <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-none m-0 p-0">Status:</span>
                            <div class="inline-flex items-center gap-1 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 m-0">
                                <button
                                    v-for="s in [
                                        { key: 'online', color: 'bg-emerald-500', label: 'Online' },
                                        { key: 'away', color: 'bg-amber-400', label: 'Away' },
                                        { key: 'busy', color: 'bg-rose-500', label: 'Busy' },
                                        { key: 'offline', color: 'bg-slate-400', label: 'Offline' },
                                    ]"
                                    :key="s.key"
                                    type="button"
                                    @click.prevent.stop="handleChangeStatus(s.key, $event)"
                                    class="relative flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all cursor-pointer m-0 p-0"
                                    :class="status === s.key ? 'bg-white dark:bg-slate-700 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-600 scale-110' : 'opacity-60 hover:opacity-100'"
                                    :title="s.label"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full" :class="s.color" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="p-1 space-y-0.5 m-0">
                        <slot name="menu" :close="() => isDropdownOpen = false">
                            <template v-if="menuItems && menuItems.length > 0">
                                <template v-for="(item, idx) in menuItems" :key="idx">
                                    <div v-if="item.divider" class="h-px bg-slate-100 dark:bg-slate-800 my-0.5 mx-1" />
                                    <button
                                        v-else
                                        type="button"
                                        @click.prevent.stop="handleMenuItemClick(item, $event)"
                                        :disabled="item.disabled"
                                        class="w-full flex items-center justify-between px-2 py-1 rounded-md text-left transition-colors cursor-pointer group m-0"
                                        :class="[
                                            item.danger
                                                 ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                                 : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
                                            item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                        ]"
                                    >
                                        <div class="flex items-center gap-1.5 min-w-0 leading-none">
                                            <span v-if="item.icon" class="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0 leading-none">
                                                {{ item.icon }}
                                            </span>
                                            <span class="truncate font-normal leading-none">{{ item.label }}</span>
                                        </div>
                                        <span v-if="item.badge" class="px-1.5 py-0.2 rounded-xs text-[9px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 leading-none">
                                            {{ item.badge }}
                                        </span>
                                    </button>
                                </template>
                            </template>

                            <!-- Default Fallback Menu -->
                            <template v-else>
                                <button
                                    type="button"
                                    @click.prevent.stop="isDropdownOpen = false"
                                    class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group m-0 leading-none text-xs"
                                >
                                    <span class="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0 leading-none">person</span>
                                    <span class="font-normal leading-none">Profil Saya</span>
                                </button>
                                <button
                                    type="button"
                                    @click.prevent.stop="isDropdownOpen = false"
                                    class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group m-0 leading-none text-xs"
                                >
                                    <span class="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0 leading-none">settings</span>
                                    <span class="font-normal leading-none">Pengaturan Akun</span>
                                </button>
                                <button
                                    type="button"
                                    @click.prevent.stop="isDropdownOpen = false"
                                    class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group m-0 leading-none text-xs"
                                >
                                    <span class="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0 leading-none">receipt_long</span>
                                    <span class="font-normal leading-none">Billing & Transaksi</span>
                                </button>
                                <div class="h-px bg-slate-100 dark:bg-slate-800 my-0.5 mx-1" />
                                <button
                                    type="button"
                                    @click.prevent.stop="isDropdownOpen = false"
                                    class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer group m-0 leading-none text-xs font-normal"
                                >
                                    <span class="material-symbols-outlined text-[15px] text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0 leading-none">logout</span>
                                    <span class="leading-none">Keluar</span>
                                </button>
                            </template>
                        </slot>
                    </div>
                </slot>
            </div>
        </Transition>
    </div>
</template>
