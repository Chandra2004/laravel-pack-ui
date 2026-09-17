<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useClickOutside } from '@/Composables/Pack/useClickOutside.js';

const props = defineProps({
    /**
     * Nilai v-model berupa array string atau array objek: ['olahraga', 'sepak bola']
     */
    modelValue: {
        type: [Array, String],
        default: () => [],
    },
    /**
     * Daftar opsi yang disarankan atau diizinkan: ['Laravel', 'Vue', 'Tailwind']
     * Atau array objek: [{ label: 'Sepak Bola', value: 'sepak_bola', icon: 'sports_soccer' }]
     */
    options: {
        type: Array,
        default: () => [],
    },
    /**
     * Izinkan membuat tag baru secara bebas (Tag Random)
     * - true: Tag Random & Tag Random + Option (Hybrid Creatable)
     * - false: Tag hanya boleh dipilih dari daftar options (Strict Preset)
     */
    allowCustom: {
        type: Boolean,
        default: true,
    },
    /**
     * Tombol pemicu pembuatan tag saat mengetik
     * Default: Tab, Enter, dan Koma (',')
     */
    separatorKeys: {
        type: Array,
        default: () => ['Tab', 'Enter', ','],
    },
    /**
     * Izinkan tag duplikat
     */
    allowDuplicates: {
        type: Boolean,
        default: false,
    },
    /**
     * Batas maksimal jumlah tag
     */
    maxTags: {
        type: Number,
        default: null,
    },
    /**
     * 1. WARNA: Skema warna tag chip:
     * - 'default', 'primary', 'emerald', 'indigo', 'rose', 'amber', 'purple', 'dark', 'cyan', 'random'
     */
    tagVariant: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'primary', 'emerald', 'indigo', 'rose', 'amber', 'purple', 'dark', 'cyan', 'random'].includes(v),
    },
    /**
     * 1. WARNA: Gaya visual tag chip:
     * - 'soft': Latar pastel lembut dengan border (default)
     * - 'solid': Warna penuh kontras tinggi dengan teks putih
     * - 'outline': Border tegas dengan latar transparan
     */
    tagStyle: {
        type: String,
        default: 'soft',
        validator: (v) => ['soft', 'solid', 'outline'].includes(v),
    },
    /**
     * 2. BENTUK: Kelengkungan border container dan tag chip
     */
    radius: {
        type: String,
        default: 'xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(v),
    },
    /**
     * 2. BENTUK: Ukuran komponen (sm, md, lg)
     */
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    /**
     * 3. TEKS KONTEN: Label, placeholder, hint, error
     */
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Ketik tag lalu tekan Tab atau Enter...',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    /**
     * 4. ICON: Ikon leading pada input box & tag chips
     */
    icon: {
        type: String,
        default: '',
    },
    tagIcon: {
        type: String,
        default: '',
    },
    /**
     * Buat tag otomatis saat input kehilangan fokus (blur)
     */
    addOnBlur: {
        type: Boolean,
        default: true,
    },
    /**
     * Apakah tag dapat dihapus pengguna
     */
    removable: {
        type: Boolean,
        default: true,
    },
    /**
     * Hapus tag terakhir saat menekan Backspace di input kosong
     */
    removeOnBackspace: {
        type: Boolean,
        default: true,
    },
    /**
     * Tampilkan tombol hapus semua tag
     */
    clearable: {
        type: Boolean,
        default: true,
    },
    /**
     * Karakter pemisah saat mem-paste teks
     */
    pasteSeparators: {
        type: Array,
        default: () => [',', ';', '\n', '\t'],
    },
    /**
     * Mengubah seluruh tag menjadi huruf kecil otomatis
     */
    lowercase: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'tag-add', 'tag-remove', 'max-tags-reached']);

// State Internal
const containerRef = ref(null);
const inputRef = ref(null);
const inputValue = ref('');
const isFocused = ref(false);
const isDropdownOpen = ref(false);
const highlightedIndex = ref(-1);

// Normalisasi Nilai Tags dari props
const currentTags = computed(() => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.map((item) => {
            if (typeof item === 'object' && item !== null) {
                return item.label || item.value || String(item);
            }
            return String(item);
        });
    }
    if (typeof props.modelValue === 'string' && props.modelValue.trim() !== '') {
        return props.modelValue.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
});

