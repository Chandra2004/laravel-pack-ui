<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
import { useClickOutside } from '@/Composables/Pack/useClickOutside';
import { useClipboard } from '@/Composables/Pack/useClipboard';

const props = defineProps({
    /**
     * Tipe CTA Button:
     * - 'direct': Tombol tunggal sekali tekan langsung aksi
     * - 'split': Tombol split (kiri aksi utama, kanan chevron toggle daftar aksi anak)
     * - 'menu': Tombol menu yang saat ditekan memunculkan popover daftar aksi anak (children)
     * - 'fab': Speed-dial floating action button yang memunculkan deretan aksi anak melayang
     * - 'hold': Tombol tahan (long-press) untuk konfirmasi aksi penting
     * - 'copy': Tombol sekali klik salin ke clipboard dengan feedback visual
     * - 'whatsapp': Tombol / Widget melayang WhatsApp dengan speech bubble & auto-redirect chat
     * - 'to-top': Tombol melayang kembali ke atas (scroll to top) dengan auto-show saat scroll
     */
    type: {
        type: String,
        default: 'direct',
        validator: (v) => ['direct', 'split', 'menu', 'fab', 'hold', 'copy', 'whatsapp', 'to-top'].includes(v),
    },
    // Pilar 1: Warna
    colorTheme: {
        type: String,
        default: 'emerald',
        validator: (v) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    /**
     * Varian gaya visual CTA
     */
    variant: {
        type: String,
        default: 'primary',
        validator: (v) => [
            'primary',
            'gradient',
            'glow',
            'shine',
            'secondary',
            'danger',
            'success',
            'warning',
            'dark',
            'outline',
            'soft',
        ].includes(v),
    },
    /**
     * Ukuran tombol
     */
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
    },
    /**
     * Kelengkungan sudut border
     */
    rounded: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    /**
     * Elemen HTML / Inertia Link
     */
    as: {
        type: String,
        default: 'button',
        validator: (v) => ['button', 'Link', 'a'].includes(v),
    },
    /**
     * URL tujuan jika as='a' atau as='Link'
     */
    href: {
        type: String,
        default: null,
    },
    /**
     * Teks utama label tombol
     */
    label: {
        type: String,
        default: '',
    },
    /**
     * Teks pendukung kecil di bawah label (cocok untuk CTA marketing/konversi)
     */
    sublabel: {
        type: String,
        default: '',
    },
    /**
     * Nama icon Google Material Symbols utama
     */
    icon: {
        type: String,
        default: '',
    },
    /**
     * Posisi icon terhadap label
     */
    iconPosition: {
        type: String,
        default: 'left',
        validator: (v) => ['left', 'right'].includes(v),
    },
    /**
     * Icon trailing opsional (misal: panah ke kanan 'arrow_forward')
     */
    trailingIcon: {
        type: String,
        default: '',
    },
    /**
     * Daftar aksi anak (child actions) untuk tipe 'split', 'menu', dan 'fab'
     */
    children: {
        type: Array,
        default: () => [],
    },
    /**
     * Posisi alignment dropdown menu ('left' atau 'right')
     */
    menuAlign: {
        type: String,
        default: 'right',
        validator: (v) => ['left', 'right'].includes(v),
    },
    /**
     * Posisi vertikal dropdown menu ('bottom' atau 'top')
     */
    menuPosition: {
        type: String,
        default: 'bottom',
        validator: (v) => ['bottom', 'top'].includes(v),
    },
    /**
     * Posisi Floating Button (untuk type='fab', 'whatsapp', 'to-top')
     */
    fabPosition: {
        type: String,
        default: 'inline',
        validator: (v) => ['inline', 'bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left'].includes(v),
    },
    /**
     * Apakah tombol dalam status loading
     */
    loading: {
        type: Boolean,
        default: false,
    },
    /**
     * Teks saat tombol loading
     */
    loadingText: {
        type: String,
        default: '',
    },
    /**
     * Status nonaktif tombol
     */
    disabled: {
        type: Boolean,
        default: false,
    },
    /**
     * Efek diffuse glowing aura di belakang tombol
     */
    glow: {
        type: Boolean,
        default: false,
    },
    /**
     * Efek kilatan cahaya bergerak (animated shine sweep)
     */
    shine: {
        type: Boolean,
        default: false,
    },
    /**
     * Efek detak pulsasi halus terus menerus untuk menarik perhatian
     */
    pulse: {
        type: Boolean,
        default: false,
    },
    /**
     * Efek riak air (ripple ink) saat tombol diklik
     */
    ripple: {
        type: Boolean,
        default: true,
    },
    /**
     * Durasi tahan untuk type='hold' (dalam milidetik)
     */
    holdDuration: {
        type: Number,
        default: 1500,
    },
    holdText: {
        type: String,
        default: 'Tahan...',
    },
    holdSuccessText: {
        type: String,
        default: 'Berhasil!',
    },
    /**
     * Fitur Type 'copy'
     */
    copyText: {
        type: String,
        default: '',
    },
    copiedText: {
        type: String,
        default: 'Tersalin!',
    },
    closeOnClick: {
        type: Boolean,
        default: true,
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    // ==========================================
    // Fitur Khusus: WhatsApp CTA ('whatsapp')
    // ==========================================
    phone: {
        type: String,
        default: '628123456789',
    },
    whatsappMessage: {
        type: String,
        default: 'Halo, saya ingin bertanya seputar layanan payment gateway.',
    },
    whatsappBubbleText: {
        type: String,
        default: 'Ada yang bisa kami bantu? Chat kami di WhatsApp!',
    },
    whatsappStatus: {
        type: String,
        default: 'Online',
    },
    showBubble: {
        type: Boolean,
        default: true,
    },
    // ==========================================
    // Fitur Khusus: Back to Top ('to-top')
    // ==========================================
    scrollThreshold: {
        type: Number,
        default: 200,
    },
    showProgress: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    'click',
    'child-click',
    'hold-complete',
    'hold-start',
    'hold-cancel',
    'copy',
    'open',
    'close',
    'to-top',
]);

// Refs & State
const containerRef = ref(null);
const isOpen = ref(false);
const isHolding = ref(false);
const holdProgress = ref(0);
const holdCompleted = ref(false);
const ripples = ref([]);
const isBubbleVisible = ref(props.showBubble);
const isScrolledPast = ref(false);
const scrollPercentage = ref(0);
let holdAnimationId = null;
let holdStartTime = null;

// Composables
const { copy: execCopy, copied: isCopied } = useClipboard({ timeout: 2000 });

// Click Outside Hook
useClickOutside(containerRef, () => {
    if (isOpen.value) {
        closeMenu();
    }
});

// Scroll Event Handler untuk type='to-top'
const handleWindowScroll = () => {
    if (typeof window === 'undefined') return;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    isScrolledPast.value = currentScroll > props.scrollThreshold;

    if (props.showProgress) {
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollPercentage.value = totalHeight > 0 ? Math.min(100, Math.round((currentScroll / totalHeight) * 100)) : 0;
    }
};

onMounted(() => {
    if (props.type === 'to-top') {
        window.addEventListener('scroll', handleWindowScroll, { passive: true });
        handleWindowScroll();
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleWindowScroll);
    }
    if (holdAnimationId) {
        cancelAnimationFrame(holdAnimationId);
    }
});

