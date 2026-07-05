"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TrophyOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TrophyOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TrophyOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TrophyOutlined.default
}));

/**![trophy](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2OCAxNjBoLTkydi00MGMwLTQuNC0zLjYtOC04LThIMjU2Yy00LjQgMC04IDMuNi04IDh2NDBoLTkyYTQ0IDQ0IDAgMDAtNDQgNDR2MTQ4YzAgODEuNyA2MCAxNDkuNiAxMzguMiAxNjJDMjY1LjcgNjMwLjIgMzU5IDcyMS43IDQ3NiA3MzQuNXYxMDUuMkgyODBjLTE3LjcgMC0zMiAxNC4zLTMyIDMyVjkwNGMwIDQuNCAzLjYgOCA4IDhoNTEyYzQuNCAwIDgtMy42IDgtOHYtMzIuM2MwLTE3LjctMTQuMy0zMi0zMi0zMkg1NDhWNzM0LjVDNjY1IDcyMS43IDc1OC4zIDYzMC4yIDc3My44IDUxNCA4NTIgNTAxLjYgOTEyIDQzMy43IDkxMiAzNTJWMjA0YTQ0IDQ0IDAgMDAtNDQtNDR6TTE4NCAzNTJWMjMyaDY0djIwNy42YTkxLjk5IDkxLjk5IDAgMDEtNjQtODcuNnptNTIwIDEyOGMwIDQ5LjEtMTkuMSA5NS40LTUzLjkgMTMwLjEtMzQuOCAzNC44LTgxIDUzLjktMTMwLjEgNTMuOWgtMTZjLTQ5LjEgMC05NS40LTE5LjEtMTMwLjEtNTMuOS0zNC44LTM0LjgtNTMuOS04MS01My45LTEzMC4xVjE4NGgzODR2Mjk2em0xMzYtMTI4YzAgNDEtMjYuOSA3NS44LTY0IDg3LjZWMjMyaDY0djEyMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(TrophyOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TrophyOutlined';
}
var _default = exports.default = RefIcon;