"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collection = Collection;
exports.CollectionContext = void 0;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const CollectionContext = exports.CollectionContext = /*#__PURE__*/React.createContext(null);
/**
 * Collect all the resize event from children ResizeObserver
 */
function Collection({
  children,
  onBatchResize
}) {
  const resizeIdRef = React.useRef(0);
  const resizeInfosRef = React.useRef([]);
  const onCollectionResize = React.useContext(CollectionContext);
  const onResize = React.useCallback((size, element, data) => {
    resizeIdRef.current += 1;
    const currentId = resizeIdRef.current;
    resizeInfosRef.current.push({
      size,
      element,
      data
    });
    Promise.resolve().then(() => {
      if (currentId === resizeIdRef.current) {
        onBatchResize?.(resizeInfosRef.current);
        resizeInfosRef.current = [];
      }
    });

    // Continue bubbling if parent exist
    onCollectionResize?.(size, element, data);
  }, [onBatchResize, onCollectionResize]);
  return /*#__PURE__*/React.createElement(CollectionContext.Provider, {
    value: onResize
  }, children);
}