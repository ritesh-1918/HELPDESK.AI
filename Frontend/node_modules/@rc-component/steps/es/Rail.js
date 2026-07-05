import * as React from 'react';
import { clsx } from 'clsx';
export default function Rail(props) {
  const {
    prefixCls,
    className,
    style,
    status
  } = props;
  const railCls = `${prefixCls}-rail`;

  // ============================= render =============================
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(railCls, `${railCls}-${status}`, className),
    style: style
  });
}