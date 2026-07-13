import * as React from 'react';
import { useEvent } from '@rc-component/util';
import raf from "@rc-component/util/es/raf";
export default function useDelay(callback) {
  const idRef = React.useRef(0);
  const clearRaf = () => {
    raf.cancel(idRef.current);
  };
  React.useEffect(() => clearRaf, []);
  const triggerFn = useEvent(() => {
    clearRaf();
    idRef.current = raf(callback);
  });
  return triggerFn;
}