"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _clsx = require("clsx");
var _configProvider = require("../../config-provider");
var _Input = _interopRequireDefault(require("../Input"));
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
  } = React.useContext(_configProvider.ConfigContext);
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
    (0, _raf.default)(() => {
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
  }, maskValue)), /*#__PURE__*/React.createElement(_Input.default, {
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
    className: (0, _clsx.clsx)(className, {
      [`${prefixCls}-mask-input`]: mask
    })
  }));
});
var _default = exports.default = OTPInput;