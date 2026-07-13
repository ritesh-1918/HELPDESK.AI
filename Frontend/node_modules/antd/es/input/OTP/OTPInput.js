"use client";

import * as React from 'react';
import raf from "@rc-component/util/es/raf";
import { clsx } from 'clsx';
import { ConfigContext } from '../../config-provider';
import Input from '../Input';
const OTPInput = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    value,
    onChange,
    onActiveChange,
    index,
    mask,
    onFocus,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('otp');
  const maskValue = typeof mask === 'string' ? mask : value;
  // ========================== Ref ===========================
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);
  // ========================= Input ==========================
  const onInternalChange = e => {
    onChange(index, e.target.value);
  };
  // ========================= Focus ==========================
  const syncSelection = () => {
    raf(() => {
      const inputEle = inputRef.current?.input;
      if (document.activeElement === inputEle && inputEle) {
        inputEle.select();
      }
    });
  };
  const onInternalFocus = e => {
    onFocus?.(e);
    syncSelection();
  };
  // ======================== Keyboard ========================
  const onInternalKeyDown = event => {
    const {
      key,
      ctrlKey,
      metaKey
    } = event;
    if (key === 'ArrowLeft') {
      onActiveChange(index - 1);
    } else if (key === 'ArrowRight') {
      onActiveChange(index + 1);
    } else if (key === 'z' && (ctrlKey || metaKey)) {
      event.preventDefault();
    } else if (key === 'Backspace' && !value) {
      onActiveChange(index - 1);
    }
    syncSelection();
  };
  // ========================= Render =========================
  return /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-input-wrapper`,
    role: "presentation"
  }, mask && value !== '' && value !== undefined && (/*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-mask-icon`,
    "aria-hidden": "true"
  }, maskValue)), /*#__PURE__*/React.createElement(Input, {
    "aria-label": `OTP Input ${index + 1}`,
    type: mask === true ? 'password' : 'text',
    ...restProps,
    ref: inputRef,
    value: value,
    onInput: onInternalChange,
    onFocus: onInternalFocus,
    onKeyDown: onInternalKeyDown,
    onMouseDown: syncSelection,
    onMouseUp: syncSelection,
    className: clsx(className, {
      [`${prefixCls}-mask-input`]: mask
    })
  }));
});
export default OTPInput;