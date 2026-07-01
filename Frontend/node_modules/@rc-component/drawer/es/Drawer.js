import Portal from '@rc-component/portal';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import * as React from 'react';
import { RefContext } from "./context";
import DrawerPopup from "./DrawerPopup";
import { warnCheck } from "./util";
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
    warnCheck(props);
  }

  // ============================= Open =============================
  const [mounted, setMounted] = React.useState(false);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  const mergedOpen = mounted ? open : false;

  // ============================ Focus =============================
  const popupRef = React.useRef(null);
  const lastActiveRef = React.useRef(null);
  useLayoutEffect(() => {
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
  return /*#__PURE__*/React.createElement(RefContext.Provider, {
    value: refContext
  }, /*#__PURE__*/React.createElement(Portal, {
    open: mergedOpen || forceRender || animatedVisible,
    autoDestroy: false,
    getContainer: getContainer,
    autoLock: mask && (mergedOpen || animatedVisible),
    onEsc: onEsc
  }, /*#__PURE__*/React.createElement(DrawerPopup, drawerPopupProps)));
};
if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}
export default Drawer;