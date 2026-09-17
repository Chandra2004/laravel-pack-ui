<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    colorTheme: {
        type: String,
        default: 'primary',
    },
    radius: {
        type: String,
        default: 'lg',
    },
    imageUploadHandler: {
        type: Function,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const activeTab = ref('upload'); // 'upload' | 'url'
const imageUrl = ref('');
const imageAlt = ref('');
const selectedFile = ref(null);
const filePreviewUrl = ref('');
const isDragging = ref(false);
const isUploading = ref(false);
const uploadError = ref('');
const fileInputRef = ref(null);

const radiusClasses = computed(() => {
    switch (props.radius) {
        case 'none': return { box: 'rounded-none', inner: 'rounded-none', btn: 'rounded-none' };
        case 'sm': return { box: 'rounded-lg', inner: 'rounded-md', btn: 'rounded-md' };
        case 'md': return { box: 'rounded-xl', inner: 'rounded-lg', btn: 'rounded-lg' };
        case 'xl': return { box: 'rounded-3xl', inner: 'rounded-2xl', btn: 'rounded-xl' };
        case 'full': return { box: 'rounded-3xl', inner: 'rounded-2xl', btn: 'rounded-full' };
        case 'lg':
        default:
            return { box: 'rounded-2xl', inner: 'rounded-xl', btn: 'rounded-lg' };
    }
});

const colorStyles = computed(() => {
    const map = {
        primary: {
            btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            activeTab: 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
            iconBadge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            focusRing: 'focus:border-blue-500 focus:ring-blue-500/20',
            dropBorder: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        },
        indigo: {
            btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
            activeTab: 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400',
            iconBadge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            focusRing: 'focus:border-indigo-500 focus:ring-indigo-500/20',
            dropBorder: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20',
        },
        emerald: {
            btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
            activeTab: 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400',
            iconBadge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            focusRing: 'focus:border-emerald-500 focus:ring-emerald-500/20',
            dropBorder: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
        },
        purple: {
            btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
            activeTab: 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400',
            iconBadge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
            focusRing: 'focus:border-purple-500 focus:ring-purple-500/20',
            dropBorder: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
        },
        amber: {
            btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
            activeTab: 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400',
            iconBadge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            focusRing: 'focus:border-amber-500 focus:ring-amber-500/20',
            dropBorder: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
        },
        rose: {
            btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
            activeTab: 'text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400',
            iconBadge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            focusRing: 'focus:border-rose-500 focus:ring-rose-500/20',
            dropBorder: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
        },
        cyan: {
            btn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
            activeTab: 'text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400',
            iconBadge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
            focusRing: 'focus:border-cyan-500 focus:ring-cyan-500/20',
            dropBorder: 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
        },
        dark: {
            btn: 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900',
            activeTab: 'text-slate-900 dark:text-white border-slate-900 dark:border-white',
            iconBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            focusRing: 'focus:border-slate-700 dark:focus:border-slate-300 focus:ring-slate-500/20',
            dropBorder: 'border-slate-700 bg-slate-100 dark:border-slate-400 dark:bg-slate-800/40',
        },
    };
    return map[props.colorTheme] || map.primary;
});

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        imageUrl.value = '';
        imageAlt.value = '';
        selectedFile.value = null;
        filePreviewUrl.value = '';
        uploadError.value = '';
        isUploading.value = false;
        activeTab.value = 'upload';
    }
});

const close = () => {
    emit('update:modelValue', false);
};

const handleSelectFileClick = () => {
    fileInputRef.value?.click();
};

const processFile = (file) => {
    uploadError.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        uploadError.value = 'Format file tidak didukung. Harap pilih berkas gambar (JPG, PNG, WebP, GIF, SVG).';
        return;
    }

    // Maksimal 10MB
    if (file.size > 10 * 1024 * 1024) {
        uploadError.value = 'Ukuran berkas melebihi batas maksimal 10MB.';
        return;
    }

    selectedFile.value = file;
    if (!imageAlt.value) {
        // Ambil nama file tanpa ekstensi untuk default alt text
        imageAlt.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    // Buat pratinjau lokal
    const reader = new FileReader();
    reader.onload = (e) => {
        filePreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        processFile(file);
    }
};

