"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SyncOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SyncOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SyncOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SyncOutlined.default
}));

/**![sync](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2OCA1MDQuMmMxLTQzLjcgMTAtODYuMSAyNi45LTEyNiAxNy4zLTQxIDQyLjEtNzcuNyA3My43LTEwOS40UzMzNyAyMTIuMyAzNzggMTk1YzQyLjQtMTcuOSA4Ny40LTI3IDEzMy45LTI3czkxLjUgOS4xIDEzMy44IDI3QTM0MS41IDM0MS41IDAgMDE3NTUgMjY4LjhjOS45IDkuOSAxOS4yIDIwLjQgMjcuOCAzMS40bC02MC4yIDQ3YTggOCAwIDAwMyAxNC4xbDE3NS43IDQzYzUgMS4yIDkuOS0yLjYgOS45LTcuN2wuOC0xODAuOWMwLTYuNy03LjctMTAuNS0xMi45LTYuM2wtNTYuNCA0NC4xQzc2NS44IDE1NS4xIDY0Ni4yIDkyIDUxMS44IDkyIDI4Mi43IDkyIDk2LjMgMjc1LjYgOTIgNTAzLjhhOCA4IDAgMDA4IDguMmg2MGM0LjQgMCA3LjktMy41IDgtNy44em03NTYgNy44aC02MGMtNC40IDAtNy45IDMuNS04IDcuOC0xIDQzLjctMTAgODYuMS0yNi45IDEyNi0xNy4zIDQxLTQyLjEgNzcuOC03My43IDEwOS40QTM0Mi40NSAzNDIuNDUgMCAwMTUxMi4xIDg1NmEzNDIuMjQgMzQyLjI0IDAgMDEtMjQzLjItMTAwLjhjLTkuOS05LjktMTkuMi0yMC40LTI3LjgtMzEuNGw2MC4yLTQ3YTggOCAwIDAwLTMtMTQuMWwtMTc1LjctNDNjLTUtMS4yLTkuOSAyLjYtOS45IDcuN2wtLjcgMTgxYzAgNi43IDcuNyAxMC41IDEyLjkgNi4zbDU2LjQtNDQuMUMyNTguMiA4NjguOSAzNzcuOCA5MzIgNTEyLjIgOTMyYzIyOS4yIDAgNDE1LjUtMTgzLjcgNDE5LjgtNDExLjhhOCA4IDAgMDAtOC04LjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SyncOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SyncOutlined';
}
var _default = exports.default = RefIcon;