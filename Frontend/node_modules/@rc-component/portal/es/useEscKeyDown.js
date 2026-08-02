import { useEvent } from '@rc-component/util';
import useId from "@rc-component/util/es/hooks/useId";
import { useEffect, useMemo } from 'react';
let stack = [];
const IME_LOCK_DURATION = 200;
let lastCompositionEndTime = 0;

// Export for testing
export const _test = process.env.NODE_ENV === 'test' ? () => ({
  stack,
  reset: () => {
    // Not reset stack to ensure effect will clean up correctly
    lastCompositionEndTime = 0;
  }
}) : null;

// Global event handlers
const onGlobalKeyDown = event => {
  if (event.key === 'Escape' && !event.isComposing) {
    const now = Date.now();
    if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
      return;
    }
    const len = stack.length;
    for (let i = len - 1; i >= 0; i -= 1) {
      stack[i].onEsc({
        top: i === len - 1,
        event
      });
    }
  }
};
const onGlobalCompositionEnd = () => {
  lastCompositionEndTime = Date.now();
};
function attachGlobalEventListeners() {
  window.addEventListener('keydown', onGlobalKeyDown);
  window.addEventListener('compositionend', onGlobalCompositionEnd);
}
function detachGlobalEventListeners() {
  if (stack.length === 0) {
    window.removeEventListener('keydown', onGlobalKeyDown);
    window.removeEventListener('compositionend', onGlobalCompositionEnd);
  }
}
export default function useEscKeyDown(open, onEsc) {
  const id = useId();
  const onEventEsc = useEvent(onEsc);
  const ensure = () => {
    if (!stack.find(item => item.id === id)) {
      stack.push({
        id,
        onEsc: onEventEsc
      });
    }
  };
  const clear = () => {
    stack = stack.filter(item => item.id !== id);
  };
  useMemo(() => {
    if (open) {
      ensure();
    } else if (!open) {
      clear();
    }
  }, [open]);
  useEffect(() => {
    if (open) {
      ensure();
      // Attach global event listeners
      attachGlobalEventListeners();
      return () => {
        clear();
        // Remove global event listeners if instances is empty
        detachGlobalEventListeners();
      };
    }
  }, [open]);
}