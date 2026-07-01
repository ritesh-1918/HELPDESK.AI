"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useMouseEvent;
var _warning = require("@rc-component/util/lib/warning");
var _react = require("react");
var _getFixScaleEleTransPosition = _interopRequireDefault(require("../getFixScaleEleTransPosition"));
var _previewConfig = require("../previewConfig");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useMouseEvent(imgRef, movable, open, scaleStep, transform, updateTransform, dispatchZoomChange) {
  const {
    rotate,
    scale,
    x,
    y
  } = transform;
  const [isMoving, setMoving] = (0, _react.useState)(false);
  const startPositionInfo = (0, _react.useRef)({
    diffX: 0,
    diffY: 0,
    transformX: 0,
    transformY: 0
  });
  const onMouseDown = event => {
    // Only allow main button
    if (!movable || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    startPositionInfo.current = {
      diffX: event.pageX - x,
      diffY: event.pageY - y,
      transformX: x,
      transformY: y
    };
    setMoving(true);
  };
  const onMouseMove = event => {
    if (open && isMoving) {
      updateTransform({
        x: event.pageX - startPositionInfo.current.diffX,
        y: event.pageY - startPositionInfo.current.diffY
      }, 'move');
    }
  };
  const onMouseUp = () => {
    if (open && isMoving) {
      setMoving(false);

      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */
      const {
        transformX,
        transformY
      } = startPositionInfo.current;
      const hasChangedPosition = x !== transformX && y !== transformY;
      if (!hasChangedPosition) return;
      const width = imgRef.current.offsetWidth * scale;
      const height = imgRef.current.offsetHeight * scale;
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {
        left,
        top
      } = imgRef.current.getBoundingClientRect();
      const isRotate = rotate % 180 !== 0;
      const fixState = (0, _getFixScaleEleTransPosition.default)(isRotate ? height : width, isRotate ? width : height, left, top);
      if (fixState) {
        updateTransform({
          ...fixState
        }, 'dragRebound');
      }
    }
  };
  const onWheel = event => {
    if (!open || event.deltaY == 0) return;
    // Scale ratio depends on the deltaY size
    const scaleRatio = Math.abs(event.deltaY / 100);
    // Limit the maximum scale ratio
    const mergedScaleRatio = Math.min(scaleRatio, _previewConfig.WHEEL_MAX_SCALE_RATIO);
    // Scale the ratio each time
    let ratio = _previewConfig.BASE_SCALE_RATIO + mergedScaleRatio * scaleStep;
    if (event.deltaY > 0) {
      ratio = _previewConfig.BASE_SCALE_RATIO / ratio;
    }
    dispatchZoomChange(ratio, 'wheel', event.clientX, event.clientY);
  };
  (0, _react.useEffect)(() => {
    if (movable) {
      window.addEventListener('mouseup', onMouseUp, false);
      window.addEventListener('mousemove', onMouseMove, false);
      try {
        // Resolve if in iframe lost event
        /* istanbul ignore next */
        if (window.top !== window.self) {
          window.top.addEventListener('mouseup', onMouseUp, false);
          window.top.addEventListener('mousemove', onMouseMove, false);
        }
      } catch (error) {
        /* istanbul ignore next */
        (0, _warning.warning)(false, `[rc-image] ${error}`);
      }
    }
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);

      /* istanbul ignore next */
      try {
        window.top?.removeEventListener('mouseup', onMouseUp);
        window.top?.removeEventListener('mousemove', onMouseMove);
      } catch (error) {
        // Do nothing
      }
    };
  }, [open, isMoving, x, y, rotate, movable]);
  return {
    isMoving,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel
  };
}