const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
    emit('to-top');
};

// WhatsApp Direct Link Builder
const openWhatsAppChat = () => {
    if (typeof window === 'undefined') return;
    const cleanPhone = String(props.phone).replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(props.whatsappMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
};

// Computed Properties
const isDisabled = computed(() => props.disabled || props.loading);

const tag = computed(() => {
    if (props.as === 'Link') return Link;
    if (props.as === 'a') return 'a';
    return 'button';
});

// Size Mapping
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                btn: 'px-2.5 py-1 text-[11px] gap-1 min-h-7',
                icon: 'text-[14px]',
                sublabel: 'text-[9px]',
                splitToggle: 'px-1.5 min-h-7',
                fab: 'w-9 h-9 text-xs',
                fabChild: 'w-8 h-8 text-xs',
            };
        case 'sm':
            return {
                btn: 'px-3.5 py-1.5 text-xs gap-1.5 min-h-8',
                icon: 'text-[16px]',
                sublabel: 'text-[10px]',
                splitToggle: 'px-2 min-h-8',
                fab: 'w-11 h-11 text-xs',
                fabChild: 'w-9 h-9 text-xs',
            };
        case 'lg':
            return {
                btn: 'px-6 py-3.5 text-base gap-2.5 min-h-12 font-medium',
                icon: 'text-[22px]',
                sublabel: 'text-xs',
                splitToggle: 'px-3.5 min-h-12',
                fab: 'w-14 h-14 text-base',
                fabChild: 'w-11 h-11 text-sm',
            };
        case 'xl':
            return {
                btn: 'px-8 py-4 text-lg gap-3 min-h-14 font-semibold',
                icon: 'text-[26px]',
                sublabel: 'text-xs',
                splitToggle: 'px-4 min-h-14',
                fab: 'w-16 h-16 text-lg',
                fabChild: 'w-12 h-12 text-base',
            };
        case 'md':
        default:
            return {
                btn: 'px-5 py-2.5 text-sm gap-2 min-h-10 font-medium',
                icon: 'text-[18px]',
                sublabel: 'text-[11px]',
                splitToggle: 'px-2.5 min-h-10',
                fab: 'w-12 h-12 text-sm',
                fabChild: 'w-10 h-10 text-xs',
            };
    }
});

