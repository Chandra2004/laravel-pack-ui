<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import Badge from './Badge.vue';

const props = defineProps({
    /**
     * Daftar tab item:
     * Format objek: { id, label, icon, badge, panelTitle, panelDesc, status, disabled }
     * atau format string: ['Tab 1', 'Tab 2']
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
     * Varian desain tab:
     * - 'underline': Garis bawah minimalis terpadu (border-b-2)
     * - 'pills': Tombol kapsul melayang independen (floating separate capsules)
     * - 'segmented': Segmented controller taktil (Apple / iOS style) dalam satu track terpadu
     * - 'enclosed': Tab folder card enterprise klasik menyatu dengan panel
     * - 'boxed' / 'cards': Tab kartu dashboard kotak berbingkai terpisah dengan aksen border atas/kiri
     * - 'floating' / 'glass': Glassmorphism modern dengan backdrop-blur dan elevated floating island
     * - 'bubble': Pastel bubble membulat empuk tanpa border kaku (mobile & e-commerce friendly)
     * - 'lifted': Tab terangkat dengan shadow & hairline atas
     * - 'minimal': Clean ghost tanpa background dengan pulsing status dot
     */
    variant: {
        type: String,
        default: 'underline',
        validator: (val) => [
            'underline',
            'pills',
            'segmented',
            'enclosed',
            'boxed',
            'cards',
            'floating',
            'glass',
            'bubble',
            'lifted',
            'minimal',
        ].includes(val),
    },
    /**
     * Palet warna semantik:
     * 'primary' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'dark'
     */
    color: {
        type: String,
        default: 'primary',
        validator: (val) => [
            'primary', 'blue',
            'indigo',
            'emerald', 'success',
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
            'dark', 'slate',
        ].includes(val),
    },
    /**
     * Gaya tab:
     * - 'outline': Garis tepi bersih tanpa background (default untuk underline)
     * - 'soft': Latar pastel transparan
     * - 'solid': Warna penuh kontras tinggi
     */
    tabStyle: {
        type: String,
        default: null,
        validator: (val) => val === null || ['outline', 'soft', 'solid'].includes(val),
    },
    /**
     * Skala ukuran: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
    },
    /**
     * Kelengkungan sudut: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
     */
    radius: {
        type: String,
        default: 'lg',
        validator: (val) => ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * Tata letak: 'horizontal' | 'vertical'
     */
    orientation: {
        type: String,
        default: 'horizontal',
        validator: (val) => ['horizontal', 'vertical'].includes(val),
    },
    /**
     * Posisi ikon: 'left' | 'top'
     */
    iconPosition: {
        type: String,
        default: 'left',
        validator: (val) => ['left', 'top'].includes(val),
    },
    /**
     * Bagi lebar tab secara merata (flex-1)
     */
    fullWidth: {
        type: Boolean,
        default: false,
    },
    /**
     * Mode navigasi scrollable dengan tombol panah kiri-kanan
     */
    scrollable: {
        type: Boolean,
        default: false,
    },
    /**
     * Tampilkan ikon Material Symbols
     */
    showIcon: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan badge counter/status
     */
    showBadge: {
        type: Boolean,
        default: true,
    },
    /**
     * Sembunyikan panel konten bawah jika hanya butuh tab trigger navigasi
     */
    compactPanel: {
        type: Boolean,
        default: false,
    },
    /**
     * Tunda render panel hingga tab aktif dibuka (lazy rendering)
     */
    lazy: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'change']);

// Ref DOM untuk track scrollbar
const trackRef = ref(null);

// Normalisasi item tabs
const normalizedTabs = computed(() => {
    return (props.tabs || []).map((tab, idx) => {
        if (typeof tab === 'string' || typeof tab === 'number') {
            return {
                id: String(tab),
                label: String(tab),
                icon: '',
                badge: null,
                panelTitle: String(tab),
                panelDesc: '',
                status: '',
                disabled: false,
            };
        }
        return {
            id: tab.id ?? String(idx),
            label: tab.label ?? `Tab ${idx + 1}`,
            icon: tab.icon ?? '',
            badge: tab.badge ?? null,
            panelTitle: tab.panelTitle ?? tab.label ?? `Tab ${idx + 1}`,
            panelDesc: tab.panelDesc ?? tab.description ?? '',
            status: tab.status ?? '',
            disabled: Boolean(tab.disabled),
        };
    });
});

// Instance ID unik untuk aksesibilitas ARIA
const instanceId = `lp-tabs-${Math.random().toString(36).slice(2, 8)}`;

// State Tab Aktif
const activeTabId = ref(
    props.modelValue !== null && props.modelValue !== undefined
        ? props.modelValue
        : normalizedTabs.value[0]?.id
);

watch(
    () => props.modelValue,
    (val) => {
        if (val !== null && val !== undefined && val !== activeTabId.value) {
            activeTabId.value = val;
        }
    }
);

const currentTab = computed(() => {
    return normalizedTabs.value.find((t) => t.id === activeTabId.value) || normalizedTabs.value[0];
});

const activeIndex = computed(() => {
    return normalizedTabs.value.findIndex((t) => t.id === activeTabId.value);
});

// Pemilihan Tab (Bebas dari efek scroll window viewport)
const selectTab = (tab, idx) => {
    if (tab.disabled) return;
    activeTabId.value = tab.id;
    emit('update:modelValue', tab.id);
    emit('change', { tab, index: idx });

    // Scroll track horizontal lokal agar tombol tab aktif berada di tengah
    if (props.scrollable && props.orientation === 'horizontal' && trackRef.value) {
        nextTick(() => {
            const track = trackRef.value;
            const btn = track.querySelector(`[data-tab-id="${tab.id}"]`);
            if (btn) {
                const trackRect = track.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();
                const offset = (btnRect.left - trackRect.left) - (track.clientWidth / 2) + (btnRect.width / 2);
                track.scrollBy({ left: offset, behavior: 'smooth' });
            }
        });
    }
};

// Navigasi Pindah Tab Melalui Tombol Panah Scrollable
const canGoPrev = computed(() => {
    const enabled = normalizedTabs.value.filter((t) => !t.disabled);
    const curIdx = enabled.findIndex((t) => t.id === activeTabId.value);
    return curIdx > 0;
});

const canGoNext = computed(() => {
    const enabled = normalizedTabs.value.filter((t) => !t.disabled);
    const curIdx = enabled.findIndex((t) => t.id === activeTabId.value);
    return curIdx >= 0 && curIdx < enabled.length - 1;
});

const goToPrevTab = () => {
    const enabled = normalizedTabs.value.filter((t) => !t.disabled);
    const curIdx = enabled.findIndex((t) => t.id === activeTabId.value);
    if (curIdx > 0) {
        const target = enabled[curIdx - 1];
        const origIdx = normalizedTabs.value.findIndex((t) => t.id === target.id);
        selectTab(target, origIdx);
    }
};

const goToNextTab = () => {
    const enabled = normalizedTabs.value.filter((t) => !t.disabled);
    const curIdx = enabled.findIndex((t) => t.id === activeTabId.value);
    if (curIdx >= 0 && curIdx < enabled.length - 1) {
        const target = enabled[curIdx + 1];
        const origIdx = normalizedTabs.value.findIndex((t) => t.id === target.id);
        selectTab(target, origIdx);
    }
};

// Keyboard ARIA Navigation
const onKeydown = (e) => {
    const enabled = normalizedTabs.value.filter((t) => !t.disabled);
    if (!enabled.length) return;
    const curIdx = enabled.findIndex((t) => t.id === activeTabId.value);
    let target = null;

    if (e.key === 'ArrowRight' || (props.orientation === 'vertical' && e.key === 'ArrowDown')) {
        e.preventDefault();
        target = enabled[(curIdx + 1) % enabled.length];
    } else if (e.key === 'ArrowLeft' || (props.orientation === 'vertical' && e.key === 'ArrowUp')) {
        e.preventDefault();
        target = enabled[(curIdx - 1 + enabled.length) % enabled.length];
    } else if (e.key === 'Home') {
        e.preventDefault();
        target = enabled[0];
    } else if (e.key === 'End') {
        e.preventDefault();
        target = enabled[enabled.length - 1];
    }

    if (target) {
        const origIdx = normalizedTabs.value.findIndex((t) => t.id === target.id);
        selectTab(target, origIdx);
    }
};

// Skala Ukuran & Proporsi Optik 1:1
const sizeStyles = computed(() => {
    const map = {
        xs: {
            text: 'text-[11px]',
            icon: 'text-[13px]',
            gap: 'gap-1.5',
            underlinePad: 'pt-1.5 pb-2 px-2.5',
            boxPad: 'py-1.5 px-3',
            topPad: 'py-1.5 px-3',
            badge: 'text-[9.5px] px-1.5 py-0.5',
            arrowBtn: 'w-6 h-6',
            arrowIcon: 'text-[14px]',
        },
        sm: {
            text: 'text-xs',
            icon: 'text-[14px]',
            gap: 'gap-1.5',
            underlinePad: 'pt-1.5 pb-2 px-3',
            boxPad: 'py-2 px-3.5',
            topPad: 'py-2 px-3.5',
            badge: 'text-[10px] px-1.5 py-0.5',
            arrowBtn: 'w-7 h-7',
            arrowIcon: 'text-[15px]',
        },
        md: {
            text: 'text-xs sm:text-[13px]',
            icon: 'text-[16px]',
            gap: 'gap-1.5',
            underlinePad: 'pt-2 pb-2.5 px-3.5',
            boxPad: 'py-2 px-4',
            topPad: 'py-2.5 px-4',
            badge: 'text-[10.5px] px-1.5 py-0.5',
            arrowBtn: 'w-7 h-7',
            arrowIcon: 'text-[16px]',
        },
        lg: {
            text: 'text-sm',
            icon: 'text-[18px]',
            gap: 'gap-2',
            underlinePad: 'pt-2.5 pb-3 px-4',
            boxPad: 'py-2.5 px-4.5',
            topPad: 'py-3 px-5',
            badge: 'text-[11px] px-2 py-0.5',
            arrowBtn: 'w-8 h-8',
            arrowIcon: 'text-[17px]',
        },
        xl: {
            text: 'text-base',
            icon: 'text-[20px]',
            gap: 'gap-2.5',
            underlinePad: 'pt-3 pb-3.5 px-5',
            boxPad: 'py-3 px-5.5',
            topPad: 'py-3.5 px-6',
            badge: 'text-xs px-2 py-0.5',
            arrowBtn: 'w-8 h-8',
            arrowIcon: 'text-[18px]',
        },
    };
    return map[props.size] || map.md;
});

// Peta Border Radius
const radiusStyles = computed(() => {
    const map = {
        none: { tab: 'rounded-none', track: 'rounded-none', topOnly: 'rounded-t-none', leftOnly: 'rounded-l-none', badge: 'rounded-none' },
        xs:   { tab: 'rounded-xs',   track: 'rounded-xs',   topOnly: 'rounded-t-xs',   leftOnly: 'rounded-l-xs',   badge: 'rounded-xs' },
        sm:   { tab: 'rounded-sm',   track: 'rounded-md',   topOnly: 'rounded-t-sm',   leftOnly: 'rounded-l-sm',   badge: 'rounded-xs' },
        md:   { tab: 'rounded-md',   track: 'rounded-lg',   topOnly: 'rounded-t-md',   leftOnly: 'rounded-l-md',   badge: 'rounded-sm' },
        lg:   { tab: 'rounded-lg',   track: 'rounded-xl',   topOnly: 'rounded-t-lg',   leftOnly: 'rounded-l-lg',   badge: 'rounded-md' },
        xl:   { tab: 'rounded-xl',   track: 'rounded-2xl',  topOnly: 'rounded-t-xl',   leftOnly: 'rounded-l-xl',   badge: 'rounded-md' },
        full: { tab: 'rounded-full', track: 'rounded-full', topOnly: 'rounded-t-xl',   leftOnly: 'rounded-l-xl',   badge: 'rounded-full' },
    };
    return map[props.radius] || map.lg;
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
        slate: 'dark',
    };
    return map[props.color] || props.color || 'primary';
});

