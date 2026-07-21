import { warning } from "@rc-component/util/es/warning";
import { useEffect } from 'react';

// DO NOT register functions in useEffect cleanup function, or functions that registered will never be called.
const useEffectCleanupRegister = deps => {
  const effectCleanups = [];
  let cleanupFlag = false;
  function register(fn) {
    if (cleanupFlag) {
      if (process.env.NODE_ENV !== 'production') {
        warning(false, '[Ant Design CSS-in-JS] You are registering a cleanup function after unmount, which will not have any effect.');
      }
      return;
    }
    effectCleanups.push(fn);
  }
  useEffect(() => {
    // Compatible with strict mode
    cleanupFlag = false;
    return () => {
      cleanupFlag = true;
      if (effectCleanups.length) {
        effectCleanups.forEach(fn => fn());
      }
    };
  }, deps);
  return register;
};
export default useEffectCleanupRegister;