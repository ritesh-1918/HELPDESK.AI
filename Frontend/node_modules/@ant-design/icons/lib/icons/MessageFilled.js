"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MessageFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MessageFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MessageFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MessageFilled.default
}));

/**![message](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNC4zIDMzOC40YTQ0Ny41NyA0NDcuNTcgMCAwMC05Ni4xLTE0My4zIDQ0My4wOSA0NDMuMDkgMCAwMC0xNDMtOTYuM0E0NDMuOTEgNDQzLjkxIDAgMDA1MTIgNjRoLTJjLTYwLjUuMy0xMTkgMTIuMy0xNzQuMSAzNS45YTQ0NC4wOCA0NDQuMDggMCAwMC0xNDEuNyA5Ni41IDQ0NSA0NDUgMCAwMC05NSAxNDIuOEE0NDkuODkgNDQ5Ljg5IDAgMDA2NSA1MTQuMWMuMyA2OS40IDE2LjkgMTM4LjMgNDcuOSAxOTkuOXYxNTJjMCAyNS40IDIwLjYgNDYgNDUuOSA0NmgxNTEuOGE0NDcuNzIgNDQ3LjcyIDAgMDAxOTkuNSA0OGgyLjFjNTkuOCAwIDExNy43LTExLjYgMTcyLjMtMzQuM0E0NDMuMiA0NDMuMiAwIDAwODI3IDgzMC41YzQxLjItNDAuOSA3My42LTg4LjcgOTYuMy0xNDIgMjMuNS01NS4yIDM1LjUtMTEzLjkgMzUuOC0xNzQuNS4yLTYwLjktMTEuNi0xMjAtMzQuOC0xNzUuNnpNMzEyLjQgNTYwYy0yNi40IDAtNDcuOS0yMS41LTQ3LjktNDhzMjEuNS00OCA0Ny45LTQ4IDQ3LjkgMjEuNSA0Ny45IDQ4LTIxLjQgNDgtNDcuOSA0OHptMTk5LjYgMGMtMjYuNCAwLTQ3LjktMjEuNS00Ny45LTQ4czIxLjUtNDggNDcuOS00OCA0Ny45IDIxLjUgNDcuOSA0OC0yMS41IDQ4LTQ3LjkgNDh6bTE5OS42IDBjLTI2LjQgMC00Ny45LTIxLjUtNDcuOS00OHMyMS41LTQ4IDQ3LjktNDggNDcuOSAyMS41IDQ3LjkgNDgtMjEuNSA0OC00Ny45IDQ4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(MessageFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MessageFilled';
}
var _default = exports.default = RefIcon;