// Normalisasi Daftar Options
const normalizedOptions = computed(() => {
    return props.options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                label: String(opt.label ?? opt.value ?? opt.name ?? ''),
                value: opt.value ?? opt.label ?? opt.id ?? '',
                subtext: opt.subtext || '',
                icon: opt.icon || '',
            };
        }
        return {
            label: String(opt),
            value: String(opt),
            subtext: '',
            icon: '',
        };
    });
});

// Helper mencari ikon untuk sebuah tag
const getTagIcon = (tagText) => {
    if (props.tagIcon) return props.tagIcon;
    const found = normalizedOptions.value.find(
        (o) => o.label.toLowerCase() === String(tagText).toLowerCase()
    );
    return found?.icon || '';
};

// Filter Options Berdasarkan Ketikan Input dan Exclude Tag yang Sudah Dipilih
const filteredOptions = computed(() => {
    const query = inputValue.value.trim().toLowerCase();
    return normalizedOptions.value.filter((opt) => {
        const isAlreadySelected = !props.allowDuplicates && currentTags.value.some((t) => t.toLowerCase() === opt.label.toLowerCase());
        if (isAlreadySelected) return false;
        if (!query) return true;
        return opt.label.toLowerCase().includes(query) || (opt.subtext && opt.subtext.toLowerCase().includes(query));
    });
});

// Menutup Dropdown saat Klik di Luar Kontainer
useClickOutside(containerRef, () => {
    closeDropdown();
});

// Palet Warna Acak / Deterministik Berdasarkan String Hash
const getRandomColorClasses = (text) => {
    const colors = [
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80',
        'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
        'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
        'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80',
        'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80',
        'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/80',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// 1. WARNA: Styling Varian & Style Tag Chip
const getTagClasses = (tagText) => {
    if (props.tagVariant === 'random') {
        return getRandomColorClasses(tagText);
    }

    const isSolid = props.tagStyle === 'solid';
    const isOutline = props.tagStyle === 'outline';

    switch (props.tagVariant) {
        case 'primary':
            if (isSolid) return 'bg-blue-600 text-white border-blue-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400';
            return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80';

        case 'emerald':
            if (isSolid) return 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-400';
            return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80';

        case 'indigo':
            if (isSolid) return 'bg-indigo-600 text-white border-indigo-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-indigo-600 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400';
            return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80';

        case 'rose':
            if (isSolid) return 'bg-rose-600 text-white border-rose-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-rose-600 dark:text-rose-400 border-rose-500 dark:border-rose-400';
            return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80';

        case 'amber':
            if (isSolid) return 'bg-amber-600 text-white border-amber-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-amber-600 dark:text-amber-400 border-amber-500 dark:border-amber-400';
            return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80';

        case 'purple':
            if (isSolid) return 'bg-purple-600 text-white border-purple-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-500 dark:border-purple-400';
            return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80';

        case 'cyan':
            if (isSolid) return 'bg-cyan-600 text-white border-cyan-600 shadow-xs';
            if (isOutline) return 'bg-transparent text-cyan-600 dark:text-cyan-400 border-cyan-500 dark:border-cyan-400';
            return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80';

        case 'dark':
            if (isSolid) return 'bg-zinc-900 text-white border-zinc-900 shadow-xs';
            if (isOutline) return 'bg-transparent text-zinc-900 dark:text-zinc-100 border-zinc-700 dark:border-zinc-300';
            return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';

        case 'default':
        default:
            if (isSolid) return 'bg-slate-800 text-white border-slate-800 shadow-xs';
            if (isOutline) return 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
            return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80';
    }
};

// 2. BENTUK: Helper class radius
const getRadiusClass = (radius) => {
    switch (radius) {
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

const getChipRadiusClass = (radius) => {
    switch (radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-xs';
        case 'md': return 'rounded-sm';
        case 'lg': return 'rounded-md';
        case 'xl': return 'rounded-lg';
        case '2xl': return 'rounded-xl';
        case 'full': return 'rounded-full';
        default: return 'rounded-lg';
    }
};

// 2. BENTUK & UKURAN: Proporsi ukuran terstandarisasi dengan centering presisi
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                wrapper: 'min-h-8 p-1 text-xs gap-1',
                tag: 'px-2 py-0.5 text-[11px] gap-1',
                tagIcon: 'text-[12px]',
                removeBtn: 'w-3 h-3',
                removeIcon: 'text-[11px]',
                input: 'text-xs py-0.5 px-1 min-w-20',
                clearBtn: 'w-5 h-5',
                clearIcon: 'text-[14px]',
                inputIcon: 'text-[15px]',
            };
        case 'lg':
            return {
                wrapper: 'min-h-12 p-2 text-base gap-2',
                tag: 'px-3 py-1 text-sm gap-1.5 font-medium',
                tagIcon: 'text-[16px]',
                removeBtn: 'w-4 h-4',
                removeIcon: 'text-[14px]',
                input: 'text-base py-1 px-1.5 min-w-32',
                clearBtn: 'w-7 h-7',
                clearIcon: 'text-[18px]',
                inputIcon: 'text-[20px]',
            };
        case 'md':
        default:
            return {
                wrapper: 'min-h-10 p-1.5 text-xs sm:text-sm gap-1.5',
                tag: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
                tagIcon: 'text-[14px]',
                removeBtn: 'w-3.5 h-3.5',
                removeIcon: 'text-[12px]',
                input: 'text-xs sm:text-sm py-1 px-1 min-w-24',
                clearBtn: 'w-6 h-6',
                clearIcon: 'text-[16px]',
                inputIcon: 'text-[18px]',
            };
    }
});

