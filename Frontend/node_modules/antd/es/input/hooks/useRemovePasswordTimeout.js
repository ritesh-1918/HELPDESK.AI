import { useEffect, useRef } from 'react';
export default function useRemovePasswordTimeout(inputRef, triggerOnMount) {
  const removePasswordTimeoutRef = useRef([]);
  const removePasswordTimeout = () => {
    removePasswordTimeoutRef.current.push(setTimeout(() => {
      if (inputRef.current?.input && inputRef.current?.input.getAttribute('type') === 'password' && inputRef.current?.input.hasAttribute('value')) {
        inputRef.current?.input.removeAttribute('value');
      }
    }));
  };
  useEffect(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }
    return () => removePasswordTimeoutRef.current.forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }, []);
  return removePasswordTimeout;
}