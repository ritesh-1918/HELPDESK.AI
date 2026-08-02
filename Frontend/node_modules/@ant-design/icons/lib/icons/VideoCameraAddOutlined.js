"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _VideoCameraAddOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/VideoCameraAddOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const VideoCameraAddOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _VideoCameraAddOutlined.default
}));

/**![video-camera-add](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik0zNjggNzI0SDI1MlY2MDhjMC00LjQtMy42LTgtOC04aC00OGMtNC40IDAtOCAzLjYtOCA4djExNkg3MmMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgxMTZ2MTE2YzAgNC40IDMuNiA4IDggOGg0OGM0LjQgMCA4LTMuNiA4LThWNzg4aDExNmM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHoiIC8+PHBhdGggZD0iTTkxMiAzMDIuM0w3ODQgMzc2VjIyNGMwLTM1LjMtMjguNy02NC02NC02NEgxMjhjLTM1LjMgMC02NCAyOC43LTY0IDY0djM1Mmg3MlYyMzJoNTc2djU2MEg0NDh2NzJoMjcyYzM1LjMgMCA2NC0yOC43IDY0LTY0VjY0OGwxMjggNzMuN2MyMS4zIDEyLjMgNDgtMy4xIDQ4LTI3LjZWMzMwYzAtMjQuNi0yNi43LTQwLTQ4LTI3Ljd6TTg4OCA2MjVsLTEwNC01OS44VjQ1OC45TDg4OCAzOTl2MjI2eiIgLz48cGF0aCBkPSJNMzIwIDM2MGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOEgyMDhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTEyeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(VideoCameraAddOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'VideoCameraAddOutlined';
}
var _default = exports.default = RefIcon;