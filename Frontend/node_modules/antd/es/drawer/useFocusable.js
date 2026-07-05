import { useMemo } from 'react';
export default function useFocusable(focusable, defaultTrap, legacyFocusTriggerAfterClose) {
  return useMemo(() => {
    const ret = {
      trap: defaultTrap ?? true,
      focusTriggerAfterClose: legacyFocusTriggerAfterClose ?? true
    };
    return {
      ...ret,
      ...focusable
    };
  }, [focusable, defaultTrap, legacyFocusTriggerAfterClose]);
}