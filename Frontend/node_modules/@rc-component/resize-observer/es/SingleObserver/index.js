import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
import { supportRef, useComposeRef, getNodeRef } from "@rc-component/util/es/ref";
import * as React from 'react';
import { CollectionContext } from "../Collection";
import useResizeObserver from "../useResizeObserver";
function SingleObserver(props, ref) {
  const {
    children,
    disabled,
    onResize,
    data
  } = props;
  const elementRef = React.useRef(null);
  const onCollectionResize = React.useContext(CollectionContext);

  // =========================== Children ===========================
  const isRenderProps = typeof children === 'function';
  const mergedChildren = isRenderProps ? children(elementRef) : children;

  // ============================= Ref ==============================
  const canRef = !isRenderProps && /*#__PURE__*/React.isValidElement(mergedChildren) && supportRef(mergedChildren);
  const originRef = canRef ? getNodeRef(mergedChildren) : null;
  const mergedRef = useComposeRef(originRef, elementRef);
  const getDomElement = () => {
    return getDOM(elementRef.current);
  };
  React.useImperativeHandle(ref, () => getDomElement());

  // =========================== Observe ============================
  useResizeObserver(!disabled, getDomElement, onResize, (sizeInfo, target) => {
    onCollectionResize?.(sizeInfo, target, data);
  });

  // ============================ Render ============================
  return canRef ? /*#__PURE__*/React.cloneElement(mergedChildren, {
    ref: mergedRef
  }) : mergedChildren;
}
const RefSingleObserver = /*#__PURE__*/React.forwardRef(SingleObserver);
if (process.env.NODE_ENV !== 'production') {
  RefSingleObserver.displayName = 'SingleObserver';
}
export default RefSingleObserver;