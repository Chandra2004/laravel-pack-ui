<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    /**
     * 3. TEKS KONTEN: Judul dan deskripsi stepper level komponen
     */
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    /**
     * 3. TEKS KONTEN: Daftar langkah
     * Item dapat berupa object: { label/title, description/subtitle, icon, optional, time, badge, disabled }
     * Atau array of string: ['Langkah 1', 'Langkah 2']
     */
    steps: {
        type: Array,
        default: () => [],
    },
    /**
     * Indeks langkah aktif (v-model: 0-indexed)
     */
    modelValue: {
        type: Number,
        default: 0,
    },
    /**
     * 2. BENTUK: Ragam tipe stepper modern:
     * - 'circle': Indikator bulatan klasik (horizontal / vertical)
     * - 'bar' / 'progress': Segmented progress bar wizard modern ala SaaS
     * - 'cards' / 'panel': Multi-stepper interactive card boxes
     * - 'pills': Kapsul langkah terhubung dengan chevron separator
     * - 'timeline': Feed vertikal aktivitas/milestone dengan timestamp & badge
     * - 'dots': Indikator titik kompak untuk carousel/modal
     */
    type: {
        type: String,
        default: 'circle',
        validator: (val) => ['circle', 'bar', 'progress', 'cards', 'panel', 'pills', 'timeline', 'dots'].includes(val),
    },
    /**
     * 2. BENTUK: Orientasi layout (terutama untuk type 'circle' dan 'timeline')
     * - 'horizontal', 'vertical'
     */
    orientation: {
        type: String,
        default: 'horizontal',
        validator: (val) => ['horizontal', 'vertical'].includes(val),
    },
    /**
     * 2. BENTUK: Varian tampilan bulatan / nodus:
     * - 'numbered': Angka urut 1, 2, 3
     * - 'icon': Google Material Symbols
     * - 'dot': Titik minimalis
     */
    variant: {
        type: String,
        default: 'numbered',
        validator: (val) => ['numbered', 'icon', 'dot'].includes(val),
    },
    /**
     * Posisi penempatan informasi teks & skeleton langkah relatif terhadap nodus:
     * - 'bottom': Indikator di atas, informasi teks/skeleton di bawah (default horizontal)
     * - 'top': Indikator di bawah, informasi teks/skeleton di atas
     * - 'right': Indikator di kiri, informasi teks/skeleton di sebelah kanan (default vertikal)
     * - 'left': Indikator di kanan, informasi teks/skeleton di sebelah kiri
     */
    labelPlacement: {
        type: String,
        default: '',
        validator: (val) => ['', 'bottom', 'top', 'right', 'left'].includes(val),
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
            'purple', 'violet',
            'amber', 'warning',
            'rose', 'danger',
            'cyan', 'sky',
            'dark', 'slate',
        ].includes(val),
    },
    /**
     * 1. WARNA: Gaya visual pewarnaan
     * - 'solid': Latar warna pekat dengan teks putih
     * - 'soft': Latar pastel transparan dengan teks & border aksen semantik
     * - 'outline': Border tegas tanpa latar belakang
     */
    stepperStyle: {
        type: String,
        default: 'solid',
        validator: (val) => ['solid', 'soft', 'outline'].includes(val),
    },
    /**
     * 2. BENTUK: Radius kelengkungan sudut
     */
    radius: {
        type: String,
        default: 'full',
        validator: (val) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(val),
    },
    /**
     * 2. BENTUK: Skala ukuran
     */
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
    /**
     * Mode sekuensial: hanya izinkan navigasi ke langkah yang sudah selesai atau berikutnya
     */
    linear: {
        type: Boolean,
        default: false,
    },
    /**
     * Izinkan klik pada langkah untuk navigasi langsung
     */
    clickable: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan deskripsi langkah
     */
    showDescription: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan teks label
     */
    showLabels: {
        type: Boolean,
        default: true,
    },
    /**
     * State loading / skeleton placeholder
     */
    loading: {
        type: Boolean,
        default: false,
    },
    /**
     * Jumlah skeleton yang dirender jika data steps kosong saat loading
     */
    skeletonCount: {
        type: Number,
        default: 4,
    },
    /**
     * 4. ICON: Ikon langkah yang telah tuntas (Google Material Symbols)
     */
    completedIcon: {
        type: String,
        default: 'check',
    },
    /**
     * 4. ICON: Ikon langkah yang error (Google Material Symbols)
     */
    errorIcon: {
        type: String,
        default: 'close',
    },
    /**
     * Indeks langkah-langkah yang memiliki error/validasi gagal (misal [1, 2])
     */
    errorSteps: {
        type: Array,
        default: () => [],
    },
    /**
     * Menampilkan bilah navigasi aksi (Sebelumnya / Selanjutnya / Selesai)
     */
    showActions: {
        type: Boolean,
        default: false,
    },
    /**
     * Teks tombol aksi
     */
    prevText: {
        type: String,
        default: 'Sebelumnya',
    },
    nextText: {
        type: String,
        default: 'Langkah Berikutnya',
    },
    finishText: {
        type: String,
        default: 'Selesai',
    },
});

const emit = defineEmits(['update:modelValue', 'step-click', 'finish']);

const currentStep = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    currentStep.value = val;
});

// Normalisasi tipe stepper
const normalizedType = computed(() => {
    if (props.type === 'progress') return 'bar';
    if (props.type === 'panel') return 'cards';
    return props.type;
});

