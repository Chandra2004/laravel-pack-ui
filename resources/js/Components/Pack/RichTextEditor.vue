<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import RichTextToolbar from './RichText/RichTextToolbar.vue';
import RichTextBubbleMenu from './RichText/RichTextBubbleMenu.vue';
import RichTextLinkModal from './RichText/RichTextLinkModal.vue';
import RichTextImageModal from './RichText/RichTextImageModal.vue';
import RichTextHelpModal from './RichText/RichTextHelpModal.vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Tuliskan ide, catatan, atau konten artikel di sini...',
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    editable: {
        type: Boolean,
        default: true,
    },
    colorTheme: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'dark'].includes(v),
    },
    radius: {
        type: String,
        default: 'lg',
        validator: (v) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(v),
    },
    variant: {
        type: String,
        default: 'bordered',
        validator: (v) => ['default', 'bordered', 'floating', 'subtle'].includes(v),
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    minHeight: {
        type: String,
        default: '',
    },
    maxHeight: {
        type: String,
        default: '',
    },
    borderless: {
        type: Boolean,
        default: false,
    },
    showToolbar: {
        type: Boolean,
        default: true,
    },
    showBubbleMenu: {
        type: Boolean,
        default: true,
    },
    showCharCount: {
        type: Boolean,
        default: true,
    },
    showWordCount: {
        type: Boolean,
        default: true,
    },
    maxChars: {
        type: Number,
        default: 0,
    },
    imageUploadHandler: {
        type: Function,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'image-uploaded']);

const uid = Math.random().toString(36).substring(2, 9);
const inputId = computed(() => props.id || `rich-editor-${uid}`);

// State Modal Popover & View Mode
const isLinkModalOpen = ref(false);
const linkInitialUrl = ref('');
const isImageModalOpen = ref(false);
const isHelpModalOpen = ref(false);
const isPreviewMode = ref(false);
const isFullscreen = ref(false);
const previewDevice = ref('desktop'); // 'desktop' | 'tablet' | 'mobile'
const copyFeedback = ref('');

// Computed Styling dari 5 Pilar
const radiusClasses = computed(() => {
    switch (props.radius) {
        case 'none': return { container: 'rounded-none', inner: 'rounded-none', pill: 'rounded-none' };
        case 'sm': return { container: 'rounded-lg', inner: 'rounded-md', pill: 'rounded-md' };
        case 'md': return { container: 'rounded-xl', inner: 'rounded-lg', pill: 'rounded-lg' };
        case 'xl': return { container: 'rounded-3xl', inner: 'rounded-2xl', pill: 'rounded-xl' };
        case 'full': return { container: 'rounded-3xl', inner: 'rounded-2xl', pill: 'rounded-full' };
        case 'lg':
        default:
            return { container: 'rounded-2xl', inner: 'rounded-xl', pill: 'rounded-lg' };
    }
});

const sizeStyles = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                canvasPadding: 'p-3 sm:p-4 text-xs',
                defaultMinHeight: 'min-h-44',
                statusBar: 'px-3 py-1.5 text-[10px]',
            };
        case 'lg':
            return {
                canvasPadding: 'p-5 sm:p-6 text-base',
                defaultMinHeight: 'min-h-72',
                statusBar: 'px-4 py-2.5 text-xs',
            };
        case 'md':
        default:
            return {
                canvasPadding: 'p-4 sm:p-5 text-sm',
                defaultMinHeight: 'min-h-56',
                statusBar: 'px-4 py-2 text-[11px]',
            };
    }
});

