"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GoldenFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GoldenFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GoldenFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GoldenFilled.default
}));

/**![golden](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkwNS45IDgwNi43bC00MC4yLTI0OGMtLjYtMy45LTQtNi43LTcuOS02LjdINTk2LjJjLTMuOSAwLTcuMyAyLjgtNy45IDYuN2wtNDAuMiAyNDhjLS4xLjQtLjEuOS0uMSAxLjMgMCA0LjQgMy42IDggOCA4aDM0MmMuNCAwIC45IDAgMS4zLS4xIDQuMy0uNyA3LjMtNC44IDYuNi05LjJ6bS00NzAuMi0yNDhjLS42LTMuOS00LTYuNy03LjktNi43SDE2Ni4yYy0zLjkgMC03LjMgMi44LTcuOSA2LjdsLTQwLjIgMjQ4Yy0uMS40LS4xLjktLjEgMS4zIDAgNC40IDMuNiA4IDggOGgzNDJjLjQgMCAuOSAwIDEuMy0uMSA0LjQtLjcgNy4zLTQuOCA2LjYtOS4ybC00MC4yLTI0OHpNMzQyIDQ3MmgzNDJjLjQgMCAuOSAwIDEuMy0uMSA0LjQtLjcgNy4zLTQuOCA2LjYtOS4ybC00MC4yLTI0OGMtLjYtMy45LTQtNi43LTcuOS02LjdIMzgyLjJjLTMuOSAwLTcuMyAyLjgtNy45IDYuN2wtNDAuMiAyNDhjLS4xLjQtLjEuOS0uMSAxLjMgMCA0LjQgMy42IDggOCA4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(GoldenFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GoldenFilled';
}
var _default = exports.default = RefIcon;