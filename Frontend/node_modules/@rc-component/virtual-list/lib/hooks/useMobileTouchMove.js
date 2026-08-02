"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useMobileTouchMove;
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _react = require("react");
const SMOOTH_PTG = 14 / 15;
function useMobileTouchMove(inVirtual, listRef, callback) {
  const touchedRef = (0, _react.useRef)(false);
  const touchXRef = (0, _react.useRef)(0);
  const touchYRef = (0, _react.useRef)(0);
  const elementRef = (0, _react.useRef)(null);

  // Smooth scroll
  const intervalRef = (0, _react.useRef)(null);

  /* eslint-disable prefer-const */
  let cleanUpEvents;
  const onTouchMove = e => {
    if (touchedRef.current) {
      const currentX = Math.ceil(e.touches[0].pageX);
      const currentY = Math.ceil(e.touches[0].pageY);
      let offsetX = touchXRef.current - currentX;
      let offsetY = touchYRef.current - currentY;
      const isHorizontal = Math.abs(offsetX) > Math.abs(offsetY);
      if (isHorizontal) {
        touchXRef.current = currentX;
      } else {
        touchYRef.current = currentY;
      }
      const scrollHandled = callback(isHorizontal, isHorizontal ? offsetX : offsetY, false, e);
      if (scrollHandled) {
        e.preventDefault();
      }

      // Smooth interval
      clearInterval(intervalRef.current);
      if (scrollHandled) {
        intervalRef.current = setInterval(() => {
          if (isHorizontal) {
            offsetX *= SMOOTH_PTG;
          } else {
            offsetY *= SMOOTH_PTG;
          }
          const offset = Math.floor(isHorizontal ? offsetX : offsetY);
          if (!callback(isHorizontal, offset, true) || Math.abs(offset) <= 0.1) {
            clearInterval(intervalRef.current);
          }
        }, 16);
      }
    }
  };
  const onTouchEnd = () => {
    touchedRef.current = false;
    cleanUpEvents();
  };
  const onTouchStart = e => {
    cleanUpEvents();
    if (e.touches.length === 1 && !touchedRef.current) {
      touchedRef.current = true;
      touchXRef.current = Math.ceil(e.touches[0].pageX);
      touchYRef.current = Math.ceil(e.touches[0].pageY);
      elementRef.current = e.target;
      elementRef.current.addEventListener('touchmove', onTouchMove, {
        passive: false
      });
      elementRef.current.addEventListener('touchend', onTouchEnd, {
        passive: true
      });
    }
  };
  cleanUpEvents = () => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchmove', onTouchMove);
      elementRef.current.removeEventListener('touchend', onTouchEnd);
    }
  };
  (0, _useLayoutEffect.default)(() => {
    if (inVirtual) {
      listRef.current.addEventListener('touchstart', onTouchStart, {
        passive: true
      });
    }
    return () => {
      listRef.current?.removeEventListener('touchstart', onTouchStart);
      cleanUpEvents();
      clearInterval(intervalRef.current);
    };
  }, [inVirtual]);
}