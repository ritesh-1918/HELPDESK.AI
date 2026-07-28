"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _QrcodeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/QrcodeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const QrcodeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _QrcodeOutlined.default
}));

/**![qrcode](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ2OCAxMjhIMTYwYy0xNy43IDAtMzIgMTQuMy0zMiAzMnYzMDhjMCA0LjQgMy42IDggOCA4aDMzMmM0LjQgMCA4LTMuNiA4LThWMTM2YzAtNC40LTMuNi04LTgtOHptLTU2IDI4NEgxOTJWMTkyaDIyMHYyMjB6bS0xMzgtNzRoNTZjNC40IDAgOC0zLjYgOC04di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4em0xOTQgMjEwSDEzNmMtNC40IDAtOCAzLjYtOCA4djMwOGMwIDE3LjcgMTQuMyAzMiAzMiAzMmgzMDhjNC40IDAgOC0zLjYgOC04VjU1NmMwLTQuNC0zLjYtOC04LTh6bS01NiAyODRIMTkyVjYxMmgyMjB2MjIwem0tMTM4LTc0aDU2YzQuNCAwIDgtMy42IDgtOHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2YzAgNC40IDMuNiA4IDggOHptNTkwLTYzMEg1NTZjLTQuNCAwLTggMy42LTggOHYzMzJjMCA0LjQgMy42IDggOCA4aDMzMmM0LjQgMCA4LTMuNiA4LThWMTYwYzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tMzIgMjg0SDYxMlYxOTJoMjIwdjIyMHptLTEzOC03NGg1NmM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY1NmMwIDQuNCAzLjYgOCA4IDh6bTE5NCAyMTBoLTQ4Yy00LjQgMC04IDMuNi04IDh2MTM0aC03OFY1NTZjMC00LjQtMy42LTgtOC04SDU1NmMtNC40IDAtOCAzLjYtOCA4djMzMmMwIDQuNCAzLjYgOCA4IDhoNDhjNC40IDAgOC0zLjYgOC04VjY0NGg3OHYxMDJjMCA0LjQgMy42IDggOCA4aDE5MGM0LjQgMCA4LTMuNiA4LThWNTU2YzAtNC40LTMuNi04LTgtOHpNNzQ2IDgzMmgtNDhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoNDhjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6bTE0MiAwaC00OGMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGg0OGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(QrcodeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'QrcodeOutlined';
}
var _default = exports.default = RefIcon;