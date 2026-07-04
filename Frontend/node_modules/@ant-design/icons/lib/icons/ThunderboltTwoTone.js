"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ThunderboltTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ThunderboltTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ThunderboltTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ThunderboltTwoTone.default
}));

/**![thunderbolt](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY5NS40IDE2NC4xSDQ3MC44TDI4MS4yIDQ5MS41aDE1Ny40bC02MC4zIDI0MSAzMTkuOC0zMDUuMWgtMjExeiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODQ4LjEgMzU5LjNINjI3LjhMODI1LjkgMTA5YzQuMS01LjMuNC0xMy02LjMtMTNINDM2LjFjLTIuOCAwLTUuNSAxLjUtNi45IDRMMTcwLjEgNTQ3LjVjLTMuMSA1LjMuNyAxMiA2LjkgMTJoMTc0LjRMMjYyIDkxNy4xYy0xLjkgNy44IDcuNSAxMy4zIDEzLjMgNy43TDg1My42IDM3M2M1LjItNC45IDEuNy0xMy43LTUuNS0xMy43ek0zNzguMyA3MzIuNWw2MC4zLTI0MUgyODEuMmwxODkuNi0zMjcuNGgyMjQuNkw0ODcuMSA0MjcuNGgyMTFMMzc4LjMgNzMyLjV6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ThunderboltTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ThunderboltTwoTone';
}
var _default = exports.default = RefIcon;