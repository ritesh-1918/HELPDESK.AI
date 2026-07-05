"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FundViewOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FundViewOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FundViewOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FundViewOutlined.default
}));

/**![fund-view](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik05NTYgNjg2LjVsLS4xLS4xLS4xLS4xQzkxMS43IDU5MyA4NDMuNCA1NDUgNzUyLjUgNTQ1cy0xNTkuMiA0OC4xLTIwMy40IDE0MS4zdi4xYTQyLjkyIDQyLjkyIDAgMDAwIDM2LjRDNTkzLjMgODE2IDY2MS42IDg2NCA3NTIuNSA4NjRzMTU5LjItNDguMSAyMDMuNC0xNDEuM2M1LjQtMTEuNSA1LjQtMjQuOC4xLTM2LjJ6TTc1Mi41IDgwMGMtNjIuMSAwLTEwNy40LTMwLTE0MS4xLTk1LjVDNjQ1IDYzOSA2OTAuNCA2MDkgNzUyLjUgNjA5YzYyLjEgMCAxMDcuNCAzMCAxNDEuMSA5NS41Qzg2MCA3NzAgODE0LjYgODAwIDc1Mi41IDgwMHoiIC8+PHBhdGggZD0iTTY5NyA3MDVhNTYgNTYgMCAxMDExMiAwIDU2IDU2IDAgMTAtMTEyIDB6TTEzNiAyMzJoNzA0djI1M2g3MlYxOTJjMC0xNy43LTE0LjMtMzItMzItMzJIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjUyMGMwIDE3LjcgMTQuMyAzMiAzMiAzMmgzNTJ2LTcySDEzNlYyMzJ6IiAvPjxwYXRoIGQ9Ik03MjQuOSAzMzguMWwtMzYuOC0zNi44YTguMDMgOC4wMyAwIDAwLTExLjMgMEw0OTMgNDg1LjNsLTg2LjEtODYuMmE4LjAzIDguMDMgMCAwMC0xMS4zIDBMMjUxLjMgNTQzLjRhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzYuOCAzNi44YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsMTAxLjgtMTAxLjggODYuMSA4Ni4yYzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsMjI2LjMtMjI2LjVjMy4yLTMuMSAzLjItOC4yIDAtMTEuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FundViewOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FundViewOutlined';
}
var _default = exports.default = RefIcon;