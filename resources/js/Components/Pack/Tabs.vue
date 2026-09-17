<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
    /**
     * 3. TEKS KONTEN: Daftar tabs
     * Format item: { id, label, description, icon, badge, badgeVariant, dot, disabled }
     * atau array string: ['Tab 1', 'Tab 2']
     */
    tabs: {
        type: Array,
        required: true,
    },
    /**
     * ID tab aktif (v-model)
     */
    modelValue: {
        type: [String, Number],
        default: null,
    },
    /**
     * 2. BENTUK: Gaya visual varian tabs:
     * - 'underline': Garis bawah aktif modern dengan soft hover & indicator
     * - 'pills': Tombol kapsul/tab modern dengan mode soft, solid, outline
     * - 'segmented': Segmented controller ala macOS/iOS dengan tactile depth
     * - 'enclosed': Tab kartu bertingkat / folder card modern
     */
    variant: {
        type: String,
        default: 'underline',
        validator: (val) => ['underline', 'pills', 'segmented', 'enclosed'].includes(val),
    },
    /**
     * 1. WARNA: Gaya visual pewarnaan tab:
     * - 'soft': Background lembut transparan dengan teks kontras semantik (default)
     * - 'solid': Warna pekat kontras tinggi dengan teks putih
     * - 'outline': Border beraksen warna tegas dengan latar transparan
     */
    tabStyle: {
        type: String,
        default: 'soft',
        validator: (val) => ['soft', 'solid', 'outline'].includes(val),
    },
    /**
     * 1. WARNA: Palet aksen warna semantik
     */
    color: {
        type: String,
        default: 'primary',
        validator: (val) => [
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'violet', 'purple',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
            'dark', 'slate'
        ].includes(val),
    },
    /**
     * 2. BENTUK: Kelengkungan sudut (border-radius)
     */
    radius: {
        type: String,
        default: 'xl',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(val),
    },
    /**
     * 2. BENTUK: Skala ukuran komponen (xs, sm, md, lg, xl)
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    /**
     * 5. RESPONSIF & ORIENTASI:
     * - 'horizontal': Tab berderet ke samping (cocok untuk halaman dashboard)
     * - 'vertical': Tab tersusun ke bawah di sisi samping (cocok untuk halaman setting/profil)
     */
    orientation: {
        type: String,
        default: 'horizontal',
        validator: (val) => ['horizontal', 'vertical'].includes(val),
    },
    /**
     * 4. ICON: Posisi ikon relatif terhadap label ('left' atau 'top')
     */
    iconPosition: {
        type: String,
        default: 'left',
        validator: (val) => ['left', 'top'].includes(val),
    },
    /**
     * Apakah tab membentang memenuhi lebar container (flex-1)
     */
    fullWidth: {
        type: Boolean,
        default: false,
    },
    /**
     * Perataan tab dalam container ('left', 'center', 'right')
     */
    align: {
        type: String,
        default: 'left',
        validator: (val) => ['left', 'center', 'right'].includes(val),
    },
    /**
     * Tampilkan ikon Google Material Symbols jika tersedia
     */
    showIcon: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan badge counter/status jika tersedia
     */
    showBadge: {
        type: Boolean,
        default: true,
    },
    /**
     * 5. RESPONSIF: Aktifkan scroll buttons panah kiri & kanan saat konten meluap
     */
    scrollable: {
        type: Boolean,
        default: false,
    },
    /**
     * Render panel konten hanya saat tab aktif (lazy loading)
     */
    lazy: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'change']);

// Ref DOM untuk Scroll Track
const tablistRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Normalisasi tabs agar seragam { id, label, description, icon, badge, badgeVariant, dot, disabled }
const normalizedTabs = computed(() => {
    return props.tabs.map((tab, idx) => {
        if (typeof tab === 'string' || typeof tab === 'number') {
            return {
                id: String(tab),
                label: String(tab),
                description: '',
                icon: '',
                badge: null,
                badgeVariant: 'default',
                dot: false,
                disabled: false,
            };
        }
        return {
            id: tab.id ?? String(idx),
            label: tab.label ?? `Tab ${idx + 1}`,
            description: tab.description ?? '',
            icon: tab.icon ?? '',
            badge: tab.badge ?? null,
            badgeVariant: tab.badgeVariant ?? 'default',
            dot: Boolean(tab.dot),
            disabled: Boolean(tab.disabled),
        };
    });
});

// State Tab Aktif
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

    // Scroll active button into view seamlessly on mobile
    nextTick(() => {
        const btn = document.getElementById(`tab-${tab.id}`);
        if (btn && tablistRef.value) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        checkScroll();
    });
};

