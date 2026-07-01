"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ShopFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ShopFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ShopFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ShopFilled.default
}));

/**![shop](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MiAyNzIuMVYxNDRjMC0xNy43LTE0LjMtMzItMzItMzJIMTc0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnYxMjguMWMtMTYuNyAxLTMwIDE0LjktMzAgMzEuOXYxMzEuN2ExNzcgMTc3IDAgMDAxNC40IDcwLjRjNC4zIDEwLjIgOS42IDE5LjggMTUuNiAyOC45djM0NWMwIDE3LjYgMTQuMyAzMiAzMiAzMmgyNzRWNzM2aDEyOHYxNzZoMjc0YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjUzNWExNzUgMTc1IDAgMDAxNS42LTI4LjljOS41LTIyLjMgMTQuNC00NiAxNC40LTcwLjRWMzA0YzAtMTctMTMuMy0zMC45LTMwLTMxLjl6bS03MiA1NjhINjQwVjcwNGMwLTE3LjctMTQuMy0zMi0zMi0zMkg0MTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjEzNi4xSDIxNFY1OTcuOWMyLjkgMS40IDUuOSAyLjggOSA0IDIyLjMgOS40IDQ2IDE0LjEgNzAuNCAxNC4xczQ4LTQuNyA3MC40LTE0LjFjMTMuOC01LjggMjYuOC0xMy4yIDM4LjctMjIuMS4yLS4xLjQtLjEuNiAwYTE4MC40IDE4MC40IDAgMDAzOC43IDIyLjFjMjIuMyA5LjQgNDYgMTQuMSA3MC40IDE0LjEgMjQuNCAwIDQ4LTQuNyA3MC40LTE0LjEgMTMuOC01LjggMjYuOC0xMy4yIDM4LjctMjIuMS4yLS4xLjQtLjEuNiAwYTE4MC40IDE4MC40IDAgMDAzOC43IDIyLjFjMjIuMyA5LjQgNDYgMTQuMSA3MC40IDE0LjEgMjQuNCAwIDQ4LTQuNyA3MC40LTE0LjEgMy0xLjMgNi0yLjYgOS00djI0Mi4yem0wLTU2OC4xSDIxNHYtODhoNTk2djg4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(ShopFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ShopFilled';
}
var _default = exports.default = RefIcon;