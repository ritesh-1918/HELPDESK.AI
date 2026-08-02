"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useFrameWheel;
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _react = require("react");
var _isFirefox = _interopRequireDefault(require("../utils/isFirefox"));
var _useOriginScroll = _interopRequireDefault(require("./useOriginScroll"));
function useFrameWheel(inVirtual, isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight, horizontalScroll,
/***
 * Return `true` when you need to prevent default event
 */
onWheelDelta) {
  const offsetRef = (0, _react.useRef)(0);
  const nextFrameRef = (0, _react.useRef)(null);

  // Firefox patch
  const wheelValueRef = (0, _react.useRef)(null);
  const isMouseScrollRef = (0, _react.useRef)(false);

  // Scroll status sync
  const originScroll = (0, _useOriginScroll.default)(isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight);
  function onWheelY(e, deltaY) {
    _raf.default.cancel(nextFrameRef.current);

    // Do nothing when scroll at the edge, Skip check when is in scroll
    if (originScroll(false, deltaY)) return;

    // Skip if nest List has handled this event
    const event = e;
    if (!event._virtualHandled) {
      event._virtualHandled = true;
    } else {
      return;
    }
    offsetRef.current += deltaY;
    wheelValueRef.current = deltaY;

    // Proxy of scroll events
    if (!_isFirefox.default) {
      event.preventDefault();
    }
    nextFrameRef.current = (0, _raf.default)(() => {
      // Patch a multiple for Firefox to fix wheel number too small
      // ref: https://github.com/ant-design/ant-design/issues/26372#issuecomment-679460266
      const patchMultiple = isMouseScrollRef.current ? 10 : 1;
      onWheelDelta(offsetRef.current * patchMultiple, false);
      offsetRef.current = 0;
    });
  }
  function onWheelX(event, deltaX) {
    onWheelDelta(deltaX, true);
    if (!_isFirefox.default) {
      event.preventDefault();
    }
  }

  // Check for which direction does wheel do. `sx` means `shift + wheel`
  const wheelDirectionRef = (0, _react.useRef)(null);
  const wheelDirectionCleanRef = (0, _react.useRef)(null);
  function onWheel(event) {
    if (!inVirtual) return;

    // Wait for 2 frame to clean direction
    _raf.default.cancel(wheelDirectionCleanRef.current);
    wheelDirectionCleanRef.current = (0, _raf.default)(() => {
      wheelDirectionRef.current = null;
    }, 2);
    const {
      deltaX,
      deltaY,
      shiftKey
    } = event;
    let mergedDeltaX = deltaX;
    let mergedDeltaY = deltaY;
    if (wheelDirectionRef.current === 'sx' || !wheelDirectionRef.current && (shiftKey || false) && deltaY && !deltaX) {
      mergedDeltaX = deltaY;
      mergedDeltaY = 0;
      wheelDirectionRef.current = 'sx';
    }
    const absX = Math.abs(mergedDeltaX);
    const absY = Math.abs(mergedDeltaY);
    if (wheelDirectionRef.current === null) {
      wheelDirectionRef.current = horizontalScroll && absX > absY ? 'x' : 'y';
    }
    if (wheelDirectionRef.current === 'y') {
      onWheelY(event, mergedDeltaY);
    } else {
      onWheelX(event, mergedDeltaX);
    }
  }

  // A patch for firefox
  function onFireFoxScroll(event) {
    if (!inVirtual) return;
    isMouseScrollRef.current = event.detail === wheelValueRef.current;
  }
  return [onWheel, onFireFoxScroll];
}