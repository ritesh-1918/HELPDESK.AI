function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { clsx } from 'clsx';
import * as React from 'react';
import { formatValue, getWeekStartDate, isSameDate, isSameMonth, WEEK_DAY_COUNT } from "../../utils/dateUtil";
import { PanelContext, useInfo } from "../context";
import PanelBody from "../PanelBody";
import PanelHeader from "../PanelHeader";
export default function DatePanel(props) {
  var prefixCls = props.prefixCls,
    _props$panelName = props.panelName,
    panelName = _props$panelName === void 0 ? 'date' : _props$panelName,
    locale = props.locale,
    generateConfig = props.generateConfig,
    pickerValue = props.pickerValue,
    onPickerValueChange = props.onPickerValueChange,
    onModeChange = props.onModeChange,
    _props$mode = props.mode,
    mode = _props$mode === void 0 ? 'date' : _props$mode,
    disabledDate = props.disabledDate,
    onSelect = props.onSelect,
    onHover = props.onHover,
    showWeek = props.showWeek;
  var panelPrefixCls = "".concat(prefixCls, "-").concat(panelName, "-panel");
  var cellPrefixCls = "".concat(prefixCls, "-cell");
  var isWeek = mode === 'week';

  // ========================== Base ==========================
  var _useInfo = useInfo(props, mode),
    _useInfo2 = _slicedToArray(_useInfo, 2),
    info = _useInfo2[0],
    now = _useInfo2[1];
  var weekFirstDay = generateConfig.locale.getWeekFirstDay(locale.locale);
  var monthStartDate = generateConfig.setDate(pickerValue, 1);
  var baseDate = getWeekStartDate(locale.locale, generateConfig, monthStartDate);
  var month = generateConfig.getMonth(pickerValue);

  // =========================== PrefixColumn ===========================
  var showPrefixColumn = showWeek === undefined ? isWeek : showWeek;
  var prefixColumn = showPrefixColumn ? function (date) {
    // >>> Additional check for disabled
    var disabled = disabledDate === null || disabledDate === void 0 ? void 0 : disabledDate(date, {
      type: 'week'
    });
    return /*#__PURE__*/React.createElement("td", {
      key: "week",
      className: clsx(cellPrefixCls, "".concat(cellPrefixCls, "-week"), _defineProperty({}, "".concat(cellPrefixCls, "-disabled"), disabled))
      // Operation: Same as code in PanelBody
      ,
      onClick: function onClick() {
        if (!disabled) {
          onSelect(date);
        }
      },
      onMouseEnter: function onMouseEnter() {
        if (!disabled) {
          onHover === null || onHover === void 0 || onHover(date);
        }
      },
      onMouseLeave: function onMouseLeave() {
        if (!disabled) {
          onHover === null || onHover === void 0 || onHover(null);
        }
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "".concat(cellPrefixCls, "-inner")
    }, generateConfig.locale.getWeek(locale.locale, date)));
  } : null;

  // ========================= Cells ==========================
  // >>> Header Cells
  var headerCells = [];
  var weekDaysLocale = locale.shortWeekDays || (generateConfig.locale.getShortWeekDays ? generateConfig.locale.getShortWeekDays(locale.locale) : []);
  if (prefixColumn) {
    headerCells.push( /*#__PURE__*/React.createElement("th", {
      key: "empty"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 0,
        height: 0,
        position: 'absolute',
        overflow: 'hidden',
        opacity: 0
      }
    }, locale.week)));
  }
  for (var i = 0; i < WEEK_DAY_COUNT; i += 1) {
    headerCells.push( /*#__PURE__*/React.createElement("th", {
      key: i
    }, weekDaysLocale[(i + weekFirstDay) % WEEK_DAY_COUNT]));
  }

  // >>> Body Cells
  var getCellDate = function getCellDate(date, offset) {
    return generateConfig.addDate(date, offset);
  };
  var getCellText = function getCellText(date) {
    return formatValue(date, {
      locale: locale,
      format: locale.cellDateFormat,
      generateConfig: generateConfig
    });
  };
  var getCellClassName = function getCellClassName(date) {
    var classObj = _defineProperty(_defineProperty({}, "".concat(prefixCls, "-cell-in-view"), isSameMonth(generateConfig, date, pickerValue)), "".concat(prefixCls, "-cell-today"), isSameDate(generateConfig, date, now));
    return classObj;
  };

  // ========================= Header =========================
  var monthsLocale = locale.shortMonths || (generateConfig.locale.getShortMonths ? generateConfig.locale.getShortMonths(locale.locale) : []);
  var yearNode = /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": locale.yearSelect,
    key: "year",
    onClick: function onClick() {
      onModeChange('year', pickerValue);
    },
    tabIndex: -1,
    className: "".concat(prefixCls, "-year-btn")
  }, formatValue(pickerValue, {
    locale: locale,
    format: locale.yearFormat,
    generateConfig: generateConfig
  }));
  var monthNode = /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": locale.monthSelect,
    key: "month",
    onClick: function onClick() {
      onModeChange('month', pickerValue);
    },
    tabIndex: -1,
    className: "".concat(prefixCls, "-month-btn")
  }, locale.monthFormat ? formatValue(pickerValue, {
    locale: locale,
    format: locale.monthFormat,
    generateConfig: generateConfig
  }) : monthsLocale[month]);
  var monthYearNodes = locale.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode];

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(PanelContext.Provider, {
    value: info
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(panelPrefixCls, showWeek && "".concat(panelPrefixCls, "-show-week"))
  }, /*#__PURE__*/React.createElement(PanelHeader, {
    offset: function offset(distance) {
      return generateConfig.addMonth(pickerValue, distance);
    },
    superOffset: function superOffset(distance) {
      return generateConfig.addYear(pickerValue, distance);
    },
    onChange: onPickerValueChange
    // Limitation
    ,
    getStart: function getStart(date) {
      return generateConfig.setDate(date, 1);
    },
    getEnd: function getEnd(date) {
      var clone = generateConfig.setDate(date, 1);
      clone = generateConfig.addMonth(clone, 1);
      return generateConfig.addDate(clone, -1);
    }
  }, monthYearNodes), /*#__PURE__*/React.createElement(PanelBody, _extends({
    titleFormat: locale.fieldDateFormat
  }, props, {
    colNum: WEEK_DAY_COUNT,
    rowNum: 6,
    baseDate: baseDate
    // Header
    ,
    headerCells: headerCells
    // Body
    ,
    getCellDate: getCellDate,
    getCellText: getCellText,
    getCellClassName: getCellClassName,
    prefixColumn: prefixColumn,
    cellSelection: !isWeek
  }))));
}