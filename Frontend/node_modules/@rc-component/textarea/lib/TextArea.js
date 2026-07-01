"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _input = require("@rc-component/input");
var _useCount = _interopRequireDefault(require("@rc-component/input/lib/hooks/useCount"));
var _commonUtils = require("@rc-component/input/lib/utils/commonUtils");
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var _ResizableTextArea = _interopRequireDefault(require("./ResizableTextArea"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const TextArea = /*#__PURE__*/_react.default.forwardRef(({
  defaultValue,
  value: customValue,
  onFocus,
  onBlur,
  onChange,
  allowClear,
  maxLength,
  onCompositionStart,
  onCompositionEnd,
  suffix,
  prefixCls = 'rc-textarea',
  showCount,
  count,
  className,
  style,
  disabled,
  hidden,
  classNames,
  styles,
  onResize,
  onClear,
  onPressEnter,
  readOnly,
  autoSize,
  onKeyDown,
  ...rest
}, ref) => {
  const [value, setValue] = (0, _useControlledState.default)(defaultValue, customValue);
  const formatValue = value === undefined || value === null ? '' : String(value);
  const [focused, setFocused] = _react.default.useState(false);
  const compositionRef = _react.default.useRef(false);
  const [textareaResized, setTextareaResized] = _react.default.useState(null);

  // =============================== Ref ================================
  const holderRef = (0, _react.useRef)(null);
  const resizableTextAreaRef = (0, _react.useRef)(null);
  const getTextArea = () => resizableTextAreaRef.current?.textArea;
  const focus = () => {
    getTextArea().focus();
  };
  (0, _react.useImperativeHandle)(ref, () => ({
    resizableTextArea: resizableTextAreaRef.current,
    focus,
    blur: () => {
      getTextArea().blur();
    },
    nativeElement: holderRef.current?.nativeElement || getTextArea()
  }));
  (0, _react.useEffect)(() => {
    setFocused(prev => !disabled && prev);
  }, [disabled]);

  // =========================== Select Range ===========================
  const [selection, setSelection] = _react.default.useState(null);
  _react.default.useEffect(() => {
    if (selection) {
      getTextArea().setSelectionRange(...selection);
    }
  }, [selection]);

  // ============================== Count ===============================
  const countConfig = (0, _useCount.default)(count, showCount);
  const mergedMax = countConfig.max ?? maxLength;

  // Max length value
  const hasMaxLength = Number(mergedMax) > 0;
  const valueLength = countConfig.strategy(formatValue);
  const isOutOfRange = !!mergedMax && valueLength > mergedMax;

  // ============================== Change ==============================
  const triggerChange = (e, currentValue) => {
    let cutValue = currentValue;
    if (!compositionRef.current && countConfig.exceedFormatter && countConfig.max && countConfig.strategy(currentValue) > countConfig.max) {
      cutValue = countConfig.exceedFormatter(currentValue, {
        max: countConfig.max
      });
      if (currentValue !== cutValue) {
        setSelection([getTextArea().selectionStart || 0, getTextArea().selectionEnd || 0]);
      }
    }
    setValue(cutValue);
    (0, _commonUtils.resolveOnChange)(e.currentTarget, e, onChange, cutValue);
  };

  // =========================== Value Update ===========================
  const onInternalCompositionStart = e => {
    compositionRef.current = true;
    onCompositionStart?.(e);
  };
  const onInternalCompositionEnd = e => {
    compositionRef.current = false;
    triggerChange(e, e.currentTarget.value);
    onCompositionEnd?.(e);
  };
  const onInternalChange = e => {
    triggerChange(e, e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && onPressEnter && !e.nativeEvent.isComposing) {
      onPressEnter(e);
    }
    onKeyDown?.(e);
  };
  const handleFocus = e => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = e => {
    setFocused(false);
    onBlur?.(e);
  };

  // ============================== Reset ===============================
  const handleReset = e => {
    setValue('');
    focus();
    (0, _commonUtils.resolveOnChange)(getTextArea(), e, onChange);
  };
  let suffixNode = suffix;
  let dataCount;
  if (countConfig.show) {
    if (countConfig.showFormatter) {
      dataCount = countConfig.showFormatter({
        value: formatValue,
        count: valueLength,
        maxLength: mergedMax
      });
    } else {
      dataCount = `${valueLength}${hasMaxLength ? ` / ${mergedMax}` : ''}`;
    }
    suffixNode = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, suffixNode, /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(`${prefixCls}-data-count`, classNames?.count),
      style: styles?.count
    }, dataCount));
  }
  const handleResize = size => {
    onResize?.(size);
    if (getTextArea()?.style.height) {
      setTextareaResized(true);
    }
  };
  const isPureTextArea = !autoSize && !showCount && !allowClear;
  return /*#__PURE__*/_react.default.createElement(_input.BaseInput, {
    ref: holderRef,
    value: formatValue,
    allowClear: allowClear,
    handleReset: handleReset,
    suffix: suffixNode,
    prefixCls: prefixCls,
    classNames: {
      ...classNames,
      affixWrapper: (0, _clsx.clsx)(classNames?.affixWrapper, {
        [`${prefixCls}-show-count`]: showCount,
        [`${prefixCls}-textarea-allow-clear`]: allowClear
      })
    },
    disabled: disabled,
    focused: focused,
    className: (0, _clsx.clsx)(className, isOutOfRange && `${prefixCls}-out-of-range`),
    style: {
      ...style,
      ...(textareaResized && !isPureTextArea ? {
        height: 'auto'
      } : {})
    },
    dataAttrs: {
      affixWrapper: {
        'data-count': typeof dataCount === 'string' ? dataCount : undefined
      }
    },
    hidden: hidden,
    readOnly: readOnly,
    onClear: onClear
  }, /*#__PURE__*/_react.default.createElement(_ResizableTextArea.default, _extends({}, rest, {
    autoSize: autoSize,
    maxLength: maxLength,
    onKeyDown: handleKeyDown,
    onChange: onInternalChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onCompositionStart: onInternalCompositionStart,
    onCompositionEnd: onInternalCompositionEnd,
    className: (0, _clsx.clsx)(classNames?.textarea),
    style: {
      resize: style?.resize,
      ...styles?.textarea
    },
    disabled: disabled,
    prefixCls: prefixCls,
    onResize: handleResize,
    ref: resizableTextAreaRef,
    readOnly: readOnly
  })));
});
var _default = exports.default = TextArea;