// Navigasi Keyboard ARIA Presisi
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

// Cek status overflow scroll bar
const checkScroll = () => {
    if (!tablistRef.value || props.orientation === 'vertical') return;
    const { scrollLeft, scrollWidth, clientWidth } = tablistRef.value;
    canScrollLeft.value = scrollLeft > 5;
    canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 5;
};

const scrollBy = (offset) => {
    if (!tablistRef.value) return;
    tablistRef.value.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 200);
};

onMounted(() => {
    checkScroll();
});

// Normalisasi Nama Warna
const normalizedColor = computed(() => {
    const map = {
        blue: 'primary',
        success: 'emerald',
        danger: 'rose',
        warning: 'amber',
        sky: 'cyan',
        violet: 'purple',
    };
    return map[props.color] || props.color || 'primary';
});

// 2. BENTUK: Helper Class Radius
const getRadiusClass = (r) => {
    switch (r) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case '2xl': return 'rounded-2xl';
        case 'full': return 'rounded-full';
        case 'xl':
        default: return 'rounded-xl';
    }
};

// 2. BENTUK: Ukuran Proporsional
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return {
                button: 'px-2.5 py-1 text-xs gap-1.5',
                buttonTop: 'px-2.5 py-1.5 text-xs gap-1',
                icon: 'text-[14px]',
                badge: 'text-[9px] px-1.5 py-0.2',
                dot: 'w-1.5 h-1.5',
                desc: 'text-[10px]',
            };
        case 'sm':
            return {
                button: 'px-3 py-1.5 text-xs gap-2',
                buttonTop: 'px-3 py-2 text-xs gap-1',
                icon: 'text-[16px]',
                badge: 'text-[10px] px-1.5 py-0.5',
                dot: 'w-2 h-2',
                desc: 'text-[11px]',
            };
        case 'lg':
            return {
                button: 'px-5 py-2.5 text-sm sm:text-base gap-2.5 font-medium',
                buttonTop: 'px-5 py-3 text-sm sm:text-base gap-1.5 font-medium',
                icon: 'text-[20px]',
                badge: 'text-xs px-2.5 py-0.5',
                dot: 'w-2.5 h-2.5',
                desc: 'text-xs',
            };
        case 'xl':
            return {
                button: 'px-6 py-3.5 text-base gap-3 font-semibold',
                buttonTop: 'px-6 py-4 text-base gap-2 font-semibold',
                icon: 'text-[22px]',
                badge: 'text-xs px-3 py-1',
                dot: 'w-2.5 h-2.5',
                desc: 'text-sm',
            };
        case 'md':
        default:
            return {
                button: 'px-4 py-2 text-xs sm:text-sm gap-2 font-medium',
                buttonTop: 'px-4 py-2.5 text-xs sm:text-sm gap-1.5 font-medium',
                icon: 'text-[18px]',
                badge: 'text-[11px] px-2 py-0.5',
                dot: 'w-2 h-2',
                desc: 'text-[11px]',
            };
    }
});

