import * as React from 'react';
import { clsx } from 'clsx';
import { MenuContext } from "./context/MenuContext";
import { useMeasure } from "./context/PathContext";
export default function Divider({
  className,
  style
}) {
  const {
    prefixCls
  } = React.useContext(MenuContext);
  const measure = useMeasure();
  if (measure) {
    return null;
  }
  return /*#__PURE__*/React.createElement("li", {
    role: "separator",
    className: clsx(`${prefixCls}-item-divider`, className),
    style: style
  });
}