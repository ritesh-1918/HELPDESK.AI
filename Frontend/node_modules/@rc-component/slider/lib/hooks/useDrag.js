"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _context = require("../context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/** Drag to delete offset. It's a user experience number for dragging out */
const REMOVE_DIST = 130;
function getPosition(e) {
  const obj = 'targetTouches' in e ? e.targetTouches[0] : e;
  return {
    pageX: obj.pageX,
    pageY: obj.pageY
  };
}
function useDrag(containerRef, direction, rawValues, min, max, formatValue, triggerChange, finishChange, offsetValues, editable, minCount) {
  const [draggingValue, setDraggingValue] = React.useState(null);
  const [draggingIndex, setDraggingIndex] = React.useState(-1);
  const [draggingDelete, setDraggingDelete] = React.useState(false);
  const [cacheValues, setCacheValues] = React.useState(rawValues);
  const [originValues, setOriginValues] = React.useState(rawValues);
  const mouseMoveEventRef = React.useRef(null);
  const mouseUpEventRef = React.useRef(null);
  const touchEventTargetRef = React.useRef(null);
  const {
    onDragStart,
    onDragChange
  } = React.useContext(_context.UnstableContext);
  (0, _useLayoutEffect.default)(() => {
    if (draggingIndex === -1) {
      setCacheValues(rawValues);
    }
  }, [rawValues, draggingIndex]);

  // Clean up event
  React.useEffect(() => () => {
    document.removeEventListener('mousemove', mouseMoveEventRef.current);
    document.removeEventListener('mouseup', mouseUpEventRef.current);
    if (touchEventTargetRef.current) {
      touchEventTargetRef.current.removeEventListener('touchmove', mouseMoveEventRef.current);
      touchEventTargetRef.current.removeEventListener('touchend', mouseUpEventRef.current);
    }
  }, []);
  const flushValues = (nextValues, nextValue, deleteMark) => {
    // Perf: Only update state when value changed
    if (nextValue !== undefined) {
      setDraggingValue(nextValue);
    }
    setCacheValues(nextValues);
    let changeValues = nextValues;
    if (deleteMark) {
      changeValues = nextValues.filter((_, i) => i !== draggingIndex);
    }
    triggerChange(changeValues);
    if (onDragChange) {
      onDragChange({
        rawValues: nextValues,
        deleteIndex: deleteMark ? draggingIndex : -1,
        draggingIndex,
        draggingValue: nextValue
      });
    }
  };
  const updateCacheValue = (0, _useEvent.default)((valueIndex, offsetPercent, deleteMark) => {
    if (valueIndex === -1) {
      // >>>> Dragging on the track
      const startValue = originValues[0];
      const endValue = originValues[originValues.length - 1];
      const maxStartOffset = min - startValue;
      const maxEndOffset = max - endValue;

      // Get valid offset
      let offset = offsetPercent * (max - min);
      offset = Math.max(offset, maxStartOffset);
      offset = Math.min(offset, maxEndOffset);

      // Use first value to revert back of valid offset (like steps marks)
      const formatStartValue = formatValue(startValue + offset);
      offset = formatStartValue - startValue;
      const cloneCacheValues = originValues.map(val => val + offset);
      flushValues(cloneCacheValues);
    } else {
      // >>>> Dragging on the handle
      const offsetDist = (max - min) * offsetPercent;

      // Always start with the valueIndex origin value
      const cloneValues = [...cacheValues];
      cloneValues[valueIndex] = originValues[valueIndex];
      const next = offsetValues(cloneValues, offsetDist, valueIndex, 'dist');
      flushValues(next.values, next.value, deleteMark);
    }
  });
  const onStartMove = (e, valueIndex, startValues) => {
    e.stopPropagation();

    // 如果是点击 track 触发的，需要传入变化后的初始值，而不能直接用 rawValues
    const initialValues = startValues || rawValues;
    const originValue = initialValues[valueIndex];
    setDraggingIndex(valueIndex);
    setDraggingValue(originValue);
    setOriginValues(initialValues);
    setCacheValues(initialValues);
    setDraggingDelete(false);
    const {
      pageX: startX,
      pageY: startY
    } = getPosition(e);

    // We declare it here since closure can't get outer latest value
    let deleteMark = false;

    // Internal trigger event
    if (onDragStart) {
      onDragStart({
        rawValues: initialValues,
        draggingIndex: valueIndex,
        draggingValue: originValue
      });
    }

    // Moving
    const onMouseMove = event => {
      event.preventDefault();
      const {
        pageX: moveX,
        pageY: moveY
      } = getPosition(event);
      const offsetX = moveX - startX;
      const offsetY = moveY - startY;
      const {
        width,
        height
      } = containerRef.current.getBoundingClientRect();
      let offSetPercent;
      let removeDist;
      switch (direction) {
        case 'btt':
          offSetPercent = -offsetY / height;
          removeDist = offsetX;
          break;
        case 'ttb':
          offSetPercent = offsetY / height;
          removeDist = offsetX;
          break;
        case 'rtl':
          offSetPercent = -offsetX / width;
          removeDist = offsetY;
          break;
        default:
          offSetPercent = offsetX / width;
          removeDist = offsetY;
      }

      // Check if need mark remove
      deleteMark = editable ? Math.abs(removeDist) > REMOVE_DIST && minCount < cacheValues.length : false;
      setDraggingDelete(deleteMark);
      updateCacheValue(valueIndex, offSetPercent, deleteMark);
    };

    // End
    const onMouseUp = event => {
      event.preventDefault();
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      if (touchEventTargetRef.current) {
        touchEventTargetRef.current.removeEventListener('touchmove', mouseMoveEventRef.current);
        touchEventTargetRef.current.removeEventListener('touchend', mouseUpEventRef.current);
      }
      mouseMoveEventRef.current = null;
      mouseUpEventRef.current = null;
      touchEventTargetRef.current = null;
      finishChange(deleteMark);
      setDraggingIndex(-1);
      setDraggingDelete(false);
    };
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    e.currentTarget.addEventListener('touchend', onMouseUp);
    e.currentTarget.addEventListener('touchmove', onMouseMove);
    mouseMoveEventRef.current = onMouseMove;
    mouseUpEventRef.current = onMouseUp;
    touchEventTargetRef.current = e.currentTarget;
  };

  // Only return cache value when it mapping with rawValues
  const returnValues = React.useMemo(() => {
    const sourceValues = [...rawValues].sort((a, b) => a - b);
    const targetValues = [...cacheValues].sort((a, b) => a - b);
    const counts = {};
    targetValues.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    sourceValues.forEach(val => {
      counts[val] = (counts[val] || 0) - 1;
    });
    const maxDiffCount = editable ? 1 : 0;
    const diffCount = Object.values(counts).reduce((prev, next) => prev + Math.abs(next), 0);
    return diffCount <= maxDiffCount ? cacheValues : rawValues;
  }, [rawValues, cacheValues, editable]);
  return [draggingIndex, draggingValue, draggingDelete, returnValues, onStartMove];
}
var _default = exports.default = useDrag;