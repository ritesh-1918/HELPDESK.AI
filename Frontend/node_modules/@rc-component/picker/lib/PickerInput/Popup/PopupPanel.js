"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PopupPanel;
var React = _interopRequireWildcard(require("react"));
var _PickerPanel = _interopRequireDefault(require("../../PickerPanel"));
var _context = require("../../PickerPanel/context");
var _context2 = _interopRequireDefault(require("../context"));
var _useRangePickerValue = require("../hooks/useRangePickerValue");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function PopupPanel(props) {
  var picker = props.picker,
    multiplePanel = props.multiplePanel,
    pickerValue = props.pickerValue,
    onPickerValueChange = props.onPickerValueChange,
    needConfirm = props.needConfirm,
    onSubmit = props.onSubmit,
    range = props.range,
    hoverValue = props.hoverValue;
  var _React$useContext = React.useContext(_context2.default),
    prefixCls = _React$useContext.prefixCls,
    generateConfig = _React$useContext.generateConfig;

  // ======================== Offset ========================
  var internalOffsetDate = React.useCallback(function (date, offset) {
    return (0, _useRangePickerValue.offsetPanelDate)(generateConfig, picker, date, offset);
  }, [generateConfig, picker]);
  var nextPickerValue = React.useMemo(function () {
    return internalOffsetDate(pickerValue, 1);
  }, [pickerValue, internalOffsetDate]);

  // Outside
  var onSecondPickerValueChange = function onSecondPickerValueChange(nextDate) {
    onPickerValueChange(internalOffsetDate(nextDate, -1));
  };

  // ======================= Context ========================
  var sharedContext = {
    onCellDblClick: function onCellDblClick() {
      if (needConfirm) {
        onSubmit();
      }
    }
  };
  var hideHeader = picker === 'time';

  // ======================== Props =========================
  var pickerProps = _objectSpread(_objectSpread({}, props), {}, {
    hoverValue: null,
    hoverRangeValue: null,
    hideHeader: hideHeader
  });
  if (range) {
    pickerProps.hoverRangeValue = hoverValue;
  } else {
    pickerProps.hoverValue = hoverValue;
  }

  // ======================== Render ========================
  // Multiple
  if (multiplePanel) {
    return /*#__PURE__*/React.createElement("div", {
      className: "".concat(prefixCls, "-panels")
    }, /*#__PURE__*/React.createElement(_context.PickerHackContext.Provider, {
      value: _objectSpread(_objectSpread({}, sharedContext), {}, {
        hideNext: true
      })
    }, /*#__PURE__*/React.createElement(_PickerPanel.default, pickerProps)), /*#__PURE__*/React.createElement(_context.PickerHackContext.Provider, {
      value: _objectSpread(_objectSpread({}, sharedContext), {}, {
        hidePrev: true
      })
    }, /*#__PURE__*/React.createElement(_PickerPanel.default, _extends({}, pickerProps, {
      pickerValue: nextPickerValue,
      onPickerValueChange: onSecondPickerValueChange
    }))));
  }

  // Single
  return /*#__PURE__*/React.createElement(_context.PickerHackContext.Provider, {
    value: _objectSpread({}, sharedContext)
  }, /*#__PURE__*/React.createElement(_PickerPanel.default, pickerProps));
}