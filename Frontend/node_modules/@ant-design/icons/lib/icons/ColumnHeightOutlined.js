"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ColumnHeightOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ColumnHeightOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ColumnHeightOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ColumnHeightOutlined.default
}));

/**![column-height](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg0MCA4MzZIMTg0Yy00LjQgMC04IDMuNi04IDh2NjBjMCA0LjQgMy42IDggOCA4aDY1NmM0LjQgMCA4LTMuNiA4LTh2LTYwYzAtNC40LTMuNi04LTgtOHptMC03MjRIMTg0Yy00LjQgMC04IDMuNi04IDh2NjBjMCA0LjQgMy42IDggOCA4aDY1NmM0LjQgMCA4LTMuNiA4LTh2LTYwYzAtNC40LTMuNi04LTgtOHpNNjEwLjggMzc4YzYgMCA5LjQtNyA1LjctMTEuN0w1MTUuNyAyMzguN2E3LjE0IDcuMTQgMCAwMC0xMS4zIDBMNDAzLjYgMzY2LjNhNy4yMyA3LjIzIDAgMDA1LjcgMTEuN0g0NzZ2MjY4aC02Mi44Yy02IDAtOS40IDctNS43IDExLjdsMTAwLjggMTI3LjVjMi45IDMuNyA4LjUgMy43IDExLjMgMGwxMDAuOC0xMjcuNWMzLjctNC43LjQtMTEuNy01LjctMTEuN0g1NDhWMzc4aDYyLjh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ColumnHeightOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ColumnHeightOutlined';
}
var _default = exports.default = RefIcon;