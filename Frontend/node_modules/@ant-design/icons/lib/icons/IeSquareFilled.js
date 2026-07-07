"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IeSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IeSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IeSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IeSquareFilled.default
}));

/**![ie-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNzY1LjkgNTU2LjlINDM3LjFjMCAxMDAuNCAxNDQuMyAxMzYgMTk2LjggNDcuNGgxMjAuOGMtMzIuNiA5MS43LTExOS43IDE0Ni0yMTYuOCAxNDYtMzUuMSAwLTcwLjMtLjEtMTAxLjctMTUuNi04Ny40IDQ0LjUtMTgwLjMgNTYuNi0xODAuMy00MiAwLTQ1LjggMjMuMi0xMDcuMSA0NC0xNDVDMzM1IDQ4NCAzODEuMyA0MjIuOCA0MzUuNiAzNzQuNWMtNDMuNyAxOC45LTkxLjEgNjYuMy0xMjIgMTAxLjIgMjUuOS0xMTIuOCAxMjkuNS0xOTMuNiAyMzcuMS0xODYuNSAxMzAtNTkuOCAyMDkuNy0zNC4xIDIwOS43IDM4LjYgMCAyNy40LTEwLjYgNjMuMy0yMS40IDg3LjkgMjUuMiA0NS41IDMzLjMgOTcuNiAyNi45IDE0MS4yem0tNzIuMy0yNzIuNWMtMjQgMC01MS4xIDExLjctNzIuNiAyMiA0Ni4zIDE4IDg2IDU3LjMgMTEyLjMgOTkuNiA3LjEtMTguOSAxNC42LTQ3LjkgMTQuNi02Ny45IDAtMzItMjIuOC01My43LTU0LjMtNTMuN3pNNTQwLjUgMzk5LjFjLTUzLjcgMC0xMDIgMzkuNy0xMDQgOTQuOWgyMDhjLTItNTUuMS01MC42LTk0LjktMTA0LTk0Ljl6TTMyMC42IDYwMi45Yy03MyAxNTIuNCAxMS41IDE3Mi4yIDEwMC4zIDEyMy4zLTQ2LjYtMjcuNS04Mi42LTcyLjItMTAwLjMtMTIzLjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(IeSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IeSquareFilled';
}
var _default = exports.default = RefIcon;