import { clsx } from 'clsx';
import React from 'react';
const Handler = ({
  size = 'default',
  color,
  prefixCls
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-handler`, {
      [`${prefixCls}-handler-sm`]: size === 'small'
    }),
    style: {
      backgroundColor: color
    }
  });
};
export default Handler;