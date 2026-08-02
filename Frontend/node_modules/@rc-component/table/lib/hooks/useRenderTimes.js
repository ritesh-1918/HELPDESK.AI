"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RenderBlock = void 0;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/* istanbul ignore file */

function useRenderTimes(props, debug) {
  // Render times
  const timesRef = React.useRef(0);
  timesRef.current += 1;

  // Props changed
  const propsRef = React.useRef(props);
  const keys = [];
  Object.keys(props || {}).map(key => {
    if (props?.[key] !== propsRef.current?.[key]) {
      keys.push(key);
    }
  });
  propsRef.current = props;

  // Cache keys since React rerender may cause it lost
  const keysRef = React.useRef([]);
  if (keys.length) {
    keysRef.current = keys;
  }
  React.useDebugValue(timesRef.current);
  React.useDebugValue(keysRef.current.join(', '));
  if (debug) {
    console.log(`${debug}:`, timesRef.current, keysRef.current);
  }
  return timesRef.current;
}
var _default = exports.default = process.env.NODE_ENV !== 'production' ? useRenderTimes : () => {};
const RenderBlock = exports.RenderBlock = /*#__PURE__*/React.memo(() => {
  const times = useRenderTimes();
  return /*#__PURE__*/React.createElement("h1", null, "Render Times: ", times);
});
if (process.env.NODE_ENV !== 'production') {
  RenderBlock.displayName = 'RenderBlock';
}