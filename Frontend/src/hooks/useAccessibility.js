import { useRef, useEffect, useCallback } from 'react';

const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref, onClose) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onCloseRef.current?.();
            return;
        }

        if (e.key !== 'Tab') return;

        const node = ref?.current;
        if (!node) return;

        const focusable = node.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [ref]);

    useEffect(() => {
        const node = ref?.current;
        if (!node) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [ref, handleKeyDown]);
}
