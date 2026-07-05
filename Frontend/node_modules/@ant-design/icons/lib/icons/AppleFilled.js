"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AppleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AppleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AppleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AppleFilled.default
}));

/**![apple](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc0Ny40IDUzNS43Yy0uNC02OC4yIDMwLjUtMTE5LjYgOTIuOS0xNTcuNS0zNC45LTUwLTg3LjctNzcuNS0xNTcuMy04Mi44LTY1LjktNS4yLTEzOCAzOC40LTE2NC40IDM4LjQtMjcuOSAwLTkxLjctMzYuNi0xNDEuOS0zNi42QzI3My4xIDI5OC44IDE2MyAzNzkuOCAxNjMgNTQ0LjZjMCA0OC43IDguOSA5OSAyNi43IDE1MC44IDIzLjggNjguMiAxMDkuNiAyMzUuMyAxOTkuMSAyMzIuNiA0Ni44LTEuMSA3OS45LTMzLjIgMTQwLjgtMzMuMiA1OS4xIDAgODkuNyAzMy4yIDE0MS45IDMzLjIgOTAuMy0xLjMgMTY3LjktMTUzLjIgMTkwLjUtMjIxLjYtMTIxLjEtNTcuMS0xMTQuNi0xNjcuMi0xMTQuNi0xNzAuN3ptLTEwNS4xLTMwNWM1MC43LTYwLjIgNDYuMS0xMTUgNDQuNi0xMzQuNy00NC44IDIuNi05Ni42IDMwLjUtMTI2LjEgNjQuOC0zMi41IDM2LjgtNTEuNiA4Mi4zLTQ3LjUgMTMzLjYgNDguNCAzLjcgOTIuNi0yMS4yIDEyOS02My43eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(AppleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AppleFilled';
}
var _default = exports.default = RefIcon;