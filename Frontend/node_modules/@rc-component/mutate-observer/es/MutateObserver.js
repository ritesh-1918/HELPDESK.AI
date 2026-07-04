import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
import useEvent from "@rc-component/util/es/hooks/useEvent";
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { getNodeRef, supportNodeRef, useComposeRef } from "@rc-component/util/es/ref";
import React from 'react';
import useMutateObserver from "./useMutateObserver";
const MutateObserver = props => {
  const {
    children,
    options,
    onMutate = () => {}
  } = props;
  const callback = useEvent(onMutate);
  const elementRef = React.useRef(null);
  const canRef = supportNodeRef(children);
  const mergedRef = useComposeRef(elementRef, getNodeRef(children));
  const [target, setTarget] = React.useState(null);
  useMutateObserver(target, callback, options);

  // =========================== Effect ===========================
  useLayoutEffect(() => {
    // Set target based on the refs
    if (canRef && elementRef.current) {
      setTarget(getDOM(elementRef.current));
    }
  }, [canRef]);

  // =========================== Render ===========================
  if (!children) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MutationObserver need children props');
    }
    return null;
  }
  return canRef ? /*#__PURE__*/React.cloneElement(children, {
    ref: mergedRef
  }) : children;
};
export default MutateObserver;