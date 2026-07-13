"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _portal = _interopRequireDefault(require("@rc-component/portal"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var React = _interopRequireWildcard(require("react"));
var _context = require("./context");
var _DrawerPopup = _interopRequireDefault(require("./DrawerPopup"));
var _util = require("./util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Drawer = props => {
  const {
    open = false,
    prefixCls = 'rc-drawer',
    placement = 'right',
    autoFocus = true,
    keyboard = true,
    width,
    height,
    size,
    maxSize,
    mask = true,
    maskClosable = true,
    getContainer,
    forceRender,
    afterOpenChange,
    destroyOnHidden,
    onMouseEnter,
    onMouseOver,
    onMouseLeave,
    onClick,
    onKeyDown,
    onKeyUp,
    onClose,
    resizable,
    defaultSize,
    focusTriggerAfterClose,
    // Refs
    panelRef
  } = props;
  const [animatedVisible, setAnimatedVisible] = React.useState(false);

  // ============================= Warn =============================
  if (process.env.NODE_ENV !== 'production') {
    (0, _util.warnCheck)(props);
  }

  // ============================= Open =============================
  const [mounted, setMounted] = React.useState(false);
  (0, _useLayoutEffect.default)(() => {
    setMounted(true);
  }, []);
  const mergedOpen = mounted ? open : false;

  // ============================ Focus =============================
  const popupRef = React.useRef(null);
  const lastActiveRef = React.useRef(null);
  (0, _useLayoutEffect.default)(() => {
    if (mergedOpen) {
      lastActiveRef.current = document.activeElement;
    }
  }, [mergedOpen]);

  // ============================= Open =============================
  const internalAfterOpenChange = nextVisible => {
    setAnimatedVisible(nextVisible);
    afterOpenChange?.(nextVisible);
    if (!nextVisible && focusTriggerAfterClose !== false && lastActiveRef.current && !popupRef.current?.contains(lastActiveRef.current)) {
      lastActiveRef.current?.focus({
        preventScroll: true
      });
    }
  };

  // =========================== Context ============================
  const refContext = React.useMemo(() => ({
    panel: panelRef
  }), [panelRef]);

  // ============================ Render ============================
  if (!forceRender && !animatedVisible && !mergedOpen && destroyOnHidden) {
    return null;
  }
  const eventHandlers = {
    onMouseEnter,
    onMouseOver,
    onMouseLeave,
    onClick,
    onKeyDown,
    onKeyUp
  };
  const drawerPopupProps = {
    ...props,
    open: mergedOpen,
    prefixCls,
    placement,
    autoFocus,
    keyboard,
    width,
    height,
    size,
    maxSize,
    defaultSize,
    mask,
    maskClosable,
    inline: getContainer === false,
    afterOpenChange: internalAfterOpenChange,
    ref: popupRef,
    resizable,
    ...eventHandlers
  };
  const onEsc = ({
    top,
    event
  }) => {
    if (top && keyboard) {
      event.stopPropagation();
      onClose?.(event);
    }
  };
  return /*#__PURE__*/React.createElement(_context.RefContext.Provider, {
    value: refContext
  }, /*#__PURE__*/React.createElement(_portal.default, {
    open: mergedOpen || forceRender || animatedVisible,
    autoDestroy: false,
    getContainer: getContainer,
    autoLock: mask && (mergedOpen || animatedVisible),
    onEsc: onEsc
  }, /*#__PURE__*/React.createElement(_DrawerPopup.default, drawerPopupProps)));
};
if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}
var _default = exports.default = Drawer;