"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CameraTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CameraTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CameraTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CameraTwoTone.default
}));

/**![camera](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2NCAzMjBINjc3LjJsLTE3LjEtNDcuOC0yMi45LTY0LjJIMzg2LjdsLTIyLjkgNjQuMi0xNy4xIDQ3LjhIMTYwYy00LjQgMC04IDMuNi04IDh2NDU2YzAgNC40IDMuNiA4IDggOGg3MDRjNC40IDAgOC0zLjYgOC04VjMyOGMwLTQuNC0zLjYtOC04LTh6TTUxMiA3MDRjLTg4LjQgMC0xNjAtNzEuNi0xNjAtMTYwczcxLjYtMTYwIDE2MC0xNjAgMTYwIDcxLjYgMTYwIDE2MC03MS42IDE2MC0xNjAgMTYweiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNTEyIDM4NGMtODguNCAwLTE2MCA3MS42LTE2MCAxNjBzNzEuNiAxNjAgMTYwIDE2MCAxNjAtNzEuNiAxNjAtMTYwLTcxLjYtMTYwLTE2MC0xNjB6bTAgMjU2Yy01MyAwLTk2LTQzLTk2LTk2czQzLTk2IDk2LTk2IDk2IDQzIDk2IDk2LTQzIDk2LTk2IDk2eiIgZmlsbD0iIzE2NzdmZiIgLz48cGF0aCBkPSJNODY0IDI0OEg3MjhsLTMyLjQtOTAuOGEzMi4wNyAzMi4wNyAwIDAwLTMwLjItMjEuMkgzNTguNmMtMTMuNSAwLTI1LjYgOC41LTMwLjEgMjEuMkwyOTYgMjQ4SDE2MGMtNDQuMiAwLTgwIDM1LjgtODAgODB2NDU2YzAgNDQuMiAzNS44IDgwIDgwIDgwaDcwNGM0NC4yIDAgODAtMzUuOCA4MC04MFYzMjhjMC00NC4yLTM1LjgtODAtODAtODB6bTggNTM2YzAgNC40LTMuNiA4LTggOEgxNjBjLTQuNCAwLTgtMy42LTgtOFYzMjhjMC00LjQgMy42LTggOC04aDE4Ni43bDE3LjEtNDcuOCAyMi45LTY0LjJoMjUwLjVsMjIuOSA2NC4yIDE3LjEgNDcuOEg4NjRjNC40IDAgOCAzLjYgOCA4djQ1NnoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CameraTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CameraTwoTone';
}
var _default = exports.default = RefIcon;