"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AlipayOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AlipayOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AlipayOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AlipayOutlined.default
}));

/**![alipay](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTU3LjIgMTI5YTYuNjggNi42OCAwIDAxNi43MiA2LjY1VjI1MC4yaDI0My44YTYuNzQgNi43NCAwIDAxNi42NSA2Ljg0Yy4wMiAyMy45Mi02LjA1IDU0LjY5LTE5Ljg1IDU0LjY5SDU2My45NHY4MS4xaDE2Ni4xOGM3LjY5IDAgMTMuOCA2LjUxIDEzLjI1IDE0LjE4bC0uMTEgMS41MWMtLjcgOTAuMi0zMC42MyAxODAuNjQtNzkuNTIgMjU5LjY1bDguNzEgMy44MmM3Ny4zIDMzLjQ4IDE2Mi4xNSA2MC44NSAyNjcuMTUgNjQuMTRhMjEuMDggMjEuMDggMCAwMTIwLjM4IDIyLjA3bC0uMiAzLjk1Yy0zLjM0IDU5LjU3LTIwIDEzMi44NS03OS44NSAxMzIuODUtOC44IDAtMTcuMjktLjU1LTI1LjQ4LTEuNjEtNzguMDQtOS4yNS0xNTYuMjgtNTcuMDUtMjM2LjMyLTExMC4yN2wtMTcuMzMtMTEuNTctMTMuMTUtOC44M2E0ODAuODMgNDgwLjgzIDAgMDEtNjkuOTkgNTcuMjUgMTkyLjggMTkyLjggMCAwMS0xOS41NyAxMS4wOGMtNjUuNTEgMzkuMTgtMTQyLjIxIDYyLjYtMjI3LjQyIDYyLjYyLTExOC4yIDAtMjA0LjkyLTc3Ljk3LTIwNi42NC0xNzUuOWwtLjAzLTIuOTUuMDMtMS43YzEuNjYtOTguMTIgODQuNzctMTc1LjE4IDIwMy0xNzYuNzJsMy42NC0uMDNjMTAyLjkyIDAgMTg2LjY2IDMzLjU0IDI3MC40OCA3My4xNGwuNDQuMzggMS43LTMuNDdjMjEuMjctNDQuMTQgMzYuNDQtOTQuOTUgNDIuNzQtMTUyLjA2aC0zMjQuOGE2LjY0IDYuNjQgMCAwMS02LjYzLTYuNjJjLS4wNC0yMS44NiA2LTU0LjkxIDE5Ljg1LTU0LjkxaDE2Mi4xdi04MS4xSDE5MS45MmE2LjcxIDYuNzEgMCAwMS02LjY0LTYuODVjLS4wMS0yMi42MSA2LjA2LTU0LjY4IDE5Ljg2LTU0LjY4aDIzMS40di02NC44NWwuMDItMS45OWMuOS0zMC45MyAyMy43Mi01NC4zNiAxMjAuNjQtNTQuMzZNMjU2LjkgNjE5Yy03NC43NyAwLTEzNi41MyAzOS45My0xMzcuODggOTUuNmwtLjAyIDEuMjYuMDggMy4yNGE5Mi41NSA5Mi41NSAwIDAwMS41OCAxMy42NGMyMC4yNiA5Ni41IDIyMC4xNiAxMjkuNzEgMzY0LjM0LTM2LjU5bC04LjAzLTQuNzJDNDA1Ljk1IDY1MC4xMSAzMzIuOTQgNjE5IDI1Ni45IDYxOSIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(AlipayOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AlipayOutlined';
}
var _default = exports.default = RefIcon;