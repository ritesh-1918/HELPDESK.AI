function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { clsx } from 'clsx';
import ResizeObserver from '@rc-component/resize-observer';
import * as React from 'react';
import { toArray } from "../../utils/miscUtil";
import PickerContext from "../context";
import Footer from "./Footer";
import PopupPanel from "./PopupPanel";
import PresetPanel from "./PresetPanel";
export default function Popup(props) {
  var _classNames$popup, _styles$popup;
  var panelRender = props.panelRender,
    internalMode = props.internalMode,
    picker = props.picker,
    showNow = props.showNow,
    range = props.range,
    multiple = props.multiple,
    _props$activeInfo = props.activeInfo,
    activeInfo = _props$activeInfo === void 0 ? [0, 0, 0] : _props$activeInfo,
    presets = props.presets,
    onPresetHover = props.onPresetHover,
    onPresetSubmit = props.onPresetSubmit,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    onPanelMouseDown = props.onPanelMouseDown,
    direction = props.direction,
    value = props.value,
    onSelect = props.onSelect,
    isInvalid = props.isInvalid,
    defaultOpenValue = props.defaultOpenValue,
    onOk = props.onOk,
    onSubmit = props.onSubmit,
    classNames = props.classNames,
    styles = props.styles;
  var _React$useContext = React.useContext(PickerContext),
    prefixCls = _React$useContext.prefixCls;
  var panelPrefixCls = "".concat(prefixCls, "-panel");
  var rtl = direction === 'rtl';

  // ========================= Refs =========================
  var arrowRef = React.useRef(null);
  var wrapperRef = React.useRef(null);

  // ======================== Offset ========================
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    containerWidth = _React$useState2[0],
    setContainerWidth = _React$useState2[1];
  var _React$useState3 = React.useState(0),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    containerOffset = _React$useState4[0],
    setContainerOffset = _React$useState4[1];
  var _React$useState5 = React.useState(0),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    arrowOffset = _React$useState6[0],
    setArrowOffset = _React$useState6[1];
  var onResize = function onResize(info) {
    if (info.width) {
      setContainerWidth(info.width);
    }
  };
  var _activeInfo = _slicedToArray(activeInfo, 3),
    activeInputLeft = _activeInfo[0],
    activeInputRight = _activeInfo[1],
    selectorWidth = _activeInfo[2];
  var _React$useState7 = React.useState(0),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    retryTimes = _React$useState8[0],
    setRetryTimes = _React$useState8[1];
  React.useEffect(function () {
    setRetryTimes(10);
  }, [activeInputLeft]);
  React.useEffect(function () {
    // `activeOffset` is always align with the active input element
    // So we need only check container contains the `activeOffset`
    if (range && wrapperRef.current) {
      var _arrowRef$current;
      // Offset in case container has border radius
      var arrowWidth = ((_arrowRef$current = arrowRef.current) === null || _arrowRef$current === void 0 ? void 0 : _arrowRef$current.offsetWidth) || 0;

      // Arrow Offset
      var wrapperRect = wrapperRef.current.getBoundingClientRect();
      if (!wrapperRect.height || wrapperRect.right < 0) {
        setRetryTimes(function (times) {
          return Math.max(0, times - 1);
        });
        return;
      }
      var nextArrowOffset = (rtl ? activeInputRight - arrowWidth : activeInputLeft) - wrapperRect.left;
      setArrowOffset(nextArrowOffset);

      // Container Offset
      if (containerWidth && containerWidth < selectorWidth) {
        var offset = rtl ? wrapperRect.right - (activeInputRight - arrowWidth + containerWidth) : activeInputLeft + arrowWidth - wrapperRect.left - containerWidth;
        var safeOffset = Math.max(0, offset);
        setContainerOffset(safeOffset);
      } else {
        setContainerOffset(0);
      }
    }
  }, [retryTimes, rtl, containerWidth, activeInputLeft, activeInputRight, selectorWidth, range]);

  // ======================== Custom ========================
  function filterEmpty(list) {
    return list.filter(function (item) {
      return item;
    });
  }
  var valueList = React.useMemo(function () {
    return filterEmpty(toArray(value));
  }, [value]);
  var isTimePickerEmptyValue = picker === 'time' && !valueList.length;
  var footerSubmitValue = React.useMemo(function () {
    if (isTimePickerEmptyValue) {
      return filterEmpty([defaultOpenValue]);
    }
    return valueList;
  }, [isTimePickerEmptyValue, valueList, defaultOpenValue]);
  var popupPanelValue = isTimePickerEmptyValue ? defaultOpenValue : valueList;
  var disableSubmit = React.useMemo(function () {
    // Empty is invalid
    if (!footerSubmitValue.length) {
      return true;
    }
    return footerSubmitValue.some(function (val) {
      return isInvalid(val);
    });
  }, [footerSubmitValue, isInvalid]);
  var onFooterSubmit = function onFooterSubmit() {
    // For TimePicker, we will additional trigger the value update
    if (isTimePickerEmptyValue) {
      onSelect(defaultOpenValue);
    }
    onOk();
    onSubmit();
  };
  var mergedNodes = /*#__PURE__*/React.createElement("div", {
    className: "".concat(prefixCls, "-panel-layout")
  }, /*#__PURE__*/React.createElement(PresetPanel, {
    prefixCls: prefixCls,
    presets: presets,
    onClick: onPresetSubmit,
    onHover: onPresetHover
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PopupPanel, _extends({}, props, {
    value: popupPanelValue
  })), /*#__PURE__*/React.createElement(Footer, _extends({}, props, {
    showNow: multiple ? false : showNow,
    invalid: disableSubmit,
    onSubmit: onFooterSubmit
  }))));
  if (panelRender) {
    mergedNodes = panelRender(mergedNodes);
  }

  // ======================== Render ========================
  var containerPrefixCls = "".concat(panelPrefixCls, "-container");
  var marginLeft = 'marginLeft';
  var marginRight = 'marginRight';

  // Container
  var renderNode = /*#__PURE__*/React.createElement("div", {
    onMouseDown: onPanelMouseDown,
    tabIndex: -1,
    className: clsx(containerPrefixCls, // Used for Today Button style, safe to remove if no need
    "".concat(prefixCls, "-").concat(internalMode, "-panel-container"), classNames === null || classNames === void 0 || (_classNames$popup = classNames.popup) === null || _classNames$popup === void 0 ? void 0 : _classNames$popup.container),
    style: _objectSpread(_defineProperty(_defineProperty({}, rtl ? marginRight : marginLeft, containerOffset), rtl ? marginLeft : marginRight, 'auto'), styles === null || styles === void 0 || (_styles$popup = styles.popup) === null || _styles$popup === void 0 ? void 0 : _styles$popup.container)
    // Still wish not to lose focus on mouse down
    // onMouseDown={(e) => {
    //   // e.preventDefault();
    // }}
    ,
    onFocus: onFocus,
    onBlur: onBlur
  }, mergedNodes);
  if (range) {
    renderNode = /*#__PURE__*/React.createElement("div", {
      onMouseDown: onPanelMouseDown,
      ref: wrapperRef,
      className: clsx("".concat(prefixCls, "-range-wrapper"), "".concat(prefixCls, "-").concat(picker, "-range-wrapper"))
    }, /*#__PURE__*/React.createElement("div", {
      ref: arrowRef,
      className: "".concat(prefixCls, "-range-arrow"),
      style: {
        left: arrowOffset
      }
    }), /*#__PURE__*/React.createElement(ResizeObserver, {
      onResize: onResize
    }, renderNode));
  }
  return renderNode;
}