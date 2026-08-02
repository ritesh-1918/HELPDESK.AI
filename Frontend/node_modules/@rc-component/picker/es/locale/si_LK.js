function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'si_LK',
  today: 'අද',
  now: 'දැන්',
  backToToday: 'අදට ආපසු',
  ok: 'හරි',
  clear: 'හිස් කරන්න',
  week: 'සතිය',
  month: 'මාසය',
  year: 'අවුරුද්ද',
  timeSelect: 'වේලාවක් තෝරන්න',
  dateSelect: 'දිනයක් තෝරන්න',
  weekSelect: 'සතියක් තෝරන්න',
  monthSelect: 'මාසයක් තෝරන්න',
  yearSelect: 'අවුරුද්දක් තෝරන්න',
  decadeSelect: 'දශකයක් තෝරන්න',
  monthBeforeYear: false,
  previousMonth: 'කලින් මාසය (පිටුව ඉහළට)',
  nextMonth: 'ඊළඟ මාසය (පිටුව පහළට)',
  previousYear: 'පසුගිය අවුරුද්ද (Control + වම)',
  nextYear: 'ඊළඟ අවුරුද්ද (Control + දකුණ)',
  previousDecade: 'පසුගිය දශකය',
  nextDecade: 'ඊළඟ දශකය',
  previousCentury: 'පසුගිය සියවස',
  nextCentury: 'ඊළඟ සියවස'
});
export default locale;