"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// Use shared variable to save bundle size
const UNDEFINED = undefined;
function InternalItem(props, ref) {
  const {
    prefixCls,
    invalidate,
    item,
    renderItem,
    responsive,
    responsiveDisabled,
    registerSize,
    itemKey,
    className,
    style,
    children,
    display,
    order,
    component: Component = 'div',
    ...restProps
  } = props;
  const mergedHidden = responsive && !display;

  // ================================ Effect ================================
  function internalRegisterSize(width) {
    registerSize(itemKey, width);
  }
  React.useEffect(() => () => {
    internalRegisterSize(null);
  }, []);

  // ================================ Render ================================
  const childNode = renderItem && item !== UNDEFINED ? renderItem(item, {
    index: order
  }) : children;
  let overflowStyle;
  if (!invalidate) {
    overflowStyle = {
      opacity: mergedHidden ? 0 : 1,
      height: mergedHidden ? 0 : UNDEFINED,
      overflowY: mergedHidden ? 'hidden' : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden ? 'none' : UNDEFINED,
      position: mergedHidden ? 'absolute' : UNDEFINED
    };
  }
  const overflowProps = {};
  if (mergedHidden) {
    overflowProps['aria-hidden'] = true;
  }
  let itemNode = /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({
    className: (0, _clsx.clsx)(!invalidate && prefixCls, className),
    style: {
      ...overflowStyle,
      ...style
    }
  }, overflowProps, restProps, {
    ref: ref
  }), childNode);
  if (responsive) {
    itemNode = /*#__PURE__*/React.createElement(_resizeObserver.default, {
      onResize: ({
        offsetWidth
      }) => {
        internalRegisterSize(offsetWidth);
      },
      disabled: responsiveDisabled
    }, itemNode);
  }
  return itemNode;
}
const Item = /*#__PURE__*/React.forwardRef(InternalItem);
if (process.env.NODE_ENV !== 'production') {
  Item.displayName = 'Item';
}
var _default = exports.default = Item;