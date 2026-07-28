"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DislikeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DislikeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DislikeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DislikeOutlined.default
}));

/**![dislike](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS45IDQ5MC4zYzMuNi0xMiA1LjQtMjQuNCA1LjQtMzcgMC0yOC4zLTkuMy01NS41LTI2LjEtNzcuNyAzLjYtMTIgNS40LTI0LjQgNS40LTM3IDAtMjguMy05LjMtNTUuNS0yNi4xLTc3LjcgMy42LTEyIDUuNC0yNC40IDUuNC0zNyAwLTUxLjYtMzAuNy05OC4xLTc4LjMtMTE4LjRhNjYuMSA2Ni4xIDAgMDAtMjYuNS01LjRIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnYzNjRjMCAxNy43IDE0LjMgMzIgMzIgMzJoMTI5LjNsODUuOCAzMTAuOEMzNzIuOSA4ODkgNDE4LjkgOTI0IDQ3MC45IDkyNGMyOS43IDAgNTcuNC0xMS44IDc3LjktMzMuNCAyMC41LTIxLjUgMzEtNDkuNyAyOS41LTc5LjRsLTYtMTIyLjloMjM5LjljMTIuMSAwIDIzLjktMy4yIDM0LjMtOS4zIDQwLjQtMjMuNSA2NS41LTY2LjEgNjUuNS0xMTEgMC0yOC4zLTkuMy01NS41LTI2LjEtNzcuN3pNMTg0IDQ1NlYxNzJoODF2Mjg0aC04MXptNjI3LjIgMTYwLjRINDk2LjhsOS42IDE5OC40Yy42IDExLjktNC43IDIzLjEtMTQuNiAzMC41LTYuMSA0LjUtMTMuNiA2LjgtMjEuMSA2LjdhNDQuMjggNDQuMjggMCAwMS00Mi4yLTMyLjNMMzI5IDQ1OS4yVjE3Mmg0MTUuNGE1Ni44NSA1Ni44NSAwIDAxMzMuNiA1MS44YzAgOS43LTIuMyAxOC45LTYuOSAyNy4zbC0xMy45IDI1LjQgMjEuOSAxOWE1Ni43NiA1Ni43NiAwIDAxMTkuNiA0M2MwIDkuNy0yLjMgMTguOS02LjkgMjcuM2wtMTMuOSAyNS40IDIxLjkgMTlhNTYuNzYgNTYuNzYgMCAwMTE5LjYgNDNjMCA5LjctMi4zIDE4LjktNi45IDI3LjNsLTE0IDI1LjUgMjEuOSAxOWE1Ni43NiA1Ni43NiAwIDAxMTkuNiA0M2MwIDE5LjEtMTEgMzcuNS0yOC44IDQ4LjR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(DislikeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DislikeOutlined';
}
var _default = exports.default = RefIcon;