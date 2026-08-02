"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloudServerOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CloudServerOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CloudServerOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CloudServerOutlined.default
}));

/**![cloud-server](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcwNCA0NDZIMzIwYy00LjQgMC04IDMuNi04IDh2NDAyYzAgNC40IDMuNiA4IDggOGgzODRjNC40IDAgOC0zLjYgOC04VjQ1NGMwLTQuNC0zLjYtOC04LTh6bS0zMjggNjRoMjcydjExN0gzNzZWNTEwem0yNzIgMjkwSDM3NlY2ODNoMjcydjExN3oiIC8+PHBhdGggZD0iTTQyNCA3NDhhMzIgMzIgMCAxMDY0IDAgMzIgMzIgMCAxMC02NCAwem0wLTE3OGEzMiAzMiAwIDEwNjQgMCAzMiAzMiAwIDEwLTY0IDB6IiAvPjxwYXRoIGQ9Ik04MTEuNCAzNjguOUM3NjUuNiAyNDggNjQ4LjkgMTYyIDUxMi4yIDE2MlMyNTguOCAyNDcuOSAyMTMgMzY4LjhDMTI2LjkgMzkxLjUgNjMuNSA0NzAuMiA2NCA1NjMuNiA2NC42IDY2OCAxNDUuNiA3NTIuOSAyNDcuNiA3NjJjNC43LjQgOC43LTMuMyA4LjctOHYtNjAuNGMwLTQtMy03LjQtNy03LjktMjctMy40LTUyLjUtMTUuMi03Mi4xLTM0LjUtMjQtMjMuNS0zNy4yLTU1LjEtMzcuMi04OC42IDAtMjggOS4xLTU0LjQgMjYuMi03Ni40IDE2LjctMjEuNCA0MC4yLTM2LjkgNjYuMS00My43bDM3LjktMTAgMTMuOS0zNi43YzguNi0yMi44IDIwLjYtNDQuMiAzNS43LTYzLjUgMTQuOS0xOS4yIDMyLjYtMzYgNTIuNC01MCA0MS4xLTI4LjkgODkuNS00NC4yIDE0MC00NC4yczk4LjkgMTUuMyAxNDAgNDQuM2MxOS45IDE0IDM3LjUgMzAuOCA1Mi40IDUwIDE1LjEgMTkuMyAyNy4xIDQwLjcgMzUuNyA2My41bDEzLjggMzYuNiAzNy44IDEwYzU0LjIgMTQuNCA5Mi4xIDYzLjcgOTIuMSAxMjAgMCAzMy42LTEzLjIgNjUuMS0zNy4yIDg4LjYtMTkuNSAxOS4yLTQ0LjkgMzEuMS03MS45IDM0LjUtNCAuNS02LjkgMy45LTYuOSA3LjlWNzU0YzAgNC43IDQuMSA4LjQgOC44IDggMTAxLjctOS4yIDE4Mi41LTk0IDE4My4yLTE5OC4yLjYtOTMuNC02Mi43LTE3Mi4xLTE0OC42LTE5NC45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CloudServerOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CloudServerOutlined';
}
var _default = exports.default = RefIcon;