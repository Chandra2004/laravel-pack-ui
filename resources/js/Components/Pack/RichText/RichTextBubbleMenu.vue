<script setup>
import { computed } from 'vue';
import { BubbleMenu } from '@tiptap/vue-3/menus';

const props = defineProps({
    editor: {
        type: Object,
        required: true,
    },
    colorTheme: {
        type: String,
        default: 'primary',
    },
});

const emit = defineEmits(['open-link']);

const activeColorClass = computed(() => {
    const map = {
        primary: 'bg-blue-500 text-white shadow-xs',
        indigo: 'bg-indigo-500 text-white shadow-xs',
        emerald: 'bg-emerald-500 text-white shadow-xs',
        purple: 'bg-purple-500 text-white shadow-xs',
        amber: 'bg-amber-500 text-white shadow-xs',
        rose: 'bg-rose-500 text-white shadow-xs',
        cyan: 'bg-cyan-500 text-white shadow-xs',
        dark: 'bg-white text-slate-900 shadow-xs',
    };
    return map[props.colorTheme] || map.primary;
});
</script>

<template>
    <BubbleMenu
        v-if="editor"
        :editor="editor"
        :tippy-options="{ duration: 150, animation: 'shift-away', placement: 'top' }"
        class="flex items-center gap-0.5 p-1 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-white/15 select-none z-40"
    >
        <!-- Bold -->
        <button
            type="button"
            @click="editor.chain().focus().toggleBold().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('bold')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Tebal (Ctrl+B)"
        >
            <span class="material-symbols-outlined text-base">format_bold</span>
        </button>

        <!-- Italic -->
        <button
            type="button"
            @click="editor.chain().focus().toggleItalic().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('italic')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Miring (Ctrl+I)"
        >
            <span class="material-symbols-outlined text-base">format_italic</span>
        </button>

        <!-- Underline -->
        <button
            type="button"
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('underline')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Garis Bawah (Ctrl+U)"
        >
            <span class="material-symbols-outlined text-base">format_underlined</span>
        </button>

        <!-- Strike -->
        <button
            type="button"
            @click="editor.chain().focus().toggleStrike().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('strike')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Coret (Strikethrough)"
        >
            <span class="material-symbols-outlined text-base">format_strikethrough</span>
        </button>

        <div class="h-4 w-px bg-white/20 mx-0.5"></div>

        <!-- Link -->
        <button
            type="button"
            @click="emit('open-link')"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('link')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Tautan (Link)"
        >
            <span class="material-symbols-outlined text-base">link</span>
        </button>

        <!-- Code -->
        <button
            type="button"
            @click="editor.chain().focus().toggleCode().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('code')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Kode Segaris"
        >
            <span class="material-symbols-outlined text-base">code</span>
        </button>

        <div class="h-4 w-px bg-white/20 mx-0.5"></div>

        <!-- H2 Heading Quick -->
        <button
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="[
                'px-2 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-[11px] font-bold',
                editor.isActive('heading', { level: 2 })
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Heading 2"
        >
            H2
        </button>

        <!-- Blockquote Quick -->
        <button
            type="button"
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs',
                editor.isActive('blockquote')
                    ? activeColorClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
            ]"
            title="Kutipan"
        >
            <span class="material-symbols-outlined text-base">format_quote</span>
        </button>
    </BubbleMenu>
</template>
