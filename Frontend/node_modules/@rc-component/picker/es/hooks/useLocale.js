function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from 'react';
export function fillTimeFormat(showHour, showMinute, showSecond, showMillisecond, showMeridiem) {
  var timeFormat = '';

  // Base HH:mm:ss
  var cells = [];
  if (showHour) {
    cells.push(showMeridiem ? 'hh' : 'HH');
  }
  if (showMinute) {
    cells.push('mm');
  }
  if (showSecond) {
    cells.push('ss');
  }
  timeFormat = cells.join(':');

  // Millisecond
  if (showMillisecond) {
    timeFormat += '.SSS';
  }

  // Meridiem
  if (showMeridiem) {
    timeFormat += ' A';
  }
  return timeFormat;
}

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
function fillLocale(locale, showHour, showMinute, showSecond, showMillisecond, use12Hours) {
  // Not fill `monthFormat` since `locale.shortMonths` handle this
  // Not fill `cellMeridiemFormat` since AM & PM by default
  var fieldDateTimeFormat = locale.fieldDateTimeFormat,
    fieldDateFormat = locale.fieldDateFormat,
    fieldTimeFormat = locale.fieldTimeFormat,
    fieldMonthFormat = locale.fieldMonthFormat,
    fieldYearFormat = locale.fieldYearFormat,
    fieldWeekFormat = locale.fieldWeekFormat,
    fieldQuarterFormat = locale.fieldQuarterFormat,
    yearFormat = locale.yearFormat,
    cellYearFormat = locale.cellYearFormat,
    cellQuarterFormat = locale.cellQuarterFormat,
    dayFormat = locale.dayFormat,
    cellDateFormat = locale.cellDateFormat;
  var timeFormat = fillTimeFormat(showHour, showMinute, showSecond, showMillisecond, use12Hours);
  return _objectSpread(_objectSpread({}, locale), {}, {
    fieldDateTimeFormat: fieldDateTimeFormat || "YYYY-MM-DD ".concat(timeFormat),
    fieldDateFormat: fieldDateFormat || 'YYYY-MM-DD',
    fieldTimeFormat: fieldTimeFormat || timeFormat,
    fieldMonthFormat: fieldMonthFormat || 'YYYY-MM',
    fieldYearFormat: fieldYearFormat || 'YYYY',
    fieldWeekFormat: fieldWeekFormat || 'gggg-wo',
    fieldQuarterFormat: fieldQuarterFormat || 'YYYY-[Q]Q',
    yearFormat: yearFormat || 'YYYY',
    cellYearFormat: cellYearFormat || 'YYYY',
    cellQuarterFormat: cellQuarterFormat || '[Q]Q',
    cellDateFormat: cellDateFormat || dayFormat || 'D'
  });
}

/**
 * Fill locale format as start up
 */
export default function useLocale(locale, showProps) {
  var showHour = showProps.showHour,
    showMinute = showProps.showMinute,
    showSecond = showProps.showSecond,
    showMillisecond = showProps.showMillisecond,
    use12Hours = showProps.use12Hours;
  return React.useMemo(function () {
    return fillLocale(locale, showHour, showMinute, showSecond, showMillisecond, use12Hours);
  }, [locale, showHour, showMinute, showSecond, showMillisecond, use12Hours]);
}