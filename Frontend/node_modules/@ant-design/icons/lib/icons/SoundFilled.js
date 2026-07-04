"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SoundFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SoundFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SoundFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SoundFilled.default
}));

/**![sound](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg5Mi4xIDczNy44bC0xMTAuMy02My43YTE1LjkgMTUuOSAwIDAwLTIxLjcgNS45bC0xOS45IDM0LjVjLTQuNCA3LjYtMS44IDE3LjQgNS44IDIxLjhMODU2LjMgODAwYTE1LjkgMTUuOSAwIDAwMjEuNy01LjlsMTkuOS0zNC41YzQuNC03LjYgMS43LTE3LjQtNS44LTIxLjh6TTc2MCAzNDRhMTUuOSAxNS45IDAgMDAyMS43IDUuOUw4OTIgMjg2LjJjNy42LTQuNCAxMC4yLTE0LjIgNS44LTIxLjhMODc4IDIzMGExNS45IDE1LjkgMCAwMC0yMS43LTUuOUw3NDYgMjg3LjhhMTUuOTkgMTUuOTkgMCAwMC01LjggMjEuOEw3NjAgMzQ0em0xNzQgMTMySDgwNmMtOC44IDAtMTYgNy4yLTE2IDE2djQwYzAgOC44IDcuMiAxNiAxNiAxNmgxMjhjOC44IDAgMTYtNy4yIDE2LTE2di00MGMwLTguOC03LjItMTYtMTYtMTZ6TTYyNS45IDExNWMtNS45IDAtMTEuOSAxLjYtMTcuNCA1LjNMMjU0IDM1Mkg5MGMtOC44IDAtMTYgNy4yLTE2IDE2djI4OGMwIDguOCA3LjIgMTYgMTYgMTZoMTY0bDM1NC41IDIzMS43YzUuNSAzLjYgMTEuNiA1LjMgMTcuNCA1LjMgMTYuNyAwIDMyLjEtMTMuMyAzMi4xLTMyLjFWMTQ3LjFjMC0xOC44LTE1LjQtMzIuMS0zMi4xLTMyLjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SoundFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SoundFilled';
}
var _default = exports.default = RefIcon;