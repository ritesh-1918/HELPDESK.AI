"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FundTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FundTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FundTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FundTwoTone.default
}));

/**![fund](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAxNjBIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY0MGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTkyYzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjMySDEzNlYyMzJoNzUydjU2MHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTEzNiA3OTJoNzUyVjIzMkgxMzZ2NTYwem01Ni40LTEzMC41bDIxNC45LTIxNWMzLjEtMy4xIDguMi0zLjEgMTEuMyAwTDUzMyA1NjFsMjU0LjUtMjU0LjZjMy4xLTMuMSA4LjItMy4xIDExLjMgMGwzNi44IDM2LjhjMy4xIDMuMSAzLjEgOC4yIDAgMTEuM2wtMjk3IDI5Ny4yYTguMDMgOC4wMyAwIDAxLTExLjMgMEw0MTIuOSA1MzcuMiAyNDAuNCA3MDkuN2E4LjAzIDguMDMgMCAwMS0xMS4zIDBsLTM2LjctMzYuOWE4LjAzIDguMDMgMCAwMTAtMTEuM3oiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTIyOS4xIDcwOS43YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsMTcyLjUtMTcyLjUgMTE0LjQgMTE0LjVjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGwyOTctMjk3LjJjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM2wtMzYuOC0zNi44YTguMDMgOC4wMyAwIDAwLTExLjMgMEw1MzMgNTYxIDQxOC42IDQ0Ni41YTguMDMgOC4wMyAwIDAwLTExLjMgMGwtMjE0LjkgMjE1YTguMDMgOC4wMyAwIDAwMCAxMS4zbDM2LjcgMzYuOXoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FundTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FundTwoTone';
}
var _default = exports.default = RefIcon;