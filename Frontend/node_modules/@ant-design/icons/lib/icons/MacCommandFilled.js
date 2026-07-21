"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MacCommandFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MacCommandFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MacCommandFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MacCommandFilled.default
}));

/**![mac-command](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik02MjQgNjcyYTQ4LjAxIDQ4LjAxIDAgMDA5NiAwYzAtMjYuNS0yMS41LTQ4LTQ4LTQ4aC00OHY0OHptOTYtMzIwYTQ4LjAxIDQ4LjAxIDAgMDAtOTYgMHY0OGg0OGMyNi41IDAgNDgtMjEuNSA0OC00OHoiIC8+PHBhdGggZD0iTTkyOCA2NEg5NmMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2ODMyYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDgzMmMxNy43IDAgMzItMTQuMyAzMi0zMlY5NmMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNjcyIDU2MGM2MS45IDAgMTEyIDUwLjEgMTEyIDExMnMtNTAuMSAxMTItMTEyIDExMi0xMTItNTAuMS0xMTItMTEydi00OGgtOTZ2NDhjMCA2MS45LTUwLjEgMTEyLTExMiAxMTJzLTExMi01MC4xLTExMi0xMTIgNTAuMS0xMTIgMTEyLTExMmg0OHYtOTZoLTQ4Yy02MS45IDAtMTEyLTUwLjEtMTEyLTExMnM1MC4xLTExMiAxMTItMTEyIDExMiA1MC4xIDExMiAxMTJ2NDhoOTZ2LTQ4YzAtNjEuOSA1MC4xLTExMiAxMTItMTEyczExMiA1MC4xIDExMiAxMTItNTAuMSAxMTItMTEyIDExMmgtNDh2OTZoNDh6IiAvPjxwYXRoIGQ9Ik00NjQgNDY0aDk2djk2aC05NnpNMzUyIDMwNGE0OC4wMSA0OC4wMSAwIDAwMCA5Nmg0OHYtNDhjMC0yNi41LTIxLjUtNDgtNDgtNDh6bS00OCAzNjhhNDguMDEgNDguMDEgMCAwMDk2IDB2LTQ4aC00OGMtMjYuNSAwLTQ4IDIxLjUtNDggNDh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MacCommandFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MacCommandFilled';
}
var _default = exports.default = RefIcon;