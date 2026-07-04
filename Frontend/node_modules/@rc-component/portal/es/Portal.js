import canUseDom from "@rc-component/util/es/Dom/canUseDom";
import { getNodeRef, supportRef, useComposeRef } from "@rc-component/util/es/ref";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { createPortal } from 'react-dom';
import OrderContext from "./Context";
import { inlineMock } from "./mock";
import useDom from "./useDom";
import useScrollLocker from "./useScrollLocker";
import useEscKeyDown from "./useEscKeyDown";
const getPortalContainer = getContainer => {
  if (getContainer === false) {
    return false;
  }
  if (!canUseDom() || !getContainer) {
    return null;
  }
  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};
const Portal = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    open,
    autoLock,
    getContainer,
    debug,
    autoDestroy = true,
    children,
    onEsc
  } = props;
  const [shouldRender, setShouldRender] = React.useState(open);
  const mergedRender = shouldRender || open;

  // ========================= Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(canUseDom() || !open, `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`);
  }

  // ====================== Should Render ======================
  React.useEffect(() => {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);

  // ======================== Container ========================
  const [innerContainer, setInnerContainer] = React.useState(() => getPortalContainer(getContainer));
  React.useEffect(() => {
    const customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(() =>
    // React do the state update even the value is the same,
    // Use function call to force React to compare update
    customizeContainer ?? null);
  });
  const [defaultContainer, queueCreate] = useDom(mergedRender && !innerContainer, debug);
  const mergedContainer = innerContainer ?? defaultContainer;

  // ========================= Locker ==========================
  useScrollLocker(autoLock && open && canUseDom() && (mergedContainer === defaultContainer || mergedContainer === document.body));

  // ========================= Esc Keydown ==========================
  useEscKeyDown(open, onEsc);

  // =========================== Ref ===========================
  let childRef = null;
  if (children && supportRef(children) && ref) {
    childRef = getNodeRef(children);
  }
  const mergedRef = useComposeRef(childRef, ref);

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  if (!mergedRender || !canUseDom() || innerContainer === undefined) {
    return null;
  }

  // Render inline
  const renderInline = mergedContainer === false || inlineMock();
  let reffedChildren = children;
  if (ref) {
    reffedChildren = /*#__PURE__*/React.cloneElement(children, {
      ref: mergedRef
    });
  }
  return /*#__PURE__*/React.createElement(OrderContext.Provider, {
    value: queueCreate
  }, renderInline ? reffedChildren : /*#__PURE__*/createPortal(reffedChildren, mergedContainer));
});
if (process.env.NODE_ENV !== 'production') {
  Portal.displayName = 'Portal';
}
export default Portal;