// Rounded Mapping
const roundedClasses = computed(() => {
    switch (props.rounded) {
        case 'none':
            return 'rounded-none';
        case 'sm':
            return 'rounded-sm';
        case 'md':
            return 'rounded-md';
        case 'lg':
            return 'rounded-lg';
        case '2xl':
            return 'rounded-2xl';
        case '3xl':
            return 'rounded-3xl';
        case 'full':
            return 'rounded-full';
        case 'xl':
        case 'default':
        default:
            return 'rounded-xl';
    }
});

// Pilar 1: Theme Gradient & Solid Presets
const themePresets = computed(() => {
    const map = {
        primary: {
            primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs border border-transparent focus-visible:ring-blue-500',
            gradient: 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white shadow-sm border border-transparent focus-visible:ring-blue-500',
            glow: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 border border-transparent focus-visible:ring-blue-400',
            glowAura: 'from-blue-500/30 to-indigo-500/30',
            soft: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 focus-visible:ring-blue-400',
        },
        indigo: {
            primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs border border-transparent focus-visible:ring-indigo-500',
            gradient: 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-sm border border-transparent focus-visible:ring-indigo-500',
            glow: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 border border-transparent focus-visible:ring-indigo-400',
            glowAura: 'from-indigo-500/30 to-purple-500/30',
            soft: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 focus-visible:ring-indigo-400',
        },
        emerald: {
            primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs border border-transparent focus-visible:ring-emerald-500',
            gradient: 'bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white shadow-sm border border-transparent focus-visible:ring-emerald-500',
            glow: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-transparent focus-visible:ring-emerald-400',
            glowAura: 'from-emerald-500/30 to-teal-500/30',
            soft: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 focus-visible:ring-emerald-400',
        },
        purple: {
            primary: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs border border-transparent focus-visible:ring-purple-500',
            gradient: 'bg-linear-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white shadow-sm border border-transparent focus-visible:ring-purple-500',
            glow: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 border border-transparent focus-visible:ring-purple-400',
            glowAura: 'from-purple-500/30 to-fuchsia-500/30',
            soft: 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 focus-visible:ring-purple-400',
        },
        amber: {
            primary: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs border border-transparent focus-visible:ring-amber-500',
            gradient: 'bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white shadow-sm border border-transparent focus-visible:ring-amber-500',
            glow: 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20 border border-transparent focus-visible:ring-amber-400',
            glowAura: 'from-amber-500/30 to-orange-500/30',
            soft: 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50 focus-visible:ring-amber-400',
        },
        rose: {
            primary: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs border border-transparent focus-visible:ring-rose-500',
            gradient: 'bg-linear-to-r from-rose-600 via-pink-600 to-orange-500 hover:from-rose-500 hover:via-pink-500 hover:to-orange-400 text-white shadow-sm border border-transparent focus-visible:ring-rose-500',
            glow: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 border border-transparent focus-visible:ring-rose-400',
            glowAura: 'from-rose-500/30 to-pink-500/30',
            soft: 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50 focus-visible:ring-rose-400',
        },
        cyan: {
            primary: 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white shadow-xs border border-transparent focus-visible:ring-cyan-500',
            gradient: 'bg-linear-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:via-teal-500 hover:to-blue-500 text-white shadow-sm border border-transparent focus-visible:ring-cyan-500',
            glow: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 border border-transparent focus-visible:ring-cyan-400',
            glowAura: 'from-cyan-500/30 to-blue-500/30',
            soft: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50 focus-visible:ring-cyan-400',
        },
        dark: {
            primary: 'bg-slate-900 hover:bg-black active:bg-slate-950 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 shadow-xs border border-transparent focus-visible:ring-slate-400',
            gradient: 'bg-linear-to-r from-slate-900 via-slate-800 to-slate-950 hover:from-slate-800 hover:to-black text-white dark:from-slate-100 dark:to-slate-300 dark:text-slate-900 shadow-sm border border-transparent focus-visible:ring-slate-400',
            glow: 'bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20 dark:shadow-white/10 border border-transparent focus-visible:ring-slate-400',
            glowAura: 'from-slate-700/30 to-slate-900/30',
            soft: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
        },
    };
    return map[props.colorTheme] || map.emerald;
});

