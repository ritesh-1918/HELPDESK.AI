"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _InsertRowBelowOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/InsertRowBelowOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const InsertRowBelowOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _InsertRowBelowOutlined.default
}));

/**![insert-row-below](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik05MDQgNzY4SDEyMGMtNC40IDAtOCAzLjYtOCA4djgwYzAgNC40IDMuNiA4IDggOGg3ODRjNC40IDAgOC0zLjYgOC04di04MGMwLTQuNC0zLjYtOC04LTh6bS0yNS4zLTYwOEgxNDUuM2MtMTguNCAwLTMzLjMgMTQuMy0zMy4zIDMydjQ2NGMwIDE3LjcgMTQuOSAzMiAzMy4zIDMyaDczMy4zYzE4LjQgMCAzMy4zLTE0LjMgMzMuMy0zMlYxOTJjLjEtMTcuNy0xNC44LTMyLTMzLjItMzJ6TTM2MCA2MTZIMTg0VjQ1NmgxNzZ2MTYwem0wLTIyNEgxODRWMjMyaDE3NnYxNjB6bTI0MCAyMjRINDI0VjQ1NmgxNzZ2MTYwem0wLTIyNEg0MjRWMjMyaDE3NnYxNjB6bTI0MCAyMjRINjY0VjQ1NmgxNzZ2MTYwem0wLTIyNEg2NjRWMjMyaDE3NnYxNjB6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(InsertRowBelowOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'InsertRowBelowOutlined';
}
var _default = exports.default = RefIcon;