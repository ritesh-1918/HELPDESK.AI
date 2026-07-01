"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BranchesOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BranchesOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BranchesOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BranchesOutlined.default
}));

/**![branches](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc0MCAxNjFjLTYxLjggMC0xMTIgNTAuMi0xMTIgMTEyIDAgNTAuMSAzMy4xIDkyLjYgNzguNSAxMDYuOXY5NS45TDMyMCA2MDIuNFYzMTguMWM0NC4yLTE1IDc2LTU2LjkgNzYtMTA2LjEgMC02MS44LTUwLjItMTEyLTExMi0xMTJzLTExMiA1MC4yLTExMiAxMTJjMCA0OS4yIDMxLjggOTEgNzYgMTA2LjFWNzA2Yy00NC4yIDE1LTc2IDU2LjktNzYgMTA2LjEgMCA2MS44IDUwLjIgMTEyIDExMiAxMTJzMTEyLTUwLjIgMTEyLTExMmMwLTQ5LjItMzEuOC05MS03Ni0xMDYuMXYtMjcuOGw0MjMuNS0xMzguN2E1MC41MiA1MC41MiAwIDAwMzQuOS00OC4yVjM3OC4yYzQyLjktMTUuOCA3My42LTU3IDczLjYtMTA1LjIgMC02MS44LTUwLjItMTEyLTExMi0xMTJ6bS01MDQgNTFhNDguMDEgNDguMDEgMCAwMTk2IDAgNDguMDEgNDguMDEgMCAwMS05NiAwem05NiA2MDBhNDguMDEgNDguMDEgMCAwMS05NiAwIDQ4LjAxIDQ4LjAxIDAgMDE5NiAwem00MDgtNDkxYTQ4LjAxIDQ4LjAxIDAgMDEwLTk2IDQ4LjAxIDQ4LjAxIDAgMDEwIDk2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(BranchesOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BranchesOutlined';
}
var _default = exports.default = RefIcon;