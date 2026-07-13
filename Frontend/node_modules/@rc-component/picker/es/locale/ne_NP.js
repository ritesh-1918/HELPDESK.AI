function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'ne_NP',
  today: 'आज',
  now: 'अब',
  backToToday: 'आज फर्कनुहोस्',
  ok: 'ठिक छ',
  clear: 'खाली गर्नुहोस्',
  week: 'हप्ता',
  month: 'महिना',
  year: 'वर्ष',
  timeSelect: 'समय चयन गर्नुहोस्',
  dateSelect: 'मिति चयन गर्नुहोस्',
  weekSelect: 'एक हप्ता छान्नुहोस्',
  monthSelect: 'एक महिना छान्नुहोस्',
  yearSelect: 'एक वर्ष छान्नुहोस्',
  decadeSelect: 'एक दशक छान्नुहोस्',
  previousMonth: 'अघिल्लो महिना (पृष्ठ माथि)',
  nextMonth: 'अर्को महिना (पृष्ठ तल)',
  previousYear: 'गत वर्ष (Control + left)',
  nextYear: 'आउने साल (Control + right)',
  previousDecade: 'पछिल्लो दशक',
  nextDecade: 'अर्को दशक',
  previousCentury: 'पछिल्लो शताब्दी',
  nextCentury: 'अर्को शताब्दी'
});
export default locale;