"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
function getPosition(e) {
  const obj = 'touches' in e ? e.touches[0] : e;
  const scrollXOffset = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
  const scrollYOffset = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
  return {
    pageX: obj.pageX - scrollXOffset,
    pageY: obj.pageY - scrollYOffset
  };
}
function useColorDrag(props) {
  const {
    targetRef,
    containerRef,
    direction,
    onDragChange,
    onDragChangeComplete,
    calculate,
    color,
    disabledDrag
  } = props;
  const [offsetValue, setOffsetValue] = (0, _react.useState)({
    x: 0,
    y: 0
  });
  const mouseMoveRef = (0, _react.useRef)(null);
  const mouseUpRef = (0, _react.useRef)(null);

  // Always get position from `color`
  (0, _react.useEffect)(() => {
    setOffsetValue(calculate());
  }, [color]);
  (0, _react.useEffect)(() => () => {
    document.removeEventListener('mousemove', mouseMoveRef.current);
    document.removeEventListener('mouseup', mouseUpRef.current);
    document.removeEventListener('touchmove', mouseMoveRef.current);
    document.removeEventListener('touchend', mouseUpRef.current);
    mouseMoveRef.current = null;
    mouseUpRef.current = null;
  }, []);
  const updateOffset = e => {
    const {
      pageX,
      pageY
    } = getPosition(e);
    const {
      x: rectX,
      y: rectY,
      width,
      height
    } = containerRef.current.getBoundingClientRect();
    const {
      width: targetWidth,
      height: targetHeight
    } = targetRef.current.getBoundingClientRect();
    const centerOffsetX = targetWidth / 2;
    const centerOffsetY = targetHeight / 2;
    const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
    const offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;
    const calcOffset = {
      x: offsetX,
      y: direction === 'x' ? offsetValue.y : offsetY
    };

    // Exclusion of boundary cases
    if (targetWidth === 0 && targetHeight === 0 || targetWidth !== targetHeight) {
      return false;
    }
    onDragChange?.(calcOffset);
  };
  const onDragMove = e => {
    e.preventDefault();
    updateOffset(e);
  };
  const onDragStop = e => {
    e.preventDefault();
    document.removeEventListener('mousemove', mouseMoveRef.current);
    document.removeEventListener('mouseup', mouseUpRef.current);
    document.removeEventListener('touchmove', mouseMoveRef.current);
    document.removeEventListener('touchend', mouseUpRef.current);
    mouseMoveRef.current = null;
    mouseUpRef.current = null;
    onDragChangeComplete?.();
  };
  const onDragStart = e => {
    // https://github.com/ant-design/ant-design/issues/43529
    document.removeEventListener('mousemove', mouseMoveRef.current);
    document.removeEventListener('mouseup', mouseUpRef.current);
    if (disabledDrag) {
      return;
    }
    updateOffset(e);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragStop);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragStop);
    mouseMoveRef.current = onDragMove;
    mouseUpRef.current = onDragStop;
  };
  return [offsetValue, onDragStart];
}
var _default = exports.default = useColorDrag;