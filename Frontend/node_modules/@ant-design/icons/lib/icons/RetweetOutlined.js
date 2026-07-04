"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RetweetOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RetweetOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RetweetOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RetweetOutlined.default
}));

/**![retweet](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEzNiA1NTJoNjMuNmM0LjQgMCA4LTMuNiA4LThWMjg4LjdoNTI4LjZ2NzIuNmMwIDEuOS42IDMuNyAxLjggNS4yYTguMyA4LjMgMCAwMDExLjcgMS40TDg5MyAyNTUuNGM0LjMtNSAzLjYtMTAuMyAwLTEzLjJMNzQ5LjcgMTI5LjhhOC4yMiA4LjIyIDAgMDAtNS4yLTEuOGMtNC42IDAtOC40IDMuOC04LjQgOC40VjIwOUgxOTkuN2MtMzkuNSAwLTcxLjcgMzIuMi03MS43IDcxLjhWNTQ0YzAgNC40IDMuNiA4IDggOHptNzUyLTgwaC02My42Yy00LjQgMC04IDMuNi04IDh2MjU1LjNIMjg3Ljh2LTcyLjZjMC0xLjktLjYtMy43LTEuOC01LjJhOC4zIDguMyAwIDAwLTExLjctMS40TDEzMSA3NjguNmMtNC4zIDUtMy42IDEwLjMgMCAxMy4ybDE0My4zIDExMi40YzEuNSAxLjIgMy4zIDEuOCA1LjIgMS44IDQuNiAwIDguNC0zLjggOC40LTguNFY4MTVoNTM2LjZjMzkuNSAwIDcxLjctMzIuMiA3MS43LTcxLjhWNDgwYy0uMi00LjQtMy44LTgtOC4yLTh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(RetweetOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RetweetOutlined';
}
var _default = exports.default = RefIcon;