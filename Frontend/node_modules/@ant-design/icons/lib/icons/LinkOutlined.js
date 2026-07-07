"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LinkOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LinkOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LinkOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LinkOutlined.default
}));

/**![link](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU3NCA2NjUuNGE4LjAzIDguMDMgMCAwMC0xMS4zIDBMNDQ2LjUgNzgxLjZjLTUzLjggNTMuOC0xNDQuNiA1OS41LTIwNCAwLTU5LjUtNTkuNS01My44LTE1MC4yIDAtMjA0bDExNi4yLTExNi4yYzMuMS0zLjEgMy4xLTguMiAwLTExLjNsLTM5LjgtMzkuOGE4LjAzIDguMDMgMCAwMC0xMS4zIDBMMTkxLjQgNTI2LjVjLTg0LjYgODQuNi04NC42IDIyMS41IDAgMzA2czIyMS41IDg0LjYgMzA2IDBsMTE2LjItMTE2LjJjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM0w1NzQgNjY1LjR6bTI1OC42LTQ3NGMtODQuNi04NC42LTIyMS41LTg0LjYtMzA2IDBMNDEwLjMgMzA3LjZhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzkuNyAzOS43YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsMTE2LjItMTE2LjJjNTMuOC01My44IDE0NC42LTU5LjUgMjA0IDAgNTkuNSA1OS41IDUzLjggMTUwLjIgMCAyMDRMNjY1LjMgNTYyLjZhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzkuOCAzOS44YzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBsMTE2LjItMTE2LjJjODQuNS04NC42IDg0LjUtMjIxLjUgMC0zMDYuMXpNNjEwLjEgMzcyLjNhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDM3Mi4zIDU5OC43YTguMDMgOC4wMyAwIDAwMCAxMS4zbDM5LjYgMzkuNmMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDIyNi40LTIyNi40YzMuMS0zLjEgMy4xLTguMiAwLTExLjNsLTM5LjUtMzkuNnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LinkOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LinkOutlined';
}
var _default = exports.default = RefIcon;