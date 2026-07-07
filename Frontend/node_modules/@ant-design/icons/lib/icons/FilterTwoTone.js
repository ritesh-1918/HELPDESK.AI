"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FilterTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FilterTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FilterTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FilterTwoTone.default
}));

/**![filter](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQyMC42IDc5OGgxODIuOVY2NDJINDIwLjZ6TTQxMSA1NjEuNGw5LjUgMTYuNmgxODNsOS41LTE2LjZMODExLjMgMjI2SDIxMi43eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODgwLjEgMTU0SDE0My45Yy0yNC41IDAtMzkuOCAyNi43LTI3LjUgNDhMMzQ5IDU5Ny40VjgzOGMwIDE3LjcgMTQuMiAzMiAzMS44IDMyaDI2Mi40YzE3LjYgMCAzMS44LTE0LjMgMzEuOC0zMlY1OTcuNEw5MDcuNyAyMDJjMTIuMi0yMS4zLTMuMS00OC0yNy42LTQ4ek02MDMuNSA3OThINDIwLjZWNjQyaDE4Mi45djE1NnptOS41LTIzNi42bC05LjUgMTYuNmgtMTgzbC05LjUtMTYuNkwyMTIuNyAyMjZoNTk4LjZMNjEzIDU2MS40eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FilterTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FilterTwoTone';
}
var _default = exports.default = RefIcon;