// Menambahkan Tag Baru
const addTag = (text) => {
    if (props.disabled || props.readonly) return;
    if (!text || typeof text !== 'string') return;

    let cleanText = text.trim();
    if (props.lowercase) {
        cleanText = cleanText.toLowerCase();
    }

    if (!cleanText) return;

    // Cek batas maksimum tag
    if (props.maxTags !== null && currentTags.value.length >= props.maxTags) {
        emit('max-tags-reached', props.maxTags);
        return;
    }

    // Cek apakah tag sudah ada jika duplikasi dilarang
    if (!props.allowDuplicates && currentTags.value.some((t) => t.toLowerCase() === cleanText.toLowerCase())) {
        inputValue.value = '';
        return;
    }

    // Jika allowCustom false, hanya boleh memilih dari options
    if (!props.allowCustom) {
        const matchesOption = normalizedOptions.value.some(
            (opt) => opt.label.toLowerCase() === cleanText.toLowerCase()
        );
        if (!matchesOption) {
            inputValue.value = '';
            return;
        }
    }

    const updatedTags = [...currentTags.value, cleanText];
    emit('update:modelValue', updatedTags);
    emit('change', updatedTags);
    emit('tag-add', cleanText);

    inputValue.value = '';
    highlightedIndex.value = -1;

    nextTick(() => {
        focusInput();
    });
};

// Menghapus Tag
const removeTag = (index) => {
    if (props.disabled || props.readonly || !props.removable) return;
    const removedText = currentTags.value[index];
    const updatedTags = currentTags.value.filter((_, idx) => idx !== index);

    emit('update:modelValue', updatedTags);
    emit('change', updatedTags);
    emit('tag-remove', removedText, index);

    nextTick(() => {
        focusInput();
    });
};

// Menghapus Semua Tag
const clearAllTags = () => {
    if (props.disabled || props.readonly) return;
    emit('update:modelValue', []);
    emit('change', []);
    inputValue.value = '';
    nextTick(() => {
        focusInput();
    });
};

// Fokus ke Input Text
const focusInput = () => {
    if (inputRef.value) {
        inputRef.value.focus();
    }
};

// Event Handler Keyboard
const handleKeyDown = (e) => {
    if (props.disabled || props.readonly) return;

    // Navigasi Panah Bawah / Atas pada Dropdown Opsi
    if (isDropdownOpen.value && filteredOptions.value.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length;
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex.value = (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length;
            return;
        }
        if (e.key === 'Escape') {
            closeDropdown();
            return;
        }
    }

    // Jika ada separator key (Tab, Enter, Koma) ditekan
    const isSeparatorKey = props.separatorKeys.includes(e.key) || (e.key === ',' && props.separatorKeys.includes(','));
    if (isSeparatorKey) {
        // Jika ada opsi dropdown yang sedang di-highlight
        if (isDropdownOpen.value && highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
            e.preventDefault();
            const selected = filteredOptions.value[highlightedIndex.value];
            addTag(selected.label);
            closeDropdown();
            return;
        }

        // Buat tag dari ketikan saat ini
        if (inputValue.value.trim().length > 0) {
            e.preventDefault();
            addTag(inputValue.value);
            closeDropdown();
            return;
        }
    }

    // Hapus tag terakhir jika menekan Backspace pada input kosong
    if (e.key === 'Backspace' && inputValue.value === '' && props.removeOnBackspace && currentTags.value.length > 0) {
        removeTag(currentTags.value.length - 1);
    }
};

