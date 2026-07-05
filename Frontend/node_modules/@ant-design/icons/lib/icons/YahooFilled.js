"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _YahooFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/YahooFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const YahooFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _YahooFilled.default
}));

/**![yahoo](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkzNy4zIDIzMUg4MjQuN2MtMTUuNSAwLTI3LjcgMTIuNi0yNy4xIDI4LjFsMTMuMSAzNjZoODQuNGw2NS40LTM2Ni40YzIuNy0xNS4yLTcuOC0yNy43LTIzLjItMjcuN3ptLTc3LjQgNDUwLjRoLTE0LjFjLTI3LjEgMC00OS4yIDIyLjItNDkuMiA0OS4zdjE0LjFjMCAyNy4xIDIyLjIgNDkuMyA0OS4yIDQ5LjNoMTQuMWMyNy4xIDAgNDkuMi0yMi4yIDQ5LjItNDkuM3YtMTQuMWMwLTI3LjEtMjIuMi00OS4zLTQ5LjItNDkuM3pNNDAyLjYgMjMxQzIxNi4yIDIzMSA2NSAzNTcgNjUgNTEyLjVTMjE2LjIgNzk0IDQwMi42IDc5NHMzMzcuNi0xMjYgMzM3LjYtMjgxLjVTNTg5LjEgMjMxIDQwMi42IDIzMXptMjI1LjIgMjI1LjJoLTY1LjNMNDU4LjkgNTU5Ljh2NjUuM2g4NC40djU2LjNIMzE4LjJ2LTU2LjNoODQuNHYtNjUuM0wyNDIuOSAzOTkuOWgtMzd2LTU2LjNoMTY4LjV2NTYuM2gtMzdsOTMuNCA5My41IDI4LjEtMjguMVY0MDBoMTY4Ljh2NTYuMnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(YahooFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'YahooFilled';
}
var _default = exports.default = RefIcon;