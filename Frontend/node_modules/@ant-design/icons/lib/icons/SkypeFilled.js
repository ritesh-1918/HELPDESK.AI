"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SkypeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SkypeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SkypeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SkypeFilled.default
}));

/**![skype](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4My43IDU3OC42YzQuMS0yMi41IDYuMy00NS41IDYuMy02OC41IDAtNTEtMTAtMTAwLjUtMjkuNy0xNDctMTktNDUtNDYuMy04NS40LTgxLTEyMC4xYTM3NS43OSAzNzUuNzkgMCAwMC0xMjAuMS04MC45Yy00Ni42LTE5LjctOTYtMjkuNy0xNDctMjkuNy0yNCAwLTQ4LjEgMi4zLTcxLjUgNi44QTIyNS4xIDIyNS4xIDAgMDAzMzUuNiAxMTNjLTU5LjcgMC0xMTUuOSAyMy4zLTE1OC4xIDY1LjVBMjIyLjI1IDIyMi4yNSAwIDAwMTEyIDMzNi42YzAgMzggOS44IDc1LjQgMjguMSAxMDguNC0zLjcgMjEuNC01LjcgNDMuMy01LjcgNjUuMSAwIDUxIDEwIDEwMC41IDI5LjcgMTQ3IDE5IDQ1IDQ2LjIgODUuNCA4MC45IDEyMC4xIDM0LjcgMzQuNyA3NS4xIDYxLjkgMTIwLjEgODAuOSA0Ni42IDE5LjcgOTYgMjkuNyAxNDcgMjkuNyAyMi4yIDAgNDQuNC0yIDY2LjItNS45IDMzLjUgMTguOSA3MS4zIDI5IDExMCAyOSA1OS43IDAgMTE1LjktMjMuMiAxNTguMS02NS41IDQyLjMtNDIuMiA2NS41LTk4LjQgNjUuNS0xNTguMS4xLTM4LTkuNy03NS41LTI4LjItMTA4Ljd6bS0zNzAgMTYyLjljLTEzNC4yIDAtMTk0LjItNjYtMTk0LjItMTE1LjQgMC0yNS40IDE4LjctNDMuMSA0NC41LTQzLjEgNTcuNCAwIDQyLjYgODIuNSAxNDkuNyA4Mi41IDU0LjkgMCA4NS4yLTI5LjggODUuMi02MC4zIDAtMTguMy05LTM4LjctNDUuMi00Ny42bC0xMTkuNC0yOS44Yy05Ni4xLTI0LjEtMTEzLjYtNzYuMS0xMTMuNi0xMjQuOSAwLTEwMS40IDk1LjUtMTM5LjUgMTg1LjItMTM5LjUgODIuNiAwIDE4MCA0NS43IDE4MCAxMDYuNSAwIDI2LjEtMjIuNiA0MS4yLTQ4LjQgNDEuMi00OSAwLTQwLTY3LjgtMTM4LjctNjcuOC00OSAwLTc2LjEgMjIuMi03Ni4xIDUzLjlzMzguNyA0MS44IDcyLjMgNDkuNWw4OC40IDE5LjZjOTYuOCAyMS42IDEyMS4zIDc4LjEgMTIxLjMgMTMxLjMgMCA4Mi4zLTYzLjMgMTQzLjktMTkxIDE0My45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SkypeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SkypeFilled';
}
var _default = exports.default = RefIcon;