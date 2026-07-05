import KeyCode from "@rc-component/util/es/KeyCode";
import raf from "@rc-component/util/es/raf";
import * as React from 'react';
const {
  ESC,
  TAB
} = KeyCode;
export default function useAccessibility({
  visible,
  triggerRef,
  onVisibleChange,
  autoFocus,
  overlayRef
}) {
  const focusMenuRef = React.useRef(false);
  const handleCloseMenuAndReturnFocus = () => {
    if (visible) {
      triggerRef.current?.focus?.();
      onVisibleChange?.(false);
    }
  };
  const focusMenu = () => {
    if (overlayRef.current?.focus) {
      overlayRef.current.focus();
      focusMenuRef.current = true;
      return true;
    }
    return false;
  };
  const handleKeyDown = event => {
    switch (event.keyCode) {
      case ESC:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB:
        {
          let focusResult = false;
          if (!focusMenuRef.current) {
            focusResult = focusMenu();
          }
          if (focusResult) {
            event.preventDefault();
          } else {
            handleCloseMenuAndReturnFocus();
          }
          break;
        }
    }
  };
  React.useEffect(() => {
    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
      if (autoFocus) {
        // FIXME: hack with raf
        raf(focusMenu, 3);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        focusMenuRef.current = false;
      };
    }
    return () => {
      focusMenuRef.current = false;
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
}