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
  locale: 'ml_IN',
  today: 'ഇന്ന്',
  now: 'ഇപ്പോൾ',
  backToToday: 'ഇന്നത്തെ ദിവസത്തിലേക്ക് തിരിച്ചു പോകുക',
  ok: 'ശരിയാണ്',
  clear: 'നീക്കം ചെയ്യുക',
  week: 'ആഴ്ച',
  month: 'മാസം',
  year: 'വർഷം',
  timeSelect: 'സമയം തിരഞ്ഞെടുക്കുക',
  dateSelect: 'ദിവസം തിരഞ്ഞെടുക്കുക',
  weekSelect: 'വാരം തിരഞ്ഞെടുക്കുക',
  monthSelect: 'മാസം തിരഞ്ഞെടുക്കുക',
  yearSelect: 'വർഷം തിരഞ്ഞെടുക്കുക',
  decadeSelect: 'ദശാബ്ദം തിരഞ്ഞെടുക്കുക',
  previousMonth: 'കഴിഞ്ഞ മാസം (PageUp)',
  nextMonth: 'അടുത്ത മാസം (PageDown)',
  previousYear: 'കഴിഞ്ഞ വർഷം (Control + left)',
  nextYear: 'അടുത്ത വർഷം (Control + right)',
  previousDecade: 'കഴിഞ്ഞ ദശാബ്ദം',
  nextDecade: 'അടുത്ത ദശാബ്ദം',
  previousCentury: 'കഴിഞ്ഞ നൂറ്റാണ്ട്',
  nextCentury: 'അടുത്ത നൂറ്റാണ്ട്'
});
var _default = exports.default = locale;