"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SunOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SunOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SunOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SunOutlined.default
}));

/**![sun](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQ4IDgxOHYxMjZhMTYgMTYgMCAwMS0xNiAxNmgtNDBhMTYgMTYgMCAwMS0xNi0xNlY4MThjMTUuODUgMS42NCAyNy44NCAyLjQ2IDM2IDIuNDYgOC4xNSAwIDIwLjE2LS44MiAzNi0yLjQ2bTIwNS4yNS0xMTUuNjZsODkuMSA4OS4xYTE2IDE2IDAgMDEwIDIyLjYybC0yOC4yOSAyOC4yOWExNiAxNiAwIDAxLTIyLjYyIDBsLTg5LjEtODkuMWMxMi4zNy0xMC4wNCAyMS40My0xNy45NSAyNy4yLTIzLjcxIDUuNzYtNS43NyAxMy42Ny0xNC44NCAyMy43MS0yNy4ybS00ODIuNSAwYzEwLjA0IDEyLjM2IDE3Ljk1IDIxLjQzIDIzLjcxIDI3LjIgNS43NyA1Ljc2IDE0Ljg0IDEzLjY3IDI3LjIgMjMuNzFsLTg5LjEgODkuMWExNiAxNiAwIDAxLTIyLjYyIDBsLTI4LjI5LTI4LjI5YTE2IDE2IDAgMDEwLTIyLjYzek01MTIgMjc4YzEyOS4yNCAwIDIzNCAxMDQuNzcgMjM0IDIzNFM2NDEuMjQgNzQ2IDUxMiA3NDYgMjc4IDY0MS4yNCAyNzggNTEyczEwNC43Ny0yMzQgMjM0LTIzNG0wIDcyYy04OS40NyAwLTE2MiA3Mi41My0xNjIgMTYyczcyLjUzIDE2MiAxNjIgMTYyIDE2Mi03Mi41MyAxNjItMTYyLTcyLjUzLTE2Mi0xNjItMTYyTTIwNiA0NzZjLTEuNjQgMTUuODUtMi40NiAyNy44NC0yLjQ2IDM2IDAgOC4xNS44MiAyMC4xNiAyLjQ2IDM2SDgwYTE2IDE2IDAgMDEtMTYtMTZ2LTQwYTE2IDE2IDAgMDExNi0xNnptNzM4IDBhMTYgMTYgMCAwMTE2IDE2djQwYTE2IDE2IDAgMDEtMTYgMTZIODE4YzEuNjQtMTUuODUgMi40Ni0yNy44NCAyLjQ2LTM2IDAtOC4xNS0uODItMjAuMTYtMi40Ni0zNnpNODE0LjA2IDE4MC42NWwyOC4yOSAyOC4yOWExNiAxNiAwIDAxMCAyMi42M2wtODkuMSA4OS4wOWMtMTAuMDQtMTIuMzctMTcuOTUtMjEuNDMtMjMuNzEtMjcuMi01Ljc3LTUuNzYtMTQuODQtMTMuNjctMjcuMi0yMy43MWw4OS4xLTg5LjFhMTYgMTYgMCAwMTIyLjYyIDBtLTU4MS41IDBsODkuMSA4OS4xYy0xMi4zNyAxMC4wNC0yMS40MyAxNy45NS0yNy4yIDIzLjcxLTUuNzYgNS43Ny0xMy42NyAxNC44NC0yMy43MSAyNy4ybC04OS4xLTg5LjFhMTYgMTYgMCAwMTAtMjIuNjJsMjguMjktMjguMjlhMTYgMTYgMCAwMTIyLjYyIDBNNTMyIDY0YTE2IDE2IDAgMDExNiAxNnYxMjZjLTE1Ljg1LTEuNjQtMjcuODQtMi40Ni0zNi0yLjQ2LTguMTUgMC0yMC4xNi44Mi0zNiAyLjQ2VjgwYTE2IDE2IDAgMDExNi0xNnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(SunOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SunOutlined';
}
var _default = exports.default = RefIcon;