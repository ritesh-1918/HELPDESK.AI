"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DingtalkCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DingtalkCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DingtalkCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DingtalkCircleFilled.default
}));

/**![dingtalk-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0yMjcgMzg1LjNjLTEgNC4yLTMuNSAxMC40LTcgMTcuOGguMWwtLjQuN2MtMjAuMyA0My4xLTczLjEgMTI3LjctNzMuMSAxMjcuN3MtLjEtLjItLjMtLjVsLTE1LjUgMjYuOGg3NC41TDU3NS4xIDgxMGwzMi4zLTEyOGgtNTguNmwyMC40LTg0LjdjLTE2LjUgMy45LTM1LjkgOS40LTU5IDE2LjggMCAwLTMxLjIgMTguMi04OS45LTM1IDAgMC0zOS42LTM0LjctMTYuNi00My40IDkuOC0zLjcgNDcuNC04LjQgNzctMTIuMyA0MC01LjQgNjQuNi04LjIgNjQuNi04LjJTNDIyIDUxNyAzOTIuNyA1MTIuNWMtMjkuMy00LjYtNjYuNC01My4xLTc0LjMtOTUuOCAwIDAtMTIuMi0yMy40IDI2LjMtMTIuMyAzOC41IDExLjEgMTk3LjkgNDMuMiAxOTcuOSA0My4ycy0yMDcuNC02My4zLTIyMS4yLTc4LjdjLTEzLjgtMTUuNC00MC42LTg0LjItMzcuMS0xMjYuNSAwIDAgMS41LTEwLjUgMTIuNC03LjcgMCAwIDE1My4zIDY5LjcgMjU4LjEgMTA3LjkgMTA0LjggMzcuOSAxOTUuOSA1Ny4zIDE4NC4yIDEwNi43eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DingtalkCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DingtalkCircleFilled';
}
var _default = exports.default = RefIcon;