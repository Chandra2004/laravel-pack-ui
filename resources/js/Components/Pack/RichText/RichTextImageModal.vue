<script setup>
import { ref, computed, watch } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import InputField from '@/Components/Pack/InputField.vue';

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

const themeColor = computed(() => props.colorTheme || 'primary');

const colorStyles = computed(() => {
    const map = {
        primary: {
            activeTab: 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
            iconBadge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            dropBorder: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        },
        indigo: {
            activeTab: 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400',
            iconBadge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            dropBorder: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20',
        },
        emerald: {
            activeTab: 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400',
            iconBadge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            dropBorder: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
        },
        purple: {
            activeTab: 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400',
            iconBadge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
            dropBorder: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
        },
        amber: {
            activeTab: 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400',
            iconBadge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            dropBorder: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
        },
        rose: {
            activeTab: 'text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400',
            iconBadge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            dropBorder: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
        },
        cyan: {
            activeTab: 'text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400',
            iconBadge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
            dropBorder: 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
        },
        dark: {
            activeTab: 'text-slate-900 dark:text-white border-slate-900 dark:border-white',
            iconBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            dropBorder: 'border-slate-500 bg-slate-100/50 dark:bg-slate-800/30',
        },
    };
    return map[props.colorTheme] || map.primary;
});

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        resetForm();
    }
});

const resetForm = () => {
    imageUrl.value = '';
    imageAlt.value = '';
    selectedFile.value = null;
    filePreviewUrl.value = '';
    isDragging.value = false;
    isUploading.value = false;
    uploadError.value = '';
};

const close = () => {
    emit('update:modelValue', false);
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const handleSelectFileClick = () => {
    fileInputRef.value?.click();
};

const processFile = (file) => {
    uploadError.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        uploadError.value = 'Hanya format berkas gambar (PNG, JPG, WebP, GIF, SVG) yang diperbolehkan.';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        uploadError.value = 'Ukuran berkas melebihi batas maksimum 10MB.';
        return;
    }

    selectedFile.value = file;
    if (!imageAlt.value) {
        imageAlt.value = file.name.replace(/\.[^/.]+$/, '');
    }

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
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
};

const handleApply = async () => {
    uploadError.value = '';

    if (activeTab.value === 'upload') {
        if (!selectedFile.value) {
            uploadError.value = 'Silakan pilih gambar terlebih dahulu.';
            return;
        }

        try {
            isUploading.value = true;
            let finalSrc = '';

            if (props.imageUploadHandler && typeof props.imageUploadHandler === 'function') {
                finalSrc = await props.imageUploadHandler(selectedFile.value);
            } else {
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
                        <ButtonSubmit
                            variant="ghost"
                            size="xs"
                            icon="close"
                            @click="close"
                            title="Tutup Dialog"
                        />
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
                                <ButtonSubmit
                                    variant="ghost"
                                    color="rose"
                                    size="xs"
                                    icon="delete"
                                    @click="clearSelectedFile"
                                    title="Hapus / Ganti Berkas"
                                />
                            </div>

                            <!-- Alt text input via Pack UI InputField -->
                            <InputField
                                v-model="imageAlt"
                                type="text"
                                label="Teks Keterangan (Alt / Deskripsi)"
                                placeholder="Deskripsi singkat gambar..."
                                size="sm"
                                :color="themeColor"
                            />
                        </div>

                        <!-- Tab 2: URL Link -->
                        <div v-else class="space-y-3">
                            <InputField
                                v-model="imageUrl"
                                type="url"
                                label="URL Gambar Eksternal"
                                placeholder="https://images.unsplash.com/..."
                                icon="image"
                                size="sm"
                                :color="themeColor"
                                @keyup.enter="handleApply"
                                autofocus
                            />

                            <InputField
                                v-model="imageAlt"
                                type="text"
                                label="Teks Alternatif (Alt)"
                                placeholder="Deskripsi singkat gambar..."
                                size="sm"
                                :color="themeColor"
                                @keyup.enter="handleApply"
                            />

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
                        <ButtonSubmit
                            variant="secondary"
                            size="xs"
                            @click="close"
                        >
                            Batal
                        </ButtonSubmit>
                        <ButtonSubmit
                            variant="primary"
                            :color="themeColor"
                            size="xs"
                            :loading="isUploading"
                            :disabled="isUploading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'url' && !imageUrl.trim())"
                            icon="image"
                            @click="handleApply"
                        >
                            Sisipkan Gambar
                        </ButtonSubmit>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
