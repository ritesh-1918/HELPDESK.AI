"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ScheduleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ScheduleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ScheduleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ScheduleFilled.default
}));

/**![schedule](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAyMjRINzY4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZINTQ4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZIMzI4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjU3NmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMjU2YzAtMTcuNy0xNC4zLTMyLTMyLTMyek00MjQgNjg4YzAgNC40LTMuNiA4LTggOEgyMzJjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDE4NGM0LjQgMCA4IDMuNiA4IDh2NDh6bTAtMTM2YzAgNC40LTMuNiA4LTggOEgyMzJjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDE4NGM0LjQgMCA4IDMuNiA4IDh2NDh6bTM3NC41LTkxLjNsLTE2NSAyMjguN2ExNS45IDE1LjkgMCAwMS0yNS44IDBMNDkzLjUgNTMxLjJjLTMuOC01LjMgMC0xMi43IDYuNS0xMi43aDU0LjljNS4xIDAgOS45IDIuNSAxMi45IDYuNmw1Mi44IDczLjEgMTAzLjctMTQzLjdjMy00LjIgNy44LTYuNiAxMi45LTYuNkg3OTJjNi41LjEgMTAuMyA3LjUgNi41IDEyLjh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ScheduleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ScheduleFilled';
}
var _default = exports.default = RefIcon;