"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useScrollDrag;
exports.getPageXY = getPageXY;
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var React = _interopRequireWildcard(require("react"));
function smoothScrollOffset(offset) {
  return Math.floor(offset ** 0.5);
}
function getPageXY(e, horizontal) {
  const obj = 'touches' in e ? e.touches[0] : e;
  return obj[horizontal ? 'pageX' : 'pageY'] - window[horizontal ? 'scrollX' : 'scrollY'];
}
function useScrollDrag(inVirtual, componentRef, onScrollOffset) {
  React.useEffect(() => {
    const ele = componentRef.current;
    if (inVirtual && ele) {
      let mouseDownLock = false;
      let rafId;
      let offset;
      const stopScroll = () => {
        _raf.default.cancel(rafId);
      };
      const continueScroll = () => {
        stopScroll();
        rafId = (0, _raf.default)(() => {
          onScrollOffset(offset);
          continueScroll();
        });
      };
      const clearDragState = () => {
        mouseDownLock = false;
        stopScroll();
      };
      const onMouseDown = e => {
        // Skip if element set draggable
        if (e.target.draggable || e.button !== 0) {
          return;
        }
        // Skip if nest List has handled this event
        const event = e;
        if (!event._virtualHandled) {
          event._virtualHandled = true;
          mouseDownLock = true;
        }
      };
      const onMouseMove = e => {
        if (mouseDownLock) {
          const mouseY = getPageXY(e, false);
          const {
            top,
            bottom
          } = ele.getBoundingClientRect();
          if (mouseY <= top) {
            const diff = top - mouseY;
            offset = -smoothScrollOffset(diff);
            continueScroll();
          } else if (mouseY >= bottom) {
            const diff = mouseY - bottom;
            offset = smoothScrollOffset(diff);
            continueScroll();
          } else {
            stopScroll();
          }
        }
      };
      ele.addEventListener('mousedown', onMouseDown);
      ele.ownerDocument.addEventListener('mouseup', clearDragState);
      ele.ownerDocument.addEventListener('mousemove', onMouseMove);
      ele.ownerDocument.addEventListener('dragend', clearDragState);
      return () => {
        ele.removeEventListener('mousedown', onMouseDown);
        ele.ownerDocument.removeEventListener('mouseup', clearDragState);
        ele.ownerDocument.removeEventListener('mousemove', onMouseMove);
        ele.ownerDocument.removeEventListener('dragend', clearDragState);
        stopScroll();
      };
    }
  }, [inVirtual]);
}