// Palet Warna Semantik
const colorStyles = computed(() => {
    const map = {
        primary: {
            line: 'border-primary-600 dark:border-primary-400',
            hairline: 'bg-primary-600 dark:bg-primary-400',
            text: 'text-primary-600 dark:text-primary-400',
            textActive: 'text-primary-700 dark:text-primary-300',
            soft: 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60',
            solid: 'bg-primary-600 dark:bg-primary-500 text-white border border-primary-600 dark:border-primary-500 shadow-xs',
            outline: 'bg-transparent text-primary-600 dark:text-primary-300 border border-primary-500 dark:border-primary-400',
            badgeSoft: 'bg-primary-100/90 dark:bg-primary-900/70 text-primary-700 dark:text-primary-200',
            glowRing: 'ring-2 ring-primary-500/25',
        },
        indigo: {
            line: 'border-indigo-600 dark:border-indigo-400',
            hairline: 'bg-indigo-600 dark:bg-indigo-400',
            text: 'text-indigo-600 dark:text-indigo-400',
            textActive: 'text-indigo-700 dark:text-indigo-300',
            soft: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
            solid: 'bg-indigo-600 dark:bg-indigo-500 text-white border border-indigo-600 dark:border-indigo-500 shadow-xs',
            outline: 'bg-transparent text-indigo-600 dark:text-indigo-300 border border-indigo-500 dark:border-indigo-400',
            badgeSoft: 'bg-indigo-100/90 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-200',
            glowRing: 'ring-2 ring-indigo-500/25',
        },
        emerald: {
            line: 'border-emerald-600 dark:border-emerald-400',
            hairline: 'bg-emerald-600 dark:bg-emerald-400',
            text: 'text-emerald-600 dark:text-emerald-400',
            textActive: 'text-emerald-700 dark:text-emerald-300',
            soft: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
            solid: 'bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-600 dark:border-emerald-500 shadow-xs',
            outline: 'bg-transparent text-emerald-600 dark:text-emerald-300 border border-emerald-500 dark:border-emerald-400',
            badgeSoft: 'bg-emerald-100/90 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-200',
            glowRing: 'ring-2 ring-emerald-500/25',
        },
        purple: {
            line: 'border-purple-600 dark:border-purple-400',
            hairline: 'bg-purple-600 dark:bg-purple-400',
            text: 'text-purple-600 dark:text-purple-400',
            textActive: 'text-purple-700 dark:text-purple-300',
            soft: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
            solid: 'bg-purple-600 dark:bg-purple-500 text-white border border-purple-600 dark:border-purple-500 shadow-xs',
            outline: 'bg-transparent text-purple-600 dark:text-purple-300 border border-purple-500 dark:border-purple-400',
            badgeSoft: 'bg-purple-100/90 dark:bg-purple-900/70 text-purple-700 dark:text-purple-200',
            glowRing: 'ring-2 ring-purple-500/25',
        },
        amber: {
            line: 'border-amber-500 dark:border-amber-400',
            hairline: 'bg-amber-500 dark:bg-amber-400',
            text: 'text-amber-700 dark:text-amber-400',
            textActive: 'text-amber-800 dark:text-amber-300',
            soft: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
            solid: 'bg-amber-500 dark:bg-amber-500 text-white border border-amber-500 shadow-xs',
            outline: 'bg-transparent text-amber-700 dark:text-amber-300 border border-amber-500 dark:border-amber-400',
            badgeSoft: 'bg-amber-100/90 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200',
            glowRing: 'ring-2 ring-amber-500/25',
        },
        rose: {
            line: 'border-rose-600 dark:border-rose-400',
            hairline: 'bg-rose-600 dark:bg-rose-400',
            text: 'text-rose-600 dark:text-rose-400',
            textActive: 'text-rose-700 dark:text-rose-300',
            soft: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
            solid: 'bg-rose-600 dark:bg-rose-500 text-white border border-rose-600 dark:border-rose-500 shadow-xs',
            outline: 'bg-transparent text-rose-600 dark:text-rose-300 border border-rose-500 dark:border-rose-400',
            badgeSoft: 'bg-rose-100/90 dark:bg-rose-900/70 text-rose-700 dark:text-rose-200',
            glowRing: 'ring-2 ring-rose-500/25',
        },
        cyan: {
            line: 'border-cyan-600 dark:border-cyan-400',
            hairline: 'bg-cyan-600 dark:bg-cyan-400',
            text: 'text-cyan-700 dark:text-cyan-400',
            textActive: 'text-cyan-800 dark:text-cyan-300',
            soft: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60',
            solid: 'bg-cyan-600 dark:bg-cyan-500 text-white border border-cyan-600 dark:border-cyan-500 shadow-xs',
            outline: 'bg-transparent text-cyan-700 dark:text-cyan-300 border border-cyan-500 dark:border-cyan-400',
            badgeSoft: 'bg-cyan-100/90 dark:bg-cyan-900/70 text-cyan-800 dark:text-cyan-200',
            glowRing: 'ring-2 ring-cyan-500/25',
        },
        dark: {
            line: 'border-slate-900 dark:border-slate-100',
            hairline: 'bg-slate-900 dark:bg-slate-100',
            text: 'text-slate-900 dark:text-white',
            textActive: 'text-slate-900 dark:text-white',
            soft: 'bg-slate-200/75 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300/80 dark:border-slate-700',
            solid: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-900 dark:border-slate-100 shadow-xs',
            outline: 'bg-transparent text-slate-900 dark:text-white border border-slate-800 dark:border-slate-300',
            badgeSoft: 'bg-slate-300/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
            glowRing: 'ring-2 ring-slate-900/20 dark:ring-white/20',
        },
    };
    return map[normalizedColor.value] || map.primary;
});

