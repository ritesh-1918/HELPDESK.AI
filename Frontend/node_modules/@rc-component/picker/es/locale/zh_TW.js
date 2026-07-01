function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'zh_TW',
  today: '今天',
  now: '此刻',
  backToToday: '返回今天',
  ok: '確定',
  timeSelect: '選擇時間',
  dateSelect: '選擇日期',
  weekSelect: '選擇周',
  clear: '清除',
  week: '週',
  month: '月',
  year: '年',
  previousMonth: '上個月 (翻頁上鍵)',
  nextMonth: '下個月 (翻頁下鍵)',
  monthSelect: '選擇月份',
  yearSelect: '選擇年份',
  decadeSelect: '選擇年代',
  yearFormat: 'YYYY年',
  previousYear: '上一年 (Control鍵加左方向鍵)',
  nextYear: '下一年 (Control鍵加右方向鍵)',
  previousDecade: '上一年代',
  nextDecade: '下一年代',
  previousCentury: '上一世紀',
  nextCentury: '下一世紀',
  cellDateFormat: 'D',
  monthBeforeYear: false
});
export default locale;