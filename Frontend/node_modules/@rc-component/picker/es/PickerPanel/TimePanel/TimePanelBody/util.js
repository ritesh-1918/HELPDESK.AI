function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
export function findValidateTime(date, getHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits, generateConfig) {
  var nextDate = date;
  function alignValidate(getUnitValue, setUnitValue, units) {
    var nextValue = generateConfig[getUnitValue](nextDate);
    var nextUnit = units.find(function (unit) {
      return unit.value === nextValue;
    });
    if (!nextUnit || nextUnit.disabled) {
      // Find most closest unit
      var validateUnits = units.filter(function (unit) {
        return !unit.disabled;
      });
      var reverseEnabledUnits = _toConsumableArray(validateUnits).reverse();
      var validateUnit = reverseEnabledUnits.find(function (unit) {
        return unit.value <= nextValue;
      }) || validateUnits[0];
      if (validateUnit) {
        nextValue = validateUnit.value;
        nextDate = generateConfig[setUnitValue](nextDate, nextValue);
      }
    }
    return nextValue;
  }

  // Find validate hour
  var nextHour = alignValidate('getHour', 'setHour', getHourUnits());

  // Find validate minute
  var nextMinute = alignValidate('getMinute', 'setMinute', getMinuteUnits(nextHour));

  // Find validate second
  var nextSecond = alignValidate('getSecond', 'setSecond', getSecondUnits(nextHour, nextMinute));

  // Find validate millisecond
  alignValidate('getMillisecond', 'setMillisecond', getMillisecondUnits(nextHour, nextMinute, nextSecond));
  return nextDate;
}