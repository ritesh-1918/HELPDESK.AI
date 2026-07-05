"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ApiFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ApiFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ApiFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ApiFilled.default
}));

/**![api](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkxNy43IDE0OC44bC00Mi40LTQyLjRjLTEuNi0xLjYtMy42LTIuMy01LjctMi4zcy00LjEuOC01LjcgMi4zbC03Ni4xIDc2LjFhMTk5LjI3IDE5OS4yNyAwIDAwLTExMi4xLTM0LjNjLTUxLjIgMC0xMDIuNCAxOS41LTE0MS41IDU4LjZMNDMyLjMgMzA4LjdhOC4wMyA4LjAzIDAgMDAwIDExLjNMNzA0IDU5MS43YzEuNiAxLjYgMy42IDIuMyA1LjcgMi4zIDIgMCA0LjEtLjggNS43LTIuM2wxMDEuOS0xMDEuOWM2OC45LTY5IDc3LTE3NS43IDI0LjMtMjUzLjVsNzYuMS03Ni4xYzMuMS0zLjIgMy4xLTguMyAwLTExLjR6TTU3OC45IDU0Ni43YTguMDMgOC4wMyAwIDAwLTExLjMgMEw1MDEgNjEzLjMgNDEwLjcgNTIzbDY2LjctNjYuN2MzLjEtMy4xIDMuMS04LjIgMC0xMS4zTDQ0MSA0MDguNmE4LjAzIDguMDMgMCAwMC0xMS4zIDBMMzYzIDQ3NS4zbC00My00M2E3Ljg1IDcuODUgMCAwMC01LjctMi4zYy0yIDAtNC4xLjgtNS43IDIuM0wyMDYuOCA1MzQuMmMtNjguOSA2OC45LTc3IDE3NS43LTI0LjMgMjUzLjVsLTc2LjEgNzYuMWE4LjAzIDguMDMgMCAwMDAgMTEuM2w0Mi40IDQyLjRjMS42IDEuNiAzLjYgMi4zIDUuNyAyLjNzNC4xLS44IDUuNy0yLjNsNzYuMS03Ni4xYzMzLjcgMjIuOSA3Mi45IDM0LjMgMTEyLjEgMzQuMyA1MS4yIDAgMTAyLjQtMTkuNSAxNDEuNS01OC42bDEwMS45LTEwMS45YzMuMS0zLjEgMy4xLTguMiAwLTExLjNsLTQzLTQzIDY2LjctNjYuN2MzLjEtMy4xIDMuMS04LjIgMC0xMS4zbC0zNi42LTM2LjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ApiFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ApiFilled';
}
var _default = exports.default = RefIcon;