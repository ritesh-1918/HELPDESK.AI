"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IdcardFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IdcardFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IdcardFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IdcardFilled.default
}));

/**![idcard](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM3MyA0MTFjLTI4LjUgMC01MS43IDIzLjMtNTEuNyA1MnMyMy4yIDUyIDUxLjcgNTIgNTEuNy0yMy4zIDUxLjctNTItMjMuMi01Mi01MS43LTUyem01NTUtMjUxSDk2Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY2NDBjMCAxNy43IDE0LjMgMzIgMzIgMzJoODMyYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE5MmMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNjA4IDQyMGMwLTQuNCAxLTggMi4zLThoMTIzLjRjMS4zIDAgMi4zIDMuNiAyLjMgOHY0OGMwIDQuNC0xIDgtMi4zIDhINjEwLjNjLTEuMyAwLTIuMy0zLjYtMi4zLTh2LTQ4em0tODYgMjUzaC00My45Yy00LjIgMC03LjYtMy4zLTcuOS03LjUtMy44LTUwLjUtNDYtOTAuNS05Ny4yLTkwLjVzLTkzLjQgNDAtOTcuMiA5MC41Yy0uMyA0LjItMy43IDcuNS03LjkgNy41SDIyNGE4IDggMCAwMS04LTguNGMyLjgtNTMuMyAzMi05OS43IDc0LjYtMTI2LjFhMTExLjggMTExLjggMCAwMS0yOS4xLTc1LjVjMC02MS45IDQ5LjktMTEyIDExMS40LTExMnMxMTEuNCA1MC4xIDExMS40IDExMmMwIDI5LjEtMTEgNTUuNS0yOS4xIDc1LjUgNDIuNyAyNi41IDcxLjggNzIuOCA3NC42IDEyNi4xLjQgNC42LTMuMiA4LjQtNy44IDguNHptMjc4LjktNTNINjE1LjFjLTMuOSAwLTcuMS0zLjYtNy4xLTh2LTQ4YzAtNC40IDMuMi04IDcuMS04aDE4NS43YzMuOSAwIDcuMSAzLjYgNy4xIDh2NDhoLjFjMCA0LjQtMy4yIDgtNy4xIDh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(IdcardFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IdcardFilled';
}
var _default = exports.default = RefIcon;