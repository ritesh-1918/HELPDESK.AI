"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PoundCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PoundCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PoundCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PoundCircleFilled.default
}));

/**![pound-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0xNDYgNjU4YzAgNC40LTMuNiA4LTggOEgzNzYuMmMtNC40IDAtOC0zLjYtOC04di0zOC41YzAtMy43IDIuNS02LjkgNi4xLTcuOCA0NC0xMC45IDcyLjgtNDkgNzIuOC05NC4yIDAtMTQuNy0yLjUtMjkuNC01LjktNDQuMkgzNzRjLTQuNCAwLTgtMy42LTgtOHYtMzBjMC00LjQgMy42LTggOC04aDUzLjdjLTcuOC0yNS4xLTE0LjYtNTAuNy0xNC42LTc3LjEgMC03NS44IDU4LjYtMTIwLjMgMTUxLjUtMTIwLjMgMjYuNSAwIDUxLjQgNS41IDcwLjMgMTIuNyAzLjEgMS4yIDUuMiA0LjIgNS4yIDcuNXYzOS41YTggOCAwIDAxLTEwLjYgNy42Yy0xNy45LTYuNC0zOS0xMC41LTYwLjQtMTAuNS01My4zIDAtODcuMyAyNi42LTg3LjMgNzAuMiAwIDI0LjcgNi4yIDQ3LjkgMTMuNCA3MC41aDExMmM0LjQgMCA4IDMuNiA4IDh2MzBjMCA0LjQtMy42IDgtOCA4aC05OC42YzMuMSAxMy4yIDUuMyAyNi45IDUuMyA0MSAwIDQwLjctMTYuNSA3My45LTQzLjkgOTEuMXY0LjdoMTgwYzQuNCAwIDggMy42IDggOFY3MjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(PoundCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PoundCircleFilled';
}
var _default = exports.default = RefIcon;