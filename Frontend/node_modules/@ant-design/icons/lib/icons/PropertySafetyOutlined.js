"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PropertySafetyOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PropertySafetyOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PropertySafetyOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PropertySafetyOutlined.default
}));

/**![property-safety](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2Ni45IDE2OS45TDUyNy4xIDU0LjFDNTIzIDUyLjcgNTE3LjUgNTIgNTEyIDUycy0xMSAuNy0xNS4xIDIuMUwxNTcuMSAxNjkuOWMtOC4zIDIuOC0xNS4xIDEyLjQtMTUuMSAyMS4ydjQ4Mi40YzAgOC44IDUuNyAyMC40IDEyLjYgMjUuOUw0OTkuMyA5NjhjMy41IDIuNyA4IDQuMSAxMi42IDQuMXM5LjItMS40IDEyLjYtNC4xbDM0NC43LTI2OC42YzYuOS01LjQgMTIuNi0xNyAxMi42LTI1LjlWMTkxLjFjLjItOC44LTYuNi0xOC4zLTE0LjktMjEuMnpNODEwIDY1NC4zTDUxMiA4ODYuNSAyMTQgNjU0LjNWMjI2LjdsMjk4LTEwMS42IDI5OCAxMDEuNnY0MjcuNnpNNDMwLjUgMzE4aC00NmMtMS43IDAtMy4zLjQtNC44IDEuMmExMC4xIDEwLjEgMCAwMC00IDEzLjZsODggMTYxLjFoLTQ1LjJjLTUuNSAwLTEwIDQuNS0xMCAxMHYyMS4zYzAgNS41IDQuNSAxMCAxMCAxMGg2My4xdjI5LjdoLTYzLjFjLTUuNSAwLTEwIDQuNS0xMCAxMHYyMS4zYzAgNS41IDQuNSAxMCAxMCAxMGg2My4xVjY1OGMwIDUuNSA0LjUgMTAgMTAgMTBoNDEuM2M1LjUgMCAxMC00LjUgMTAtMTB2LTUxLjhoNjMuNGM1LjUgMCAxMC00LjUgMTAtMTB2LTIxLjNjMC01LjUtNC41LTEwLTEwLTEwaC02My40di0yOS43aDYzLjRjNS41IDAgMTAtNC41IDEwLTEwdi0yMS4zYzAtNS41LTQuNS0xMC0xMC0xMGgtNDUuN2w4Ny43LTE2MS4xYTEwLjA1IDEwLjA1IDAgMDAtOC44LTE0LjhoLTQ1Yy0zLjggMC03LjIgMi4xLTguOSA1LjVsLTczLjIgMTQ0LjMtNzIuOS0xNDQuM2MtMS43LTMuNC01LjItNS41LTktNS41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PropertySafetyOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PropertySafetyOutlined';
}
var _default = exports.default = RefIcon;