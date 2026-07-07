"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _WalletTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/WalletTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const WalletTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _WalletTwoTone.default
}));

/**![wallet](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQwIDQ2NEg1MjhWNDQ4aDMxMnYxMjh6bTAtMTkySDQ5NmMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MTkyYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDM0NHYyMDBIMTg0VjE4NGg2NTZ2MjAweiIgZmlsbD0iIzE2NzdmZiIgLz48cGF0aCBkPSJNNTI4IDU3NmgzMTJWNDQ4SDUyOHYxMjh6bTkyLTEwNGMyMi4xIDAgNDAgMTcuOSA0MCA0MHMtMTcuOSA0MC00MCA0MC00MC0xNy45LTQwLTQwIDE3LjktNDAgNDAtNDB6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik01ODAgNTEyYTQwIDQwIDAgMTA4MCAwIDQwIDQwIDAgMTAtODAgMHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTE4NCA4NDBoNjU2VjY0MEg0OTZjLTE3LjcgMC0zMi0xNC4zLTMyLTMyVjQxNmMwLTE3LjcgMTQuMy0zMiAzMi0zMmgzNDRWMTg0SDE4NHY2NTZ6IiBmaWxsPSIjZTZmNGZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(WalletTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'WalletTwoTone';
}
var _default = exports.default = RefIcon;