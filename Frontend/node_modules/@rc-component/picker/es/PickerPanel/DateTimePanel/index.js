function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import * as React from 'react';
import useTimeInfo from "../../hooks/useTimeInfo";
import { fillTime } from "../../utils/dateUtil";
import DatePanel from "../DatePanel";
import TimePanel from "../TimePanel";
export default function DateTimePanel(props) {
  var prefixCls = props.prefixCls,
    generateConfig = props.generateConfig,
    showTime = props.showTime,
    onSelect = props.onSelect,
    value = props.value,
    pickerValue = props.pickerValue,
    onHover = props.onHover;
  var panelPrefixCls = "".concat(prefixCls, "-datetime-panel");

  // =============================== Time ===============================
  var _useTimeInfo = useTimeInfo(generateConfig, showTime),
    _useTimeInfo2 = _slicedToArray(_useTimeInfo, 1),
    getValidTime = _useTimeInfo2[0];

  // Merge the time info from `value` or `pickerValue`
  var mergeTime = function mergeTime(date) {
    if (value) {
      return fillTime(generateConfig, date, value);
    }
    return fillTime(generateConfig, date, pickerValue);
  };

  // ============================== Hover ===============================
  var onDateHover = function onDateHover(date) {
    onHover === null || onHover === void 0 || onHover(date ? mergeTime(date) : date);
  };

  // ============================== Select ==============================
  var onDateSelect = function onDateSelect(date) {
    // Merge with current time
    var cloneDate = mergeTime(date);
    onSelect(getValidTime(cloneDate, cloneDate));
  };

  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement("div", {
    className: panelPrefixCls
  }, /*#__PURE__*/React.createElement(DatePanel, _extends({}, props, {
    onSelect: onDateSelect,
    onHover: onDateHover
  })), /*#__PURE__*/React.createElement(TimePanel, props));
}