"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LikeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LikeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LikeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LikeFilled.default
}));

/**![like](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS45IDUzMy43YzE2LjgtMjIuMiAyNi4xLTQ5LjQgMjYuMS03Ny43IDAtNDQuOS0yNS4xLTg3LjQtNjUuNS0xMTEuMWE2Ny42NyA2Ny42NyAwIDAwLTM0LjMtOS4zSDU3Mi40bDYtMTIyLjljMS40LTI5LjctOS4xLTU3LjktMjkuNS03OS40QTEwNi42MiAxMDYuNjIgMCAwMDQ3MSA5OS45Yy01MiAwLTk4IDM1LTExMS44IDg1LjFsLTg1LjkgMzExaC0uM3Y0MjhoNDcyLjNjOS4yIDAgMTguMi0xLjggMjYuNS01LjQgNDcuNi0yMC4zIDc4LjMtNjYuOCA3OC4zLTExOC40IDAtMTIuNi0xLjgtMjUtNS40LTM3IDE2LjgtMjIuMiAyNi4xLTQ5LjQgMjYuMS03Ny43IDAtMTIuNi0xLjgtMjUtNS40LTM3IDE2LjgtMjIuMiAyNi4xLTQ5LjQgMjYuMS03Ny43LS4yLTEyLjYtMi0yNS4xLTUuNi0zNy4xek0xMTIgNTI4djM2NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NVY0OTZoLTY1Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LikeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LikeFilled';
}
var _default = exports.default = RefIcon;