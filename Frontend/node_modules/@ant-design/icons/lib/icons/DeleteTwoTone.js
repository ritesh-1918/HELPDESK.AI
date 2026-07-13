"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DeleteTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DeleteTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DeleteTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DeleteTwoTone.default
}));

/**![delete](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5Mi43IDg0MGg0MzguNmwyNC4yLTUxMmgtNDg3eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODY0IDI1Nkg3MzZ2LTgwYzAtMzUuMy0yOC43LTY0LTY0LTY0SDM1MmMtMzUuMyAwLTY0IDI4LjctNjQgNjR2ODBIMTYwYy0xNy43IDAtMzIgMTQuMy0zMiAzMnYzMmMwIDQuNCAzLjYgOCA4IDhoNjAuNGwyNC43IDUyM2MxLjYgMzQuMSAyOS44IDYxIDYzLjkgNjFoNDU0YzM0LjIgMCA2Mi4zLTI2LjggNjMuOS02MWwyNC43LTUyM0g4ODhjNC40IDAgOC0zLjYgOC04di0zMmMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTUwNC03MmgzMDR2NzJIMzYwdi03MnptMzcxLjMgNjU2SDI5Mi43bC0yNC4yLTUxMmg0ODdsLTI0LjIgNTEyeiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DeleteTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DeleteTwoTone';
}
var _default = exports.default = RefIcon;