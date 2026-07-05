"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _VideoCameraTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/VideoCameraTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const VideoCameraTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _VideoCameraTwoTone.default
}));

/**![video-camera](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEzNiA3OTJoNTc2VjIzMkgxMzZ2NTYwem02NC00ODhjMC00LjQgMy42LTggOC04aDExMmM0LjQgMCA4IDMuNiA4IDh2NDhjMCA0LjQtMy42IDgtOCA4SDIwOGMtNC40IDAtOC0zLjYtOC04di00OHoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTkxMiAzMDIuM0w3ODQgMzc2VjIyNGMwLTM1LjMtMjguNy02NC02NC02NEgxMjhjLTM1LjMgMC02NCAyOC43LTY0IDY0djU3NmMwIDM1LjMgMjguNyA2NCA2NCA2NGg1OTJjMzUuMyAwIDY0LTI4LjcgNjQtNjRWNjQ4bDEyOCA3My43YzIxLjMgMTIuMyA0OC0zLjEgNDgtMjcuNlYzMzBjMC0yNC42LTI2LjctNDAtNDgtMjcuN3pNNzEyIDc5MkgxMzZWMjMyaDU3NnY1NjB6bTE3Ni0xNjdsLTEwNC01OS44VjQ1OC45TDg4OCAzOTl2MjI2eiIgZmlsbD0iIzE2NzdmZiIgLz48cGF0aCBkPSJNMjA4IDM2MGgxMTJjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMjA4Yy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(VideoCameraTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'VideoCameraTwoTone';
}
var _default = exports.default = RefIcon;