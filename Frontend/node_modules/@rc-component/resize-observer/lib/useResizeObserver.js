"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useResizeObserver;
var React = _interopRequireWildcard(require("react"));
var _observerUtil = require("./utils/observerUtil");
var _util = require("@rc-component/util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useResizeObserver(enabled, getTarget, onDelayResize, onSyncResize) {
  // ============================= Size =============================
  const sizeRef = React.useRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1
  });

  // =========================== Observe ============================

  // Handler
  const onInternalResize = (0, _util.useEvent)(target => {
    const {
      width,
      height
    } = target.getBoundingClientRect();
    const {
      offsetWidth,
      offsetHeight
    } = target;

    /**
     * Resize observer trigger when content size changed.
     * In most case we just care about element size,
     * let's use `boundary` instead of `contentRect` here to avoid shaking.
     */
    const fixedWidth = Math.floor(width);
    const fixedHeight = Math.floor(height);
    if (sizeRef.current.width !== fixedWidth || sizeRef.current.height !== fixedHeight || sizeRef.current.offsetWidth !== offsetWidth || sizeRef.current.offsetHeight !== offsetHeight) {
      const size = {
        width: fixedWidth,
        height: fixedHeight,
        offsetWidth,
        offsetHeight
      };
      sizeRef.current = size;

      // IE is strange, right?
      const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
      const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;
      const sizeInfo = {
        ...size,
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight
      };

      // Call the callback immediately, let the caller decide whether to defer
      // onResize(sizeInfo, target);
      onSyncResize?.(sizeInfo, target);

      // defer the callback but not defer to next frame
      Promise.resolve().then(() => {
        onDelayResize?.(sizeInfo, target);
      });
    }
  });

  // Dynamic observe
  const isFuncTarget = typeof getTarget === 'function';
  React.useEffect(() => {
    const target = isFuncTarget ? getTarget() : getTarget;
    if (target && enabled) {
      (0, _observerUtil.observe)(target, onInternalResize);
    }
    return () => {
      if (target) {
        (0, _observerUtil.unobserve)(target, onInternalResize);
      }
    };
  }, [enabled,
  // When is function, no need to watch it
  isFuncTarget ? 0 : getTarget]);
}