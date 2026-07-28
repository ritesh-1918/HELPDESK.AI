"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDrag;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _util = require("@rc-component/util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useDrag(options) {
  const {
    prefixCls,
    direction,
    className,
    style,
    maxSize,
    containerRef,
    currentSize,
    onResize,
    onResizeEnd,
    onResizeStart
  } = options;
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState(0);
  const [startSize, setStartSize] = React.useState(0);
  const isHorizontal = direction === 'left' || direction === 'right';
  const handleMouseDown = (0, _util.useEvent)(e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (isHorizontal) {
      setStartPos(e.clientX);
    } else {
      setStartPos(e.clientY);
    }

    // Use provided currentSize, or fallback to container size
    let startSize;
    if (typeof currentSize === 'number') {
      startSize = currentSize;
    } else if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      startSize = isHorizontal ? rect.width : rect.height;
    }
    setStartSize(startSize);
    onResizeStart?.(startSize);
  });
  const handleMouseMove = (0, _util.useEvent)(e => {
    if (!isDragging) return;
    const currentPos = isHorizontal ? e.clientX : e.clientY;
    let delta = currentPos - startPos;

    // Adjust delta direction based on placement
    if (direction === 'right' || direction === 'bottom') {
      delta = -delta;
    }
    let newSize = startSize + delta;

    // Apply min/max size limits
    if (newSize < 0) {
      newSize = 0;
    }
    // Only apply maxSize if it's a valid positive number
    if (maxSize && newSize > maxSize) {
      newSize = maxSize;
    }
    onResize?.(newSize);
  });
  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Get the final size after resize
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const finalSize = isHorizontal ? rect.width : rect.height;
        onResizeEnd?.(finalSize);
      }
    }
  }, [isDragging, containerRef, onResizeEnd, isHorizontal]);
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  const dragElementClassName = (0, _clsx.clsx)(`${prefixCls}-dragger`, `${prefixCls}-dragger-${direction}`, {
    [`${prefixCls}-dragger-dragging`]: isDragging,
    [`${prefixCls}-dragger-horizontal`]: isHorizontal,
    [`${prefixCls}-dragger-vertical`]: !isHorizontal
  }, className);
  return {
    dragElementProps: {
      className: dragElementClassName,
      style,
      onMouseDown: handleMouseDown
    },
    isDragging
  };
}