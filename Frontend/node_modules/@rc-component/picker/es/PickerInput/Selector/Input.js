function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["className", "active", "showActiveCls", "suffixIcon", "format", "validateFormat", "onChange", "onInput", "helped", "onHelp", "onSubmit", "onKeyDown", "preserveInvalidOnBlur", "invalid", "clearIcon"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
import { clsx } from 'clsx';
import { useEvent } from '@rc-component/util';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import raf from "@rc-component/util/es/raf";
import * as React from 'react';
import { leftPad } from "../../utils/miscUtil";
import PickerContext from "../context";
import useLockEffect from "../hooks/useLockEffect";
import Icon from "./Icon";
import MaskFormat from "./MaskFormat";
import { getMaskRange } from "./util";

// Format logic
//
// First time on focus:
//  1. check if the text is valid, if not fill with format
//  2. set highlight cell to the first cell
// Cells
//  1. Selection the index cell, set inner `cacheValue` to ''
//  2. Key input filter non-number char, patch after the `cacheValue`
//    1. Replace the `cacheValue` with input align the cell length
//    2. Re-selection the mask cell
//  3. If `cacheValue` match the limit length or cell format (like 1 ~ 12 month), go to next cell

var Input = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
    active = props.active,
    _props$showActiveCls = props.showActiveCls,
    showActiveCls = _props$showActiveCls === void 0 ? true : _props$showActiveCls,
    suffixIcon = props.suffixIcon,
    format = props.format,
    validateFormat = props.validateFormat,
    onChange = props.onChange,
    onInput = props.onInput,
    helped = props.helped,
    onHelp = props.onHelp,
    onSubmit = props.onSubmit,
    onKeyDown = props.onKeyDown,
    _props$preserveInvali = props.preserveInvalidOnBlur,
    preserveInvalidOnBlur = _props$preserveInvali === void 0 ? false : _props$preserveInvali,
    invalid = props.invalid,
    clearIcon = props.clearIcon,
    restProps = _objectWithoutProperties(props, _excluded);
  var value = props.value,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    onMouseUp = props.onMouseUp;
  var _React$useContext = React.useContext(PickerContext),
    prefixCls = _React$useContext.prefixCls,
    _React$useContext$inp = _React$useContext.input,
    Component = _React$useContext$inp === void 0 ? 'input' : _React$useContext$inp,
    classNames = _React$useContext.classNames,
    styles = _React$useContext.styles;
  var inputPrefixCls = "".concat(prefixCls, "-input");

  // ======================== Value =========================
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    focused = _React$useState2[0],
    setFocused = _React$useState2[1];
  var _React$useState3 = React.useState(value),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    internalInputValue = _React$useState4[0],
    setInputValue = _React$useState4[1];
  var _React$useState5 = React.useState(''),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    focusCellText = _React$useState6[0],
    setFocusCellText = _React$useState6[1];
  var _React$useState7 = React.useState(null),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    focusCellIndex = _React$useState8[0],
    setFocusCellIndex = _React$useState8[1];
  var _React$useState9 = React.useState(null),
    _React$useState10 = _slicedToArray(_React$useState9, 2),
    forceSelectionSyncMark = _React$useState10[0],
    forceSelectionSync = _React$useState10[1];
  var inputValue = internalInputValue || '';

  // Sync value if needed
  React.useEffect(function () {
    setInputValue(value);
  }, [value]);

  // ========================= Refs =========================
  var holderRef = React.useRef(null);
  var inputRef = React.useRef(null);
  React.useImperativeHandle(ref, function () {
    return {
      nativeElement: holderRef.current,
      inputElement: inputRef.current,
      focus: function focus(options) {
        inputRef.current.focus(options);
      },
      blur: function blur() {
        inputRef.current.blur();
      }
    };
  });

  // ======================== Format ========================
  var maskFormat = React.useMemo(function () {
    return new MaskFormat(format || '');
  }, [format]);
  var _React$useMemo = React.useMemo(function () {
      if (helped) {
        return [0, 0];
      }
      return maskFormat.getSelection(focusCellIndex);
    }, [maskFormat, focusCellIndex, helped]),
    _React$useMemo2 = _slicedToArray(_React$useMemo, 2),
    selectionStart = _React$useMemo2[0],
    selectionEnd = _React$useMemo2[1];

  // ======================== Modify ========================
  // When input modify content, trigger `onHelp` if is not the format
  var onModify = function onModify(text) {
    if (text && text !== format && text !== value) {
      onHelp();
    }
  };

  // ======================== Change ========================
  /**
   * Triggered by paste, keyDown and focus to show format
   */
  var triggerInputChange = useEvent(function (text) {
    if (validateFormat(text)) {
      onChange(text);
    }
    setInputValue(text);
    onModify(text);
  });

  // Directly trigger `onChange` if `format` is empty
  var onInternalChange = function onInternalChange(event) {
    // Hack `onChange` with format to do nothing
    if (!format) {
      var text = event.target.value;
      onModify(text);
      setInputValue(text);
      onChange(text);
    }
  };
  var onFormatPaste = function onFormatPaste(event) {
    // Get paste text
    var pasteText = event.clipboardData.getData('text');
    if (validateFormat(pasteText)) {
      triggerInputChange(pasteText);
    }
  };

  // ======================== Mouse =========================
  // When `mouseDown` get focus, it's better to not to change the selection
  // Since the up position maybe not is the first cell
  var mouseDownRef = React.useRef(false);
  var onFormatMouseDown = function onFormatMouseDown() {
    mouseDownRef.current = true;
  };
  var onFormatMouseUp = function onFormatMouseUp(event) {
    var _ref = event.target,
      start = _ref.selectionStart;
    var closeMaskIndex = maskFormat.getMaskCellIndex(start);
    setFocusCellIndex(closeMaskIndex);

    // Force update the selection
    forceSelectionSync({});
    onMouseUp === null || onMouseUp === void 0 || onMouseUp(event);
    mouseDownRef.current = false;
  };

  // ====================== Focus Blur ======================
  var onFormatFocus = function onFormatFocus(event) {
    setFocused(true);
    setFocusCellIndex(0);
    setFocusCellText('');
    onFocus(event);
  };
  var onSharedBlur = function onSharedBlur(event) {
    onBlur(event);
  };
  var onFormatBlur = function onFormatBlur(event) {
    setFocused(false);
    onSharedBlur(event);
  };

  // ======================== Active ========================
  // Check if blur need reset input value
  useLockEffect(active, function () {
    if (!active && !preserveInvalidOnBlur) {
      setInputValue(value);
    }
  });

  // ======================= Keyboard =======================
  var onSharedKeyDown = function onSharedKeyDown(event) {
    if (event.key === 'Enter' && validateFormat(inputValue)) {
      onSubmit();
    }
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(event);
  };
  var onFormatKeyDown = function onFormatKeyDown(event) {
    onSharedKeyDown(event);
    var key = event.key;

    // Save the cache with cell text
    var nextCellText = null;

    // Fill in the input
    var nextFillText = null;
    var maskCellLen = selectionEnd - selectionStart;
    var cellFormat = format.slice(selectionStart, selectionEnd);

    // Cell Index
    var offsetCellIndex = function offsetCellIndex(offset) {
      setFocusCellIndex(function (idx) {
        var nextIndex = idx + offset;
        nextIndex = Math.max(nextIndex, 0);
        nextIndex = Math.min(nextIndex, maskFormat.size() - 1);
        return nextIndex;
      });
    };

    // Range
    var offsetCellValue = function offsetCellValue(offset) {
      var _getMaskRange = getMaskRange(cellFormat),
        _getMaskRange2 = _slicedToArray(_getMaskRange, 3),
        rangeStart = _getMaskRange2[0],
        rangeEnd = _getMaskRange2[1],
        rangeDefault = _getMaskRange2[2];
      var currentText = inputValue.slice(selectionStart, selectionEnd);
      var currentTextNum = Number(currentText);
      if (isNaN(currentTextNum)) {
        return String(rangeDefault ? rangeDefault : offset > 0 ? rangeStart : rangeEnd);
      }
      var num = currentTextNum + offset;
      var range = rangeEnd - rangeStart + 1;
      return String(rangeStart + (range + num - rangeStart) % range);
    };
    switch (key) {
      // =============== Remove ===============
      case 'Backspace':
      case 'Delete':
        nextCellText = '';
        nextFillText = cellFormat;
        break;

      // =============== Arrows ===============
      // Left key
      case 'ArrowLeft':
        nextCellText = '';
        offsetCellIndex(-1);
        break;

      // Right key
      case 'ArrowRight':
        nextCellText = '';
        offsetCellIndex(1);
        break;

      // Up key
      case 'ArrowUp':
        nextCellText = '';
        nextFillText = offsetCellValue(1);
        break;

      // Down key
      case 'ArrowDown':
        nextCellText = '';
        nextFillText = offsetCellValue(-1);
        break;

      // =============== Number ===============
      default:
        if (!isNaN(Number(key))) {
          nextCellText = focusCellText + key;
          nextFillText = nextCellText;
        }
        break;
    }

    // Update cell text
    if (nextCellText !== null) {
      setFocusCellText(nextCellText);
      if (nextCellText.length >= maskCellLen) {
        // Go to next cell
        offsetCellIndex(1);
        setFocusCellText('');
      }
    }

    // Update the input text
    if (nextFillText !== null) {
      // Replace selection range with `nextCellText`
      var nextFocusValue =
      // before
      inputValue.slice(0, selectionStart) +
      // replace
      leftPad(nextFillText, maskCellLen) +
      // after
      inputValue.slice(selectionEnd);
      triggerInputChange(nextFocusValue.slice(0, format.length));
    }

    // Always trigger selection sync after key down
    forceSelectionSync({});
  };

  // ======================== Format ========================
  var rafRef = React.useRef();
  useLayoutEffect(function () {
    if (!focused || !format || mouseDownRef.current) {
      return;
    }

    // Reset with format if not match
    if (!maskFormat.match(inputValue)) {
      triggerInputChange(format);
      return;
    }

    // Match the selection range
    inputRef.current.setSelectionRange(selectionStart, selectionEnd);

    // Chrome has the bug anchor position looks not correct but actually correct
    rafRef.current = raf(function () {
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
    });
    return function () {
      raf.cancel(rafRef.current);
    };
  }, [maskFormat, format, focused, inputValue, focusCellIndex, selectionStart, selectionEnd, forceSelectionSyncMark, triggerInputChange]);

  // ======================== Render ========================
  // Input props for format
  var inputProps = format ? {
    onFocus: onFormatFocus,
    onBlur: onFormatBlur,
    onKeyDown: onFormatKeyDown,
    onMouseDown: onFormatMouseDown,
    onMouseUp: onFormatMouseUp,
    onPaste: onFormatPaste
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    ref: holderRef,
    className: clsx(inputPrefixCls, _defineProperty(_defineProperty({}, "".concat(inputPrefixCls, "-active"), active && showActiveCls), "".concat(inputPrefixCls, "-placeholder"), helped), className)
  }, /*#__PURE__*/React.createElement(Component, _extends({
    ref: inputRef,
    "aria-invalid": invalid,
    autoComplete: "off"
  }, restProps, {
    onKeyDown: onSharedKeyDown,
    onBlur: onSharedBlur
    // Replace with format
  }, inputProps, {
    // Value
    value: inputValue,
    onChange: onInternalChange,
    className: classNames.input,
    style: styles.input
  })), /*#__PURE__*/React.createElement(Icon, {
    type: "suffix",
    icon: suffixIcon
  }), clearIcon);
});
if (process.env.NODE_ENV !== 'production') {
  Input.displayName = 'Input';
}
export default Input;