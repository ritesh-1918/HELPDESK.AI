"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ShakeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ShakeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ShakeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ShakeOutlined.default
}));

/**![shake](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMyNCA2NjZhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem02MTYuNy0zMDkuNkw2NjcuNiA4My4yQzY1NS4yIDcwLjkgNjM4LjcgNjQgNjIxLjEgNjRzLTM0LjEgNi44LTQ2LjUgMTkuMkw4My4zIDU3NC41YTY1Ljg1IDY1Ljg1IDAgMDAwIDkzLjFsMjczLjIgMjczLjJjMTIuMyAxMi4zIDI4LjkgMTkuMiA0Ni41IDE5LjJzMzQuMS02LjggNDYuNS0xOS4ybDQ5MS4zLTQ5MS4zYzI1LjYtMjUuNyAyNS42LTY3LjUtLjEtOTMuMXpNNDAzIDg4MC4xTDE0My45IDYyMWw0NzcuMi00NzcuMiAyNTkgMjU5LjJMNDAzIDg4MC4xek0xNTIuOCAzNzMuN2E3LjkgNy45IDAgMDAxMS4yIDBMMzczLjcgMTY0YTcuOSA3LjkgMCAwMDAtMTEuMmwtMzguNC0zOC40YTcuOSA3LjkgMCAwMC0xMS4yIDBMMTE0LjMgMzIzLjlhNy45IDcuOSAwIDAwMCAxMS4ybDM4LjUgMzguNnptNzE4LjYgMjc2LjZhNy45IDcuOSAwIDAwLTExLjIgMEw2NTAuMyA4NjAuMWE3LjkgNy45IDAgMDAwIDExLjJsMzguNCAzOC40YTcuOSA3LjkgMCAwMDExLjIgMEw5MDkuNyA3MDBhNy45IDcuOSAwIDAwMC0xMS4ybC0zOC4zLTM4LjV6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ShakeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ShakeOutlined';
}
var _default = exports.default = RefIcon;