const themeStyles = computed(() => {
    const map = {
        primary: {
            focus: 'focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15',
            link: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
            activeDot: 'bg-blue-500 ring-2 ring-blue-500/20',
            btnPreview: 'bg-blue-600 text-white hover:bg-blue-700',
            progress: 'bg-blue-500',
            activeTab: 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
        },
        indigo: {
            focus: 'focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-500/15',
            link: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
            activeDot: 'bg-indigo-500 ring-2 ring-indigo-500/20',
            btnPreview: 'bg-indigo-600 text-white hover:bg-indigo-700',
            progress: 'bg-indigo-500',
            activeTab: 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400',
        },
        emerald: {
            focus: 'focus-within:border-emerald-500 focus-within:ring-3 focus-within:ring-emerald-500/15',
            link: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
            activeDot: 'bg-emerald-500 ring-2 ring-emerald-500/20',
            btnPreview: 'bg-emerald-600 text-white hover:bg-emerald-700',
            progress: 'bg-emerald-500',
            activeTab: 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400',
        },
        purple: {
            focus: 'focus-within:border-purple-500 focus-within:ring-3 focus-within:ring-purple-500/15',
            link: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300',
            activeDot: 'bg-purple-500 ring-2 ring-purple-500/20',
            btnPreview: 'bg-purple-600 text-white hover:bg-purple-700',
            progress: 'bg-purple-500',
            activeTab: 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400',
        },
        amber: {
            focus: 'focus-within:border-amber-500 focus-within:ring-3 focus-within:ring-amber-500/15',
            link: 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
            activeDot: 'bg-amber-500 ring-2 ring-amber-500/20',
            btnPreview: 'bg-amber-600 text-white hover:bg-amber-700',
            progress: 'bg-amber-500',
            activeTab: 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400',
        },
        rose: {
            focus: 'focus-within:border-rose-500 focus-within:ring-3 focus-within:ring-rose-500/15',
            link: 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300',
            activeDot: 'bg-rose-500 ring-2 ring-rose-500/20',
            btnPreview: 'bg-rose-600 text-white hover:bg-rose-700',
            progress: 'bg-rose-500',
            activeTab: 'text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400',
        },
        cyan: {
            focus: 'focus-within:border-cyan-500 focus-within:ring-3 focus-within:ring-cyan-500/15',
            link: 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300',
            activeDot: 'bg-cyan-500 ring-2 ring-cyan-500/20',
            btnPreview: 'bg-cyan-600 text-white hover:bg-cyan-700',
            progress: 'bg-cyan-500',
            activeTab: 'text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400',
        },
        dark: {
            focus: 'focus-within:border-slate-800 dark:focus-within:border-slate-200 focus-within:ring-3 focus-within:ring-slate-500/15',
            link: 'text-slate-900 dark:text-white underline',
            activeDot: 'bg-slate-700 dark:bg-slate-300 ring-2 ring-slate-500/20',
            btnPreview: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100',
            progress: 'bg-slate-800 dark:bg-slate-200',
            activeTab: 'text-slate-900 dark:text-white border-slate-900 dark:border-white',
        },
    };
    return map[props.colorTheme] || map.primary;
});

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'bordered':
            return 'border-2 border-slate-200 dark:border-slate-700/90 shadow-2xs';
        case 'floating':
            return 'border border-slate-200/80 dark:border-slate-800 shadow-md';
        case 'subtle':
            return 'border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/40 shadow-none';
        case 'default':
        default:
            return 'border border-slate-200/90 dark:border-slate-800 shadow-2xs';
    }
});

// Helper Image File Reader
const readFileAsDataUrl = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
});

// Process Image insertion from dropped or pasted file
const processImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
        let src = '';
        if (props.imageUploadHandler && typeof props.imageUploadHandler === 'function') {
            src = await props.imageUploadHandler(file);
        } else {
            src = await readFileAsDataUrl(file);
        }

        if (src && editor.value) {
            editor.value.chain().focus().setImage({
                src,
                alt: file.name.replace(/\.[^/.]+$/, ''),
            }).run();
            emit('image-uploaded', { file, src });
        }
    } catch (e) {
        console.error('Gagal memproses unggahan gambar pada editor:', e);
    }
};

