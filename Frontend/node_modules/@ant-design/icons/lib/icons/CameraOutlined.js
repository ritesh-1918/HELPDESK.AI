"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CameraOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CameraOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CameraOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CameraOutlined.default
}));

/**![camera](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2NCAyNDhINzI4bC0zMi40LTkwLjhhMzIuMDcgMzIuMDcgMCAwMC0zMC4yLTIxLjJIMzU4LjZjLTEzLjUgMC0yNS42IDguNS0zMC4xIDIxLjJMMjk2IDI0OEgxNjBjLTQ0LjIgMC04MCAzNS44LTgwIDgwdjQ1NmMwIDQ0LjIgMzUuOCA4MCA4MCA4MGg3MDRjNDQuMiAwIDgwLTM1LjggODAtODBWMzI4YzAtNDQuMi0zNS44LTgwLTgwLTgwem04IDUzNmMwIDQuNC0zLjYgOC04IDhIMTYwYy00LjQgMC04LTMuNi04LThWMzI4YzAtNC40IDMuNi04IDgtOGgxODYuN2wxNy4xLTQ3LjggMjIuOS02NC4yaDI1MC41bDIyLjkgNjQuMiAxNy4xIDQ3LjhIODY0YzQuNCAwIDggMy42IDggOHY0NTZ6TTUxMiAzODRjLTg4LjQgMC0xNjAgNzEuNi0xNjAgMTYwczcxLjYgMTYwIDE2MCAxNjAgMTYwLTcxLjYgMTYwLTE2MC03MS42LTE2MC0xNjAtMTYwem0wIDI1NmMtNTMgMC05Ni00My05Ni05NnM0My05NiA5Ni05NiA5NiA0MyA5NiA5Ni00MyA5Ni05NiA5NnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CameraOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CameraOutlined';
}
var _default = exports.default = RefIcon;