/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
function useEvent(callback) {
  const fnRef = React.useRef(callback);
  fnRef.current = callback;
  const memoFn = React.useCallback((...args) => fnRef.current?.(...args), []);
  return memoFn;
}
export default useEvent;