const editor = useEditor({
    content: props.modelValue,
    editable: props.editable && !props.disabled,
    extensions: [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
        }),
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'font-medium underline underline-offset-3 transition-colors cursor-pointer ' + themeStyles.value.link,
                target: '_blank',
                rel: 'noopener noreferrer',
            },
        }),
        Image.configure({
            HTMLAttributes: {
                class: 'max-w-full rounded-2xl my-4 shadow-md border border-slate-200 dark:border-slate-800 object-cover mx-auto transition-transform hover:scale-[1.01]',
            },
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Placeholder.configure({
            placeholder: props.placeholder,
            emptyEditorClass: 'is-editor-empty',
        }),
    ],
    editorProps: {
        attributes: {
            class: 'focus:outline-none w-full min-w-full leading-relaxed',
        },
        handleDrop: (view, event, slice, moved) => {
            if (!moved && event.dataTransfer?.files?.length) {
                const files = Array.from(event.dataTransfer.files);
                const imageFile = files.find(f => f.type.startsWith('image/'));
                if (imageFile) {
                    event.preventDefault();
                    processImageFile(imageFile);
                    return true;
                }
            }
            return false;
        },
        handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItem = items.find(item => item.type.startsWith('image/'));
            if (imageItem) {
                const file = imageItem.getAsFile();
                if (file) {
                    event.preventDefault();
                    processImageFile(file);
                    return true;
                }
            }
            return false;
        },
    },
    onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const cleanHtml = html === '<p></p>' ? '' : html;
        emit('update:modelValue', cleanHtml);
        emit('change', cleanHtml);
    },
    onFocus: () => emit('focus'),
    onBlur: () => emit('blur'),
});

// Sync external model updates
watch(() => props.modelValue, (val) => {
    if (!editor.value) return;
    if (editor.value.getHTML() !== val) {
        editor.value.commands.setContent(val || '', false);
    }
});

// Sync editable / disabled props
watch([() => props.editable, () => props.disabled], ([editable, disabled]) => {
    if (editor.value) {
        editor.value.setEditable(editable && !disabled);
    }
});

// Statistics
const wordCount = computed(() => {
    if (!editor.value) return 0;
    const text = editor.value.getText();
    return text.trim().split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => {
    if (!editor.value) return 0;
    return editor.value.getText().length;
});

const charPercent = computed(() => {
    if (!props.maxChars || props.maxChars <= 0) return 0;
    return Math.min(100, Math.round((charCount.value / props.maxChars) * 100));
});

// Actions
const openLinkDialog = () => {
    if (!editor.value) return;
    linkInitialUrl.value = editor.value.getAttributes('link').href || '';
    isLinkModalOpen.value = true;
};

const handleApplyLink = (url) => {
    if (!editor.value) return;
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

const handleRemoveLink = () => {
    if (!editor.value) return;
    editor.value.chain().focus().unsetLink().run();
};

const openImageDialog = () => {
    isImageModalOpen.value = true;
};

const handleApplyImage = ({ src, alt }) => {
    if (!editor.value) return;
    editor.value.chain().focus().setImage({ src, alt }).run();
};

const clearFormatting = () => {
    if (!editor.value) return;
    editor.value.chain().focus().clearNodes().unsetAllMarks().run();
};

const togglePreview = () => {
    isPreviewMode.value = !isPreviewMode.value;
    if (!isPreviewMode.value && editor.value) {
        editor.value.commands.focus();
    }
};

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
};

const copyHtml = async () => {
    if (!editor.value) return;
    try {
        await navigator.clipboard.writeText(editor.value.getHTML());
        copyFeedback.value = 'Tersalin!';
        setTimeout(() => {
            copyFeedback.value = '';
        }, 2000);
    } catch {
        copyFeedback.value = 'Gagal';
    }
};

const downloadHtml = () => {
    if (!editor.value) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Export RichText</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
        blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin-left: 0; color: #64748b; font-style: italic; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
    </style>
</head>
<body>
${editor.value.getHTML()}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rich-text-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
};

const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
        isFullscreen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown);
    if (editor.value) {
        editor.value.destroy();
    }
});

defineExpose({
    editor,
    clearFormatting,
    openLinkDialog,
    openImageDialog,
    togglePreview,
    toggleFullscreen,
    copyHtml,
    downloadHtml,
});
</script>

