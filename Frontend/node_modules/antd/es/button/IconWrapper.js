"use client";

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
const IconWrapper = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    className,
    style,
    children,
    prefixCls
  } = props;
  const iconWrapperCls = clsx(`${prefixCls}-icon`, className);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: iconWrapperCls,
    style: style
  }, children);
});
export default IconWrapper;