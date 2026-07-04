"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTouchMove;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const MIN_SWIPE_DISTANCE = 0.1;
const STOP_SWIPE_DISTANCE = 0.01;
const REFRESH_INTERVAL = 20;
const SPEED_OFF_MULTIPLE = 0.995 ** REFRESH_INTERVAL;

// ================================= Hook =================================
function useTouchMove(ref, onOffset) {
  const [touchPosition, setTouchPosition] = (0, _react.useState)();
  const [lastTimestamp, setLastTimestamp] = (0, _react.useState)(0);
  const [lastTimeDiff, setLastTimeDiff] = (0, _react.useState)(0);
  const [lastOffset, setLastOffset] = (0, _react.useState)();
  const motionRef = (0, _react.useRef)();

  // ========================= Events =========================
  // >>> Touch events
  function onTouchStart(e) {
    const {
      screenX,
      screenY
    } = e.touches[0];
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    window.clearInterval(motionRef.current);
  }
  function onTouchMove(e) {
    if (!touchPosition) return;

    // e.preventDefault();
    const {
      screenX,
      screenY
    } = e.touches[0];
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    const offsetX = screenX - touchPosition.x;
    const offsetY = screenY - touchPosition.y;
    onOffset(offsetX, offsetY);
    const now = Date.now();
    setLastTimestamp(now);
    setLastTimeDiff(now - lastTimestamp);
    setLastOffset({
      x: offsetX,
      y: offsetY
    });
  }
  function onTouchEnd() {
    if (!touchPosition) return;
    setTouchPosition(null);
    setLastOffset(null);

    // Swipe if needed
    if (lastOffset) {
      const distanceX = lastOffset.x / lastTimeDiff;
      const distanceY = lastOffset.y / lastTimeDiff;
      const absX = Math.abs(distanceX);
      const absY = Math.abs(distanceY);

      // Skip swipe if low distance
      if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE) return;
      let currentX = distanceX;
      let currentY = distanceY;
      motionRef.current = window.setInterval(() => {
        if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
          window.clearInterval(motionRef.current);
          return;
        }
        currentX *= SPEED_OFF_MULTIPLE;
        currentY *= SPEED_OFF_MULTIPLE;
        onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL);
      }, REFRESH_INTERVAL);
    }
  }

  // >>> Wheel event
  const lastWheelDirectionRef = (0, _react.useRef)();
  function onWheel(e) {
    const {
      deltaX,
      deltaY
    } = e;

    // Convert both to x & y since wheel only happened on PC
    let mixed = 0;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX === absY) {
      mixed = lastWheelDirectionRef.current === 'x' ? deltaX : deltaY;
    } else if (absX > absY) {
      mixed = deltaX;
      lastWheelDirectionRef.current = 'x';
    } else {
      mixed = deltaY;
      lastWheelDirectionRef.current = 'y';
    }
    if (onOffset(-mixed, -mixed)) {
      e.preventDefault();
    }
  }

  // ========================= Effect =========================
  const touchEventsRef = (0, _react.useRef)(null);
  touchEventsRef.current = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onWheel
  };
  React.useEffect(() => {
    function onProxyTouchStart(e) {
      touchEventsRef.current.onTouchStart(e);
    }
    function onProxyTouchMove(e) {
      touchEventsRef.current.onTouchMove(e);
    }
    function onProxyTouchEnd(e) {
      touchEventsRef.current.onTouchEnd(e);
    }
    function onProxyWheel(e) {
      touchEventsRef.current.onWheel(e);
    }
    document.addEventListener('touchmove', onProxyTouchMove, {
      passive: false
    });
    document.addEventListener('touchend', onProxyTouchEnd, {
      passive: true
    });

    // No need to clean up since element removed
    ref.current.addEventListener('touchstart', onProxyTouchStart, {
      passive: true
    });
    ref.current.addEventListener('wheel', onProxyWheel, {
      passive: false
    });
    return () => {
      document.removeEventListener('touchmove', onProxyTouchMove);
      document.removeEventListener('touchend', onProxyTouchEnd);
    };
  }, []);
}