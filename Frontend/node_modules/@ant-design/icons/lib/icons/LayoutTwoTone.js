"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LayoutTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LayoutTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LayoutTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LayoutTwoTone.default
}));

/**![layout](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM4NCAxODVoNDU2djEzNkgzODR6bS0yMDAgMGgxMzZ2NjU2SDE4NHptNjk2LTczSDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MWMwLTE3LjcgMTQuMy0zMiAzMi0zMmg3MzZjMTcuNyAwIDMyIDE0LjMgMzIgMzJ2LTFjMC0xNy43LTE0LjMtMzItMzItMzJ6TTM4NCAzODVoNDU2djQ1NkgzODR6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik04ODAgMTEzSDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NzM2YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDczNmMxNy43IDAgMzItMTQuMyAzMi0zMlYxNDVjMC0xNy43LTE0LjMtMzItMzItMzJ6TTMyMCA4NDFIMTg0VjE4NWgxMzZ2NjU2em01MjAgMEgzODRWMzg1aDQ1NnY0NTZ6bTAtNTIwSDM4NFYxODVoNDU2djEzNnoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LayoutTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LayoutTwoTone';
}
var _default = exports.default = RefIcon;