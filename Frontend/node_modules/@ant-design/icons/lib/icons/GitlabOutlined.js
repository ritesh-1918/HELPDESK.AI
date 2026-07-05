"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GitlabOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GitlabOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GitlabOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GitlabOutlined.default
}));

/**![gitlab](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkxMy45IDU1Mi4yTDgwNSAxODEuNHYtLjFjLTcuNi0yMi45LTI1LjctMzYuNS00OC4zLTM2LjUtMjMuNCAwLTQyLjUgMTMuNS00OS43IDM1LjJsLTcxLjQgMjEzSDM4OC44bC03MS40LTIxM2MtNy4yLTIxLjctMjYuMy0zNS4yLTQ5LjctMzUuMi0yMy4xIDAtNDIuNSAxNC44LTQ4LjQgMzYuNkwxMTAuNSA1NTIuMmMtNC40IDE0LjcgMS4yIDMxLjQgMTMuNSA0MC43bDM2OC41IDI3Ni40YzIuNiAzLjYgNi4yIDYuMyAxMC40IDcuOGw4LjYgNi40IDguNS02LjRjNC45LTEuNyA5LTQuNyAxMS45LTguOWwzNjguNC0yNzUuNGMxMi40LTkuMiAxOC0yNS45IDEzLjYtNDAuNnpNNzUxLjcgMTkzLjRjMS0xLjggMi45LTEuOSAzLjUtMS45IDEuMSAwIDIuNS4zIDMuNCAzTDgxOCAzOTQuM0g2ODQuNWw2Ny4yLTIwMC45em0tNDg3LjQgMWMuOS0yLjYgMi4zLTIuOSAzLjQtMi45IDIuNyAwIDIuOS4xIDMuNCAxLjdsNjcuMyAyMDEuMkgyMDYuNWw1Ny44LTIwMHpNMTU4LjggNTU4LjdsMjguMi05Ny4zIDIwMi40IDI3MC4yLTIzMC42LTE3Mi45em03My45LTExNi40aDEyMi4xbDkwLjggMjg0LjMtMjEyLjktMjg0LjN6TTUxMi45IDc3Nkw0MDUuNyA0NDIuM0g2MjBMNTEyLjkgNzc2em0xNTcuOS0zMzMuN2gxMTkuNUw1ODAgNzIzLjFsOTAuOC0yODAuOHptLTQwLjcgMjkzLjlsMjA3LjMtMjc2LjcgMjkuNSA5OS4yLTIzNi44IDE3Ny41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(GitlabOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GitlabOutlined';
}
var _default = exports.default = RefIcon;