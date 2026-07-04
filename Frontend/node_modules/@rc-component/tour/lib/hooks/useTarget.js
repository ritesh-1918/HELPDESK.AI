"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTarget;
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _react = require("react");
var _util = require("../util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function isValidNumber(val) {
  return typeof val === 'number' && !Number.isNaN(val);
}
function useTarget(target, open, gap, scrollIntoViewOptions, inlineMode, placeholderRef) {
  // ========================= Target =========================
  // We trade `undefined` as not get target by function yet.
  // `null` as empty target.
  const [targetElement, setTargetElement] = (0, _react.useState)(undefined);
  (0, _useLayoutEffect.default)(() => {
    const nextElement = typeof target === 'function' ? target() : target;
    setTargetElement(nextElement || null);
  });

  // ========================= Align ==========================
  const [posInfo, setPosInfo] = (0, _react.useState)(null);
  const updatePos = (0, _useEvent.default)(() => {
    if (targetElement) {
      // Exist target element. We should scroll and get target position
      if (!inlineMode && !(0, _util.isInViewPort)(targetElement) && open) {
        targetElement.scrollIntoView(scrollIntoViewOptions);
      }
      const {
        left,
        top,
        width,
        height
      } = targetElement.getBoundingClientRect();
      const nextPosInfo = {
        left,
        top,
        width,
        height,
        radius: 0
      };

      // If `inlineMode` we need cut off parent offset
      if (inlineMode) {
        const parentRect = placeholderRef.current?.parentElement?.getBoundingClientRect();
        if (parentRect) {
          nextPosInfo.left -= parentRect.left;
          nextPosInfo.top -= parentRect.top;
        }
      }
      setPosInfo(origin => {
        if (JSON.stringify(origin) !== JSON.stringify(nextPosInfo)) {
          return nextPosInfo;
        }
        return origin;
      });
    } else {
      // Not exist target which means we just show in center
      setPosInfo(null);
    }
  });
  const getGapOffset = index => (Array.isArray(gap?.offset) ? gap?.offset[index] : gap?.offset) ?? 6;
  (0, _useLayoutEffect.default)(() => {
    updatePos();
    // update when window resize
    window.addEventListener('resize', updatePos);
    // update when `document.body.style.overflow` is set to visible
    // by default, it will be set to hidden
    window.addEventListener('scroll', updatePos);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos);
    };
  }, [targetElement, open, updatePos]);

  // ======================== PosInfo =========================
  const mergedPosInfo = (0, _react.useMemo)(() => {
    if (!posInfo) {
      return posInfo;
    }
    const gapOffsetX = getGapOffset(0);
    const gapOffsetY = getGapOffset(1);
    const gapRadius = isValidNumber(gap?.radius) ? gap?.radius : 2;
    return {
      left: posInfo.left - gapOffsetX,
      top: posInfo.top - gapOffsetY,
      width: posInfo.width + gapOffsetX * 2,
      height: posInfo.height + gapOffsetY * 2,
      radius: gapRadius
    };
  }, [posInfo, gap]);
  return [mergedPosInfo, targetElement];
}