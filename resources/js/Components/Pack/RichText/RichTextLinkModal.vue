<script setup>
import { ref, computed, watch } from 'vue';
import ButtonSubmit from '@/Components/Pack/ButtonSubmit.vue';
import InputField from '@/Components/Pack/InputField.vue';

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

const themeColor = computed(() => {
    return props.colorTheme || 'primary';
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
                        'w-full max-w-sm p-4.5 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-4',
                        radiusClasses.box
                    ]"
                >
                    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <span class="material-symbols-outlined text-base">link</span>
                            </span>
                            <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                                {{ isLinkActive ? 'Edit Tautan Web' : 'Sisipkan Tautan Web' }}
                            </h4>
                        </div>
                        <ButtonSubmit
                            variant="ghost"
                            size="xs"
                            icon="close"
                            @click="close"
                            title="Tutup Dialog"
                        />
                    </div>

                    <div class="space-y-1">
                        <InputField
                            v-model="urlInput"
                            type="url"
                            label="URL Tujuan (Website / Email)"
                            placeholder="https://example.com"
                            icon="link"
                            size="sm"
                            :color="themeColor"
                            @keyup.enter="handleApply"
                            autofocus
                        />
                    </div>

                    <div class="flex items-center justify-between pt-1 gap-2">
                        <ButtonSubmit
                            v-if="isLinkActive"
                            variant="ghost"
                            color="rose"
                            size="xs"
                            icon="link_off"
                            @click="handleRemove"
                        >
                            Hapus Tautan
                        </ButtonSubmit>
                        <div class="flex items-center gap-2 ml-auto">
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
                                icon="check"
                                @click="handleApply"
                            >
                                Simpan Tautan
                            </ButtonSubmit>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