// Varian Normalisasi
const normalizedVariant = computed(() => {
    if (props.variant === 'cards') return 'boxed';
    if (props.variant === 'glass') return 'floating';
    return props.variant || 'underline';
});

// Helper Warna Badge Semantik
const getBadgeColor = (isActive) => {
    if (!isActive) return 'neutral';
    switch (normalizedColor.value) {
        case 'emerald': return 'emerald';
        case 'rose': return 'danger';
        case 'amber': return 'warning';
        case 'cyan': return 'info';
        case 'purple': return 'purple';
        case 'indigo': return 'indigo';
        case 'dark': return 'neutral';
        default: return 'primary';
    }
};

// Gaya visual efektif: default 'outline' untuk varian 'underline', 'soft' untuk varian lain
const resolvedTabStyle = computed(() => {
    if (props.tabStyle) return props.tabStyle;
    return normalizedVariant.value === 'underline' ? 'outline' : 'soft';
});

// Styling Button Tab (REDESIGN: Setiap varian memiliki karakter visual tegas dan unik)
const getTabClass = (tab, isActive) => {
    const isVert = props.orientation === 'vertical';
    const isTop = props.iconPosition === 'top';
    const s = sizeStyles.value;
    const r = radiusStyles.value;
    const c = colorStyles.value;
    const st = resolvedTabStyle.value;
    const v = normalizedVariant.value;

    // Orientasi Ikon & Teks
    const dirCls = isTop
        ? 'flex-col items-center justify-center text-center gap-1.5'
        : `flex-row items-center ${isVert && !props.fullWidth ? 'justify-start' : 'justify-center'} ${s.gap}`;

    // Lebar
    const widthCls = (props.fullWidth && !props.scrollable && !isVert)
        ? 'flex-1'
        : (isVert ? 'w-full' : 'shrink-0');

    // Padding Proporsional Berdasarkan Varian
    let padCls = s.boxPad;
    if (isTop) padCls = s.topPad;
    else if (['underline', 'lifted'].includes(v) && !isVert) padCls = s.underlinePad;
    else if (v === 'minimal') padCls = 'py-1.5 px-3';

    // Gaya Visual Berdasarkan Variant (Redesain Kuat & Kontras)
    let stateCls = '';

    // 1. UNDERLINE: Garis aksen bawah minimalis terpadu
    if (v === 'underline') {
        const borderSide = isVert ? 'border-r-2 border-solid -mr-px' : 'border-b-2 border-solid -mb-px';
        const radiusSide = isVert ? r.leftOnly : r.topOnly;
        if (isActive) {
            if (st === 'solid') {
                const solidBgCls = c.solid.replace(/\bborder\s+border-\S+/g, '').replace(/\bborder\b/g, '').trim();
                stateCls = `${borderSide} ${c.line} ${solidBgCls} ${radiusSide} font-semibold`;
            } else if (st === 'soft') {
                stateCls = `${borderSide} ${c.line} ${c.text} bg-slate-100/70 dark:bg-slate-800/50 ${radiusSide} font-semibold`;
            } else {
                stateCls = `${borderSide} ${c.line} ${c.text} bg-transparent font-semibold`;
            }
        } else {
            stateCls = `${borderSide} border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700`;
        }
    }
    // 2. PILLS: Tombol kapsul melayang independen (Separate floating rounded-full capsules)
    else if (v === 'pills') {
        if (isActive) {
            if (st === 'solid') {
                stateCls = `rounded-full border-solid ${c.solid} shadow-md shadow-primary-500/20 ${c.glowRing} font-bold scale-[1.02]`;
            } else if (st === 'outline') {
                stateCls = `rounded-full border-2 border-solid ${c.outline} bg-transparent font-bold`;
            } else {
                stateCls = `rounded-full border border-solid ${c.soft} shadow-xs font-bold ring-1 ring-current/20`;
            }
        } else {
            stateCls = `rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-2xs`;
        }
    }
    // 3. SEGMENTED: Apple iOS / macOS style tactile slider (Tombol kartu putih menonjol dalam satu track)
    else if (v === 'segmented') {
        if (isActive) {
            stateCls = `${r.tab} bg-white dark:bg-slate-900 ${c.textActive} font-bold shadow-md shadow-slate-900/10 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 transition-transform`;
        } else {
            stateCls = `${r.tab} border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40`;
        }
    }
    // 4. ENCLOSED: Tab folder klasik enterprise menyatu rapi dengan panel
    else if (v === 'enclosed') {
        const attachBorder = isVert
            ? `${r.leftOnly} border border-solid border-slate-200 dark:border-slate-700 border-r-white dark:border-r-slate-900 -mr-px`
            : `${r.topOnly} border border-solid border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 -mb-px`;

        if (isActive) {
            stateCls = `${attachBorder} bg-white dark:bg-slate-900 ${c.text} font-bold shadow-2xs`;
        } else {
            stateCls = `${isVert ? r.leftOnly : r.topOnly} border border-solid border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40`;
        }
    }
    // 5. BOXED / CARDS: Kartu berbingkai dashboard dengan aksen border atas tebal (horizontal) atau kiri (vertikal)
    else if (v === 'boxed') {
        const accentBorder = isVert
            ? `border-l-4 sm:border-l-[4px] ${c.line}`
            : `border-t-4 sm:border-t-[4px] ${c.line}`;

        if (isActive) {
            stateCls = `rounded-xl border border-slate-200 dark:border-slate-700 ${accentBorder} bg-white dark:bg-slate-900 ${c.textActive} shadow-md shadow-slate-200/80 dark:shadow-black/40 font-bold -translate-y-0.5 sm:-translate-y-1 transition-transform`;
        } else {
            stateCls = `rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs`;
        }
    }
    // 6. FLOATING / GLASS: Glassmorphism island dengan backdrop-blur dan frosted glow card
    else if (v === 'floating') {
        if (isActive) {
            stateCls = `rounded-xl bg-white/95 dark:bg-slate-800/95 ${c.textActive} font-bold shadow-md shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-700/80 ring-1 ring-slate-900/5`;
        } else {
            stateCls = `rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent`;
        }
    }
    // 7. BUBBLE: Balon empuk pastel membal tanpa border kaku (e-commerce & touch friendly)
    else if (v === 'bubble') {
        if (isActive) {
            stateCls = `rounded-2xl ${c.soft} ${c.textActive} font-bold scale-[1.03] shadow-xs border-none ring-2 ring-current/20 transition-transform`;
        } else {
            stateCls = `rounded-2xl bg-slate-100/90 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-none transition-all`;
        }
    }
    // 8. LIFTED: Tab terangkat elevated dengan hairline atas
    else if (v === 'lifted') {
        if (isActive) {
            stateCls = `${isVert ? r.leftOnly : r.topOnly} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${isVert ? 'border-r-white dark:border-r-slate-900 -mr-px border-l-2' : 'border-b-white dark:border-b-slate-900 -mb-px border-t-2'} ${c.line} ${c.text} shadow-xs font-semibold`;
        } else {
            stateCls = `${isVert ? r.leftOnly : r.topOnly} border border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40`;
        }
    }
    // 9. MINIMAL: Clean ghost tanpa background dengan tipografi berkelas
    else if (v === 'minimal') {
        if (isActive) {
            stateCls = `bg-transparent border-none ${c.textActive} font-bold tracking-tight scale-[1.02]`;
        } else {
            stateCls = `bg-transparent border-none text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium`;
        }
    }

    const disabledCls = tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    return [
        'group inline-flex transition-all duration-150 select-none focus:outline-none',
        s.text,
        dirCls,
        widthCls,
        padCls,
        stateCls,
        disabledCls,
    ].join(' ');
};

