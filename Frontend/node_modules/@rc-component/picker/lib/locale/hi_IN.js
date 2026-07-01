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
  locale: 'hi_IN',
  today: 'आज',
  now: 'अभी',
  backToToday: 'आज तक',
  ok: 'ठीक',
  clear: 'स्पष्ट',
  week: 'सप्ताह',
  month: 'महीना',
  year: 'साल',
  timeSelect: 'समय का चयन करें',
  dateSelect: 'तारीख़ चुनें',
  weekSelect: 'एक सप्ताह चुनें',
  monthSelect: 'एक महीना चुनें',
  yearSelect: 'एक वर्ष चुनें',
  decadeSelect: 'एक दशक चुनें',
  previousMonth: 'पिछला महीना (पेजअप)',
  nextMonth: 'अगले महीने (पेजडाउन)',
  previousYear: 'पिछले साल (Ctrl + बाएं)',
  nextYear: 'अगले साल (Ctrl + दाहिना)',
  previousDecade: 'पिछला दशक',
  nextDecade: 'अगले दशक',
  previousCentury: 'पीछ्ली शताब्दी',
  nextCentury: 'अगली सदी'
});
var _default = exports.default = locale;