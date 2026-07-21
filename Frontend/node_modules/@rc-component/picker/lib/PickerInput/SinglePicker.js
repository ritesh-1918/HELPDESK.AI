"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var React = _interopRequireWildcard(require("react"));
var _useToggleDates = _interopRequireDefault(require("../hooks/useToggleDates"));
var _PickerTrigger = _interopRequireDefault(require("../PickerTrigger"));
var _util2 = require("../PickerTrigger/util");
var _miscUtil = require("../utils/miscUtil");
var _context = _interopRequireDefault(require("./context"));
var _useCellRender = _interopRequireDefault(require("./hooks/useCellRender"));
var _useFieldsInvalidate3 = _interopRequireDefault(require("./hooks/useFieldsInvalidate"));
var _useFilledProps3 = _interopRequireDefault(require("./hooks/useFilledProps"));
var _useOpen3 = _interopRequireDefault(require("./hooks/useOpen"));
var _usePickerRef = _interopRequireDefault(require("./hooks/usePickerRef"));
var _usePresets = _interopRequireDefault(require("./hooks/usePresets"));
var _useRangeActive3 = _interopRequireDefault(require("./hooks/useRangeActive"));
var _useRangePickerValue3 = _interopRequireDefault(require("./hooks/useRangePickerValue"));
var _useRangeValue3 = _interopRequireWildcard(require("./hooks/useRangeValue"));
var _useShowNow = _interopRequireDefault(require("./hooks/useShowNow"));
var _Popup = _interopRequireDefault(require("./Popup"));
var _SingleSelector = _interopRequireDefault(require("./Selector/SingleSelector"));
var _useSemantic3 = _interopRequireDefault(require("../hooks/useSemantic"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// TODO: isInvalidateDate with showTime.disabledTime should not provide `range` prop

/** Internal usage. For cross function get same aligned props */

function Picker(props, ref) {
  // ========================= Prop =========================
  var _useFilledProps = (0, _useFilledProps3.default)(props),
    _useFilledProps2 = _slicedToArray(_useFilledProps, 6),
    filledProps = _useFilledProps2[0],
    internalPicker = _useFilledProps2[1],
    complexPicker = _useFilledProps2[2],
    formatList = _useFilledProps2[3],
    maskFormat = _useFilledProps2[4],
    isInvalidateDate = _useFilledProps2[5];
  var _ref = filledProps,
    prefixCls = _ref.prefixCls,
    rootClassName = _ref.rootClassName,
    propStyles = _ref.styles,
    propClassNames = _ref.classNames,
    previewValue = _ref.previewValue,
    order = _ref.order,
    defaultValue = _ref.defaultValue,
    value = _ref.value,
    needConfirm = _ref.needConfirm,
    onChange = _ref.onChange,
    onKeyDown = _ref.onKeyDown,
    disabled = _ref.disabled,
    disabledDate = _ref.disabledDate,
    minDate = _ref.minDate,
    maxDate = _ref.maxDate,
    defaultOpen = _ref.defaultOpen,
    open = _ref.open,
    onOpenChange = _ref.onOpenChange,
    locale = _ref.locale,
    generateConfig = _ref.generateConfig,
    picker = _ref.picker,
    showNow = _ref.showNow,
    showToday = _ref.showToday,
    showTime = _ref.showTime,
    mode = _ref.mode,
    onPanelChange = _ref.onPanelChange,
    onCalendarChange = _ref.onCalendarChange,
    onOk = _ref.onOk,
    multiple = _ref.multiple,
    defaultPickerValue = _ref.defaultPickerValue,
    pickerValue = _ref.pickerValue,
    onPickerValueChange = _ref.onPickerValueChange,
    inputReadOnly = _ref.inputReadOnly,
    suffixIcon = _ref.suffixIcon,
    removeIcon = _ref.removeIcon,
    onFocus = _ref.onFocus,
    onBlur = _ref.onBlur,
    presets = _ref.presets,
    components = _ref.components,
    cellRender = _ref.cellRender,
    dateRender = _ref.dateRender,
    monthCellRender = _ref.monthCellRender,
    onClick = _ref.onClick;

  // ========================= Refs =========================
  var selectorRef = (0, _usePickerRef.default)(ref);

  // ========================= Util =========================
  function pickerParam(values) {
    if (values === null) {
      return null;
    }
    return multiple ? values : values[0];
  }
  var toggleDates = (0, _useToggleDates.default)(generateConfig, locale, internalPicker);

  // ======================= Semantic =======================
  var _useSemantic = (0, _useSemantic3.default)(propClassNames, propStyles),
    _useSemantic2 = _slicedToArray(_useSemantic, 2),
    mergedClassNames = _useSemantic2[0],
    mergedStyles = _useSemantic2[1];

  // ========================= Open =========================
  var _useOpen = (0, _useOpen3.default)(open, defaultOpen, [disabled], onOpenChange),
    _useOpen2 = _slicedToArray(_useOpen, 2),
    mergedOpen = _useOpen2[0],
    triggerOpen = _useOpen2[1];

  // ======================= Calendar =======================
  var onInternalCalendarChange = function onInternalCalendarChange(dates, dateStrings, info) {
    if (onCalendarChange) {
      var filteredInfo = _objectSpread({}, info);
      delete filteredInfo.range;
      onCalendarChange(pickerParam(dates), pickerParam(dateStrings), filteredInfo);
    }
  };
  var onInternalOk = function onInternalOk(dates) {
    onOk === null || onOk === void 0 || onOk(pickerParam(dates));
  };

  // ======================== Values ========================
  var _useInnerValue = (0, _useRangeValue3.useInnerValue)(generateConfig, locale, formatList, false, order, defaultValue, value, onInternalCalendarChange, onInternalOk),
    _useInnerValue2 = _slicedToArray(_useInnerValue, 5),
    mergedValue = _useInnerValue2[0],
    setInnerValue = _useInnerValue2[1],
    getCalendarValue = _useInnerValue2[2],
    triggerCalendarChange = _useInnerValue2[3],
    triggerOk = _useInnerValue2[4];
  var calendarValue = getCalendarValue();

  // ======================== Active ========================
  // In SinglePicker, we will always get `activeIndex` is 0.
  var _useRangeActive = (0, _useRangeActive3.default)([disabled]),
    _useRangeActive2 = _slicedToArray(_useRangeActive, 4),
    focused = _useRangeActive2[0],
    triggerFocus = _useRangeActive2[1],
    lastOperation = _useRangeActive2[2],
    activeIndex = _useRangeActive2[3];
  var onSharedFocus = function onSharedFocus(event) {
    triggerFocus(true);
    onFocus === null || onFocus === void 0 || onFocus(event, {});
  };
  var onSharedBlur = function onSharedBlur(event) {
    triggerFocus(false);
    onBlur === null || onBlur === void 0 || onBlur(event, {});
  };

  // ========================= Mode =========================
  var _useControlledState = (0, _util.useControlledState)(picker, mode),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    mergedMode = _useControlledState2[0],
    setMode = _useControlledState2[1];

  /** Extends from `mergedMode` to patch `datetime` mode */
  var internalMode = mergedMode === 'date' && showTime ? 'datetime' : mergedMode;

  // ======================= Show Now =======================
  var mergedShowNow = (0, _useShowNow.default)(picker, mergedMode, showNow, showToday);

  // ======================== Value =========================
  var onInternalChange = onChange && function (dates, dateStrings) {
    onChange(pickerParam(dates), pickerParam(dateStrings));
  };
  var _useRangeValue = (0, _useRangeValue3.default)(_objectSpread(_objectSpread({}, filledProps), {}, {
      onChange: onInternalChange
    }), mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, [],
    //disabled,
    formatList, focused, mergedOpen, isInvalidateDate),
    _useRangeValue2 = _slicedToArray(_useRangeValue, 2),
    /** Trigger `onChange` directly without check `disabledDate` */
    triggerSubmitChange = _useRangeValue2[1];

  // ======================= Validate =======================
  var _useFieldsInvalidate = (0, _useFieldsInvalidate3.default)(calendarValue, isInvalidateDate),
    _useFieldsInvalidate2 = _slicedToArray(_useFieldsInvalidate, 2),
    submitInvalidates = _useFieldsInvalidate2[0],
    onSelectorInvalid = _useFieldsInvalidate2[1];
  var submitInvalidate = React.useMemo(function () {
    return submitInvalidates.some(function (invalidated) {
      return invalidated;
    });
  }, [submitInvalidates]);

  // ===================== Picker Value =====================
  // Proxy to single pickerValue
  var onInternalPickerValueChange = function onInternalPickerValueChange(dates, info) {
    if (onPickerValueChange) {
      var cleanInfo = _objectSpread(_objectSpread({}, info), {}, {
        mode: info.mode[0]
      });
      delete cleanInfo.range;
      onPickerValueChange(dates[0], cleanInfo);
    }
  };
  var _useRangePickerValue = (0, _useRangePickerValue3.default)(generateConfig, locale, calendarValue, [mergedMode], mergedOpen, activeIndex, internalPicker, false,
    // multiplePanel,
    defaultPickerValue, pickerValue, (0, _miscUtil.toArray)(showTime === null || showTime === void 0 ? void 0 : showTime.defaultOpenValue), onInternalPickerValueChange, minDate, maxDate),
    _useRangePickerValue2 = _slicedToArray(_useRangePickerValue, 2),
    currentPickerValue = _useRangePickerValue2[0],
    setCurrentPickerValue = _useRangePickerValue2[1];

  // >>> Mode need wait for `pickerValue`
  var triggerModeChange = (0, _util.useEvent)(function (nextPickerValue, nextMode, triggerEvent) {
    setMode(nextMode);

    // Compatible with `onPanelChange`
    if (onPanelChange && triggerEvent !== false) {
      var lastPickerValue = nextPickerValue || calendarValue[calendarValue.length - 1];
      onPanelChange(lastPickerValue, nextMode);
    }
  });

  // ======================== Submit ========================
  /**
   * Different with RangePicker, confirm should check `multiple` logic.
   * This will never provide `date` instead.
   */
  var triggerConfirm = function triggerConfirm() {
    triggerSubmitChange(getCalendarValue());
    triggerOpen(false, {
      force: true
    });
  };

  // ======================== Click =========================
  var onSelectorClick = function onSelectorClick(event) {
    if (!disabled && !selectorRef.current.nativeElement.contains(document.activeElement)) {
      // Click to focus the enabled input
      selectorRef.current.focus();
    }
    triggerOpen(true);
    onClick === null || onClick === void 0 || onClick(event);
  };
  var onSelectorClear = function onSelectorClear() {
    triggerSubmitChange(null);
    triggerOpen(false, {
      force: true
    });
  };

  // ======================== Hover =========================
  var _React$useState = React.useState(null),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    hoverSource = _React$useState2[0],
    setHoverSource = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    internalHoverValue = _React$useState4[0],
    setInternalHoverValue = _React$useState4[1];
  var hoverValues = React.useMemo(function () {
    var values = [internalHoverValue].concat(_toConsumableArray(calendarValue)).filter(function (date) {
      return date;
    });
    return multiple ? values : values.slice(0, 1);
  }, [calendarValue, internalHoverValue, multiple]);

  // Selector values is different with RangePicker
  // which can not use `hoverValue` directly
  var selectorValues = React.useMemo(function () {
    if (!multiple && internalHoverValue) {
      return [internalHoverValue];
    }
    return calendarValue.filter(function (date) {
      return date;
    });
  }, [calendarValue, internalHoverValue, multiple]);

  // Clean up `internalHoverValues` when closed
  React.useEffect(function () {
    if (!mergedOpen) {
      setInternalHoverValue(null);
    }
  }, [mergedOpen]);
  var onSetHover = function onSetHover(date, source) {
    if (previewValue !== 'hover') {
      return;
    }
    setInternalHoverValue(date);
    setHoverSource(source);
  };

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================
  // ======================= Presets ========================
  var presetList = (0, _usePresets.default)(presets);
  var onPresetHover = function onPresetHover(nextValue) {
    onSetHover(nextValue, 'preset');
  };

  // TODO: handle this
  var onPresetSubmit = function onPresetSubmit(nextValue) {
    var nextCalendarValues = multiple ? toggleDates(getCalendarValue(), nextValue) : [nextValue];
    var passed = triggerSubmitChange(nextCalendarValues);
    if (passed && !multiple) {
      triggerOpen(false, {
        force: true
      });
    }
  };
  var onNow = function onNow(now) {
    onPresetSubmit(now);
  };

  // ======================== Panel =========================
  var onPanelHover = function onPanelHover(date) {
    onSetHover(date, 'cell');
  };

  // >>> Focus
  var onPanelFocus = function onPanelFocus(event) {
    triggerOpen(true);
    onSharedFocus(event);
  };

  // >>> Calendar
  var onPanelSelect = function onPanelSelect(date) {
    lastOperation('panel');

    // Not change values if multiple and current panel is to match with picker
    if (multiple && internalMode !== picker) {
      return;
    }
    var nextValues = multiple ? toggleDates(getCalendarValue(), date) : [date];

    // Only trigger calendar event but not update internal `calendarValue` state
    triggerCalendarChange(nextValues);

    // >>> Trigger next active if !needConfirm
    // Fully logic check `useRangeValue` hook
    if (!needConfirm && !complexPicker && internalPicker === internalMode) {
      triggerConfirm();
    }
  };

  // >>> Close
  var onPopupClose = function onPopupClose() {
    // Close popup
    triggerOpen(false);
  };

  // >>> cellRender
  var onInternalCellRender = (0, _useCellRender.default)(cellRender, dateRender, monthCellRender);

  // >>> invalid

  var panelProps = React.useMemo(function () {
    var domProps = (0, _pickAttrs.default)(filledProps, false);
    var restProps = (0, _omit.default)(filledProps, [].concat(_toConsumableArray(Object.keys(domProps)), ['onChange', 'onCalendarChange', 'style', 'className', 'onPanelChange', 'classNames', 'styles']));
    return _objectSpread(_objectSpread({}, restProps), {}, {
      multiple: filledProps.multiple
    });
  }, [filledProps]);

  // >>> Render
  var panel = /*#__PURE__*/React.createElement(_Popup.default, _extends({}, panelProps, {
    showNow: mergedShowNow,
    showTime: showTime
    // Disabled
    ,
    disabledDate: disabledDate
    // Focus
    ,
    onFocus: onPanelFocus,
    onBlur: onSharedBlur
    // Mode
    ,
    picker: picker,
    mode: mergedMode,
    internalMode: internalMode,
    onPanelChange: triggerModeChange
    // Value
    ,
    format: maskFormat,
    value: calendarValue,
    isInvalid: isInvalidateDate,
    onChange: null,
    onSelect: onPanelSelect
    // PickerValue
    ,
    pickerValue: currentPickerValue,
    defaultOpenValue: showTime === null || showTime === void 0 ? void 0 : showTime.defaultOpenValue,
    onPickerValueChange: setCurrentPickerValue
    // Hover
    ,
    hoverValue: hoverValues,
    onHover: onPanelHover
    // Submit
    ,
    needConfirm: needConfirm,
    onSubmit: triggerConfirm,
    onOk: triggerOk
    // Preset
    ,
    presets: presetList,
    onPresetHover: onPresetHover,
    onPresetSubmit: onPresetSubmit,
    onNow: onNow
    // Render
    ,
    cellRender: onInternalCellRender
    // Styles
    ,
    classNames: mergedClassNames,
    styles: mergedStyles
  }));

  // ========================================================
  // ==                      Selector                      ==
  // ========================================================

  // ======================== Change ========================
  var onSelectorChange = function onSelectorChange(date) {
    triggerCalendarChange(date);
  };
  var onSelectorInputChange = function onSelectorInputChange() {
    lastOperation('input');
  };

  // ======================= Selector =======================
  var onSelectorFocus = function onSelectorFocus(event) {
    lastOperation('input');
    triggerOpen(true, {
      inherit: true
    });

    // setActiveIndex(index);

    onSharedFocus(event);
  };
  var onSelectorBlur = function onSelectorBlur(event) {
    triggerOpen(false);
    onSharedBlur(event);
  };
  var onSelectorKeyDown = function onSelectorKeyDown(event, preventDefault) {
    if (event.key === 'Tab') {
      triggerConfirm();
    }
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(event, preventDefault);
  };

  // ======================= Context ========================
  var context = React.useMemo(function () {
    return {
      prefixCls: prefixCls,
      locale: locale,
      generateConfig: generateConfig,
      button: components.button,
      input: components.input,
      classNames: mergedClassNames,
      styles: mergedStyles
    };
  }, [prefixCls, locale, generateConfig, components.button, components.input, mergedClassNames, mergedStyles]);

  // ======================== Effect ========================
  // >>> Mode
  // Reset for every active
  (0, _useLayoutEffect.default)(function () {
    if (mergedOpen && activeIndex !== undefined) {
      // Legacy compatible. This effect update should not trigger `onPanelChange`
      triggerModeChange(null, picker, false);
    }
  }, [mergedOpen, activeIndex, picker]);

  // >>> For complex picker, we need check if need to focus next one
  (0, _useLayoutEffect.default)(function () {
    var lastOp = lastOperation();

    // Trade as confirm on field leave
    if (!mergedOpen && lastOp === 'input') {
      triggerOpen(false);
      triggerConfirm();
    }

    // Submit with complex picker
    if (!mergedOpen && complexPicker && !needConfirm && lastOp === 'panel') {
      triggerConfirm();
    }
  }, [mergedOpen]);

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(_PickerTrigger.default, _extends({}, (0, _util2.pickTriggerProps)(filledProps), {
    popupElement: panel,
    popupStyle: mergedStyles.popup.root,
    popupClassName: (0, _clsx.clsx)(rootClassName, mergedClassNames.popup.root)
    // Visible
    ,
    visible: mergedOpen,
    onClose: onPopupClose
  }), /*#__PURE__*/React.createElement(_SingleSelector.default
  // Shared
  , _extends({}, filledProps, {
    // Ref
    ref: selectorRef
    // Style
    ,
    className: (0, _clsx.clsx)(filledProps.className, rootClassName, mergedClassNames.root),
    style: _objectSpread(_objectSpread({}, mergedStyles.root), filledProps.style)
    // Icon
    ,
    suffixIcon: suffixIcon,
    removeIcon: removeIcon
    // Active
    ,
    activeHelp: !!internalHoverValue,
    allHelp: !!internalHoverValue && hoverSource === 'preset',
    focused: focused,
    onFocus: onSelectorFocus,
    onBlur: onSelectorBlur,
    onKeyDown: onSelectorKeyDown,
    onSubmit: triggerConfirm
    // Change
    ,
    value: selectorValues,
    maskFormat: maskFormat,
    onChange: onSelectorChange,
    onInputChange: onSelectorInputChange,
    internalPicker: internalPicker
    // Format
    ,
    format: formatList,
    inputReadOnly: inputReadOnly
    // Disabled
    ,
    disabled: disabled
    // Open
    ,
    open: mergedOpen,
    onOpenChange: triggerOpen
    // Click
    ,
    onClick: onSelectorClick,
    onClear: onSelectorClear
    // Invalid
    ,
    invalid: submitInvalidate,
    onInvalid: function onInvalid(invalid) {
      // Only `single` mode support type date.
      // `multiple` mode can not typing.
      onSelectorInvalid(invalid, 0);
    }
  }))));
}
var RefPicker = /*#__PURE__*/React.forwardRef(Picker);
if (process.env.NODE_ENV !== 'production') {
  RefPicker.displayName = 'RefPicker';
}
var _default = exports.default = RefPicker;