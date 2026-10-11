<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CtaButton from '../CtaButton.vue';
import Badge from '../Badge.vue';

const props = defineProps({
    modelValue: {
        type: [File, Array, String, Object],
        default: null,
    },
    variant: {
        type: String,
        default: 'dropzone', // 'dropzone', 'avatar', 'grid', 'list', 'button', 'compact', 'banner', 'paste'
    },
    layout: {
        type: String,
        default: '', // Alias untuk variant
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(v),
    },
    rounded: {
        type: String,
        default: '2xl',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(v),
    },
    radius: {
        type: String,
        default: '',
    },
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'rose', 'amber', 'violet', 'cyan', 'dark'].includes(v),
    },
    color: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    subtext: {
        type: String,
        default: '',
    },
    accept: {
        type: String,
        default: '',
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    maxSize: {
        type: [Number, String],
        default: null, // '2KB', '500KB', '5MB', '50MB', '1GB', angka bytes
    },
    maxFiles: {
        type: Number,
        default: null,
    },
    uploading: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: null, // 0 - 100
    },
    simulateUpload: {
        type: Boolean,
        default: false,
    },
    minimal: {
        type: Boolean,
        default: false,
    },
    hideInfo: {
        type: Boolean,
        default: false,
    },
    existingFiles: {
        type: [Array, Object, String],
        default: null,
    },
});

const emit = defineEmits([
    'update:modelValue',
    'change',
    'error',
    'cancel-upload',
    'delete-existing',
    'upload-start',
    'upload-progress',
    'upload-complete',
]);

const fileInputRef = ref(null);
const dropzoneContainerRef = ref(null);
const isDragging = ref(false);
const isContainerHovered = ref(false);
const isContainerFocused = ref(false);
const filePreviews = ref([]);
const internalError = ref('');
const activeModalPreview = ref(null);

// Simulasi Unggah Internal (jika simulateUpload = true)
const isSimulating = ref(false);
const simulatedProgress = ref(0);
let simulationTimer = null;

const effectiveUploading = computed(() => {
    return props.uploading || isSimulating.value;
});

const effectiveProgress = computed(() => {
    if (isSimulating.value) return simulatedProgress.value;
    return props.progress;
});

// Dynamic Tokens (Theme, Size, Radius)
const effectiveColorTheme = computed(() => props.color || props.colorTheme || 'primary');
const effectiveRadius = computed(() => props.radius || props.rounded || '2xl');
const effectiveSize = computed(() => props.size || 'md');
const isMinimalMode = computed(() => props.minimal || props.hideInfo);

// Resolve effective variant
const effectiveVariant = computed(() => {
    const v = (props.variant || props.layout || '').toLowerCase();
    if (['avatar', 'profile'].includes(v)) return 'avatar';
    if (['list', 'table', 'row'].includes(v)) return 'list';
    if (['grid', 'gallery'].includes(v)) return 'grid';
    if (['button', 'cta', 'btn'].includes(v)) return 'button';
    if (['compact', 'inline', 'bar'].includes(v)) return 'compact';
    if (['banner', 'cover', 'hero-wide'].includes(v)) return 'banner';
    if (['paste', 'clipboard'].includes(v)) return 'paste';
    if (['dropzone', 'hero'].includes(v)) return 'dropzone';
    return props.multiple ? 'grid' : 'dropzone';
});

const radiusClasses = computed(() => {
    const r = effectiveRadius.value;
    const map = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: effectiveVariant.value === 'avatar' ? 'rounded-full' : 'rounded-3xl',
    };
    return map[r] || 'rounded-2xl';
});

const innerRadius = computed(() => {
    const r = effectiveRadius.value;
    if (r === 'none') return 'none';
    if (r === 'full') return effectiveVariant.value === 'avatar' ? 'full' : '2xl';
    if (r === '3xl') return '2xl';
    if (r === '2xl') return 'xl';
    if (r === 'xl') return 'lg';
    if (r === 'lg') return 'md';
    if (r === 'md') return 'sm';
    return 'sm';
});

const colorThemeClasses = computed(() => {
    const t = effectiveColorTheme.value;
    const map = {
        primary: {
            borderHover: 'hover:border-blue-500 dark:hover:border-blue-400',
            dragOver: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/15',
            iconText: 'text-blue-600 dark:text-blue-400',
            bgIcon: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/50',
            progressBar: 'bg-blue-600 dark:bg-blue-500',
            progressTrack: 'bg-blue-100 dark:bg-blue-950/60',
            progressBox: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300',
            badge: 'primary',
            cta: 'primary',
            activeRing: 'ring-blue-500/30',
        },
        indigo: {
            borderHover: 'hover:border-indigo-500 dark:hover:border-indigo-400',
            dragOver: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-4 ring-indigo-500/15',
            iconText: 'text-indigo-600 dark:text-indigo-400',
            bgIcon: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50',
            progressBar: 'bg-indigo-600 dark:bg-indigo-500',
            progressTrack: 'bg-indigo-100 dark:bg-indigo-950/60',
            progressBox: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300',
            badge: 'indigo',
            cta: 'indigo',
            activeRing: 'ring-indigo-500/30',
        },
        emerald: {
            borderHover: 'hover:border-emerald-500 dark:hover:border-emerald-400',
            dragOver: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-4 ring-emerald-500/15',
            iconText: 'text-emerald-600 dark:text-emerald-400',
            bgIcon: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50',
            progressBar: 'bg-emerald-600 dark:bg-emerald-500',
            progressTrack: 'bg-emerald-100 dark:bg-emerald-950/60',
            progressBox: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300',
            badge: 'emerald',
            cta: 'emerald',
            activeRing: 'ring-emerald-500/30',
        },
        rose: {
            borderHover: 'hover:border-rose-500 dark:hover:border-rose-400',
            dragOver: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-4 ring-rose-500/15',
            iconText: 'text-rose-600 dark:text-rose-400',
            bgIcon: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50',
            progressBar: 'bg-rose-600 dark:bg-rose-500',
            progressTrack: 'bg-rose-100 dark:bg-rose-950/60',
            progressBox: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300',
            badge: 'danger',
            cta: 'rose',
            activeRing: 'ring-rose-500/30',
        },
        amber: {
            borderHover: 'hover:border-amber-500 dark:hover:border-amber-400',
            dragOver: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-4 ring-amber-500/15',
            iconText: 'text-amber-600 dark:text-amber-400',
            bgIcon: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50',
            progressBar: 'bg-amber-500 dark:bg-amber-500',
            progressTrack: 'bg-amber-100 dark:bg-amber-950/60',
            progressBox: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300',
            badge: 'warning',
            cta: 'amber',
            activeRing: 'ring-amber-500/30',
        },
        violet: {
            borderHover: 'hover:border-violet-500 dark:hover:border-violet-400',
            dragOver: 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 ring-4 ring-violet-500/15',
            iconText: 'text-violet-600 dark:text-violet-400',
            bgIcon: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900/50',
            progressBar: 'bg-violet-600 dark:bg-violet-500',
            progressTrack: 'bg-violet-100 dark:bg-violet-950/60',
            progressBox: 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/60 text-violet-700 dark:text-violet-300',
            badge: 'purple',
            cta: 'violet',
            activeRing: 'ring-violet-500/30',
        },
        cyan: {
            borderHover: 'hover:border-cyan-500 dark:hover:border-cyan-400',
            dragOver: 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-4 ring-cyan-500/15',
            iconText: 'text-cyan-600 dark:text-cyan-400',
            bgIcon: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900/50',
            progressBar: 'bg-cyan-600 dark:bg-cyan-500',
            progressTrack: 'bg-cyan-100 dark:bg-cyan-950/60',
            progressBox: 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300',
            badge: 'cyan',
            cta: 'cyan',
            activeRing: 'ring-cyan-500/30',
        },
        dark: {
            borderHover: 'hover:border-slate-600 dark:hover:border-slate-400',
            dragOver: 'border-slate-800 bg-slate-200/70 dark:bg-slate-800/80 ring-4 ring-slate-800/15',
            iconText: 'text-slate-800 dark:text-slate-200',
            bgIcon: 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
            progressBar: 'bg-slate-900 dark:bg-slate-100',
            progressTrack: 'bg-slate-200 dark:bg-slate-800',
            progressBox: 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100',
            badge: 'neutral',
            cta: 'dark',
            activeRing: 'ring-slate-500/30',
        },
    };
    return map[t] || map.primary;
});

