"use client";

import * as React from 'react';
import { omit } from '@rc-component/util';
import { devUseWarning } from '../_util/warning';
import Base from './Base';
const Text = (props, ref) => {
  const {
    ellipsis,
    children,
    ...restProps
  } = props;
  const mergedEllipsis = React.useMemo(() => {
    if (ellipsis && typeof ellipsis === 'object') {
      return omit(ellipsis, ['expandable', 'rows']);
    }
    return ellipsis;
  }, [ellipsis]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Typography.Text');
    process.env.NODE_ENV !== "production" ? warning(typeof ellipsis !== 'object' || !ellipsis || !('expandable' in ellipsis) && !('rows' in ellipsis), 'usage', '`ellipsis` do not support `expandable` or `rows` props.') : void 0;
  }
  return /*#__PURE__*/React.createElement(Base, {
    ref: ref,
    ...restProps,
    ellipsis: mergedEllipsis,
    component: "span"
  }, children);
};
export default /*#__PURE__*/React.forwardRef(Text);