"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FunctionOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FunctionOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FunctionOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FunctionOutlined.default
}));

/**![function](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik04NDEgMzcwYzMtMy4zIDIuNy04LjMtLjYtMTEuM2E4LjI0IDguMjQgMCAwMC01LjMtMi4xaC03Mi42Yy0yLjQgMC00LjYgMS02LjEgMi44TDYzMy41IDUwNC42YTcuOTYgNy45NiAwIDAxLTEzLjQtMS45bC02My41LTE0MS4zYTcuOSA3LjkgMCAwMC03LjMtNC43SDM4MC43bC45LTQuNyA4LTQyLjNjMTAuNS01NS40IDM4LTgxLjQgODUuOC04MS40IDE4LjYgMCAzNS41IDEuNyA0OC44IDQuN2wxNC4xLTY2LjhjLTIyLjYtNC43LTM1LjItNi4xLTU0LjktNi4xLTEwMy4zIDAtMTU2LjQgNDQuMy0xNzUuOSAxNDcuM2wtOS40IDQ5LjRoLTk3LjZjLTMuOCAwLTcuMSAyLjctNy44IDYuNEwxODEuOSA0MTVhOC4wNyA4LjA3IDAgMDA3LjggOS43SDI4NGwtODkgNDI5LjlhOC4wNyA4LjA3IDAgMDA3LjggOS43SDI2OWMzLjggMCA3LjEtMi43IDcuOC02LjRsODkuNy00MzMuMWgxMzUuOGw2OC4yIDEzOS4xYzEuNCAyLjkgMSA2LjQtMS4yIDguOGwtMTgwLjYgMjAzYy0yLjkgMy4zLTIuNiA4LjQuNyAxMS4zIDEuNSAxLjMgMy40IDIgNS4zIDJoNzIuN2MyLjQgMCA0LjYtMSA2LjEtMi44bDEyMy43LTE0Ni43YzIuOC0zLjQgNy45LTMuOCAxMS4zLTEgLjkuOCAxLjYgMS43IDIuMSAyLjhMNjc2LjQgNzg0YzEuMyAyLjggNC4xIDQuNyA3LjMgNC43aDY0LjZhOC4wMiA4LjAyIDAgMDA3LjItMTEuNWwtOTUuMi0xOTguOWMtMS40LTIuOS0uOS02LjQgMS4zLTguOEw4NDEgMzcweiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FunctionOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FunctionOutlined';
}
var _default = exports.default = RefIcon;