<script setup>
import { computed } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import Badge from '@/Components/Pack/Badge.vue';

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

const themeColor = computed(() => props.colorTheme || 'primary');

const themeStyles = computed(() => {
    const map = {
        primary: {
            badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            code: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        },
        indigo: {
            badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            code: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
        },
        emerald: {
            badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            code: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        },
        purple: {
            badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
            code: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
        },
        amber: {
            badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            code: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        },
        rose: {
            badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            code: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
        },
        cyan: {
            badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
            code: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
        },
        dark: {
            badge: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            code: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        },
    };
    return map[props.colorTheme] || map.primary;
});

const keyboardShortcuts = [
    { label: 'Tebal (Bold)', key: 'Ctrl + B' },
    { label: 'Miring (Italic)', key: 'Ctrl + I' },
    { label: 'Garis Bawah (Underline)', key: 'Ctrl + U' },
    { label: 'Coret (Strikethrough)', key: 'Ctrl + Shift + X' },
    { label: 'Kode Segaris (Inline Code)', key: 'Ctrl + E' },
    { label: 'Batal Perubahan (Undo)', key: 'Ctrl + Z' },
    { label: 'Ulangi Perubahan (Redo)', key: 'Ctrl + Y' },
    { label: 'Hapus Format', key: 'Ctrl + \\' },
];

const markdownShortcuts = [
    { label: 'Heading 1', syntax: '# (spasi)' },
    { label: 'Heading 2', syntax: '## (spasi)' },
    { label: 'Heading 3', syntax: '### (spasi)' },
    { label: 'Daftar Berpoin', syntax: '- atau * (spasi)' },
    { label: 'Daftar Bernomor', syntax: '1. (spasi)' },
    { label: 'Blok Kutipan', syntax: '> (spasi)' },
    { label: 'Blok Kode', syntax: '``` (enter)' },
    { label: 'Garis Pembagi (Divider)', syntax: '--- (enter)' },
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
                        <ButtonSubmit
                            variant="ghost"
                            size="xs"
                            icon="close"
                            @click="close"
                            title="Tutup Dialog"
                        />
                    </div>

                    <!-- Keyboard Shortcuts Table -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Pintasan Keyboard</span>
                            <Badge variant="soft" color="indigo" size="xs">Tombol Cepat</Badge>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5">
                            <div
                                v-for="item in keyboardShortcuts"
                                :key="item.label"
                                :class="[
                                    'px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs',
                                    radiusClasses.item
                                ]"
                            >
                                <span class="text-slate-600 dark:text-slate-300">{{ item.label }}</span>
                                <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500 shadow-2xs">
                                    {{ item.key }}
                                </kbd>
                            </div>
                        </div>
                    </div>

                    <!-- Markdown Shortcuts Table -->
                    <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Aturan Ketik Markdown</span>
                            <Badge variant="soft" color="emerald" size="xs">Otomatis</Badge>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5">
                            <div
                                v-for="item in markdownShortcuts"
                                :key="item.label"
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
                        <ButtonSubmit
                            variant="primary"
                            :color="themeColor"
                            size="sm"
                            @click="close"
                        >
                            Selesai Membaca
                        </ButtonSubmit>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
