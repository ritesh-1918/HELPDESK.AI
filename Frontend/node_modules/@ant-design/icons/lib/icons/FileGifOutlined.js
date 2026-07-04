"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileGifOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileGifOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileGifOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileGifOutlined.default
}));

/**![file-gif](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik01NTEuNSA0OTAuNUg1MjFjLTQuNiAwLTguNCAzLjctOC40IDguNFY3MjBjMCA0LjYgMy43IDguNCA4LjQgOC40aDMwLjVjNC42IDAgOC40LTMuNyA4LjQtOC40VjQ5OC45Yy0uMS00LjYtMy44LTguNC04LjQtOC40ek00NzcuMyA2MDBoLTg4LjFjLTQuNiAwLTguNCAzLjctOC40IDguNHYyMy44YzAgNC42IDMuNyA4LjQgOC40IDguNGg0Ny42di43Yy0uNiAyOS45LTIzIDQ5LjgtNTYuNSA0OS44LTM5LjIgMC02My42LTMwLjctNjMuNi04MS40IDAtNTAuMSAyMy45LTgwLjYgNjIuMy04MC42IDI4LjEgMCA0Ny41IDEzLjUgNTUuNCAzOC4zbC45IDIuOGg0OS4ybC0uNy00LjZDNDc1LjkgNTE1LjkgNDM0LjcgNDg0IDM3OSA0ODRjLTY4LjggMC0xMTMgNDkuNC0xMTMgMTI1LjkgMCA3Ny41IDQzLjcgMTI2LjEgMTEzLjYgMTI2LjEgNjQuNCAwIDEwNi00MC4zIDEwNi0xMDIuOXYtMjQuOGMwLTQuNi0zLjctOC4zLTguMy04LjN6IiAvPjxwYXRoIGQ9Ik04NTQuNiAyODguNkw2MzkuNCA3My40Yy02LTYtMTQuMS05LjQtMjIuNi05LjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjMxMS4zYzAtOC41LTMuNC0xNi43LTkuNC0yMi43ek02MDIgMTM3LjhMNzkwLjIgMzI2SDYwMlYxMzcuOHpNNzkyIDg4OEgyMzJWMTM2aDMwMnYyMTZhNDIgNDIgMCAwMDQyIDQyaDIxNnY0OTR6IiAvPjxwYXRoIGQ9Ik02MDguMiA3MjcuOGgzMi4zYzQuNiAwIDguNC0zLjcgOC40LTguNHYtODQuOGg4Ny44YzQuNiAwIDguNC0zLjcgOC40LTguNHYtMjUuNWMwLTQuNi0zLjctOC40LTguNC04LjRoLTg3Ljh2LTU4LjloOTYuOGM0LjYgMCA4LjQtMy43IDguNC04LjR2LTI2LjhjMC00LjYtMy43LTguNC04LjQtOC40SDYwOC4yYy00LjYgMC04LjQgMy43LTguNCA4LjR2MjIxLjFjMCA0LjggMy44IDguNSA4LjQgOC41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileGifOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileGifOutlined';
}
var _default = exports.default = RefIcon;