"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileExcelTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileExcelTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileExcelTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileExcelTwoTone.default
}));

/**![file-excel](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUzNCAzNTJWMTM2SDIzMnY3NTJoNTYwVjM5NEg1NzZhNDIgNDIgMCAwMS00Mi00MnptNTEuNiAxMjBoMzUuN2ExMi4wNCAxMi4wNCAwIDAxMTAuMSAxOC41TDU0Ni4xIDYyM2w4NCAxMzAuNGMzLjYgNS42IDIgMTMtMy42IDE2LjYtMiAxLjItNC4yIDEuOS02LjUgMS45aC0zNy41Yy00LjEgMC04LTIuMS0xMC4yLTUuN0w1MTAgNjY0LjhsLTYyLjcgMTAxLjVjLTIuMiAzLjUtNiA1LjctMTAuMiA1LjdoLTM0LjVhMTIuMDQgMTIuMDQgMCAwMS0xMC4yLTE4LjRsODMuNC0xMzIuOC04Mi4zLTEzMC40Yy0zLjYtNS43LTEuOS0xMy4xIDMuNy0xNi42IDEuOS0xLjMgNC4xLTEuOSA2LjQtMS45SDQ0MmM0LjIgMCA4LjEgMi4yIDEwLjMgNS44bDYxLjggMTAyLjQgNjEuMi0xMDIuM2MyLjItMy42IDYuMS01LjggMTAuMy01Ljh6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik04NTQuNiAyODguNkw2MzkuNCA3My40Yy02LTYtMTQuMS05LjQtMjIuNi05LjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjMxMS4zYzAtOC41LTMuNC0xNi43LTkuNC0yMi43ek02MDIgMTM3LjhMNzkwLjIgMzI2SDYwMlYxMzcuOHpNNzkyIDg4OEgyMzJWMTM2aDMwMnYyMTZhNDIgNDIgMCAwMDQyIDQyaDIxNnY0OTR6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik01MTQuMSA1ODAuMWwtNjEuOC0xMDIuNGMtMi4yLTMuNi02LjEtNS44LTEwLjMtNS44aC0zOC40Yy0yLjMgMC00LjUuNi02LjQgMS45LTUuNiAzLjUtNy4zIDEwLjktMy43IDE2LjZsODIuMyAxMzAuNC04My40IDEzMi44YTEyLjA0IDEyLjA0IDAgMDAxMC4yIDE4LjRoMzQuNWM0LjIgMCA4LTIuMiAxMC4yLTUuN0w1MTAgNjY0LjhsNjIuMyAxMDEuNGMyLjIgMy42IDYuMSA1LjcgMTAuMiA1LjdINjIwYzIuMyAwIDQuNS0uNyA2LjUtMS45IDUuNi0zLjYgNy4yLTExIDMuNi0xNi42bC04NC0xMzAuNCA4NS4zLTEzMi41YTEyLjA0IDEyLjA0IDAgMDAtMTAuMS0xOC41aC0zNS43Yy00LjIgMC04LjEgMi4yLTEwLjMgNS44bC02MS4yIDEwMi4zeiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileExcelTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileExcelTwoTone';
}
var _default = exports.default = RefIcon;