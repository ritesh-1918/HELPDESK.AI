"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DatabaseTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DatabaseTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DatabaseTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DatabaseTwoTone.default
}));

/**![database](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzMiA2MTZoNTYwVjQwOEgyMzJ2MjA4em0xMTItMTQ0YzIyLjEgMCA0MCAxNy45IDQwIDQwcy0xNy45IDQwLTQwIDQwLTQwLTE3LjktNDAtNDAgMTcuOS00MCA0MC00MHpNMjMyIDg4OGg1NjBWNjgwSDIzMnYyMDh6bTExMi0xNDRjMjIuMSAwIDQwIDE3LjkgNDAgNDBzLTE3LjkgNDAtNDAgNDAtNDAtMTcuOS00MC00MCAxNy45LTQwIDQwLTQwek0yMzIgMzQ0aDU2MFYxMzZIMjMydjIwOHptMTEyLTE0NGMyMi4xIDAgNDAgMTcuOSA0MCA0MHMtMTcuOSA0MC00MCA0MC00MC0xNy45LTQwLTQwIDE3LjktNDAgNDAtNDB6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik0zMDQgNTEyYTQwIDQwIDAgMTA4MCAwIDQwIDQwIDAgMTAtODAgMHptMCAyNzJhNDAgNDAgMCAxMDgwIDAgNDAgNDAgMCAxMC04MCAwem0wLTU0NGE0MCA0MCAwIDEwODAgMCA0MCA0MCAwIDEwLTgwIDB6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik04MzIgNjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjk2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgODI0SDIzMlY2ODBoNTYwdjIwOHptMC0yNzJIMjMyVjQwOGg1NjB2MjA4em0wLTI3MkgyMzJWMTM2aDU2MHYyMDh6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(DatabaseTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DatabaseTwoTone';
}
var _default = exports.default = RefIcon;