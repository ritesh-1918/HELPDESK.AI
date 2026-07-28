"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var _react = _interopRequireWildcard(require("react"));
var _BaseInput = _interopRequireDefault(require("./BaseInput"));
var _useCount = _interopRequireDefault(require("./hooks/useCount"));
var _commonUtils = require("./utils/commonUtils");
var _focus = require("@rc-component/util/lib/Dom/focus");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Input = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    autoComplete,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onKeyUp,
    prefixCls = 'rc-input',
    disabled,
    htmlSize,
    className,
    maxLength,
    suffix,
    showCount,
    count,
    type = 'text',
    classes,
    classNames,
    styles,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  } = props;
  const [focused, setFocused] = (0, _react.useState)(false);
  const compositionRef = (0, _react.useRef)(false);
  const keyLockRef = (0, _react.useRef)(false);
  const inputRef = (0, _react.useRef)(null);
  const holderRef = (0, _react.useRef)(null);
  const focus = option => {
    if (inputRef.current) {
      (0, _focus.triggerFocus)(inputRef.current, option);
    }
  };

  // ====================== Value =======================
  const [value, setValue] = (0, _useControlledState.default)(props.defaultValue, props.value);
  const formatValue = value === undefined || value === null ? '' : String(value);

  // =================== Select Range ===================
  const [selection, setSelection] = (0, _react.useState)(null);

  // ====================== Count =======================
  const countConfig = (0, _useCount.default)(count, showCount);
  const mergedMax = countConfig.max || maxLength;
  const valueLength = countConfig.strategy(formatValue);
  const isOutOfRange = !!mergedMax && valueLength > mergedMax;

  // ======================= Ref ========================
  (0, _react.useImperativeHandle)(ref, () => ({
    focus,
    blur: () => {
      inputRef.current?.blur();
    },
    setSelectionRange: (start, end, direction) => {
      inputRef.current?.setSelectionRange(start, end, direction);
    },
    select: () => {
      inputRef.current?.select();
    },
    input: inputRef.current,
    nativeElement: holderRef.current?.nativeElement || inputRef.current
  }));
  (0, _react.useEffect)(() => {
    if (keyLockRef.current) {
      keyLockRef.current = false;
    }
    setFocused(prev => prev && disabled ? false : prev);
  }, [disabled]);
  const triggerChange = (e, currentValue, info) => {
    let cutValue = currentValue;
    if (!compositionRef.current && countConfig.exceedFormatter && countConfig.max && countConfig.strategy(currentValue) > countConfig.max) {
      cutValue = countConfig.exceedFormatter(currentValue, {
        max: countConfig.max
      });
      if (currentValue !== cutValue) {
        setSelection([inputRef.current?.selectionStart || 0, inputRef.current?.selectionEnd || 0]);
      }
    } else if (info.source === 'compositionEnd') {
      // Avoid triggering twice
      // https://github.com/ant-design/ant-design/issues/46587
      return;
    }
    setValue(cutValue);
    if (inputRef.current) {
      (0, _commonUtils.resolveOnChange)(inputRef.current, e, onChange, cutValue);
    }
  };
  (0, _react.useEffect)(() => {
    if (selection) {
      inputRef.current?.setSelectionRange(...selection);
    }
  }, [selection]);
  const onInternalChange = e => {
    triggerChange(e, e.target.value, {
      source: 'change'
    });
  };
  const onInternalCompositionEnd = e => {
    compositionRef.current = false;
    triggerChange(e, e.currentTarget.value, {
      source: 'compositionEnd'
    });
    onCompositionEnd?.(e);
  };
  const handleKeyDown = e => {
    if (onPressEnter && e.key === 'Enter' && !keyLockRef.current && !e.nativeEvent.isComposing) {
      keyLockRef.current = true;
      onPressEnter(e);
    }
    onKeyDown?.(e);
  };
  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      keyLockRef.current = false;
    }
    onKeyUp?.(e);
  };
  const handleFocus = e => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = e => {
    if (keyLockRef.current) {
      keyLockRef.current = false;
    }
    setFocused(false);
    onBlur?.(e);
  };
  const handleReset = e => {
    setValue('');
    focus();
    if (inputRef.current) {
      (0, _commonUtils.resolveOnChange)(inputRef.current, e, onChange);
    }
  };

  // ====================== Input =======================
  const outOfRangeCls = isOutOfRange && `${prefixCls}-out-of-range`;
  const getInputElement = () => {
    // Fix https://fb.me/react-unknown-prop
    const otherProps = (0, _omit.default)(props, ['prefixCls', 'onPressEnter', 'addonBefore', 'addonAfter', 'prefix', 'suffix', 'allowClear',
    // Input elements must be either controlled or uncontrolled,
    // specify either the value prop, or the defaultValue prop, but not both.
    'defaultValue', 'showCount', 'count', 'classes', 'htmlSize', 'styles', 'classNames', 'onClear']);
    return /*#__PURE__*/_react.default.createElement("input", _extends({
      autoComplete: autoComplete
    }, otherProps, {
      onChange: onInternalChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      className: (0, _clsx.clsx)(prefixCls, {
        [`${prefixCls}-disabled`]: disabled
      }, classNames?.input),
      style: styles?.input,
      ref: inputRef,
      size: htmlSize,
      type: type,
      onCompositionStart: e => {
        compositionRef.current = true;
        onCompositionStart?.(e);
      },
      onCompositionEnd: onInternalCompositionEnd
    }));
  };
  const getSuffix = () => {
    // Max length value
    const hasMaxLength = Number(mergedMax) > 0;
    if (suffix || countConfig.show) {
      const dataCount = countConfig.showFormatter ? countConfig.showFormatter({
        value: formatValue,
        count: valueLength,
        maxLength: mergedMax
      }) : `${valueLength}${hasMaxLength ? ` / ${mergedMax}` : ''}`;
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, countConfig.show && /*#__PURE__*/_react.default.createElement("span", {
        className: (0, _clsx.clsx)(`${prefixCls}-show-count-suffix`, {
          [`${prefixCls}-show-count-has-suffix`]: !!suffix
        }, classNames?.count),
        style: {
          ...styles?.count
        }
      }, dataCount), suffix);
    }
    return null;
  };

  // ====================== Render ======================
  return /*#__PURE__*/_react.default.createElement(_BaseInput.default, _extends({}, rest, {
    prefixCls: prefixCls,
    className: (0, _clsx.clsx)(className, outOfRangeCls),
    handleReset: handleReset,
    value: formatValue,
    focused: focused,
    triggerFocus: focus,
    suffix: getSuffix(),
    disabled: disabled,
    classes: classes,
    classNames: classNames,
    styles: styles,
    ref: holderRef
  }), getInputElement());
});
var _default = exports.default = Input;