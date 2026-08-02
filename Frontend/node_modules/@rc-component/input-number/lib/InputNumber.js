"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _miniDecimal = _interopRequireWildcard(require("@rc-component/mini-decimal"));
var _useLayoutEffect = require("@rc-component/util/lib/hooks/useLayoutEffect");
var _proxyObject = _interopRequireDefault(require("@rc-component/util/lib/proxyObject"));
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _useCursor = _interopRequireDefault(require("./hooks/useCursor"));
var _StepHandler = _interopRequireDefault(require("./StepHandler"));
var _numberUtil = require("./utils/numberUtil");
var _util = require("@rc-component/util");
var _focus = require("@rc-component/util/lib/Dom/focus");
var _useFrame = _interopRequireDefault(require("./hooks/useFrame"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/**
 * We support `stringMode` which need handle correct type when user call in onChange
 * format max or min value
 * 1. if isInvalid return null
 * 2. if precision is undefined, return decimal
 * 3. format with precision
 *    I. if max > 0, round down with precision. Example: max= 3.5, precision=0  afterFormat: 3
 *    II. if max < 0, round up with precision. Example: max= -3.5, precision=0  afterFormat: -4
 *    III. if min > 0, round up with precision. Example: min= 3.5, precision=0  afterFormat: 4
 *    IV. if min < 0, round down with precision. Example: max= -3.5, precision=0  afterFormat: -3
 */
const getDecimalValue = (stringMode, decimalValue) => {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString();
  }
  return decimalValue.toNumber();
};
const getDecimalIfValidate = value => {
  const decimal = (0, _miniDecimal.default)(value);
  return decimal.isInvalidate() ? null : decimal;
};
const InputNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    mode = 'input',
    prefixCls = 'rc-input-number',
    className,
    style,
    classNames,
    styles,
    min,
    max,
    step = 1,
    defaultValue,
    value,
    disabled,
    readOnly,
    upHandler,
    downHandler,
    keyboard,
    changeOnWheel = false,
    controls = true,
    prefix,
    suffix,
    stringMode,
    parser,
    formatter,
    precision,
    decimalSeparator,
    onChange,
    onInput,
    onPressEnter,
    onStep,
    // Mouse Events
    onMouseDown,
    onClick,
    onMouseUp,
    onMouseLeave,
    onMouseMove,
    onMouseEnter,
    onMouseOut,
    changeOnBlur = true,
    ...restProps
  } = props;
  const [focus, setFocus] = React.useState(false);
  const userTypingRef = React.useRef(false);
  const compositionRef = React.useRef(false);
  const shiftKeyRef = React.useRef(false);

  // ============================= Refs =============================
  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => (0, _proxyObject.default)(inputRef.current, {
    focus: option => {
      (0, _focus.triggerFocus)(inputRef.current, option);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    nativeElement: rootRef.current
  }));

  // ============================ Value =============================
  // Real value control
  const [decimalValue, setDecimalValue] = React.useState(() => (0, _miniDecimal.default)(value ?? defaultValue));
  function setUncontrolledDecimalValue(newDecimal) {
    if (value === undefined) {
      setDecimalValue(newDecimal);
    }
  }

  // ====================== Parser & Formatter ======================
  /**
   * `precision` is used for formatter & onChange.
   * It will auto generate by `value` & `step`.
   * But it will not block user typing.
   *
   * Note: Auto generate `precision` is used for legacy logic.
   * We should remove this since we already support high precision with BigInt.
   *
   * @param number  Provide which number should calculate precision
   * @param userTyping  Change by user typing
   */
  const getPrecision = React.useCallback((numStr, userTyping) => {
    if (userTyping) {
      return undefined;
    }
    if (precision >= 0) {
      return precision;
    }
    return Math.max((0, _miniDecimal.getNumberPrecision)(numStr), (0, _miniDecimal.getNumberPrecision)(step));
  }, [precision, step]);

  // >>> Parser
  const mergedParser = React.useCallback(num => {
    const numStr = String(num);
    if (parser) {
      return parser(numStr);
    }
    let parsedStr = numStr;
    if (decimalSeparator) {
      parsedStr = parsedStr.replace(decimalSeparator, '.');
    }

    // [Legacy] We still support auto convert `$ 123,456` to `123456`
    return parsedStr.replace(/[^\w.-]+/g, '');
  }, [parser, decimalSeparator]);

  // >>> Formatter
  const inputValueRef = React.useRef('');
  const mergedFormatter = React.useCallback((number, userTyping) => {
    if (formatter) {
      return formatter(number, {
        userTyping,
        input: String(inputValueRef.current)
      });
    }
    let str = typeof number === 'number' ? (0, _miniDecimal.num2str)(number) : number;

    // User typing will not auto format with precision directly
    if (!userTyping) {
      const mergedPrecision = getPrecision(str, userTyping);
      if ((0, _miniDecimal.validateNumber)(str) && (decimalSeparator || mergedPrecision >= 0)) {
        // Separator
        const separatorStr = decimalSeparator || '.';
        str = (0, _miniDecimal.toFixed)(str, separatorStr, mergedPrecision);
      }
    }
    return str;
  }, [formatter, getPrecision, decimalSeparator]);

  // ========================== InputValue ==========================
  /**
   * Input text value control
   *
   * User can not update input content directly. It updates with follow rules by priority:
   *  1. controlled `value` changed
   *    * [SPECIAL] Typing like `1.` should not immediately convert to `1`
   *  2. User typing with format (not precision)
   *  3. Blur or Enter trigger revalidate
   */
  const [inputValue, setInternalInputValue] = React.useState(() => {
    const initValue = defaultValue ?? value;
    if (decimalValue.isInvalidate() && ['string', 'number'].includes(typeof initValue)) {
      return Number.isNaN(initValue) ? '' : initValue;
    }
    return mergedFormatter(decimalValue.toString(), false);
  });
  inputValueRef.current = inputValue;

  // Should always be string
  function setInputValue(newValue, userTyping) {
    setInternalInputValue(mergedFormatter(
    // Invalidate number is sometime passed by external control, we should let it go
    // Otherwise is controlled by internal interactive logic which check by userTyping
    // You can ref 'show limited value when input is not focused' test for more info.
    newValue.isInvalidate() ? newValue.toString(false) : newValue.toString(!userTyping), userTyping));
  }

  // >>> Max & Min limit
  const maxDecimal = React.useMemo(() => getDecimalIfValidate(max), [max, precision]);
  const minDecimal = React.useMemo(() => getDecimalIfValidate(min), [min, precision]);
  const upDisabled = React.useMemo(() => {
    if (!maxDecimal || !decimalValue || decimalValue.isInvalidate()) {
      return false;
    }
    return maxDecimal.lessEquals(decimalValue);
  }, [maxDecimal, decimalValue]);
  const downDisabled = React.useMemo(() => {
    if (!minDecimal || !decimalValue || decimalValue.isInvalidate()) {
      return false;
    }
    return decimalValue.lessEquals(minDecimal);
  }, [minDecimal, decimalValue]);

  // Cursor controller
  const [recordCursor, restoreCursor] = (0, _useCursor.default)(inputRef.current, focus);

  // ============================= Data =============================
  /**
   * Find target value closet within range.
   * e.g. [11, 28]:
   *    3  => 11
   *    23 => 23
   *    99 => 28
   */
  const getRangeValue = target => {
    // target > max
    if (maxDecimal && !target.lessEquals(maxDecimal)) {
      return maxDecimal;
    }

    // target < min
    if (minDecimal && !minDecimal.lessEquals(target)) {
      return minDecimal;
    }
    return null;
  };

  /**
   * Check value is in [min, max] range
   */
  const isInRange = target => !getRangeValue(target);

  /**
   * Trigger `onChange` if value validated and not equals of origin.
   * Return the value that re-align in range.
   */
  const triggerValueUpdate = (newValue, userTyping) => {
    let updateValue = newValue;
    let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty();

    // Skip align value when trigger value is empty.
    // We just trigger onChange(null)
    // This should not block user typing
    if (!updateValue.isEmpty() && !userTyping) {
      // Revert value in range if needed
      updateValue = getRangeValue(updateValue) || updateValue;
      isRangeValidate = true;
    }
    if (!readOnly && !disabled && isRangeValidate) {
      const numStr = updateValue.toString();
      const mergedPrecision = getPrecision(numStr, userTyping);
      if (mergedPrecision >= 0) {
        updateValue = (0, _miniDecimal.default)((0, _miniDecimal.toFixed)(numStr, '.', mergedPrecision));

        // When to fixed. The value may out of min & max range.
        // 4 in [0, 3.8] => 3.8 => 4 (toFixed)
        if (!isInRange(updateValue)) {
          updateValue = (0, _miniDecimal.default)((0, _miniDecimal.toFixed)(numStr, '.', mergedPrecision, true));
        }
      }

      // Trigger event
      if (!updateValue.equals(decimalValue)) {
        setUncontrolledDecimalValue(updateValue);
        onChange?.(updateValue.isEmpty() ? null : getDecimalValue(stringMode, updateValue));

        // Reformat input if value is not controlled
        if (value === undefined) {
          setInputValue(updateValue, userTyping);
        }
      }
      return updateValue;
    }
    return decimalValue;
  };

  // ========================== User Input ==========================
  const onNextPromise = (0, _useFrame.default)();

  // >>> Collect input value
  const collectInputValue = inputStr => {
    recordCursor();

    // Update inputValue in case input can not parse as number
    // Refresh ref value immediately since it may used by formatter
    inputValueRef.current = inputStr;
    setInternalInputValue(inputStr);

    // Parse number
    if (!compositionRef.current) {
      const finalValue = mergedParser(inputStr);
      const finalDecimal = (0, _miniDecimal.default)(finalValue);
      if (!finalDecimal.isNaN()) {
        triggerValueUpdate(finalDecimal, true);
      }
    }

    // Trigger onInput later to let user customize value if they want to handle something after onChange
    onInput?.(inputStr);

    // optimize for chinese input experience
    // https://github.com/ant-design/ant-design/issues/8196
    onNextPromise(() => {
      let nextInputStr = inputStr;
      if (!parser) {
        nextInputStr = inputStr.replace(/。/g, '.');
      }
      if (nextInputStr !== inputStr) {
        collectInputValue(nextInputStr);
      }
    });
  };

  // >>> Composition
  const onCompositionStart = () => {
    compositionRef.current = true;
  };
  const onCompositionEnd = () => {
    compositionRef.current = false;
    collectInputValue(inputRef.current.value);
  };

  // >>> Input
  const onInternalInput = e => {
    collectInputValue(e.target.value);
  };

  // ============================= Step =============================
  const onInternalStep = (0, _util.useEvent)((up, emitter) => {
    // Ignore step since out of range
    if (up && upDisabled || !up && downDisabled) {
      return;
    }

    // Clear typing status since it may be caused by up & down key.
    // We should sync with input value.
    userTypingRef.current = false;
    let stepDecimal = (0, _miniDecimal.default)(shiftKeyRef.current ? (0, _numberUtil.getDecupleSteps)(step) : step);
    if (!up) {
      stepDecimal = stepDecimal.negate();
    }
    const target = (decimalValue || (0, _miniDecimal.default)(0)).add(stepDecimal.toString());
    const updatedValue = triggerValueUpdate(target, false);
    onStep?.(getDecimalValue(stringMode, updatedValue), {
      offset: shiftKeyRef.current ? (0, _numberUtil.getDecupleSteps)(step) : step,
      type: up ? 'up' : 'down',
      emitter
    });
    inputRef.current?.focus();
  });

  // ============================ Flush =============================
  /**
   * Flush current input content to trigger value change & re-formatter input if needed.
   * This will always flush input value for update.
   * If it's invalidate, will fallback to last validate value.
   */
  const flushInputValue = userTyping => {
    const parsedValue = (0, _miniDecimal.default)(mergedParser(inputValue));
    let formatValue;
    if (!parsedValue.isNaN()) {
      // Only validate value or empty value can be re-fill to inputValue
      // Reassign the formatValue within ranged of trigger control
      formatValue = triggerValueUpdate(parsedValue, userTyping);
    } else {
      formatValue = triggerValueUpdate(decimalValue, userTyping);
    }
    if (value !== undefined) {
      // Reset back with controlled value first
      setInputValue(decimalValue, false);
    } else if (!formatValue.isNaN()) {
      // Reset input back since no validate value
      setInputValue(formatValue, false);
    }
  };

  // Solve the issue of the event triggering sequence when entering numbers in chinese input (Safari)
  const onBeforeInput = () => {
    userTypingRef.current = true;
  };
  const onKeyDown = event => {
    const {
      key,
      shiftKey
    } = event;
    userTypingRef.current = true;
    shiftKeyRef.current = shiftKey;
    if (key === 'Enter') {
      if (!compositionRef.current) {
        userTypingRef.current = false;
      }
      flushInputValue(false);
      onPressEnter?.(event);
    }
    if (keyboard === false) {
      return;
    }

    // Do step
    if (!compositionRef.current && ['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)) {
      onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard');
      event.preventDefault();
    }
  };
  const onKeyUp = () => {
    userTypingRef.current = false;
    shiftKeyRef.current = false;
  };
  React.useEffect(() => {
    if (changeOnWheel && focus) {
      const onWheel = event => {
        // moving mouse wheel rises wheel event with deltaY < 0
        // scroll value grows from top to bottom, as screen Y coordinate
        onInternalStep(event.deltaY < 0, 'wheel');
        event.preventDefault();
      };
      const input = inputRef.current;
      if (input) {
        // React onWheel is passive and we can't preventDefault() in it.
        // That's why we should subscribe with DOM listener
        // https://stackoverflow.com/questions/63663025/react-onwheel-handler-cant-preventdefault-because-its-a-passive-event-listenev
        input.addEventListener('wheel', onWheel, {
          passive: false
        });
        return () => input.removeEventListener('wheel', onWheel);
      }
    }
  });

  // >>> Focus & Blur
  const onBlur = () => {
    if (changeOnBlur) {
      flushInputValue(false);
    }
    setFocus(false);
    userTypingRef.current = false;
  };

  // >>> Mouse events
  const onInternalMouseDown = event => {
    if (inputRef.current && event.target !== inputRef.current) {
      inputRef.current.focus();
      event.preventDefault();
    }
    onMouseDown?.(event);
  };

  // ========================== Controlled ==========================
  // Input by precision & formatter
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    if (!decimalValue.isInvalidate()) {
      setInputValue(decimalValue, false);
    }
  }, [precision, formatter]);

  // Input by value
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    const newValue = (0, _miniDecimal.default)(value);
    setDecimalValue(newValue);
    const currentParsedValue = (0, _miniDecimal.default)(mergedParser(inputValue));

    // When user typing from `1.2` to `1.`, we should not convert to `1` immediately.
    // But let it go if user set `formatter`
    if (!newValue.equals(currentParsedValue) || !userTypingRef.current || formatter) {
      // Update value as effect
      setInputValue(newValue, userTypingRef.current);
    }
  }, [value]);

  // ============================ Cursor ============================
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    if (formatter) {
      restoreCursor();
    }
  }, [inputValue]);

  // ============================ Render ============================
  // >>>>>> Handler
  const sharedHandlerProps = {
    prefixCls,
    onStep: onInternalStep,
    className: classNames?.action,
    style: styles?.action
  };
  const upNode = /*#__PURE__*/React.createElement(_StepHandler.default, _extends({}, sharedHandlerProps, {
    action: "up",
    disabled: upDisabled
  }), upHandler);
  const downNode = /*#__PURE__*/React.createElement(_StepHandler.default, _extends({}, sharedHandlerProps, {
    action: "down",
    disabled: downDisabled
  }), downHandler);

  // >>>>>> Render
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    className: (0, _clsx.clsx)(prefixCls, `${prefixCls}-mode-${mode}`, className, classNames?.root, {
      [`${prefixCls}-focused`]: focus,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-readonly`]: readOnly,
      [`${prefixCls}-not-a-number`]: decimalValue.isNaN(),
      [`${prefixCls}-out-of-range`]: !decimalValue.isInvalidate() && !isInRange(decimalValue)
    }),
    style: {
      ...styles?.root,
      ...style
    },
    onMouseDown: onInternalMouseDown,
    onMouseUp: onMouseUp,
    onMouseLeave: onMouseLeave,
    onMouseMove: onMouseMove,
    onMouseEnter: onMouseEnter,
    onMouseOut: onMouseOut,
    onClick: onClick,
    onFocus: () => {
      setFocus(true);
    },
    onBlur: onBlur,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp,
    onCompositionStart: onCompositionStart,
    onCompositionEnd: onCompositionEnd,
    onBeforeInput: onBeforeInput
  }, mode === 'spinner' && controls && downNode, prefix !== undefined && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-prefix`, classNames?.prefix),
    style: styles?.prefix
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    autoComplete: "off",
    role: "spinbutton",
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": decimalValue.isInvalidate() ? null : decimalValue.toString(),
    step: step,
    ref: inputRef,
    className: (0, _clsx.clsx)(`${prefixCls}-input`, classNames?.input),
    style: styles?.input,
    value: inputValue,
    onChange: onInternalInput,
    disabled: disabled,
    readOnly: readOnly
  }, restProps)), suffix !== undefined && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-suffix`, classNames?.suffix),
    style: styles?.suffix
  }, suffix), mode === 'spinner' && controls && upNode, mode === 'input' && controls && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, classNames?.actions),
    style: styles?.actions
  }, upNode, downNode));
});
if (process.env.NODE_ENV !== 'production') {
  InputNumber.displayName = 'InputNumber';
}
var _default = exports.default = InputNumber;