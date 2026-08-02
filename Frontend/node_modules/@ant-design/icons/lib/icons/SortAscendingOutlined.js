"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SortAscendingOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SortAscendingOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SortAscendingOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SortAscendingOutlined.default
}));

/**![sort-ascending](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgzOS42IDQzMy44TDc0OSAxNTAuNWE5LjI0IDkuMjQgMCAwMC04LjktNi41aC03Ny40Yy00LjEgMC03LjYgMi42LTguOSA2LjVsLTkxLjMgMjgzLjNjLS4zLjktLjUgMS45LS41IDIuOSAwIDUuMSA0LjIgOS4zIDkuMyA5LjNoNTYuNGM0LjIgMCA3LjgtMi44IDktNi44bDE3LjUtNjEuNmg4OWwxNy4zIDYxLjVjMS4xIDQgNC44IDYuOCA5IDYuOGg2MS4yYzEgMCAxLjktLjEgMi44LS40IDIuNC0uOCA0LjMtMi40IDUuNS00LjYgMS4xLTIuMiAxLjMtNC43LjYtNy4xek02NjMuMyAzMjUuNWwzMi44LTExNi45aDYuM2wzMi4xIDExNi45aC03MS4yem0xNDMuNSA0OTIuOUg2NzcuMnYtLjRsMTMyLjYtMTg4LjljMS4xLTEuNiAxLjctMy40IDEuNy01LjR2LTM2LjRjMC01LjEtNC4yLTkuMy05LjMtOS4zaC0yMDRjLTUuMSAwLTkuMyA0LjItOS4zIDkuM3Y0M2MwIDUuMSA0LjIgOS4zIDkuMyA5LjNoMTIyLjZ2LjRMNTg3LjcgODI4LjlhOS4zNSA5LjM1IDAgMDAtMS43IDUuNHYzNi40YzAgNS4xIDQuMiA5LjMgOS4zIDkuM2gyMTEuNGM1LjEgMCA5LjMtNC4yIDkuMy05LjN2LTQzYTkuMiA5LjIgMCAwMC05LjItOS4zek00MTYgNzAyaC03NlYxNzJjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djUzMGgtNzZjLTYuNyAwLTEwLjUgNy44LTYuMyAxM2wxMTIgMTQxLjlhOCA4IDAgMDAxMi42IDBsMTEyLTE0MS45YzQuMS01LjIuNC0xMy02LjMtMTN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SortAscendingOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SortAscendingOutlined';
}
var _default = exports.default = RefIcon;