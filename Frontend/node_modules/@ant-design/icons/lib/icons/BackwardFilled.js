"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BackwardFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BackwardFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BackwardFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BackwardFilled.default
}));

/**![backward](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ4NS42IDI0OS45TDE5OC4yIDQ5OGMtOC4zIDcuMS04LjMgMjAuOCAwIDI3LjlsMjg3LjQgMjQ4LjJjMTAuNyA5LjIgMjYuNC45IDI2LjQtMTRWMjYzLjhjMC0xNC44LTE1LjctMjMuMi0yNi40LTEzLjl6bTMyMCAwTDUxOC4yIDQ5OGExOC42IDE4LjYgMCAwMC02LjIgMTRjMCA1LjIgMi4xIDEwLjQgNi4yIDE0bDI4Ny40IDI0OC4yYzEwLjcgOS4yIDI2LjQuOSAyNi40LTE0VjI2My44YzAtMTQuOC0xNS43LTIzLjItMjYuNC0xMy45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(BackwardFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BackwardFilled';
}
var _default = exports.default = RefIcon;