// 1. WARNA: Palet Desain Modern Berdasarkan Warna & Varian
const colorStyles = computed(() => {
    const c = normalizedColor.value;
    const isSolid = props.tabStyle === 'solid';
    const isOutline = props.tabStyle === 'outline';

    // Skema Warna Presisi
    const map = {
        primary: {
            underlineText: 'text-blue-600 dark:text-blue-400 font-semibold',
            underlineBar: 'bg-blue-600 dark:bg-blue-400',
            underlineHover: 'hover:text-blue-600 dark:hover:text-blue-400',
            verticalActive: 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-l-blue-600 dark:border-l-blue-400',
            pillSolid: 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm ring-1 ring-blue-600/30 font-semibold',
            pillSoft: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold bg-blue-50/20 dark:bg-blue-950/20',
            segmentedActive: 'text-blue-600 dark:text-blue-400 font-semibold',
            enclosedActive: 'text-blue-600 dark:text-blue-400 before:bg-blue-600 dark:before:bg-blue-400',
            dot: 'bg-blue-500',
        },
        indigo: {
            underlineText: 'text-indigo-600 dark:text-indigo-400 font-semibold',
            underlineBar: 'bg-indigo-600 dark:bg-indigo-400',
            underlineHover: 'hover:text-indigo-600 dark:hover:text-indigo-400',
            verticalActive: 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border-l-indigo-600 dark:border-l-indigo-400',
            pillSolid: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm ring-1 ring-indigo-600/30 font-semibold',
            pillSoft: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold bg-indigo-50/20 dark:bg-indigo-950/20',
            segmentedActive: 'text-indigo-600 dark:text-indigo-400 font-semibold',
            enclosedActive: 'text-indigo-600 dark:text-indigo-400 before:bg-indigo-600 dark:before:bg-indigo-400',
            dot: 'bg-indigo-500',
        },
        emerald: {
            underlineText: 'text-emerald-600 dark:text-emerald-400 font-semibold',
            underlineBar: 'bg-emerald-600 dark:bg-emerald-400',
            underlineHover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
            verticalActive: 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border-l-emerald-600 dark:border-l-emerald-400',
            pillSolid: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600/30 font-semibold',
            pillSoft: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-semibold bg-emerald-50/20 dark:bg-emerald-950/20',
            segmentedActive: 'text-emerald-600 dark:text-emerald-400 font-semibold',
            enclosedActive: 'text-emerald-600 dark:text-emerald-400 before:bg-emerald-600 dark:before:bg-emerald-400',
            dot: 'bg-emerald-500',
        },
        purple: {
            underlineText: 'text-purple-600 dark:text-purple-400 font-semibold',
            underlineBar: 'bg-purple-600 dark:bg-purple-400',
            underlineHover: 'hover:text-purple-600 dark:hover:text-purple-400',
            verticalActive: 'bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold border-l-purple-600 dark:border-l-purple-400',
            pillSolid: 'bg-purple-600 dark:bg-purple-500 text-white shadow-sm ring-1 ring-purple-600/30 font-semibold',
            pillSoft: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-semibold bg-purple-50/20 dark:bg-purple-950/20',
            segmentedActive: 'text-purple-600 dark:text-purple-400 font-semibold',
            enclosedActive: 'text-purple-600 dark:text-purple-400 before:bg-purple-600 dark:before:bg-purple-400',
            dot: 'bg-purple-500',
        },
        amber: {
            underlineText: 'text-amber-600 dark:text-amber-400 font-semibold',
            underlineBar: 'bg-amber-600 dark:bg-amber-400',
            underlineHover: 'hover:text-amber-600 dark:hover:text-amber-400',
            verticalActive: 'bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border-l-amber-600 dark:border-l-amber-400',
            pillSolid: 'bg-amber-500 dark:bg-amber-600 text-white shadow-sm ring-1 ring-amber-500/30 font-semibold',
            pillSoft: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-semibold bg-amber-50/20 dark:bg-amber-950/20',
            segmentedActive: 'text-amber-600 dark:text-amber-400 font-semibold',
            enclosedActive: 'text-amber-600 dark:text-amber-400 before:bg-amber-600 dark:before:bg-amber-400',
            dot: 'bg-amber-500',
        },
        rose: {
            underlineText: 'text-rose-600 dark:text-rose-400 font-semibold',
            underlineBar: 'bg-rose-600 dark:bg-rose-400',
            underlineHover: 'hover:text-rose-600 dark:hover:text-rose-400',
            verticalActive: 'bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold border-l-rose-600 dark:border-l-rose-400',
            pillSolid: 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm ring-1 ring-rose-600/30 font-semibold',
            pillSoft: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 font-semibold bg-rose-50/20 dark:bg-rose-950/20',
            segmentedActive: 'text-rose-600 dark:text-rose-400 font-semibold',
            enclosedActive: 'text-rose-600 dark:text-rose-400 before:bg-rose-600 dark:before:bg-rose-400',
            dot: 'bg-rose-500',
        },
        cyan: {
            underlineText: 'text-cyan-600 dark:text-cyan-400 font-semibold',
            underlineBar: 'bg-cyan-600 dark:bg-cyan-400',
            underlineHover: 'hover:text-cyan-600 dark:hover:text-cyan-400',
            verticalActive: 'bg-cyan-50/80 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-semibold border-l-cyan-600 dark:border-l-cyan-400',
            pillSolid: 'bg-cyan-600 dark:bg-cyan-500 text-white shadow-sm ring-1 ring-cyan-600/30 font-semibold',
            pillSoft: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400 font-semibold bg-cyan-50/20 dark:bg-cyan-950/20',
            segmentedActive: 'text-cyan-600 dark:text-cyan-400 font-semibold',
            enclosedActive: 'text-cyan-600 dark:text-cyan-400 before:bg-cyan-600 dark:before:bg-cyan-400',
            dot: 'bg-cyan-500',
        },
        dark: {
            underlineText: 'text-slate-900 dark:text-white font-semibold',
            underlineBar: 'bg-slate-900 dark:bg-white',
            underlineHover: 'hover:text-slate-900 dark:hover:text-white',
            verticalActive: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-l-slate-900 dark:border-l-white',
            pillSolid: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold',
            pillSoft: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-semibold shadow-2xs',
            pillOutline: 'border-2 border-slate-900 text-slate-900 dark:border-white dark:text-white font-semibold',
            segmentedActive: 'text-slate-900 dark:text-white font-semibold',
            enclosedActive: 'text-slate-900 dark:text-white before:bg-slate-900 dark:before:bg-white',
            dot: 'bg-slate-800 dark:bg-slate-200',
        },
    };

    const activeTheme = map[c] || map.primary;

    return {
        ...activeTheme,
        pillActive: isSolid ? activeTheme.pillSolid : (isOutline ? activeTheme.pillOutline : activeTheme.pillSoft),
    };
});

