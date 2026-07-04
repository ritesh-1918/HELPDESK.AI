"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _input = require("@rc-component/input");
var _textarea = _interopRequireDefault(require("@rc-component/textarea"));
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _react = _interopRequireWildcard(require("react"));
var _useEffectState = _interopRequireDefault(require("./hooks/useEffectState"));
var _KeywordTrigger = _interopRequireDefault(require("./KeywordTrigger"));
var _MentionsContext = _interopRequireDefault(require("./MentionsContext"));
var _Option = _interopRequireDefault(require("./Option"));
var _util = require("./util");
var _context = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const InternalMentions = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    // Style
    prefixCls,
    className,
    style,
    classNames: mentionClassNames,
    styles,
    // Misc
    prefix = '@',
    split = ' ',
    notFoundContent = 'Not Found',
    value,
    defaultValue,
    children,
    options,
    allowClear,
    hasWrapper,
    silent,
    // Events
    validateSearch = _util.validateSearch,
    filterOption = _util.filterOption,
    onChange,
    onKeyDown,
    onKeyUp,
    onPressEnter,
    onSearch,
    onSelect,
    onFocus,
    onBlur,
    // Dropdown
    transitionName,
    placement,
    direction,
    getPopupContainer,
    popupClassName,
    rows = 1,
    // Fix Warning: Received `false` for a non-boolean attribute `visible`.
    // https://github.com/ant-design/ant-design/blob/df933e94efc8f376003bbdc658d64b64a0e53495/components/mentions/demo/render-panel.tsx
    // @ts-expect-error
    visible,
    onPopupScroll,
    // Rest
    ...restProps
  } = props;
  const mergedPrefix = (0, _react.useMemo)(() => Array.isArray(prefix) ? prefix : [prefix], [prefix]);

  // =============================== Refs ===============================
  const containerRef = (0, _react.useRef)(null);
  const textareaRef = (0, _react.useRef)(null);
  const measureRef = (0, _react.useRef)(null);
  const getTextArea = () => textareaRef.current?.resizableTextArea?.textArea;
  _react.default.useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    textarea: textareaRef.current?.resizableTextArea?.textArea,
    nativeElement: containerRef.current
  }));

  // ============================== State ===============================
  const [measuring, setMeasuring] = (0, _react.useState)(false);
  const [measureText, setMeasureText] = (0, _react.useState)('');
  const [measurePrefix, setMeasurePrefix] = (0, _react.useState)('');
  const [measureLocation, setMeasureLocation] = (0, _react.useState)(0);
  const [activeIndex, setActiveIndex] = (0, _react.useState)(0);
  const [isFocus, setIsFocus] = (0, _react.useState)(false);

  // ================================ Id ================================
  const uniqueKey = (0, _useId.default)(props.id);

  // ============================== Value ===============================
  const [mergedValue, setMergedValue] = (0, _useControlledState.default)(defaultValue || '', value);

  // =============================== Open ===============================
  const {
    open
  } = (0, _react.useContext)(_context.UnstableContext);
  (0, _react.useEffect)(() => {
    // Sync measure div top with textarea for rc-trigger usage
    if (measuring && measureRef.current) {
      measureRef.current.scrollTop = getTextArea().scrollTop;
    }
  }, [measuring]);
  const [mergedMeasuring, mergedMeasureText, mergedMeasurePrefix, mergedMeasureLocation] = _react.default.useMemo(() => {
    if (open) {
      for (let i = 0; i < mergedPrefix.length; i += 1) {
        const curPrefix = mergedPrefix[i];
        const index = mergedValue.lastIndexOf(curPrefix);
        if (index >= 0) {
          return [true, '', curPrefix, index];
        }
      }
    }
    return [measuring, measureText, measurePrefix, measureLocation];
  }, [open, measuring, mergedPrefix, mergedValue, measureText, measurePrefix, measureLocation]);

  // ============================== Option ==============================
  const getOptions = _react.default.useCallback(targetMeasureText => {
    let list;
    if (options && options.length > 0) {
      list = options.map(item => ({
        ...item,
        key: `${item?.key ?? item.value}-${uniqueKey}`
      }));
    } else {
      list = (0, _toArray.default)(children).map(({
        props: optionProps,
        key
      }) => ({
        ...optionProps,
        label: optionProps.children,
        key: `${key || optionProps.value}-${uniqueKey}`
      }));
    }
    return list.filter(option => {
      /** Return all result if `filterOption` is false. */
      if (filterOption === false) {
        return true;
      }
      return filterOption(targetMeasureText, option);
    });
  }, [options, uniqueKey, children, filterOption]);
  const mergedOptions = _react.default.useMemo(() => getOptions(mergedMeasureText), [getOptions, mergedMeasureText]);

  // ============================= Measure ==============================
  // Mark that we will reset input selection to target position when user select option
  const onSelectionEffect = (0, _useEffectState.default)();
  const startMeasure = (nextMeasureText, nextMeasurePrefix, nextMeasureLocation) => {
    setMeasuring(true);
    setMeasureText(nextMeasureText);
    setMeasurePrefix(nextMeasurePrefix);
    setMeasureLocation(nextMeasureLocation);
    setActiveIndex(0);
  };
  const stopMeasure = callback => {
    setMeasuring(false);
    setMeasureLocation(0);
    setMeasureText('');
    onSelectionEffect(callback);
  };

  // ============================== Change ==============================
  const triggerChange = nextValue => {
    setMergedValue(nextValue);
    onChange?.(nextValue);
  };
  const onInternalChange = ({
    target: {
      value: nextValue
    }
  }) => {
    triggerChange(nextValue);
  };
  const selectOption = option => {
    const {
      value: mentionValue = ''
    } = option;
    const {
      text,
      selectionLocation
    } = (0, _util.replaceWithMeasure)(mergedValue, {
      measureLocation: mergedMeasureLocation,
      targetText: mentionValue,
      prefix: mergedMeasurePrefix,
      selectionStart: getTextArea()?.selectionStart,
      split
    });
    triggerChange(text);
    stopMeasure(() => {
      // We need restore the selection position
      (0, _util.setInputSelection)(getTextArea(), selectionLocation);
    });
    onSelect?.(option, mergedMeasurePrefix);
  };

  // ============================= KeyEvent =============================
  // Check if hit the measure keyword
  const onInternalKeyDown = event => {
    const {
      which
    } = event;
    onKeyDown?.(event);

    // Skip if not measuring
    if (!mergedMeasuring) {
      return;
    }
    if (which === _KeyCode.default.UP || which === _KeyCode.default.DOWN) {
      // Control arrow function
      const optionLen = mergedOptions.length;
      const offset = which === _KeyCode.default.UP ? -1 : 1;
      const newActiveIndex = (activeIndex + offset + optionLen) % optionLen;
      setActiveIndex(newActiveIndex);
      event.preventDefault();
    } else if (which === _KeyCode.default.ESC) {
      stopMeasure();
    } else if (which === _KeyCode.default.ENTER) {
      // Measure hit
      event.preventDefault();
      // loading skip
      if (silent) {
        return;
      }
      if (!mergedOptions.length) {
        stopMeasure();
        return;
      }
      const option = mergedOptions[activeIndex];
      selectOption(option);
    }
  };

  /**
   * When to start measure:
   * 1. When user press `prefix`
   * 2. When measureText !== prevMeasureText
   *  - If measure hit
   *  - If measuring
   *
   * When to stop measure:
   * 1. Selection is out of range
   * 2. Contains `space`
   * 3. ESC or select one
   */
  const onInternalKeyUp = event => {
    const {
      key,
      which
    } = event;
    const target = event.target;
    const selectionStartText = (0, _util.getBeforeSelectionText)(target);
    const {
      location: measureIndex,
      prefix: nextMeasurePrefix
    } = (0, _util.getLastMeasureIndex)(selectionStartText, mergedPrefix);

    // If the client implements an onKeyUp handler, call it
    onKeyUp?.(event);

    // Skip if match the white key list
    if ([_KeyCode.default.ESC, _KeyCode.default.UP, _KeyCode.default.DOWN, _KeyCode.default.ENTER].indexOf(which) !== -1) {
      return;
    }
    if (measureIndex !== -1) {
      const nextMeasureText = selectionStartText.slice(measureIndex + nextMeasurePrefix.length);
      const validateMeasure = validateSearch(nextMeasureText, split);
      const matchOption = !!getOptions(nextMeasureText).length;
      if (validateMeasure) {
        // adding AltGraph also fort azert keyboard
        if (key === nextMeasurePrefix || key === 'Shift' || which === _KeyCode.default.ALT || key === 'AltGraph' || mergedMeasuring || nextMeasureText !== mergedMeasureText && matchOption) {
          startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex);
        }
      } else if (mergedMeasuring) {
        // Stop if measureText is invalidate
        stopMeasure();
      }

      /**
       * We will trigger `onSearch` to developer since they may use for async update.
       * If met `space` means user finished searching.
       */
      if (onSearch && validateMeasure) {
        onSearch(nextMeasureText, nextMeasurePrefix);
      }
    } else if (mergedMeasuring) {
      stopMeasure();
    }
  };
  const onInternalPressEnter = event => {
    if (!mergedMeasuring && onPressEnter) {
      onPressEnter(event);
    }
  };

  // ============================ Focus Blur ============================
  const focusRef = (0, _react.useRef)();
  const onInternalFocus = event => {
    window.clearTimeout(focusRef.current);
    if (!isFocus && event && onFocus) {
      onFocus(event);
    }
    setIsFocus(true);
  };
  const onInternalBlur = event => {
    focusRef.current = window.setTimeout(() => {
      setIsFocus(false);
      stopMeasure();
      onBlur?.(event);
    }, 0);
  };
  const onDropdownFocus = () => {
    onInternalFocus();
  };
  const onDropdownBlur = () => {
    onInternalBlur();
  };

  // ============================== Scroll ===============================
  const onInternalPopupScroll = event => {
    onPopupScroll?.(event);
  };

  // ============================== Styles ==============================
  const mergedStyles = _react.default.useMemo(() => {
    const resizeStyle = styles?.textarea?.resize ?? style?.resize;
    const mergedTextareaStyle = {
      ...styles?.textarea
    };

    // Only add resize if it has a valid value, avoid setting undefined
    if (resizeStyle !== undefined) {
      mergedTextareaStyle.resize = resizeStyle;
    }
    return {
      ...styles,
      textarea: mergedTextareaStyle
    };
  }, [style, styles]);

  // ============================== Render ==============================

  const mentionNode = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_textarea.default, _extends({
    classNames: {
      textarea: mentionClassNames?.textarea
    }
    /**
     * Example:<Mentions style={{ resize: 'none' }} />.
     * If written this way, resizing here will become invalid.
     * The TextArea component code and found that the resize parameter in the style of the ResizeTextArea component is obtained from prop.style.
     * Just pass the resize attribute and leave everything else unchanged.
     */,
    styles: mergedStyles,
    ref: textareaRef,
    value: mergedValue
  }, restProps, {
    rows: rows,
    onChange: onInternalChange,
    onKeyDown: onInternalKeyDown,
    onKeyUp: onInternalKeyUp,
    onPressEnter: onInternalPressEnter,
    onFocus: onInternalFocus,
    onBlur: onInternalBlur
  })), mergedMeasuring && /*#__PURE__*/_react.default.createElement("div", {
    ref: measureRef,
    className: `${prefixCls}-measure`
  }, mergedValue.slice(0, mergedMeasureLocation), /*#__PURE__*/_react.default.createElement(_MentionsContext.default.Provider, {
    value: {
      notFoundContent,
      activeIndex,
      setActiveIndex,
      selectOption,
      onFocus: onDropdownFocus,
      onBlur: onDropdownBlur,
      onScroll: onInternalPopupScroll
    }
  }, /*#__PURE__*/_react.default.createElement(_KeywordTrigger.default, {
    prefixCls: prefixCls,
    transitionName: transitionName,
    placement: placement,
    direction: direction,
    options: mergedOptions,
    visible: true,
    getPopupContainer: getPopupContainer,
    popupClassName: (0, _clsx.clsx)(popupClassName, mentionClassNames?.popup),
    popupStyle: styles?.popup
  }, /*#__PURE__*/_react.default.createElement("span", null, mergedMeasurePrefix))), mergedValue.slice(mergedMeasureLocation + mergedMeasurePrefix.length)));
  if (!hasWrapper) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _clsx.clsx)(prefixCls, className),
      style: style,
      ref: containerRef
    }, mentionNode);
  }
  return mentionNode;
});
const Mentions = /*#__PURE__*/(0, _react.forwardRef)(({
  suffix,
  prefixCls = 'rc-mentions',
  defaultValue,
  value: customValue,
  id,
  allowClear,
  onChange,
  classNames: mentionsClassNames,
  styles,
  className,
  disabled,
  onClear,
  ...rest
}, ref) => {
  const hasSuffix = !!(suffix || allowClear);

  // =============================== Ref ================================
  const holderRef = (0, _react.useRef)(null);
  const mentionRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(ref, () => ({
    ...mentionRef.current,
    nativeElement: holderRef.current?.nativeElement || mentionRef.current?.nativeElement
  }));

  // ============================== Value ===============================
  const [mergedValue, setMergedValue] = (0, _useControlledState.default)(defaultValue || '', customValue);

  // ============================== Change ==============================
  const triggerChange = currentValue => {
    setMergedValue(currentValue);
    onChange?.(currentValue);
  };

  // ============================== Reset ===============================
  const handleReset = () => {
    triggerChange('');
  };
  return /*#__PURE__*/_react.default.createElement(_input.BaseInput, {
    suffix: suffix,
    prefixCls: prefixCls,
    value: mergedValue,
    allowClear: allowClear,
    handleReset: handleReset,
    className: (0, _clsx.clsx)(prefixCls, className, {
      // hasSuffix
      [`${prefixCls}-has-suffix`]: hasSuffix
    }),
    classNames: mentionsClassNames,
    disabled: disabled,
    ref: holderRef,
    onClear: onClear
  }, /*#__PURE__*/_react.default.createElement(InternalMentions, _extends({
    className: mentionsClassNames?.mentions,
    styles: styles,
    classNames: mentionsClassNames,
    prefixCls: prefixCls,
    id: id,
    ref: mentionRef,
    onChange: triggerChange,
    disabled: disabled,
    hasWrapper: hasSuffix
  }, rest)));
});
Mentions.Option = _Option.default;
var _default = exports.default = Mentions;