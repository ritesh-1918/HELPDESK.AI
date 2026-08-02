"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MediumSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MediumSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MediumSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MediumSquareFilled.default
}));

/**![medium-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNzY4IDMxNy43bC00MC44IDM5LjFjLTMuNiAyLjctNS4zIDcuMS00LjYgMTEuNHYyODcuN2MtLjcgNC40IDEgOC44IDQuNiAxMS40bDQwIDM5LjF2OC43SDU2Ni40di04LjNsNDEuMy00MC4xYzQuMS00LjEgNC4xLTUuMyA0LjEtMTEuNFY0MjIuNWwtMTE1IDI5MS42aC0xNS41TDM0Ny41IDQyMi41VjYxOGMtMS4yIDguMiAxLjcgMTYuNSA3LjUgMjIuNGw1My44IDY1LjF2OC43SDI1NnYtOC43bDUzLjgtNjUuMWEyNi4xIDI2LjEgMCAwMDctMjIuNFYzOTJjLjctNi4zLTEuNy0xMi40LTYuNS0xNi43bC00Ny44LTU3LjZWMzA5SDQxMWwxMTQuNiAyNTEuNSAxMDAuOS0yNTEuM0g3Njh2OC41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(MediumSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MediumSquareFilled';
}
var _default = exports.default = RefIcon;