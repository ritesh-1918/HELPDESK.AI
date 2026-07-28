"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FieldBinaryOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FieldBinaryOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FieldBinaryOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FieldBinaryOutlined.default
}));

/**![field-binary](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik02MDAgMzk1LjRoOTFWNjQ5aDc5VjI2N2MwLTQuNC0zLjYtOC04LThoLTQ4LjJjLTMuNyAwLTcgMi42LTcuNyA2LjMtMi42IDEyLjEtNi45IDIyLjMtMTIuOSAzMC45YTg2LjE0IDg2LjE0IDAgMDEtMjYuMyAyNC40Yy0xMC4zIDYuMi0yMiAxMC41LTM1IDEyLjktMTAuNCAxLjktMjEgMy0zMiAzLjFhOCA4IDAgMDAtNy45IDh2NDIuOGMwIDQuNCAzLjYgOCA4IDh6TTg3MSA3MDJINTY3Yy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDMwNGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHpNNDQzLjkgMzEyLjdjLTE2LjEtMTktMzQuNC0zMi40LTU1LjItNDAuNC0yMS4zLTguMi00NC4xLTEyLjMtNjguNC0xMi4zLTIzLjkgMC00Ni40IDQuMS02Ny43IDEyLjMtMjAuOCA4LTM5IDIxLjQtNTQuOCA0MC4zLTE1LjkgMTkuMS0yOC43IDQ0LjctMzguMyA3Ny05LjYgMzIuNS0xNC41IDczLTE0LjUgMTIxLjUgMCA0OS45IDQuOSA5MS40IDE0LjUgMTI0LjQgOS42IDMyLjggMjIuNCA1OC43IDM4LjMgNzcuNyAxNS44IDE4LjkgMzQgMzIuMyA1NC44IDQwLjMgMjEuMyA4LjIgNDMuOCAxMi4zIDY3LjcgMTIuMyAyNC40IDAgNDcuMi00LjEgNjguNC0xMi4zIDIwLjgtOCAzOS4yLTIxLjQgNTUuMi00MC40IDE2LjEtMTkgMjktNDQuOSAzOC42LTc3LjcgOS42LTMzIDE0LjUtNzQuNSAxNC41LTEyNC40IDAtNDguNC00LjktODguOS0xNC41LTEyMS41LTkuNS0zMi4xLTIyLjQtNTcuNy0zOC42LTc2Ljh6bS0yOS41IDI1MS43Yy0xIDIxLjQtNC4yIDQyLTkuNSA2MS45LTUuNSAyMC43LTE0LjUgMzguNS0yNyA1My40LTEzLjYgMTYuMy0zMy4yIDI0LjMtNTcuNiAyNC4zLTI0IDAtNDMuMi04LjEtNTYuNy0yNC40LTEyLjItMTQuOC0yMS4xLTMyLjYtMjYuNi01My4zLTUuMy0xOS45LTguNS00MC42LTkuNS02MS45LTEtMjAuOC0xLjUtMzguNS0xLjUtNTMuMiAwLTguOC4xLTE5LjQuNC0zMS44LjItMTIuNyAxLjEtMjUuOCAyLjYtMzkuMiAxLjUtMTMuNiA0LTI3LjEgNy42LTQwLjUgMy43LTEzLjggOC44LTI2LjMgMTUuNC0zNy40IDYuOS0xMS42IDE1LjgtMjEuMSAyNi43LTI4LjMgMTEuNC03LjYgMjUuMy0xMS4zIDQxLjUtMTEuMyAxNi4xIDAgMzAuMSAzLjcgNDEuNyAxMS4yYTg3Ljk0IDg3Ljk0IDAgMDEyNy40IDI4LjJjNi45IDExLjIgMTIuMSAyMy44IDE1LjYgMzcuNyAzLjMgMTMuMiA1LjggMjYuNiA3LjUgNDAuMSAxLjggMTMuNSAyLjggMjYuNiAzIDM5LjQuMiAxMi40LjQgMjMgLjQgMzEuOC4xIDE0LjgtLjQgMzIuNS0xLjQgNTMuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FieldBinaryOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FieldBinaryOutlined';
}
var _default = exports.default = RefIcon;