// Event Paste Teks
const handlePaste = (e) => {
    if (props.disabled || props.readonly) return;
    const pastedText = e.clipboardData?.getData('text');
    if (!pastedText) return;

    const hasSeparator = props.pasteSeparators.some((sep) => pastedText.includes(sep));
    if (hasSeparator) {
        e.preventDefault();
        const regex = new RegExp(`[${props.pasteSeparators.map((s) => (s === '\n' ? '\\n' : s === '\t' ? '\\t' : `\\${s}`)).join('')}]`, 'g');
        const pieces = pastedText.split(regex).map((s) => s.trim()).filter(Boolean);
        pieces.forEach((piece) => {
            addTag(piece);
        });
    }
};

// Event Focus & Blur
const handleFocus = () => {
    if (props.disabled || props.readonly) return;
    isFocused.value = true;
    if (normalizedOptions.value.length > 0) {
        openDropdown();
    }
};

const handleBlur = () => {
    isFocused.value = false;
    if (props.addOnBlur && inputValue.value.trim().length > 0) {
        addTag(inputValue.value);
    }
    setTimeout(() => {
        closeDropdown();
    }, 150);
};

const handleInput = () => {
    if (normalizedOptions.value.length > 0 && !isDropdownOpen.value) {
        openDropdown();
    }
    highlightedIndex.value = -1;
};

const openDropdown = () => {
    isDropdownOpen.value = true;
};

const closeDropdown = () => {
    isDropdownOpen.value = false;
    highlightedIndex.value = -1;
};

const selectOption = (opt) => {
    addTag(opt.label);
    closeDropdown();
};
</script>

