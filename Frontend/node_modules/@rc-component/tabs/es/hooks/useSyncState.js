import * as React from 'react';
export default function useSyncState(defaultState, onChange) {
  const stateRef = React.useRef(defaultState);
  const [, forceUpdate] = React.useState({});
  function setState(updater) {
    const newValue = typeof updater === 'function' ? updater(stateRef.current) : updater;
    if (newValue !== stateRef.current) {
      onChange(newValue, stateRef.current);
    }
    stateRef.current = newValue;
    forceUpdate({});
  }
  return [stateRef.current, setState];
}