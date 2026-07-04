import React from 'react';
import { useLockFocus } from "@rc-component/util/es/Dom/focus";
export default function useFocusable(getContainer, open, autoFocus, focusTrap, mask) {
  const mergedFocusTrap = focusTrap ?? mask !== false;

  // Focus lock
  const [ignoreElement] = useLockFocus(open && mergedFocusTrap, getContainer);

  // Auto Focus
  React.useEffect(() => {
    if (open && autoFocus === true) {
      getContainer()?.focus({
        preventScroll: true
      });
    }
  }, [open]);
  return ignoreElement;
}