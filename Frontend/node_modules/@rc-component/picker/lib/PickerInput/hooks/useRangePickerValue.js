"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRangePickerValue;
exports.offsetPanelDate = offsetPanelDate;
var _util = require("@rc-component/util");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var React = _interopRequireWildcard(require("react"));
var _dateUtil = require("../../utils/dateUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function offsetPanelDate(generateConfig, picker, date, offset) {
  switch (picker) {
    case 'date':
    case 'week':
      return generateConfig.addMonth(date, offset);
    case 'month':
    case 'quarter':
      return generateConfig.addYear(date, offset);
    case 'year':
      return generateConfig.addYear(date, offset * 10);
    case 'decade':
      return generateConfig.addYear(date, offset * 100);
    default:
      return date;
  }
}
var EMPTY_LIST = [];
function useRangePickerValue(generateConfig, locale, calendarValue, modes, open, activeIndex, pickerMode, multiplePanel) {
  var defaultPickerValue = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : EMPTY_LIST;
  var pickerValue = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : EMPTY_LIST;
  var timeDefaultValue = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : EMPTY_LIST;
  var onPickerValueChange = arguments.length > 11 ? arguments[11] : undefined;
  var minDate = arguments.length > 12 ? arguments[12] : undefined;
  var maxDate = arguments.length > 13 ? arguments[13] : undefined;
  var isTimePicker = pickerMode === 'time';

  // ======================== Active ========================
  // `activeIndex` must be valid to avoid getting empty `pickerValue`
  var mergedActiveIndex = activeIndex || 0;

  // ===================== Picker Value =====================
  var getDefaultPickerValue = function getDefaultPickerValue(index) {
    var now = generateConfig.getNow();
    if (isTimePicker) {
      now = (0, _dateUtil.fillTime)(generateConfig, now);
    }
    return defaultPickerValue[index] || calendarValue[index] || now;
  };

  // Align `pickerValue` with `showTime.defaultValue`
  var _pickerValue = _slicedToArray(pickerValue, 2),
    startPickerValue = _pickerValue[0],
    endPickerValue = _pickerValue[1];

  // PickerValue state
  var _useControlledState = (0, _util.useControlledState)(function () {
      return getDefaultPickerValue(0);
    }, startPickerValue),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    mergedStartPickerValue = _useControlledState2[0],
    setStartPickerValue = _useControlledState2[1];
  var _useControlledState3 = (0, _util.useControlledState)(function () {
      return getDefaultPickerValue(1);
    }, endPickerValue),
    _useControlledState4 = _slicedToArray(_useControlledState3, 2),
    mergedEndPickerValue = _useControlledState4[0],
    setEndPickerValue = _useControlledState4[1];

  // Current PickerValue
  var currentPickerValue = React.useMemo(function () {
    var current = [mergedStartPickerValue, mergedEndPickerValue][mergedActiveIndex];

    // Merge the `showTime.defaultValue` into `pickerValue`
    return isTimePicker ? current : (0, _dateUtil.fillTime)(generateConfig, current, timeDefaultValue[mergedActiveIndex]);
  }, [isTimePicker, mergedStartPickerValue, mergedEndPickerValue, mergedActiveIndex, generateConfig, timeDefaultValue]);
  var setCurrentPickerValue = function setCurrentPickerValue(nextPickerValue) {
    var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'panel';
    var updater = [setStartPickerValue, setEndPickerValue][mergedActiveIndex];
    updater(nextPickerValue);
    var clone = [mergedStartPickerValue, mergedEndPickerValue];
    clone[mergedActiveIndex] = nextPickerValue;
    if (onPickerValueChange && (!(0, _dateUtil.isSame)(generateConfig, locale, mergedStartPickerValue, clone[0], pickerMode) || !(0, _dateUtil.isSame)(generateConfig, locale, mergedEndPickerValue, clone[1], pickerMode))) {
      onPickerValueChange(clone, {
        source: source,
        range: mergedActiveIndex === 1 ? 'end' : 'start',
        mode: modes
      });
    }
  };

  // ======================== Effect ========================
  /**
   * EndDate pickerValue is little different. It should be:
   * - If date picker (without time), endDate is not same year & month as startDate
   *   - pickerValue minus one month
   * - Else pass directly
   */
  var getEndDatePickerValue = function getEndDatePickerValue(startDate, endDate) {
    if (multiplePanel) {
      // Basic offset
      var SAME_CHECKER = {
        date: 'month',
        week: 'month',
        month: 'year',
        quarter: 'year'
      };
      var mode = SAME_CHECKER[pickerMode];
      if (mode && !(0, _dateUtil.isSame)(generateConfig, locale, startDate, endDate, mode)) {
        return offsetPanelDate(generateConfig, pickerMode, endDate, -1);
      }

      // Year offset
      if (pickerMode === 'year' && startDate) {
        var srcYear = Math.floor(generateConfig.getYear(startDate) / 10);
        var tgtYear = Math.floor(generateConfig.getYear(endDate) / 10);
        if (srcYear !== tgtYear) {
          return offsetPanelDate(generateConfig, pickerMode, endDate, -1);
        }
      }
    }
    return endDate;
  };

  // >>> When switch field, reset the picker value as prev field picker value
  var prevActiveIndexRef = React.useRef(null);
  (0, _useLayoutEffect.default)(function () {
    if (open) {
      if (!defaultPickerValue[mergedActiveIndex]) {
        var nextPickerValue = isTimePicker ? null : generateConfig.getNow();

        /**
         * 1. If has prevActiveIndex, use it to avoid panel jump
         * 2. If current field has value
         *    - If `activeIndex` is 1 and `calendarValue[0]` is not same panel as `calendarValue[1]`,
         *      offset `calendarValue[1]` and set it
         *    - Else use `calendarValue[activeIndex]`
         * 3. If current field has no value but another field has value, use another field value
         * 4. Else use now (not any `calendarValue` can ref)
         */

        if (prevActiveIndexRef.current !== null && prevActiveIndexRef.current !== mergedActiveIndex) {
          // If from another field, not jump picker value
          nextPickerValue = [mergedStartPickerValue, mergedEndPickerValue][mergedActiveIndex ^ 1];
        } else if (calendarValue[mergedActiveIndex]) {
          // Current field has value
          nextPickerValue = mergedActiveIndex === 0 ? calendarValue[0] : getEndDatePickerValue(calendarValue[0], calendarValue[1]);
        } else if (calendarValue[mergedActiveIndex ^ 1]) {
          // Current field has no value but another field has value
          nextPickerValue = calendarValue[mergedActiveIndex ^ 1];
        }

        // Only sync when has value, this will sync in the `min-max` logic
        if (nextPickerValue) {
          // nextPickerValue < minDate
          if (minDate && generateConfig.isAfter(minDate, nextPickerValue)) {
            nextPickerValue = minDate;
          }

          // maxDate < nextPickerValue
          var offsetPickerValue = multiplePanel ? offsetPanelDate(generateConfig, pickerMode, nextPickerValue, 1) : nextPickerValue;
          if (maxDate && generateConfig.isAfter(offsetPickerValue, maxDate)) {
            nextPickerValue = multiplePanel ? offsetPanelDate(generateConfig, pickerMode, maxDate, -1) : maxDate;
          }
          setCurrentPickerValue(nextPickerValue, 'reset');
        }
      }
    }
  }, [open, mergedActiveIndex, calendarValue[mergedActiveIndex]]);

  // >>> Reset prevActiveIndex when panel closed
  React.useEffect(function () {
    if (open) {
      prevActiveIndexRef.current = mergedActiveIndex;
    } else {
      prevActiveIndexRef.current = null;
    }
  }, [open, mergedActiveIndex]);

  // >>> defaultPickerValue: Resync to `defaultPickerValue` for each panel focused
  (0, _useLayoutEffect.default)(function () {
    if (open && defaultPickerValue) {
      if (defaultPickerValue[mergedActiveIndex]) {
        setCurrentPickerValue(defaultPickerValue[mergedActiveIndex], 'reset');
      }
    }
  }, [open, mergedActiveIndex]);
  return [currentPickerValue, setCurrentPickerValue];
}