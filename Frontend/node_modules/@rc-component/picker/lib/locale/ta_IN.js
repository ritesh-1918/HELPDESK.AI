"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _common = require("./common");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var locale = _objectSpread(_objectSpread({}, _common.commonLocale), {}, {
  locale: 'ta_IN',
  today: 'இன்று',
  now: 'இப்போது',
  backToToday: 'இன்றுக்கு திரும்பு',
  ok: 'சரி',
  clear: 'அழி',
  week: 'வாரம்',
  month: 'மாதம்',
  year: 'வருடம்',
  timeSelect: 'நேரத்தைத் தேர்ந்தெடு',
  dateSelect: 'தேதியைத் தேர்ந்தெடு',
  weekSelect: 'வாரத்தைத் தேர்வுசெய்க',
  monthSelect: 'மாதத்தைத் தேர்வுசெய்க',
  yearSelect: 'வருடத்தைத் தேர்வுசெய்க',
  decadeSelect: 'தசாப்தத்தைத் தேர்வுசெய்க',
  previousMonth: 'முந்தைய மாதம் (PageUp)',
  nextMonth: 'அடுத்த மாதம் (PageDown)',
  previousYear: 'முந்தைய வருடம் (Control + left)',
  nextYear: 'அடுத்த வருடம் (Control + right)',
  previousDecade: 'முந்தைய தசாப்தம்',
  nextDecade: 'அடுத்த தசாப்தம்',
  previousCentury: 'முந்தைய நூற்றாண்டு',
  nextCentury: 'அடுத்த நூற்றாண்டு'
});
var _default = exports.default = locale;