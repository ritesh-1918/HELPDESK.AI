function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
import { useEvent, useControlledState } from '@rc-component/util';
import { clsx } from 'clsx';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import omit from "@rc-component/util/es/omit";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import PickerTrigger from "../PickerTrigger";
import { pickTriggerProps } from "../PickerTrigger/util";
import { fillIndex, getFromDate, toArray } from "../utils/miscUtil";
import PickerContext from "./context";
import useCellRender from "./hooks/useCellRender";
import useFieldsInvalidate from "./hooks/useFieldsInvalidate";
import useFilledProps from "./hooks/useFilledProps";
import useOpen from "./hooks/useOpen";
import usePickerRef from "./hooks/usePickerRef";
import usePresets from "./hooks/usePresets";
import useRangeActive from "./hooks/useRangeActive";
import useRangeDisabledDate from "./hooks/useRangeDisabledDate";
import useRangePickerValue from "./hooks/useRangePickerValue";
import useRangeValue, { useInnerValue } from "./hooks/useRangeValue";
import useShowNow from "./hooks/useShowNow";
import Popup from "./Popup";
import RangeSelector from "./Selector/RangeSelector";
import useSemantic from "../hooks/useSemantic";
function separateConfig(config, defaultConfig) {
  var singleConfig = config !== null && config !== void 0 ? config : defaultConfig;
  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }
  return [singleConfig, singleConfig];
}

/** Used for change event, it should always be not undefined */