const onDropFile = (e) => {
    isDragging.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
        processFile(file);
    }
};

const clearSelectedFile = () => {
    selectedFile.value = null;
    filePreviewUrl.value = '';
    uploadError.value = '';
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
};

const handleApply = async () => {
    uploadError.value = '';

    if (activeTab.value === 'upload') {
        if (!selectedFile.value) {
            uploadError.value = 'Silakan pilih berkas gambar terlebih dahulu.';
            return;
        }

        try {
            isUploading.value = true;
            let finalSrc = '';

            if (props.imageUploadHandler && typeof props.imageUploadHandler === 'function') {
                // Handler kustom dari developer (misal request ke server Laravel)
                finalSrc = await props.imageUploadHandler(selectedFile.value);
            } else {
                // Fallback otomatis: gunakan Base64 Data URL
                finalSrc = filePreviewUrl.value;
            }

            if (!finalSrc) {
                throw new Error('Gagal mendapatkan URL gambar hasil unggahan.');
            }

            emit('apply', {
                src: finalSrc,
                alt: imageAlt.value.trim() || selectedFile.value.name,
            });
            close();
        } catch (err) {
            uploadError.value = err.message || 'Terjadi kesalahan saat memproses gambar.';
        } finally {
            isUploading.value = false;
        }
    } else {
        const trimmed = imageUrl.value.trim();
        if (!trimmed) {
            uploadError.value = 'URL gambar tidak boleh kosong.';
            return;
        }
        emit('apply', {
            src: trimmed,
            alt: imageAlt.value.trim() || 'Gambar konten',
        });
        close();
    }
};
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs select-none"
                @click.self="close"
                role="dialog"
                aria-modal="true"
            >
                <div
                    :class="[
                        'w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col',
                        radiusClasses.box
                    ]"
                >
                    <!-- Header Modal -->
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-2.5">
                            <span :class="['w-8 h-8 rounded-xl flex items-center justify-center shrink-0', colorStyles.iconBadge]">
                                <span class="material-symbols-outlined text-base">image</span>
                            </span>
                            <div>
                                <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                                    Sisipkan Gambar
                                </h4>
                                <p class="text-[11px] text-slate-400">Unggah berkas lokal atau tempel tautan URL</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="close"
                            class="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <span class="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>

                    <!-- Modern Tab Switcher -->
                    <div class="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-1 bg-slate-50/50 dark:bg-slate-950/30">
                        <button
                            type="button"
                            @click="activeTab = 'upload'"
                            :class="[
                                'flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer -mb-px',
                                activeTab === 'upload'
                                    ? colorStyles.activeTab
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            ]"
                        >
                            <span class="material-symbols-outlined text-sm">cloud_upload</span>
                            <span>Unggah Berkas</span>
                        </button>

                        <button
                            type="button"
                            @click="activeTab = 'url'"
                            :class="[
                                'flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer -mb-px',
                                activeTab === 'url'
                                    ? colorStyles.activeTab
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            ]"
                        >
                            <span class="material-symbols-outlined text-sm">link</span>
                            <span>Tautan URL</span>
                        </button>
                    </div>

                    <!-- Body Content -->
                    <div class="p-5 space-y-3.5 text-left">
                        <!-- Tab 1: Upload File -->
                        <div v-if="activeTab === 'upload'" class="space-y-3">
                            <input
                                ref="fileInputRef"
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                class="hidden"
                                @change="onFileInputChange"
                            />

                            <!-- File Dropzone saat belum pilih gambar -->
                            <div
                                v-if="!filePreviewUrl"
                                @dragover.prevent="isDragging = true"
                                @dragleave="isDragging = false"
                                @drop.prevent="onDropFile"
                                @click="handleSelectFileClick"
                                :class="[
                                    'border-2 border-dashed py-7 px-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center',
                                    radiusClasses.inner,
                                    isDragging
                                        ? colorStyles.dropBorder
                                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/70 dark:bg-slate-950/50'
                                ]"
                            >
                                <span class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-2">
                                    <span class="material-symbols-outlined text-xl">upload_file</span>
                                </span>
                                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Klik untuk memilih gambar atau seret ke sini
                                </p>
                                <span class="text-[11px] text-slate-400 mt-0.5">
                                    PNG, JPG, WebP, GIF, SVG (Maks. 10MB)
                                </span>
                            </div>

                            <!-- Preview file yang dipilih -->
                            <div
                                v-else
                                :class="[
                                    'p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3',
                                    radiusClasses.inner
                                ]"
                            >
                                <div class="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200/80 dark:border-slate-800">
                                    <img :src="filePreviewUrl" alt="Pratinjau" class="w-full h-full object-cover" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h5 class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                        {{ selectedFile?.name }}
                                    </h5>
                                    <p class="text-[11px] text-slate-400">
                                        {{ formatFileSize(selectedFile?.size) }}
                                    </p>
                                    <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                        <span class="material-symbols-outlined text-xs">check_circle</span>
                                        Siap disisipkan
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    @click="clearSelectedFile"
                                    class="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Hapus / Ganti Berkas"
                                >
                                    <span class="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>

                            <!-- Alt text input -->
                            <div class="space-y-1">
                                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Teks Keterangan (Alt / Deskripsi):
                                </label>
                                <input
                                    v-model="imageAlt"
                                    type="text"
                                    placeholder="Deskripsi singkat gambar..."
                                    :class="[
                                        'w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                                        colorStyles.focusRing,
                                        radiusClasses.btn
                                    ]"
                                />
                            </div>
                        </div>

                        <!-- Tab 2: URL Link -->
                        <div v-else class="space-y-3">
                            <div class="space-y-1">
                                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    URL Gambar Eksternal:
                                </label>
                                <input
                                    v-model="imageUrl"
                                    type="url"
                                    placeholder="https://images.unsplash.com/..."
                                    @keyup.enter="handleApply"
                                    :class="[
                                        'w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                                        colorStyles.focusRing,
                                        radiusClasses.btn
                                    ]"
                                    autofocus
                                />
                            </div>

                            <div class="space-y-1">
                                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Teks Alternatif (Alt):
                                </label>
                                <input
                                    v-model="imageAlt"
                                    type="text"
                                    placeholder="Deskripsi singkat gambar..."
                                    @keyup.enter="handleApply"
                                    :class="[
                                        'w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                                        colorStyles.focusRing,
                                        radiusClasses.btn
                                    ]"
                                />
                            </div>

                            <!-- Live URL Image Preview -->
                            <div
                                v-if="imageUrl"
                                class="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                            >
                                <img
                                    :src="imageUrl"
                                    :alt="imageAlt || 'Pratinjau'"
                                    class="w-full h-full object-cover"
                                    @error="$event.target.style.display = 'none'"
                                />
                            </div>
                        </div>

                        <!-- Error Banner -->
                        <div v-if="uploadError" class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                            <span class="material-symbols-outlined text-sm shrink-0">error</span>
                            <span>{{ uploadError }}</span>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                        <button
                            type="button"
                            @click="close"
                            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            @click="handleApply"
                            :disabled="isUploading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'url' && !imageUrl.trim())"
                            :class="[
                                'px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs',
                                radiusClasses.btn,
                                isUploading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'url' && !imageUrl.trim())
                                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                                    : [colorStyles.btn, 'cursor-pointer active:scale-95']
                            ]"
                        >
                            <span v-if="isUploading" class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>{{ isUploading ? 'Mengunggah...' : 'Sisipkan Gambar' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
