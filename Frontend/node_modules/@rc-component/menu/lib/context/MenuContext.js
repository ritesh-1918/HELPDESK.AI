"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuContext = void 0;
exports.default = InheritableContextProvider;
var React = _interopRequireWildcard(require("react"));
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const MenuContext = exports.MenuContext = /*#__PURE__*/React.createContext(null);
function mergeProps(origin, target) {
  const clone = {
    ...origin
  };
  Object.keys(target).forEach(key => {
    const value = target[key];
    if (value !== undefined) {
      clone[key] = value;
    }
  });
  return clone;
}
function InheritableContextProvider({
  children,
  locked,
  ...restProps
}) {
  const context = React.useContext(MenuContext);
  const inheritableContext = (0, _useMemo.default)(() => mergeProps(context, restProps), [context, restProps], (prev, next) => !locked && (prev[0] !== next[0] || !(0, _isEqual.default)(prev[1], next[1], true)));
  return /*#__PURE__*/React.createElement(MenuContext.Provider, {
    value: inheritableContext
  }, children);
}