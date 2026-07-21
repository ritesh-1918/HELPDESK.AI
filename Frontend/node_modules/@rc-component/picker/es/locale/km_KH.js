function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'km',
  today: 'ថ្ងៃនេះ',
  now: 'ឥឡូវ​នេះ',
  backToToday: 'ត្រលប់ទៅថ្ងៃនេះ',
  ok: 'កំណត់',
  timeSelect: 'រយៈពេលជ្រើសរើស',
  dateSelect: 'ជ្រើសរើសកាលបរិច្ឆេទ',
  weekSelect: 'ជ្រើសរើសសប្តាហ៍',
  clear: 'ច្បាស់',
  week: 'សប្តាហ៍',
  month: 'ខែ',
  year: 'ឆ្នាំ',
  previousMonth: 'ខែមុន (ឡើងទំព័រ)',
  nextMonth: 'ខែបន្ទាប់ (ប៊ូតុងចុះទំព័រ)',
  monthSelect: 'ជ្រើសរើសខែ',
  yearSelect: 'ជ្រើសរើសឆ្នាំ',
  decadeSelect: 'ជ្រើសរើសអាយុ',
  previousYear: 'ឆ្នាំមុន (Controlគ្រាប់ចុចបូកព្រួញខាងឆ្វេង)',
  nextYear: 'ឆ្នាំក្រោយ (Control គ្រាប់ចុចបូកព្រួញស្ដាំ)',
  previousDecade: 'ជំនាន់ចុងក្រោយ',
  nextDecade: 'ជំនាន់​ក្រោយ',
  previousCentury: 'សតវត្សចុងក្រោយ',
  nextCentury: 'សតវត្សរ៍បន្ទាប់',
  monthBeforeYear: false
});
export default locale;