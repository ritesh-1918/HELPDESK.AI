"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx2 = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _dateUtil = require("../../../utils/dateUtil");
var _context = _interopRequireDefault(require("../../context"));
var _Icon = _interopRequireWildcard(require("../Icon"));
var _Input = _interopRequireDefault(require("../Input"));
var _useInputProps3 = _interopRequireDefault(require("../hooks/useInputProps"));
var _useRootProps = _interopRequireDefault(require("../hooks/useRootProps"));
var _MultipleDates = _interopRequireDefault(require("./MultipleDates"));
var _excluded = ["id", "open", "prefix", "clearIcon", "suffixIcon", "activeHelp", "allHelp", "focused", "onFocus", "onBlur", "onKeyDown", "locale", "generateConfig", "placeholder", "className", "style", "onClick", "onClear", "internalPicker", "value", "onChange", "onSubmit", "onInputChange", "multiple", "maxTagCount", "format", "maskFormat", "preserveInvalidOnBlur", "onInvalid", "disabled", "invalid", "inputReadOnly", "direction", "onOpenChange", "onMouseDown", "required", "aria-required", "autoFocus", "tabIndex", "removeIcon"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function SingleSelector(props, ref) {
  var id = props.id,
    open = props.open,
    prefix = props.prefix,
    clearIcon = props.clearIcon,
    suffixIcon = props.suffixIcon,
    activeHelp = props.activeHelp,
    allHelp = props.allHelp,
    focused = props.focused,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    onKeyDown = props.onKeyDown,
    locale = props.locale,
    generateConfig = props.generateConfig,
    placeholder = props.placeholder,
    className = props.className,
    style = props.style,
    onClick = props.onClick,
    onClear = props.onClear,
    internalPicker = props.internalPicker,
    value = props.value,
    onChange = props.onChange,
    onSubmit = props.onSubmit,
    onInputChange = props.onInputChange,
    multiple = props.multiple,
    maxTagCount = props.maxTagCount,
    format = props.format,
    maskFormat = props.maskFormat,
    preserveInvalidOnBlur = props.preserveInvalidOnBlur,
    onInvalid = props.onInvalid,
    disabled = props.disabled,
    invalid = props.invalid,
    inputReadOnly = props.inputReadOnly,
    direction = props.direction,
    onOpenChange = props.onOpenChange,
    _onMouseDown = props.onMouseDown,
    required = props.required,
    ariaRequired = props['aria-required'],
    autoFocus = props.autoFocus,
    tabIndex = props.tabIndex,
    removeIcon = props.removeIcon,
    restProps = _objectWithoutProperties(props, _excluded);
  var rtl = direction === 'rtl';

  // ======================== Prefix ========================
  var _React$useContext = React.useContext(_context.default),
    prefixCls = _React$useContext.prefixCls,
    classNames = _React$useContext.classNames,
    styles = _React$useContext.styles;

  // ========================= Refs =========================
  var rootRef = React.useRef();
  var inputRef = React.useRef();
  React.useImperativeHandle(ref, function () {
    return {
      nativeElement: rootRef.current,
      focus: function focus(options) {
        var _inputRef$current;
        (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 || _inputRef$current.focus(options);
      },
      blur: function blur() {
        var _inputRef$current2;
        (_inputRef$current2 = inputRef.current) === null || _inputRef$current2 === void 0 || _inputRef$current2.blur();
      }
    };
  });

  // ======================== Props =========================
  var rootProps = (0, _useRootProps.default)(restProps);

  // ======================== Change ========================
  var onSingleChange = function onSingleChange(date) {
    onChange([date]);
  };
  var onMultipleRemove = function onMultipleRemove(date) {
    var nextValues = value.filter(function (oriDate) {
      return oriDate && !(0, _dateUtil.isSame)(generateConfig, locale, oriDate, date, internalPicker);
    });
    onChange(nextValues);

    // When `open`, it means user is operating the
    if (!open) {
      onSubmit();
    }
  };

  // ======================== Inputs ========================
  var _useInputProps = (0, _useInputProps3.default)(_objectSpread(_objectSpread({}, props), {}, {
      onChange: onSingleChange
    }), function (_ref) {
      var valueTexts = _ref.valueTexts;
      return {
        value: valueTexts[0] || '',
        active: focused
      };
    }),
    _useInputProps2 = _slicedToArray(_useInputProps, 2),
    getInputProps = _useInputProps2[0],
    getText = _useInputProps2[1];

  // ======================== Clear =========================
  var showClear = !!(clearIcon && value.length && !disabled);

  // ======================= Multiple =======================
  var selectorNode = multiple ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_MultipleDates.default, {
    prefixCls: prefixCls,
    value: value,
    onRemove: onMultipleRemove,
    formatDate: getText,
    maxTagCount: maxTagCount,
    disabled: disabled,
    removeIcon: removeIcon,
    placeholder: placeholder
  }), /*#__PURE__*/React.createElement("input", {
    className: "".concat(prefixCls, "-multiple-input"),
    value: value.map(getText).join(','),
    ref: inputRef,
    readOnly: true,
    autoFocus: autoFocus,
    tabIndex: tabIndex
  }), /*#__PURE__*/React.createElement(_Icon.default, {
    type: "suffix",
    icon: suffixIcon
  }), showClear && /*#__PURE__*/React.createElement(_Icon.ClearIcon, {
    icon: clearIcon,
    onClear: onClear
  })) : /*#__PURE__*/React.createElement(_Input.default, _extends({
    ref: inputRef
  }, getInputProps(), {
    autoFocus: autoFocus,
    tabIndex: tabIndex,
    suffixIcon: suffixIcon,
    clearIcon: showClear && /*#__PURE__*/React.createElement(_Icon.ClearIcon, {
      icon: clearIcon,
      onClear: onClear
    }),
    showActiveCls: false
  }));

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement("div", _extends({}, rootProps, {
    className: (0, _clsx2.clsx)(prefixCls, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(prefixCls, "-multiple"), multiple), "".concat(prefixCls, "-focused"), focused), "".concat(prefixCls, "-disabled"), disabled), "".concat(prefixCls, "-invalid"), invalid), "".concat(prefixCls, "-rtl"), rtl), className),
    style: style,
    ref: rootRef,
    onClick: onClick
    // Not lose current input focus
    ,
    onMouseDown: function onMouseDown(e) {
      var _inputRef$current3;
      var target = e.target;
      if (target !== ((_inputRef$current3 = inputRef.current) === null || _inputRef$current3 === void 0 ? void 0 : _inputRef$current3.inputElement)) {
        e.preventDefault();
      }
      _onMouseDown === null || _onMouseDown === void 0 || _onMouseDown(e);
    }
  }), prefix && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx2.clsx)("".concat(prefixCls, "-prefix"), classNames.prefix),
    style: styles.prefix
  }, prefix), selectorNode);
}
var RefSingleSelector = /*#__PURE__*/React.forwardRef(SingleSelector);
if (process.env.NODE_ENV !== 'production') {
  RefSingleSelector.displayName = 'SingleSelector';
}
var _default = exports.default = RefSingleSelector;