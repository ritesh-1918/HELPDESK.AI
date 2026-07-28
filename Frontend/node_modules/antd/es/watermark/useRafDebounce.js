import React from 'react';
import { useEvent } from '@rc-component/util';
import raf from "@rc-component/util/es/raf";
/**
 * Callback will only execute last one for each raf
 */
export default function useRafDebounce(callback) {
  const executeRef = React.useRef(false);
  const rafRef = React.useRef(null);
  const wrapperCallback = useEvent(callback);
  return () => {
    if (executeRef.current) {
      return;
    }
    executeRef.current = true;
    wrapperCallback();
    rafRef.current = raf(() => {
      executeRef.current = false;
    });
  };
}