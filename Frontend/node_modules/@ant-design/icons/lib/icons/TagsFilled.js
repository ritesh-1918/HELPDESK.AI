"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TagsFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TagsFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TagsFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TagsFilled.default
}));

/**![tags](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ4My4yIDc5MC4zTDg2MS40IDQxMmMxLjctMS43IDIuNS00IDIuMy02LjNsLTI1LjUtMzAxLjRjLS43LTcuOC02LjgtMTMuOS0xNC42LTE0LjZMNTIyLjIgNjQuM2MtMi4zLS4yLTQuNy42LTYuMyAyLjNMMTM3LjcgNDQ0LjhhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzM0LjIgMzM0LjJjMy4xIDMuMiA4LjIgMy4yIDExLjMgMHptMTIyLjctNTMzLjRjMTguNy0xOC43IDQ5LjEtMTguNyA2Ny45IDAgMTguNyAxOC43IDE4LjcgNDkuMSAwIDY3LjktMTguNyAxOC43LTQ5LjEgMTguNy02Ny45IDAtMTguNy0xOC43LTE4LjctNDkuMSAwLTY3Ljl6bTI4My44IDI4Mi45bC0zOS42LTM5LjVhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC0zNjIgMzYxLjMtMjM3LjYtMjM3YTguMDMgOC4wMyAwIDAwLTExLjMgMGwtMzkuNiAzOS41YTguMDMgOC4wMyAwIDAwMCAxMS4zbDI0My4yIDI0Mi44IDM5LjYgMzkuNWMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDQwNy4zLTQwNi42YzMuMS0zLjEgMy4xLTguMiAwLTExLjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(TagsFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TagsFilled';
}
var _default = exports.default = RefIcon;