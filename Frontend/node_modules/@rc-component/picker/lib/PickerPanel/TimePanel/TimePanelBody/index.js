"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TimePanelBody;
var React = _interopRequireWildcard(require("react"));
var _useTimeInfo3 = _interopRequireDefault(require("../../../hooks/useTimeInfo"));
var _dateUtil = require("../../../utils/dateUtil");
var _context = require("../../context");
var _TimeColumn = _interopRequireDefault(require("./TimeColumn"));
var _clsx = require("clsx");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function isAM(hour) {
  return hour < 12;
}
function TimePanelBody(props) {
  var showHour = props.showHour,
    showMinute = props.showMinute,
    showSecond = props.showSecond,
    showMillisecond = props.showMillisecond,
    showMeridiem = props.use12Hours,
    changeOnScroll = props.changeOnScroll;
  var _usePanelContext = (0, _context.usePanelContext)(),
    prefixCls = _usePanelContext.prefixCls,
    classNames = _usePanelContext.classNames,
    styles = _usePanelContext.styles,
    values = _usePanelContext.values,
    generateConfig = _usePanelContext.generateConfig,
    locale = _usePanelContext.locale,
    onSelect = _usePanelContext.onSelect,
    _usePanelContext$onHo = _usePanelContext.onHover,
    onHover = _usePanelContext$onHo === void 0 ? function () {} : _usePanelContext$onHo,
    pickerValue = _usePanelContext.pickerValue;
  var value = (values === null || values === void 0 ? void 0 : values[0]) || null;
  var _React$useContext = React.useContext(_context.PickerHackContext),
    onCellDblClick = _React$useContext.onCellDblClick;

  // ========================== Info ==========================
  var _useTimeInfo = (0, _useTimeInfo3.default)(generateConfig, props, value),
    _useTimeInfo2 = _slicedToArray(_useTimeInfo, 5),
    getValidTime = _useTimeInfo2[0],
    rowHourUnits = _useTimeInfo2[1],
    getMinuteUnits = _useTimeInfo2[2],
    getSecondUnits = _useTimeInfo2[3],
    getMillisecondUnits = _useTimeInfo2[4];

  // ========================= Value ==========================
  // PickerValue will tell which one to align on the top
  var getUnitValue = function getUnitValue(func) {
    var valueUnitVal = value && generateConfig[func](value);
    var pickerUnitValue = pickerValue && generateConfig[func](pickerValue);
    return [valueUnitVal, pickerUnitValue];
  };
  var _getUnitValue = getUnitValue('getHour'),
    _getUnitValue2 = _slicedToArray(_getUnitValue, 2),
    hour = _getUnitValue2[0],
    pickerHour = _getUnitValue2[1];
  var _getUnitValue3 = getUnitValue('getMinute'),
    _getUnitValue4 = _slicedToArray(_getUnitValue3, 2),
    minute = _getUnitValue4[0],
    pickerMinute = _getUnitValue4[1];
  var _getUnitValue5 = getUnitValue('getSecond'),
    _getUnitValue6 = _slicedToArray(_getUnitValue5, 2),
    second = _getUnitValue6[0],
    pickerSecond = _getUnitValue6[1];
  var _getUnitValue7 = getUnitValue('getMillisecond'),
    _getUnitValue8 = _slicedToArray(_getUnitValue7, 2),
    millisecond = _getUnitValue8[0],
    pickerMillisecond = _getUnitValue8[1];
  var meridiem = hour === null ? null : isAM(hour) ? 'am' : 'pm';

  // ========================= Column =========================
  // Hours
  var hourUnits = React.useMemo(function () {
    if (!showMeridiem) {
      return rowHourUnits;
    }
    return isAM(hour) ? rowHourUnits.filter(function (h) {
      return isAM(h.value);
    }) : rowHourUnits.filter(function (h) {
      return !isAM(h.value);
    });
  }, [hour, rowHourUnits, showMeridiem]);

  // >>> Pick Fallback
  var getEnabled = function getEnabled(units, val) {
    var _enabledUnits$;
    var enabledUnits = units.filter(function (unit) {
      return !unit.disabled;
    });
    return val !== null && val !== void 0 ? val : // Fallback to enabled value
    enabledUnits === null || enabledUnits === void 0 || (_enabledUnits$ = enabledUnits[0]) === null || _enabledUnits$ === void 0 ? void 0 : _enabledUnits$.value;
  };

  // >>> Minutes
  var validHour = getEnabled(rowHourUnits, hour);
  var minuteUnits = React.useMemo(function () {
    return getMinuteUnits(validHour);
  }, [getMinuteUnits, validHour]);

  // >>> Seconds
  var validMinute = getEnabled(minuteUnits, minute);
  var secondUnits = React.useMemo(function () {
    return getSecondUnits(validHour, validMinute);
  }, [getSecondUnits, validHour, validMinute]);

  // >>> Milliseconds
  var validSecond = getEnabled(secondUnits, second);
  var millisecondUnits = React.useMemo(function () {
    return getMillisecondUnits(validHour, validMinute, validSecond);
  }, [getMillisecondUnits, validHour, validMinute, validSecond]);
  var validMillisecond = getEnabled(millisecondUnits, millisecond);

  // Meridiem
  var meridiemUnits = React.useMemo(function () {
    if (!showMeridiem) {
      return [];
    }
    var base = generateConfig.getNow();
    var amDate = generateConfig.setHour(base, 6);
    var pmDate = generateConfig.setHour(base, 18);
    var formatMeridiem = function formatMeridiem(date, defaultLabel) {
      var cellMeridiemFormat = locale.cellMeridiemFormat;
      return cellMeridiemFormat ? (0, _dateUtil.formatValue)(date, {
        generateConfig: generateConfig,
        locale: locale,
        format: cellMeridiemFormat
      }) : defaultLabel;
    };
    return [{
      label: formatMeridiem(amDate, 'AM'),
      value: 'am',
      disabled: rowHourUnits.every(function (h) {
        return h.disabled || !isAM(h.value);
      })
    }, {
      label: formatMeridiem(pmDate, 'PM'),
      value: 'pm',
      disabled: rowHourUnits.every(function (h) {
        return h.disabled || isAM(h.value);
      })
    }];
  }, [rowHourUnits, showMeridiem, generateConfig, locale]);

  // ========================= Change =========================
  /**
   * Check if time is validate or will match to validate one
   */
  var triggerChange = function triggerChange(nextDate) {
    var validateDate = getValidTime(nextDate);
    onSelect(validateDate);
  };

  // ========================= Column =========================
  // Create a template date for the trigger change event
  var triggerDateTmpl = React.useMemo(function () {
    var tmpl = value || pickerValue || generateConfig.getNow();
    var isNotNull = function isNotNull(num) {
      return num !== null && num !== undefined;
    };
    if (isNotNull(hour)) {
      tmpl = generateConfig.setHour(tmpl, hour);
      tmpl = generateConfig.setMinute(tmpl, minute);
      tmpl = generateConfig.setSecond(tmpl, second);
      tmpl = generateConfig.setMillisecond(tmpl, millisecond);
    } else if (isNotNull(pickerHour)) {
      tmpl = generateConfig.setHour(tmpl, pickerHour);
      tmpl = generateConfig.setMinute(tmpl, pickerMinute);
      tmpl = generateConfig.setSecond(tmpl, pickerSecond);
      tmpl = generateConfig.setMillisecond(tmpl, pickerMillisecond);
    } else if (isNotNull(validHour)) {
      tmpl = generateConfig.setHour(tmpl, validHour);
      tmpl = generateConfig.setMinute(tmpl, validMinute);
      tmpl = generateConfig.setSecond(tmpl, validSecond);
      tmpl = generateConfig.setMillisecond(tmpl, validMillisecond);
    }
    return tmpl;
  }, [value, pickerValue, hour, minute, second, millisecond, validHour, validMinute, validSecond, validMillisecond, pickerHour, pickerMinute, pickerSecond, pickerMillisecond, generateConfig]);

  // ===================== Columns Change =====================
  var fillColumnValue = function fillColumnValue(val, func) {
    if (val === null) {
      return null;
    }
    return generateConfig[func](triggerDateTmpl, val);
  };
  var getNextHourTime = function getNextHourTime(val) {
    return fillColumnValue(val, 'setHour');
  };
  var getNextMinuteTime = function getNextMinuteTime(val) {
    return fillColumnValue(val, 'setMinute');
  };
  var getNextSecondTime = function getNextSecondTime(val) {
    return fillColumnValue(val, 'setSecond');
  };
  var getNextMillisecondTime = function getNextMillisecondTime(val) {
    return fillColumnValue(val, 'setMillisecond');
  };
  var getMeridiemTime = function getMeridiemTime(val) {
    if (val === null) {
      return null;
    }
    if (val === 'am' && !isAM(hour)) {
      return generateConfig.setHour(triggerDateTmpl, hour - 12);
    } else if (val === 'pm' && isAM(hour)) {
      return generateConfig.setHour(triggerDateTmpl, hour + 12);
    }
    return triggerDateTmpl;
  };
  var onHourChange = function onHourChange(val) {
    triggerChange(getNextHourTime(val));
  };
  var onMinuteChange = function onMinuteChange(val) {
    triggerChange(getNextMinuteTime(val));
  };
  var onSecondChange = function onSecondChange(val) {
    triggerChange(getNextSecondTime(val));
  };
  var onMillisecondChange = function onMillisecondChange(val) {
    triggerChange(getNextMillisecondTime(val));
  };
  var onMeridiemChange = function onMeridiemChange(val) {
    triggerChange(getMeridiemTime(val));
  };

  // ====================== Column Hover ======================
  var onHourHover = function onHourHover(val) {
    onHover(getNextHourTime(val));
  };
  var onMinuteHover = function onMinuteHover(val) {
    onHover(getNextMinuteTime(val));
  };
  var onSecondHover = function onSecondHover(val) {
    onHover(getNextSecondTime(val));
  };
  var onMillisecondHover = function onMillisecondHover(val) {
    onHover(getNextMillisecondTime(val));
  };
  var onMeridiemHover = function onMeridiemHover(val) {
    onHover(getMeridiemTime(val));
  };

  // ========================= Render =========================
  var sharedColumnProps = {
    onDblClick: onCellDblClick,
    changeOnScroll: changeOnScroll
  };
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)("".concat(prefixCls, "-content"), classNames.content),
    style: styles.content
  }, showHour && /*#__PURE__*/React.createElement(_TimeColumn.default, _extends({
    units: hourUnits,
    value: hour,
    optionalValue: pickerHour,
    type: "hour",
    onChange: onHourChange,
    onHover: onHourHover
  }, sharedColumnProps)), showMinute && /*#__PURE__*/React.createElement(_TimeColumn.default, _extends({
    units: minuteUnits,
    value: minute,
    optionalValue: pickerMinute,
    type: "minute",
    onChange: onMinuteChange,
    onHover: onMinuteHover
  }, sharedColumnProps)), showSecond && /*#__PURE__*/React.createElement(_TimeColumn.default, _extends({
    units: secondUnits,
    value: second,
    optionalValue: pickerSecond,
    type: "second",
    onChange: onSecondChange,
    onHover: onSecondHover
  }, sharedColumnProps)), showMillisecond && /*#__PURE__*/React.createElement(_TimeColumn.default, _extends({
    units: millisecondUnits,
    value: millisecond,
    optionalValue: pickerMillisecond,
    type: "millisecond",
    onChange: onMillisecondChange,
    onHover: onMillisecondHover
  }, sharedColumnProps)), showMeridiem && /*#__PURE__*/React.createElement(_TimeColumn.default, _extends({
    units: meridiemUnits,
    value: meridiem,
    type: "meridiem",
    onChange: onMeridiemChange,
    onHover: onMeridiemHover
  }, sharedColumnProps)));
}