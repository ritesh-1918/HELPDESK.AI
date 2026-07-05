import * as React from 'react';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import canUseDom from "@rc-component/util/es/Dom/canUseDom";
import OrderContext from "./Context";
const EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
export default function useDom(render, debug) {
  const [ele] = React.useState(() => {
    if (!canUseDom()) {
      return null;
    }
    const defaultEle = document.createElement('div');
    if (process.env.NODE_ENV !== 'production' && debug) {
      defaultEle.setAttribute('data-debug', debug);
    }
    return defaultEle;
  });

  // ========================== Order ==========================
  const appendedRef = React.useRef(false);
  const queueCreate = React.useContext(OrderContext);
  const [queue, setQueue] = React.useState(EMPTY_LIST);
  const mergedQueueCreate = queueCreate || (appendedRef.current ? undefined : appendFn => {
    setQueue(origin => {
      const newQueue = [appendFn, ...origin];
      return newQueue;
    });
  });

  // =========================== DOM ===========================
  function append() {
    if (!ele.parentElement) {
      document.body.appendChild(ele);
    }
    appendedRef.current = true;
  }
  function cleanup() {
    ele.parentElement?.removeChild(ele);
    appendedRef.current = false;
  }
  useLayoutEffect(() => {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup();
    }
    return cleanup;
  }, [render]);
  useLayoutEffect(() => {
    if (queue.length) {
      queue.forEach(appendFn => appendFn());
      setQueue(EMPTY_LIST);
    }
  }, [queue]);
  return [ele, mergedQueueCreate];
}