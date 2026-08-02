"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _EnvironmentFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/EnvironmentFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const EnvironmentFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _EnvironmentFilled.default
}));

/**![environment](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiAzMjdjLTI5LjkgMC01OCAxMS42LTc5LjIgMzIuOEExMTEuNiAxMTEuNiAwIDAwNDAwIDQzOWMwIDI5LjkgMTEuNyA1OCAzMi44IDc5LjJBMTExLjYgMTExLjYgMCAwMDUxMiA1NTFjMjkuOSAwIDU4LTExLjcgNzkuMi0zMi44QzYxMi40IDQ5NyA2MjQgNDY4LjkgNjI0IDQzOWMwLTI5LjktMTEuNi01OC0zMi44LTc5LjJTNTQxLjkgMzI3IDUxMiAzMjd6bTM0Mi42LTM3LjlhMzYyLjQ5IDM2Mi40OSAwIDAwLTc5LjktMTE1LjcgMzcwLjgzIDM3MC44MyAwIDAwLTExOC4yLTc3LjhDNjEwLjcgNzYuNiA1NjIuMSA2NyA1MTIgNjdjLTUwLjEgMC05OC43IDkuNi0xNDQuNSAyOC41LTQ0LjMgMTguMy04NCA0NC41LTExOC4yIDc3LjhBMzYzLjYgMzYzLjYgMCAwMDE2OS40IDI4OWMtMTkuNSA0NS0yOS40IDkyLjgtMjkuNCAxNDIgMCA3MC42IDE2LjkgMTQwLjkgNTAuMSAyMDguNyAyNi43IDU0LjUgNjQgMTA3LjYgMTExIDE1OC4xIDgwLjMgODYuMiAxNjQuNSAxMzguOSAxODguNCAxNTNhNDMuOSA0My45IDAgMDAyMi40IDYuMWM3LjggMCAxNS41LTIgMjIuNC02LjEgMjMuOS0xNC4xIDEwOC4xLTY2LjggMTg4LjQtMTUzIDQ3LTUwLjQgODQuMy0xMDMuNiAxMTEtMTU4LjFDODY3LjEgNTcyIDg4NCA1MDEuOCA4ODQgNDMxLjFjMC00OS4yLTkuOS05Ny0yOS40LTE0MnpNNTEyIDYxNWMtOTcuMiAwLTE3Ni03OC44LTE3Ni0xNzZzNzguOC0xNzYgMTc2LTE3NiAxNzYgNzguOCAxNzYgMTc2LTc4LjggMTc2LTE3NiAxNzZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(EnvironmentFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'EnvironmentFilled';
}
var _default = exports.default = RefIcon;