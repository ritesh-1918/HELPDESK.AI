"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _QqOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/QqOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const QqOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _QqOutlined.default
}));

/**![qq](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgyNC44IDYxMy4yYy0xNi01MS40LTM0LjQtOTQuNi02Mi43LTE2NS4zQzc2Ni41IDI2Mi4yIDY4OS4zIDExMiA1MTEuNSAxMTIgMzMxLjcgMTEyIDI1Ni4yIDI2NS4yIDI2MSA0NDcuOWMtMjguNCA3MC44LTQ2LjcgMTEzLjctNjIuNyAxNjUuMy0zNCAxMDkuNS0yMyAxNTQuOC0xNC42IDE1NS44IDE4IDIuMiA3MC4xLTgyLjQgNzAuMS04Mi40IDAgNDkgMjUuMiAxMTIuOSA3OS44IDE1OS0yNi40IDguMS04NS43IDI5LjktNzEuNiA1My44IDExLjQgMTkuMyAxOTYuMiAxMi4zIDI0OS41IDYuMyA1My4zIDYgMjM4LjEgMTMgMjQ5LjUtNi4zIDE0LjEtMjMuOC00NS4zLTQ1LjctNzEuNi01My44IDU0LjYtNDYuMiA3OS44LTExMC4xIDc5LjgtMTU5IDAgMCA1Mi4xIDg0LjYgNzAuMSA4Mi40IDguNS0xLjEgMTkuNS00Ni40LTE0LjUtMTU1Ljh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(QqOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'QqOutlined';
}
var _default = exports.default = RefIcon;