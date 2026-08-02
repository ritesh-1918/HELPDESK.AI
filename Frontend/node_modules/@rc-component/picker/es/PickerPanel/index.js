function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { clsx } from 'clsx';
import { useEvent, useControlledState, warning } from '@rc-component/util';
import * as React from 'react';
import useLocale from "../hooks/useLocale";
import { fillShowTimeConfig, getTimeProps } from "../hooks/useTimeConfig";
import useToggleDates from "../hooks/useToggleDates";
import PickerContext from "../PickerInput/context";
import useCellRender from "../PickerInput/hooks/useCellRender";
import { isSame } from "../utils/dateUtil";
import { pickProps, toArray } from "../utils/miscUtil";
import { PickerHackContext, SharedPanelContext } from "./context";
import DatePanel from "./DatePanel";
import DateTimePanel from "./DateTimePanel";
import DecadePanel from "./DecadePanel";
import MonthPanel from "./MonthPanel";
import QuarterPanel from "./QuarterPanel";
import TimePanel from "./TimePanel";
import WeekPanel from "./WeekPanel";
import YearPanel from "./YearPanel";
var DefaultComponents = {
  date: DatePanel,
  datetime: DateTimePanel,
  week: WeekPanel,
  month: MonthPanel,
  quarter: QuarterPanel,
  year: YearPanel,
  decade: DecadePanel,
  time: TimePanel
};
function PickerPanel(props, ref) {
  var panelClassNames = props.classNames,
    panelStyles = props.styles,
    locale = props.locale,
    generateConfig = props.generateConfig,
    direction = props.direction,
    prefixCls = props.prefixCls,
    _props$tabIndex = props.tabIndex,
    tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex,
    multiple = props.multiple,
    defaultValue = props.defaultValue,
    value = props.value,
    onChange = props.onChange,
    onSelect = props.onSelect,
    defaultPickerValue = props.defaultPickerValue,
    pickerValue = props.pickerValue,
    onPickerValueChange = props.onPickerValueChange,
    mode = props.mode,
    onPanelChange = props.onPanelChange,
    _props$picker = props.picker,
    picker = _props$picker === void 0 ? 'date' : _props$picker,
    showTime = props.showTime,
    hoverValue = props.hoverValue,
    hoverRangeValue = props.hoverRangeValue,
    cellRender = props.cellRender,
    dateRender = props.dateRender,
    monthCellRender = props.monthCellRender,
    _props$components = props.components,
    components = _props$components === void 0 ? {} : _props$components,
    hideHeader = props.hideHeader;

  // ======================== Context ========================
  var _ref = React.useContext(PickerContext) || {},
    contextPrefixCls = _ref.prefixCls,
    pickerClassNames = _ref.classNames,
    pickerStyles = _ref.styles;

  // ======================== prefixCls ========================
  var mergedPrefixCls = contextPrefixCls || prefixCls || 'rc-picker';

  // ========================== Refs ==========================
  var rootRef = React.useRef();
  React.useImperativeHandle(ref, function () {
    return {
      nativeElement: rootRef.current
    };
  });

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  var _getTimeProps = getTimeProps(props),
    _getTimeProps2 = _slicedToArray(_getTimeProps, 4),
    timeProps = _getTimeProps2[0],
    localeTimeProps = _getTimeProps2[1],
    showTimeFormat = _getTimeProps2[2],
    propFormat = _getTimeProps2[3];

  // ========================= Locale =========================
  var filledLocale = useLocale(locale, localeTimeProps);

  // ========================= Picker =========================
  var internalPicker = picker === 'date' && showTime ? 'datetime' : picker;

  // ======================== ShowTime ========================
  var mergedShowTime = React.useMemo(function () {
    return fillShowTimeConfig(internalPicker, showTimeFormat, propFormat, timeProps, filledLocale);
  }, [internalPicker, showTimeFormat, propFormat, timeProps, filledLocale]);

  // ========================== Now ===========================
  var now = generateConfig.getNow();

  // ========================== Mode ==========================
  var _useControlledState = useControlledState(picker || 'date', mode),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    mergedMode = _useControlledState2[0],
    setMergedMode = _useControlledState2[1];
  var internalMode = mergedMode === 'date' && mergedShowTime ? 'datetime' : mergedMode;

  // ========================= Toggle =========================
  var toggleDates = useToggleDates(generateConfig, locale, internalPicker);

  // ========================= Value ==========================
  // >>> Real value
  // Interactive with `onChange` event which only trigger when the `mode` is `picker`
  var _useControlledState3 = useControlledState(defaultValue, value),
    _useControlledState4 = _slicedToArray(_useControlledState3, 2),
    innerValue = _useControlledState4[0],
    setMergedValue = _useControlledState4[1];
  var mergedValue = React.useMemo(function () {
    // Clean up `[null]`
    var values = toArray(innerValue).filter(function (val) {
      return val;
    });
    return multiple ? values : values.slice(0, 1);
  }, [innerValue, multiple]);

  // Sync value and only trigger onChange event when changed
  var triggerChange = useEvent(function (nextValue) {
    setMergedValue(nextValue);
    if (onChange && (nextValue === null || mergedValue.length !== nextValue.length || mergedValue.some(function (ori, index) {
      return !isSame(generateConfig, locale, ori, nextValue[index], internalPicker);
    }))) {
      onChange === null || onChange === void 0 || onChange(multiple ? nextValue : nextValue[0]);
    }
  });

  // >>> CalendarValue
  // CalendarValue is a temp value for user operation
  // which will only trigger `onCalendarChange` but not `onChange`
  var onInternalSelect = useEvent(function (newDate) {
    onSelect === null || onSelect === void 0 || onSelect(newDate);
    if (mergedMode === picker) {
      var nextValues = multiple ? toggleDates(mergedValue, newDate) : [newDate];
      triggerChange(nextValues);
    }
  });

  // >>> PickerValue
  // PickerValue is used to control the current displaying panel
  var _useControlledState5 = useControlledState(defaultPickerValue || mergedValue[0] || now, pickerValue),
    _useControlledState6 = _slicedToArray(_useControlledState5, 2),
    mergedPickerValue = _useControlledState6[0],
    setInternalPickerValue = _useControlledState6[1];
  React.useEffect(function () {
    if (mergedValue[0] && !pickerValue) {
      setInternalPickerValue(mergedValue[0]);
    }
  }, [mergedValue[0]]);

  // Both trigger when manually pickerValue or mode change
  var triggerPanelChange = function triggerPanelChange(viewDate, nextMode) {
    onPanelChange === null || onPanelChange === void 0 || onPanelChange(viewDate || pickerValue, nextMode || mergedMode);
  };
  var setPickerValue = function setPickerValue(nextPickerValue) {
    var triggerPanelEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    setInternalPickerValue(nextPickerValue);
    onPickerValueChange === null || onPickerValueChange === void 0 || onPickerValueChange(nextPickerValue);
    if (triggerPanelEvent) {
      triggerPanelChange(nextPickerValue);
    }
  };
  var triggerModeChange = function triggerModeChange(nextMode, viewDate) {
    setMergedMode(nextMode);
    if (viewDate) {
      setPickerValue(viewDate);
    }
    triggerPanelChange(viewDate, nextMode);
  };
  var onPanelValueSelect = function onPanelValueSelect(nextValue) {
    onInternalSelect(nextValue);
    setPickerValue(nextValue);

    // Update mode if needed
    if (mergedMode !== picker) {
      var decadeYearQueue = ['decade', 'year'];
      var decadeYearMonthQueue = [].concat(decadeYearQueue, ['month']);
      var pickerQueue = {
        quarter: [].concat(decadeYearQueue, ['quarter']),
        week: [].concat(_toConsumableArray(decadeYearMonthQueue), ['week']),
        date: [].concat(_toConsumableArray(decadeYearMonthQueue), ['date'])
      };
      var queue = pickerQueue[picker] || decadeYearMonthQueue;
      var index = queue.indexOf(mergedMode);
      var nextMode = queue[index + 1];
      if (nextMode) {
        triggerModeChange(nextMode, nextValue);
      }
    }
  };

  // ======================= Hover Date =======================
  var hoverRangeDate = React.useMemo(function () {
    var start;
    var end;
    if (Array.isArray(hoverRangeValue)) {
      var _hoverRangeValue = _slicedToArray(hoverRangeValue, 2);
      start = _hoverRangeValue[0];
      end = _hoverRangeValue[1];
    } else {
      start = hoverRangeValue;
    }

    // Return for not exist
    if (!start && !end) {
      return null;
    }

    // Fill if has empty
    start = start || end;
    end = end || start;
    return generateConfig.isAfter(start, end) ? [end, start] : [start, end];
  }, [hoverRangeValue, generateConfig]);

  // ======================= Components =======================
  // >>> cellRender
  var onInternalCellRender = useCellRender(cellRender, dateRender, monthCellRender);

  // ======================= Components =======================
  var PanelComponent = components[internalMode] || DefaultComponents[internalMode] || DatePanel;

  // ======================== Context =========================
  var sharedPanelContext = React.useMemo(function () {
    var _ref2, _pickerClassNames$pop, _ref3, _pickerStyles$popup;
    return {
      classNames: (_ref2 = (_pickerClassNames$pop = pickerClassNames === null || pickerClassNames === void 0 ? void 0 : pickerClassNames.popup) !== null && _pickerClassNames$pop !== void 0 ? _pickerClassNames$pop : panelClassNames) !== null && _ref2 !== void 0 ? _ref2 : {},
      styles: (_ref3 = (_pickerStyles$popup = pickerStyles === null || pickerStyles === void 0 ? void 0 : pickerStyles.popup) !== null && _pickerStyles$popup !== void 0 ? _pickerStyles$popup : panelStyles) !== null && _ref3 !== void 0 ? _ref3 : {}
    };
  }, [pickerClassNames, panelClassNames, pickerStyles, panelStyles]);
  var parentHackContext = React.useContext(PickerHackContext);
  var pickerPanelContext = React.useMemo(function () {
    return _objectSpread(_objectSpread({}, parentHackContext), {}, {
      hideHeader: hideHeader
    });
  }, [parentHackContext, hideHeader]);

  // ======================== Warnings ========================
  if (process.env.NODE_ENV !== 'production') {
    warning(!mergedValue || mergedValue.every(function (val) {
      return generateConfig.isValidate(val);
    }), 'Invalidate date pass to `value` or `defaultValue`.');
  }

  // ========================= Render =========================
  var panelCls = "".concat(mergedPrefixCls, "-panel");
  var panelProps = pickProps(props, [
  // Week
  'showWeek',
  // Icons
  'prevIcon', 'nextIcon', 'superPrevIcon', 'superNextIcon',
  // Disabled
  'disabledDate', 'minDate', 'maxDate',
  // Hover
  'onHover']);
  return /*#__PURE__*/React.createElement(SharedPanelContext.Provider, {
    value: sharedPanelContext
  }, /*#__PURE__*/React.createElement(PickerHackContext.Provider, {
    value: pickerPanelContext
  }, /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    tabIndex: tabIndex,
    className: clsx(panelCls, _defineProperty({}, "".concat(panelCls, "-rtl"), direction === 'rtl'))
  }, /*#__PURE__*/React.createElement(PanelComponent, _extends({}, panelProps, {
    // Time
    showTime: mergedShowTime
    // MISC
    ,
    prefixCls: mergedPrefixCls,
    locale: filledLocale,
    generateConfig: generateConfig
    // Mode
    ,
    onModeChange: triggerModeChange
    // Value
    ,
    pickerValue: mergedPickerValue,
    onPickerValueChange: function onPickerValueChange(nextPickerValue) {
      setPickerValue(nextPickerValue, true);
    },
    value: mergedValue[0],
    onSelect: onPanelValueSelect,
    values: mergedValue
    // Render
    ,
    cellRender: onInternalCellRender
    // Hover
    ,
    hoverRangeValue: hoverRangeDate,
    hoverValue: hoverValue
  })))));
}
var RefPanelPicker = /*#__PURE__*/React.memo( /*#__PURE__*/React.forwardRef(PickerPanel));
if (process.env.NODE_ENV !== 'production') {
  RefPanelPicker.displayName = 'PanelPicker';
}

// Make support generic
export default RefPanelPicker;