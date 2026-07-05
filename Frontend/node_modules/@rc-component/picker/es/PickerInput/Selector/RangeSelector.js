var _excluded = ["id", "prefix", "clearIcon", "suffixIcon", "separator", "activeIndex", "activeHelp", "allHelp", "focused", "onFocus", "onBlur", "onKeyDown", "locale", "generateConfig", "placeholder", "className", "style", "onClick", "onClear", "value", "onChange", "onSubmit", "onInputChange", "format", "maskFormat", "preserveInvalidOnBlur", "onInvalid", "disabled", "invalid", "inputReadOnly", "direction", "onOpenChange", "onActiveInfo", "placement", "onMouseDown", "required", "aria-required", "autoFocus", "tabIndex"],
  _excluded2 = ["index"];
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import { clsx } from 'clsx';
import ResizeObserver from '@rc-component/resize-observer';
import { useEvent } from '@rc-component/util';
import * as React from 'react';
import PickerContext from "../context";
import useInputProps from "./hooks/useInputProps";
import useRootProps from "./hooks/useRootProps";
import Icon, { ClearIcon } from "./Icon";
import Input from "./Input";
function RangeSelector(props, ref) {
  var id = props.id,
    prefix = props.prefix,
    clearIcon = props.clearIcon,
    suffixIcon = props.suffixIcon,
    _props$separator = props.separator,
    separator = _props$separator === void 0 ? '~' : _props$separator,
    activeIndex = props.activeIndex,
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
    value = props.value,
    onChange = props.onChange,
    onSubmit = props.onSubmit,
    onInputChange = props.onInputChange,
    format = props.format,
    maskFormat = props.maskFormat,
    preserveInvalidOnBlur = props.preserveInvalidOnBlur,
    onInvalid = props.onInvalid,
    disabled = props.disabled,
    invalid = props.invalid,
    inputReadOnly = props.inputReadOnly,
    direction = props.direction,
    onOpenChange = props.onOpenChange,
    onActiveInfo = props.onActiveInfo,
    placement = props.placement,
    _onMouseDown = props.onMouseDown,
    required = props.required,
    ariaRequired = props['aria-required'],
    autoFocus = props.autoFocus,
    tabIndex = props.tabIndex,
    restProps = _objectWithoutProperties(props, _excluded);
  var rtl = direction === 'rtl';

  // ======================== Prefix ========================
  var _React$useContext = React.useContext(PickerContext),
    prefixCls = _React$useContext.prefixCls,
    classNames = _React$useContext.classNames,
    styles = _React$useContext.styles;

  // ========================== Id ==========================
  var ids = React.useMemo(function () {
    if (typeof id === 'string') {
      return [id];
    }
    var mergedId = id || {};
    return [mergedId.start, mergedId.end];
  }, [id]);

  // ========================= Refs =========================
  var rootRef = React.useRef();
  var inputStartRef = React.useRef();
  var inputEndRef = React.useRef();
  var getInput = function getInput(index) {
    var _index;
    return (_index = [inputStartRef, inputEndRef][index]) === null || _index === void 0 ? void 0 : _index.current;
  };
  React.useImperativeHandle(ref, function () {
    return {
      nativeElement: rootRef.current,
      focus: function focus(options) {
        if (_typeof(options) === 'object') {
          var _getInput;
          var _ref = options || {},
            _ref$index = _ref.index,
            _index2 = _ref$index === void 0 ? 0 : _ref$index,
            rest = _objectWithoutProperties(_ref, _excluded2);
          (_getInput = getInput(_index2)) === null || _getInput === void 0 || _getInput.focus(rest);
        } else {
          var _getInput2;
          (_getInput2 = getInput(options !== null && options !== void 0 ? options : 0)) === null || _getInput2 === void 0 || _getInput2.focus();
        }
      },
      blur: function blur() {
        var _getInput3, _getInput4;
        (_getInput3 = getInput(0)) === null || _getInput3 === void 0 || _getInput3.blur();
        (_getInput4 = getInput(1)) === null || _getInput4 === void 0 || _getInput4.blur();
      }
    };
  });

  // ======================== Props =========================
  var rootProps = useRootProps(restProps);

  // ===================== Placeholder ======================
  var mergedPlaceholder = React.useMemo(function () {
    return Array.isArray(placeholder) ? placeholder : [placeholder, placeholder];
  }, [placeholder]);

  // ======================== Inputs ========================
  var _useInputProps = useInputProps(_objectSpread(_objectSpread({}, props), {}, {
      id: ids,
      placeholder: mergedPlaceholder
    })),
    _useInputProps2 = _slicedToArray(_useInputProps, 1),
    getInputProps = _useInputProps2[0];

  // ====================== ActiveBar =======================
  var _React$useState = React.useState({
      position: 'absolute',
      width: 0
    }),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    activeBarStyle = _React$useState2[0],
    setActiveBarStyle = _React$useState2[1];
  var syncActiveOffset = useEvent(function () {
    var input = getInput(activeIndex);
    if (input) {
      var inputRect = input.nativeElement.getBoundingClientRect();
      var parentRect = rootRef.current.getBoundingClientRect();
      var rectOffset = inputRect.left - parentRect.left;
      setActiveBarStyle(function (ori) {
        return _objectSpread(_objectSpread({}, ori), {}, {
          width: inputRect.width,
          left: rectOffset
        });
      });
      onActiveInfo([inputRect.left, inputRect.right, parentRect.width]);
    }
  });
  React.useEffect(function () {
    syncActiveOffset();
  }, [activeIndex]);

  // ======================== Clear =========================
  var showClear = clearIcon && (value[0] && !disabled[0] || value[1] && !disabled[1]);

  // ======================= Disabled =======================
  var startAutoFocus = autoFocus && !disabled[0];
  var endAutoFocus = autoFocus && !startAutoFocus && !disabled[1];

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(ResizeObserver, {
    onResize: syncActiveOffset
  }, /*#__PURE__*/React.createElement("div", _extends({}, rootProps, {
    className: clsx(prefixCls, "".concat(prefixCls, "-range"), _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "".concat(prefixCls, "-focused"), focused), "".concat(prefixCls, "-disabled"), disabled.every(function (i) {
      return i;
    })), "".concat(prefixCls, "-invalid"), invalid.some(function (i) {
      return i;
    })), "".concat(prefixCls, "-rtl"), rtl), className),
    style: style,
    ref: rootRef,
    onClick: onClick
    // Not lose current input focus
    ,
    onMouseDown: function onMouseDown(e) {
      var target = e.target;
      if (target !== inputStartRef.current.inputElement && target !== inputEndRef.current.inputElement) {
        e.preventDefault();
      }
      _onMouseDown === null || _onMouseDown === void 0 || _onMouseDown(e);
    }
  }), prefix && /*#__PURE__*/React.createElement("div", {
    className: clsx("".concat(prefixCls, "-prefix"), classNames.prefix),
    style: styles.prefix
  }, prefix), /*#__PURE__*/React.createElement(Input, _extends({
    ref: inputStartRef
  }, getInputProps(0), {
    className: "".concat(prefixCls, "-input-start"),
    autoFocus: startAutoFocus,
    tabIndex: tabIndex,
    "date-range": "start"
  })), /*#__PURE__*/React.createElement("div", {
    className: "".concat(prefixCls, "-range-separator")
  }, separator), /*#__PURE__*/React.createElement(Input, _extends({
    ref: inputEndRef
  }, getInputProps(1), {
    className: "".concat(prefixCls, "-input-end"),
    autoFocus: endAutoFocus,
    tabIndex: tabIndex,
    "date-range": "end"
  })), /*#__PURE__*/React.createElement("div", {
    className: "".concat(prefixCls, "-active-bar"),
    style: activeBarStyle
  }), /*#__PURE__*/React.createElement(Icon, {
    type: "suffix",
    icon: suffixIcon
  }), showClear && /*#__PURE__*/React.createElement(ClearIcon, {
    icon: clearIcon,
    onClear: onClear
  })));
}
var RefRangeSelector = /*#__PURE__*/React.forwardRef(RangeSelector);
if (process.env.NODE_ENV !== 'production') {
  RefRangeSelector.displayName = 'RangeSelector';
}
export default RefRangeSelector;