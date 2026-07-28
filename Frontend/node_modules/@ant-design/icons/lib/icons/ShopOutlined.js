"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ShopOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ShopOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ShopOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ShopOutlined.default
}));

/**![shop](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MiAyNzIuMVYxNDRjMC0xNy43LTE0LjMtMzItMzItMzJIMTc0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnYxMjguMWMtMTYuNyAxLTMwIDE0LjktMzAgMzEuOXYxMzEuN2ExNzcgMTc3IDAgMDAxNC40IDcwLjRjNC4zIDEwLjIgOS42IDE5LjggMTUuNiAyOC45djM0NWMwIDE3LjYgMTQuMyAzMiAzMiAzMmg2NzZjMTcuNyAwIDMyLTE0LjMgMzItMzJWNTM1YTE3NSAxNzUgMCAwMDE1LjYtMjguOWM5LjUtMjIuMyAxNC40LTQ2IDE0LjQtNzAuNFYzMDRjMC0xNy0xMy4zLTMwLjktMzAtMzEuOXpNMjE0IDE4NGg1OTZ2ODhIMjE0di04OHptMzYyIDY1Ni4xSDQ0OFY3MzZoMTI4djEwNC4xem0yMzQgMEg2NDBWNzA0YzAtMTcuNy0xNC4zLTMyLTMyLTMySDQxNmMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MTM2LjFIMjE0VjU5Ny45YzIuOSAxLjQgNS45IDIuOCA5IDQgMjIuMyA5LjQgNDYgMTQuMSA3MC40IDE0LjFzNDgtNC43IDcwLjQtMTQuMWMxMy44LTUuOCAyNi44LTEzLjIgMzguNy0yMi4xLjItLjEuNC0uMS42IDBhMTgwLjQgMTgwLjQgMCAwMDM4LjcgMjIuMWMyMi4zIDkuNCA0NiAxNC4xIDcwLjQgMTQuMSAyNC40IDAgNDgtNC43IDcwLjQtMTQuMSAxMy44LTUuOCAyNi44LTEzLjIgMzguNy0yMi4xLjItLjEuNC0uMS42IDBhMTgwLjQgMTgwLjQgMCAwMDM4LjcgMjIuMWMyMi4zIDkuNCA0NiAxNC4xIDcwLjQgMTQuMSAyNC40IDAgNDgtNC43IDcwLjQtMTQuMSAzLTEuMyA2LTIuNiA5LTR2MjQyLjJ6bTMwLTQwNC40YzAgNTkuOC00OSAxMDguMy0xMDkuMyAxMDguMy00MC44IDAtNzYuNC0yMi4xLTk1LjItNTQuOS0yLjktNS04LjEtOC4xLTEzLjktOC4xaC0uNmMtNS43IDAtMTEgMy4xLTEzLjkgOC4xQTEwOS4yNCAxMDkuMjQgMCAwMTUxMiA1NDRjLTQwLjcgMC03Ni4yLTIyLTk1LTU0LjctMy01LjEtOC40LTguMy0xNC4zLTguM3MtMTEuNCAzLjItMTQuMyA4LjNhMTA5LjYzIDEwOS42MyAwIDAxLTk1LjEgNTQuN0MyMzMgNTQ0IDE4NCA0OTUuNSAxODQgNDM1Ljd2LTkxLjJjMC0uMy4yLS41LjUtLjVoNjU1Yy4zIDAgLjUuMi41LjV2OTEuMnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ShopOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ShopOutlined';
}
var _default = exports.default = RefIcon;