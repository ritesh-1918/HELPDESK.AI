"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SlackOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SlackOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SlackOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SlackOutlined.default
}));

/**![slack](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQwOS40IDEyOGMtNDIuNCAwLTc2LjcgMzQuNC03Ni43IDc2LjggMCAyMC4zIDguMSAzOS45IDIyLjQgNTQuM2E3Ni43NCA3Ni43NCAwIDAwNTQuMyAyMi41aDc2Ljd2LTc2LjhjMC00Mi4zLTM0LjMtNzYuNy03Ni43LTc2Ljh6bTAgMjA0LjhIMjA0LjdjLTQyLjQgMC03Ni43IDM0LjQtNzYuNyA3Ni44czM0LjQgNzYuOCA3Ni43IDc2LjhoMjA0LjZjNDIuNCAwIDc2LjctMzQuNCA3Ni43LTc2LjguMS00Mi40LTM0LjMtNzYuOC03Ni42LTc2Ljh6TTYxNCA0ODYuNGM0Mi40IDAgNzYuOC0zNC40IDc2LjctNzYuOFYyMDQuOGMwLTQyLjQtMzQuMy03Ni44LTc2LjctNzYuOC00Mi40IDAtNzYuNyAzNC40LTc2LjcgNzYuOHYyMDQuOGMwIDQyLjUgMzQuMyA3Ni44IDc2LjcgNzYuOHptMjgxLjQtNzYuOGMwLTQyLjQtMzQuNC03Ni44LTc2LjctNzYuOFM3NDIgMzY3LjIgNzQyIDQwOS42djc2LjhoNzYuN2M0Mi4zIDAgNzYuNy0zNC40IDc2LjctNzYuOHptLTc2LjggMTI4SDYxNGMtNDIuNCAwLTc2LjcgMzQuNC03Ni43IDc2LjggMCAyMC4zIDguMSAzOS45IDIyLjQgNTQuM2E3Ni43NCA3Ni43NCAwIDAwNTQuMyAyMi41aDIwNC42YzQyLjQgMCA3Ni43LTM0LjQgNzYuNy03Ni44LjEtNDIuNC0zNC4zLTc2LjctNzYuNy03Ni44ek02MTQgNzQyLjRoLTc2Ljd2NzYuOGMwIDQyLjQgMzQuNCA3Ni44IDc2LjcgNzYuOCA0Mi40IDAgNzYuOC0zNC40IDc2LjctNzYuOC4xLTQyLjQtMzQuMy03Ni43LTc2LjctNzYuOHpNNDA5LjQgNTM3LjZjLTQyLjQgMC03Ni43IDM0LjQtNzYuNyA3Ni44djIwNC44YzAgNDIuNCAzNC40IDc2LjggNzYuNyA3Ni44IDQyLjQgMCA3Ni44LTM0LjQgNzYuNy03Ni44VjYxNC40YzAtMjAuMy04LjEtMzkuOS0yMi40LTU0LjNhNzYuOTIgNzYuOTIgMCAwMC01NC4zLTIyLjV6TTEyOCA2MTQuNGMwIDIwLjMgOC4xIDM5LjkgMjIuNCA1NC4zYTc2Ljc0IDc2Ljc0IDAgMDA1NC4zIDIyLjVjNDIuNCAwIDc2LjgtMzQuNCA3Ni43LTc2Ljh2LTc2LjhoLTc2LjdjLTQyLjMgMC03Ni43IDM0LjQtNzYuNyA3Ni44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SlackOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SlackOutlined';
}
var _default = exports.default = RefIcon;