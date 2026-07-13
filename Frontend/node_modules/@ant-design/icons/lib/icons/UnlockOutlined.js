"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _UnlockOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/UnlockOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const UnlockOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _UnlockOutlined.default
}));

/**![unlock](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgzMiA0NjRIMzMyVjI0MGMwLTMwLjkgMjUuMS01NiA1Ni01NmgyNDhjMzAuOSAwIDU2IDI1LjEgNTYgNTZ2NjhjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOHYtNjhjMC03MC43LTU3LjMtMTI4LTEyOC0xMjhIMzg4Yy03MC43IDAtMTI4IDU3LjMtMTI4IDEyOHYyMjRoLTY4Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnYzODRjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjQ5NmMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQwIDM3NkgyMzJWNTM2aDU2MHYzMDR6TTQ4NCA3MDF2NTNjMCA0LjQgMy42IDggOCA4aDQwYzQuNCAwIDgtMy42IDgtOHYtNTNhNDguMDEgNDguMDEgMCAxMC01NiAweiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(UnlockOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'UnlockOutlined';
}
var _default = exports.default = RefIcon;