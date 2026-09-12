import { onMounted, onUnmounted } from 'vue';

/**
 * Lightweight hook to detect clicks outside a target element
 * @param {import('vue').Ref<HTMLElement>} targetRef
 * @param {(event: MouseEvent | TouchEvent) => void} handler
 */
export function useClickOutside(targetRef, handler) {
    const listener = (event) => {
        const el = targetRef.value;
        if (!el || el.contains(event.target)) return;
        handler(event);
    };

    onMounted(() => {
        document.addEventListener('pointerdown', listener, true);
    });

    onUnmounted(() => {
        document.removeEventListener('pointerdown', listener, true);
    });
}

