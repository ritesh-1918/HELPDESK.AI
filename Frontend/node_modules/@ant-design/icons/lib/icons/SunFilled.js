"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SunFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SunFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SunFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SunFilled.default
}));

/**![sun](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQ4IDgxOHYxMjZhMTYgMTYgMCAwMS0xNiAxNmgtNDBhMTYgMTYgMCAwMS0xNi0xNlY4MThjMTUuODUgMS42NCAyNy44NCAyLjQ2IDM2IDIuNDYgOC4xNSAwIDIwLjE2LS44MiAzNi0yLjQ2bTIwNS4yNS0xMTUuNjZsODkuMSA4OS4xYTE2IDE2IDAgMDEwIDIyLjYybC0yOC4yOSAyOC4yOWExNiAxNiAwIDAxLTIyLjYyIDBsLTg5LjEtODkuMWMxMi4zNy0xMC4wNCAyMS40My0xNy45NSAyNy4yLTIzLjcxIDUuNzYtNS43NyAxMy42Ny0xNC44NCAyMy43MS0yNy4ybS00ODIuNSAwYzEwLjA0IDEyLjM2IDE3Ljk1IDIxLjQzIDIzLjcxIDI3LjIgNS43NyA1Ljc2IDE0Ljg0IDEzLjY3IDI3LjIgMjMuNzFsLTg5LjEgODkuMWExNiAxNiAwIDAxLTIyLjYyIDBsLTI4LjI5LTI4LjI5YTE2IDE2IDAgMDEwLTIyLjYzek01MTIgMjc4YzEyOS4yNCAwIDIzNCAxMDQuNzcgMjM0IDIzNFM2NDEuMjQgNzQ2IDUxMiA3NDYgMjc4IDY0MS4yNCAyNzggNTEyczEwNC43Ny0yMzQgMjM0LTIzNE0yMDYgNDc2Yy0xLjY0IDE1Ljg1LTIuNDYgMjcuODQtMi40NiAzNiAwIDguMTUuODIgMjAuMTYgMi40NiAzNkg4MGExNiAxNiAwIDAxLTE2LTE2di00MGExNiAxNiAwIDAxMTYtMTZ6bTczOCAwYTE2IDE2IDAgMDExNiAxNnY0MGExNiAxNiAwIDAxLTE2IDE2SDgxOGMxLjY0LTE1Ljg1IDIuNDYtMjcuODQgMi40Ni0zNiAwLTguMTUtLjgyLTIwLjE2LTIuNDYtMzZ6TTgxNC4wNiAxODAuNjVsMjguMjkgMjguMjlhMTYgMTYgMCAwMTAgMjIuNjNsLTg5LjEgODkuMDljLTEwLjA0LTEyLjM3LTE3Ljk1LTIxLjQzLTIzLjcxLTI3LjItNS43Ny01Ljc2LTE0Ljg0LTEzLjY3LTI3LjItMjMuNzFsODkuMS04OS4xYTE2IDE2IDAgMDEyMi42MiAwbS01ODEuNSAwbDg5LjEgODkuMWMtMTIuMzcgMTAuMDQtMjEuNDMgMTcuOTUtMjcuMiAyMy43MS01Ljc2IDUuNzctMTMuNjcgMTQuODQtMjMuNzEgMjcuMmwtODkuMS04OS4xYTE2IDE2IDAgMDEwLTIyLjYybDI4LjI5LTI4LjI5YTE2IDE2IDAgMDEyMi42MiAwTTUzMiA2NGExNiAxNiAwIDAxMTYgMTZ2MTI2Yy0xNS44NS0xLjY0LTI3Ljg0LTIuNDYtMzYtMi40Ni04LjE1IDAtMjAuMTYuODItMzYgMi40NlY4MGExNiAxNiAwIDAxMTYtMTZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SunFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SunFilled';
}
var _default = exports.default = RefIcon;