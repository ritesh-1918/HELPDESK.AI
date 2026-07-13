import React, { forwardRef } from 'react';
const Transform = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    x,
    y
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      zIndex: 1,
      transform: 'translate(-50%, -50%)'
    }
  }, children);
});
export default Transform;