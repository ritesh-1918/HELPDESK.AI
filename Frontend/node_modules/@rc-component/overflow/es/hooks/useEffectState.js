import useEvent from "@rc-component/util/es/hooks/useEvent";
import * as React from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import channelUpdate from "./channelUpdate";
/**
 * Batcher for record any `useEffectState` need update.
 */
export function useBatcher() {
  // Updater Trigger
  const updateFuncRef = React.useRef(null);

  // Notify update
  const notifyEffectUpdate = callback => {
    if (!updateFuncRef.current) {
      updateFuncRef.current = [];
      channelUpdate(() => {
        unstable_batchedUpdates(() => {
          updateFuncRef.current.forEach(fn => {
            fn();
          });
          updateFuncRef.current = null;
        });
      });
    }
    updateFuncRef.current.push(callback);
  };
  return notifyEffectUpdate;
}

/**
 * Trigger state update by `useLayoutEffect` to save perf.
 */
export default function useEffectState(notifyEffectUpdate, defaultValue) {
  // Value
  const [stateValue, setStateValue] = React.useState(defaultValue);

  // Set State
  const setEffectVal = useEvent(nextValue => {
    notifyEffectUpdate(() => {
      setStateValue(nextValue);
    });
  });
  return [stateValue, setEffectVal];
}