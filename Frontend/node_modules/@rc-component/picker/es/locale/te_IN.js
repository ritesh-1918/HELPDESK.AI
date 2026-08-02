function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { commonLocale } from "./common";
var locale = _objectSpread(_objectSpread({}, commonLocale), {}, {
  locale: 'te_IN',
  today: 'నేడు',
  now: 'ఇప్పుడు',
  backToToday: 'తిరిగి నేటికి',
  ok: 'సరే',
  clear: 'స్పష్టమైన',
  week: 'వారం',
  month: 'నెల',
  year: 'సంవత్సరం',
  timeSelect: 'సమయం ఎంపిక',
  dateSelect: 'తేదీ ఎంపిక',
  weekSelect: 'వారం ఎంపిక',
  monthSelect: 'నెల ఎంపిక',
  yearSelect: 'సంవత్సరం ఎంపిక',
  decadeSelect: 'దశాబ్దం ఎంపిక',
  previousMonth: 'మునుపటి నెల',
  nextMonth: 'వచ్చే నెల',
  previousYear: 'మునుపటి సంవత్సరం',
  nextYear: 'తదుపరి సంవత్సరం',
  previousDecade: 'మునుపటి దశాబ్దం',
  nextDecade: 'తదుపరి దశాబ్దం',
  previousCentury: 'మునుపటి శతాబ్దం',
  nextCentury: 'తదుపరి శతాబ్దం'
});
export default locale;