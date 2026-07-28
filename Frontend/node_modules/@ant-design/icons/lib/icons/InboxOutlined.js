"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _InboxOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/InboxOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const InboxOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _InboxOutlined.default
}));

/**![inbox](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS4yIDQ0Ni4zbC0uMi0uOC0xMTIuMi0yODUuMWMtNS0xNi4xLTE5LjktMjcuMi0zNi44LTI3LjJIMjgxLjJjLTE3IDAtMzIuMSAxMS4zLTM2LjkgMjcuNkwxMzkuNCA0NDNsLS4zLjctLjIuOGMtMS4zIDQuOS0xLjcgOS45LTEgMTQuOC0uMSAxLjYtLjIgMy4yLS4yIDQuOFY4MzBhNjAuOSA2MC45IDAgMDA2MC44IDYwLjhoNjI3LjJjMzMuNSAwIDYwLjgtMjcuMyA2MC45LTYwLjhWNDY0LjFjMC0xLjMgMC0yLjYtLjEtMy43LjQtNC45IDAtOS42LTEuMy0xNC4xem0tMjk1LjgtNDNsLS4zIDE1LjdjLS44IDQ0LjktMzEuOCA3NS4xLTc3LjEgNzUuMS0yMi4xIDAtNDEuMS03LjEtNTQuOC0yMC42UzQzNiA0NDEuMiA0MzUuNiA0MTlsLS4zLTE1LjdIMjI5LjVMMzA5IDIxMGgzOTkuMmw4MS43IDE5My4zSDU4OS40em0tMzc1IDc2LjhoMTU3LjNjMjQuMyA1Ny4xIDc2IDkwLjggMTQwLjQgOTAuOCAzMy43IDAgNjUtOS40IDkwLjMtMjcuMiAyMi4yLTE1LjYgMzkuNS0zNy40IDUwLjctNjMuNmgxNTYuNVY4MTRIMjE0LjRWNDgwLjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(InboxOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'InboxOutlined';
}
var _default = exports.default = RefIcon;