<template>
    <div class="w-full space-y-1.5 text-left select-text">
        <!-- Label Header -->
        <div v-if="label || $slots.label" class="flex items-center justify-between gap-2">
            <label
                :for="inputId"
                class="block text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
                <slot name="label">{{ label }}</slot>
                <span v-if="required" class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
            </label>
        </div>

        <!-- Main Editor Box Container -->
        <div
            :class="[
                'relative flex flex-col bg-white dark:bg-slate-900 transition-all duration-200 overflow-hidden',
                radiusClasses.container,
                isFullscreen
                    ? 'fixed inset-0 z-50 rounded-none border-0 shadow-2xl h-screen p-0 m-0'
                    : [
                        borderless
                            ? ''
                            : [
                                variantClasses,
                                error
                                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                                    : themeStyles.focus
                            ]
                    ],
                disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-950/50 cursor-not-allowed pointer-events-none' : ''
            ]"
        >
            <!-- Top Toolbar -->
            <RichTextToolbar
                v-if="showToolbar && editor"
                :editor="editor"
                :disabled="disabled"
                :is-preview-mode="isPreviewMode"
                :is-fullscreen="isFullscreen"
                :color-theme="colorTheme"
                :radius="radius"
                :size="size"
                @open-link="openLinkDialog"
                @open-image="openImageDialog"
                @toggle-preview="togglePreview"
                @toggle-fullscreen="toggleFullscreen"
                @open-help="isHelpModalOpen = true"
                @clear-formatting="clearFormatting"
            >
                <template #extra>
                    <slot name="toolbar-extra" />
                </template>
            </RichTextToolbar>

            <!-- Floating Contextual Bubble Menu -->
            <RichTextBubbleMenu
                v-if="showBubbleMenu && editor && !disabled && !isPreviewMode"
                :editor="editor"
                :color-theme="colorTheme"
                @open-link="openLinkDialog"
            />

            <!-- Active Editor Area (Visible when NOT in preview mode) -->
            <div
                v-show="!isPreviewMode"
                :class="[
                    sizeStyles.canvasPadding,
                    'text-slate-900 dark:text-slate-100 cursor-text overflow-y-auto transition-colors',
                    isFullscreen ? 'flex-1 overflow-y-auto min-h-0' : [minHeight || sizeStyles.defaultMinHeight, maxHeight]
                ]"
                @click="editor?.chain().focus().run()"
            >
                <EditorContent :editor="editor" />
            </div>

            <!-- HTML Rendered Preview Mode (Modern Minimalist Viewport) -->
            <div
                v-show="isPreviewMode"
                :class="[
                    sizeStyles.canvasPadding,
                    'text-slate-900 dark:text-slate-100 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 transition-colors flex flex-col',
                    isFullscreen ? 'flex-1 overflow-y-auto min-h-0' : [minHeight || sizeStyles.defaultMinHeight, maxHeight]
                ]"
            >
                <!-- Preview Top Control Banner -->
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800 text-xs">
                    <!-- Left: Status & Back Button -->
                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            @click="togglePreview"
                            :class="[
                                'flex items-center gap-1.5 px-3 py-1.5 font-semibold shadow-xs transition-colors cursor-pointer text-xs',
                                radiusClasses.pill,
                                themeStyles.btnPreview
                            ]"
                        >
                            <span class="material-symbols-outlined text-sm leading-none">arrow_back</span>
                            <span>Kembali ke Editor</span>
                        </button>

                        <span class="hidden sm:inline-flex items-center gap-1.5 text-slate-400 font-medium">
                            <span :class="['w-1.5 h-1.5 rounded-full', themeStyles.activeDot]"></span>
                            <span>Pratinjau Publik</span>
                        </span>
                    </div>

                    <!-- Center: Device Viewport Simulation -->
                    <div class="flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold">
                        <button
                            type="button"
                            @click="previewDevice = 'desktop'"
                            :class="[
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                                previewDevice === 'desktop'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            ]"
                            title="Tampilan Penuh Desktop"
                        >
                            <span class="material-symbols-outlined text-sm">desktop_windows</span>
                            <span class="hidden md:inline">Desktop</span>
                        </button>

                        <button
                            type="button"
                            @click="previewDevice = 'tablet'"
                            :class="[
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                                previewDevice === 'tablet'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            ]"
                            title="Simulasi Tablet (768px)"
                        >
                            <span class="material-symbols-outlined text-sm">tablet</span>
                            <span class="hidden md:inline">Tablet</span>
                        </button>

                        <button
                            type="button"
                            @click="previewDevice = 'mobile'"
                            :class="[
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                                previewDevice === 'mobile'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            ]"
                            title="Simulasi Layar Ponsel (375px)"
                        >
                            <span class="material-symbols-outlined text-sm">smartphone</span>
                            <span class="hidden md:inline">Ponsel</span>
                        </button>
                    </div>

                    <!-- Right: Quick Export & Copy HTML -->
                    <div class="flex items-center gap-1.5">
                        <button
                            type="button"
                            @click="copyHtml"
                            :class="[
                                'flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors cursor-pointer',
                                radiusClasses.pill
                            ]"
                            title="Salin string HTML mentah ke clipboard"
                        >
                            <span class="material-symbols-outlined text-sm text-emerald-600">
                                {{ copyFeedback ? 'check' : 'content_copy' }}
                            </span>
                            <span>{{ copyFeedback || 'Salin HTML' }}</span>
                        </button>

                        <button
                            type="button"
                            @click="downloadHtml"
                            :class="[
                                'flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors cursor-pointer',
                                radiusClasses.pill
                            ]"
                            title="Unduh file .html mandiri"
                        >
                            <span class="material-symbols-outlined text-sm text-blue-600">download</span>
                            <span class="hidden sm:inline">Unduh HTML</span>
                        </button>
                    </div>
                </div>

                <!-- Preview Content Canvas -->
                <div class="flex-1 overflow-y-auto">
                    <!-- Mobile Device Shell -->
                    <div
                        v-if="previewDevice === 'mobile'"
                        class="max-w-95 mx-auto my-3 p-5 rounded-3xl border-4 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl transition-all space-y-3"
                    >
                        <div class="w-16 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3"></div>
                        <div
                            v-if="modelValue"
                            v-html="modelValue"
                            class="rich-text-preview space-y-3 leading-relaxed text-sm"
                        ></div>
                        <div v-else class="text-slate-400 dark:text-slate-500 italic text-center py-8 text-xs">
                            Belum ada konten untuk ditampilkan dalam pratinjau.
                        </div>
                    </div>

                    <!-- Tablet Device Shell -->
                    <div
                        v-else-if="previewDevice === 'tablet'"
                        class="max-w-190 mx-auto my-3 p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg transition-all space-y-3"
                    >
                        <div
                            v-if="modelValue"
                            v-html="modelValue"
                            class="rich-text-preview space-y-3 leading-relaxed text-sm"
                        ></div>
                        <div v-else class="text-slate-400 dark:text-slate-500 italic text-center py-10 text-xs">
                            Belum ada konten untuk ditampilkan dalam pratinjau.
                        </div>
                    </div>

                    <!-- Desktop Wrapper -->
                    <div v-else class="w-full">
                        <div
                            v-if="modelValue"
                            v-html="modelValue"
                            class="rich-text-preview space-y-3 leading-relaxed"
                        ></div>
                        <div v-else class="text-slate-400 dark:text-slate-500 italic text-center py-12">
                            Belum ada konten untuk ditampilkan dalam pratinjau.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Status Bar -->
            <div
                :class="[
                    sizeStyles.statusBar,
                    'flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 select-none'
                ]"
            >
                <div class="flex items-center gap-2.5">
                    <span class="inline-flex items-center gap-1.5 font-medium">
                        <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="isPreviewMode ? themeStyles.activeDot : 'bg-emerald-500 ring-2 ring-emerald-500/20'"
                        ></span>
                        <span class="text-slate-600 dark:text-slate-400">
                            {{ isPreviewMode ? 'Mode Pratinjau' : (isFullscreen ? 'Mode Layar Penuh (Zen)' : 'Editor Siap') }}
                        </span>
                    </span>

                    <button
                        v-if="isPreviewMode"
                        type="button"
                        @click="togglePreview"
                        class="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                        (Kembali Edit)
                    </button>
                </div>

                <!-- Word & Character Counts & Progress Bar -->
                <div class="flex items-center gap-3 font-mono text-[10.5px]">
                    <slot name="footer-extra" />
                    <span v-if="showWordCount">{{ wordCount }} kata</span>
                    <span v-if="showCharCount" class="flex items-center gap-2">
                        <span>{{ charCount }}<template v-if="maxChars"> / {{ maxChars }}</template> karakter</span>

                        <!-- Max Chars Progress Bar -->
                        <div
                            v-if="maxChars > 0"
                            class="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                            :title="`${charPercent}% dari batas ${maxChars} karakter`"
                        >
                            <div
                                class="h-full transition-all duration-200 rounded-full"
                                :class="[
                                    charPercent >= 100
                                        ? 'bg-rose-500'
                                        : (charPercent >= 85 ? 'bg-amber-500' : themeStyles.progress)
                                ]"
                                :style="{ width: `${charPercent}%` }"
                            ></div>
                        </div>
                    </span>
                </div>
            </div>
        </div>

        <!-- Helper Hint & Error Messages -->
        <div v-if="error || $slots.error">
            <p class="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm leading-none">error</span>
                <slot name="error"><span>{{ error }}</span></slot>
            </p>
        </div>
        <div v-else-if="hint || $slots.hint">
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <slot name="hint">{{ hint }}</slot>
            </p>
        </div>

        <!-- Modular Link Dialog -->
        <RichTextLinkModal
            v-model="isLinkModalOpen"
            :initial-url="linkInitialUrl"
            :is-link-active="editor?.isActive('link') || false"
            :color-theme="colorTheme"
            :radius="radius"
            @apply="handleApplyLink"
            @remove="handleRemoveLink"
        />

        <!-- Modular Image Dialog (dengan Tab Unggah Berkas & URL) -->
        <RichTextImageModal
            v-model="isImageModalOpen"
            :color-theme="colorTheme"
            :radius="radius"
            :image-upload-handler="imageUploadHandler"
            @apply="handleApplyImage"
        />

        <!-- Modular Keyboard Shortcuts & Markdown Help Modal -->
        <RichTextHelpModal
            v-model="isHelpModalOpen"
            :color-theme="colorTheme"
            :radius="radius"
        />
    </div>