function getActiveRange(activeIndex) {
  return activeIndex === 1 ? 'end' : 'start';
}
function RangePicker(props, ref) {
  // ========================= Prop =========================
  var _useFilledProps = useFilledProps(props, function () {
      var disabled = props.disabled,
        allowEmpty = props.allowEmpty;
      var mergedDisabled = separateConfig(disabled, false);
      var mergedAllowEmpty = separateConfig(allowEmpty, false);
      return {
        disabled: mergedDisabled,
        allowEmpty: mergedAllowEmpty
      };
    }),
    _useFilledProps2 = _slicedToArray(_useFilledProps, 6),
    filledProps = _useFilledProps2[0],
    internalPicker = _useFilledProps2[1],
    complexPicker = _useFilledProps2[2],
    formatList = _useFilledProps2[3],
    maskFormat = _useFilledProps2[4],
    isInvalidateDate = _useFilledProps2[5];
  var prefixCls = filledProps.prefixCls,
    rootClassName = filledProps.rootClassName,
    propStyles = filledProps.styles,
    propClassNames = filledProps.classNames,
    previewValue = filledProps.previewValue,
    defaultValue = filledProps.defaultValue,
    value = filledProps.value,
    needConfirm = filledProps.needConfirm,
    onKeyDown = filledProps.onKeyDown,
    disabled = filledProps.disabled,
    allowEmpty = filledProps.allowEmpty,
    disabledDate = filledProps.disabledDate,
    minDate = filledProps.minDate,
    maxDate = filledProps.maxDate,
    defaultOpen = filledProps.defaultOpen,
    open = filledProps.open,
    onOpenChange = filledProps.onOpenChange,
    locale = filledProps.locale,
    generateConfig = filledProps.generateConfig,
    picker = filledProps.picker,
    showNow = filledProps.showNow,
    showToday = filledProps.showToday,
    showTime = filledProps.showTime,
    mode = filledProps.mode,
    onPanelChange = filledProps.onPanelChange,
    onCalendarChange = filledProps.onCalendarChange,
    onOk = filledProps.onOk,
    defaultPickerValue = filledProps.defaultPickerValue,
    pickerValue = filledProps.pickerValue,
    onPickerValueChange = filledProps.onPickerValueChange,
    inputReadOnly = filledProps.inputReadOnly,
    suffixIcon = filledProps.suffixIcon,
    onFocus = filledProps.onFocus,
    onBlur = filledProps.onBlur,
    presets = filledProps.presets,
    ranges = filledProps.ranges,
    components = filledProps.components,
    cellRender = filledProps.cellRender,
    dateRender = filledProps.dateRender,
    monthCellRender = filledProps.monthCellRender,
    onClick = filledProps.onClick;

  // ========================= Refs =========================
  var selectorRef = usePickerRef(ref);

  // ======================= Semantic =======================
  var _useSemantic = useSemantic(propClassNames, propStyles),
    _useSemantic2 = _slicedToArray(_useSemantic, 2),
    mergedClassNames = _useSemantic2[0],
    mergedStyles = _useSemantic2[1];

  // ========================= Open =========================
  var _useOpen = useOpen(open, defaultOpen, disabled, onOpenChange),
    _useOpen2 = _slicedToArray(_useOpen, 2),
    mergedOpen = _useOpen2[0],
    setMergeOpen = _useOpen2[1];
  var triggerOpen = function triggerOpen(nextOpen, config) {
    // No need to open if all disabled
    if (disabled.some(function (fieldDisabled) {
      return !fieldDisabled;
    }) || !nextOpen) {
      setMergeOpen(nextOpen, config);
    }
  };

  // ======================== Values ========================
  var _useInnerValue = useInnerValue(generateConfig, locale, formatList, true, false, defaultValue, value, onCalendarChange, onOk),
    _useInnerValue2 = _slicedToArray(_useInnerValue, 5),
    mergedValue = _useInnerValue2[0],
    setInnerValue = _useInnerValue2[1],
    getCalendarValue = _useInnerValue2[2],
    triggerCalendarChange = _useInnerValue2[3],
    triggerOk = _useInnerValue2[4];
  var calendarValue = getCalendarValue();

  // ======================== Active ========================
  var _useRangeActive = useRangeActive(disabled, allowEmpty, mergedOpen),
    _useRangeActive2 = _slicedToArray(_useRangeActive, 9),
    focused = _useRangeActive2[0],
    triggerFocus = _useRangeActive2[1],
    lastOperation = _useRangeActive2[2],
    activeIndex = _useRangeActive2[3],
    setActiveIndex = _useRangeActive2[4],
    nextActiveIndex = _useRangeActive2[5],
    activeIndexList = _useRangeActive2[6],
    updateSubmitIndex = _useRangeActive2[7],
    hasActiveSubmitValue = _useRangeActive2[8];
  var onSharedFocus = function onSharedFocus(event, index) {
    triggerFocus(true);
    onFocus === null || onFocus === void 0 || onFocus(event, {
      range: getActiveRange(index !== null && index !== void 0 ? index : activeIndex)
    });
  };
  var onSharedBlur = function onSharedBlur(event, index) {
    triggerFocus(false);
    onBlur === null || onBlur === void 0 || onBlur(event, {
      range: getActiveRange(index !== null && index !== void 0 ? index : activeIndex)
    });
  };

  // ======================= ShowTime =======================
  /** Used for Popup panel */
  var mergedShowTime = React.useMemo(function () {
    if (!showTime) {
      return null;
    }
    var disabledTime = showTime.disabledTime;
    var proxyDisabledTime = disabledTime ? function (date) {
      var range = getActiveRange(activeIndex);
      var fromDate = getFromDate(calendarValue, activeIndexList, activeIndex);
      return disabledTime(date, range, {
        from: fromDate
      });
    } : undefined;
    return _objectSpread(_objectSpread({}, showTime), {}, {
      disabledTime: proxyDisabledTime
    });
  }, [showTime, activeIndex, calendarValue, activeIndexList]);

  // ========================= Mode =========================
  var _useControlledState = useControlledState([picker, picker], mode),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    modes = _useControlledState2[0],
    setModes = _useControlledState2[1];
  var mergedMode = modes[activeIndex] || picker;

  /** Extends from `mergedMode` to patch `datetime` mode */
  var internalMode = mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  // ====================== PanelCount ======================
  var multiplePanel = internalMode === picker && internalMode !== 'time';

  // ======================= Show Now =======================
  var mergedShowNow = useShowNow(picker, mergedMode, showNow, showToday, true);

  // ======================== Value =========================
  var _useRangeValue = useRangeValue(filledProps, mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, disabled, formatList, focused, mergedOpen, isInvalidateDate),
    _useRangeValue2 = _slicedToArray(_useRangeValue, 2),
    /** Trigger `onChange` by check `disabledDate` */
    flushSubmit = _useRangeValue2[0],
    /** Trigger `onChange` directly without check `disabledDate` */
    triggerSubmitChange = _useRangeValue2[1];

  // ===================== DisabledDate =====================
  var mergedDisabledDate = useRangeDisabledDate(calendarValue, disabled, activeIndexList, generateConfig, locale, disabledDate);

  // ======================= Validate =======================
  var _useFieldsInvalidate = useFieldsInvalidate(calendarValue, isInvalidateDate, allowEmpty),
    _useFieldsInvalidate2 = _slicedToArray(_useFieldsInvalidate, 2),
    submitInvalidates = _useFieldsInvalidate2[0],
    onSelectorInvalid = _useFieldsInvalidate2[1];

  // ===================== Picker Value =====================
  var _useRangePickerValue = useRangePickerValue(generateConfig, locale, calendarValue, modes, mergedOpen, activeIndex, internalPicker, multiplePanel, defaultPickerValue, pickerValue, mergedShowTime === null || mergedShowTime === void 0 ? void 0 : mergedShowTime.defaultOpenValue, onPickerValueChange, minDate, maxDate),
    _useRangePickerValue2 = _slicedToArray(_useRangePickerValue, 2),
    currentPickerValue = _useRangePickerValue2[0],
    setCurrentPickerValue = _useRangePickerValue2[1];

  // >>> Mode need wait for `pickerValue`
  var triggerModeChange = useEvent(function (nextPickerValue, nextMode, triggerEvent) {
    var clone = fillIndex(modes, activeIndex, nextMode);
    if (clone[0] !== modes[0] || clone[1] !== modes[1]) {
      setModes(clone);
    }

    // Compatible with `onPanelChange`
    if (onPanelChange && triggerEvent !== false) {
      var clonePickerValue = _toConsumableArray(calendarValue);
      if (nextPickerValue) {
        clonePickerValue[activeIndex] = nextPickerValue;
      }
      onPanelChange(clonePickerValue, clone);
    }
  });

  // ======================== Change ========================
  var fillCalendarValue = function fillCalendarValue(date, index) {
    return (
      // Trigger change only when date changed
      fillIndex(calendarValue, index, date)
    );
  };

  // ======================== Submit ========================
  /**
   * Trigger by confirm operation.
   * This function has already handle the `needConfirm` check logic.
   * - Selector: enter key
   * - Panel: OK button
   */
  var triggerPartConfirm = function triggerPartConfirm(date, skipFocus) {
    var nextValue = calendarValue;
    if (date) {
      nextValue = fillCalendarValue(date, activeIndex);
    }
    updateSubmitIndex(activeIndex);
    // Get next focus index
    var nextIndex = nextActiveIndex(nextValue);

    // Change calendar value and tell flush it
    triggerCalendarChange(nextValue);
    flushSubmit(activeIndex, nextIndex === null);
    if (nextIndex === null) {
      triggerOpen(false, {
        force: true
      });
    } else if (!skipFocus) {
      selectorRef.current.focus({
        index: nextIndex
      });
    }
  };

  // ======================== Click =========================
  var onSelectorClick = function onSelectorClick(event) {
    var _activeElement;
    var rootNode = event.target.getRootNode();
    if (!selectorRef.current.nativeElement.contains((_activeElement = rootNode.activeElement) !== null && _activeElement !== void 0 ? _activeElement : document.activeElement)) {
      // Click to focus the enabled input
      var enabledIndex = disabled.findIndex(function (d) {
        return !d;
      });
      if (enabledIndex >= 0) {
        selectorRef.current.focus({
          index: enabledIndex
        });
      }
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
    internalHoverValues = _React$useState4[0],
    setInternalHoverValues = _React$useState4[1];
  var hoverValues = React.useMemo(function () {
    return internalHoverValues || calendarValue;
  }, [calendarValue, internalHoverValues]);

  // Clean up `internalHoverValues` when closed
  React.useEffect(function () {
    if (!mergedOpen) {
      setInternalHoverValues(null);
    }
  }, [mergedOpen]);

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================
  // Save the offset with active bar position
  // const [activeOffset, setActiveOffset] = React.useState(0);
  var _React$useState5 = React.useState([0, 0, 0]),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    activeInfo = _React$useState6[0],
    setActiveInfo = _React$useState6[1];
  var onSetHover = function onSetHover(date, source) {
    if (previewValue !== 'hover') {
      return;
    }
    setInternalHoverValues(date);
    setHoverSource(source);
  };

  // ======================= Presets ========================
  var presetList = usePresets(presets, ranges);
  var onPresetHover = function onPresetHover(nextValues) {
    onSetHover(nextValues, 'preset');
  };
  var onPresetSubmit = function onPresetSubmit(nextValues) {
    var passed = triggerSubmitChange(nextValues);
    if (passed) {
      triggerOpen(false, {
        force: true
      });
    }
  };
  var onNow = function onNow(now) {
    triggerPartConfirm(now);
  };

  // ======================== Panel =========================
  var onPanelHover = function onPanelHover(date) {
    onSetHover(date ? fillCalendarValue(date, activeIndex) : null, 'cell');
  };

  // >>> Focus
  var onPanelFocus = function onPanelFocus(event) {
    triggerOpen(true);
    onSharedFocus(event);
  };

  // >>> MouseDown
  var onPanelMouseDown = function onPanelMouseDown() {
    lastOperation('panel');
  };

  // >>> Calendar
  var onPanelSelect = function onPanelSelect(date) {
    var clone = fillIndex(calendarValue, activeIndex, date);

    // Only trigger calendar event but not update internal `calendarValue` state
    triggerCalendarChange(clone);

    // >>> Trigger next active if !needConfirm
    // Fully logic check `useRangeValue` hook
    if (!needConfirm && !complexPicker && internalPicker === internalMode) {
      triggerPartConfirm(date);
    }
  };

  // >>> Close
  var onPopupClose = function onPopupClose() {
    // Close popup
    triggerOpen(false);
  };

  // >>> cellRender
  var onInternalCellRender = useCellRender(cellRender, dateRender, monthCellRender, getActiveRange(activeIndex));

  // >>> Value
  var panelValue = calendarValue[activeIndex] || null;

  // >>> invalid
  var isPopupInvalidateDate = useEvent(function (date) {
    return isInvalidateDate(date, {
      activeIndex: activeIndex
    });
  });
  var panelProps = React.useMemo(function () {
    var domProps = pickAttrs(filledProps, false);
    var restProps = omit(filledProps, [].concat(_toConsumableArray(Object.keys(domProps)), ['onChange', 'onCalendarChange', 'style', 'className', 'onPanelChange', 'disabledTime', 'classNames', 'styles']));
    return restProps;
  }, [filledProps]);

  // >>> Render
  var panel = /*#__PURE__*/React.createElement(Popup, _extends({}, panelProps, {
    showNow: mergedShowNow,
    showTime: mergedShowTime
    // Range
    ,
    range: true,
    multiplePanel: multiplePanel,
    activeInfo: activeInfo
    // Disabled
    ,
    disabledDate: mergedDisabledDate
    // Focus
    ,
    onFocus: onPanelFocus,
    onBlur: onSharedBlur,
    onPanelMouseDown: onPanelMouseDown
    // Mode
    ,
    picker: picker,
    mode: mergedMode,
    internalMode: internalMode,
    onPanelChange: triggerModeChange
    // Value
    ,
    format: maskFormat,
    value: panelValue,
    isInvalid: isPopupInvalidateDate,
    onChange: null,
    onSelect: onPanelSelect
    // PickerValue
    ,
    pickerValue: currentPickerValue,
    defaultOpenValue: toArray(showTime === null || showTime === void 0 ? void 0 : showTime.defaultOpenValue)[activeIndex],
    onPickerValueChange: setCurrentPickerValue
    // Hover
    ,
    hoverValue: hoverValues,
    onHover: onPanelHover
    // Submit
    ,
    needConfirm: needConfirm,
    onSubmit: triggerPartConfirm,
    onOk: triggerOk
    // Preset
    ,
    presets: presetList,
    onPresetHover: onPresetHover,
    onPresetSubmit: onPresetSubmit
    // Now
    ,
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
  var onSelectorChange = function onSelectorChange(date, index) {
    var clone = fillCalendarValue(date, index);
    triggerCalendarChange(clone);
  };
  var onSelectorInputChange = function onSelectorInputChange() {
    lastOperation('input');
  };

  // ======================= Selector =======================
  var onSelectorFocus = function onSelectorFocus(event, index) {
    // Check if `needConfirm` but user not submit yet
    var activeListLen = activeIndexList.length;
    var lastActiveIndex = activeIndexList[activeListLen - 1];
    if (activeListLen && lastActiveIndex !== index && needConfirm &&
    // Not change index if is not filled
    !allowEmpty[lastActiveIndex] && !hasActiveSubmitValue(lastActiveIndex) && calendarValue[lastActiveIndex]) {
      selectorRef.current.focus({
        index: lastActiveIndex
      });
      return;
    }
    lastOperation('input');
    triggerOpen(true, {
      inherit: true
    });

    // When click input to switch the field, it will not trigger close.
    // Which means it will lose the part confirm and we need fill back.
    // ref: https://github.com/ant-design/ant-design/issues/49512
    if (activeIndex !== index && mergedOpen && !needConfirm && complexPicker) {
      triggerPartConfirm(null, true);
    }
    setActiveIndex(index);
    onSharedFocus(event, index);
  };
  var onSelectorBlur = function onSelectorBlur(event, index) {
    triggerOpen(false);
    if (!needConfirm && lastOperation() === 'input') {
      var nextIndex = nextActiveIndex(calendarValue);
      flushSubmit(activeIndex, nextIndex === null);
    }
    onSharedBlur(event, index);
  };
  var onSelectorKeyDown = function onSelectorKeyDown(event, preventDefault) {
    if (event.key === 'Tab') {
      triggerPartConfirm(null, true);
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
  useLayoutEffect(function () {
    if (mergedOpen && activeIndex !== undefined) {
      // Legacy compatible. This effect update should not trigger `onPanelChange`
      triggerModeChange(null, picker, false);
    }
  }, [mergedOpen, activeIndex, picker]);

  // >>> For complex picker, we need check if need to focus next one
  useLayoutEffect(function () {
    var lastOp = lastOperation();

    // Trade as confirm on field leave
    if (!mergedOpen && lastOp === 'input') {
      triggerOpen(false);
      triggerPartConfirm(null, true);
    }

    // Submit with complex picker
    if (!mergedOpen && complexPicker && !needConfirm && lastOp === 'panel') {
      triggerOpen(true);
      triggerPartConfirm();
    }
  }, [mergedOpen]);

  // ====================== DevWarning ======================
  if (process.env.NODE_ENV !== 'production') {
    var isIndexEmpty = function isIndexEmpty(index) {
      return (
        // Value is empty
        !(value !== null && value !== void 0 && value[index]) &&
        // DefaultValue is empty
        !(defaultValue !== null && defaultValue !== void 0 && defaultValue[index])
      );
    };
    if (disabled.some(function (fieldDisabled, index) {
      return fieldDisabled && isIndexEmpty(index) && !allowEmpty[index];
    })) {
      warning(false, '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.');
    }
  }

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(PickerContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(PickerTrigger, _extends({}, pickTriggerProps(filledProps), {
    popupElement: panel,
    popupStyle: mergedStyles.popup.root,
    popupClassName: clsx(rootClassName, mergedClassNames.popup.root)
    // Visible
    ,
    visible: mergedOpen,
    onClose: onPopupClose
    // Range
    ,
    range: true
  }), /*#__PURE__*/React.createElement(RangeSelector
  // Shared
  , _extends({}, filledProps, {
    // Ref
    ref: selectorRef
    // Style
    ,
    className: clsx(filledProps.className, rootClassName, mergedClassNames.root),
    style: _objectSpread(_objectSpread({}, mergedStyles.root), filledProps.style)
    // Icon
    ,
    suffixIcon: suffixIcon
    // Active
    ,
    activeIndex: focused || mergedOpen ? activeIndex : null,
    activeHelp: !!internalHoverValues,
    allHelp: !!internalHoverValues && hoverSource === 'preset',
    focused: focused,
    onFocus: onSelectorFocus,
    onBlur: onSelectorBlur,
    onKeyDown: onSelectorKeyDown,
    onSubmit: triggerPartConfirm
    // Change
    ,
    value: hoverValues,
    maskFormat: maskFormat,
    onChange: onSelectorChange,
    onInputChange: onSelectorInputChange
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
    invalid: submitInvalidates,
    onInvalid: onSelectorInvalid
    // Offset
    ,
    onActiveInfo: setActiveInfo
  }))));
}
var RefRangePicker = /*#__PURE__*/React.forwardRef(RangePicker);
if (process.env.NODE_ENV !== 'production') {
  RefRangePicker.displayName = 'RefRangePicker';
}
export default RefRangePicker;