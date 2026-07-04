"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useLayoutUpdateEffect = exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _canUseDom = _interopRequireDefault(require("../Dom/canUseDom"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Wrap `React.useLayoutEffect` which will not throw warning message in test env
 */
const useInternalLayoutEffect = process.env.NODE_ENV !== 'test' && (0, _canUseDom.default)() ? React.useLayoutEffect : React.useEffect;
const useLayoutEffect = (callback, deps) => {
  const firstMountRef = React.useRef(true);
  useInternalLayoutEffect(() => {
    return callback(firstMountRef.current);
  }, deps);

  // We tell react that first mount has passed
  useInternalLayoutEffect(() => {
    firstMountRef.current = false;
    return () => {
      firstMountRef.current = true;
    };
  }, []);
};
const useLayoutUpdateEffect = (callback, deps) => {
  useLayoutEffect(firstMount => {
    if (!firstMount) {
      return callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
exports.useLayoutUpdateEffect = useLayoutUpdateEffect;
var _default = exports.default = useLayoutEffect;