// Styling Dinamis Tombol Tab
const getTabClass = (tab, isActive) => {
    const isTop = props.iconPosition === 'top';
    const base = [
        'relative inline-flex transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        isTop ? sizeClasses.value.buttonTop : sizeClasses.value.button,
        isTop ? 'flex-col items-center justify-center text-center' : 'items-center justify-center font-medium leading-none',
        props.fullWidth ? 'flex-1' : '',
    ];

    if (tab.disabled) {
        return [...base, 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'].join(' ');
    }

    base.push('cursor-pointer');

    // -----------------------------------------------------------------
    // 1. VARIAN UNDERLINE (Modern Minimalist Line)
    // -----------------------------------------------------------------
    if (props.variant === 'underline') {
        if (props.orientation === 'vertical') {
            base.push('w-full justify-start text-left border-l-2 -ml-px', getRadiusClass(props.radius));
            if (isActive) {
                base.push(colorStyles.value.verticalActive, 'shadow-2xs');
            } else {
                base.push('border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/40');
            }
        } else {
            base.push('pb-3 pt-2 text-center rounded-lg');
            if (isActive) {
                base.push(colorStyles.value.underlineText);
            } else {
                base.push('text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40');
            }
        }
    }

    // -----------------------------------------------------------------
    // 2. VARIAN PILLS (Pills Kapsul Elegan)
    // -----------------------------------------------------------------
    else if (props.variant === 'pills') {
        base.push(getRadiusClass(props.radius));
        if (props.orientation === 'vertical') {
            base.push('w-full justify-start text-left');
        }
        if (isActive) {
            base.push(colorStyles.value.pillActive);
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent');
        }
    }

    // -----------------------------------------------------------------
    // 3. VARIAN SEGMENTED (Apple/macOS Tactile Control)
    // -----------------------------------------------------------------
    else if (props.variant === 'segmented') {
        base.push(getRadiusClass(props.radius));
        if (props.orientation === 'vertical') {
            base.push('w-full justify-start text-left');
        }
        if (isActive) {
            base.push(
                'bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-700/80',
                colorStyles.value.segmentedActive
            );
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100');
        }
    }

    // -----------------------------------------------------------------
    // 4. VARIAN ENCLOSED (Card Folder Tabs)
    // -----------------------------------------------------------------
    else if (props.variant === 'enclosed') {
        base.push('rounded-t-xl border border-transparent -mb-px transition-all');
        if (isActive) {
            base.push(
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-b-transparent shadow-2xs font-semibold',
                'relative before:absolute before:top-0 before:left-3 before:right-3 before:h-0.75 before:rounded-full',
                colorStyles.value.enclosedActive
            );
        } else {
            base.push('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40');
        }
    }

    return base.join(' ');
};

// Styling Badge Counter
const getBadgeClass = (variant = 'default', isActive) => {
    if (isActive && props.variant === 'pills' && props.tabStyle === 'solid') {
        return 'bg-white/25 text-white backdrop-blur-xs';
    }
    const variants = {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
        primary: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60',
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
        danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
    };
    return variants[variant] || variants.default;
};

// Perataan Horizontal
const alignClass = computed(() => {
    if (props.fullWidth) return 'w-full';
    switch (props.align) {
        case 'center': return 'justify-center';
        case 'right': return 'justify-end';
        case 'left':
        default: return 'justify-start';
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
            class="relative"
            :class="[
                orientation === 'vertical' ? 'w-full md:w-64 shrink-0' : 'w-full',
            ]"
        >
            <!-- Scroll Controls (Left Arrow) -->
            <button
                v-if="scrollable && orientation === 'horizontal' && canScrollLeft"
                type="button"
                @click="scrollBy(-180)"
                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Geser ke kiri"
            >
                <span class="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
            </button>

            <!-- Tab List Track -->
            <div
                ref="tablistRef"
                role="tablist"
                :aria-orientation="orientation"
                @keydown="onKeydown"
                @scroll="checkScroll"
                tabindex="0"
                class="outline-none"
                :class="[
                    orientation === 'vertical'
                        ? 'flex flex-col space-y-1'
                        : 'flex items-center overflow-x-auto scrollbar-none',
                    alignClass,
                    // Container styles per varian
                    variant === 'underline' && orientation === 'horizontal'
                        ? 'border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4'
                        : '',
                    variant === 'enclosed' && orientation === 'horizontal'
                        ? 'border-b border-slate-200 dark:border-slate-800 gap-1'
                        : '',
                    variant === 'segmented'
                        ? [
                            'p-1 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 gap-1 inline-flex shadow-inner backdrop-blur-xs',
                            getRadiusClass(radius),
                        ]
                        : '',
                    variant === 'pills' && orientation === 'horizontal'
                        ? 'gap-1.5'
                        : '',
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
                    <!-- Custom Tab Scoped Slot -->
                    <slot name="tab" :tab="tab" :active="activeTabId === tab.id" :index="index">
                        <div
                            class="inline-flex items-center justify-center font-medium leading-none"
                            :class="[
                                iconPosition === 'top' ? 'flex-col gap-1' : 'gap-2',
                            ]"
                        >
                            <!-- 4. ICON: Ikon Google Material Symbols -->
                            <span
                                v-if="showIcon && tab.icon"
                                class="material-symbols-outlined shrink-0 leading-none select-none transition-transform"
                                :class="[
                                    sizeClasses.icon,
                                    activeTabId === tab.id ? 'scale-105' : '',
                                ]"
                            >
                                {{ tab.icon }}
                            </span>

                            <!-- 3. TEKS KONTEN: Label & Deskripsi Opsional -->
                            <div
                                class="inline-flex leading-none"
                                :class="tab.description ? 'flex-col items-start gap-0.5 text-left' : 'items-center'"
                            >
                                <span class="leading-none whitespace-nowrap">{{ tab.label }}</span>
                                <span
                                    v-if="tab.description"
                                    class="text-slate-400 dark:text-slate-500 font-normal leading-tight"
                                    :class="sizeClasses.desc"
                                >
                                    {{ tab.description }}
                                </span>
                            </div>

                            <!-- Status Dot Bulat (jika diaktifkan) -->
                            <span
                                v-if="tab.dot"
                                class="rounded-full shrink-0"
                                :class="[sizeClasses.dot, colorStyles.dot]"
                            />

                            <!-- Badge Counter -->
                            <span
                                v-if="showBadge && tab.badge !== null && tab.badge !== undefined"
                                class="inline-flex items-center justify-center rounded-full font-bold leading-none shrink-0 transition-colors"
                                :class="[sizeClasses.badge, getBadgeClass(tab.badgeVariant, activeTabId === tab.id)]"
                            >
                                {{ tab.badge }}
                            </span>
                        </div>
                    </slot>

                    <!-- Active Floating Bar Indicator untuk Varian Underline Horizontal -->
                    <span
                        v-if="variant === 'underline' && orientation === 'horizontal' && activeTabId === tab.id"
                        class="absolute -bottom-px left-1 right-1 h-0.75 rounded-full shadow-xs transition-all duration-200"
                        :class="colorStyles.underlineBar"
                    />
                </button>
            </div>

            <!-- Scroll Controls (Right Arrow) -->
            <button
                v-if="scrollable && orientation === 'horizontal' && canScrollRight"
                type="button"
                @click="scrollBy(180)"
                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Geser ke kanan"
            >
                <span class="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
            </button>

            <!-- Extra actions slot (Header samping kanan tab) -->
            <div
                v-if="$slots.extra && orientation === 'horizontal'"
                class="hidden sm:flex items-center ml-auto pl-3"
            >
                <slot name="extra" />
            </div>
        </div>

        <!-- Tab Content Panel Container -->
        <div class="flex-1 w-full min-w-0">
            <div
                v-for="(tab, index) in normalizedTabs"
                :key="tab.id"
                role="tabpanel"
                :id="`tabpanel-${tab.id}`"
                :aria-labelledby="`tab-${tab.id}`"
                tabindex="0"
                class="focus:outline-none"
                :class="activeTabId === tab.id ? 'block animate-in fade-in duration-150' : 'hidden'"
            >
                <!-- Render panel konten -->
                <template v-if="!lazy || activeTabId === tab.id">
                    <!-- Named slot per Tab ID (contoh: #overview, #transactions, #profile) -->
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
