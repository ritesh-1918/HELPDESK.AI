"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DollarCircleTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DollarCircleTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DollarCircleTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DollarCircleTwoTone.default
}));

/**![dollar-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTQyNi42IDQxMC4zYzAgMjUuNCAxNS43IDQ1LjEgNDkuNSA1Ny4zIDQuNyAxLjkgOS40IDMuNCAxNSA1di0xMjRjLTM3IDQuNy02NC41IDI1LjQtNjQuNSA2MS43em0xMTYuNSAxMzUuMmMtMi45LS42LTUuNy0xLjMtOC44LTIuMlY2NzdjNDIuNi0zLjggNzItMjcuMyA3Mi02Ni40IDAtMzAuNy0xNS45LTUwLjctNjMuMi02NS4xeiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNTEyIDE0MGMtMjA1LjQgMC0zNzIgMTY2LjYtMzcyIDM3MnMxNjYuNiAzNzIgMzcyIDM3MiAzNzItMTY2LjYgMzcyLTM3Mi0xNjYuNi0zNzItMzcyLTM3MnptMjIuNCA1ODkuMmwuMiAzMS43YzAgNC41LTMuNiA4LjEtOCA4LjFoLTI4LjRjLTQuNCAwLTgtMy42LTgtOHYtMzEuNGMtODktNi41LTEzMC43LTU3LjEtMTM1LjItMTEyLjEtLjQtNC43IDMuMy04LjcgOC04LjdoNDYuMmMzLjkgMCA3LjMgMi44IDcuOSA2LjYgNS4xIDMxLjggMjkuOSA1NS40IDc0LjEgNjEuM1Y1MzRsLTI0LjctNi4zYy01Mi4zLTEyLjUtMTAyLjEtNDUuMS0xMDIuMS0xMTIuNyAwLTczIDU1LjQtMTEyLjEgMTI2LjItMTE5di0zM2MwLTQuNCAzLjYtOCA4LThoMjguMWM0LjQgMCA4IDMuNiA4IDh2MzIuN2M2OC41IDYuOSAxMTkuOCA0Ni45IDEyNS45IDEwOS4yYTguMSA4LjEgMCAwMS04IDguOGgtNDQuOWMtNCAwLTcuNC0yLjktNy45LTYuOS00LTI5LjItMjcuNS01My02NS41LTU4LjJ2MTM0LjNsMjUuNCA1LjljNjQuOCAxNiAxMDguOSA0NyAxMDkgMTE2LjQgMCA3NS4yLTU2IDExNy4xLTEzNC4zIDEyNHoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTU1OS43IDQ4OC44bC0yNS40LTUuOVYzNDguNmMzOCA1LjIgNjEuNSAyOSA2NS41IDU4LjIuNSA0IDMuOSA2LjkgNy45IDYuOWg0NC45YzQuNyAwIDguNC00LjEgOC04LjgtNi4xLTYyLjMtNTcuNC0xMDIuMy0xMjUuOS0xMDkuMlYyNjNjMC00LjQtMy42LTgtOC04aC0yOC4xYy00LjQgMC04IDMuNi04IDh2MzNjLTcwLjggNi45LTEyNi4yIDQ2LTEyNi4yIDExOSAwIDY3LjYgNDkuOCAxMDAuMiAxMDIuMSAxMTIuN2wyNC43IDYuM3YxNDIuN2MtNDQuMi01LjktNjktMjkuNS03NC4xLTYxLjMtLjYtMy44LTQtNi42LTcuOS02LjZIMzYzYy00LjcgMC04LjQgNC04IDguNyA0LjUgNTUgNDYuMiAxMDUuNiAxMzUuMiAxMTIuMVY3NjFjMCA0LjQgMy42IDggOCA4aDI4LjRjNC40IDAgOC0zLjYgOC04LjFsLS4yLTMxLjdjNzguMy02LjkgMTM0LjMtNDguOCAxMzQuMy0xMjQtLjEtNjkuNC00NC4yLTEwMC40LTEwOS0xMTYuNHptLTY4LjYtMTYuMmMtNS42LTEuNi0xMC4zLTMuMS0xNS01LTMzLjgtMTIuMi00OS41LTMxLjktNDkuNS01Ny4zIDAtMzYuMyAyNy41LTU3IDY0LjUtNjEuN3YxMjR6TTUzNC4zIDY3N1Y1NDMuM2MzLjEuOSA1LjkgMS42IDguOCAyLjIgNDcuMyAxNC40IDYzLjIgMzQuNCA2My4yIDY1LjEgMCAzOS4xLTI5LjQgNjIuNi03MiA2Ni40eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DollarCircleTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DollarCircleTwoTone';
}
var _default = exports.default = RefIcon;