// Variant Style Mapping
const variantClasses = computed(() => {
    // Override khusus WhatsApp
    if (props.type === 'whatsapp') {
        return 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40 focus-visible:ring-emerald-400';
    }

    const t = themePresets.value;
    switch (props.variant) {
        case 'gradient':
            return t.gradient;
        case 'glow':
            return t.glow;
        case 'shine':
            return t.primary;
        case 'secondary':
            return 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs border border-slate-700 dark:border-slate-600 focus-visible:ring-slate-500';
        case 'danger':
            return 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-500/40 focus-visible:ring-rose-500';
        case 'success':
            return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/40 focus-visible:ring-emerald-500';
        case 'warning':
            return 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 border border-amber-400/40 focus-visible:ring-amber-500';
        case 'dark':
            return 'bg-slate-950 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 shadow-md border border-slate-800 dark:border-slate-200 focus-visible:ring-slate-400';
        case 'outline':
            return 'border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs focus-visible:ring-slate-400';
        case 'soft':
            return t.soft;
        case 'primary':
        default:
            return t.primary;
    }
});

// Dropdown Menu Classes
const menuPositionClasses = computed(() => {
    const isTop = props.menuPosition === 'top';
    const isLeft = props.menuAlign === 'left';
    return [
        isTop ? 'bottom-full mb-2' : 'top-full mt-2',
        isLeft ? 'left-0 origin-top-left' : 'right-0 origin-top-right',
    ].join(' ');
});

// FAB / WhatsApp / To-Top Floating Position Classes
const fabFloatingClasses = computed(() => {
    switch (props.fabPosition) {
        case 'bottom-right':
            return 'fixed bottom-6 right-6 z-40';
        case 'bottom-left':
            return 'fixed bottom-6 left-6 z-40';
        case 'bottom-center':
            return 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40';
        case 'top-right':
            return 'fixed top-6 right-6 z-40';
        case 'top-left':
            return 'fixed top-6 left-6 z-40';
        case 'inline':
        default:
            return 'relative inline-block';
    }
});

// Ripple Effect Handler
const handleRipple = (e) => {
    if (!props.ripple || isDisabled.value) return;
    const button = e.currentTarget;
    if (!button || !button.getBoundingClientRect) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();

    ripples.value.push({ id, x, y, size });

    setTimeout(() => {
        ripples.value = ripples.value.filter((r) => r.id !== id);
    }, 600);
};

// Main Click Handler
const handleClick = (e) => {
    if (isDisabled.value) {
        e.preventDefault();
        return;
    }

    handleRipple(e);

    if (props.type === 'copy') {
        const textToCopy = props.copyText || props.label;
        if (textToCopy) {
            execCopy(textToCopy);
            emit('copy', textToCopy);
        }
        emit('click', e);
        return;
    }

    if (props.type === 'whatsapp') {
        openWhatsAppChat();
        emit('click', e);
        return;
    }

    if (props.type === 'to-top') {
        scrollToTop();
        return;
    }

    if (props.type === 'menu' || props.type === 'fab') {
        toggleMenu();
        emit('click', e);
        return;
    }

    if (props.type === 'hold') {
        return;
    }

    emit('click', e);
};

// Split Chevron Click Handler
const handleSplitToggle = (e) => {
    e.stopPropagation();
    if (isDisabled.value) return;
    toggleMenu();
};

// Menu Visibility Toggles
const toggleMenu = () => {
    if (isOpen.value) {
        closeMenu();
    } else {
        openMenu();
    }
};

const openMenu = () => {
    if (isDisabled.value || isOpen.value) return;
    isOpen.value = true;
    emit('open');
};

const closeMenu = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    emit('close');
};

// Child Action Click Handler
const handleChildClick = (child, event) => {
    if (child.disabled) {
        event?.preventDefault();
        return;
    }

    if (typeof child.action === 'function') {
        child.action(child, event);
    }

    emit('child-click', child, event);

    if (props.closeOnClick && !child.href) {
        closeMenu();
    }
};