const sizeStyles = computed(() => {
    const s = effectiveSize.value;
    const map = {
        xs: {
            dropzonePadding: 'p-2.5 sm:p-3',
            avatarDimensions: 'w-12 h-12',
            iconContainer: 'w-7 h-7',
            iconText: 'text-base',
            titleText: 'text-[11px] font-bold',
            subText: 'text-[9px] leading-tight',
            buttonSize: 'xs',
            previewHeight: 'h-20',
            bannerHeight: 'h-24 sm:h-28',
        },
        sm: {
            dropzonePadding: 'p-3.5 sm:p-4',
            avatarDimensions: 'w-16 h-16 sm:w-20 sm:h-20',
            iconContainer: 'w-9 h-9 sm:w-10 sm:h-10',
            iconText: 'text-lg sm:text-xl',
            titleText: 'text-xs font-bold',
            subText: 'text-[10px] sm:text-[11px]',
            buttonSize: 'xs',
            previewHeight: 'h-24',
            bannerHeight: 'h-32 sm:h-36',
        },
        md: {
            dropzonePadding: 'p-6 sm:p-7 md:p-8',
            avatarDimensions: 'w-24 h-24 sm:w-28 sm:h-28',
            iconContainer: 'w-12 h-12',
            iconText: 'text-2xl',
            titleText: 'text-xs sm:text-sm font-bold',
            subText: 'text-[11px] sm:text-xs',
            buttonSize: 'sm',
            previewHeight: 'h-28',
            bannerHeight: 'h-40 sm:h-48',
        },
        lg: {
            dropzonePadding: 'p-8 sm:p-10 md:p-12',
            avatarDimensions: 'w-32 h-32 sm:w-36 sm:h-36',
            iconContainer: 'w-14 h-14',
            iconText: 'text-3xl',
            titleText: 'text-sm sm:text-base font-bold',
            subText: 'text-xs sm:text-sm',
            buttonSize: 'md',
            previewHeight: 'h-32',
            bannerHeight: 'h-48 sm:h-56',
        },
        xl: {
            dropzonePadding: 'p-10 sm:p-12 md:p-16',
            avatarDimensions: 'w-36 h-36 sm:w-44 sm:h-44',
            iconContainer: 'w-16 h-16',
            iconText: 'text-4xl',
            titleText: 'text-base sm:text-lg font-bold',
            subText: 'text-xs sm:text-base',
            buttonSize: 'lg',
            previewHeight: 'h-36',
            bannerHeight: 'h-56 sm:h-64',
        },
        full: {
            dropzonePadding: 'p-6 sm:p-8 w-full',
            avatarDimensions: 'w-24 h-24 sm:w-28 sm:h-28',
            iconContainer: 'w-12 h-12',
            iconText: 'text-2xl',
            titleText: 'text-sm font-bold',
            subText: 'text-xs',
            buttonSize: 'sm',
            previewHeight: 'h-28',
            bannerHeight: 'h-48 w-full',
        },
    };
    return map[s] || map.md;
});

// Memory cleanup for blob URLs
const createdBlobUrls = new Set();

const revokeBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        createdBlobUrls.delete(url);
    }
};

const cleanupAllBlobs = () => {
    createdBlobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
    });
    createdBlobUrls.clear();
};

onUnmounted(() => {
    cleanupAllBlobs();
    if (simulationTimer) clearInterval(simulationTimer);
    if (typeof window !== 'undefined') {
        window.removeEventListener('paste', handleGlobalPaste);
    }
});

