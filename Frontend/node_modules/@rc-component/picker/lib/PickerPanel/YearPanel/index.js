"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = YearPanel;
var React = _interopRequireWildcard(require("react"));
var _dateUtil = require("../../utils/dateUtil");
var _context = require("../context");
var _PanelBody = _interopRequireDefault(require("../PanelBody"));
var _PanelHeader = _interopRequireDefault(require("../PanelHeader"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
function YearPanel(props) {
  var prefixCls = props.prefixCls,
    locale = props.locale,
    generateConfig = props.generateConfig,
    pickerValue = props.pickerValue,
    disabledDate = props.disabledDate,
    onPickerValueChange = props.onPickerValueChange,
    onModeChange = props.onModeChange;
  var panelPrefixCls = "".concat(prefixCls, "-year-panel");

  // ========================== Base ==========================
  var _useInfo = (0, _context.useInfo)(props, 'year'),
    _useInfo2 = _slicedToArray(_useInfo, 1),
    info = _useInfo2[0];
  var getStartYear = function getStartYear(date) {
    var startYear = Math.floor(generateConfig.getYear(date) / 10) * 10;
    return generateConfig.setYear(date, startYear);
  };
  var getEndYear = function getEndYear(date) {
    var startYear = getStartYear(date);
    return generateConfig.addYear(startYear, 9);
  };
  var startYearDate = getStartYear(pickerValue);
  var endYearDate = getEndYear(pickerValue);
  var baseDate = generateConfig.addYear(startYearDate, -1);

  // ========================= Cells ==========================
  var getCellDate = function getCellDate(date, offset) {
    return generateConfig.addYear(date, offset);
  };
  var getCellText = function getCellText(date) {
    return (0, _dateUtil.formatValue)(date, {
      locale: locale,
      format: locale.cellYearFormat,
      generateConfig: generateConfig
    });
  };
  var getCellClassName = function getCellClassName(date) {
    return _defineProperty({}, "".concat(prefixCls, "-cell-in-view"), (0, _dateUtil.isSameYear)(generateConfig, date, startYearDate) || (0, _dateUtil.isSameYear)(generateConfig, date, endYearDate) || (0, _dateUtil.isInRange)(generateConfig, startYearDate, endYearDate, date));
  };

  // ======================== Disabled ========================
  var mergedDisabledDate = disabledDate ? function (currentDate, disabledInfo) {
    // Start
    var startMonth = generateConfig.setMonth(currentDate, 0);
    var startDate = generateConfig.setDate(startMonth, 1);

    // End
    var endMonth = generateConfig.addYear(startDate, 1);
    var endDate = generateConfig.addDate(endMonth, -1);
    return disabledDate(startDate, disabledInfo) && disabledDate(endDate, disabledInfo);
  } : null;

  // ========================= Header =========================
  var yearNode = /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: "decade",
    "aria-label": locale.decadeSelect,
    onClick: function onClick() {
      onModeChange('decade');
    },
    tabIndex: -1,
    className: "".concat(prefixCls, "-decade-btn")
  }, (0, _dateUtil.formatValue)(startYearDate, {
    locale: locale,
    format: locale.yearFormat,
    generateConfig: generateConfig
  }), "-", (0, _dateUtil.formatValue)(endYearDate, {
    locale: locale,
    format: locale.yearFormat,
    generateConfig: generateConfig
  }));

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(_context.PanelContext.Provider, {
    value: info
  }, /*#__PURE__*/React.createElement("div", {
    className: panelPrefixCls
  }, /*#__PURE__*/React.createElement(_PanelHeader.default, {
    superOffset: function superOffset(distance) {
      return generateConfig.addYear(pickerValue, distance * 10);
    },
    onChange: onPickerValueChange
    // Limitation
    ,
    getStart: getStartYear,
    getEnd: getEndYear
  }, yearNode), /*#__PURE__*/React.createElement(_PanelBody.default, _extends({}, props, {
    disabledDate: mergedDisabledDate,
    titleFormat: locale.fieldYearFormat,
    colNum: 3,
    rowNum: 4,
    baseDate: baseDate
    // Body
    ,
    getCellDate: getCellDate,
    getCellText: getCellText,
    getCellClassName: getCellClassName
  }))));
}