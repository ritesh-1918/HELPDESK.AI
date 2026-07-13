import { useState, useCallback, useEffect } from 'react';
/**
 * Trigger a callback on state change
 */
export default function useEffectState() {
  const [effectId, setEffectId] = useState({
    id: 0,
    callback: null
  });
  const update = useCallback(callback => {
    setEffectId(({
      id
    }) => ({
      id: id + 1,
      callback
    }));
  }, []);
  useEffect(() => {
    effectId.callback?.();
  }, [effectId]);
  return update;
}