// Normalisasi daftar steps
const normalizedSteps = computed(() => {
    if (!props.steps || props.steps.length === 0) {
        if (props.loading) {
            return Array.from({ length: props.skeletonCount }, (_, i) => ({
                label: `Langkah ${i + 1}`,
                title: `Langkah ${i + 1}`,
                description: 'Memuat informasi tahapan alur kerja...',
                subtitle: 'Memuat informasi tahapan alur kerja...',
                icon: null,
                optional: false,
                time: null,
                badge: null,
                disabled: false,
            }));
        }
        return [];
    }
    return props.steps.map((s, i) => {
        if (typeof s === 'string') {
            return {
                label: s,
                title: s,
                description: '',
                subtitle: '',
                icon: null,
                optional: false,
                time: null,
                badge: null,
                disabled: false,
            };
        }
        return {
            label: s.title || s.label || `Langkah ${i + 1}`,
            title: s.title || s.label || `Langkah ${i + 1}`,
            description: s.description || s.subtitle || '',
            subtitle: s.description || s.subtitle || '',
            icon: s.icon || null,
            optional: Boolean(s.optional),
            time: s.time || null,
            badge: s.badge || null,
            disabled: Boolean(s.disabled),
        };
    });
});

// Arah penempatan informasi langkah (top, bottom, left, right)
const effectiveLabelPlacement = computed(() => {
    if (props.labelPlacement) return props.labelPlacement;
    if (props.orientation === 'vertical' || normalizedType.value === 'timeline') {
        return 'right';
    }
    return 'bottom';
});

// Status langkah
const getStatus = (index) => {
    if (props.errorSteps.includes(index)) return 'error';
    if (index < currentStep.value) return 'completed';
    if (index === currentStep.value) return 'active';
    return 'pending';
};

const isFirst = computed(() => currentStep.value === 0);
const isLast = computed(() => currentStep.value >= normalizedSteps.value.length - 1);

const canClick = (index) => {
    if (props.loading) return false;
    const step = normalizedSteps.value[index];
    if (step && step.disabled) return false;
    if (!props.clickable) return false;
    if (props.linear) {
        return index <= currentStep.value;
    }
    return true;
};

const goTo = (index) => {
    if (index < 0 || index >= normalizedSteps.value.length) return;
    if (!canClick(index)) return;
    currentStep.value = index;
    emit('update:modelValue', index);
    emit('step-click', index);
};

const next = () => {
    if (currentStep.value < normalizedSteps.value.length - 1) {
        goTo(currentStep.value + 1);
    } else if (isLast.value) {
        emit('finish', currentStep.value);
    }
};

const prev = () => {
    if (currentStep.value > 0) {
        goTo(currentStep.value - 1);
    }
};

