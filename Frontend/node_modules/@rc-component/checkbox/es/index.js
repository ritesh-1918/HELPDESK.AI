function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import { clsx } from 'clsx';
import * as React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
export const Checkbox = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-checkbox',
    className,
    style,
    checked,
    disabled,
    defaultChecked = false,
    type = 'checkbox',
    title,
    onChange,
    ...inputProps
  } = props;
  const inputRef = useRef(null);
  const holderRef = useRef(null);
  const [rawValue, setRawValue] = useControlledState(defaultChecked, checked);
  useImperativeHandle(ref, () => ({
    focus: options => {
      inputRef.current?.focus(options);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    input: inputRef.current,
    nativeElement: holderRef.current
  }));
  const classString = clsx(prefixCls, className, {
    [`${prefixCls}-checked`]: rawValue,
    [`${prefixCls}-disabled`]: disabled
  });
  const handleChange = e => {
    if (disabled) {
      return;
    }
    if (!('checked' in props)) {
      setRawValue(e.target.checked);
    }
    onChange?.({
      target: {
        ...props,
        type,
        checked: e.target.checked
      },
      stopPropagation() {
        e.stopPropagation();
      },
      preventDefault() {
        e.preventDefault();
      },
      nativeEvent: e.nativeEvent
    });
  };
  return /*#__PURE__*/React.createElement("span", {
    className: classString,
    title: title,
    style: style,
    ref: holderRef
  }, /*#__PURE__*/React.createElement("input", _extends({}, inputProps, {
    className: `${prefixCls}-input`,
    ref: inputRef,
    onChange: handleChange,
    disabled: disabled,
    checked: !!rawValue,
    type: type
  })));
});
export default Checkbox;