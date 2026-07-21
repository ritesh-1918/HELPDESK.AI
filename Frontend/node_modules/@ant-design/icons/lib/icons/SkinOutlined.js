"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SkinOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SkinOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SkinOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SkinOutlined.default
}));

/**![skin](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3MCAxMjZINjYzLjhjLTE3LjQgMC0zMi45IDExLjktMzcgMjkuM0M2MTQuMyAyMDguMSA1NjcgMjQ2IDUxMiAyNDZzLTEwMi4zLTM3LjktMTE0LjgtOTAuN2EzNy45MyAzNy45MyAwIDAwLTM3LTI5LjNIMTU0YTQ0IDQ0IDAgMDAtNDQgNDR2MjUyYTQ0IDQ0IDAgMDA0NCA0NGg3NXYzODhhNDQgNDQgMCAwMDQ0IDQ0aDQ3OGE0NCA0NCAwIDAwNDQtNDRWNDY2aDc1YTQ0IDQ0IDAgMDA0NC00NFYxNzBhNDQgNDQgMCAwMC00NC00NHptLTI4IDI2OEg3MjN2NDMySDMwMVYzOTRIMTgyVjE5OGgxNTMuM2MyOC4yIDcxLjIgOTcuNSAxMjAgMTc2LjcgMTIwczE0OC41LTQ4LjggMTc2LjctMTIwSDg0MnYxOTZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SkinOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SkinOutlined';
}
var _default = exports.default = RefIcon;