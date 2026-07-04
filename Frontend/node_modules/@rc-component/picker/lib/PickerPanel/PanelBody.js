"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PanelBody;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _dateUtil = require("../utils/dateUtil");
var _context = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
function PanelBody(props) {
  var rowNum = props.rowNum,
    colNum = props.colNum,
    baseDate = props.baseDate,
    getCellDate = props.getCellDate,
    prefixColumn = props.prefixColumn,
    rowClassName = props.rowClassName,
    titleFormat = props.titleFormat,
    getCellText = props.getCellText,
    getCellClassName = props.getCellClassName,
    headerCells = props.headerCells,
    _props$cellSelection = props.cellSelection,
    cellSelection = _props$cellSelection === void 0 ? true : _props$cellSelection,
    disabledDate = props.disabledDate;
  var _usePanelContext = (0, _context.usePanelContext)(),
    prefixCls = _usePanelContext.prefixCls,
    classNames = _usePanelContext.classNames,
    styles = _usePanelContext.styles,
    type = _usePanelContext.panelType,
    now = _usePanelContext.now,
    contextDisabledDate = _usePanelContext.disabledDate,
    cellRender = _usePanelContext.cellRender,
    onHover = _usePanelContext.onHover,
    hoverValue = _usePanelContext.hoverValue,
    hoverRangeValue = _usePanelContext.hoverRangeValue,
    generateConfig = _usePanelContext.generateConfig,
    values = _usePanelContext.values,
    locale = _usePanelContext.locale,
    onSelect = _usePanelContext.onSelect;
  var mergedDisabledDate = disabledDate || contextDisabledDate;
  var cellPrefixCls = "".concat(prefixCls, "-cell");

  // ============================= Context ==============================
  var _React$useContext = React.useContext(_context.PickerHackContext),
    onCellDblClick = _React$useContext.onCellDblClick;

  // ============================== Value ===============================
  var matchValues = function matchValues(date) {
    return values.some(function (singleValue) {
      return singleValue && (0, _dateUtil.isSame)(generateConfig, locale, date, singleValue, type);
    });
  };

  // =============================== Body ===============================
  var rows = [];
  for (var row = 0; row < rowNum; row += 1) {
    var rowNode = [];
    var rowStartDate = void 0;
    var _loop = function _loop() {
      var offset = row * colNum + col;
      var currentDate = getCellDate(baseDate, offset);
      var disabled = mergedDisabledDate === null || mergedDisabledDate === void 0 ? void 0 : mergedDisabledDate(currentDate, {
        type: type
      });

      // Row Start Cell
      if (col === 0) {
        rowStartDate = currentDate;
        if (prefixColumn) {
          rowNode.push(prefixColumn(rowStartDate));
        }
      }

      // Range
      var inRange = false;
      var rangeStart = false;
      var rangeEnd = false;
      if (cellSelection && hoverRangeValue) {
        var _hoverRangeValue = _slicedToArray(hoverRangeValue, 2),
          hoverStart = _hoverRangeValue[0],
          hoverEnd = _hoverRangeValue[1];
        inRange = (0, _dateUtil.isInRange)(generateConfig, hoverStart, hoverEnd, currentDate);
        rangeStart = (0, _dateUtil.isSame)(generateConfig, locale, currentDate, hoverStart, type);
        rangeEnd = (0, _dateUtil.isSame)(generateConfig, locale, currentDate, hoverEnd, type);
      }

      // Title
      var title = titleFormat ? (0, _dateUtil.formatValue)(currentDate, {
        locale: locale,
        format: titleFormat,
        generateConfig: generateConfig
      }) : undefined;

      // Render
      var inner = /*#__PURE__*/React.createElement("div", {
        className: "".concat(cellPrefixCls, "-inner")
      }, getCellText(currentDate));
      rowNode.push( /*#__PURE__*/React.createElement("td", {
        key: col,
        title: title,
        className: (0, _clsx.clsx)(cellPrefixCls, classNames.item, _objectSpread(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(cellPrefixCls, "-disabled"), disabled), "".concat(cellPrefixCls, "-hover"), (hoverValue || []).some(function (date) {
          return (0, _dateUtil.isSame)(generateConfig, locale, currentDate, date, type);
        })), "".concat(cellPrefixCls, "-in-range"), inRange && !rangeStart && !rangeEnd), "".concat(cellPrefixCls, "-range-start"), rangeStart), "".concat(cellPrefixCls, "-range-end"), rangeEnd), "".concat(prefixCls, "-cell-selected"), !hoverRangeValue &&
        // WeekPicker use row instead
        type !== 'week' && matchValues(currentDate)), getCellClassName(currentDate))),
        style: styles.item,
        onClick: function onClick() {
          if (!disabled) {
            onSelect(currentDate);
          }
        },
        onDoubleClick: function onDoubleClick() {
          if (!disabled && onCellDblClick) {
            onCellDblClick();
          }
        },
        onMouseEnter: function onMouseEnter() {
          if (!disabled) {
            onHover === null || onHover === void 0 || onHover(currentDate);
          }
        },
        onMouseLeave: function onMouseLeave() {
          if (!disabled) {
            onHover === null || onHover === void 0 || onHover(null);
          }
        }
      }, cellRender ? cellRender(currentDate, {
        prefixCls: prefixCls,
        originNode: inner,
        today: now,
        type: type,
        locale: locale
      }) : inner));
    };
    for (var col = 0; col < colNum; col += 1) {
      _loop();
    }
    rows.push( /*#__PURE__*/React.createElement("tr", {
      key: row,
      className: rowClassName === null || rowClassName === void 0 ? void 0 : rowClassName(rowStartDate)
    }, rowNode));
  }

  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)("".concat(prefixCls, "-body"), classNames.body),
    style: styles.body
  }, /*#__PURE__*/React.createElement("table", {
    className: (0, _clsx.clsx)("".concat(prefixCls, "-content"), classNames.content),
    style: styles.content
  }, headerCells && /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, headerCells)), /*#__PURE__*/React.createElement("tbody", null, rows)));
}