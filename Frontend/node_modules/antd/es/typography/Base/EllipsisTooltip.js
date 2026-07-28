"use client";

import * as React from 'react';
import Tooltip from '../../tooltip';
const EllipsisTooltip = ({
  enableEllipsis,
  isEllipsis,
  children,
  tooltipProps
}) => {
  if (!tooltipProps?.title || !enableEllipsis) {
    return children;
  }
  return /*#__PURE__*/React.createElement(Tooltip, {
    open: isEllipsis ? undefined : false,
    ...tooltipProps
  }, children);
};
if (process.env.NODE_ENV !== 'production') {
  EllipsisTooltip.displayName = 'EllipsisTooltip';
}
export default EllipsisTooltip;