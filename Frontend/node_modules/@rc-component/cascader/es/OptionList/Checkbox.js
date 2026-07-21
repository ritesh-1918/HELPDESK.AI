import * as React from 'react';
import { clsx } from 'clsx';
import CascaderContext from "../context";
export default function Checkbox({
  prefixCls,
  checked,
  halfChecked,
  disabled,
  onClick,
  disableCheckbox
}) {
  const {
    checkable
  } = React.useContext(CascaderContext);
  const customCheckbox = typeof checkable !== 'boolean' ? checkable : null;
  return /*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}`, {
      [`${prefixCls}-checked`]: checked,
      [`${prefixCls}-indeterminate`]: !checked && halfChecked,
      [`${prefixCls}-disabled`]: disabled || disableCheckbox
    }),
    onClick: onClick
  }, customCheckbox);
}