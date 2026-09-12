<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: [File, Array, String, Object],
        default: null,
    },
    variant: {
        type: String,
        default: 'dropzone', // 'dropzone' (single hero), 'avatar' (single profile), 'grid' (multi gallery), 'list' (multi row list)
    },
    layout: {
        type: String,
        default: '', // Alias untuk variant
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
        default: null,
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
        default: null,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'error', 'cancel-upload']);

const isDragging = ref(false);
const filePreviews = ref([]);
const internalError = ref('');
const activeModalPreview = ref(null);

// Resolve effective variant
const effectiveVariant = computed(() => {
    const v = (props.variant || props.layout || '').toLowerCase();
    if (['avatar', 'profile', 'compact'].includes(v)) return 'avatar';
    if (['list', 'table', 'row'].includes(v)) return 'list';
    if (['grid', 'gallery'].includes(v)) return 'grid';
    if (['dropzone', 'banner', 'hero'].includes(v)) return 'dropzone';
    return props.multiple ? 'grid' : 'dropzone';
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
});

// Helpers
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

const maxSizeBytes = computed(() => {
    if (!props.maxSize) return null;
    if (typeof props.maxSize === 'number') return props.maxSize;
    const str = String(props.maxSize).trim().toUpperCase();
    if (str.endsWith('GB') || str.endsWith('G')) return parseFloat(str) * 1024 * 1024 * 1024;
    if (str.endsWith('MB') || str.endsWith('M')) return parseFloat(str) * 1024 * 1024;
    if (str.endsWith('KB') || str.endsWith('K')) return parseFloat(str) * 1024;
    return parseFloat(str) || null;
});

