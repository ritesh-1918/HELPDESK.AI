"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileProtectOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileProtectOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileProtectOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileProtectOutlined.default
}));

/**![file-protect](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY0NC43IDY2OS4yYTcuOTIgNy45MiAwIDAwLTYuNS0zLjNINTk0Yy02LjUgMC0xMC4zIDcuNC02LjUgMTIuN2w3My44IDEwMi4xYzMuMiA0LjQgOS43IDQuNCAxMi45IDBsMTE0LjItMTU4YzMuOC01LjMgMC0xMi43LTYuNS0xMi43aC00NC4zYy0yLjYgMC01IDEuMi02LjUgMy4zbC02My41IDg3LjgtMjIuOS0zMS45ek02ODggMzA2di00OGMwLTQuNC0zLjYtOC04LThIMjk2Yy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDM4NGM0LjQgMCA4LTMuNiA4LTh6bS0zOTIgODhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04SDI5NnptMTg0IDQ1OEgyMDhWMTQ4aDU2MHYyOTZjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOFYxMDhjMC0xNy43LTE0LjMtMzItMzItMzJIMTY4Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3ODRjMCAxNy43IDE0LjMgMzIgMzIgMzJoMzEyYzQuNCAwIDgtMy42IDgtOHYtNTZjMC00LjQtMy42LTgtOC04em00MDIuNi0zMjAuOGwtMTkyLTY2LjdjLS45LS4zLTEuNy0uNC0yLjYtLjRzLTEuOC4xLTIuNi40bC0xOTIgNjYuN2E3Ljk2IDcuOTYgMCAwMC01LjQgNy41djI1MS4xYzAgMi41IDEuMSA0LjggMy4xIDYuM2wxOTIgMTUwLjJjMS40IDEuMSAzLjIgMS43IDQuOSAxLjdzMy41LS42IDQuOS0xLjdsMTkyLTE1MC4yYzEuOS0xLjUgMy4xLTMuOCAzLjEtNi4zVjUzOC43YzAtMy40LTIuMi02LjQtNS40LTcuNXpNODI2IDc2My43TDY4OCA4NzEuNiA1NTAgNzYzLjdWNTc3bDEzOC00OCAxMzggNDh2MTg2Ljd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileProtectOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileProtectOutlined';
}
var _default = exports.default = RefIcon;