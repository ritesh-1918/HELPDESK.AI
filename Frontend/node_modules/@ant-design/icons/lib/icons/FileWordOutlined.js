"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileWordOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileWordOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileWordOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileWordOutlined.default
}));

/**![file-word](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDI4OC42TDYzOS40IDczLjRjLTYtNi0xNC4xLTkuNC0yMi42LTkuNEgxOTJjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjgzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NDBjMTcuNyAwIDMyLTE0LjMgMzItMzJWMzExLjNjMC04LjUtMy40LTE2LjctOS40LTIyLjd6TTc5MC4yIDMyNkg2MDJWMTM3LjhMNzkwLjIgMzI2em0xLjggNTYySDIzMlYxMzZoMzAydjIxNmE0MiA0MiAwIDAwNDIgNDJoMjE2djQ5NHpNNTI4LjEgNDcyaC0zMi4yYy01LjUgMC0xMC4zIDMuNy0xMS42IDkuMUw0MzQuNiA2ODBsLTQ2LjEtMTk4LjdjLTEuMy01LjQtNi4xLTkuMy0xMS43LTkuM2gtMzUuNGExMi4wMiAxMi4wMiAwIDAwLTExLjYgMTUuMWw3NC4yIDI3NmMxLjQgNS4yIDYuMiA4LjkgMTEuNiA4LjloMzJjNS40IDAgMTAuMi0zLjYgMTEuNi04LjlsNTIuOC0xOTcgNTIuOCAxOTdjMS40IDUuMiA2LjIgOC45IDExLjYgOC45aDMxLjhjNS40IDAgMTAuMi0zLjYgMTEuNi04LjlsNzQuNC0yNzZhMTIuMDQgMTIuMDQgMCAwMC0xMS42LTE1LjFINjQ3Yy01LjYgMC0xMC40IDMuOS0xMS43IDkuM2wtNDUuOCAxOTkuMS00OS44LTE5OS4zYy0xLjMtNS40LTYuMS05LjEtMTEuNi05LjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileWordOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileWordOutlined';
}
var _default = exports.default = RefIcon;