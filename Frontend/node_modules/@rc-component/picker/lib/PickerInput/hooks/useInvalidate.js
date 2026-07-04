"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useInvalidate;
var _util = require("@rc-component/util");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Check if provided date is valid for the `disabledDate` & `showTime.disabledTime`.
 */
function useInvalidate(generateConfig, picker, disabledDate, showTime) {
  // Check disabled date
  var isInvalidate = (0, _util.useEvent)(function (date, info) {
    var outsideInfo = _objectSpread({
      type: picker
    }, info);
    delete outsideInfo.activeIndex;
    if (
    // Date object is invalid
    !generateConfig.isValidate(date) ||
    // Date is disabled by `disabledDate`
    disabledDate && disabledDate(date, outsideInfo)) {
      return true;
    }
    if ((picker === 'date' || picker === 'time') && showTime) {
      var _showTime$disabledTim;
      var range = info && info.activeIndex === 1 ? 'end' : 'start';
      var _ref = ((_showTime$disabledTim = showTime.disabledTime) === null || _showTime$disabledTim === void 0 ? void 0 : _showTime$disabledTim.call(showTime, date, range, {
          from: outsideInfo.from
        })) || {},
        disabledHours = _ref.disabledHours,
        disabledMinutes = _ref.disabledMinutes,
        disabledSeconds = _ref.disabledSeconds,
        disabledMilliseconds = _ref.disabledMilliseconds;
      var legacyDisabledHours = showTime.disabledHours,
        legacyDisabledMinutes = showTime.disabledMinutes,
        legacyDisabledSeconds = showTime.disabledSeconds;
      var mergedDisabledHours = disabledHours || legacyDisabledHours;
      var mergedDisabledMinutes = disabledMinutes || legacyDisabledMinutes;
      var mergedDisabledSeconds = disabledSeconds || legacyDisabledSeconds;
      var hour = generateConfig.getHour(date);
      var minute = generateConfig.getMinute(date);
      var second = generateConfig.getSecond(date);
      var millisecond = generateConfig.getMillisecond(date);
      if (mergedDisabledHours && mergedDisabledHours().includes(hour)) {
        return true;
      }
      if (mergedDisabledMinutes && mergedDisabledMinutes(hour).includes(minute)) {
        return true;
      }
      if (mergedDisabledSeconds && mergedDisabledSeconds(hour, minute).includes(second)) {
        return true;
      }
      if (disabledMilliseconds && disabledMilliseconds(hour, minute, second).includes(millisecond)) {
        return true;
      }
    }
    return false;
  });
  return isInvalidate;
}