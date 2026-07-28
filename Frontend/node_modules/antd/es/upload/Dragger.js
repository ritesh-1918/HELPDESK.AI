"use client";

import * as React from 'react';
import Upload from './Upload';
const Dragger = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    style,
    height,
    hasControlInside = false,
    children,
    ...restProps
  } = props;
  const mergedStyle = {
    ...style,
    height
  };
  return /*#__PURE__*/React.createElement(Upload, {
    ref: ref,
    hasControlInside: hasControlInside,
    ...restProps,
    style: mergedStyle,
    type: "drag"
  }, children);
});
if (process.env.NODE_ENV !== 'production') {
  Dragger.displayName = 'Dragger';
}
export default Dragger;