// 1. WARNA: Palet tema terpadu
const colorTheme = computed(() => {
    const c = props.color;
    const map = {
        blue: 'primary',
        success: 'emerald',
        violet: 'purple',
        warning: 'amber',
        danger: 'rose',
        sky: 'cyan',
        slate: 'dark',
    };
    const key = map[c] || c;

    switch (key) {
        case 'indigo':
            return {
                solidActive: 'bg-indigo-600 text-white border-indigo-600 ring-indigo-100 dark:ring-indigo-950/60 shadow-xs shadow-indigo-600/20',
                solidCompleted: 'bg-indigo-600 text-white border-indigo-600',
                softActive: 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 dark:ring-indigo-900/40',
                softCompleted: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
                outlineActive: 'bg-transparent text-indigo-600 border-2 border-indigo-600 ring-indigo-100 dark:text-indigo-400 dark:border-indigo-400 dark:ring-indigo-950/50',
                outlineCompleted: 'bg-transparent text-indigo-600 border-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400',
                line: 'bg-indigo-600 dark:bg-indigo-500',
                textActive: 'text-indigo-600 dark:text-indigo-400 font-bold',
                textCompleted: 'text-indigo-600 dark:text-indigo-400 font-semibold',
                cardActive: 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30',
                badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
                dotActive: 'bg-indigo-600 dark:bg-indigo-400',
                dotCompleted: 'bg-indigo-400 dark:bg-indigo-600',
                buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20',
            };
        case 'emerald':
            return {
                solidActive: 'bg-emerald-600 text-white border-emerald-600 ring-emerald-100 dark:ring-emerald-950/60 shadow-xs shadow-emerald-600/20',
                solidCompleted: 'bg-emerald-600 text-white border-emerald-600',
                softActive: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 dark:ring-emerald-900/40',
                softCompleted: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
                outlineActive: 'bg-transparent text-emerald-600 border-2 border-emerald-600 ring-emerald-100 dark:text-emerald-400 dark:border-emerald-400 dark:ring-emerald-950/50',
                outlineCompleted: 'bg-transparent text-emerald-600 border-2 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400',
                line: 'bg-emerald-600 dark:bg-emerald-500',
                textActive: 'text-emerald-600 dark:text-emerald-400 font-bold',
                textCompleted: 'text-emerald-600 dark:text-emerald-400 font-semibold',
                cardActive: 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30',
                badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                dotActive: 'bg-emerald-600 dark:bg-emerald-400',
                dotCompleted: 'bg-emerald-400 dark:bg-emerald-600',
                buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20',
            };
        case 'purple':
            return {
                solidActive: 'bg-purple-600 text-white border-purple-600 ring-purple-100 dark:ring-purple-950/60 shadow-xs shadow-purple-600/20',
                solidCompleted: 'bg-purple-600 text-white border-purple-600',
                softActive: 'bg-purple-50 text-purple-700 border-purple-300 ring-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 dark:ring-purple-900/40',
                softCompleted: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
                outlineActive: 'bg-transparent text-purple-600 border-2 border-purple-600 ring-purple-100 dark:text-purple-400 dark:border-purple-400 dark:ring-purple-950/50',
                outlineCompleted: 'bg-transparent text-purple-600 border-2 border-purple-600 dark:text-purple-400 dark:border-purple-400',
                line: 'bg-purple-600 dark:bg-purple-500',
                textActive: 'text-purple-600 dark:text-purple-400 font-bold',
                textCompleted: 'text-purple-600 dark:text-purple-400 font-semibold',
                cardActive: 'border-purple-500/80 bg-purple-50/40 dark:bg-purple-950/30 ring-2 ring-purple-500/20 dark:ring-purple-500/30',
                badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                dotActive: 'bg-purple-600 dark:bg-purple-400',
                dotCompleted: 'bg-purple-400 dark:bg-purple-600',
                buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-600/20',
            };
        case 'amber':
            return {
                solidActive: 'bg-amber-500 text-white border-amber-500 ring-amber-100 dark:ring-amber-950/60 shadow-xs shadow-amber-500/20',
                solidCompleted: 'bg-amber-500 text-white border-amber-500',
                softActive: 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 dark:ring-amber-900/40',
                softCompleted: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
                outlineActive: 'bg-transparent text-amber-600 border-2 border-amber-500 ring-amber-100 dark:text-amber-400 dark:border-amber-400 dark:ring-amber-950/50',
                outlineCompleted: 'bg-transparent text-amber-600 border-2 border-amber-500 dark:text-amber-400 dark:border-amber-400',
                line: 'bg-amber-500 dark:bg-amber-500',
                textActive: 'text-amber-600 dark:text-amber-400 font-bold',
                textCompleted: 'text-amber-600 dark:text-amber-400 font-semibold',
                cardActive: 'border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-500/20 dark:ring-amber-500/30',
                badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                dotActive: 'bg-amber-500 dark:bg-amber-400',
                dotCompleted: 'bg-amber-400 dark:bg-amber-600',
                buttonPrimary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-500/20',
            };
        case 'rose':
            return {
                solidActive: 'bg-rose-600 text-white border-rose-600 ring-rose-100 dark:ring-rose-950/60 shadow-xs shadow-rose-600/20',
                solidCompleted: 'bg-rose-600 text-white border-rose-600',
                softActive: 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 dark:ring-rose-900/40',
                softCompleted: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
                outlineActive: 'bg-transparent text-rose-600 border-2 border-rose-600 ring-rose-100 dark:text-rose-400 dark:border-rose-400 dark:ring-rose-950/50',
                outlineCompleted: 'bg-transparent text-rose-600 border-2 border-rose-600 dark:text-rose-400 dark:border-rose-400',
                line: 'bg-rose-600 dark:bg-rose-500',
                textActive: 'text-rose-600 dark:text-rose-400 font-bold',
                textCompleted: 'text-rose-600 dark:text-rose-400 font-semibold',
                cardActive: 'border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-500/20 dark:ring-rose-500/30',
                badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
                dotActive: 'bg-rose-600 dark:bg-rose-400',
                dotCompleted: 'bg-rose-400 dark:bg-rose-600',
                buttonPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/20',
            };
        case 'cyan':
            return {
                solidActive: 'bg-cyan-600 text-white border-cyan-600 ring-cyan-100 dark:ring-cyan-950/60 shadow-xs shadow-cyan-600/20',
                solidCompleted: 'bg-cyan-600 text-white border-cyan-600',
                softActive: 'bg-cyan-50 text-cyan-700 border-cyan-300 ring-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800 dark:ring-cyan-900/40',
                softCompleted: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800',
                outlineActive: 'bg-transparent text-cyan-600 border-2 border-cyan-600 ring-cyan-100 dark:text-cyan-400 dark:border-cyan-400 dark:ring-cyan-950/50',
                outlineCompleted: 'bg-transparent text-cyan-600 border-2 border-cyan-600 dark:text-cyan-400 dark:border-cyan-400',
                line: 'bg-cyan-600 dark:bg-cyan-500',
                textActive: 'text-cyan-600 dark:text-cyan-400 font-bold',
                textCompleted: 'text-cyan-600 dark:text-cyan-400 font-semibold',
                cardActive: 'border-cyan-500/80 bg-cyan-50/40 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20 dark:ring-cyan-500/30',
                badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
                dotActive: 'bg-cyan-600 dark:bg-cyan-400',
                dotCompleted: 'bg-cyan-400 dark:bg-cyan-600',
                buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs shadow-cyan-600/20',
            };
        case 'dark':
            return {
                solidActive: 'bg-slate-900 text-white border-slate-900 ring-slate-200 dark:bg-white dark:text-slate-900 dark:border-white dark:ring-slate-700 shadow-xs shadow-slate-900/20',
                solidCompleted: 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200',
                softActive: 'bg-slate-100 text-slate-900 border-slate-300 ring-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:ring-slate-700',
                softCompleted: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
                outlineActive: 'bg-transparent text-slate-900 border-2 border-slate-900 ring-slate-200 dark:text-white dark:border-white dark:ring-slate-800',
                outlineCompleted: 'bg-transparent text-slate-800 border-2 border-slate-800 dark:text-slate-200 dark:border-slate-300',
                line: 'bg-slate-900 dark:bg-slate-300',
                textActive: 'text-slate-900 dark:text-white font-bold',
                textCompleted: 'text-slate-700 dark:text-slate-300 font-semibold',
                cardActive: 'border-slate-800/80 bg-slate-100/60 dark:bg-slate-800/40 ring-2 ring-slate-400/20 dark:border-slate-300 dark:ring-slate-600/30',
                badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
                dotActive: 'bg-slate-900 dark:bg-white',
                dotCompleted: 'bg-slate-500 dark:bg-slate-400',
                buttonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
            };
        case 'primary':
        default:
            return {
                solidActive: 'bg-blue-600 text-white border-blue-600 ring-blue-100 dark:ring-blue-950/60 shadow-xs shadow-blue-600/20',
                solidCompleted: 'bg-blue-600 text-white border-blue-600',
                softActive: 'bg-blue-50 text-blue-700 border-blue-300 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 dark:ring-blue-900/40',
                softCompleted: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
                outlineActive: 'bg-transparent text-blue-600 border-2 border-blue-600 ring-blue-100 dark:text-blue-400 dark:border-blue-400 dark:ring-blue-950/50',
                outlineCompleted: 'bg-transparent text-blue-600 border-2 border-blue-600 dark:text-blue-400 dark:border-blue-400',
                line: 'bg-blue-600 dark:bg-blue-500',
                textActive: 'text-blue-600 dark:text-blue-400 font-bold',
                textCompleted: 'text-blue-600 dark:text-blue-400 font-semibold',
                cardActive: 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 dark:ring-blue-500/30',
                badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                dotActive: 'bg-blue-600 dark:bg-blue-400',
                dotCompleted: 'bg-blue-400 dark:bg-blue-600',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20',
            };
    }
});

