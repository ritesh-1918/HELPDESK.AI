"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Polite;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Polite(props) {
  const {
    visible,
    values
  } = props;
  if (!visible) {
    return null;
  }

  // Only cut part of values since it's a screen reader
  const MAX_COUNT = 50;
  return /*#__PURE__*/React.createElement("span", {
    "aria-live": "polite",
    style: {
      width: 0,
      height: 0,
      position: 'absolute',
      overflow: 'hidden',
      opacity: 0
    }
  }, `${values.slice(0, MAX_COUNT).map(({
    label,
    value
  }) => ['number', 'string'].includes(typeof label) ? label : value).join(', ')}`, values.length > MAX_COUNT ? ', ...' : null);
}