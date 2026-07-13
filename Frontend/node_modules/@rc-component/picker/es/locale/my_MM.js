function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'my_MM',
  today: 'ယနေ့',
  now: 'ယခု',
  backToToday: 'ယနေ့မတိုင်ခင်သို့',
  ok: 'OK',
  clear: 'ရှင်းမည်',
  week: 'အပတ်',
  month: 'လ',
  year: 'နှစ်',
  timeSelect: 'အချိန်ကိုရွေး',
  dateSelect: 'နေ့ကိုရွေး',
  weekSelect: 'သီတင်းပတ်ကိုရွေး',
  monthSelect: 'လကိုရွေး',
  yearSelect: 'နှစ်ကိုရွေး',
  decadeSelect: 'ဆယ်စုနှစ်ကိုရွေး',
  previousMonth: 'ယခင်လ (PageUp)',
  nextMonth: 'နောက်လ (PageDown)',
  previousYear: 'ယခင်နှစ် (Control + left)',
  nextYear: 'နောက်နှစ် (Control + right)',
  previousDecade: 'ယခင်ဆယ်စုနှစ်',
  nextDecade: 'နောက်ဆယ်စုနှစ်',
  previousCentury: 'ယခင်ရာစုနှစ်',
  nextCentury: 'နောက်ရာစုနှစ်'
});
export default locale;