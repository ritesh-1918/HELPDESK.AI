"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MessageOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MessageOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MessageOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MessageOutlined.default
}));

/**![message](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ2NCA1MTJhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem0yMDAgMGE0OCA0OCAwIDEwOTYgMCA0OCA0OCAwIDEwLTk2IDB6bS00MDAgMGE0OCA0OCAwIDEwOTYgMCA0OCA0OCAwIDEwLTk2IDB6bTY2MS4yLTE3My42Yy0yMi42LTUzLjctNTUtMTAxLjktOTYuMy0xNDMuM2E0NDQuMzUgNDQ0LjM1IDAgMDAtMTQzLjMtOTYuM0M2MzAuNiA3NS43IDU3Mi4yIDY0IDUxMiA2NGgtMmMtNjAuNi4zLTExOS4zIDEyLjMtMTc0LjUgMzUuOWE0NDUuMzUgNDQ1LjM1IDAgMDAtMTQyIDk2LjVjLTQwLjkgNDEuMy03MyA4OS4zLTk1LjIgMTQyLjgtMjMgNTUuNC0zNC42IDExNC4zLTM0LjMgMTc0LjlBNDQ5LjQgNDQ5LjQgMCAwMDExMiA3MTR2MTUyYTQ2IDQ2IDAgMDA0NiA0NmgxNTIuMUE0NDkuNCA0NDkuNCAwIDAwNTEwIDk2MGgyLjFjNTkuOSAwIDExOC0xMS42IDE3Mi43LTM0LjNhNDQ0LjQ4IDQ0NC40OCAwIDAwMTQyLjgtOTUuMmM0MS4zLTQwLjkgNzMuOC04OC43IDk2LjUtMTQyIDIzLjYtNTUuMiAzNS42LTExMy45IDM1LjktMTc0LjUuMy02MC45LTExLjUtMTIwLTM0LjgtMTc1LjZ6bS0xNTEuMSA0MzhDNzA0IDg0NS44IDYxMSA4ODQgNTEyIDg4NGgtMS43Yy02MC4zLS4zLTEyMC4yLTE1LjMtMTczLjEtNDMuNWwtOC40LTQuNUgxODhWNjk1LjJsLTQuNS04LjRDMTU1LjMgNjMzLjkgMTQwLjMgNTc0IDE0MCA1MTMuN2MtLjQtOTkuNyAzNy43LTE5My4zIDEwNy42LTI2My44IDY5LjgtNzAuNSAxNjMuMS0xMDkuNSAyNjIuOC0xMDkuOWgxLjdjNTAgMCA5OC41IDkuNyAxNDQuMiAyOC45IDQ0LjYgMTguNyA4NC42IDQ1LjYgMTE5IDgwIDM0LjMgMzQuMyA2MS4zIDc0LjQgODAgMTE5IDE5LjQgNDYuMiAyOS4xIDk1LjIgMjguOSAxNDUuOC0uNiA5OS42LTM5LjcgMTkyLjktMTEwLjEgMjYyLjd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MessageOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MessageOutlined';
}
var _default = exports.default = RefIcon;