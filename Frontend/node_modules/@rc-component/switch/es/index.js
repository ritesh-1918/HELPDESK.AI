function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import KeyCode from "@rc-component/util/es/KeyCode";
const Switch = /*#__PURE__*/React.forwardRef(({
  prefixCls = 'rc-switch',
  className,
  checked,
  defaultChecked,
  disabled,
  loadingIcon,
  checkedChildren,
  unCheckedChildren,
  onClick,
  onChange,
  onKeyDown,
  styles,
  classNames: switchClassNames,
  ...restProps
}, ref) => {
  const [innerChecked, setInnerChecked] = useControlledState(defaultChecked ?? false, checked);
  function triggerChange(newChecked, event) {
    let mergedChecked = innerChecked;
    if (!disabled) {
      mergedChecked = newChecked;
      setInnerChecked(mergedChecked);
      onChange?.(mergedChecked, event);
    }
    return mergedChecked;
  }
  function onInternalKeyDown(e) {
    if (e.which === KeyCode.LEFT) {
      triggerChange(false, e);
    } else if (e.which === KeyCode.RIGHT) {
      triggerChange(true, e);
    }
    onKeyDown?.(e);
  }
  function onInternalClick(e) {
    const ret = triggerChange(!innerChecked, e);
    // [Legacy] trigger onClick with value
    onClick?.(ret, e);
  }
  const switchClassName = clsx(prefixCls, className, {
    [`${prefixCls}-checked`]: innerChecked,
    [`${prefixCls}-disabled`]: disabled
  });
  return /*#__PURE__*/React.createElement("button", _extends({}, restProps, {
    type: "button",
    role: "switch",
    "aria-checked": innerChecked,
    disabled: disabled,
    className: switchClassName,
    ref: ref,
    onKeyDown: onInternalKeyDown,
    onClick: onInternalClick
  }), loadingIcon, /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-inner`
  }, /*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}-inner-checked`, switchClassNames?.content),
    style: styles?.content
  }, checkedChildren), /*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}-inner-unchecked`, switchClassNames?.content),
    style: styles?.content
  }, unCheckedChildren)));
});
Switch.displayName = 'Switch';
export default Switch;