"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _VideoCameraOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/VideoCameraOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const VideoCameraOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _VideoCameraOutlined.default
}));

/**![video-camera](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkxMiAzMDIuM0w3ODQgMzc2VjIyNGMwLTM1LjMtMjguNy02NC02NC02NEgxMjhjLTM1LjMgMC02NCAyOC43LTY0IDY0djU3NmMwIDM1LjMgMjguNyA2NCA2NCA2NGg1OTJjMzUuMyAwIDY0LTI4LjcgNjQtNjRWNjQ4bDEyOCA3My43YzIxLjMgMTIuMyA0OC0zLjEgNDgtMjcuNlYzMzBjMC0yNC42LTI2LjctNDAtNDgtMjcuN3pNNzEyIDc5MkgxMzZWMjMyaDU3NnY1NjB6bTE3Ni0xNjdsLTEwNC01OS44VjQ1OC45TDg4OCAzOTl2MjI2ek0yMDggMzYwaDExMmM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOEgyMDhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(VideoCameraOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'VideoCameraOutlined';
}
var _default = exports.default = RefIcon;