const errorClasses = {
    ring: 'bg-rose-600 text-white border-2 border-rose-600 ring-4 ring-rose-100 dark:ring-rose-950/60 shadow-xs shadow-rose-600/20',
    line: 'bg-rose-400 dark:bg-rose-600',
    text: 'text-rose-600 dark:text-rose-400 font-bold',
    card: 'border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-500/20',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

const pendingClasses = {
    ring: 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-2 border-slate-300/90 dark:border-slate-700',
    line: 'bg-slate-200 dark:bg-slate-700/80',
    text: 'text-slate-400 dark:text-slate-500 font-medium',
    card: 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    dot: 'bg-slate-300 dark:bg-slate-700',
};

// 2. BENTUK: Kelas radius & ukuran
const radiusClass = computed(() => {
    switch (props.radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'full':
        default: return 'rounded-full';
    }
});

const cardRadiusClass = computed(() => {
    switch (props.radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-md';
        case 'md': return 'rounded-lg';
        case 'lg': return 'rounded-xl';
        case 'xl':
        case 'full':
        default: return 'rounded-2xl';
    }
});

const indicatorSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                container: 'w-7 h-7 text-xs',
                icon: 'text-[15px]',
                text: 'text-[11px] font-bold',
                dot: 'w-2 h-2',
                line: 'h-0.5',
                cardPadding: 'p-3',
                barHeight: 'h-1.5',
                pillPadding: 'py-1 px-2.5 text-xs',
            };
        case 'lg':
            return {
                container: 'w-11 h-11 text-base',
                icon: 'text-xl',
                text: 'text-sm font-bold',
                dot: 'w-3.5 h-3.5',
                line: 'h-1',
                cardPadding: 'p-5',
                barHeight: 'h-2.5',
                pillPadding: 'py-2 px-4 text-sm',
            };
        case 'md':
        default:
            return {
                container: 'w-9 h-9 text-sm',
                icon: 'text-lg',
                text: 'text-xs font-bold',
                dot: 'w-2.5 h-2.5',
                line: 'h-0.5',
                cardPadding: 'p-4',
                barHeight: 'h-2',
                pillPadding: 'py-1.5 px-3 text-xs',
            };
    }
});

const labelSize = computed(() => {
    switch (props.size) {
        case 'sm': return { label: 'text-xs', desc: 'text-[11px]', badge: 'text-[10px]' };
        case 'lg': return { label: 'text-sm font-semibold', desc: 'text-xs', badge: 'text-xs' };
        case 'md':
        default: return { label: 'text-xs font-semibold', desc: 'text-[11px]', badge: 'text-[10px]' };
    }
});

// Kelas indikator nodus dinamis berdasarkan status & stepperStyle
const getIndicatorClasses = (status) => {
    if (status === 'error') return errorClasses.ring;
    if (status === 'pending') return pendingClasses.ring;

    const isCompleted = status === 'completed';
    const t = colorTheme.value;

    if (props.stepperStyle === 'soft') {
        return isCompleted ? t.softCompleted : `${t.softActive} ring-4`;
    }
    if (props.stepperStyle === 'outline') {
        return isCompleted ? t.outlineCompleted : `${t.outlineActive} ring-4`;
    }
    return isCompleted ? t.solidCompleted : `${t.solidActive} ring-4`;
};

// Kelas teks label dinamis
const getLabelTextClasses = (status) => {
    if (status === 'error') return errorClasses.text;
    if (status === 'completed') return colorTheme.value.textCompleted;
    if (status === 'active') return colorTheme.value.textActive;
    return pendingClasses.text;
};

// Kelas garis konektor
const getConnectorLineClass = (index) => {
    if (props.errorSteps.includes(index)) return errorClasses.line;
    if (index < currentStep.value) return colorTheme.value.line;
    return pendingClasses.line;
};

defineExpose({ next, prev, goTo, currentStep, isFirst, isLast });
</script>

