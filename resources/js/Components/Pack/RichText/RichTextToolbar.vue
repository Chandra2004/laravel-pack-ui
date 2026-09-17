<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    editor: {
        type: Object,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    isPreviewMode: {
        type: Boolean,
        default: false,
    },
    showPreviewToggle: {
        type: Boolean,
        default: true,
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    },
    showFullscreenToggle: {
        type: Boolean,
        default: true,
    },
    showHelpToggle: {
        type: Boolean,
        default: true,
    },
    colorTheme: {
        type: String,
        default: 'primary',
    },
    radius: {
        type: String,
        default: 'lg',
    },
    size: {
        type: String,
        default: 'md',
    },
});

const emit = defineEmits([
    'open-link',
    'open-image',
    'toggle-preview',
    'toggle-fullscreen',
    'open-help',
    'clear-formatting',
]);

const isBlockMenuOpen = ref(false);
const blockMenuRef = ref(null);

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return {
                btn: 'w-6.5 h-6.5',
                dropdown: 'h-6.5 text-[10.5px] px-2',
                icon: 'text-sm',
                toolbar: 'px-2 py-1.5 gap-y-1 gap-x-1.5 text-xs',
            };
        case 'lg':
            return {
                btn: 'w-8.5 h-8.5',
                dropdown: 'h-8.5 text-xs px-3',
                icon: 'text-lg',
                toolbar: 'px-3.5 py-2 gap-y-1.5 gap-x-2 text-sm',
            };
        case 'md':
        default:
            return {
                btn: 'w-7.5 h-7.5',
                dropdown: 'h-7.5 text-xs px-2.5',
                icon: 'text-base',
                toolbar: 'px-3 py-1.5 gap-y-1.5 gap-x-2 text-xs',
            };
    }
});

const btnRadius = computed(() => {
    switch (props.radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded';
        case 'md': return 'rounded-md';
        case 'xl': return 'rounded-xl';
        case 'full': return 'rounded-full';
        case 'lg':
        default:
            return 'rounded-lg';
    }
});

const themeStyles = computed(() => {
    const map = {
        primary: {
            activeMark: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-500/20 font-semibold',
            previewActive: 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-500/30',
            dropdownActive: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold',
        },
        indigo: {
            activeMark: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 ring-1 ring-indigo-500/20 font-semibold',
            previewActive: 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/30',
            dropdownActive: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold',
        },
        emerald: {
            activeMark: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-1 ring-emerald-500/20 font-semibold',
            previewActive: 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30',
            dropdownActive: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold',
        },
        purple: {
            activeMark: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 ring-1 ring-purple-500/20 font-semibold',
            previewActive: 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-500/30',
            dropdownActive: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 font-semibold',
        },
        amber: {
            activeMark: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 ring-1 ring-amber-500/20 font-semibold',
            previewActive: 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-500/30',
            dropdownActive: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 font-semibold',
        },
        rose: {
            activeMark: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 ring-1 ring-rose-500/20 font-semibold',
            previewActive: 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-500/30',
            dropdownActive: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-semibold',
        },
        cyan: {
            activeMark: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 ring-1 ring-cyan-500/20 font-semibold',
            previewActive: 'bg-cyan-600 text-white hover:bg-cyan-700 ring-2 ring-cyan-500/30',
            dropdownActive: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 font-semibold',
        },
        dark: {
            activeMark: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white ring-1 ring-slate-400/30 font-semibold',
            previewActive: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100',
            dropdownActive: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold',
        },
    };
    return map[props.colorTheme] || map.primary;
});

