"use client";

import * as React from 'react';
import Base from './Base';
const Paragraph = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    children,
    ...restProps
  } = props;
  return /*#__PURE__*/React.createElement(Base, {
    ref: ref,
    ...restProps,
    component: "div"
  }, children);
});
export default Paragraph;