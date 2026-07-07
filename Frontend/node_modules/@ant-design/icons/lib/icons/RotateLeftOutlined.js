"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RotateLeftOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RotateLeftOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RotateLeftOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RotateLeftOutlined.default
}));

/**![rotate-left](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik02NzIgNDE4SDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NDE0YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDUyOGMxNy43IDAgMzItMTQuMyAzMi0zMlY0NTBjMC0xNy43LTE0LjMtMzItMzItMzJ6bS00NCA0MDJIMTg4VjQ5NGg0NDB2MzI2eiIgLz48cGF0aCBkPSJNODE5LjMgMzI4LjVjLTc4LjgtMTAwLjctMTk2LTE1My42LTMxNC42LTE1NC4ybC0uMi02NGMwLTYuNS03LjYtMTAuMS0xMi42LTYuMWwtMTI4IDEwMWMtNCAzLjEtMy45IDkuMSAwIDEyLjNMNDkyIDMxOC42YzUuMSA0IDEyLjcuNCAxMi42LTYuMXYtNjMuOWMxMi45LjEgMjUuOS45IDM4LjggMi41IDQyLjEgNS4yIDgyLjEgMTguMiAxMTkgMzguNyAzOC4xIDIxLjIgNzEuMiA0OS43IDk4LjQgODQuMyAyNy4xIDM0LjcgNDYuNyA3My43IDU4LjEgMTE1LjhhMzI1Ljk1IDMyNS45NSAwIDAxNi41IDE0MC45aDc0LjljMTQuOC0xMDMuNi0xMS4zLTIxMy04MS0zMDIuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(RotateLeftOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RotateLeftOutlined';
}
var _default = exports.default = RefIcon;