const currentBlockLabel = computed(() => {
    if (!props.editor) return 'Paragraf';
    if (props.editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (props.editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (props.editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (props.editor.isActive('blockquote')) return 'Kutipan';
    if (props.editor.isActive('codeBlock')) return 'Blok Kode';
    return 'Paragraf';
});

const isActionsDisabled = computed(() => props.disabled || props.isPreviewMode);

const selectBlock = (type, level) => {
    if (!props.editor || isActionsDisabled.value) return;
    if (type === 'paragraph') {
        props.editor.chain().focus().setParagraph().run();
    } else if (type === 'heading') {
        props.editor.chain().focus().toggleHeading({ level }).run();
    } else if (type === 'blockquote') {
        props.editor.chain().focus().toggleBlockquote().run();
    } else if (type === 'codeBlock') {
        props.editor.chain().focus().toggleCodeBlock().run();
    }
    isBlockMenuOpen.value = false;
};

const handleClickOutside = (e) => {
    if (blockMenuRef.value && !blockMenuRef.value.contains(e.target)) {
        isBlockMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div
        v-if="editor"
        :class="[
            'flex flex-wrap items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 select-none text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors',
            sizeClasses.toolbar
        ]"
        role="toolbar"
        aria-label="Toolbar Format Teks"
    >
        <!-- Left Side: Formatting Controls -->
        <div
            :class="[
                'flex flex-wrap items-center gap-1 transition-opacity duration-150',
                isPreviewMode ? 'opacity-40 pointer-events-none' : 'opacity-100'
            ]"
        >
            <!-- Group 1: Undo / Redo -->
            <div class="flex items-center gap-0.5 pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="editor.chain().focus().undo().run()"
                    :disabled="isActionsDisabled || !editor.can().chain().focus().undo().run()"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all',
                        !editor.can().chain().focus().undo().run() || isActionsDisabled
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95'
                    ]"
                    title="Batal (Ctrl+Z)"
                    aria-label="Undo"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">undo</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().redo().run()"
                    :disabled="isActionsDisabled || !editor.can().chain().focus().redo().run()"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all',
                        !editor.can().chain().focus().redo().run() || isActionsDisabled
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95'
                    ]"
                    title="Ulangi (Ctrl+Y)"
                    aria-label="Redo"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">redo</span>
                </button>
            </div>

            <!-- Group 2: Smart Block Heading Dropdown -->
            <div ref="blockMenuRef" class="relative pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="isBlockMenuOpen = !isBlockMenuOpen"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.dropdown,
                        btnRadius,
                        'flex items-center gap-1 font-medium transition-all cursor-pointer border',
                        isBlockMenuOpen
                            ? themeStyles.activeMark
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
                    ]"
                    title="Pilih Format Blok"
                >
                    <span class="font-semibold tracking-tight">{{ currentBlockLabel }}</span>
                    <span
                        :class="['material-symbols-outlined text-xs leading-none transition-transform duration-200', { 'rotate-180': isBlockMenuOpen }]"
                    >
                        expand_more
                    </span>
                </button>

                <!-- Dropdown Menu -->
                <Transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-1"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-1"
                >
                    <div
                        v-if="isBlockMenuOpen"
                        :class="[
                            'absolute left-0 top-full mt-1.5 w-44 p-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-800 z-50 space-y-0.5'
                        ]"
                    >
                        <button
                            type="button"
                            @click="selectBlock('paragraph')"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer',
                                editor.isActive('paragraph')
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span>Paragraf Normal</span>
                            <span class="text-[10px] text-slate-400 font-mono">P</span>
                        </button>

                        <button
                            type="button"
                            @click="selectBlock('heading', 1)"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer',
                                editor.isActive('heading', { level: 1 })
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span class="font-bold text-sm">Heading 1</span>
                            <span class="text-[10px] text-slate-400 font-mono">H1</span>
                        </button>

                        <button
                            type="button"
                            @click="selectBlock('heading', 2)"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer',
                                editor.isActive('heading', { level: 2 })
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span class="font-bold">Heading 2</span>
                            <span class="text-[10px] text-slate-400 font-mono">H2</span>
                        </button>

                        <button
                            type="button"
                            @click="selectBlock('heading', 3)"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer',
                                editor.isActive('heading', { level: 3 })
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span class="font-semibold">Heading 3</span>
                            <span class="text-[10px] text-slate-400 font-mono">H3</span>
                        </button>

                        <div class="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                        <button
                            type="button"
                            @click="selectBlock('blockquote')"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer italic',
                                editor.isActive('blockquote')
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span>Kutipan Blok</span>
                            <span class="material-symbols-outlined text-xs">format_quote</span>
                        </button>

                        <button
                            type="button"
                            @click="selectBlock('codeBlock')"
                            :class="[
                                'w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-left transition-colors cursor-pointer font-mono',
                                editor.isActive('codeBlock')
                                    ? themeStyles.dropdownActive
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            ]"
                        >
                            <span class="text-[11px]">Blok Kode</span>
                            <span class="material-symbols-outlined text-xs">terminal</span>
                        </button>
                    </div>
                </Transition>
            </div>

            <!-- Group 3: Formatting Marks (Bold, Italic, Underline, Strike, Inline Code) -->
            <div class="flex items-center gap-0.5 pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="editor.chain().focus().toggleBold().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('bold')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Tebal (Ctrl+B)"
                    aria-label="Bold"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_bold</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().toggleItalic().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('italic')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Miring (Ctrl+I)"
                    aria-label="Italic"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_italic</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().toggleUnderline().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('underline')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Garis Bawah (Ctrl+U)"
                    aria-label="Underline"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_underlined</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().toggleStrike().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('strike')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Coret Teks (Strikethrough)"
                    aria-label="Strikethrough"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_strikethrough</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().toggleCode().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('code')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Kode Segaris (Inline Code)"
                    aria-label="Inline Code"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">code</span>
                </button>
            </div>

            <!-- Group 4: Text Alignments -->
            <div class="flex items-center gap-0.5 pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('left').run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive({ textAlign: 'left' })
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Rata Kiri"
                    aria-label="Align Left"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_align_left</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('center').run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive({ textAlign: 'center' })
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Rata Tengah"
                    aria-label="Align Center"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_align_center</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('right').run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive({ textAlign: 'right' })
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Rata Kanan"
                    aria-label="Align Right"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_align_right</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().setTextAlign('justify').run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive({ textAlign: 'justify' })
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Rata Kanan-Kiri"
                    aria-label="Align Justify"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_align_justify</span>
                </button>
            </div>

            <!-- Group 5: Lists & Horizontal Divider -->
            <div class="flex items-center gap-0.5 pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="editor.chain().focus().toggleBulletList().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('bulletList')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Daftar Poin"
                    aria-label="Bullet List"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_list_bulleted</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('orderedList')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Daftar Angka"
                    aria-label="Ordered List"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_list_numbered</span>
                </button>

                <button
                    type="button"
                    @click="editor.chain().focus().setHorizontalRule().run()"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer text-slate-600 dark:text-slate-300'
                    ]"
                    title="Garis Pemisah"
                    aria-label="Horizontal Rule"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">horizontal_rule</span>
                </button>
            </div>

            <!-- Group 6: Media & Hyperlink -->
            <div class="flex items-center gap-0.5 pr-1.5 border-r border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="emit('open-link')"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'flex items-center justify-center transition-all cursor-pointer',
                        editor.isActive('link')
                            ? themeStyles.activeMark
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                    title="Sisipkan Tautan (Link)"
                    aria-label="Insert Link"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">link</span>
                </button>

                <button
                    type="button"
                    @click="emit('open-image')"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer text-slate-600 dark:text-slate-300'
                    ]"
                    title="Sisipkan / Unggah Gambar"
                    aria-label="Insert Image"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">image</span>
                </button>
            </div>

            <!-- Group 7: Clear Formatting -->
            <div class="flex items-center gap-0.5">
                <button
                    type="button"
                    @click="emit('clear-formatting')"
                    :disabled="isActionsDisabled"
                    :class="[
                        sizeClasses.btn,
                        btnRadius,
                        'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer text-slate-400'
                    ]"
                    title="Hapus Pemformatan"
                    aria-label="Clear Formatting"
                >
                    <span :class="['material-symbols-outlined', sizeClasses.icon]">format_clear</span>
                </button>
            </div>
        </div>

        <!-- Right Side: Tools & View Mode Toggle -->
        <div class="flex items-center gap-1.5 ml-auto">
            <!-- Optional Slot for Custom Toolbar Actions -->
            <slot name="extra" />

            <!-- Fullscreen Focus Mode -->
            <button
                v-if="showFullscreenToggle"
                type="button"
                @click="emit('toggle-fullscreen')"
                :class="[
                    sizeClasses.btn,
                    btnRadius,
                    'flex items-center justify-center transition-all cursor-pointer',
                    isFullscreen
                        ? themeStyles.activeMark
                        : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                ]"
                :title="isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Mode Layar Penuh (Zen Focus)'"
                aria-label="Toggle Fullscreen"
            >
                <span :class="['material-symbols-outlined', sizeClasses.icon]">
                    {{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}
                </span>
            </button>

            <!-- Markdown Shortcuts Help -->
            <button
                v-if="showHelpToggle"
                type="button"
                @click="emit('open-help')"
                :class="[
                    sizeClasses.btn,
                    btnRadius,
                    'flex items-center justify-center text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer'
                ]"
                title="Bantuan Pintasan Keyboard & Markdown"
                aria-label="Markdown Shortcuts Help"
            >
                <span :class="['material-symbols-outlined', sizeClasses.icon]">help_outline</span>
            </button>

            <!-- Preview Toggle Button -->
            <div v-if="showPreviewToggle" class="pl-1.5 border-l border-slate-200/70 dark:border-slate-800">
                <button
                    type="button"
                    @click="emit('toggle-preview')"
                    :class="[
                        'h-7.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-2xs',
                        btnRadius,
                        isPreviewMode
                            ? themeStyles.previewActive
                            : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    ]"
                    :title="isPreviewMode ? 'Kembali ke Mode Edit Teks' : 'Lihat Pratinjau Render HTML'"
                >
                    <span :class="['material-symbols-outlined text-base leading-none']">
                        {{ isPreviewMode ? 'edit_note' : 'visibility' }}
                    </span>
                    <span class="font-medium">{{ isPreviewMode ? 'Kembali Edit' : 'Pratinjau' }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
