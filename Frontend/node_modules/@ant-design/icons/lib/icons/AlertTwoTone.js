"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AlertTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AlertTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AlertTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AlertTwoTone.default
}));

/**![alert](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM0MCA1ODVjMC01LjUgNC41LTEwIDEwLTEwaDQ0YzUuNSAwIDEwIDQuNSAxMCAxMHYxNzFoMzU1VjU2M2MwLTEzNi40LTExMC42LTI0Ny0yNDctMjQ3UzI2NSA0MjYuNiAyNjUgNTYzdjE5M2g3NVY1ODV6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik0yMTYuOSAzMTAuNWwzOS42LTM5LjZjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM2wtNjcuOS02Ny45YTguMDMgOC4wMyAwIDAwLTExLjMgMGwtMzkuNiAzOS42YTguMDMgOC4wMyAwIDAwMCAxMS4zbDY3LjkgNjcuOWMzLjEgMy4xIDguMSAzLjEgMTEuMyAwem02NjkuNi03OS4ybC0zOS42LTM5LjZhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC02Ny45IDY3LjlhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzkuNiAzOS42YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsNjcuOS02Ny45YzMuMS0zLjIgMy4xLTguMiAwLTExLjN6TTQ4NCAxODBoNTZjNC40IDAgOC0zLjYgOC04Vjc2YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY5NmMwIDQuNCAzLjYgOCA4IDh6bTM0OCA3MTJIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnYyNGMwIDQuNCAzLjYgOCA4IDhoNjg4YzQuNCAwIDgtMy42IDgtOHYtMjRjMC0xNy43LTE0LjMtMzItMzItMzJ6bS02MzktOTZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNTc0YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjU2M2MwLTE3Ni4yLTE0Mi44LTMxOS0zMTktMzE5UzE5MyAzODYuOCAxOTMgNTYzdjIzM3ptNzItMjMzYzAtMTM2LjQgMTEwLjYtMjQ3IDI0Ny0yNDdzMjQ3IDExMC42IDI0NyAyNDd2MTkzSDQwNFY1ODVjMC01LjUtNC41LTEwLTEwLTEwaC00NGMtNS41IDAtMTAgNC41LTEwIDEwdjE3MWgtNzVWNTYzeiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(AlertTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AlertTwoTone';
}
var _default = exports.default = RefIcon;