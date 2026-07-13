"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileExcelOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileExcelOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileExcelOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileExcelOutlined.default
}));

/**![file-excel](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDI4OC42TDYzOS40IDczLjRjLTYtNi0xNC4xLTkuNC0yMi42LTkuNEgxOTJjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjgzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NDBjMTcuNyAwIDMyLTE0LjMgMzItMzJWMzExLjNjMC04LjUtMy40LTE2LjctOS40LTIyLjd6TTc5MC4yIDMyNkg2MDJWMTM3LjhMNzkwLjIgMzI2em0xLjggNTYySDIzMlYxMzZoMzAydjIxNmE0MiA0MiAwIDAwNDIgNDJoMjE2djQ5NHpNNTE0LjEgNTgwLjFsLTYxLjgtMTAyLjRjLTIuMi0zLjYtNi4xLTUuOC0xMC4zLTUuOGgtMzguNGMtMi4zIDAtNC41LjYtNi40IDEuOS01LjYgMy41LTcuMyAxMC45LTMuNyAxNi42bDgyLjMgMTMwLjQtODMuNCAxMzIuOGExMi4wNCAxMi4wNCAwIDAwMTAuMiAxOC40aDM0LjVjNC4yIDAgOC0yLjIgMTAuMi01LjdMNTEwIDY2NC44bDYyLjMgMTAxLjRjMi4yIDMuNiA2LjEgNS43IDEwLjIgNS43SDYyMGMyLjMgMCA0LjUtLjcgNi41LTEuOSA1LjYtMy42IDcuMi0xMSAzLjYtMTYuNmwtODQtMTMwLjQgODUuMy0xMzIuNWExMi4wNCAxMi4wNCAwIDAwLTEwLjEtMTguNWgtMzUuN2MtNC4yIDAtOC4xIDIuMi0xMC4zIDUuOGwtNjEuMiAxMDIuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileExcelOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileExcelOutlined';
}
var _default = exports.default = RefIcon;