"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FieldStringOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FieldStringOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FieldStringOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FieldStringOutlined.default
}));

/**![field-string](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik04NzUuNiA1MTUuOWMyLjEuOCA0LjQtLjMgNS4yLTIuNC4yLS40LjItLjkuMi0xLjR2LTU4LjNjMC0xLjgtMS4xLTMuMy0yLjgtMy44LTYtMS44LTE3LjItMy0yNy4yLTMtMzIuOSAwLTYxLjcgMTYuNy03My41IDQxLjJ2LTI4LjZjMC00LjQtMy42LTgtOC04SDcxN2MtNC40IDAtOCAzLjYtOCA4VjcyOWMwIDQuNCAzLjYgOCA4IDhoNTQuOGM0LjQgMCA4LTMuNiA4LThWNTcyLjdjMC0zNi4yIDI2LjEtNjAuMiA2NS4xLTYwLjIgMTAuNC4xIDI2LjYgMS44IDMwLjcgMy40em0tNTM3LTQwLjVsLTU0LjctMTIuNmMtNjEuMi0xNC4yLTg3LjctMzQuOC04Ny43LTcwLjcgMC00NC42IDM5LjEtNzMuNSA5Ni45LTczLjUgNTIuOCAwIDkxLjQgMjYuNSA5OS45IDY4LjloNzBDNDU1LjkgMzExLjYgMzg3LjYgMjU5IDI5My40IDI1OWMtMTAzLjMgMC0xNzEgNTUuNS0xNzEgMTM5IDAgNjguNiAzOC42IDEwOS41IDEyMi4yIDEyOC41bDYxLjYgMTQuM2M2My42IDE0LjkgOTEuNiAzNy4xIDkxLjYgNzUuMSAwIDQ0LjEtNDMuNSA3NS4yLTEwMi41IDc1LjItNjAuNiAwLTEwNC41LTI3LjItMTEyLjgtNzAuNUgxMTFjNy4yIDc5LjkgNzUuNiAxMzAuNCAxNzkuMSAxMzAuNEM0MDIuMyA3NTEgNDcxIDY5NS4yIDQ3MSA2MDUuM2MwLTcwLjItMzguNi0xMDguNS0xMzIuNC0xMjkuOXpNODQxIDcyOWEzNiAzNiAwIDEwNzIgMCAzNiAzNiAwIDEwLTcyIDB6TTY1MyA0NTcuOGgtNTEuNFYzOTZjMC00LjQtMy42LTgtOC04aC01NC43Yy00LjQgMC04IDMuNi04IDh2NjEuOEg0OTVjLTQuNCAwLTggMy42LTggOHY0Mi4zYzAgNC40IDMuNiA4IDggOGgzNS45djE0Ny41YzAgNTYuMiAyNy40IDc5LjQgOTMuMSA3OS40IDExLjcgMCAyMy42LTEuMiAzMy44LTMuMSAxLjktLjMgMy4yLTIgMy4yLTMuOXYtNDkuM2MwLTIuMi0xLjgtNC00LTRoLS40Yy00LjkuNS02LjIuNi04LjMuOC00LjEuMy03LjguNS0xMi42LjUtMjQuMSAwLTM0LjEtMTAuMy0zNC4xLTM1LjZWNTE2LjFINjUzYzQuNCAwIDgtMy42IDgtOHYtNDIuM2MwLTQuNC0zLjYtOC04LTh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FieldStringOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FieldStringOutlined';
}
var _default = exports.default = RefIcon;