"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RedoOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RedoOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RedoOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RedoOutlined.default
}));

/**![redo](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc1OC4yIDgzOS4xQzg1MS44IDc2NS45IDkxMiA2NTEuOSA5MTIgNTIzLjkgOTEyIDMwMyA3MzMuNSAxMjQuMyA1MTIuNiAxMjQgMjkxLjQgMTIzLjcgMTEyIDMwMi44IDExMiA1MjMuOWMwIDEyNS4yIDU3LjUgMjM2LjkgMTQ3LjYgMzEwLjIgMy41IDIuOCA4LjYgMi4yIDExLjQtMS4zbDM5LjQtNTAuNWMyLjctMy40IDIuMS04LjMtMS4yLTExLjEtOC4xLTYuNi0xNS45LTEzLjctMjMuNC0yMS4yYTMxOC42NCAzMTguNjQgMCAwMS02OC42LTEwMS43QzIwMC40IDYwOSAxOTIgNTY3LjEgMTkyIDUyMy45czguNC04NS4xIDI1LjEtMTI0LjVjMTYuMS0zOC4xIDM5LjItNzIuMyA2OC42LTEwMS43IDI5LjQtMjkuNCA2My42LTUyLjUgMTAxLjctNjguNkM0MjYuOSAyMTIuNCA0NjguOCAyMDQgNTEyIDIwNHM4NS4xIDguNCAxMjQuNSAyNS4xYzM4LjEgMTYuMSA3Mi4zIDM5LjIgMTAxLjcgNjguNiAyOS40IDI5LjQgNTIuNSA2My42IDY4LjYgMTAxLjcgMTYuNyAzOS40IDI1LjEgODEuMyAyNS4xIDEyNC41cy04LjQgODUuMS0yNS4xIDEyNC41YTMxOC42NCAzMTguNjQgMCAwMS02OC42IDEwMS43Yy05LjMgOS4zLTE5LjEgMTgtMjkuMyAyNkw2NjguMiA3MjRhOCA4IDAgMDAtMTQuMSAzbC0zOS42IDE2Mi4yYy0xLjIgNSAyLjYgOS45IDcuNyA5LjlsMTY3IC44YzYuNyAwIDEwLjUtNy43IDYuMy0xMi45bC0zNy4zLTQ3Ljl6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(RedoOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RedoOutlined';
}
var _default = exports.default = RefIcon;