"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PayCircleOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PayCircleOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PayCircleOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PayCircleOutlined.default
}));

/**![pay-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnptMTU5LjYtNTg1aC01OS41Yy0zIDAtNS44IDEuNy03LjEgNC40bC05MC42IDE4MEg1MTFsLTkwLjYtMTgwYTggOCAwIDAwLTcuMS00LjRoLTYwLjdjLTEuMyAwLTIuNi4zLTMuOCAxLTMuOSAyLjEtNS4zIDctMy4yIDEwLjlMNDU3IDUxNS43aC02MS40Yy00LjQgMC04IDMuNi04IDh2MjkuOWMwIDQuNCAzLjYgOCA4IDhoODEuN1Y2MDNoLTgxLjdjLTQuNCAwLTggMy42LTggOHYyOS45YzAgNC40IDMuNiA4IDggOGg4MS43VjcxN2MwIDQuNCAzLjYgOCA4IDhoNTQuM2M0LjQgMCA4LTMuNiA4LTh2LTY4LjFoODJjNC40IDAgOC0zLjYgOC04VjYxMWMwLTQuNC0zLjYtOC04LThoLTgydi00MS41aDgyYzQuNCAwIDgtMy42IDgtOHYtMjkuOWMwLTQuNC0zLjYtOC04LThoLTYybDExMS4xLTIwNC44Yy42LTEuMiAxLTIuNSAxLTMuOC0uMS00LjQtMy43LTgtOC4xLTh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(PayCircleOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PayCircleOutlined';
}
var _default = exports.default = RefIcon;