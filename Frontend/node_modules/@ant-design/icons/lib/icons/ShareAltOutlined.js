"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ShareAltOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ShareAltOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ShareAltOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ShareAltOutlined.default
}));

/**![share-alt](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc1MiA2NjRjLTI4LjUgMC01NC44IDEwLTc1LjQgMjYuN0w0NjkuNCA1NDAuOGExNjAuNjggMTYwLjY4IDAgMDAwLTU3LjZsMjA3LjItMTQ5LjlDNjk3LjIgMzUwIDcyMy41IDM2MCA3NTIgMzYwYzY2LjIgMCAxMjAtNTMuOCAxMjAtMTIwcy01My44LTEyMC0xMjAtMTIwLTEyMCA1My44LTEyMCAxMjBjMCAxMS42IDEuNiAyMi43IDQuNyAzMy4zTDQzOS45IDQxNS44QzQxMC43IDM3Ny4xIDM2NC4zIDM1MiAzMTIgMzUyYy04OC40IDAtMTYwIDcxLjYtMTYwIDE2MHM3MS42IDE2MCAxNjAgMTYwYzUyLjMgMCA5OC43LTI1LjEgMTI3LjktNjMuOGwxOTYuOCAxNDIuNWMtMy4xIDEwLjYtNC43IDIxLjgtNC43IDMzLjMgMCA2Ni4yIDUzLjggMTIwIDEyMCAxMjBzMTIwLTUzLjggMTIwLTEyMC01My44LTEyMC0xMjAtMTIwem0wLTQ3NmMyOC43IDAgNTIgMjMuMyA1MiA1MnMtMjMuMyA1Mi01MiA1Mi01Mi0yMy4zLTUyLTUyIDIzLjMtNTIgNTItNTJ6TTMxMiA2MDBjLTQ4LjUgMC04OC0zOS41LTg4LTg4czM5LjUtODggODgtODggODggMzkuNSA4OCA4OC0zOS41IDg4LTg4IDg4em00NDAgMjM2Yy0yOC43IDAtNTItMjMuMy01Mi01MnMyMy4zLTUyIDUyLTUyIDUyIDIzLjMgNTIgNTItMjMuMyA1Mi01MiA1MnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ShareAltOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ShareAltOutlined';
}
var _default = exports.default = RefIcon;