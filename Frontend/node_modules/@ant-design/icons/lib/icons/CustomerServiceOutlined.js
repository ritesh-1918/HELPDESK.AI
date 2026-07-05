"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CustomerServiceOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CustomerServiceOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CustomerServiceOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CustomerServiceOutlined.default
}));

/**![customer-service](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiAxMjhjLTIxMi4xIDAtMzg0IDE3MS45LTM4NCAzODR2MzYwYzAgMTMuMyAxMC43IDI0IDI0IDI0aDE4NGMzNS4zIDAgNjQtMjguNyA2NC02NFY2MjRjMC0zNS4zLTI4LjctNjQtNjQtNjRIMjAwdi00OGMwLTE3Mi4zIDEzOS43LTMxMiAzMTItMzEyczMxMiAxMzkuNyAzMTIgMzEydjQ4SDY4OGMtMzUuMyAwLTY0IDI4LjctNjQgNjR2MjA4YzAgMzUuMyAyOC43IDY0IDY0IDY0aDE4NGMxMy4zIDAgMjQtMTAuNyAyNC0yNFY1MTJjMC0yMTIuMS0xNzEuOS0zODQtMzg0LTM4NHpNMzI4IDYzMnYxOTJIMjAwVjYzMmgxMjh6bTQ5NiAxOTJINjk2VjYzMmgxMjh2MTkyeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CustomerServiceOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CustomerServiceOutlined';
}
var _default = exports.default = RefIcon;