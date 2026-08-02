"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GiftTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GiftTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GiftTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GiftTwoTone.default
}));

/**![gift](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU0NiAzNzhoMjk4djEwNEg1NDZ6TTIyOCA1NTBoMjUwdjMwOEgyMjh6bS00OC0xNzJoMjk4djEwNEgxODB6bTM2NiAxNzJoMjUwdjMwOEg1NDZ6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik04ODAgMzEwSDczMi40YzEzLjYtMjEuNCAyMS42LTQ2LjggMjEuNi03NCAwLTc2LjEtNjEuOS0xMzgtMTM4LTEzOC00MS40IDAtNzguNyAxOC40LTEwNCA0Ny40LTI1LjMtMjktNjIuNi00Ny40LTEwNC00Ny40LTc2LjEgMC0xMzggNjEuOS0xMzggMTM4IDAgMjcuMiA3LjkgNTIuNiAyMS42IDc0SDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MjAwYzAgNC40IDMuNiA4IDggOGg0MHYzNDRjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjU1MGg0MGM0LjQgMCA4LTMuNiA4LThWMzQyYzAtMTcuNy0xNC4zLTMyLTMyLTMyek00NzggODU4SDIyOFY1NTBoMjUwdjMwOHptMC0zNzZIMTgwVjM3OGgyOTh2MTA0em0wLTE3NmgtNzBjLTM4LjYgMC03MC0zMS40LTcwLTcwczMxLjQtNzAgNzAtNzAgNzAgMzEuNCA3MCA3MHY3MHptNjgtNzBjMC0zOC42IDMxLjQtNzAgNzAtNzBzNzAgMzEuNCA3MCA3MC0zMS40IDcwLTcwIDcwaC03MHYtNzB6bTI1MCA2MjJINTQ2VjU1MGgyNTB2MzA4em00OC0zNzZINTQ2VjM3OGgyOTh2MTA0eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(GiftTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GiftTwoTone';
}
var _default = exports.default = RefIcon;