"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SpotifyOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SpotifyOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SpotifyOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SpotifyOutlined.default
}));

/**![spotify](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTEyIDY0QzI2NC41MiA2NCA2NCAyNjQuNTIgNjQgNTEyczIwMC41MiA0NDggNDQ4IDQ0OCA0NDgtMjAwLjUyIDQ0OC00NDhTNzU5LjQ4IDY0IDUxMiA2NG0wIDc0LjY2YTM3MS44NiAzNzEuODYgMCAwMTI2NC40MyAxMDguOTFBMzcxLjg2IDM3MS44NiAwIDAxODg1LjMzIDUxMmEzNzEuODYgMzcxLjg2IDAgMDEtMTA4LjkgMjY0LjQzQTM3MS44NiAzNzEuODYgMCAwMTUxMiA4ODUuMzNhMzcxLjg2IDM3MS44NiAwIDAxLTI2NC40My0xMDguOUEzNzEuODYgMzcxLjg2IDAgMDExMzguNjcgNTEyYTM3MS44NiAzNzEuODYgMCAwMTEwOC45LTI2NC40M0EzNzEuODYgMzcxLjg2IDAgMDE1MTIgMTM4LjY3TTQ1Mi40OSAzMTZjLTcyLjYxIDAtMTM1LjkgNi43Mi0xOTYgMjUuNjgtMTUuOSAzLjE4LTI5LjE2IDE1LjE2LTI5LjE2IDM3LjM0IDAgMjIuMTQgMTYuMzUgNDEuNyAzOC41IDM4LjQ1IDkuNDggMCAxNS45LTMuNDcgMjIuMTctMy40NyA1MC41OS0xMi43IDEwNy42My0xOC42NyAxNjQuNDktMTguNjcgMTEwLjU1IDAgMjI0IDI0LjY0IDI5OS44MiA2OC44NSA5LjQ5IDMuMiAxMi43IDYuOTggMjIuMTggNi45OCAyMi4xOCAwIDM3LjYzLTE2LjMyIDQwLjg0LTM4LjUgMC0xOC45Ni05LjQ4LTMxLjA2LTIyLjE3LTM3LjMzQzY5OC4zNiAzNDEuNjUgNTcyLjUyIDMxNiA0NTIuNDkgMzE2TTQ0MiA0NTQuODRjLTY2LjM0IDAtMTEzLjYgOS40OS0xNjEuMDIgMjIuMTgtMTUuNzIgNi4yMy0yNC40OSAxNi4wNS0yNC40OSAzNC45OCAwIDE1Ljc2IDEyLjU0IDMxLjUxIDMxLjUxIDMxLjUxIDYuNDIgMCA5LjE4LS4zIDE4LjY3LTMuNTEgMzQuNzItOS40OCA4Mi40LTE1LjE2IDEzMy4wMi0xNS4xNiAxMDQuMjMgMCAxOTQuOTUgMjUuMzkgMjYxLjMzIDY2LjUgNi4yMyAzLjIgMTIuNyA1LjgyIDIyLjE0IDUuODIgMTguOTYgMCAzMS41LTE2LjA2IDMxLjUtMzQuOTggMC0xMi43LTUuOTctMjUuMjQtMTguNjYtMzEuNTEtODIuMTMtNTAuNTktMTg2LjUyLTc1LjgzLTI5NC03NS44M20xMC40OSAxMzYuNWMtNTMuNjUgMC0xMDQuNTMgNS45Ny0xNTUuMTYgMTguNjYtMTIuNjkgMy4yMS0yMi4xNyAxMi4yNC0yMi4xNyAyOCAwIDEyLjcgOS45MyAyNS42OCAyNS42OCAyNS42OCAzLjIxIDAgMTIuNC0zLjUgMTguNjctMy41YTU4MS43MyA1ODEuNzMgMCAwMTEyOS41LTE1LjJjNzguOSAwIDE1MS4wNiAxOC45NyAyMTEuMTcgNTMuNjkgNi40MiAzLjIgMTMuNTUgNS44MiAxOS44MiA1LjgyIDEyLjcgMCAyNC43OS05LjQ4IDI4LTIyLjE0IDAtMTUuOS02Ljg3LTIxLjc2LTE2LjM1LTI4LTY5LjU1LTQxLjE0LTE1MC44LTYzLjAyLTIzOS4xNi02My4wMiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SpotifyOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SpotifyOutlined';
}
var _default = exports.default = RefIcon;