// Panel Attached Class (Memberikan ruang & border mandiri yang rapi pada setiap varian)
const panelAttachedCls = computed(() => {
    const v = normalizedVariant.value;
    if (v === 'boxed') {
        return 'flex-1 min-w-0 border border-solid border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm';
    }
    if (v === 'floating') {
        return 'flex-1 min-w-0 border border-solid border-slate-200/80 dark:border-slate-700/60 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 shadow-sm';
    }
    return 'flex-1 min-w-0 border border-solid border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs';
});
</script>

<template>
    <div
        class="lp-tabs m-0 p-0"
        :class="orientation === 'vertical'
            ? 'flex flex-col sm:flex-row items-stretch gap-6 sm:gap-8'
            : 'flex flex-col space-y-4 sm:space-y-6'"
    >
        <!-- Header Navigation Wrapper -->
        <div class="m-0 p-0" :class="scrollable && orientation === 'horizontal' ? 'flex items-center w-full' : ''">
            <!-- Scroll Left Arrow (Pindah ke Tab Sebelumnya ke Kiri) -->
            <button
                v-if="scrollable && orientation === 'horizontal'"
                type="button"
                @click="goToPrevTab"
                :disabled="!canGoPrev"
                title="Pindah ke Tab Sebelumnya (Kiri)"
                class="shrink-0 mr-2 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer select-none shadow-xs"
                :class="[
                    sizeStyles.arrowBtn,
                    radiusStyles.tab,
                    !canGoPrev ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'hover:scale-105 active:scale-95'
                ]"
            >
                <span class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center" :class="sizeStyles.arrowIcon">chevron_left</span>
            </button>

            <!-- Tablist Track Container -->
            <div
                ref="trackRef"
                role="tablist"
                :aria-orientation="orientation"
                @keydown="onKeydown"
                tabindex="0"
                class="outline-none"
                :class="[
                    orientation === 'vertical'
                        ? [
                            'flex flex-col shrink-0 sm:w-56',
                            normalizedVariant === 'underline' ? 'border-r border-solid border-slate-200 dark:border-slate-800 gap-1' : '',
                            normalizedVariant === 'pills' ? 'gap-2' : '',
                            normalizedVariant === 'segmented' ? `p-1.5 bg-slate-200/70 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700 shadow-inner ${radiusStyles.track} gap-1` : '',
                            normalizedVariant === 'enclosed' ? 'border-r border-solid border-slate-200 dark:border-slate-800 gap-1.5' : '',
                            normalizedVariant === 'boxed' ? 'gap-3' : '',
                            normalizedVariant === 'floating' ? 'p-1.5 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-700/60 shadow-lg shadow-slate-200/60 dark:shadow-black/60 rounded-2xl gap-1.5' : '',
                            normalizedVariant === 'bubble' ? 'gap-2' : '',
                            normalizedVariant === 'lifted' ? 'border-r border-solid border-slate-200 dark:border-slate-800 gap-1.5' : '',
                            normalizedVariant === 'minimal' ? 'gap-3 py-1' : '',
                        ]
                        : [
                            'flex items-center',
                            scrollable ? 'flex-1 min-w-0 overflow-x-auto scrollbar-none' : '',
                            fullWidth && !['segmented', 'floating'].includes(normalizedVariant) ? 'w-full' : '',
                            normalizedVariant === 'underline' ? 'border-b border-solid border-slate-200 dark:border-slate-800 gap-1 sm:gap-2' : '',
                            normalizedVariant === 'pills' ? 'gap-2 sm:gap-2.5' : '',
                            normalizedVariant === 'segmented' ? [
                                (fullWidth || scrollable) ? 'w-full' : 'inline-flex',
                                `p-1.5 bg-slate-200/70 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700 shadow-inner ${radiusStyles.track} gap-1`,
                            ] : '',
                            normalizedVariant === 'enclosed' ? 'border-b border-solid border-slate-200 dark:border-slate-800 gap-1' : '',
                            normalizedVariant === 'boxed' ? 'gap-2.5 sm:gap-3' : '',
                            normalizedVariant === 'floating' ? [
                                (fullWidth || scrollable) ? 'w-full' : 'inline-flex',
                                'p-1.5 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-700/60 shadow-lg shadow-slate-200/60 dark:shadow-black/60 rounded-2xl gap-1.5',
                            ] : '',
                            normalizedVariant === 'bubble' ? 'gap-2 sm:gap-2.5' : '',
                            normalizedVariant === 'lifted' ? 'border-b border-solid border-slate-200 dark:border-slate-800 gap-1 sm:gap-2' : '',
                            normalizedVariant === 'minimal' ? 'gap-4 sm:gap-6' : '',
                        ],
                ]"
            >
                <button
                    v-for="(tab, index) in normalizedTabs"
                    :key="tab.id"
                    role="tab"
                    type="button"
                    :id="`${instanceId}-tab-${tab.id}`"
                    :data-tab-id="tab.id"
                    :aria-selected="activeTabId === tab.id"
                    :aria-controls="`${instanceId}-panel-${tab.id}`"
                    :disabled="tab.disabled"
                    :tabindex="activeTabId === tab.id ? 0 : -1"
                    :class="getTabClass(tab, activeTabId === tab.id)"
                    @click="selectTab(tab, index)"
                >
                    <!-- Dot Indikator Menyala untuk Varian Minimal & Floating -->
                    <span
                        v-if="['minimal', 'floating'].includes(normalizedVariant) && activeTabId === tab.id"
                        class="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                        :class="colorStyles.hairline"
                    />

                    <!-- Hairline Accent Line untuk Enclosed Soft -->
                    <template v-if="['enclosed', 'lifted'].includes(normalizedVariant) && activeTabId === tab.id && resolvedTabStyle === 'soft'">
                        <span
                            v-if="orientation === 'vertical'"
                            class="leading-none select-none shrink-0 pointer-events-none absolute inset-y-0 left-0 w-0.75"
                            :class="colorStyles.hairline"
                        />
                        <span
                            v-else
                            class="leading-none select-none shrink-0 pointer-events-none absolute inset-x-0 top-0 h-0.5"
                            :class="colorStyles.hairline"
                        />
                    </template>

                    <!-- Custom Scoped Slot -->
                    <slot name="tab" :tab="tab" :active="activeTabId === tab.id" :index="index">
                        <!-- Icon Material Symbols -->
                        <span
                            v-if="showIcon && tab.icon"
                            class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center"
                            :class="sizeStyles.icon"
                        >
                            {{ tab.icon }}
                        </span>

                        <!-- Label & Badge -->
                        <span class="leading-none inline-flex items-center" :class="sizeStyles.gap">
                            <span class="leading-none inline-flex items-center whitespace-nowrap">{{ tab.label }}</span>
                            <Badge
                                v-if="showBadge && tab.badge !== null && tab.badge !== undefined"
                                :variant="activeTabId === tab.id && resolvedTabStyle === 'solid' ? 'solid' : 'soft'"
                                :color="getBadgeColor(activeTabId === tab.id)"
                                size="xs"
                                rounded="full"
                                class="leading-none shrink-0"
                            >
                                {{ tab.badge }}
                            </Badge>
                        </span>
                    </slot>
                </button>
            </div>

            <!-- Scroll Right Arrow (Pindah ke Tab Berikutnya ke Kanan) -->
            <button
                v-if="scrollable && orientation === 'horizontal'"
                type="button"
                @click="goToNextTab"
                :disabled="!canGoNext"
                title="Pindah ke Tab Berikutnya (Kanan)"
                class="shrink-0 ml-2 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer select-none shadow-xs"
                :class="[
                    sizeStyles.arrowBtn,
                    radiusStyles.tab,
                    !canGoNext ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'hover:scale-105 active:scale-95'
                ]"
            >
                <span class="material-symbols-outlined leading-none select-none shrink-0 flex items-center justify-center" :class="sizeStyles.arrowIcon">chevron_right</span>
            </button>
        </div>

        <!-- Panel Konten (Dilengkapi Jarak Space yang Bersih & Lega) -->
        <div v-if="!compactPanel" class="flex-1 min-w-0">
            <div
                v-for="(tab, index) in normalizedTabs"
                :key="tab.id"
                role="tabpanel"
                :id="`${instanceId}-panel-${tab.id}`"
                :aria-labelledby="`${instanceId}-tab-${tab.id}`"
                tabindex="0"
                class="focus:outline-none"
                :class="activeTabId === tab.id ? 'block' : 'hidden'"
            >
                <template v-if="!lazy || activeTabId === tab.id">
                    <!-- Named Slot per Tab ID -->
                    <slot
                        :name="tab.id"
                        :tab="tab"
                        :active="activeTabId === tab.id"
                        :index="index"
                    >
                        <!-- Default Slot / Fallback Template yang sama dengan sample.html -->
                        <slot
                            :tab="tab"
                            :active-tab="currentTab"
                            :active-index="activeIndex"
                        >
                            <div :class="panelAttachedCls" class="flex items-start justify-between gap-3">
                                <div class="flex items-start gap-3 min-w-0">
                                    <span
                                        v-if="tab.icon"
                                        class="material-symbols-outlined text-lg mt-0.5 leading-none select-none shrink-0 flex items-center justify-center"
                                        :class="colorStyles.text"
                                    >
                                        {{ tab.icon }}
                                    </span>
                                    <div class="min-w-0 m-0 p-0">
                                        <div class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1 m-0 p-0">
                                            {{ tab.panelTitle || tab.label }}
                                        </div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0 p-0">
                                            {{ tab.panelDesc || 'Konten aktif untuk ' + tab.label }}
                                        </div>
                                    </div>
                                </div>
                                <span
                                    v-if="tab.status"
                                    class="hidden sm:inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 leading-none"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="colorStyles.hairline" />
                                    <span class="leading-none inline-flex items-center">{{ tab.status }}</span>
                                </span>
                            </div>
                        </slot>
                    </slot>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Memastikan bobot font tombol tab konsisten dan proporsional */
.lp-tabs button[role="tab"] {
    border-style: solid;
}

/* Memastikan garis track tablist selalu dirender solid di seluruh browser */
.lp-tabs [role="tablist"] {
    border-style: solid;
}
</style>
