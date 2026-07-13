"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CiTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CiTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CiTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CiTwoTone.default
}));

/**![ci](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6bS02My41IDUyMi44YzQ5LjMgMCA4Mi44LTI5LjQgODctNzIuNC40LTQuMSAzLjgtNy4zIDgtNy4zaDUyLjdjMi40IDAgNC40IDIgNC40IDQuNCAwIDc3LjQtNjQuMyAxMzIuNS0xNTIuMyAxMzIuNUMzNDUuNCA3MjAgMjg2IDY1MS40IDI4NiA1MzcuNHYtNDlDMjg2IDM3My41IDM0NS40IDMwNCA0NDguMyAzMDRjODguMyAwIDE1Mi4zIDU2LjkgMTUyLjMgMTM4LjEgMCAyLjQtMiA0LjQtNC40IDQuNGgtNTIuNmMtNC4yIDAtNy42LTMuMi04LTcuNC0zLjktNDYuMS0zNy41LTc3LjYtODctNzcuNi02MS4xIDAtOTUuNiA0NS40LTk1LjcgMTI2Ljh2NDkuM2MwIDgwLjMgMzQuNSAxMjUuMiA5NS42IDEyNS4yek03MzggNzA0LjFjMCA0LjQtMy42IDgtOCA4aC01MC40Yy00LjQgMC04LTMuNi04LThWMzE5LjljMC00LjQgMy42LTggOC04SDczMGM0LjQgMCA4IDMuNiA4IDh2Mzg0LjJ6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik03MzAgMzExLjloLTUwLjRjLTQuNCAwLTggMy42LTggOHYzODQuMmMwIDQuNCAzLjYgOCA4IDhINzMwYzQuNCAwIDgtMy42IDgtOFYzMTkuOWMwLTQuNC0zLjYtOC04LTh6bS0yODEuNCA0OS42YzQ5LjUgMCA4My4xIDMxLjUgODcgNzcuNi40IDQuMiAzLjggNy40IDggNy40aDUyLjZjMi40IDAgNC40LTIgNC40LTQuNCAwLTgxLjItNjQtMTM4LjEtMTUyLjMtMTM4LjFDMzQ1LjQgMzA0IDI4NiAzNzMuNSAyODYgNDg4LjR2NDljMCAxMTQgNTkuNCAxODIuNiAxNjIuMyAxODIuNiA4OCAwIDE1Mi4zLTU1LjEgMTUyLjMtMTMyLjUgMC0yLjQtMi00LjQtNC40LTQuNGgtNTIuN2MtNC4yIDAtNy42IDMuMi04IDcuMy00LjIgNDMtMzcuNyA3Mi40LTg3IDcyLjQtNjEuMSAwLTk1LjYtNDQuOS05NS42LTEyNS4ydi00OS4zYy4xLTgxLjQgMzQuNi0xMjYuOCA5NS43LTEyNi44eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CiTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CiTwoTone';
}
var _default = exports.default = RefIcon;