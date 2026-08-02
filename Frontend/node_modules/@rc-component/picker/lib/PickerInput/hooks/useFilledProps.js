"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useFilledProps;
var _util = require("@rc-component/util");
var React = _interopRequireWildcard(require("react"));
var _useLocale = _interopRequireDefault(require("../../hooks/useLocale"));
var _useTimeConfig = require("../../hooks/useTimeConfig");
var _miscUtil = require("../../utils/miscUtil");
var _useClearIcon = require("../Selector/hooks/useClearIcon");
var _useDisabledBoundary = _interopRequireDefault(require("./useDisabledBoundary"));
var _useFieldFormat3 = require("./useFieldFormat");
var _useInputReadOnly = _interopRequireDefault(require("./useInputReadOnly"));
var _useInvalidate = _interopRequireDefault(require("./useInvalidate"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function useList(value) {
  var fillMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var values = React.useMemo(function () {
    var list = value ? (0, _miscUtil.toArray)(value) : value;
    if (fillMode && list) {
      list[1] = list[1] || list[0];
    }
    return list;
  }, [value, fillMode]);
  return values;
}

/**
 * Align the outer props with unique typed and fill undefined props.
 * This is shared with both RangePicker and Picker. This will do:
 * - Convert `value` & `defaultValue` to array
 * - handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
function useFilledProps(props, updater) {
  var generateConfig = props.generateConfig,
    locale = props.locale,
    _props$picker = props.picker,
    picker = _props$picker === void 0 ? 'date' : _props$picker,
    _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'rc-picker' : _props$prefixCls,
    _props$previewValue = props.previewValue,
    previewValue = _props$previewValue === void 0 ? 'hover' : _props$previewValue,
    _props$styles = props.styles,
    styles = _props$styles === void 0 ? {} : _props$styles,
    _props$classNames = props.classNames,
    classNames = _props$classNames === void 0 ? {} : _props$classNames,
    _props$order = props.order,
    order = _props$order === void 0 ? true : _props$order,
    _props$components = props.components,
    components = _props$components === void 0 ? {} : _props$components,
    inputRender = props.inputRender,
    allowClear = props.allowClear,
    clearIcon = props.clearIcon,
    needConfirm = props.needConfirm,
    multiple = props.multiple,
    format = props.format,
    inputReadOnly = props.inputReadOnly,
    disabledDate = props.disabledDate,
    minDate = props.minDate,
    maxDate = props.maxDate,
    showTime = props.showTime,
    value = props.value,
    defaultValue = props.defaultValue,
    pickerValue = props.pickerValue,
    defaultPickerValue = props.defaultPickerValue;
  var values = useList(value);
  var defaultValues = useList(defaultValue);
  var pickerValues = useList(pickerValue);
  var defaultPickerValues = useList(defaultPickerValue);

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  var internalPicker = picker === 'date' && showTime ? 'datetime' : picker;

  /** The picker is `datetime` or `time` */
  var multipleInteractivePicker = internalPicker === 'time' || internalPicker === 'datetime';
  var complexPicker = multipleInteractivePicker || multiple;
  var mergedNeedConfirm = needConfirm !== null && needConfirm !== void 0 ? needConfirm : multipleInteractivePicker;

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  var _getTimeProps = (0, _useTimeConfig.getTimeProps)(props),
    _getTimeProps2 = _slicedToArray(_getTimeProps, 4),
    timeProps = _getTimeProps2[0],
    localeTimeProps = _getTimeProps2[1],
    showTimeFormat = _getTimeProps2[2],
    propFormat = _getTimeProps2[3];

  // ======================= Locales ========================
  var mergedLocale = (0, _useLocale.default)(locale, localeTimeProps);
  var mergedShowTime = React.useMemo(function () {
    return (0, _useTimeConfig.fillShowTimeConfig)(internalPicker, showTimeFormat, propFormat, timeProps, mergedLocale);
  }, [internalPicker, showTimeFormat, propFormat, timeProps, mergedLocale]);

  // ======================= Warning ========================
  if (process.env.NODE_ENV !== 'production' && picker === 'time') {
    if (['disabledHours', 'disabledMinutes', 'disabledSeconds'].some(function (key) {
      return props[key];
    })) {
      (0, _util.warning)(false, "'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.");
    }
  }

  // ======================== Props =========================
  var filledProps = React.useMemo(function () {
    return _objectSpread(_objectSpread({}, props), {}, {
      previewValue: previewValue,
      prefixCls: prefixCls,
      locale: mergedLocale,
      picker: picker,
      styles: styles,
      classNames: classNames,
      order: order,
      components: _objectSpread({
        input: inputRender
      }, components),
      clearIcon: (0, _useClearIcon.fillClearIcon)(prefixCls, allowClear, clearIcon),
      showTime: mergedShowTime,
      value: values,
      defaultValue: defaultValues,
      pickerValue: pickerValues,
      defaultPickerValue: defaultPickerValues
    }, updater === null || updater === void 0 ? void 0 : updater());
  }, [props]);

  // ======================== Format ========================
  var _useFieldFormat = (0, _useFieldFormat3.useFieldFormat)(internalPicker, mergedLocale, format),
    _useFieldFormat2 = _slicedToArray(_useFieldFormat, 2),
    formatList = _useFieldFormat2[0],
    maskFormat = _useFieldFormat2[1];

  // ======================= ReadOnly =======================
  var mergedInputReadOnly = (0, _useInputReadOnly.default)(formatList, inputReadOnly, multiple);

  // ======================= Boundary =======================
  var disabledBoundaryDate = (0, _useDisabledBoundary.default)(generateConfig, locale, disabledDate, minDate, maxDate);

  // ====================== Invalidate ======================
  var isInvalidateDate = (0, _useInvalidate.default)(generateConfig, picker, disabledBoundaryDate, mergedShowTime);

  // ======================== Merged ========================
  var mergedProps = React.useMemo(function () {
    return _objectSpread(_objectSpread({}, filledProps), {}, {
      needConfirm: mergedNeedConfirm,
      inputReadOnly: mergedInputReadOnly,
      disabledDate: disabledBoundaryDate
    });
  }, [filledProps, mergedNeedConfirm, mergedInputReadOnly, disabledBoundaryDate]);
  return [mergedProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate];
}