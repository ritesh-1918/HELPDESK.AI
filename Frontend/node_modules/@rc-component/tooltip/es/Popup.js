import { clsx } from 'clsx';
import * as React from 'react';
const Popup = props => {
  const {
    children,
    prefixCls,
    id,
    classNames,
    styles,
    className,
    style
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    id: id,
    className: clsx(`${prefixCls}-container`, classNames?.container, className),
    style: {
      ...styles?.container,
      ...style
    },
    role: "tooltip"
  }, typeof children === 'function' ? children() : children);
};
export default Popup;