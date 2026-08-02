"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CalendarTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CalendarTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CalendarTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CalendarTwoTone.default
}));

/**![calendar](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcxMiAzMDRjMCA0LjQtMy42IDgtOCA4aC01NmMtNC40IDAtOC0zLjYtOC04di00OEgzODR2NDhjMCA0LjQtMy42IDgtOCA4aC01NmMtNC40IDAtOC0zLjYtOC04di00OEgxODR2MTM2aDY1NlYyNTZINzEydjQ4eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODgwIDE4NEg3MTJ2LTY0YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY2NEgzODR2LTY0YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY2NEgxNDRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY2NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg3MzZjMTcuNyAwIDMyLTE0LjMgMzItMzJWMjE2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjU2SDE4NFY0NjBoNjU2djM4MHptMC00NDhIMTg0VjI1NmgxMjh2NDhjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOHYtNDhoMjU2djQ4YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LTh2LTQ4aDEyOHYxMzZ6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CalendarTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CalendarTwoTone';
}
var _default = exports.default = RefIcon;