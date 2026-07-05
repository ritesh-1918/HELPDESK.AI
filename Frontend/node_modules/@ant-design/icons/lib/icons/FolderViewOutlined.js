"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FolderViewOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FolderViewOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FolderViewOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FolderViewOutlined.default
}));

/**![folder-view](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik0zMDkuMSA1NTQuM2E0Mi45MiA0Mi45MiAwIDAwMCAzNi40QzM1My4zIDY4NCA0MjEuNiA3MzIgNTEyLjUgNzMyczE1OS4yLTQ4LjEgMjAzLjQtMTQxLjNjNS40LTExLjUgNS40LTI0LjguMS0zNi4zbC0uMS0uMS0uMS0uMUM2NzEuNyA0NjEgNjAzLjQgNDEzIDUxMi41IDQxM3MtMTU5LjIgNDguMS0yMDMuNCAxNDEuM3pNNTEyLjUgNDc3YzYyLjEgMCAxMDcuNCAzMCAxNDEuMSA5NS41QzYyMCA2MzggNTc0LjYgNjY4IDUxMi41IDY2OHMtMTA3LjQtMzAtMTQxLjEtOTUuNWMzMy43LTY1LjUgNzktOTUuNSAxNDEuMS05NS41eiIgLz48cGF0aCBkPSJNNDU3IDU3M2E1NiA1NiAwIDEwMTEyIDAgNTYgNTYgMCAxMC0xMTIgMHoiIC8+PHBhdGggZD0iTTg4MCAyOTguNEg1MjFMNDAzLjcgMTg2LjJhOC4xNSA4LjE1IDAgMDAtNS41LTIuMkgxNDRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjU5MmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg3MzZjMTcuNyAwIDMyLTE0LjMgMzItMzJWMzMwLjRjMC0xNy43LTE0LjMtMzItMzItMzJ6TTg0MCA3NjhIMTg0VjI1NmgxODguNWwxMTkuNiAxMTQuNEg4NDBWNzY4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FolderViewOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FolderViewOutlined';
}
var _default = exports.default = RefIcon;