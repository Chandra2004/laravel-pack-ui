<script setup>
import { computed } from 'vue';

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
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
    emit('update:modelValue', false);
};

const radiusClasses = computed(() => {
    switch (props.radius) {
        case 'none': return { box: 'rounded-none', btn: 'rounded-none', item: 'rounded-none' };
        case 'sm': return { box: 'rounded-lg', btn: 'rounded-md', item: 'rounded-md' };
        case 'md': return { box: 'rounded-xl', btn: 'rounded-lg', item: 'rounded-lg' };
        case 'xl': return { box: 'rounded-3xl', btn: 'rounded-xl', item: 'rounded-xl' };
        case 'full': return { box: 'rounded-3xl', btn: 'rounded-full', item: 'rounded-xl' };
        case 'lg':
        default:
            return { box: 'rounded-2xl', btn: 'rounded-lg', item: 'rounded-xl' };
    }
});

const themeStyles = computed(() => {
    const map = {
        primary: {
            btn: 'bg-blue-600 hover:bg-blue-700 text-white',
            badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            code: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        },
        indigo: {
            btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
            badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            code: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
        },
        emerald: {
            btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            code: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        },
        purple: {
            btn: 'bg-purple-600 hover:bg-purple-700 text-white',
            badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
            code: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
        },
        amber: {
            btn: 'bg-amber-600 hover:bg-amber-700 text-white',
            badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            code: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        },
        rose: {
            btn: 'bg-rose-600 hover:bg-rose-700 text-white',
            badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            code: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
        },
        cyan: {
            btn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
            badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
            code: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
        },
        dark: {
            btn: 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900',
            badge: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            code: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white',
        },
    };
    return map[props.colorTheme] || map.primary;
});

const shortcuts = [
    { key: 'Ctrl + B', label: 'Teks Tebal (Bold)' },
    { key: 'Ctrl + I', label: 'Teks Miring (Italic)' },
    { key: 'Ctrl + U', label: 'Garis Bawah (Underline)' },
    { key: 'Ctrl + Z', label: 'Batal (Undo)' },
    { key: 'Ctrl + Y', label: 'Ulangi (Redo)' },
];

const markdowns = [
    { syntax: '# + Spasi', label: 'Heading 1 (Judul Utama)' },
    { syntax: '## + Spasi', label: 'Heading 2 (Sub-Judul)' },
    { syntax: '### + Spasi', label: 'Heading 3' },
    { syntax: '* atau - + Spasi', label: 'Daftar Poin (Bullet List)' },
    { syntax: '1. + Spasi', label: 'Daftar Nomor (Ordered List)' },
    { syntax: '> + Spasi', label: 'Kutipan Blok (Blockquote)' },
    { syntax: '``` + Enter', label: 'Blok Kode (Code Block)' },
    { syntax: '--- + Enter', label: 'Garis Pemisah (Divider)' },
];
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
                        'w-full max-w-md p-5 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto',
                        radiusClasses.box
                    ]"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-2">
                            <span :class="['w-8 h-8 rounded-xl flex items-center justify-center', themeStyles.badge]">
                                <span class="material-symbols-outlined text-lg">keyboard</span>
                            </span>
                            <div>
                                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                                    Pintasan & Markdown Cepat
                                </h4>
                                <p class="text-[11px] text-slate-400">Pintasan keyboard & aturan pengetikan otomatis Tiptap</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="close"
                            class="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <span class="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    <!-- Keyboard Shortcuts -->
                    <div class="space-y-2">
                        <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Pintasan Keyboard
                        </span>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div
                                v-for="item in shortcuts"
                                :key="item.key"
                                :class="[
                                    'p-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs',
                                    radiusClasses.item
                                ]"
                            >
                                <span class="text-slate-600 dark:text-slate-300">{{ item.label }}</span>
                                <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs font-semibold">
                                    {{ item.key }}
                                </kbd>
                            </div>
                        </div>
                    </div>

                    <!-- Markdown Syntax Auto-format -->
                    <div class="space-y-2">
                        <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Ketik Otomatis (Markdown Engine)
                        </span>
                        <div class="space-y-1.5">
                            <div
                                v-for="item in markdowns"
                                :key="item.syntax"
                                :class="[
                                    'px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs',
                                    radiusClasses.item
                                ]"
                            >
                                <span class="text-slate-600 dark:text-slate-300">{{ item.label }}</span>
                                <code :class="['px-2 py-0.5 rounded font-mono text-[11px] font-bold', themeStyles.code]">
                                    {{ item.syntax }}
                                </code>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="button"
                            @click="close"
                            :class="[
                                'px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                                themeStyles.btn,
                                radiusClasses.btn
                            ]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