// Helpers format bytes
const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('id-ID', { month: 'short' });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${mins}`;
};

// Parser maxSize serbaguna: angka bytes atau string '2KB', '500KB', '5MB', '1GB', dll.
const maxSizeBytes = computed(() => {
    if (!props.maxSize) return null;
    if (typeof props.maxSize === 'number') return props.maxSize;
    const str = String(props.maxSize).trim().toUpperCase();
    const match = str.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/);
    if (!match) return parseFloat(str) || null;
    const val = parseFloat(match[1]);
    const unit = match[2] || 'B';
    const multipliers = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024,
    };
    return Math.round(val * (multipliers[unit] || 1));
});

const formatAcceptDisplay = (acceptStr) => {
    if (!acceptStr || acceptStr.trim() === '' || acceptStr === '*') return 'Semua format berkas';
    if (acceptStr === 'image/*') return 'Foto/Gambar (JPG, PNG, WebP, GIF)';
    if (acceptStr === 'image/*,.pdf') return 'Foto & Dokumen PDF';
    if (acceptStr === '.pdf') return 'Dokumen PDF';
    return acceptStr;
};

const defaultSubtext = computed(() => {
    if (props.subtext) return props.subtext;
    const parts = [];
    parts.push(formatAcceptDisplay(props.accept));
    if (props.maxSize) {
        parts.push(`Maks. ${formatBytes(maxSizeBytes.value)}/berkas`);
    }
    if (props.multiple && props.maxFiles) {
        parts.push(`Maks. ${props.maxFiles} berkas`);
    }
    return parts.join(' • ');
});

const isFileTypeAccepted = (file, acceptPattern) => {
    if (!acceptPattern || acceptPattern.trim() === '' || acceptPattern === '*') return true;
    const rules = acceptPattern.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
    const fileName = (file.name || '').toLowerCase();
    const fileType = (file.type || '').toLowerCase();

    return rules.some((rule) => {
        if (rule.startsWith('.')) {
            return fileName.endsWith(rule);
        }
        if (rule.endsWith('/*')) {
            const prefix = rule.slice(0, -1);
            if (fileType.startsWith(prefix)) return true;
            if (rule === 'image/*') return /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(fileName);
            if (rule === 'video/*') return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(fileName);
            if (rule === 'audio/*') return /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(fileName);
            return false;
        }
        return fileType === rule;
    });
};

const getFileTypeMeta = (filename, mimeType) => {
    const ext = filename ? filename.split('.').pop().toUpperCase() : 'FILE';
    if (/\.(pdf)$/i.test(filename) || mimeType === 'application/pdf') {
        return { icon: 'picture_as_pdf', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800', badge: 'PDF' };
    }
    if (/\.(doc|docx)$/i.test(filename)) {
        return { icon: 'description', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800', badge: ext };
    }
    if (/\.(xls|xlsx|csv)$/i.test(filename)) {
        return { icon: 'table_chart', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800', badge: ext };
    }
    if (/\.(zip|rar|tar|gz|7z)$/i.test(filename)) {
        return { icon: 'folder_zip', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800', badge: ext };
    }
    if (/\.(mp4|webm|mov|mkv)$/i.test(filename)) {
        return { icon: 'movie', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800', badge: ext };
    }
    if (/\.(mp3|wav|aac|flac)$/i.test(filename)) {
        return { icon: 'audio_file', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800', badge: ext };
    }
    return { icon: 'draft', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', badge: ext };
};

const formatFileUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return path.startsWith('/') ? path : '/' + path;
};

const createPreviewItem = (file) => {
    const isImage = file.type ? file.type.startsWith('image/') : /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(file.name);
    let previewUrl = '';
    if (isImage) {
        previewUrl = URL.createObjectURL(file);
        createdBlobUrls.add(previewUrl);
    }

    const previewItem = {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
        url: previewUrl,
        isImage,
        isExisting: false,
        modifiedAt: formatDate(file.lastModified),
        meta: getFileTypeMeta(file.name, file.type),
        dimensions: '',
        rawFile: file,
        source: file,
    };

    if (isImage) {
        const img = new Image();
        img.onload = () => {
            previewItem.dimensions = `${img.naturalWidth} × ${img.naturalHeight} px`;
        };
        img.src = previewUrl;
    }

    return previewItem;
};

const removedExistingKeys = ref(new Set());

// Dukungan file yang sudah tersimpan di database / server
const parseExistingFile = (item) => {
    if (!item) return null;
    if (item instanceof File) {
        const existingPreview = filePreviews.value.find((p) => p.rawFile === item);
        if (existingPreview) return existingPreview;
        return createPreviewItem(item);
    }
    if (typeof item === 'string') {
        const fullUrl = formatFileUrl(item);
        const cleanUrl = fullUrl.split('?')[0].split('#')[0];
        const fileName = cleanUrl.split('/').pop().split('\\').pop() || 'berkas_tersimpan';
        const isImage = /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(cleanUrl) || /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(item) || item.includes('images.unsplash.com');
        return {
            id: null,
            name: fileName,
            size: 'Tersimpan di Server',
            url: fullUrl,
            isImage,
            isExisting: true,
            meta: getFileTypeMeta(fileName, ''),
            dimensions: '',
            modifiedAt: 'Database',
            rawFile: null,
            source: item,
        };
    }
    if (typeof item === 'object') {
        const rawUrl = item.url || item.path || item.src || '';
        const fullUrl = formatFileUrl(rawUrl);
        const cleanUrl = fullUrl.split('?')[0].split('#')[0];
        const fileName = item.name || item.filename || (cleanUrl ? cleanUrl.split('/').pop().split('\\').pop() : 'berkas_tersimpan');
        const isImage = item.isImage !== undefined
            ? Boolean(item.isImage)
            : (/\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(cleanUrl) || /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(fileName) || (typeof item.type === 'string' && item.type.startsWith('image/')) || (typeof rawUrl === 'string' && rawUrl.includes('images.unsplash.com')));
        return {
            id: item.id || null,
            name: fileName,
            size: item.size ? (typeof item.size === 'number' ? formatBytes(item.size) : item.size) : 'Tersimpan di Server',
            url: fullUrl,
            isImage,
            isExisting: true,
            meta: getFileTypeMeta(fileName, item.type || ''),
            dimensions: item.dimensions || '',
            modifiedAt: item.modifiedAt || item.updated_at || item.uploadedAt || 'Database',
            rawFile: null,
            source: item,
        };
    }
    return null;
};

const syncPreviews = () => {
    // 1. Kumpulkan items dari props.existingFiles
    let propExistingItems = [];
    if (props.existingFiles) {
        if (Array.isArray(props.existingFiles)) {
            propExistingItems = props.existingFiles.map(parseExistingFile).filter(Boolean);
        } else {
            const single = parseExistingFile(props.existingFiles);
            if (single) propExistingItems = [single];
        }
    }

    // Filter yang sudah dihapus oleh aksi pengguna
    if (removedExistingKeys.value.size > 0) {
        propExistingItems = propExistingItems.filter((item) => {
            const key = item.url || item.name || String(item.id || '');
            return !removedExistingKeys.value.has(key);
        });
    }

    // 2. Kumpulkan items dari props.modelValue
    let modelItems = [];
    if (props.modelValue) {
        if (Array.isArray(props.modelValue)) {
            modelItems = props.modelValue.map(parseExistingFile).filter(Boolean);
        } else {
            const single = parseExistingFile(props.modelValue);
            if (single) modelItems = [single];
        }
    }

    // 3. Gabungkan preview sesuai mode single/multiple
    if (props.multiple) {
        const combined = [...propExistingItems];
        modelItems.forEach((mItem) => {
            const exists = combined.some((c) => {
                if (mItem.rawFile && c.rawFile) {
                    return mItem.rawFile.name === c.rawFile.name && mItem.rawFile.size === c.rawFile.size;
                }
                return (mItem.url && c.url && mItem.url === c.url) || (mItem.name && c.name && mItem.name === c.name);
            });
            if (!exists) {
                combined.push(mItem);
            }
        });
        filePreviews.value = combined;
    } else {
        // Mode single:
        // Jika modelValue adalah File baru hasil unggah pengguna, utamakan modelValue
        const hasNewPickedFile = modelItems.some((m) => m.rawFile instanceof File);
        if (hasNewPickedFile) {
            filePreviews.value = modelItems;
        } else if (propExistingItems.length > 0) {
            filePreviews.value = propExistingItems;
        } else if (modelItems.length > 0) {
            filePreviews.value = modelItems;
        } else {
            filePreviews.value = [];
        }
    }
};

onMounted(() => {
    syncPreviews();
    if (typeof window !== 'undefined') {
        window.addEventListener('paste', handleGlobalPaste);
    }
});

watch([() => props.modelValue, () => props.existingFiles], () => {
    syncPreviews();
}, { deep: true });

watch(() => props.existingFiles, () => {
    removedExistingKeys.value.clear();
    syncPreviews();
}, { deep: true });

// Programmatic trigger untuk file picker native
const triggerPicker = () => {
    if (props.disabled) return;
    fileInputRef.value?.click();
};

const startUploadSimulation = (files) => {
    if (!props.simulateUpload) return;
    if (simulationTimer) clearInterval(simulationTimer);
    isSimulating.value = true;
    simulatedProgress.value = 5;
    emit('upload-start', files);

    simulationTimer = setInterval(() => {
        if (simulatedProgress.value < 90) {
            simulatedProgress.value += Math.floor(Math.random() * 15) + 10;
            emit('upload-progress', Math.min(simulatedProgress.value, 90));
        } else {
            simulatedProgress.value = 100;
            emit('upload-progress', 100);
            emit('upload-complete', files);
            clearInterval(simulationTimer);
            simulationTimer = null;
            setTimeout(() => {
                isSimulating.value = false;
                simulatedProgress.value = 0;
            }, 600);
        }
    }, 300);
};

const cancelUpload = () => {
    if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null;
    }
    isSimulating.value = false;
    simulatedProgress.value = 0;
    emit('cancel-upload');
};

const processFiles = (filesList) => {
    internalError.value = '';
    const incomingFiles = Array.from(filesList);
    if (incomingFiles.length === 0) return;

    const acceptedFiles = [];
    const rejectedByFormat = [];
    const rejectedBySize = [];

    incomingFiles.forEach((file) => {
        if (props.accept && !isFileTypeAccepted(file, props.accept)) {
            rejectedByFormat.push(file.name);
        } else if (maxSizeBytes.value && file.size > maxSizeBytes.value) {
            rejectedBySize.push(`${file.name} (${formatBytes(file.size)})`);
        } else {
            acceptedFiles.push(file);
        }
    });

    const errorMessages = [];
    if (rejectedByFormat.length > 0) {
        errorMessages.push(
            `${rejectedByFormat.length} berkas ditolak karena format tidak diizinkan: "${rejectedByFormat.join(', ')}" (Format diterima: ${formatAcceptDisplay(props.accept)})`
        );
    }
    if (rejectedBySize.length > 0) {
        errorMessages.push(
            `${rejectedBySize.length} berkas ditolak karena melebihi batas ukuran maksimal (${rejectedBySize.join(', ')})`
        );
    }

    if (errorMessages.length > 0) {
        internalError.value = errorMessages.join('. ');
        emit('error', internalError.value);
    }

    if (acceptedFiles.length === 0) return;

    if (props.multiple) {
        const existing = Array.isArray(props.modelValue) ? Array.from(props.modelValue) : [];
        const existingKeys = new Set(existing.map((f) => (f instanceof File ? `${f.name}_${f.size}` : String(f.id || f.url || f))));
        const newUnique = acceptedFiles.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));

        let finalFiles = [...existing, ...newUnique];

        if (props.maxFiles && finalFiles.length > props.maxFiles) {
            const excess = finalFiles.length - props.maxFiles;
            finalFiles = finalFiles.slice(0, props.maxFiles);
            internalError.value = `Maksimal ${props.maxFiles} berkas yang diizinkan. ${excess} berkas selebihnya tidak disertakan.`;
            emit('error', internalError.value);
        }

        emit('update:modelValue', finalFiles);
        emit('change', finalFiles);

        newUnique.forEach((file) => {
            filePreviews.value.push(createPreviewItem(file));
        });

        if (props.maxFiles && filePreviews.value.length > props.maxFiles) {
            const trimmed = filePreviews.value.splice(props.maxFiles);
            trimmed.forEach((item) => {
                if (item.url) revokeBlobUrl(item.url);
            });
        }

        startUploadSimulation(finalFiles);
    } else {
        cleanupAllBlobs();
        const picked = acceptedFiles[0];
        emit('update:modelValue', picked);
        emit('change', picked);
        filePreviews.value = [createPreviewItem(picked)];
        startUploadSimulation(picked);
    }
};

const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
};

const handleDrop = (e) => {
    isDragging.value = false;
    if (props.disabled) return;
    if (e.dataTransfer && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
    }
};

// Clipboard Paste Event Handler (Ctrl+V)
const handlePaste = (e) => {
    if (props.disabled) return;
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const files = [];

    // 1. Prioritaskan files jika ada di clipboard (misal berkas yang disalin dari Explorer / Desktop)
    if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
            const f = clipboardData.files[i];
            if (f) files.push(f);
        }
    }

    // 2. Ekstraksi items clipboard (misal screenshot Snipping Tool, copy image dari browser/canvas)
    if (files.length === 0 && clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.kind === 'file' || (item.type && item.type.startsWith('image/'))) {
                const blob = item.getAsFile();
                if (blob) {
                    let ext = 'png';
                    if (blob.type) {
                        const subtype = blob.type.split('/')[1] || 'png';
                        ext = subtype.replace('+xml', '').toLowerCase();
                    }
                    const file = new File([blob], `clipboard-${Date.now()}.${ext}`, { type: blob.type || 'image/png' });
                    files.push(file);
                }
            }
        }
    }

    if (files.length > 0) {
        e.preventDefault();
        processFiles(files);
    }
};

const handleGlobalPaste = (e) => {
    if (props.disabled) return;

    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    // Jangan tangkap jika pengguna sedang mengetik di input text / textarea lain di luar komponen ini
    const isTypingElsewhere = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !dropzoneContainerRef.value?.contains(activeEl);
    if (isTypingElsewhere) return;

    // Tangkap jika varian adalah 'paste' ATAU kontainer sedang di-hover / di-focus
    const shouldCapture = effectiveVariant.value === 'paste' || isContainerHovered.value || isContainerFocused.value;
    if (shouldCapture) {
        handlePaste(e);
    }
};

const removeFile = (index) => {
    if (index < 0 || index >= filePreviews.value.length) return;
    const removed = filePreviews.value.splice(index, 1)[0];
    if (removed && removed.url) {
        revokeBlobUrl(removed.url);
    }

    if (removed?.isExisting) {
        const key = removed.url || removed.name || String(removed.id || '');
        if (key) removedExistingKeys.value.add(key);
        emit('delete-existing', removed.source || removed);
    }

    if (props.multiple && Array.isArray(props.modelValue)) {
        const files = Array.from(props.modelValue);
        const idxInModel = files.findIndex((f) => {
            if (removed.rawFile && f instanceof File) {
                return f.name === removed.rawFile.name && f.size === removed.rawFile.size;
            }
            if (f instanceof File) {
                return f.name === removed.name;
            }
            const url = typeof f === 'string' ? f : (f?.url || f?.path || '');
            return url === removed.url || f?.name === removed.name;
        });

        if (idxInModel !== -1) {
            files.splice(idxInModel, 1);
            const nextVal = files.length > 0 ? files : null;
            emit('update:modelValue', nextVal);
            emit('change', nextVal);
        }
    } else {
        emit('update:modelValue', null);
        emit('change', null);
    }
    internalError.value = '';
};

const clear = () => {
    cleanupAllBlobs();
    filePreviews.value.forEach((p) => {
        if (p.isExisting) {
            const key = p.url || p.name || String(p.id || '');
            if (key) removedExistingKeys.value.add(key);
        }
    });
    filePreviews.value = [];
    emit('update:modelValue', null);
    emit('change', null);
    emit('delete-existing', 'all');
    internalError.value = '';
};

defineExpose({
    fileInputRef,
    triggerPicker,
    clear,
    removeFile,
    processFiles,
    filePreviews,
});
</script>

<template>
    <div
        ref="dropzoneContainerRef"
        class="space-y-3 w-full outline-hidden"
        tabindex="0"
        @paste="handlePaste"
        @mouseenter="isContainerHovered = true"
        @mouseleave="isContainerHovered = false"
        @focus="isContainerFocused = true"
        @blur="isContainerFocused = false"
    >
        <!-- Input File Element (Hidden Native) -->
        <input
            :id="id"
            ref="fileInputRef"
            type="file"
            :name="name"
            :multiple="multiple"
            :accept="accept"
            :required="required && filePreviews.length === 0"
            :disabled="disabled"
            @change="handleFileChange"
            class="sr-only"
        />

        <!-- ========================================================================= -->
        <!-- 1. VARIAN: AVATAR / PROFILE PHOTO (Minimal & Standar)                     -->
        <!-- ========================================================================= -->
        <div v-if="effectiveVariant === 'avatar'" class="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 text-center sm:text-left">
            <div
                :class="[
                    'relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 group shadow-xs select-none shrink-0',
                    sizeStyles.avatarDimensions,
                    radiusClasses,
                    isDragging
                        ? colorThemeClasses.dragOver
                        : (error || internalError)
                            ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/15'
                            : ['border-slate-300 dark:border-slate-700', colorThemeClasses.borderHover],
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @click="triggerPicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <!-- Existing or Uploaded Photo -->
                <template v-if="filePreviews.length > 0 && filePreviews[0].isImage">
                    <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="w-full h-full object-cover" />
                    <!-- Hover Change Overlay -->
                    <div class="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1">
                        <span class="material-symbols-outlined text-xl leading-none">photo_camera</span>
                        <span>Ganti</span>
                    </div>
                </template>

                <!-- Non-Image or Document Icon -->
                <div v-else-if="filePreviews.length > 0" class="flex flex-col items-center justify-center text-center p-2">
                    <span class="material-symbols-outlined text-3xl" :class="colorThemeClasses.iconText">{{ filePreviews[0].meta.icon }}</span>
                    <Badge size="xs" variant="soft" :color="colorThemeClasses.badge" class="mt-1">
                        {{ filePreviews[0].meta.badge }}
                    </Badge>
                </div>

                <!-- Empty State Placeholder -->
                <div v-else class="flex flex-col items-center justify-center text-slate-400 transition-colors p-2 text-center" :class="`group-${colorThemeClasses.iconText}`">
                    <span class="material-symbols-outlined text-3xl leading-none">add_a_photo</span>
                    <span v-if="!isMinimalMode" class="text-[10px] font-semibold mt-1">Unggah</span>
                </div>

                <!-- Variant-Specific Uploading Overlay (Avatar Circular Spinner) -->
                <div
                    v-if="effectiveUploading"
                    class="absolute inset-0 bg-black/70 backdrop-blur-2xs flex flex-col items-center justify-center text-white select-none z-20"
                >
                    <span class="material-symbols-outlined text-2xl animate-spin text-white">progress_activity</span>
                    <span class="text-[11px] font-mono font-bold mt-1">{{ effectiveProgress !== null ? `${effectiveProgress}%` : '...' }}</span>
                </div>

                <!-- Minimal Mode Floating Delete Badge (Top-Right) -->
                <button
                    v-if="isMinimalMode && filePreviews.length > 0 && !disabled"
                    type="button"
                    class="absolute top-1 right-1 z-30 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                    title="Hapus Foto"
                    @click.stop.prevent="removeFile(0)"
                >
                    <span class="material-symbols-outlined text-xs leading-none">close</span>
                </button>
            </div>

            <!-- Avatar Metadata & Actions (Disembunyikan jika minimal: true) -->
            <div v-if="!isMinimalMode" class="space-y-1.5 min-w-0 flex-1 w-full sm:w-auto">
                <div v-if="filePreviews.length > 0" class="space-y-1">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" :title="filePreviews[0].name">
                            {{ filePreviews[0].name }}
                        </p>
                        <Badge size="xs" :variant="filePreviews[0].isExisting ? 'surface' : 'soft'" :color="filePreviews[0].isExisting ? 'neutral' : colorThemeClasses.badge" class="self-center sm:self-auto">
                            {{ filePreviews[0].isExisting ? 'Tersimpan di Server' : filePreviews[0].meta.badge }}
                        </Badge>
                    </div>
                    <div class="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{{ filePreviews[0].size }}</span>
                        <span v-if="filePreviews[0].dimensions">• {{ filePreviews[0].dimensions }}</span>
                    </div>
                    <div v-if="!disabled" class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <CtaButton
                            type="direct"
                            variant="soft"
                            :colorTheme="effectiveColorTheme"
                            size="xs"
                            :rounded="innerRadius"
                            icon="sync"
                            label="Ganti Foto"
                            @click.stop.prevent="triggerPicker"
                        />
                        <CtaButton
                            type="direct"
                            variant="soft"
                            colorTheme="rose"
                            size="xs"
                            :rounded="innerRadius"
                            icon="delete"
                            label="Hapus Foto"
                            @click.stop.prevent="removeFile(0)"
                        />
                    </div>
                </div>
                <div v-else class="space-y-1">
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {{ placeholder || 'Foto Profil / Identitas Pengguna' }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500">
                        {{ subtext || defaultSubtext }}
                    </p>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 2. VARIAN: DROPZONE HERO (Banner Luas dengan Multi-List Bersih)            -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'dropzone'" class="space-y-3.5">
            <!-- Hero Dropzone Area (Selalu aktif jika multiple, atau jika belum ada berkas) -->
            <div
                v-if="multiple || filePreviews.length === 0"
                :class="[
                    'relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer select-none text-center group w-full',
                    (multiple && filePreviews.length > 0) ? 'p-4 sm:p-5' : sizeStyles.dropzonePadding,
                    radiusClasses,
                    isDragging
                        ? colorThemeClasses.dragOver
                        : (error || internalError)
                            ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/15'
                            : ['border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 shadow-xs', colorThemeClasses.borderHover],
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @click="triggerPicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <!-- Slot Kustom #default jika developer ingin desain dropzone sendiri -->
                <slot
                    name="default"
                    :isDragging="isDragging"
                    :triggerPicker="triggerPicker"
                    :uploading="effectiveUploading"
                    :progress="effectiveProgress"
                >
                    <!-- Variant-Specific Uploading Inside Hero Dropzone -->
                    <div
                        v-if="effectiveUploading && filePreviews.length === 0"
                        class="space-y-2.5 max-w-sm w-full py-2"
                        @click.stop
                    >
                        <div class="flex items-center justify-center gap-2 text-xs font-semibold" :class="colorThemeClasses.iconText">
                            <span class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            <span>Sedang mengunggah berkas ke sistem...</span>
                        </div>
                        <div :class="['h-2 w-full rounded-full overflow-hidden', colorThemeClasses.progressTrack]">
                            <div
                                class="h-full rounded-full transition-all duration-300 ease-out"
                                :class="colorThemeClasses.progressBar"
                                :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                            />
                        </div>
                        <div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>{{ effectiveProgress !== null ? `${effectiveProgress}% selesai` : 'Memproses...' }}</span>
                            <button
                                type="button"
                                class="text-rose-600 hover:underline cursor-pointer font-sans"
                                @click.stop="cancelUpload"
                            >
                                Batal
                            </button>
                        </div>
                    </div>

                    <!-- Default Hero Content -->
                    <template v-else>
                        <div
                            :class="[
                                'border flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform',
                                (multiple && filePreviews.length > 0) ? 'w-10 h-10' : sizeStyles.iconContainer,
                                innerRadius,
                                colorThemeClasses.bgIcon,
                                colorThemeClasses.iconText
                            ]"
                        >
                            <span class="material-symbols-outlined leading-none" :class="(multiple && filePreviews.length > 0) ? 'text-xl' : sizeStyles.iconText">
                                {{ isDragging ? 'file_download' : ((multiple && filePreviews.length > 0) ? 'add' : 'cloud_upload') }}
                            </span>
                        </div>

                        <div class="space-y-1 max-w-md px-2">
                            <p class="text-slate-800 dark:text-slate-100" :class="sizeStyles.titleText">
                                {{ placeholder || (isDragging ? 'Lepaskan berkas di sini' : ((multiple && filePreviews.length > 0) ? 'Tarik & seret berkas tambahan ke sini, atau klik untuk memilih' : 'Tarik & seret berkas ke sini, atau klik untuk memilih')) }}
                            </p>
                            <p class="text-slate-400 dark:text-slate-500 leading-relaxed" :class="sizeStyles.subText">
                                {{ subtext || defaultSubtext }}
                            </p>
                        </div>

                        <div class="mt-3.5">
                            <CtaButton
                                type="direct"
                                variant="outline"
                                :colorTheme="effectiveColorTheme"
                                :size="sizeStyles.buttonSize"
                                :rounded="innerRadius"
                                icon="attach_file"
                                :label="(multiple && filePreviews.length > 0) ? 'Tambah Berkas Lain' : 'Pilih Berkas'"
                                @click.stop.prevent="triggerPicker"
                            />
                        </div>
                    </template>
                </slot>
            </div>

            <!-- Single Hero Card Preview (Jika multiple = false dan ada 1 berkas) -->
            <div
                v-else-if="filePreviews.length > 0"
                :class="[
                    'relative flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-full',
                    radiusClasses
                ]"
            >
                <!-- Thumbnail or Document Icon -->
                <div
                    v-if="filePreviews[0].isImage"
                    :class="[
                        'relative w-full sm:w-28 h-40 sm:h-24 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer group',
                        innerRadius
                    ]"
                    @click="activeModalPreview = filePreviews[0].url"
                    title="Perbesar gambar"
                >
                    <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-xl">zoom_in</span>
                    </div>
                </div>

                <div
                    v-else
                    :class="[
                        'w-full sm:w-28 h-24 border flex flex-col items-center justify-center shrink-0 shadow-2xs',
                        innerRadius,
                        filePreviews[0].meta.color
                    ]"
                >
                    <span class="material-symbols-outlined text-3xl">{{ filePreviews[0].meta.icon }}</span>
                    <span class="text-xs font-bold font-mono tracking-wider mt-1">{{ filePreviews[0].meta.badge }}</span>
                </div>

                <!-- Full Metadata Information & Actions -->
                <div class="min-w-0 flex-1 space-y-1.5 w-full text-center sm:text-left">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" :title="filePreviews[0].name">
                            {{ filePreviews[0].name }}
                        </p>
                        <Badge size="xs" :variant="filePreviews[0].isExisting ? 'surface' : 'soft'" :color="filePreviews[0].isExisting ? 'neutral' : colorThemeClasses.badge" class="self-center sm:self-auto shrink-0">
                            {{ filePreviews[0].isExisting ? 'Tersimpan di Server' : filePreviews[0].meta.badge }}
                        </Badge>
                    </div>

                    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">straighten</span>
                            {{ filePreviews[0].size }}
                        </span>
                        <span v-if="filePreviews[0].dimensions" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">aspect_ratio</span>
                            {{ filePreviews[0].dimensions }}
                        </span>
                        <span v-if="filePreviews[0].modifiedAt" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">schedule</span>
                            {{ filePreviews[0].modifiedAt }}
                        </span>
                    </div>

                    <!-- Single Card Integrated Upload Progress Bar -->
                    <div v-if="effectiveUploading" class="space-y-1 pt-1 max-w-md">
                        <div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span class="flex items-center gap-1 text-primary-600 font-bold">
                                <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                                Mengunggah...
                            </span>
                            <span>{{ effectiveProgress !== null ? `${effectiveProgress}%` : '...' }}</span>
                        </div>
                        <div :class="['h-1.5 w-full rounded-full overflow-hidden', colorThemeClasses.progressTrack]">
                            <div
                                class="h-full rounded-full transition-all duration-300"
                                :class="colorThemeClasses.progressBar"
                                :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                            />
                        </div>
                    </div>

                    <div v-if="!disabled" class="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <CtaButton
                            type="direct"
                            variant="soft"
                            :colorTheme="effectiveColorTheme"
                            size="xs"
                            :rounded="innerRadius"
                            icon="sync"
                            label="Ganti Berkas"
                            @click.stop.prevent="triggerPicker"
                        />
                        <CtaButton
                            type="direct"
                            variant="soft"
                            colorTheme="rose"
                            size="xs"
                            :rounded="innerRadius"
                            icon="delete"
                            label="Hapus"
                            @click.stop.prevent="removeFile(0)"
                        />
                    </div>
                </div>
            </div>

            <!-- Multiple Preview List in Hero Dropzone (TIDAK BERTUMPUK / MENUTUPI) -->
            <div v-if="multiple && filePreviews.length > 0" class="space-y-2 pt-1">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                    <div class="flex items-center gap-2">
                        <span>Daftar Berkas Terpilih</span>
                        <Badge size="xs" variant="soft" :color="colorThemeClasses.badge">
                            {{ filePreviews.length }}{{ maxFiles ? ` / ${maxFiles}` : '' }} berkas
                        </Badge>
                    </div>
                    <CtaButton
                        v-if="!disabled"
                        type="direct"
                        variant="ghost"
                        colorTheme="rose"
                        size="xs"
                        icon="clear_all"
                        label="Hapus Semua"
                        @click="clear"
                    />
                </div>

                <!-- Structured Clean List Rows (No Overlapping) -->
                <div
                    :class="[
                        'border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs w-full',
                        radiusClasses
                    ]"
                >
                    <div
                        v-for="(file, idx) in filePreviews"
                        :key="idx"
                        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <div
                                v-if="file.isImage"
                                :class="['w-10 h-10 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer', innerRadius]"
                                @click="activeModalPreview = file.url"
                            >
                                <img :src="file.url" :alt="file.name" class="w-full h-full object-cover" />
                            </div>
                            <div
                                v-else
                                :class="['w-10 h-10 flex items-center justify-center shrink-0', innerRadius, file.meta.color]"
                            >
                                <span class="material-symbols-outlined text-lg">{{ file.meta.icon }}</span>
                            </div>

                            <div class="min-w-0 flex-1 space-y-0.5">
                                <div class="flex items-center gap-2">
                                    <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" :title="file.name">
                                        {{ file.name }}
                                    </p>
                                    <Badge size="xs" :variant="file.isExisting ? 'surface' : 'soft'" :color="file.isExisting ? 'neutral' : colorThemeClasses.badge" class="shrink-0">
                                        {{ file.isExisting ? 'Database' : file.meta.badge }}
                                    </Badge>
                                </div>
                                <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                    <span>{{ file.size }}</span>
                                    <span v-if="file.modifiedAt">• {{ file.modifiedAt }}</span>
                                </div>

                                <!-- Individual row upload bar if uploading -->
                                <div v-if="effectiveUploading" :class="['h-1 w-full max-w-xs rounded-full overflow-hidden mt-1', colorThemeClasses.progressTrack]">
                                    <div
                                        class="h-full rounded-full transition-all duration-300"
                                        :class="colorThemeClasses.progressBar"
                                        :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                            <CtaButton
                                v-if="file.isImage"
                                type="direct"
                                variant="ghost"
                                colorTheme="dark"
                                size="xs"
                                icon="zoom_in"
                                title="Perbesar"
                                @click="activeModalPreview = file.url"
                            />
                            <CtaButton
                                v-if="!disabled"
                                type="direct"
                                variant="ghost"
                                colorTheme="rose"
                                size="xs"
                                icon="delete"
                                title="Hapus"
                                @click="removeFile(idx)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 3. VARIAN: GRID (Visual Media Gallery Cards)                               -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'grid'" class="space-y-3">
            <div
                :class="[
                    'relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 border-2 border-dashed transition-all duration-200 cursor-pointer select-none group w-full',
                    radiusClasses,
                    isDragging
                        ? colorThemeClasses.dragOver
                        : ['border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40', colorThemeClasses.borderHover],
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @click="triggerPicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div
                        :class="[
                            'w-10 h-10 border flex items-center justify-center shadow-2xs shrink-0',
                            innerRadius,
                            colorThemeClasses.bgIcon,
                            colorThemeClasses.iconText
                        ]"
                    >
                        <span class="material-symbols-outlined text-xl">{{ isDragging ? 'file_download' : 'add_photo_alternate' }}</span>
                    </div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {{ placeholder || 'Tambah Berkas Galeri Foto Multi-Media' }}
                        </p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {{ subtext || defaultSubtext }}
                        </p>
                    </div>
                </div>
                <div class="shrink-0 self-end sm:self-center">
                    <CtaButton
                        type="direct"
                        variant="primary"
                        :colorTheme="effectiveColorTheme"
                        :size="sizeStyles.buttonSize"
                        :rounded="innerRadius"
                        icon="add"
                        label="Pilih Berkas"
                        @click.stop.prevent="triggerPicker"
                    />
                </div>
            </div>

            <!-- Gallery Cards Grid -->
            <div v-if="filePreviews.length > 0" class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                    <div class="flex items-center gap-2">
                        <span>Galeri Berkas</span>
                        <Badge size="xs" variant="soft" :color="colorThemeClasses.badge">
                            {{ filePreviews.length }}{{ maxFiles ? `/${maxFiles}` : '' }}
                        </Badge>
                    </div>
                    <CtaButton
                        v-if="!disabled"
                        type="direct"
                        variant="ghost"
                        colorTheme="rose"
                        size="xs"
                        icon="clear_all"
                        label="Hapus Semua"
                        @click="clear"
                    />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    <div
                        v-for="(file, idx) in filePreviews"
                        :key="idx"
                        :class="[
                            'relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs group hover:border-slate-300 transition-colors',
                            radiusClasses
                        ]"
                    >
                        <div :class="['relative w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center', sizeStyles.previewHeight]">
                            <img
                                v-if="file.isImage"
                                :src="file.url"
                                :alt="file.name"
                                class="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                                @click="activeModalPreview = file.url"
                            />
                            <div v-else class="flex flex-col items-center justify-center p-2 text-center" :class="file.meta.color">
                                <span class="material-symbols-outlined text-3xl">{{ file.meta.icon }}</span>
                                <Badge size="xs" variant="surface" :color="colorThemeClasses.badge" class="mt-1">
                                    {{ file.meta.badge }}
                                </Badge>
                            </div>

                            <!-- Remove Button Top-Right -->
                            <div v-if="!disabled" class="absolute top-1.5 right-1.5 z-10">
                                <button
                                    type="button"
                                    class="p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                                    title="Hapus"
                                    @click.stop="removeFile(idx)"
                                >
                                    <span class="material-symbols-outlined text-xs leading-none">close</span>
                                </button>
                            </div>

                            <!-- Zoom Button Bottom-Left -->
                            <div v-if="file.isImage" class="absolute bottom-1.5 left-1.5 z-10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    class="p-1 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                                    title="Perbesar"
                                    @click.stop="activeModalPreview = file.url"
                                >
                                    <span class="material-symbols-outlined text-xs leading-none">zoom_in</span>
                                </button>
                            </div>

                            <!-- Grid Item Uploading Overlay -->
                            <div
                                v-if="effectiveUploading"
                                class="absolute inset-0 bg-black/65 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 text-center p-2"
                            >
                                <span class="material-symbols-outlined text-xl animate-spin text-white">progress_activity</span>
                                <span class="text-[10px] font-mono mt-1">{{ effectiveProgress !== null ? `${effectiveProgress}%` : '...' }}</span>
                            </div>
                        </div>

                        <!-- Card Info Footer -->
                        <div class="p-2.5 space-y-0.5">
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" :title="file.name">
                                {{ file.name }}
                            </p>
                            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>{{ file.size }}</span>
                                <Badge size="xs" :variant="file.isExisting ? 'surface' : 'soft'" :color="file.isExisting ? 'neutral' : colorThemeClasses.badge">
                                    {{ file.isExisting ? 'Database' : file.meta.badge }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 4. VARIAN: LIST (Document Rows / Table Format)                             -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'list'" class="space-y-3">
            <div
                :class="[
                    'relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border-2 border-dashed transition-all duration-200 cursor-pointer select-none group w-full',
                    radiusClasses,
                    isDragging
                        ? colorThemeClasses.dragOver
                        : ['border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40', colorThemeClasses.borderHover],
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @click="triggerPicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span class="material-symbols-outlined text-2xl shrink-0" :class="colorThemeClasses.iconText">upload_file</span>
                    <div class="min-w-0 flex-1 space-y-0.5">
                        <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {{ placeholder || 'Lampirkan Dokumen (PDF, XLSX, DOCX, ZIP)' }}
                        </p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {{ subtext || defaultSubtext }}
                        </p>
                    </div>
                </div>
                <div class="shrink-0 self-end sm:self-center">
                    <CtaButton
                        type="direct"
                        variant="soft"
                        :colorTheme="effectiveColorTheme"
                        size="xs"
                        :rounded="innerRadius"
                        icon="attach_file"
                        label="Tambah Dokumen"
                        @click.stop.prevent="triggerPicker"
                    />
                </div>
            </div>

            <!-- Table / List Row Format -->
            <div
                v-if="filePreviews.length > 0"
                :class="[
                    'border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs w-full',
                    radiusClasses
                ]"
            >
                <div
                    v-for="(file, idx) in filePreviews"
                    :key="idx"
                    class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            v-if="file.isImage"
                            :class="['w-10 h-10 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer', innerRadius]"
                            @click="activeModalPreview = file.url"
                        >
                            <img :src="file.url" :alt="file.name" class="w-full h-full object-cover" />
                        </div>
                        <div
                            v-else
                            :class="['w-10 h-10 flex items-center justify-center shrink-0', innerRadius, file.meta.color]"
                        >
                            <span class="material-symbols-outlined text-lg">{{ file.meta.icon }}</span>
                        </div>

                        <div class="min-w-0 flex-1 space-y-0.5">
                            <div class="flex items-center gap-2">
                                <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" :title="file.name">
                                    {{ file.name }}
                                </p>
                                <Badge size="xs" :variant="file.isExisting ? 'surface' : 'soft'" :color="file.isExisting ? 'neutral' : colorThemeClasses.badge" class="shrink-0">
                                    {{ file.isExisting ? 'Database' : file.meta.badge }}
                                </Badge>
                            </div>
                            <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                <span>{{ file.size }}</span>
                                <span v-if="file.modifiedAt">• {{ file.modifiedAt }}</span>
                            </div>

                            <!-- List row progress bar -->
                            <div v-if="effectiveUploading" :class="['h-1 w-full max-w-xs rounded-full overflow-hidden mt-1', colorThemeClasses.progressTrack]">
                                <div
                                    class="h-full rounded-full transition-all duration-300"
                                    :class="colorThemeClasses.progressBar"
                                    :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-1.5 shrink-0">
                        <CtaButton
                            v-if="file.isImage"
                            type="direct"
                            variant="ghost"
                            colorTheme="dark"
                            size="xs"
                            icon="zoom_in"
                            @click="activeModalPreview = file.url"
                        />
                        <CtaButton
                            v-if="!disabled"
                            type="direct"
                            variant="ghost"
                            colorTheme="rose"
                            size="xs"
                            icon="delete"
                            @click="removeFile(idx)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 5. VARIAN: BUTTON (Tombol Aksi Cepat / Toolbar Trigger)                   -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'button'" class="flex flex-wrap items-center gap-2.5">
            <CtaButton
                type="direct"
                :variant="effectiveUploading ? 'outline' : 'primary'"
                :colorTheme="effectiveColorTheme"
                :size="sizeStyles.buttonSize"
                :rounded="radiusClasses"
                :loading="effectiveUploading"
                :icon="effectiveUploading ? '' : (filePreviews.length > 0 ? 'check_circle' : 'upload_file')"
                :label="effectiveUploading ? `Mengunggah (${effectiveProgress !== null ? effectiveProgress + '%' : '...'})` : (placeholder || (filePreviews.length > 0 ? `${filePreviews.length} Berkas Dipilih` : 'Pilih Berkas'))"
                :disabled="disabled"
                @click="triggerPicker"
            />
            <span v-if="filePreviews.length > 0 && !isMinimalMode" class="text-xs text-slate-500 font-mono truncate max-w-xs">
                {{ filePreviews[0].name }} ({{ filePreviews[0].size }})
            </span>
            <CtaButton
                v-if="filePreviews.length > 0 && !disabled"
                type="direct"
                variant="ghost"
                colorTheme="rose"
                size="xs"
                icon="delete"
                label="Batal"
                @click="clear"
            />
        </div>

        <!-- ========================================================================= -->
        <!-- 6. VARIAN: COMPACT (Baris Kompak Satu Jalur)                              -->
        <!-- ========================================================================= -->
        <div
            v-else-if="effectiveVariant === 'compact'"
            :class="[
                'relative flex items-center justify-between gap-3 px-3 py-2 border transition-all duration-200 bg-white dark:bg-slate-900 shadow-2xs w-full select-none',
                radiusClasses,
                isDragging ? colorThemeClasses.dragOver : 'border-slate-300 dark:border-slate-700',
                disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
        >
            <div class="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer" @click="triggerPicker">
                <span class="material-symbols-outlined text-lg shrink-0" :class="colorThemeClasses.iconText">
                    {{ filePreviews.length > 0 ? 'check_circle' : 'attach_file' }}
                </span>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {{ filePreviews.length > 0 ? filePreviews.map(f => f.name).join(', ') : (placeholder || 'Pilih berkas untuk diunggah...') }}
                </span>
                <span v-if="filePreviews.length > 0 && !isMinimalMode" class="text-[10px] text-slate-400 font-mono shrink-0">
                    ({{ filePreviews[0].size }})
                </span>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
                <CtaButton
                    v-if="filePreviews.length > 0 && !disabled"
                    type="direct"
                    variant="ghost"
                    colorTheme="rose"
                    size="xs"
                    icon="close"
                    @click="clear"
                />
                <CtaButton
                    type="direct"
                    variant="soft"
                    :colorTheme="effectiveColorTheme"
                    size="xs"
                    :rounded="innerRadius"
                    :label="filePreviews.length > 0 ? 'Ganti' : 'Jelajahi'"
                    @click.stop.prevent="triggerPicker"
                />
            </div>

            <!-- Compact Bottom Progress Line -->
            <div
                v-if="effectiveUploading"
                class="absolute bottom-0 inset-x-0 h-1 overflow-hidden"
                :class="colorThemeClasses.progressTrack"
            >
                <div
                    class="h-full transition-all duration-300"
                    :class="colorThemeClasses.progressBar"
                    :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                />
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 7. VARIAN: BANNER (Sampul Lebar 16:9 / Cover Header)                      -->
        <!-- ========================================================================= -->
        <div
            v-else-if="effectiveVariant === 'banner'"
            :class="[
                'relative overflow-hidden border-2 border-dashed transition-all duration-200 select-none cursor-pointer flex flex-col items-center justify-center text-center group w-full',
                sizeStyles.bannerHeight,
                radiusClasses,
                isDragging
                    ? colorThemeClasses.dragOver
                    : (error || internalError)
                        ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/15'
                        : ['border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40', colorThemeClasses.borderHover],
                disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
            ]"
            @click="triggerPicker"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
        >
            <!-- Background Cover Image Preview -->
            <template v-if="filePreviews.length > 0 && filePreviews[0].isImage">
                <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/45 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <CtaButton
                        type="direct"
                        variant="soft"
                        :colorTheme="effectiveColorTheme"
                        size="xs"
                        :rounded="innerRadius"
                        icon="sync"
                        label="Ganti Sampul"
                        @click.stop.prevent="triggerPicker"
                    />
                    <CtaButton
                        type="direct"
                        variant="soft"
                        colorTheme="rose"
                        size="xs"
                        :rounded="innerRadius"
                        icon="delete"
                        label="Hapus"
                        @click.stop.prevent="removeFile(0)"
                    />
                    <CtaButton
                        type="direct"
                        variant="soft"
                        colorTheme="dark"
                        size="xs"
                        :rounded="innerRadius"
                        icon="zoom_in"
                        label="Perbesar"
                        @click.stop.prevent="activeModalPreview = filePreviews[0].url"
                    />
                </div>
            </template>

            <!-- Empty Banner Content -->
            <template v-else>
                <div class="space-y-2 p-4 max-w-md">
                    <span class="material-symbols-outlined text-3xl" :class="colorThemeClasses.iconText">panorama</span>
                    <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {{ placeholder || 'Unggah Gambar Sampul / Banner Header' }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500">
                        {{ subtext || 'Rekomendasi rasio 16:9 atau lebar minimal 1200px • ' + defaultSubtext }}
                    </p>
                    <div class="pt-1">
                        <CtaButton
                            type="direct"
                            variant="outline"
                            :colorTheme="effectiveColorTheme"
                            size="xs"
                            :rounded="innerRadius"
                            icon="image"
                            label="Pilih Foto Sampul"
                            @click.stop.prevent="triggerPicker"
                        />
                    </div>
                </div>
            </template>

            <!-- Banner Uploading Overlay -->
            <div
                v-if="effectiveUploading"
                class="absolute inset-0 bg-black/70 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 p-4 space-y-2 select-none"
                @click.stop
            >
                <span class="material-symbols-outlined text-3xl animate-spin text-white">progress_activity</span>
                <span class="text-xs font-bold font-mono">Mengunggah Sampul: {{ effectiveProgress !== null ? `${effectiveProgress}%` : '...' }}</span>
                <div class="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div class="h-full bg-white rounded-full transition-all duration-300" :style="{ width: `${effectiveProgress || 0}%` }" />
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 8. VARIAN: PASTE (Area Tangkapan Clipboard Ctrl+V Khusus)                  -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'paste'" class="space-y-3.5 w-full">
            <!-- Box Tangkapan Clipboard: Aktif jika multiple, atau belum ada berkas -->
            <div
                v-if="multiple || filePreviews.length === 0"
                :class="[
                    'relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer select-none text-center group w-full outline-hidden',
                    (multiple && filePreviews.length > 0) ? 'p-4 sm:p-5' : sizeStyles.dropzonePadding,
                    radiusClasses,
                    isDragging
                        ? colorThemeClasses.dragOver
                        : (error || internalError)
                            ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/15'
                            : ['border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 shadow-xs focus:ring-2 focus:ring-offset-2', colorThemeClasses.borderHover],
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                tabindex="0"
                @click="triggerPicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="space-y-2 max-w-md px-2">
                    <div class="flex items-center justify-center gap-2">
                        <div
                            :class="[
                                'border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105',
                                (multiple && filePreviews.length > 0) ? 'w-10 h-10' : sizeStyles.iconContainer,
                                innerRadius,
                                colorThemeClasses.bgIcon,
                                colorThemeClasses.iconText
                            ]"
                        >
                            <span class="material-symbols-outlined leading-none" :class="(multiple && filePreviews.length > 0) ? 'text-xl' : sizeStyles.iconText">
                                {{ isDragging ? 'file_download' : 'content_paste' }}
                            </span>
                        </div>
                    </div>
                    <p class="text-slate-800 dark:text-slate-100" :class="sizeStyles.titleText">
                        {{ placeholder || (isDragging ? 'Lepaskan gambar di sini' : ((multiple && filePreviews.length > 0) ? 'Tempel foto tambahan (Ctrl + V) atau tarik ke sini' : 'Tempel Gambar dari Clipboard (Ctrl + V) atau Tarik ke Sini')) }}
                    </p>
                    <p class="text-slate-400 dark:text-slate-500 leading-relaxed" :class="sizeStyles.subText">
                        {{ subtext || 'Tangkapan layar (screenshot) atau foto yang disalin langsung tertangkap otomatis' }}
                    </p>
                    <div class="flex items-center justify-center gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            Ctrl + V
                        </span>
                        <span class="text-[11px] text-slate-400">atau</span>
                        <CtaButton
                            type="direct"
                            variant="outline"
                            :colorTheme="effectiveColorTheme"
                            :size="sizeStyles.buttonSize"
                            :rounded="innerRadius"
                            icon="folder_open"
                            :label="(multiple && filePreviews.length > 0) ? 'Tambah Berkas' : 'Pilih Berkas'"
                            @click.stop.prevent="triggerPicker"
                        />
                    </div>
                </div>
            </div>

            <!-- Single Paste Preview Card: Ditampilkan saat multiple = false dan ada berkas -->
            <div
                v-else-if="filePreviews.length > 0"
                :class="[
                    'relative flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-full',
                    radiusClasses
                ]"
            >
                <!-- Thumbnail / Media Preview -->
                <div
                    v-if="filePreviews[0].isImage"
                    :class="[
                        'relative w-full sm:w-32 h-40 sm:h-24 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer group shadow-2xs',
                        innerRadius
                    ]"
                    @click="activeModalPreview = filePreviews[0].url"
                    title="Klik untuk melihat resolusi penuh"
                >
                    <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-xl">zoom_in</span>
                    </div>
                    <div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[10px]">content_paste</span>
                        <span>Clipboard</span>
                    </div>
                </div>

                <div
                    v-else
                    :class="[
                        'w-full sm:w-32 h-24 border flex flex-col items-center justify-center shrink-0 shadow-2xs',
                        innerRadius,
                        filePreviews[0].meta.color
                    ]"
                >
                    <span class="material-symbols-outlined text-3xl">{{ filePreviews[0].meta.icon }}</span>
                    <span class="text-xs font-bold font-mono tracking-wider mt-1">{{ filePreviews[0].meta.badge }}</span>
                </div>

                <!-- Metadata & Aksi -->
                <div class="min-w-0 flex-1 space-y-1.5 w-full text-center sm:text-left">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" :title="filePreviews[0].name">
                            {{ filePreviews[0].name }}
                        </p>
                        <Badge size="xs" :variant="filePreviews[0].isExisting ? 'surface' : 'soft'" :color="filePreviews[0].isExisting ? 'neutral' : colorThemeClasses.badge" class="self-center sm:self-auto shrink-0">
                            {{ filePreviews[0].isExisting ? 'Tersimpan di Server' : 'Tangkapan Clipboard' }}
                        </Badge>
                    </div>

                    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">straighten</span>
                            {{ filePreviews[0].size }}
                        </span>
                        <span v-if="filePreviews[0].dimensions" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">aspect_ratio</span>
                            {{ filePreviews[0].dimensions }}
                        </span>
                        <span v-if="filePreviews[0].modifiedAt" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">schedule</span>
                            {{ filePreviews[0].modifiedAt }}
                        </span>
                    </div>

                    <!-- Progress bar upload jika simulasi aktif -->
                    <div v-if="effectiveUploading" class="space-y-1 pt-1 max-w-md">
                        <div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span class="flex items-center gap-1 text-primary-600 font-bold">
                                <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                                Mengunggah...
                            </span>
                            <span>{{ effectiveProgress !== null ? `${effectiveProgress}%` : '...' }}</span>
                        </div>
                        <div :class="['h-1.5 w-full rounded-full overflow-hidden', colorThemeClasses.progressTrack]">
                            <div
                                class="h-full rounded-full transition-all duration-300"
                                :class="colorThemeClasses.progressBar"
                                :style="{ width: effectiveProgress !== null ? `${effectiveProgress}%` : '100%' }"
                            />
                        </div>
                    </div>

                    <p class="text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                        Tekan <span class="font-mono font-bold text-slate-600 dark:text-slate-300">Ctrl + V</span> lagi untuk mengganti foto secara langsung
                    </p>

                    <div v-if="!disabled" class="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <CtaButton
                            type="direct"
                            variant="soft"
                            :colorTheme="effectiveColorTheme"
                            size="xs"
                            :rounded="innerRadius"
                            icon="sync"
                            label="Ganti Berkas"
                            @click.stop.prevent="triggerPicker"
                        />
                        <CtaButton
                            type="direct"
                            variant="soft"
                            colorTheme="rose"
                            size="xs"
                            :rounded="innerRadius"
                            icon="delete"
                            label="Hapus"
                            @click.stop.prevent="removeFile(0)"
                        />
                    </div>
                </div>
            </div>

            <!-- Multiple Preview List in Paste Variant (Jika multiple = true) -->
            <div v-if="multiple && filePreviews.length > 0" class="space-y-2 pt-1">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                    <div class="flex items-center gap-2">
                        <span>Daftar Tangkapan Clipboard</span>
                        <Badge size="xs" variant="soft" :color="colorThemeClasses.badge">
                            {{ filePreviews.length }}{{ maxFiles ? ` / ${maxFiles}` : '' }} berkas
                        </Badge>
                    </div>
                    <CtaButton
                        v-if="!disabled"
                        type="direct"
                        variant="ghost"
                        colorTheme="rose"
                        size="xs"
                        icon="clear_all"
                        label="Hapus Semua"
                        @click="clear"
                    />
                </div>

                <!-- Structured Clean List Rows -->
                <div
                    :class="[
                        'border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs w-full',
                        radiusClasses
                    ]"
                >
                    <div
                        v-for="(item, idx) in filePreviews"
                        :key="item.url || item.name || idx"
                        class="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                    >
                        <!-- Thumbnail atau Icon -->
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <div
                                v-if="item.isImage"
                                :class="['w-10 h-10 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer group', innerRadius]"
                                @click="activeModalPreview = item.url"
                                title="Klik untuk memperbesar"
                            >
                                <img :src="item.url" :alt="item.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div
                                v-else
                                :class="['w-10 h-10 border flex items-center justify-center shrink-0', innerRadius, item.meta.color]"
                            >
                                <span class="material-symbols-outlined text-lg">{{ item.meta.icon }}</span>
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5">
                                    <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" :title="item.name">
                                        {{ item.name }}
                                    </p>
                                    <Badge size="xs" :variant="item.isExisting ? 'surface' : 'soft'" :color="item.isExisting ? 'neutral' : colorThemeClasses.badge" class="shrink-0">
                                        {{ item.isExisting ? 'Server' : item.meta.badge }}
                                    </Badge>
                                </div>
                                <p class="text-[11px] text-slate-400 font-mono">
                                    {{ item.size }} <span v-if="item.dimensions">• {{ item.dimensions }}</span>
                                </p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div v-if="!disabled" class="flex items-center gap-1 shrink-0">
                            <button
                                v-if="item.isImage"
                                type="button"
                                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Perbesar Gambar"
                                @click="activeModalPreview = item.url"
                            >
                                <span class="material-symbols-outlined text-base leading-none">zoom_in</span>
                            </button>
                            <button
                                type="button"
                                class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Hapus Berkas Ini"
                                @click="removeFile(idx)"
                            >
                                <span class="material-symbols-outlined text-base leading-none">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- CUSTOM SLOT #loading / #uploading JIKA DISEDIAKAN DEVELOPER               -->
        <!-- ========================================================================= -->
        <slot
            v-if="effectiveUploading && $slots.loading"
            name="loading"
            :progress="effectiveProgress"
            :cancel="cancelUpload"
            :uploading="effectiveUploading"
        />

        <!-- Internal / Validation Error Alert -->
        <div
            v-if="internalError"
            class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium px-0.5"
            role="alert"
        >
            <span class="material-symbols-outlined text-sm leading-none shrink-0">warning</span>
            <span>{{ internalError }}</span>
        </div>

        <!-- Fullscreen Image Zoom Modal -->
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="activeModalPreview"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
                @click="activeModalPreview = null"
            >
                <div
                    :class="[
                        'relative max-w-3xl max-h-[90vh] p-2.5 sm:p-3 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden w-full',
                        radiusClasses
                    ]"
                    @click.stop
                >
                    <img :src="activeModalPreview" alt="Pratinjau Penuh" :class="['max-w-full max-h-[75vh] object-contain mx-auto', innerRadius]" />
                    <div class="flex items-center justify-between px-2 pt-3 pb-1">
                        <span class="text-xs text-slate-500 font-medium truncate mr-2">Pratinjau Resolusi Penuh</span>
                        <CtaButton
                            type="direct"
                            variant="soft"
                            colorTheme="dark"
                            size="xs"
                            :rounded="innerRadius"
                            icon="close"
                            label="Tutup"
                            @click="activeModalPreview = null"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>
