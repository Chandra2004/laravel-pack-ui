import { ref, watch, nextTick, onMounted, onBeforeUnmount, unref } from 'vue';

/**
 * Advanced Floating Popover Composable for Pack UI
 * Features:
 * - Teleport to body positioning (fixed coordinates)
 * - Multi-placement support: 'bottom' | 'top' | 'left' | 'right'
 * - Viewport boundary collision detection with smart auto-flip
 * - Match trigger width option (for select dropdowns)
 * - Outside click & Escape key detection
 * - Global scroll & resize tracking
 */
export function usePopover({
    triggerRef,
    popoverRef,
    isOpen,
    placement = 'bottom',
    offset = 8,
    matchWidth = false,
    autoFlip = true,
    onClose = () => {},
}) {
    const popoverStyle = ref({
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: 99999,
        visibility: 'hidden',
    });

    const currentPlacement = ref(unref(placement) || 'bottom');

    const updatePosition = () => {
        if (!isOpen.value || !triggerRef.value) return;

        const triggerEl = triggerRef.value.$el || triggerRef.value;
        if (!triggerEl || typeof triggerEl.getBoundingClientRect !== 'function') return;

        const triggerRect = triggerEl.getBoundingClientRect();
        const popoverEl = popoverRef.value?.$el || popoverRef.value;
        const popoverRect = popoverEl ? popoverEl.getBoundingClientRect() : { width: 320, height: 380 };

        const targetPlacement = unref(placement) || 'bottom';
        let effectivePlacement = targetPlacement;

        const gap = Number(offset) || 8;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;
        const pWidth = popoverRect.width || (matchWidth ? triggerRect.width : 320);
        const pHeight = popoverRect.height || 380;

        // Auto-flip if overflowing viewport boundaries
        if (autoFlip) {
            if (targetPlacement === 'bottom' && (triggerRect.bottom + gap + pHeight > viewportHeight - 12)) {
                if (triggerRect.top - gap - pHeight > 12) {
                    effectivePlacement = 'top';
                }
            } else if (targetPlacement === 'top' && (triggerRect.top - gap - pHeight < 12)) {
                if (triggerRect.bottom + gap + pHeight < viewportHeight - 12) {
                    effectivePlacement = 'bottom';
                }
            } else if (targetPlacement === 'right' && (triggerRect.right + gap + pWidth > viewportWidth - 12)) {
                if (triggerRect.left - gap - pWidth > 12) {
                    effectivePlacement = 'left';
                }
            } else if (targetPlacement === 'left' && (triggerRect.left - gap - pWidth < 12)) {
                if (triggerRect.right + gap + pWidth < viewportWidth - 12) {
                    effectivePlacement = 'right';
                }
            }
        }

        currentPlacement.value = effectivePlacement;

        switch (effectivePlacement) {
            case 'top':
                top = triggerRect.top - gap - pHeight;
                left = triggerRect.left;
                break;
            case 'left':
                top = triggerRect.top;
                left = triggerRect.left - gap - pWidth;
                break;
            case 'right':
                top = triggerRect.top;
                left = triggerRect.right + gap;
                break;
            case 'bottom':
            default:
                top = triggerRect.bottom + gap;
                left = triggerRect.left;
                break;
        }

        // Horizontal boundary guard
        if (left + pWidth > viewportWidth - 12) {
            left = viewportWidth - pWidth - 12;
        }
        if (left < 12) {
            left = 12;
        }

        // Vertical boundary guard
        if (top + pHeight > viewportHeight - 12) {
            top = Math.max(12, viewportHeight - pHeight - 12);
        }
        if (top < 12) {
            top = 12;
        }

        popoverStyle.value = {
            position: 'fixed',
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
            zIndex: 99999,
            minWidth: matchWidth ? `${Math.round(triggerRect.width)}px` : undefined,
            visibility: 'visible',
        };
    };

    // Outside click & escape listener
    const handlePointerDown = (e) => {
        if (!isOpen.value) return;
        const triggerEl = triggerRef.value?.$el || triggerRef.value;
        const popoverEl = popoverRef.value?.$el || popoverRef.value;

        if (triggerEl && triggerEl.contains(e.target)) return;
        if (popoverEl && popoverEl.contains(e.target)) return;

        isOpen.value = false;
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const handleKeydown = (e) => {
        if (!isOpen.value) return;
        if (e.key === 'Escape') {
            isOpen.value = false;
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    };

    watch(isOpen, async (val) => {
        if (val) {
            await nextTick();
            updatePosition();
            requestAnimationFrame(updatePosition);
        }
    });

    watch(() => unref(placement), () => {
        if (isOpen.value) {
            nextTick(updatePosition);
        }
    });

    onMounted(() => {
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition, { passive: true });
        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('keydown', handleKeydown, true);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('keydown', handleKeydown, true);
    });

    return {
        popoverStyle,
        currentPlacement,
        updatePosition,
    };
}
