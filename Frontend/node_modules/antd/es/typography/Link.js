"use client";

import * as React from 'react';
import { devUseWarning } from '../_util/warning';
import Base from './Base';
const Link = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    ellipsis,
    rel,
    children,
    // @ts-expect-error: https://github.com/ant-design/ant-design/issues/26622
    navigate: _navigate,
    ...restProps
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Typography.Link');
    process.env.NODE_ENV !== "production" ? warning(typeof ellipsis !== 'object', 'usage', '`ellipsis` only supports boolean value.') : void 0;
  }
  const mergedProps = {
    ...restProps,
    rel: rel === undefined && restProps.target === '_blank' ? 'noopener noreferrer' : rel
  };
  return /*#__PURE__*/React.createElement(Base, {
    ...mergedProps,
    ref: ref,
    ellipsis: !!ellipsis,
    component: "a"
  }, children);
});
export default Link;