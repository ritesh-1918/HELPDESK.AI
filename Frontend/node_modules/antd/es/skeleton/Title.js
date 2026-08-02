"use client";

/* eslint-disable jsx-a11y/heading-has-content */
import * as React from 'react';
import { clsx } from 'clsx';
const Title = ({
  prefixCls,
  className,
  width,
  style
}) => (
/*#__PURE__*/
// biome-ignore lint/a11y/useHeadingContent: HOC here
React.createElement("h3", {
  className: clsx(prefixCls, className),
  style: {
    width,
    ...style
  }
}));
export default Title;