// Hold Button Logic (Long Press)
const startHold = () => {
    if (isDisabled.value || props.type !== 'hold' || holdCompleted.value) return;
    isHolding.value = true;
    holdStartTime = performance.now();
    emit('hold-start');

    const updateProgress = (now) => {
        if (!isHolding.value) return;
        const elapsed = now - holdStartTime;
        const progress = Math.min(100, (elapsed / props.holdDuration) * 100);
        holdProgress.value = progress;

        if (progress >= 100) {
            triggerHoldComplete();
        } else {
            holdAnimationId = requestAnimationFrame(updateProgress);
        }
    };

    holdAnimationId = requestAnimationFrame(updateProgress);
};

const cancelHold = () => {
    if (!isHolding.value || holdCompleted.value) return;
    isHolding.value = false;
    if (holdAnimationId) {
        cancelAnimationFrame(holdAnimationId);
        holdAnimationId = null;
    }
    holdProgress.value = 0;
    emit('hold-cancel');
};

const triggerHoldComplete = () => {
    isHolding.value = false;
    if (holdAnimationId) {
        cancelAnimationFrame(holdAnimationId);
        holdAnimationId = null;
    }
    holdProgress.value = 100;
    holdCompleted.value = true;
    emit('hold-complete');

    setTimeout(() => {
        holdCompleted.value = false;
        holdProgress.value = 0;
    }, 1800);
};
</script>

