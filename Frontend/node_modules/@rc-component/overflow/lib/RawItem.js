"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _Item = _interopRequireDefault(require("./Item"));
var _context = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const InternalRawItem = (props, ref) => {
  const context = React.useContext(_context.OverflowContext);

  // Render directly when context not provided
  if (!context) {
    const {
      component: Component = 'div',
      ...restProps
    } = props;
    return /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({}, restProps, {
      ref: ref
    }));
  }
  const {
    className: contextClassName,
    ...restContext
  } = context;
  const {
    className,
    ...restProps
  } = props;

  // Do not pass context to sub item to avoid multiple measure
  return /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({
    ref: ref,
    className: (0, _clsx.clsx)(contextClassName, className)
  }, restContext, restProps)));
};
const RawItem = /*#__PURE__*/React.forwardRef(InternalRawItem);
if (process.env.NODE_ENV !== 'production') {
  RawItem.displayName = 'RawItem';
}
var _default = exports.default = RawItem;