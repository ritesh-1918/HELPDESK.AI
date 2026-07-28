"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DockerOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DockerOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DockerOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DockerOutlined.default
}));

/**![docker](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTU1Ljg4IDQ4OC4yNGgtOTIuNjJ2LTgyLjc5aDkyLjYyem0wLTI4Ni4yNGgtOTIuNjJ2ODUuNTloOTIuNjJ6bTEwOS40NSAyMDMuNDVINTcyLjd2ODIuNzloOTIuNjJ6bS0yMTguOS0xMDEuMDJoLTkyLjYxdjg0LjE4aDkyLjZ6bTEwOS40NSAwaC05Mi42MXY4NC4xOGg5Mi42em0zODguNjkgMTQwLjNjLTE5LjY1LTE0LjAyLTY3LjM2LTE4LjIzLTEwMi40NC0xMS4yMi00LjItMzMuNjctMjMuODUtNjMuMTQtNTcuNTMtODkuOGwtMTkuNjUtMTIuNjItMTIuNjIgMTkuNjRjLTI1LjI2IDM5LjI5LTMyLjI4IDEwMy44My01LjYyIDE0NS45Mi0xMi42MyA3LjAyLTM2LjQ4IDE1LjQ0LTY3LjM1IDE1LjQ0SDY3LjU2Yy0xMi42MyA3MS41NiA4LjQyIDE2NC4xNiA2MS43NCAyMjcuM0MxODEuMjIgODAxLjEzIDI1OS44IDgzMiAzNjAuODMgODMyYzIyMC4zIDAgMzg0LjQ4LTEwMS4wMiA0NjAuMjUtMjg2LjI0IDI5LjQ3IDAgOTUuNDIgMCAxMjcuNy02My4xNCAxLjQtMi44IDkuODItMTguMjQgMTEuMjItMjMuODV6bS03MTcuMDQtMzkuMjhoLTkyLjYxdjgyLjc5aDkyLjZ6bTEwOS40NSAwaC05Mi42MXY4Mi43OWg5Mi42em0xMDkuNDUgMGgtOTIuNjF2ODIuNzloOTIuNnpNMzM2Ljk4IDMwNC40M2gtOTIuNjF2ODQuMTloOTIuNnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DockerOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DockerOutlined';
}
var _default = exports.default = RefIcon;