</template>

<style>
/* Tiptap Placeholder */
.tiptap p.is-editor-empty:first-child::before {
    color: #94a3b8;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}

.dark .tiptap p.is-editor-empty:first-child::before {
    color: #64748b;
}

/* Modern Minimalist Prose Styling for Editor Canvas & Preview */
.tiptap h1, .rich-text-preview h1 {
    font-size: 1.55rem;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    color: inherit;
}

.tiptap h2, .rich-text-preview h2 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
    margin-top: 1rem;
    margin-bottom: 0.4rem;
    color: inherit;
}

.tiptap h3, .rich-text-preview h3 {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.4;
    margin-top: 0.85rem;
    margin-bottom: 0.35rem;
    color: inherit;
}

.tiptap p, .rich-text-preview p {
    margin-bottom: 0.65rem;
    line-height: 1.7;
}

.tiptap ul, .rich-text-preview ul {
    list-style-type: disc;
    padding-left: 1.4rem;
    margin-bottom: 0.65rem;
}

.tiptap ol, .rich-text-preview ol {
    list-style-type: decimal;
    padding-left: 1.4rem;
    margin-bottom: 0.65rem;
}

.tiptap li, .rich-text-preview li {
    margin-bottom: 0.25rem;
}

.tiptap blockquote, .rich-text-preview blockquote {
    border-left: 3px solid currentColor;
    opacity: 0.85;
    background-color: rgba(148, 163, 184, 0.07);
    border-radius: 0 0.5rem 0.5rem 0;
    padding: 0.5rem 1rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    font-style: italic;
}

.tiptap code, .rich-text-preview code {
    background-color: rgba(148, 163, 184, 0.15);
    color: #e11d48;
    padding: 0.15rem 0.4rem;
    border-radius: 0.375rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85em;
}

.dark .tiptap code, .dark .rich-text-preview code {
    background-color: rgba(51, 65, 85, 0.45);
    color: #fb7185;
}

.tiptap pre, .rich-text-preview pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 0.85rem 1.1rem;
    border-radius: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.82em;
    overflow-x: auto;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    border: 1px solid #1e293b;
}

.tiptap pre code, .rich-text-preview pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
}

.tiptap hr, .rich-text-preview hr {
    border: none;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
    margin: 1.25rem 0;
}
</style>
