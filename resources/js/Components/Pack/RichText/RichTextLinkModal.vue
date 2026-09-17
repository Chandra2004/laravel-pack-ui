<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    initialUrl: {
        type: String,
        default: '',
    },
    isLinkActive: {
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

const emit = defineEmits(['update:modelValue', 'apply', 'remove']);

const urlInput = ref(props.initialUrl);

const radiusClasses = computed(() => {
    switch (props.radius) {
        case 'none': return { box: 'rounded-none', btn: 'rounded-none' };
        case 'sm': return { box: 'rounded-lg', btn: 'rounded-md' };
        case 'md': return { box: 'rounded-xl', btn: 'rounded-lg' };
        case 'xl': return { box: 'rounded-3xl', btn: 'rounded-xl' };
        case 'full': return { box: 'rounded-3xl', btn: 'rounded-full' };
        case 'lg':
        default:
            return { box: 'rounded-2xl', btn: 'rounded-lg' };
    }
});

const themeStyles = computed(() => {
    const map = {
        primary: {
            btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            focus: 'focus:border-blue-500 focus:ring-blue-500/20',
        },
        indigo: {
            btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
            badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
            focus: 'focus:border-indigo-500 focus:ring-indigo-500/20',
        },
        emerald: {
            btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
            badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            focus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
        },
        purple: {
            btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
            badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
            focus: 'focus:border-purple-500 focus:ring-purple-500/20',
        },
        amber: {
            btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
            badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            focus: 'focus:border-amber-500 focus:ring-amber-500/20',
        },
        rose: {
            btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
            badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
            focus: 'focus:border-rose-500 focus:ring-rose-500/20',
        },
        cyan: {
            btn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
            badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
            focus: 'focus:border-cyan-500 focus:ring-cyan-500/20',
        },
        dark: {
            btn: 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900',
            badge: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            focus: 'focus:border-slate-700 dark:focus:border-slate-300 focus:ring-slate-500/20',
        },
    };
    return map[props.colorTheme] || map.primary;
});

watch(() => props.initialUrl, (val) => {
    urlInput.value = val || '';
});

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        urlInput.value = props.initialUrl || '';
    }
});

const close = () => {
    emit('update:modelValue', false);
};

const handleApply = () => {
    let formatted = urlInput.value.trim();
    if (!formatted) {
        emit('remove');
    } else {
        if (!/^https?:\/\//i.test(formatted) && !/^mailto:/i.test(formatted) && !/^tel:/i.test(formatted)) {
            formatted = 'https://' + formatted;
        }
        emit('apply', formatted);
    }
    close();
};

const handleRemove = () => {
    emit('remove');
    close();
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
                        'w-full max-w-sm p-4 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-3.5',
                        radiusClasses.box
                    ]"
                >
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-2">
                            <span :class="['w-7 h-7 rounded-lg flex items-center justify-center', themeStyles.badge]">
                                <span class="material-symbols-outlined text-base">link</span>
                            </span>
                            <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                                {{ isLinkActive ? 'Edit Tautan Web' : 'Sisipkan Tautan Web' }}
                            </h4>
                        </div>
                        <button
                            type="button"
                            @click="close"
                            class="w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <span class="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>

                    <div class="space-y-1">
                        <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            URL Tujuan (Website / Email):
                        </label>
                        <input
                            v-model="urlInput"
                            type="url"
                            placeholder="https://example.com"
                            @keyup.enter="handleApply"
                            :class="[
                                'w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                                themeStyles.focus,
                                radiusClasses.btn
                            ]"
                            autofocus
                        />
                    </div>

                    <div class="flex items-center justify-between pt-1">
                        <button
                            v-if="isLinkActive"
                            type="button"
                            @click="handleRemove"
                            class="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                            Hapus Tautan
                        </button>
                        <div class="flex items-center gap-2 ml-auto">
                            <button
                                type="button"
                                @click="close"
                                class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                @click="handleApply"
                                :class="[
                                    'px-3.5 py-1.5 text-xs font-semibold shadow-xs cursor-pointer transition-colors',
                                    themeStyles.btn,
                                    radiusClasses.btn
                                ]"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