<template>
    <div class="w-full select-none" role="navigation" aria-label="Alur langkah proses">
        <!-- HEADER LEVEL KOMPONEN: Judul, Deskripsi, dan Counter Badge -->
        <div v-if="title || description || $slots.header" class="mb-5">
            <slot name="header">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 v-if="title" class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {{ title }}
                        </h3>
                        <p v-if="description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {{ description }}
                        </p>
                    </div>
                    <div
                        v-if="normalizedSteps.length > 0 && !loading"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 self-start sm:self-auto"
                        :class="colorTheme.badge"
                    >
                        <span>Langkah {{ currentStep + 1 }} dari {{ normalizedSteps.length }}</span>
                    </div>
                </div>
            </slot>
        </div>

        <!-- ===================================================================================== -->
        <!-- SKELETON LOADING STATE TERARAH (Bottom, Top, Right, Left) -->
        <!-- ===================================================================================== -->
        <div v-if="loading" class="w-full py-2 animate-pulse">
            <!-- Skeleton Bar Mode -->
            <div v-if="normalizedType === 'bar'" class="space-y-3">
                <div class="flex justify-between items-center">
                    <div class="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div class="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div class="flex gap-2">
                    <div
                        v-for="n in normalizedSteps.length || skeletonCount"
                        :key="n"
                        class="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full"
                        :class="indicatorSize.barHeight"
                    />
                </div>
            </div>

            <!-- Skeleton Cards Mode -->
            <div
                v-else-if="normalizedType === 'cards'"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
            >
                <div
                    v-for="n in normalizedSteps.length || skeletonCount"
                    :key="n"
                    :class="['border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60', cardRadiusClass, indicatorSize.cardPadding]"
                >
                    <div class="flex items-center justify-between mb-3">
                        <div :class="[indicatorSize.container, radiusClass, 'bg-slate-200 dark:bg-slate-800']" />
                        <div class="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div class="h-3.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                    <div class="h-2.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
            </div>

            <!-- Skeleton Pills Mode -->
            <div v-else-if="normalizedType === 'pills'" class="flex flex-wrap items-center gap-2.5">
                <div
                    v-for="n in normalizedSteps.length || skeletonCount"
                    :key="n"
                    class="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-full"
                />
            </div>

            <!-- Skeleton Dots Mode -->
            <div v-else-if="normalizedType === 'dots'" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div
                        v-for="n in normalizedSteps.length || skeletonCount"
                        :key="n"
                        class="h-2.5 w-2.5 bg-slate-200 dark:bg-slate-800 rounded-full"
                    />
                </div>
                <div class="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            <!-- Skeleton Circle / Timeline dengan Penempatan Terarah (bottom, top, right, left) -->
            <div v-else>
                <!-- Horizontal Orientasi Skeleton -->
                <ol
                    v-if="orientation === 'horizontal' && normalizedType !== 'timeline'"
                    class="flex items-start w-full"
                >
                    <li
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        :class="['flex items-center', index < normalizedSteps.length - 1 ? 'flex-1' : '']"
                    >
                        <!-- Container Step Item dengan arah LabelPlacement -->
                        <div
                            :class="[
                                'flex items-center gap-2 min-w-0',
                                effectiveLabelPlacement === 'bottom' ? 'flex-col text-center' : '',
                                effectiveLabelPlacement === 'top' ? 'flex-col-reverse text-center' : '',
                                effectiveLabelPlacement === 'right' ? 'flex-row text-left' : '',
                                effectiveLabelPlacement === 'left' ? 'flex-row-reverse text-right' : '',
                            ]"
                        >
                            <!-- Nodus Skeleton -->
                            <div :class="[indicatorSize.container, radiusClass, 'bg-slate-200 dark:bg-slate-800 shrink-0']" />
                            <!-- Teks Skeleton -->
                            <div class="space-y-1.5 min-w-[70px]">
                                <div class="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                                <div class="h-2 w-20 bg-slate-100 dark:bg-slate-800/60 rounded mx-auto" />
                            </div>
                        </div>

                        <!-- Connector Skeleton -->
                        <div
                            v-if="index < normalizedSteps.length - 1"
                            class="flex-1 mx-2 sm:mx-3"
                            :class="[
                                effectiveLabelPlacement === 'bottom' ? 'mb-auto mt-3 sm:mt-4' : '',
                                effectiveLabelPlacement === 'top' ? 'mt-auto mb-3 sm:mb-4' : '',
                                ['right', 'left'].includes(effectiveLabelPlacement) ? 'my-auto' : '',
                            ]"
                        >
                            <div :class="[indicatorSize.line, 'w-full rounded-full bg-slate-200 dark:bg-slate-800']" />
                        </div>
                    </li>
                </ol>

                <!-- Vertical / Timeline Orientasi Skeleton -->
                <ol v-else class="space-y-0">
                    <li
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        :class="[
                            'flex gap-3.5',
                            effectiveLabelPlacement === 'left' ? 'flex-row-reverse text-right' : '',
                        ]"
                    >
                        <div class="flex flex-col items-center">
                            <div :class="[indicatorSize.container, radiusClass, 'bg-slate-200 dark:bg-slate-800 shrink-0']" />
                            <div
                                v-if="index < normalizedSteps.length - 1"
                                class="w-0.5 flex-1 min-h-7 my-1 bg-slate-200 dark:bg-slate-800 rounded-full"
                            />
                        </div>
                        <div class="pb-6 pt-1 flex-1 space-y-2">
                            <div class="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div class="h-2.5 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
                        </div>
                    </li>
                </ol>
            </div>
        </div>

        <!-- ===================================================================================== -->
        <!-- REAL CONTENT STATE: MULTI-STEPPER VARIANTS -->
        <!-- ===================================================================================== -->
        <div v-else>
            <!-- 1. TYPE: PROGRESS BAR / SEGMENTED BAR -->
            <div v-if="normalizedType === 'bar'" class="space-y-3">
                <div class="flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900 dark:text-white">
                            {{ normalizedSteps[currentStep]?.label }}
                        </span>
                        <span v-if="normalizedSteps[currentStep]?.optional" class="text-slate-400 italic">
                            (Opsional)
                        </span>
                    </div>
                    <div class="font-semibold text-slate-500 dark:text-slate-400">
                        {{ Math.round(((currentStep + 1) / normalizedSteps.length) * 100) }}% Selesai
                    </div>
                </div>

                <!-- Segmen Bar -->
                <div class="flex items-center gap-2 w-full">
                    <button
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        :class="[
                            'flex-1 relative overflow-hidden transition-all duration-300',
                            indicatorSize.barHeight,
                            radiusClass,
                            index <= currentStep ? colorTheme.line : 'bg-slate-200 dark:bg-slate-800',
                            canClick(index) ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
                        ]"
                        :title="`Langkah ${index + 1}: ${step.label}`"
                    />
                </div>

                <!-- Label Bar Bawah -->
                <div v-if="showLabels" class="hidden sm:grid grid-cols-4 gap-2 pt-1">
                    <button
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        class="text-left transition-colors truncate"
                        :class="canClick(index) ? 'cursor-pointer' : 'cursor-default'"
                    >
                        <span :class="[labelSize.label, getLabelTextClasses(getStatus(index)), 'block truncate']">
                            {{ index + 1 }}. {{ step.label }}
                        </span>
                    </button>
                </div>
            </div>

            <!-- 2. TYPE: MULTI-STEPPER CARDS / PANEL -->
            <div
                v-else-if="normalizedType === 'cards'"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
            >
                <button
                    v-for="(step, index) in normalizedSteps"
                    :key="index"
                    type="button"
                    :disabled="!canClick(index)"
                    @click="goTo(index)"
                    :class="[
                        'text-left transition-all duration-200 border relative flex flex-col justify-between shadow-2xs',
                        cardRadiusClass,
                        indicatorSize.cardPadding,
                        getStatus(index) === 'active' ? colorTheme.cardActive : '',
                        getStatus(index) === 'completed' ? 'border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900' : '',
                        getStatus(index) === 'pending' ? pendingClasses.card : '',
                        getStatus(index) === 'error' ? errorClasses.card : '',
                        canClick(index) ? 'cursor-pointer hover:shadow-xs' : 'cursor-default opacity-85',
                    ]"
                >
                    <div>
                        <!-- Header Kartu: Nodus & Status Tag -->
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span
                                :class="[
                                    'inline-flex items-center justify-center font-bold shrink-0 transition-colors',
                                    indicatorSize.container,
                                    radiusClass,
                                    getIndicatorClasses(getStatus(index)),
                                ]"
                            >
                                <span v-if="getStatus(index) === 'completed'" class="material-symbols-outlined leading-none select-none" :class="indicatorSize.icon">
                                    {{ completedIcon }}
                                </span>
                                <span v-else-if="getStatus(index) === 'error'" class="material-symbols-outlined leading-none select-none" :class="indicatorSize.icon">
                                    {{ errorIcon }}
                                </span>
                                <span v-else-if="variant === 'icon' && step.icon" class="material-symbols-outlined leading-none select-none" :class="indicatorSize.icon">
                                    {{ step.icon }}
                                </span>
                                <span v-else>{{ index + 1 }}</span>
                            </span>

                            <!-- Status Badge -->
                            <span
                                :class="[
                                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                    getStatus(index) === 'active' ? colorTheme.badge : '',
                                    getStatus(index) === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : '',
                                    getStatus(index) === 'pending' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : '',
                                    getStatus(index) === 'error' ? errorClasses.badge : '',
                                ]"
                            >
                                {{ step.badge || (getStatus(index) === 'completed' ? 'Selesai' : (getStatus(index) === 'active' ? 'Aktif' : (getStatus(index) === 'error' ? 'Error' : 'Pending'))) }}
                            </span>
                        </div>

                        <!-- Judul & Deskripsi Kartu -->
                        <h4 :class="[labelSize.label, getLabelTextClasses(getStatus(index)), 'leading-tight']">
                            {{ step.label }}
                        </h4>
                        <p
                            v-if="showDescription && step.description"
                            :class="[labelSize.desc, 'text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed']"
                        >
                            {{ step.description }}
                        </p>
                    </div>

                    <!-- Footer Kartu: Timestamp / Opsional Tag -->
                    <div v-if="step.time || step.optional" class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span v-if="step.time" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-[13px] leading-none">schedule</span>
                            {{ step.time }}
                        </span>
                        <span v-if="step.optional" class="italic">Opsional</span>
                    </div>
                </button>
            </div>

            <!-- 3. TYPE: CAPSULE PILLS -->
            <div v-else-if="normalizedType === 'pills'" class="flex flex-wrap items-center gap-2">
                <template v-for="(step, index) in normalizedSteps" :key="index">
                    <button
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        :class="[
                            'inline-flex items-center gap-2 transition-all font-medium select-none shadow-2xs',
                            radiusClass,
                            indicatorSize.pillPadding,
                            getStatus(index) === 'active' ? getIndicatorClasses('active') : '',
                            getStatus(index) === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700' : '',
                            getStatus(index) === 'pending' ? 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800' : '',
                            getStatus(index) === 'error' ? errorClasses.ring : '',
                            canClick(index) ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
                        ]"
                    >
                        <span
                            :class="[
                                'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0',
                                getStatus(index) === 'active' ? 'bg-white/20 text-current' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                            ]"
                        >
                            <span v-if="getStatus(index) === 'completed'" class="material-symbols-outlined text-[13px] leading-none">
                                {{ completedIcon }}
                            </span>
                            <span v-else-if="getStatus(index) === 'error'" class="material-symbols-outlined text-[13px] leading-none">
                                {{ errorIcon }}
                            </span>
                            <span v-else>{{ index + 1 }}</span>
                        </span>
                        <span class="truncate">{{ step.label }}</span>
                    </button>

                    <!-- Chevron Separator -->
                    <span
                        v-if="index < normalizedSteps.length - 1"
                        class="material-symbols-outlined text-sm text-slate-300 dark:text-slate-600 select-none leading-none shrink-0"
                    >
                        chevron_right
                    </span>
                </template>
            </div>

            <!-- 4. TYPE: COMPACT DOTS -->
            <div v-else-if="normalizedType === 'dots'" class="flex items-center justify-between gap-4 py-1">
                <div class="flex items-center gap-2">
                    <button
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        type="button"
                        :disabled="!canClick(index)"
                        @click="goTo(index)"
                        :class="[
                            'transition-all duration-300 rounded-full select-none',
                            getStatus(index) === 'active' ? `w-7 h-2.5 ${colorTheme.dotActive}` : 'w-2.5 h-2.5',
                            getStatus(index) === 'completed' ? colorTheme.dotCompleted : '',
                            getStatus(index) === 'pending' ? pendingClasses.dot : '',
                            getStatus(index) === 'error' ? 'bg-rose-500' : '',
                            canClick(index) ? 'cursor-pointer' : 'cursor-default',
                        ]"
                        :title="`Langkah ${index + 1}: ${step.label}`"
                    />
                </div>

                <div class="text-right">
                    <span :class="[labelSize.label, 'font-bold text-slate-900 dark:text-white block']">
                        {{ normalizedSteps[currentStep]?.label }}
                    </span>
                    <span class="text-[11px] text-slate-400">
                        {{ currentStep + 1 }} dari {{ normalizedSteps.length }} langkah
                    </span>
                </div>
            </div>

            <!-- 5. TYPE: CIRCLE (Classic Horizontal & Vertical) atau TIMELINE -->
            <div v-else>
                <!-- HORIZONTAL ORIENTATION (Circle) -->
                <ol
                    v-if="orientation === 'horizontal' && normalizedType !== 'timeline'"
                    class="flex items-start w-full"
                >
                    <li
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        :class="['flex items-center', index < normalizedSteps.length - 1 ? 'flex-1' : '']"
                    >
                        <!-- Wadah Nodus dan Teks dengan penempatan terarah (bottom, top, right, left) -->
                        <div
                            :class="[
                                'flex items-center gap-2 min-w-0',
                                effectiveLabelPlacement === 'bottom' ? 'flex-col text-center' : '',
                                effectiveLabelPlacement === 'top' ? 'flex-col-reverse text-center' : '',
                                effectiveLabelPlacement === 'right' ? 'flex-row text-left' : '',
                                effectiveLabelPlacement === 'left' ? 'flex-row-reverse text-right' : '',
                            ]"
                        >
                            <!-- Step Nodus Button -->
                            <button
                                type="button"
                                :disabled="!canClick(index)"
                                @click="goTo(index)"
                                :aria-current="getStatus(index) === 'active' ? 'step' : undefined"
                                :aria-label="`Langkah ${index + 1}: ${step.label || ''}`"
                                :class="[
                                    'inline-flex items-center justify-center transition-all duration-200 shrink-0 select-none leading-none',
                                    indicatorSize.container,
                                    radiusClass,
                                    getIndicatorClasses(getStatus(index)),
                                    canClick(index) ? 'cursor-pointer' : 'cursor-default',
                                ]"
                            >
                                <slot name="step" :step="step" :index="index" :status="getStatus(index)">
                                    <!-- Completed: Check icon -->
                                    <span
                                        v-if="getStatus(index) === 'completed'"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ completedIcon }}
                                    </span>

                                    <!-- Error: Error icon -->
                                    <span
                                        v-else-if="getStatus(index) === 'error'"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ errorIcon }}
                                    </span>

                                    <!-- Icon variant -->
                                    <span
                                        v-else-if="variant === 'icon' && step.icon"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ step.icon }}
                                    </span>

                                    <!-- Numbered variant -->
                                    <span v-else-if="variant === 'numbered'" :class="indicatorSize.text">
                                        {{ index + 1 }}
                                    </span>

                                    <!-- Dot variant -->
                                    <span
                                        v-else
                                        :class="[
                                            indicatorSize.dot,
                                            radiusClass,
                                            getStatus(index) === 'active' ? colorTheme.dotActive : 'bg-current',
                                        ]"
                                    />
                                </slot>
                            </button>

                            <!-- Step Label & Description -->
                            <div
                                v-if="showLabels"
                                :class="[
                                    'min-w-0',
                                    ['bottom', 'top'].includes(effectiveLabelPlacement) ? 'max-w-24 sm:max-w-36' : 'max-w-44',
                                ]"
                            >
                                <slot name="label" :step="step" :index="index" :status="getStatus(index)">
                                    <p :class="[labelSize.label, getLabelTextClasses(getStatus(index)), 'leading-tight truncate']">
                                        {{ step.label }}
                                    </p>
                                    <p
                                        v-if="showDescription && step.description"
                                        :class="[labelSize.desc, 'text-slate-400 dark:text-slate-500 leading-tight mt-0.5 line-clamp-2']"
                                    >
                                        {{ step.description }}
                                    </p>
                                    <span
                                        v-if="step.optional"
                                        :class="[labelSize.desc, 'text-slate-400 dark:text-slate-500 italic block mt-0.5']"
                                    >
                                        Opsional
                                    </span>
                                </slot>
                            </div>
                        </div>

                        <!-- Connector Line -->
                        <div
                            v-if="index < normalizedSteps.length - 1"
                            class="flex-1 mx-2 sm:mx-3"
                            :class="[
                                effectiveLabelPlacement === 'bottom' ? 'mb-auto mt-3.5 sm:mt-[17px]' : '',
                                effectiveLabelPlacement === 'top' ? 'mt-auto mb-3.5 sm:mb-[17px]' : '',
                                ['right', 'left'].includes(effectiveLabelPlacement) ? 'my-auto' : '',
                            ]"
                        >
                            <div
                                :class="[
                                    indicatorSize.line,
                                    'w-full rounded-full transition-colors duration-300',
                                    getConnectorLineClass(index),
                                ]"
                            />
                        </div>
                    </li>
                </ol>

                <!-- VERTICAL ORIENTATION (Circle atau Timeline) -->
                <ol v-else class="space-y-0">
                    <li
                        v-for="(step, index) in normalizedSteps"
                        :key="index"
                        :class="[
                            'flex gap-3.5',
                            effectiveLabelPlacement === 'left' ? 'flex-row-reverse text-right' : '',
                        ]"
                    >
                        <!-- Kolom Indikator & Garis Vertikal -->
                        <div class="flex flex-col items-center">
                            <!-- Nodus Tombol -->
                            <button
                                type="button"
                                :disabled="!canClick(index)"
                                @click="goTo(index)"
                                :aria-current="getStatus(index) === 'active' ? 'step' : undefined"
                                :aria-label="`Langkah ${index + 1}: ${step.label || ''}`"
                                :class="[
                                    'inline-flex items-center justify-center transition-all duration-200 shrink-0 select-none leading-none',
                                    indicatorSize.container,
                                    radiusClass,
                                    getIndicatorClasses(getStatus(index)),
                                    canClick(index) ? 'cursor-pointer' : 'cursor-default',
                                ]"
                            >
                                <slot name="step" :step="step" :index="index" :status="getStatus(index)">
                                    <span
                                        v-if="getStatus(index) === 'completed'"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ completedIcon }}
                                    </span>
                                    <span
                                        v-else-if="getStatus(index) === 'error'"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ errorIcon }}
                                    </span>
                                    <span
                                        v-else-if="variant === 'icon' && step.icon"
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="indicatorSize.icon"
                                    >
                                        {{ step.icon }}
                                    </span>
                                    <span v-else-if="variant === 'numbered'" :class="indicatorSize.text">
                                        {{ index + 1 }}
                                    </span>
                                    <span
                                        v-else
                                        :class="[
                                            indicatorSize.dot,
                                            radiusClass,
                                            getStatus(index) === 'active' ? colorTheme.dotActive : 'bg-current',
                                        ]"
                                    />
                                </slot>
                            </button>

                            <!-- Vertical Line Connector -->
                            <div
                                v-if="index < normalizedSteps.length - 1"
                                class="w-0.5 flex-1 min-h-7 my-1 rounded-full transition-colors duration-300"
                                :class="getConnectorLineClass(index)"
                            />
                        </div>

                        <!-- Kolom Konten Teks Langkah -->
                        <div :class="['pb-6 pt-1 flex-1 min-w-0', index === normalizedSteps.length - 1 ? 'pb-0' : '']">
                            <slot name="label" :step="step" :index="index" :status="getStatus(index)">
                                <div class="flex items-center gap-2" :class="effectiveLabelPlacement === 'left' ? 'justify-end' : ''">
                                    <p :class="[labelSize.label, getLabelTextClasses(getStatus(index)), 'leading-tight']">
                                        {{ step.label }}
                                    </p>
                                    <span
                                        v-if="step.badge"
                                        :class="['px-2 py-0.2 text-[10px] font-bold rounded-full', colorTheme.badge]"
                                    >
                                        {{ step.badge }}
                                    </span>
                                    <span v-if="step.optional" class="text-slate-400 text-xs italic">
                                        (Opsional)
                                    </span>
                                </div>

                                <div v-if="step.time" class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1" :class="effectiveLabelPlacement === 'left' ? 'justify-end' : ''">
                                    <span class="material-symbols-outlined text-[13px] leading-none">schedule</span>
                                    {{ step.time }}
                                </div>

                                <p
                                    v-if="showDescription && step.description"
                                    :class="[labelSize.desc, 'text-slate-500 dark:text-slate-400 leading-relaxed mt-1']"
                                >
                                    {{ step.description }}
                                </p>
                            </slot>

                            <!-- Slot Konten Langkah Inline pada mode Vertikal/Timeline -->
                            <div v-if="$slots.content && index === currentStep" class="mt-3">
                                <slot name="content" :step="normalizedSteps[currentStep]" :index="currentStep" />
                            </div>
                        </div>
                    </li>
                </ol>
            </div>
        </div>

        <!-- ===================================================================================== -->
        <!-- STEP CONTENT PANEL (Slot default untuk mode Horizontal/Bar/Cards/Pills/Dots) -->
        <!-- ===================================================================================== -->
        <div
            v-if="$slots.content && (orientation === 'horizontal' || ['bar', 'cards', 'pills', 'dots'].includes(normalizedType))"
            class="mt-6"
        >
            <slot name="content" :step="normalizedSteps[currentStep]" :index="currentStep" />
        </div>

        <!-- ===================================================================================== -->
        <!-- BILAH NAVIGASI AKSI (Slot #actions atau Tombol Bawaan showActions) -->
        <!-- ===================================================================================== -->
        <div
            v-if="showActions || $slots.actions"
            class="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
        >
            <slot
                name="actions"
                :currentStep="currentStep"
                :isFirst="isFirst"
                :isLast="isLast"
                :next="next"
                :prev="prev"
                :goTo="goTo"
            >
                <button
                    type="button"
                    :disabled="isFirst"
                    @click="prev"
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <span class="material-symbols-outlined text-sm leading-none">arrow_back</span>
                    {{ prevText }}
                </button>

                <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {{ currentStep + 1 }} / {{ normalizedSteps.length }}
                </span>

                <button
                    v-if="!isLast"
                    type="button"
                    @click="next"
                    class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    :class="colorTheme.buttonPrimary"
                >
                    {{ nextText }}
                    <span class="material-symbols-outlined text-sm leading-none">arrow_forward</span>
                </button>
                <button
                    v-else
                    type="button"
                    @click="emit('finish', currentStep)"
                    class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    {{ finishText }}
                    <span class="material-symbols-outlined text-sm leading-none">check</span>
                </button>
            </slot>
        </div>
    </div>
</template>
