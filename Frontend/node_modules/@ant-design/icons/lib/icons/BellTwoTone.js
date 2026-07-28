"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BellTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BellTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BellTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BellTwoTone.default
}));

/**![bell](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiAyMjBjLTU1LjYgMC0xMDcuOCAyMS42LTE0Ny4xIDYwLjlTMzA0IDM3Mi40IDMwNCA0Mjh2MzQwaDQxNlY0MjhjMC01NS42LTIxLjYtMTA3LjgtNjAuOS0xNDcuMVM1NjcuNiAyMjAgNTEyIDIyMHptMjgwIDIwOGMwLTE0MS4xLTEwNC4zLTI1Ny44LTI0MC0yNzcuMnYuMWMxMzUuNyAxOS40IDI0MCAxMzYgMjQwIDI3Ny4xek00NzIgMTUwLjl2LS4xQzMzNi4zIDE3MC4yIDIzMiAyODYuOSAyMzIgNDI4YzAtMTQxLjEgMTA0LjMtMjU3LjcgMjQwLTI3Ny4xeiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODE2IDc2OGgtMjRWNDI4YzAtMTQxLjEtMTA0LjMtMjU3LjctMjQwLTI3Ny4xVjExMmMwLTIyLjEtMTcuOS00MC00MC00MHMtNDAgMTcuOS00MCA0MHYzOC45Yy0xMzUuNyAxOS40LTI0MCAxMzYtMjQwIDI3Ny4xdjM0MGgtMjRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjMyYzAgNC40IDMuNiA4IDggOGgyMTZjMCA2MS44IDUwLjIgMTEyIDExMiAxMTJzMTEyLTUwLjIgMTEyLTExMmgyMTZjNC40IDAgOC0zLjYgOC04di0zMmMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNTEyIDg4OGMtMjYuNSAwLTQ4LTIxLjUtNDgtNDhoOTZjMCAyNi41LTIxLjUgNDgtNDggNDh6bTIwOC0xMjBIMzA0VjQyOGMwLTU1LjYgMjEuNi0xMDcuOCA2MC45LTE0Ny4xUzQ1Ni40IDIyMCA1MTIgMjIwYzU1LjYgMCAxMDcuOCAyMS42IDE0Ny4xIDYwLjlTNzIwIDM3Mi40IDcyMCA0Mjh2MzQweiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(BellTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BellTwoTone';
}
var _default = exports.default = RefIcon;