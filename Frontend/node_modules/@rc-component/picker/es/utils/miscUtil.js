function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
export function leftPad(str, length) {
  var fill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0';
  var current = String(str);
  while (current.length < length) {
    current = "".concat(fill).concat(current);
  }
  return current;
}

/**
 * Convert `value` to array. Will provide `[]` if is null or undefined.
 */
export function toArray(val) {
  if (val === null || val === undefined) {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}
export function fillIndex(ori, index, value) {
  var clone = _toConsumableArray(ori);
  clone[index] = value;
  return clone;
}

/** Pick props from the key list. Will filter empty value */
export function pickProps(props, keys) {
  var clone = {};
  var mergedKeys = keys || Object.keys(props);
  mergedKeys.forEach(function (key) {
    if (props[key] !== undefined) {
      clone[key] = props[key];
    }
  });
  return clone;
}
export function getRowFormat(picker, locale, format) {
  if (format) {
    return format;
  }
  switch (picker) {
    // All from the `locale.fieldXXXFormat` first
    case 'time':
      return locale.fieldTimeFormat;
    case 'datetime':
      return locale.fieldDateTimeFormat;
    case 'month':
      return locale.fieldMonthFormat;
    case 'year':
      return locale.fieldYearFormat;
    case 'quarter':
      return locale.fieldQuarterFormat;
    case 'week':
      return locale.fieldWeekFormat;
    default:
      return locale.fieldDateFormat;
  }
}
export function getFromDate(calendarValues, activeIndexList, activeIndex) {
  var mergedActiveIndex = activeIndex !== undefined ? activeIndex : activeIndexList[activeIndexList.length - 1];
  var firstValuedIndex = activeIndexList.find(function (index) {
    return calendarValues[index];
  });
  return mergedActiveIndex !== firstValuedIndex ? calendarValues[firstValuedIndex] : undefined;
}