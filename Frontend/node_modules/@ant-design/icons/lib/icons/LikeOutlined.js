"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LikeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LikeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LikeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LikeOutlined.default
}));

/**![like](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS45IDUzMy43YzE2LjgtMjIuMiAyNi4xLTQ5LjQgMjYuMS03Ny43IDAtNDQuOS0yNS4xLTg3LjQtNjUuNS0xMTEuMWE2Ny42NyA2Ny42NyAwIDAwLTM0LjMtOS4zSDU3Mi40bDYtMTIyLjljMS40LTI5LjctOS4xLTU3LjktMjkuNS03OS40QTEwNi42MiAxMDYuNjIgMCAwMDQ3MSA5OS45Yy01MiAwLTk4IDM1LTExMS44IDg1LjFsLTg1LjkgMzExSDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MzY0YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDYwMS4zYzkuMiAwIDE4LjItMS44IDI2LjUtNS40IDQ3LjYtMjAuMyA3OC4zLTY2LjggNzguMy0xMTguNCAwLTEyLjYtMS44LTI1LTUuNC0zNyAxNi44LTIyLjIgMjYuMS00OS40IDI2LjEtNzcuNyAwLTEyLjYtMS44LTI1LTUuNC0zNyAxNi44LTIyLjIgMjYuMS00OS40IDI2LjEtNzcuNy0uMi0xMi42LTItMjUuMS01LjYtMzcuMXpNMTg0IDg1MlY1NjhoODF2Mjg0aC04MXptNjM2LjQtMzUzbC0yMS45IDE5IDEzLjkgMjUuNGE1Ni4yIDU2LjIgMCAwMTYuOSAyNy4zYzAgMTYuNS03LjIgMzIuMi0xOS42IDQzbC0yMS45IDE5IDEzLjkgMjUuNGE1Ni4yIDU2LjIgMCAwMTYuOSAyNy4zYzAgMTYuNS03LjIgMzIuMi0xOS42IDQzbC0yMS45IDE5IDEzLjkgMjUuNGE1Ni4yIDU2LjIgMCAwMTYuOSAyNy4zYzAgMjIuNC0xMy4yIDQyLjYtMzMuNiA1MS44SDMyOVY1NjQuOGw5OS41LTM2MC41YTQ0LjEgNDQuMSAwIDAxNDIuMi0zMi4zYzcuNiAwIDE1LjEgMi4yIDIxLjEgNi43IDkuOSA3LjQgMTUuMiAxOC42IDE0LjYgMzAuNWwtOS42IDE5OC40aDMxNC40QzgyOSA0MTguNSA4NDAgNDM2LjkgODQwIDQ1NmMwIDE2LjUtNy4yIDMyLjEtMTkuNiA0M3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LikeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LikeOutlined';
}
var _default = exports.default = RefIcon;