<template>
    <!-- Container Utama -->
    <div
        ref="containerRef"
        :class="[
            type === 'fab' || type === 'whatsapp' || type === 'to-top' ? fabFloatingClasses : 'relative inline-flex',
            fullWidth ? 'w-full' : '',
        ]"
    >
        <!-- Background Glow Aura (Jika glow: true) -->
        <div
            v-if="glow && !isDisabled && type !== 'to-top'"
            :class="[
                'absolute -inset-0.5 rounded-2xl opacity-20 blur-md transition duration-300 group-hover:opacity-35 pointer-events-none bg-linear-to-r',
                themePresets.glowAura
            ]"
            aria-hidden="true"
        />

        <!-- ========================================================= -->
        <!-- 1. TIPE: WHATSAPP FLOATING CTA (WIDGET CHAT RESMI)        -->
        <!-- ========================================================= -->
        <div v-if="type === 'whatsapp'" class="flex flex-col items-end gap-2.5">
            <!-- Speech Bubble Popover (Pesan Ramah Penjual) -->
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
                <div
                    v-if="isBubbleVisible"
                    class="relative max-w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl select-none"
                >
                    <!-- Close Bubble Button -->
                    <button
                        type="button"
                        @click.stop="isBubbleVisible = false"
                        class="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5"
                        aria-label="Tutup pesan"
                    >
                        <span class="material-symbols-outlined text-sm leading-none">close</span>
                    </button>

                    <!-- Slot Kustom #bubble atau Default Teks -->
                    <slot name="bubble" :phone="phone" :status="whatsappStatus">
                        <div class="flex items-center gap-2 mb-1.5 pr-4">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span class="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Customer Support</span>
                            <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                                {{ whatsappStatus }}
                            </span>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                            {{ whatsappBubbleText }}
                        </p>
                    </slot>

                    <!-- Bubble Pointer Arrow Triangle -->
                    <div class="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-b border-r border-slate-200/80 dark:border-slate-800 rotate-45"></div>
                </div>
            </Transition>

            <!-- WhatsApp Circular Floating Trigger Button -->
            <button
                type="button"
                :disabled="isDisabled"
                :class="[
                    sizeClasses.fab,
                    'rounded-full relative flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-emerald-600/35 border-2 border-white/60 dark:border-slate-900/60 transition-all duration-300 active:scale-95 cursor-pointer',
                    pulse ? 'animate-pulse' : '',
                ]"
                @click="handleClick"
                title="Chat di WhatsApp"
                aria-label="Hubungi kami melalui WhatsApp"
            >
                <!-- SVG Ikon WhatsApp Resmi -->
                <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>

                <!-- Ping dot badge live -->
                <span class="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex h-3.5 w-3.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                </span>
            </button>
        </div>

        <!-- ========================================================= -->
        <!-- 2. TIPE: TO-TOP / BACK TO TOP FLOATING BUTTON              -->
        <!-- ========================================================= -->
        <Transition
            v-else-if="type === 'to-top'"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-4 scale-75"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 translate-y-4 scale-75"
        >
            <button
                v-show="isScrolledPast"
                type="button"
                :disabled="isDisabled"
                :class="[
                    sizeClasses.fab,
                    roundedClasses,
                    variantClasses,
                    'relative flex items-center justify-center shadow-xl cursor-pointer select-none transition-all duration-300 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2',
                ]"
                @click="handleClick"
                title="Kembali ke Atas"
                aria-label="Kembali ke atas halaman"
            >
                <!-- SVG Circular Scroll Progress Ring (Jika showProgress: true) -->
                <svg
                    v-if="showProgress"
                    class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
                    viewBox="0 0 36 36"
                >
                    <path
                        class="text-white/20 stroke-current"
                        stroke-width="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        class="text-white stroke-current transition-[stroke-dasharray] duration-150"
                        stroke-width="3"
                        stroke-dasharray="100, 100"
                        :stroke-dashoffset="100 - scrollPercentage"
                        stroke-linecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>

                <!-- Ikon Panah Ke Atas -->
                <span class="material-symbols-outlined text-xl leading-none">
                    {{ icon || 'arrow_upward' }}
                </span>
            </button>
        </Transition>

        <!-- ========================================================= -->
        <!-- 3. TIPE: FAB / SPEED DIAL FLOATING BUTTON                 -->
        <!-- ========================================================= -->
        <div v-else-if="type === 'fab'" class="flex flex-col items-center gap-3">
            <!-- Staggered Floating Child Actions Menu -->
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-4 scale-90"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-3 scale-90"
            >
                <div
                    v-if="isOpen && children.length > 0"
                    class="flex flex-col items-center gap-2.5 mb-1"
                    role="menu"
                >
                    <div
                        v-for="(child, idx) in children"
                        :key="child.id || idx"
                        class="flex items-center gap-2.5 group"
                    >
                        <!-- Floating Label / Tooltip -->
                        <span
                            v-if="child.label"
                            class="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 dark:border-slate-700 whitespace-nowrap select-none"
                        >
                            {{ child.label }}
                        </span>

                        <!-- Floating Child Circle Button -->
                        <component
                            :is="child.href ? (child.as === 'a' ? 'a' : Link) : 'button'"
                            :href="child.href"
                            type="button"
                            :disabled="child.disabled"
                            :class="[
                                sizeClasses.fabChild,
                                'rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 cursor-pointer active:scale-95',
                                child.variant === 'danger'
                                    ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500 shadow-rose-600/30'
                                    : child.variant === 'success'
                                    ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-emerald-600/30'
                                    : child.variant === 'primary'
                                    ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-blue-600/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700',
                                child.disabled ? 'opacity-50 cursor-not-allowed' : '',
                            ]"
                            @click="(e) => handleChildClick(child, e)"
                        >
                            <span v-if="child.icon" class="material-symbols-outlined text-[18px]">
                                {{ child.icon }}
                            </span>
                        </component>
                    </div>
                </div>
            </Transition>

            <!-- Tombol Pemicu Utama FAB (Floating Trigger) -->
            <button
                type="button"
                :disabled="isDisabled"
                :class="[
                    sizeClasses.fab,
                    roundedClasses,
                    variantClasses,
                    'relative flex items-center justify-center shadow-xl cursor-pointer select-none transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95',
                    pulse ? 'animate-pulse' : '',
                    isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
                ]"
                @click="handleClick"
            >
                <span
                    class="material-symbols-outlined transition-transform duration-300 select-none"
                    :class="[
                        isOpen ? 'rotate-45' : 'rotate-0',
                        size === 'lg' ? 'text-[26px]' : size === 'xl' ? 'text-[30px]' : 'text-[22px]',
                    ]"
                >
                    {{ isOpen ? 'close' : (icon || 'add') }}
                </span>
            </button>
        </div>

        <!-- ========================================================= -->
        <!-- 4. TIPE: SPLIT BUTTON CTA (AKSI UTAMA + CHEVRON DROPDOWN) -->
        <!-- ========================================================= -->
        <div
            v-else-if="type === 'split'"
            class="inline-flex items-stretch shadow-xs"
            :class="[roundedClasses, fullWidth ? 'w-full' : '']"
        >
            <!-- Tombol Aksi Kiri (Utama) -->
            <component
                :is="tag"
                :href="href"
                :disabled="isDisabled"
                :class="[
                    sizeClasses.btn,
                    roundedClasses,
                    variantClasses,
                    'relative overflow-hidden inline-flex items-center justify-center rounded-r-none border-r-0 cursor-pointer select-none transition duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99]',
                    fullWidth ? 'flex-1' : '',
                    isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
                ]"
                @click="handleClick"
            >
                <!-- Ripple Inks -->
                <span
                    v-for="r in ripples"
                    :key="r.id"
                    class="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
                    :style="{
                        top: `${r.y}px`,
                        left: `${r.x}px`,
                        width: `${r.size}px`,
                        height: `${r.size}px`,
                    }"
                />

                <!-- Loading Spinner -->
                <span
                    v-if="loading"
                    class="material-symbols-outlined animate-spin"
                    :class="sizeClasses.icon"
                >
                    progress_activity
                </span>

                <!-- Leading Icon -->
                <span
                    v-else-if="icon && iconPosition === 'left'"
                    class="material-symbols-outlined transition-transform duration-200 group-hover:scale-110"
                    :class="sizeClasses.icon"
                >
                    {{ icon }}
                </span>

                <!-- Label & Sublabel Container -->
                <div class="flex flex-col items-start leading-tight">
                    <span class="font-medium whitespace-nowrap">
                        {{ loading ? (loadingText || 'Memuat...') : label }}
                    </span>
                    <span
                        v-if="sublabel && !loading"
                        class="opacity-80 font-normal"
                        :class="sizeClasses.sublabel"
                    >
                        {{ sublabel }}
                    </span>
                </div>

                <!-- Trailing Icon -->
                <span
                    v-if="!loading && (trailingIcon || (icon && iconPosition === 'right'))"
                    class="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-0.5"
                    :class="sizeClasses.icon"
                >
                    {{ trailingIcon || icon }}
                </span>
            </component>

            <!-- Tombol Pemisah Kanan (Chevron Toggle Menu) -->
            <button
                type="button"
                :disabled="isDisabled"
                aria-haspopup="menu"
                :aria-expanded="isOpen"
                :class="[
                    sizeClasses.splitToggle,
                    roundedClasses,
                    variantClasses,
                    'relative overflow-hidden inline-flex items-center justify-center rounded-l-none border-l border-white/20 dark:border-black/20 cursor-pointer select-none transition duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 hover:bg-black/10 active:bg-black/20',
                    isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
                ]"
                @click="handleSplitToggle"
            >
                <span
                    class="material-symbols-outlined transition-transform duration-200"
                    :class="[isOpen ? 'rotate-180' : 'rotate-0', sizeClasses.icon]"
                >
                    expand_more
                </span>
            </button>
        </div>

        <!-- ========================================================= -->
        <!-- 5. TIPE: DIRECT, MENU, HOLD, COPY                         -->
        <!-- ========================================================= -->
        <component
            :is="tag"
            v-else
            :href="href"
            :disabled="isDisabled"
            :class="[
                sizeClasses.btn,
                roundedClasses,
                variantClasses,
                'relative overflow-hidden inline-flex items-center justify-center cursor-pointer select-none transition duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] group',
                fullWidth ? 'w-full' : '',
                pulse ? 'animate-pulse' : '',
                isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
                type === 'hold' ? 'select-none touch-none' : '',
            ]"
            @click="handleClick"
            @mousedown="startHold"
            @mouseup="cancelHold"
            @mouseleave="cancelHold"
            @touchstart.passive="startHold"
            @touchend.passive="cancelHold"
        >
            <!-- Background Fill Bar untuk type='hold' -->
            <div
                v-if="type === 'hold'"
                class="absolute inset-y-0 left-0 bg-white/25 dark:bg-white/20 transition-[width] duration-75 ease-linear pointer-events-none"
                :style="{ width: `${holdProgress}%` }"
                aria-hidden="true"
            />

            <!-- Ripple Inks -->
            <span
                v-for="r in ripples"
                :key="r.id"
                class="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
                :style="{
                    top: `${r.y}px`,
                    left: `${r.x}px`,
                    width: `${r.size}px`,
                    height: `${r.size}px`,
                }"
            />

            <!-- Animated Continuous Shine Effect (Jika shine: true) -->
            <div
                v-if="shine && !isDisabled"
                class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent skew-x-12 animate-[shimmer_2.5s_infinite] pointer-events-none"
                aria-hidden="true"
            />

            <!-- Slot Kustom #default (Jika disediakan) -->
            <slot v-if="$slots.default" />

            <!-- Konten Standar CTA -->
            <template v-else>
                <!-- Loading State -->
                <span
                    v-if="loading"
                    class="material-symbols-outlined animate-spin"
                    :class="sizeClasses.icon"
                >
                    progress_activity
                </span>

                <!-- Copy Success State -->
                <span
                    v-else-if="type === 'copy' && isCopied"
                    class="material-symbols-outlined text-emerald-200 animate-bounce"
                    :class="sizeClasses.icon"
                >
                    check
                </span>

                <!-- Hold Success State -->
                <span
                    v-else-if="type === 'hold' && holdCompleted"
                    class="material-symbols-outlined text-emerald-200 animate-bounce"
                    :class="sizeClasses.icon"
                >
                    check_circle
                </span>

                <!-- Leading Icon -->
                <span
                    v-else-if="icon && iconPosition === 'left'"
                    class="material-symbols-outlined transition-transform duration-200 group-hover:scale-110"
                    :class="sizeClasses.icon"
                >
                    {{ icon }}
                </span>

                <!-- Label & Sublabel Container -->
                <div class="flex flex-col items-center sm:items-start text-center sm:text-left leading-tight">
                    <span class="font-medium whitespace-nowrap">
                        <template v-if="loading">{{ loadingText || 'Memuat...' }}</template>
                        <template v-else-if="type === 'copy' && isCopied">{{ copiedText }}</template>
                        <template v-else-if="type === 'hold' && holdCompleted">{{ holdSuccessText }}</template>
                        <template v-else-if="type === 'hold' && isHolding">{{ holdText }}</template>
                        <template v-else>{{ label }}</template>
                    </span>
                    <span
                        v-if="sublabel && !loading && !isCopied && !holdCompleted"
                        class="opacity-80 font-normal"
                        :class="sizeClasses.sublabel"
                    >
                        {{ sublabel }}
                    </span>
                </div>

                <!-- Trailing Icon / Chevron untuk type='menu' -->
                <span
                    v-if="!loading && !isCopied && !holdCompleted"
                    class="material-symbols-outlined transition-transform duration-200"
                    :class="[
                        type === 'menu'
                            ? (isOpen ? 'rotate-180' : 'rotate-0')
                            : 'group-hover:translate-x-0.5',
                        sizeClasses.icon,
                    ]"
                >
                    {{ type === 'menu' ? 'expand_more' : (trailingIcon || (icon && iconPosition === 'right' ? icon : '')) }}
                </span>
            </template>
        </component>

        <!-- ========================================================= -->
        <!-- POPUP DROPDOWN MENU (UNTUK TIPE 'SPLIT' & 'MENU')          -->
        <!-- ========================================================= -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
            <div
                v-if="isOpen && (type === 'split' || type === 'menu') && children.length > 0"
                :class="[
                    menuPositionClasses,
                    'absolute z-50 min-w-56 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md focus:outline-hidden select-none',
                ]"
                role="menu"
            >
                <slot name="menu" :children="children" :close="closeMenu">
                    <template v-for="(child, idx) in children" :key="child.id || idx">
                        <!-- Divider Garis Pemisah -->
                        <div
                            v-if="child.divider"
                            class="my-1 border-t border-slate-100 dark:border-slate-800"
                            role="separator"
                        />

                        <!-- Item Aksi Anak -->
                        <component
                            :is="child.href ? (child.as === 'a' ? 'a' : Link) : 'button'"
                            :href="child.href"
                            type="button"
                            :disabled="child.disabled"
                            :class="[
                                'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer',
                                child.disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : child.variant === 'danger'
                                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                    : child.variant === 'success'
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                            ]"
                            role="menuitem"
                            @click="(e) => handleChildClick(child, e)"
                        >
                            <div class="flex items-center gap-2.5 min-w-0">
                                <span
                                    v-if="child.icon"
                                    class="material-symbols-outlined text-[18px] shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-current"
                                >
                                    {{ child.icon }}
                                </span>

                                <div class="flex flex-col truncate">
                                    <span class="font-medium truncate leading-snug">
                                        {{ child.label }}
                                    </span>
                                    <span
                                        v-if="child.subtext"
                                        class="text-[10px] text-slate-400 dark:text-slate-500 truncate"
                                    >
                                        {{ child.subtext }}
                                    </span>
                                </div>
                            </div>

                            <span
                                v-if="child.badge"
                                class="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0"
                            >
                                {{ child.badge }}
                            </span>
                        </component>
                    </template>
                </slot>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
@keyframes shimmer {
    100% {
        transform: translateX(200%);
    }
}
</style>
