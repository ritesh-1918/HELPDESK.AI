import * as React from 'react';
import { useEvent } from '@rc-component/util';
export function isInside(elements, target) {
  return elements.filter(element => element).some(element => element.contains(target) || element === target);
}
export default function useSelectTriggerControl(elements, open, triggerOpen, customizedTrigger) {
  const onGlobalMouseDown = useEvent(event => {
    // If trigger is customized, Trigger will take control of popupVisible
    if (customizedTrigger) {
      return;
    }
    let target = event.target;
    if (target.shadowRoot && event.composed) {
      target = event.composedPath()[0] || target;
    }
    if (event._ori_target) {
      target = event._ori_target;
    }
    if (open &&
    // Marked by SelectInput mouseDown event
    !isInside(elements(), target)) {
      // Should trigger close
      triggerOpen(false);
    }
  });
  React.useEffect(() => {
    window.addEventListener('mousedown', onGlobalMouseDown);
    return () => window.removeEventListener('mousedown', onGlobalMouseDown);
  }, [onGlobalMouseDown]);
}