"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TranslationOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TranslationOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TranslationOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TranslationOutlined.default
}));

/**![translation](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik0xNDAgMTg4aDU4NHYxNjRoNzZWMTQ0YzAtMTcuNy0xNC4zLTMyLTMyLTMySDk2Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNTQ0di03NkgxNDBWMTg4eiIgLz48cGF0aCBkPSJNNDE0LjMgMjU2aC02MC42Yy0zLjQgMC02LjQgMi4yLTcuNiA1LjRMMjE5IDYyOS40Yy0uMy44LS40IDEuNy0uNCAyLjYgMCA0LjQgMy42IDggOCA4aDU1LjFjMy40IDAgNi40LTIuMiA3LjYtNS40TDMyMiA1NDBoMTk2LjJMNDIyIDI2MS40YTguNDIgOC40MiAwIDAwLTcuNy01LjR6bTEyLjQgMjI4aC04NS41TDM4NCAzNjAuMiA0MjYuNyA0ODR6TTkzNiA1MjhIODAwdi05M2MwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2OTNINTkyYy0xMy4zIDAtMjQgMTAuNy0yNCAyNHYxNzZjMCAxMy4zIDEwLjcgMjQgMjQgMjRoMTM2djE1MmMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04Vjc1MmgxMzZjMTMuMyAwIDI0LTEwLjcgMjQtMjRWNTUyYzAtMTMuMy0xMC43LTI0LTI0LTI0ek03MjggNjgwaC04OHYtODBoODh2ODB6bTE2MCAwaC04OHYtODBoODh2ODB6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(TranslationOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TranslationOutlined';
}
var _default = exports.default = RefIcon;