const formatAcceptDisplay = (acceptStr) => {
    if (!acceptStr || acceptStr.trim() === '' || acceptStr === '*') return 'Semua format berkas';
    if (acceptStr === 'image/*') return 'Foto/Gambar (JPG, PNG, WebP, GIF)';
    if (acceptStr === 'image/*,.pdf') return 'Foto & Dokumen PDF';
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
    const rules = acceptPattern.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
    const fileName = (file.name || '').toLowerCase();
    const fileType = (file.type || '').toLowerCase();

    return rules.some(rule => {
        if (rule.startsWith('.')) {
            return fileName.endsWith(rule);
        }
        if (rule.endsWith('/*')) {
            const prefix = rule.slice(0, -1); // e.g. 'image/'
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

const initExistingPreview = () => {
    if (typeof props.modelValue === 'string' && props.modelValue) {
        const fullUrl = formatFileUrl(props.modelValue);
        const fileName = props.modelValue.split('/').pop().split('\\').pop();
        const isImage = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(props.modelValue);
        filePreviews.value = [{
            name: fileName,
            size: 'Berkas Tersimpan',
            url: fullUrl,
            isImage,
            isExisting: true,
            meta: getFileTypeMeta(fileName, ''),
            dimensions: '',
            modifiedAt: '',
        }];
    }
};

onMounted(() => {
    initExistingPreview();
});

watch(() => props.modelValue, (newVal) => {
    if (!newVal) {
        cleanupAllBlobs();
        filePreviews.value = [];
    } else if (typeof newVal === 'string') {
        initExistingPreview();
    }
});

const processFiles = (filesList) => {
    internalError.value = '';
    const incomingFiles = Array.from(filesList);
    if (incomingFiles.length === 0) return;

    // Filter valid vs invalid berkas berdasarkan accept & maxSize
    const acceptedFiles = [];
    const rejectedByFormat = [];
    const rejectedBySize = [];

    incomingFiles.forEach(file => {
        if (props.accept && !isFileTypeAccepted(file, props.accept)) {
            rejectedByFormat.push(file.name);
        } else if (maxSizeBytes.value && file.size > maxSizeBytes.value) {
            rejectedBySize.push(`${file.name} (${formatBytes(file.size)})`);
        } else {
            acceptedFiles.push(file);
        }
    });

    // Susun notifikasi jelas jika ada berkas yang ditolak
    const errorMessages = [];
    if (rejectedByFormat.length > 0) {
        errorMessages.push(
            `${rejectedByFormat.length} berkas ditolak karena format tidak diizinkan: "${rejectedByFormat.join(', ')}" (Hanya format: ${formatAcceptDisplay(props.accept)})`
        );
    }
    if (rejectedBySize.length > 0) {
        errorMessages.push(
            `${rejectedBySize.length} berkas ditolak karena melebihi batas ukuran (${rejectedBySize.join(', ')})`
        );
    }

    if (errorMessages.length > 0) {
        internalError.value = errorMessages.join('. ');
        emit('error', internalError.value);
    }

    // Jika seluruh berkas tidak lolos validasi, hentikan proses
    if (acceptedFiles.length === 0) {
        return;
    }

    if (props.multiple) {
        const existing = Array.isArray(props.modelValue) ? Array.from(props.modelValue) : [];
        const existingKeys = new Set(existing.map(f => `${f.name}_${f.size}_${f.lastModified || ''}`));
        const newUnique = acceptedFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}_${f.lastModified || ''}`));

        let finalFiles = [...existing, ...newUnique];

        if (props.maxFiles && finalFiles.length > props.maxFiles) {
            const excess = finalFiles.length - props.maxFiles;
            finalFiles = finalFiles.slice(0, props.maxFiles);
            internalError.value = `Maksimal ${props.maxFiles} berkas yang diizinkan. ${excess} berkas selebihnya tidak disertakan.`;
            emit('error', internalError.value);
        }

        emit('update:modelValue', finalFiles);
        emit('change', finalFiles);

        newUnique.forEach(file => {
            filePreviews.value.push(createPreviewItem(file));
        });

        if (props.maxFiles && filePreviews.value.length > props.maxFiles) {
            const trimmed = filePreviews.value.splice(props.maxFiles);
            trimmed.forEach(item => {
                if (item.url) revokeBlobUrl(item.url);
            });
        }
    } else {
        cleanupAllBlobs();
        emit('update:modelValue', acceptedFiles[0]);
        emit('change', acceptedFiles[0]);
        filePreviews.value = [createPreviewItem(acceptedFiles[0])];
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

const removeFile = (index) => {
    const removed = filePreviews.value.splice(index, 1)[0];
    if (removed && removed.url) {
        revokeBlobUrl(removed.url);
    }

    if (props.multiple && Array.isArray(props.modelValue)) {
        const files = Array.from(props.modelValue);
        files.splice(index, 1);
        const nextVal = files.length > 0 ? files : null;
        emit('update:modelValue', nextVal);
        emit('change', nextVal);
    } else {
        emit('update:modelValue', null);
        emit('change', null);
    }
    internalError.value = '';
};
</script>

<template>
    <div class="space-y-3 w-full">
        <!-- Input File Element (Hidden Native) -->
        <input
            :id="id"
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
        <!-- TIPE 1: SINGLE FILE - AVATAR / PROFILE / COMPACT CARD                      -->
        <!-- ========================================================================= -->
        <div v-if="effectiveVariant === 'avatar'" class="flex items-center gap-4">
            <label
                :for="id"
                class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center cursor-pointer transition-all duration-200 group hover:border-blue-500 shadow-xs select-none"
                :class="[
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
                    (error || internalError) ? 'border-rose-500' : ''
                ]"
            >
                <!-- Existing/Uploaded Photo -->
                <template v-if="filePreviews.length > 0 && filePreviews[0].isImage">
                    <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="w-full h-full object-cover" />
                    <!-- Hover Change Overlay -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1">
                        <span class="material-symbols-outlined text-xl">photo_camera</span>
                        <span>Ganti</span>
                    </div>
                </template>

                <!-- Non-Image or Empty State -->
                <div v-else-if="filePreviews.length > 0" class="flex flex-col items-center justify-center text-center p-2">
                    <span class="material-symbols-outlined text-3xl text-blue-600">{{ filePreviews[0].meta.icon }}</span>
                    <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{{ filePreviews[0].meta.badge }}</span>
                </div>

                <!-- Empty Placeholder -->
                <div v-else class="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors p-2 text-center">
                    <span class="material-symbols-outlined text-3xl leading-none">add_a_photo</span>
                    <span class="text-[10px] font-semibold mt-1">Unggah</span>
                </div>
            </label>

            <!-- Avatar Metadata & Actions Column -->
            <div class="space-y-1.5 min-w-0 flex-1">
                <div v-if="filePreviews.length > 0" class="space-y-1">
                    <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" :title="filePreviews[0].name">
                        {{ filePreviews[0].name }}
                    </p>
                    <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{{ filePreviews[0].size }}</span>
                        <span v-if="filePreviews[0].dimensions">• {{ filePreviews[0].dimensions }}</span>
                    </div>
                    <button
                        v-if="!disabled"
                        type="button"
                        @click="removeFile(0)"
                        class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                        <span class="material-symbols-outlined text-xs">delete</span>
                        Hapus Foto
                    </button>
                </div>
                <div v-else class="space-y-1">
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {{ placeholder || 'Foto Profil / Logo Merchant' }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500">
                        {{ subtext || 'PNG, JPG, WEBP hingga ' + (maxSize ? formatBytes(maxSizeBytes) : '5MB') }}
                        {{ defaultSubtext }}
                    </p>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TIPE 2: SINGLE FILE - HERO BANNER DROPZONE                                -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'dropzone'" class="space-y-3">
            <!-- Dropzone Banner (Hidden when 1 file is selected) -->
            <label
                v-if="filePreviews.length === 0"
                :for="id"
                :class="[
                    'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer select-none text-center group',
                    isDragging
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/15'
                        : (error || internalError)
                            ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/15'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 shadow-xs',
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-2xl leading-none">{{ isDragging ? 'file_download' : 'cloud_upload' }}</span>
                </div>
                <div class="space-y-1 max-w-sm">
                    <p class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                        {{ placeholder || (isDragging ? 'Lepaskan berkas di sini' : 'Tarik & seret berkas ke sini, atau klik untuk memilih') }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500">
                        {{ subtext || [accept ? `Format: ${accept}` : 'Semua format berkas', maxSize ? `Maks. ${formatBytes(maxSizeBytes)}` : ''].filter(Boolean).join(' • ') }}
                        {{ defaultSubtext }}
                    </p>
                </div>
                <div class="mt-3">
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:border-blue-400 transition-colors">
                        <span class="material-symbols-outlined text-sm leading-none">attach_file</span>
                        Pilih Berkas
                    </span>
                </div>
            </label>

            <!-- Single Hero Card Preview -->
            <div
                v-else
                class="relative flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
                <!-- Large Image Preview with Zoom -->
                <div
                    v-if="filePreviews[0].isImage"
                    class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer group"
                    @click="activeModalPreview = filePreviews[0].url"
                    title="Perbesar gambar"
                >
                    <img :src="filePreviews[0].url" :alt="filePreviews[0].name" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-xl">zoom_in</span>
                    </div>
                </div>

                <!-- Document Icon Preview -->
                <div
                    v-else
                    class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-2xs"
                    :class="filePreviews[0].meta.color"
                >
                    <span class="material-symbols-outlined text-3xl">{{ filePreviews[0].meta.icon }}</span>
                    <span class="text-xs font-bold font-mono tracking-wider mt-1">{{ filePreviews[0].meta.badge }}</span>
                </div>

                <!-- Full Metadata Information -->
                <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" :title="filePreviews[0].name">
                            {{ filePreviews[0].name }}
                        </p>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {{ filePreviews[0].meta.badge }}
                        </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
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

                    <div class="pt-1 flex items-center gap-3">
                        <label :for="id" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">sync</span>
                            Ganti Berkas
                        </label>
                        <button
                            type="button"
                            @click="removeFile(0)"
                            class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span class="material-symbols-outlined text-xs">delete</span>
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TIPE 3: MULTIPLE FILE - VISUAL GALLERY CARDS (GRID)                       -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'grid'" class="space-y-3">
            <!-- Compact Drag & Drop Area -->
            <label
                :for="id"
                :class="[
                    'relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer select-none group',
                    isDragging
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/15'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40',
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
                        <span class="material-symbols-outlined text-xl">{{ isDragging ? 'file_download' : 'add_photo_alternate' }}</span>
                    </div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {{ placeholder || 'Tambah Berkas Galeri Foto Multi-File' }}
                        </p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                            {{ defaultSubtext }}
                        </p>
                    </div>
                </div>
                <span class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0 self-end sm:self-center">
                    Pilih Berkas
                </span>
            </label>

            <!-- Gallery Cards Grid (2 - 3 Columns) -->
            <div v-if="filePreviews.length > 0" class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-0.5">
                    <div class="flex items-center gap-2">
                        <span>Galeri Berkas ({{ filePreviews.length }}{{ maxFiles ? `/${maxFiles}` : '' }})</span>
                        <span class="text-[10px] font-normal text-slate-400">({{ defaultSubtext }})</span>
                    </div>
                    <button type="button" @click="cleanupAllBlobs(); filePreviews = []; $emit('update:modelValue', null)" class="text-[11px] text-rose-500 hover:underline cursor-pointer">Hapus Semua</button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                        v-for="(file, idx) in filePreviews"
                        :key="idx"
                        class="relative flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs group hover:border-slate-300 transition-colors"
                    >
                        <!-- Top Thumbnail -->
                        <div class="relative h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                            <img
                                v-if="file.isImage"
                                :src="file.url"
                                :alt="file.name"
                                class="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                                @click="activeModalPreview = file.url"
                            />
                            <div v-else class="flex flex-col items-center justify-center p-2 text-center" :class="file.meta.color">
                                <span class="material-symbols-outlined text-3xl">{{ file.meta.icon }}</span>
                                <span class="text-[10px] font-bold font-mono tracking-wider">{{ file.meta.badge }}</span>
                            </div>

                            <!-- Remove Button Overlay Top-Right -->
                            <button
                                v-if="!disabled"
                                type="button"
                                @click="removeFile(idx)"
                                class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus"
                            >
                                <span class="material-symbols-outlined text-xs leading-none">close</span>
                            </button>

                            <!-- Zoom Button Overlay Bottom-Left -->
                            <button
                                v-if="file.isImage"
                                type="button"
                                @click="activeModalPreview = file.url"
                                class="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-md bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Perbesar"
                            >
                                <span class="material-symbols-outlined text-xs">zoom_in</span>
                            </button>
                        </div>

                        <!-- Card Info Footer -->
                        <div class="p-2.5 space-y-0.5">
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" :title="file.name">
                                {{ file.name }}
                            </p>
                            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>{{ file.size }}</span>
                                <span class="font-bold text-slate-500 uppercase">{{ file.meta.badge }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TIPE 4: MULTIPLE FILE - COMPACT ROW LIST / TABLE FORMAT                   -->
        <!-- ========================================================================= -->
        <div v-else-if="effectiveVariant === 'list'" class="space-y-3">
            <!-- Compact Header Dropzone -->
            <label
                :for="id"
                :class="[
                    'relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer select-none group',
                    isDragging
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-4 ring-blue-500/15'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40',
                    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                ]"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span class="material-symbols-outlined text-2xl text-blue-600 shrink-0">upload_file</span>
                    <div class="min-w-0 flex-1 space-y-0.5">
                        <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {{ placeholder || 'Lampirkan Dokumen (PDF, XLSX, DOCX, ZIP)' }}
                        </p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                            {{ defaultSubtext }}
                        </p>
                    </div>
                </div>
                <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <span class="material-symbols-outlined text-sm">attach_file</span>
                    Tambah Dokumen
                </span>
            </label>

            <!-- Table / List Row Format -->
            <div v-if="filePreviews.length > 0" class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <div
                    v-for="(file, idx) in filePreviews"
                    :key="idx"
                    class="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div class="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <!-- Mini Thumbnail or Extension Badge -->
                        <div
                            v-if="file.isImage"
                            class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            @click="activeModalPreview = file.url"
                        >
                            <img :src="file.url" :alt="file.name" class="w-full h-full object-cover" />
                        </div>
                        <div
                            v-else
                            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            :class="file.meta.color"
                        >
                            <span class="material-symbols-outlined text-lg">{{ file.meta.icon }}</span>
                        </div>

                        <!-- Name & File Stats -->
                        <div class="min-w-0 flex-1 space-y-0.5">
                            <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" :title="file.name">
                                {{ file.name }}
                            </p>
                            <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                <span>{{ file.size }}</span>
                                <span v-if="file.modifiedAt">• {{ file.modifiedAt }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Row Actions -->
                    <div class="flex items-center gap-1 shrink-0">
                        <button
                            v-if="file.isImage"
                            type="button"
                            @click="activeModalPreview = file.url"
                            class="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center cursor-pointer"
                            title="Pratinjau"
                        >
                            <span class="material-symbols-outlined text-base">zoom_in</span>
                        </button>
                        <button
                            v-if="!disabled"
                            type="button"
                            @click="removeFile(idx)"
                            class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center cursor-pointer"
                            title="Hapus"
                        >
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- SHARED: UPLOAD PROGRESS BAR                                               -->
        <!-- ========================================================================= -->
        <div
            v-if="uploading"
            class="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 select-none"
        >
            <div class="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Mengunggah berkas...</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono font-bold">{{ progress !== null ? `${progress}%` : 'Memproses...' }}</span>
                    <button
                        type="button"
                        @click="$emit('cancel-upload')"
                        class="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-2"
                    >
                        Batal
                    </button>
                </div>
            </div>

            <div class="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-900/60 overflow-hidden">
                <div
                    class="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    :style="{ width: progress !== null ? `${progress}%` : '100%' }"
                    :class="progress === null ? 'animate-pulse' : ''"
                />
            </div>
        </div>

        <!-- Internal/Validation Error Alert -->
        <div
            v-if="internalError"
            class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium px-0.5"
            role="alert"
        >
            <span class="material-symbols-outlined text-sm leading-none shrink-0">warning</span>
            <span>{{ internalError }}</span>
        </div>

        <!-- Shared Fullscreen Image Zoom Modal -->
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
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none"
                @click="activeModalPreview = null"
            >
                <div class="relative max-w-3xl max-h-[85vh] p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" @click.stop>
                    <img :src="activeModalPreview" alt="Pratinjau Penuh" class="max-w-full max-h-[75vh] object-contain rounded-xl mx-auto" />
                    <div class="flex items-center justify-between px-3 pt-3 pb-1">
                        <span class="text-xs text-slate-500 font-medium">Pratinjau Resolusi Penuh</span>
                        <button
                            type="button"
                            @click="activeModalPreview = null"
                            class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>
