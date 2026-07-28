"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _Handles = _interopRequireDefault(require("./Handles"));
var _Marks = _interopRequireDefault(require("./Marks"));
var _Steps = _interopRequireDefault(require("./Steps"));
var _Tracks = _interopRequireDefault(require("./Tracks"));
var _context = _interopRequireDefault(require("./context"));
var _useDrag = _interopRequireDefault(require("./hooks/useDrag"));
var _useOffset = _interopRequireDefault(require("./hooks/useOffset"));
var _useRange = _interopRequireDefault(require("./hooks/useRange"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * New:
 * - click mark to update range value
 * - handleRender
 * - Fix handle with count not correct
 * - Fix pushable not work in some case
 * - No more FindDOMNode
 * - Move all position related style into inline style
 * - Key: up is plus, down is minus
 * - fix Key with step = null not align with marks
 * - Change range should not trigger onChange
 * - keyboard support pushable
 */

const Slider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-slider',
    className,
    style,
    classNames,
    styles,
    id,
    // Status
    disabled = false,
    keyboard = true,
    autoFocus,
    onFocus,
    onBlur,
    // Value
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    range,
    count,
    onChange,
    onBeforeChange,
    onAfterChange,
    onChangeComplete,
    // Cross
    allowCross = true,
    pushable = false,
    // Direction
    reverse,
    vertical,
    // Style
    included = true,
    startPoint,
    trackStyle,
    handleStyle,
    railStyle,
    dotStyle,
    activeDotStyle,
    // Decorations
    marks,
    dots,
    // Components
    handleRender,
    activeHandleRender,
    track,
    // Accessibility
    tabIndex = 0,
    ariaLabelForHandle,
    ariaLabelledByForHandle,
    ariaRequired,
    ariaValueTextFormatterForHandle
  } = props;
  const handlesRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const direction = React.useMemo(() => {
    if (vertical) {
      return reverse ? 'ttb' : 'btt';
    }
    return reverse ? 'rtl' : 'ltr';
  }, [reverse, vertical]);

  // ============================ Range =============================
  const [rangeEnabled, rangeEditable, rangeDraggableTrack, minCount, maxCount] = (0, _useRange.default)(range);
  const mergedMin = React.useMemo(() => isFinite(min) ? min : 0, [min]);
  const mergedMax = React.useMemo(() => isFinite(max) ? max : 100, [max]);

  // ============================= Step =============================
  const mergedStep = React.useMemo(() => step !== null && step <= 0 ? 1 : step, [step]);

  // ============================= Push =============================
  const mergedPush = React.useMemo(() => {
    if (typeof pushable === 'boolean') {
      return pushable ? mergedStep : false;
    }
    return pushable >= 0 ? pushable : false;
  }, [pushable, mergedStep]);

  // ============================ Marks =============================
  const markList = React.useMemo(() => {
    return Object.keys(marks || {}).map(key => {
      const mark = marks[key];
      const markObj = {
        value: Number(key)
      };
      if (mark && typeof mark === 'object' && ! /*#__PURE__*/React.isValidElement(mark) && ('label' in mark || 'style' in mark)) {
        markObj.style = mark.style;
        markObj.label = mark.label;
      } else {
        markObj.label = mark;
      }
      return markObj;
    }).filter(({
      label
    }) => label || typeof label === 'number').sort((a, b) => a.value - b.value);
  }, [marks]);

  // ============================ Format ============================
  const [formatValue, offsetValues] = (0, _useOffset.default)(mergedMin, mergedMax, mergedStep, markList, allowCross, mergedPush);

  // ============================ Values ============================
  const [mergedValue, setValue] = (0, _useControlledState.default)(defaultValue, value);
  const rawValues = React.useMemo(() => {
    const valueList = mergedValue === null || mergedValue === undefined ? [] : Array.isArray(mergedValue) ? mergedValue : [mergedValue];
    const [val0 = mergedMin] = valueList;
    let returnValues = mergedValue === null ? [] : [val0];

    // Format as range
    if (rangeEnabled) {
      returnValues = [...valueList];

      // When count provided or value is `undefined`, we fill values
      if (count || mergedValue === undefined) {
        const pointCount = count >= 0 ? count + 1 : 2;
        returnValues = returnValues.slice(0, pointCount);

        // Fill with count
        while (returnValues.length < pointCount) {
          returnValues.push(returnValues[returnValues.length - 1] ?? mergedMin);
        }
      }
      returnValues.sort((a, b) => a - b);
    }

    // Align in range
    returnValues.forEach((val, index) => {
      returnValues[index] = formatValue(val);
    });
    return returnValues;
  }, [mergedValue, rangeEnabled, mergedMin, count, formatValue]);

  // =========================== onChange ===========================
  const getTriggerValue = triggerValues => rangeEnabled ? triggerValues : triggerValues[0];
  const triggerChange = (0, _useEvent.default)(nextValues => {
    // Order first
    const cloneNextValues = [...nextValues].sort((a, b) => a - b);

    // Trigger event if needed
    if (onChange && !(0, _isEqual.default)(cloneNextValues, rawValues, true)) {
      onChange(getTriggerValue(cloneNextValues));
    }

    // We set this later since it will re-render component immediately
    setValue(cloneNextValues);
  });
  const finishChange = (0, _useEvent.default)(draggingDelete => {
    // Trigger from `useDrag` will tell if it's a delete action
    if (draggingDelete) {
      handlesRef.current.hideHelp();
    }
    const finishValue = getTriggerValue(rawValues);
    onAfterChange?.(finishValue);
    (0, _warning.default)(!onAfterChange, '[rc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.');
    onChangeComplete?.(finishValue);
  });
  const onDelete = index => {
    if (disabled || !rangeEditable || rawValues.length <= minCount) {
      return;
    }
    const cloneNextValues = [...rawValues];
    cloneNextValues.splice(index, 1);
    onBeforeChange?.(getTriggerValue(cloneNextValues));
    triggerChange(cloneNextValues);
    const nextFocusIndex = Math.max(0, index - 1);
    handlesRef.current.hideHelp();
    handlesRef.current.focus(nextFocusIndex);
  };
  const [draggingIndex, draggingValue, draggingDelete, cacheValues, onStartDrag] = (0, _useDrag.default)(containerRef, direction, rawValues, mergedMin, mergedMax, formatValue, triggerChange, finishChange, offsetValues, rangeEditable, minCount);

  /**
   * When `rangeEditable` will insert a new value in the values array.
   * Else it will replace the value in the values array.
   */
  const changeToCloseValue = (newValue, e) => {
    if (!disabled) {
      // Create new values
      const cloneNextValues = [...rawValues];
      let valueIndex = 0;
      let valueBeforeIndex = 0; // Record the index which value < newValue
      let valueDist = mergedMax - mergedMin;
      rawValues.forEach((val, index) => {
        const dist = Math.abs(newValue - val);
        if (dist <= valueDist) {
          valueDist = dist;
          valueIndex = index;
        }
        if (val < newValue) {
          valueBeforeIndex = index;
        }
      });
      let focusIndex = valueIndex;
      if (rangeEditable && valueDist !== 0 && (!maxCount || rawValues.length < maxCount)) {
        cloneNextValues.splice(valueBeforeIndex + 1, 0, newValue);
        focusIndex = valueBeforeIndex + 1;
      } else {
        cloneNextValues[valueIndex] = newValue;
      }

      // Fill value to match default 2 (only when `rawValues` is empty)
      if (rangeEnabled && !rawValues.length && count === undefined) {
        cloneNextValues.push(newValue);
      }
      const nextValue = getTriggerValue(cloneNextValues);
      onBeforeChange?.(nextValue);
      triggerChange(cloneNextValues);
      if (e) {
        document.activeElement?.blur?.();
        handlesRef.current.focus(focusIndex);
        onStartDrag(e, focusIndex, cloneNextValues);
      } else {
        // https://github.com/ant-design/ant-design/issues/49997
        onAfterChange?.(nextValue);
        (0, _warning.default)(!onAfterChange, '[rc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.');
        onChangeComplete?.(nextValue);
      }
    }
  };

  // ============================ Click =============================
  const onSliderMouseDown = e => {
    e.preventDefault();
    const {
      width,
      height,
      left,
      top,
      bottom,
      right
    } = containerRef.current.getBoundingClientRect();
    const {
      clientX,
      clientY
    } = e;
    let percent;
    switch (direction) {
      case 'btt':
        percent = (bottom - clientY) / height;
        break;
      case 'ttb':
        percent = (clientY - top) / height;
        break;
      case 'rtl':
        percent = (right - clientX) / width;
        break;
      default:
        percent = (clientX - left) / width;
    }
    const nextValue = mergedMin + percent * (mergedMax - mergedMin);
    changeToCloseValue(formatValue(nextValue), e);
  };

  // =========================== Keyboard ===========================
  const [keyboardValue, setKeyboardValue] = React.useState(null);
  const onHandleOffsetChange = (offset, valueIndex) => {
    if (!disabled) {
      const next = offsetValues(rawValues, offset, valueIndex);
      onBeforeChange?.(getTriggerValue(rawValues));
      triggerChange(next.values);
      setKeyboardValue(next.value);
    }
  };
  React.useEffect(() => {
    if (keyboardValue !== null) {
      const valueIndex = rawValues.indexOf(keyboardValue);
      if (valueIndex >= 0) {
        handlesRef.current.focus(valueIndex);
      }
    }
    setKeyboardValue(null);
  }, [keyboardValue]);

  // ============================= Drag =============================
  const mergedDraggableTrack = React.useMemo(() => {
    if (rangeDraggableTrack && mergedStep === null) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _warning.default)(false, '`draggableTrack` is not supported when `step` is `null`.');
      }
      return false;
    }
    return rangeDraggableTrack;
  }, [rangeDraggableTrack, mergedStep]);
  const onStartMove = (0, _useEvent.default)((e, valueIndex) => {
    onStartDrag(e, valueIndex);
    onBeforeChange?.(getTriggerValue(rawValues));
  });

  // Auto focus for updated handle
  const dragging = draggingIndex !== -1;
  React.useEffect(() => {
    if (!dragging) {
      const valueIndex = rawValues.lastIndexOf(draggingValue);
      handlesRef.current.focus(valueIndex);
    }
  }, [dragging]);

  // =========================== Included ===========================
  const sortedCacheValues = React.useMemo(() => [...cacheValues].sort((a, b) => a - b), [cacheValues]);

  // Provide a range values with included [min, max]
  // Used for Track, Mark & Dot
  const [includedStart, includedEnd] = React.useMemo(() => {
    if (!rangeEnabled) {
      return [mergedMin, sortedCacheValues[0]];
    }
    return [sortedCacheValues[0], sortedCacheValues[sortedCacheValues.length - 1]];
  }, [sortedCacheValues, rangeEnabled, mergedMin]);

  // ============================= Refs =============================
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      handlesRef.current.focus(0);
    },
    blur: () => {
      const {
        activeElement
      } = document;
      if (containerRef.current?.contains(activeElement)) {
        activeElement?.blur();
      }
    }
  }));

  // ========================== Auto Focus ==========================
  React.useEffect(() => {
    if (autoFocus) {
      handlesRef.current.focus(0);
    }
  }, []);

  // =========================== Context ============================
  const context = React.useMemo(() => ({
    min: mergedMin,
    max: mergedMax,
    direction,
    disabled,
    keyboard,
    step: mergedStep,
    included,
    includedStart,
    includedEnd,
    range: rangeEnabled,
    tabIndex,
    ariaLabelForHandle,
    ariaLabelledByForHandle,
    ariaRequired,
    ariaValueTextFormatterForHandle,
    styles: styles || {},
    classNames: classNames || {}
  }), [mergedMin, mergedMax, direction, disabled, keyboard, mergedStep, included, includedStart, includedEnd, rangeEnabled, tabIndex, ariaLabelForHandle, ariaLabelledByForHandle, ariaRequired, ariaValueTextFormatterForHandle, styles, classNames]);

  // ============================ Render ============================
  return /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    className: (0, _clsx.clsx)(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-vertical`]: vertical,
      [`${prefixCls}-horizontal`]: !vertical,
      [`${prefixCls}-with-marks`]: markList.length
    }),
    style: style,
    onMouseDown: onSliderMouseDown,
    id: id
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-rail`, classNames?.rail),
    style: {
      ...railStyle,
      ...styles?.rail
    }
  }), track !== false && /*#__PURE__*/React.createElement(_Tracks.default, {
    prefixCls: prefixCls,
    style: trackStyle,
    values: rawValues,
    startPoint: startPoint,
    onStartMove: mergedDraggableTrack ? onStartMove : undefined
  }), /*#__PURE__*/React.createElement(_Steps.default, {
    prefixCls: prefixCls,
    marks: markList,
    dots: dots,
    style: dotStyle,
    activeStyle: activeDotStyle
  }), /*#__PURE__*/React.createElement(_Handles.default, {
    ref: handlesRef,
    prefixCls: prefixCls,
    style: handleStyle,
    values: cacheValues,
    draggingIndex: draggingIndex,
    draggingDelete: draggingDelete,
    onStartMove: onStartMove,
    onOffsetChange: onHandleOffsetChange,
    onFocus: onFocus,
    onBlur: onBlur,
    handleRender: handleRender,
    activeHandleRender: activeHandleRender,
    onChangeComplete: finishChange,
    onDelete: rangeEditable ? onDelete : undefined
  }), /*#__PURE__*/React.createElement(_Marks.default, {
    prefixCls: prefixCls,
    marks: markList,
    onClick: changeToCloseValue
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Slider.displayName = 'Slider';
}
var _default = exports.default = Slider;