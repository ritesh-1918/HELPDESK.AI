"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RestOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RestOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RestOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RestOutlined.default
}));

/**![rest](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik01MDggNzA0Yzc5LjUgMCAxNDQtNjQuNSAxNDQtMTQ0cy02NC41LTE0NC0xNDQtMTQ0LTE0NCA2NC41LTE0NCAxNDQgNjQuNSAxNDQgMTQ0IDE0NHptMC0yMjRjNDQuMiAwIDgwIDM1LjggODAgODBzLTM1LjggODAtODAgODAtODAtMzUuOC04MC04MCAzNS44LTgwIDgwLTgweiIgLz48cGF0aCBkPSJNODMyIDI1NmgtMjguMWwtMzUuNy0xMjAuOWMtNC0xMy43LTE2LjUtMjMuMS0zMC43LTIzLjFoLTQ1MWMtMTQuMyAwLTI2LjggOS40LTMwLjcgMjMuMUwyMjAuMSAyNTZIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnYyOGMwIDQuNCAzLjYgOCA4IDhoNDUuOGw0Ny43IDU1OC43YTMyIDMyIDAgMDAzMS45IDI5LjNoNDI5LjJhMzIgMzIgMCAwMDMxLjktMjkuM0w4MDIuMiAzMjRIODU2YzQuNCAwIDgtMy42IDgtOHYtMjhjMC0xNy43LTE0LjMtMzItMzItMzJ6bS01MTguNi03NmgzOTcuMmwyMi40IDc2SDI5MWwyMi40LTc2em0zNzYuMiA2NjRIMzI2LjRMMjgyIDMyNGg0NTEuOWwtNDQuMyA1MjB6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(RestOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RestOutlined';
}
var _default = exports.default = RefIcon;