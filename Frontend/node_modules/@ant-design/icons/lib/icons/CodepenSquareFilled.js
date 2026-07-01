"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CodepenSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CodepenSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CodepenSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CodepenSquareFilled.default
}));

/**![codepen-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcyMy4xIDQyOEw1MzUuOSAzMDMuNHYxMTEuM2wxMDMuNiA2OS4xek01MTIgNDU2LjFsLTg0LjUgNTYuNCA4NC41IDU2LjQgODQuNS01Ni40em0yMy45IDE1NC4ydjExMS4zTDcyMy4xIDU5N2wtODMuNi01NS44em0tMTUxLjQtNjkuMUwzMDAuOSA1OTdsMTg3LjIgMTI0LjZWNjEwLjNsLTEwMy42LTY5LjF6TTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTkwIDQ4NWMwIDEuMS0uMSAyLjEtLjIgMy4xIDAgLjQtLjEuNy0uMiAxYTE0LjE2IDE0LjE2IDAgMDEtLjggMy4yYy0uMi42LS40IDEuMi0uNiAxLjctLjIuNC0uNC44LS41IDEuMi0uMy41LS41IDEuMS0uOCAxLjYtLjIuNC0uNC43LS43IDEuMS0uMy41LS43IDEtMSAxLjUtLjMuNC0uNS43LS44IDEtLjQuNC0uOC45LTEuMiAxLjMtLjMuMy0uNi42LTEgLjktLjQuNC0uOS44LTEuNCAxLjEtLjQuMy0uNy42LTEuMS44LS4xLjEtLjMuMi0uNC4zTDUyNS4yIDc4NmMtNCAyLjctOC42IDQtMTMuMiA0LTQuNyAwLTkuMy0xLjQtMTMuMy00TDI0NC42IDYxNi45Yy0uMS0uMS0uMy0uMi0uNC0uM2wtMS4xLS44Yy0uNS0uNC0uOS0uNy0xLjMtMS4xLS4zLS4zLS42LS42LTEtLjktLjQtLjQtLjgtLjgtMS4yLTEuM2E3IDcgMCAwMS0uOC0xYy0uNC0uNS0uNy0xLTEtMS41LS4yLS40LS41LS43LS43LTEuMS0uMy0uNS0uNi0xLjEtLjgtMS42LS4yLS40LS40LS44LS41LTEuMi0uMi0uNi0uNC0xLjItLjYtMS43LS4xLS40LS4zLS44LS40LTEuMi0uMi0uNy0uMy0xLjMtLjQtMi0uMS0uMy0uMS0uNy0uMi0xLS4xLTEtLjItMi4xLS4yLTMuMVY0MjcuOWMwLTEgLjEtMi4xLjItMy4xLjEtLjMuMS0uNy4yLTFhMTQuMTYgMTQuMTYgMCAwMS44LTMuMmMuMi0uNi40LTEuMi42LTEuNy4yLS40LjQtLjguNS0xLjIuMi0uNS41LTEuMS44LTEuNi4yLS40LjQtLjcuNy0xLjEuNi0uOSAxLjItMS43IDEuOC0yLjUuNC0uNC44LS45IDEuMi0xLjMuMy0uMy42LS42IDEtLjkuNC0uNC45LS44IDEuMy0xLjEuNC0uMy43LS42IDEuMS0uOC4xLS4xLjMtLjIuNC0uM0w0OTguNyAyMzljOC01LjMgMTguNS01LjMgMjYuNSAwbDI1NC4xIDE2OS4xYy4xLjEuMy4yLjQuM2wxLjEuOCAxLjQgMS4xYy4zLjMuNi42IDEgLjkuNC40LjguOCAxLjIgMS4zLjcuOCAxLjMgMS42IDEuOCAyLjUuMi40LjUuNy43IDEuMS4zLjUuNiAxIC44IDEuNi4yLjQuNC44LjUgMS4yLjIuNi40IDEuMi42IDEuNy4xLjQuMy44LjQgMS4yLjIuNy4zIDEuMy40IDIgLjEuMy4xLjcuMiAxIC4xIDEgLjIgMi4xLjIgMy4xVjU5N3ptLTQ3LjgtNDQuNnYtNzkuOGwtNTkuOCAzOS45em0tNDYwLjQtNzkuOHY3OS44bDU5LjgtMzkuOXptMjA2LjMtNTcuOVYzMDMuNEwzMDAuOSA0MjhsODMuNiA1NS44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CodepenSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CodepenSquareFilled';
}
var _default = exports.default = RefIcon;