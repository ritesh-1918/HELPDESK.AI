import { composeRef, getNodeRef, supportRef } from "@rc-component/util/es/ref";
import React, { forwardRef, useMemo } from 'react';
const Overlay = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    overlay,
    arrow,
    prefixCls
  } = props;
  const overlayNode = useMemo(() => {
    let overlayElement;
    if (typeof overlay === 'function') {
      overlayElement = overlay();
    } else {
      overlayElement = overlay;
    }
    return overlayElement;
  }, [overlay]);
  const composedRef = composeRef(ref, getNodeRef(overlayNode));
  return /*#__PURE__*/React.createElement(React.Fragment, null, arrow && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-arrow`
  }), /*#__PURE__*/React.cloneElement(overlayNode, {
    ref: supportRef(overlayNode) ? composedRef : undefined
  }));
});
export default Overlay;