"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PropertySafetyTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PropertySafetyTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PropertySafetyTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PropertySafetyTwoTone.default
}));

/**![property-safety](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2Ni45IDE2OS45TDUyNy4xIDU0LjFDNTIzIDUyLjcgNTE3LjUgNTIgNTEyIDUycy0xMSAuNy0xNS4xIDIuMUwxNTcuMSAxNjkuOWMtOC4zIDIuOC0xNS4xIDEyLjQtMTUuMSAyMS4ydjQ4Mi40YzAgOC44IDUuNyAyMC40IDEyLjYgMjUuOUw0OTkuMyA5NjhjMy41IDIuNyA4IDQuMSAxMi42IDQuMXM5LjItMS40IDEyLjYtNC4xbDM0NC43LTI2OC42YzYuOS01LjQgMTIuNi0xNyAxMi42LTI1LjlWMTkxLjFjLjItOC44LTYuNi0xOC4zLTE0LjktMjEuMnpNODEwIDY1NC4zTDUxMiA4ODYuNSAyMTQgNjU0LjNWMjI2LjdsMjk4LTEwMS42IDI5OCAxMDEuNnY0MjcuNnoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTIxNCAyMjYuN3Y0MjcuNmwyOTggMjMyLjIgMjk4LTIzMi4yVjIyNi43TDUxMiAxMjUuMSAyMTQgMjI2Ljd6TTU5My45IDMxOGg0NWM1LjUgMCAxMCA0LjUgMTAgMTAgLjEgMS43LS4zIDMuMy0xLjEgNC44bC04Ny43IDE2MS4xaDQ1LjdjNS41IDAgMTAgNC41IDEwIDEwdjIxLjNjMCA1LjUtNC41IDEwLTEwIDEwaC02My40djI5LjdoNjMuNGM1LjUgMCAxMCA0LjUgMTAgMTB2MjEuM2MwIDUuNS00LjUgMTAtMTAgMTBoLTYzLjRWNjU4YzAgNS41LTQuNSAxMC0xMCAxMGgtNDEuM2MtNS41IDAtMTAtNC41LTEwLTEwdi01MS44SDQxOGMtNS41IDAtMTAtNC41LTEwLTEwdi0yMS4zYzAtNS41IDQuNS0xMCAxMC0xMGg2My4xdi0yOS43SDQxOGMtNS41IDAtMTAtNC41LTEwLTEwdi0yMS4zYzAtNS41IDQuNS0xMCAxMC0xMGg0NS4ybC04OC0xNjEuMWMtMi42LTQuOC0uOS0xMC45IDQtMTMuNiAxLjUtLjggMy4xLTEuMiA0LjgtMS4yaDQ2YzMuOCAwIDcuMiAyLjEgOC45IDUuNWw3Mi45IDE0NC4zTDU4NSAzMjMuNWExMCAxMCAwIDAxOC45LTUuNXoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTQzOC45IDMyMy41YTkuODggOS44OCAwIDAwLTguOS01LjVoLTQ2Yy0xLjcgMC0zLjMuNC00LjggMS4yLTQuOSAyLjctNi42IDguOC00IDEzLjZsODggMTYxLjFINDE4Yy01LjUgMC0xMCA0LjUtMTAgMTB2MjEuM2MwIDUuNSA0LjUgMTAgMTAgMTBoNjMuMXYyOS43SDQxOGMtNS41IDAtMTAgNC41LTEwIDEwdjIxLjNjMCA1LjUgNC41IDEwIDEwIDEwaDYzLjFWNjU4YzAgNS41IDQuNSAxMCAxMCAxMGg0MS4zYzUuNSAwIDEwLTQuNSAxMC0xMHYtNTEuOGg2My40YzUuNSAwIDEwLTQuNSAxMC0xMHYtMjEuM2MwLTUuNS00LjUtMTAtMTAtMTBoLTYzLjR2LTI5LjdoNjMuNGM1LjUgMCAxMC00LjUgMTAtMTB2LTIxLjNjMC01LjUtNC41LTEwLTEwLTEwaC00NS43bDg3LjctMTYxLjFjLjgtMS41IDEuMi0zLjEgMS4xLTQuOCAwLTUuNS00LjUtMTAtMTAtMTBoLTQ1YTEwIDEwIDAgMDAtOC45IDUuNWwtNzMuMiAxNDQuMy03Mi45LTE0NC4zeiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PropertySafetyTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PropertySafetyTwoTone';
}
var _default = exports.default = RefIcon;