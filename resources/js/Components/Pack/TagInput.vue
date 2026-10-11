<script setup>
import { ref } from 'vue';
import InputTag from './InputTag.vue';

const inputTagRef = ref(null);

defineExpose({
    addTag: (...args) => inputTagRef.value?.addTag(...args),
    removeTag: (...args) => inputTagRef.value?.removeTag(...args),
    clearAllTags: (...args) => inputTagRef.value?.clearAllTags(...args),
    focusInput: (...args) => inputTagRef.value?.focusInput(...args),
    get currentTags() {
        return inputTagRef.value?.currentTags || [];
    },
});
</script>

<template>
    <InputTag ref="inputTagRef" v-bind="$attrs">
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps" />
        </template>
    </InputTag>
</template>
