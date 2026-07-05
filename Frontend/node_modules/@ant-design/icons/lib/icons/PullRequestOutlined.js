"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PullRequestOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PullRequestOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PullRequestOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PullRequestOutlined.default
}));

/**![pull-request](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc4OCA3MDUuOVYxOTJjMC04LjgtNy4yLTE2LTE2LTE2SDYwMnYtNjguOGMwLTYtNy05LjQtMTEuNy01LjdMNDYyLjcgMjAyLjNhNy4xNCA3LjE0IDAgMDAwIDExLjNsMTI3LjUgMTAwLjhjNC43IDMuNyAxMS43LjQgMTEuNy01LjdWMjQwaDExNHY0NjUuOWMtNDQuMiAxNS03NiA1Ni45LTc2IDEwNi4xIDAgNjEuOCA1MC4yIDExMiAxMTIgMTEyczExMi01MC4yIDExMi0xMTJjLjEtNDkuMi0zMS43LTkxLTc1LjktMTA2LjF6TTc1MiA4NjBhNDguMDEgNDguMDEgMCAwMTAtOTYgNDguMDEgNDguMDEgMCAwMTAgOTZ6TTM4NCAyMTJjMC02MS44LTUwLjItMTEyLTExMi0xMTJzLTExMiA1MC4yLTExMiAxMTJjMCA0OS4yIDMxLjggOTEgNzYgMTA2LjFWNzA2Yy00NC4yIDE1LTc2IDU2LjktNzYgMTA2LjEgMCA2MS44IDUwLjIgMTEyIDExMiAxMTJzMTEyLTUwLjIgMTEyLTExMmMwLTQ5LjItMzEuOC05MS03Ni0xMDYuMVYzMTguMWM0NC4yLTE1LjEgNzYtNTYuOSA3Ni0xMDYuMXptLTE2MCAwYTQ4LjAxIDQ4LjAxIDAgMDE5NiAwIDQ4LjAxIDQ4LjAxIDAgMDEtOTYgMHptOTYgNjAwYTQ4LjAxIDQ4LjAxIDAgMDEtOTYgMCA0OC4wMSA0OC4wMSAwIDAxOTYgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PullRequestOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PullRequestOutlined';
}
var _default = exports.default = RefIcon;