<template>
    <div class="space-y-1.5 w-full select-none" ref="containerRef">
        <!-- 3. TEKS KONTEN: Label & Required Asterisk -->
        <div v-if="label" class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {{ label }}
                <span v-if="required" class="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <!-- Indikator Hitungan Tag Maksimum -->
            <span v-if="maxTags !== null" class="text-[11px] text-slate-400">
                {{ currentTags.length }} / {{ maxTags }} tag
            </span>
        </div>

        <!-- Relative Wrapper Pembungkus Input Box & Dropdown Options -->
        <div class="relative w-full">
            <!-- Box Container Input Tag -->
            <div
                class="flex flex-wrap items-center w-full border transition-all duration-150 bg-white dark:bg-slate-900 cursor-text group"
                :class="[
                    sizeClasses.wrapper,
                    getRadiusClass(radius),
                    error
                        ? 'border-rose-300 dark:border-rose-800 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500'
                        : isFocused
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                    disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40' : '',
                ]"
                @click="focusInput"
            >
                <!-- 4. ICON: Leading Input Icon (opsional) -->
                <slot name="prefix">
                    <span
                        v-if="icon"
                        class="material-symbols-outlined text-slate-400 dark:text-slate-500 select-none shrink-0 leading-none pl-1"
                        :class="sizeClasses.inputIcon"
                    >
                        {{ icon }}
                    </span>
                </slot>

                <!-- Daftar Chip Tag Terpilih -->
                <TransitionGroup
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-75"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-75"
                >
                    <template v-for="(tag, index) in currentTags" :key="`${tag}-${index}`">
                        <!-- Scoped Slot: Custom Tag Chip -->
                        <slot
                            name="tag"
                            :tag="tag"
                            :index="index"
                            :remove="() => removeTag(index)"
                            :icon="getTagIcon(tag)"
                            :variant-classes="getTagClasses(tag)"
                        >
                            <div
                                class="inline-flex items-center justify-center border shadow-2xs select-none shrink-0 font-medium leading-none"
                                :class="[
                                    sizeClasses.tag,
                                    getChipRadiusClass(radius),
                                    getTagClasses(tag),
                                ]"
                            >
                                <!-- 4. ICON: Leading Tag Icon (jika ada) -->
                                <span
                                    v-if="getTagIcon(tag)"
                                    class="material-symbols-outlined shrink-0 leading-none select-none"
                                    :class="sizeClasses.tagIcon"
                                >
                                    {{ getTagIcon(tag) }}
                                </span>

                                <!-- 3. TEKS KONTEN: Label Tag -->
                                <span class="truncate max-w-56 leading-none select-text flex items-center">
                                    {{ tag }}
                                </span>

                                <!-- Tombol Hapus Tag 'x' dengan Rata Tengah Sempurna -->
                                <button
                                    v-if="removable && !disabled && !readonly"
                                    type="button"
                                    class="inline-flex items-center justify-center shrink-0 rounded-full text-current opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/15 transition-all cursor-pointer"
                                    :class="sizeClasses.removeBtn"
                                    :title="`Hapus tag ${tag}`"
                                    @click.stop="removeTag(index)"
                                >
                                    <span
                                        class="material-symbols-outlined leading-none select-none"
                                        :class="sizeClasses.removeIcon"
                                    >
                                        close
                                    </span>
                                </button>
                            </div>
                        </slot>
                    </template>
                </TransitionGroup>

                <!-- Text Input Field (Tempat Pengguna Mengetik) -->
                <input
                    ref="inputRef"
                    type="text"
                    v-model="inputValue"
                    :placeholder="currentTags.length === 0 ? placeholder : ''"
                    :disabled="disabled || (maxTags !== null && currentTags.length >= maxTags)"
                    :readonly="readonly"
                    class="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
                    :class="sizeClasses.input"
                    @keydown="handleKeyDown"
                    @paste="handlePaste"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @input="handleInput"
                />

                <!-- Tombol Clear All di Sebelah Kanan dengan Centering Presisi -->
                <div
                    v-if="clearable && currentTags.length > 0 && !disabled && !readonly"
                    class="ml-auto pr-0.5 shrink-0 flex items-center justify-center"
                >
                    <button
                        type="button"
                        class="inline-flex items-center justify-center shrink-0 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        :class="sizeClasses.clearBtn"
                        title="Hapus Semua Tag"
                        @click.stop="clearAllTags"
                    >
                        <span
                            class="material-symbols-outlined leading-none"
                            :class="sizeClasses.clearIcon"
                        >
                            close
                        </span>
                    </button>
                </div>
            </div>

            <!-- ========================================================= -->
            <!-- DROPDOWN OPTIONS (AUTOCOMPLETE / PRESET OPTIONS)           -->
            <!-- Floating z-9999 di atas batas card/container               -->
            <!-- ========================================================= -->
            <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1 scale-98"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-1 scale-98"
            >
                <div
                    v-if="isDropdownOpen && filteredOptions.length > 0"
                    class="absolute left-0 right-0 top-full z-9999 mt-1.5 w-full max-h-56 overflow-y-auto p-1.5 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md space-y-0.5 focus:outline-none"
                >
                    <button
                        v-for="(opt, idx) in filteredOptions"
                        :key="opt.value || idx"
                        type="button"
                        class="w-full px-3 py-2 text-xs rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer"
                        :class="[
                            highlightedIndex === idx
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                        ]"
                        @mousedown.prevent="selectOption(opt)"
                        @mouseenter="highlightedIndex = idx"
                    >
                        <slot name="option" :option="opt" :highlighted="highlightedIndex === idx">
                            <div class="flex items-center gap-2 truncate">
                                <span v-if="opt.icon" class="material-symbols-outlined text-[16px] text-slate-400 shrink-0 leading-none">
                                    {{ opt.icon }}
                                </span>
                                <span class="truncate leading-tight">{{ opt.label }}</span>
                            </div>
                            <span v-if="opt.subtext" class="text-[10px] text-slate-400 truncate ml-2">
                                {{ opt.subtext }}
                            </span>
                        </slot>
                    </button>
                </div>
            </Transition>
        </div>

        <!-- Hint & Error Messages -->
        <p v-if="error" class="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">error</span>
            <span>{{ error }}</span>
        </p>
        <p v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400">
            {{ hint }}
        </p>
    </div>
</template>
