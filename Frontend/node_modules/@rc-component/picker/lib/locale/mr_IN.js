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
  fieldDateFormat: 'DD-MM-YYYY',
  fieldDateTimeFormat: 'DD-MM-YYYY HH:mm:ss',
  fieldMonthFormat: 'MM-YYYY',
  locale: 'mr_IN',
  today: 'आज',
  now: 'आता',
  backToToday: 'आजवर परत जा',
  ok: 'ठीक आहे',
  clear: 'साफ करा',
  week: 'आठवडा',
  month: 'महिना',
  year: 'वर्ष',
  timeSelect: 'वेळ निवडा',
  dateSelect: 'दिनांक निवडा',
  weekSelect: 'आठवडा निवडा',
  monthSelect: 'महिना निवडा',
  yearSelect: 'वर्ष निवडा',
  decadeSelect: 'दशक निवडा',
  previousMonth: 'मागील महिना (पेजअप)',
  nextMonth: 'पुढचा महिना (पेजडाउन)',
  previousYear: 'गेल्या वर्षी (Ctrl + left)',
  nextYear: 'पुढचे वर्ष (Ctrl + right)',
  previousDecade: 'मागील दशक',
  nextDecade: 'पुढचे दशक',
  previousCentury: 'मागील शतक',
  nextCentury: 'पुढचे शतक',
  shortWeekDays: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  shortMonths: ['जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें']
});
var _default = exports.default = locale;