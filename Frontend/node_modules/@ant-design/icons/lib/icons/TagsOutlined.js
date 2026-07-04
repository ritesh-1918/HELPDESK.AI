"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TagsOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TagsOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TagsOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TagsOutlined.default
}));

/**![tags](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ4My4yIDc5MC4zTDg2MS40IDQxMmMxLjctMS43IDIuNS00IDIuMy02LjNsLTI1LjUtMzAxLjRjLS43LTcuOC02LjgtMTMuOS0xNC42LTE0LjZMNTIyLjIgNjQuM2MtMi4zLS4yLTQuNy42LTYuMyAyLjNMMTM3LjcgNDQ0LjhhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzM0LjIgMzM0LjJjMy4xIDMuMiA4LjIgMy4yIDExLjMgMHptNjIuNi02NTEuN2wyMjQuNiAxOSAxOSAyMjQuNkw0NzcuNSA2OTQgMjMzLjkgNDUwLjVsMzExLjktMzExLjl6bTYwLjE2IDE4Ni4yM2E0OCA0OCAwIDEwNjcuODgtNjcuODkgNDggNDggMCAxMC02Ny44OCA2Ny44OXpNODg5LjcgNTM5LjhsLTM5LjYtMzkuNWE4LjAzIDguMDMgMCAwMC0xMS4zIDBsLTM2MiAzNjEuMy0yMzcuNi0yMzdhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC0zOS42IDM5LjVhOC4wMyA4LjAzIDAgMDAwIDExLjNsMjQzLjIgMjQyLjggMzkuNiAzOS41YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsNDA3LjMtNDA2LjZjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(TagsOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TagsOutlined';
}
var _default = exports.default = RefIcon;