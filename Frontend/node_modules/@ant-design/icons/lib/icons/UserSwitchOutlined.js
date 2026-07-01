"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _UserSwitchOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/UserSwitchOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const UserSwitchOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _UserSwitchOutlined.default
}));

/**![user-switch](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik03NTkgMzM1YzAtMTM3LTExMS0yNDgtMjQ4LTI0OFMyNjMgMTk4IDI2MyAzMzVjMCA4Mi44IDQwLjYgMTU2LjIgMTAzIDIwMS4yLS40LjItLjcuMy0uOS40LTQ0LjcgMTguOS04NC44IDQ2LTExOS4zIDgwLjZhMzczLjQyIDM3My40MiAwIDAwLTgwLjQgMTE5LjVBMzczLjYgMzczLjYgMCAwMDEzNiA4NzQuOGE4IDggMCAwMDggOC4yaDU5LjljNC4zIDAgNy45LTMuNSA4LTcuOCAyLTc3LjIgMzIuOS0xNDkuNSA4Ny42LTIwNC4zQzM1NiA2MTQuMiA0MzEgNTgzIDUxMSA1ODNjMTM3IDAgMjQ4LTExMSAyNDgtMjQ4ek01MTEgNTA3Yy05NSAwLTE3Mi03Ny0xNzItMTcyczc3LTE3MiAxNzItMTcyIDE3MiA3NyAxNzIgMTcyLTc3IDE3Mi0xNzIgMTcyem0xMDUgMjIxaDI2NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOEg3MDMuNWw0Ny4yLTYwLjFhOC4xIDguMSAwIDAwMS43LTQuOWMwLTQuNC0zLjYtOC04LThoLTcyLjZjLTQuOSAwLTkuNSAyLjMtMTIuNiA2LjFsLTY4LjUgODcuMWMtNC40IDUuNi02LjggMTIuNi02LjggMTkuOC4xIDE3LjcgMTQuNCAzMiAzMi4xIDMyem0yNDAgNjRINTkyYy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDE3Ni41bC00Ny4yIDYwLjFhOC4xIDguMSAwIDAwLTEuNyA0LjljMCA0LjQgMy42IDggOCA4aDcyLjZjNC45IDAgOS41LTIuMyAxMi42LTYuMWw2OC41LTg3LjFjNC40LTUuNiA2LjgtMTIuNiA2LjgtMTkuOC0uMS0xNy43LTE0LjQtMzItMzIuMS0zMnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(UserSwitchOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'UserSwitchOutlined';
}
var _default = exports.default = RefIcon;