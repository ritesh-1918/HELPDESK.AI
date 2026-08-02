function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import Portal from '@rc-component/portal';
import * as React from 'react';
import { RefContext } from "./context";
import Dialog from "./Dialog";
// fix issue #10656
/*
 * getContainer remarks
 * Custom container should not be return, because in the Portal component, it will remove the
 * return container element here, if the custom container is the only child of it's component,
 * like issue #10656, It will has a conflict with removeChild method in react-dom.
 * So here should add a child (div element) to custom container.
 * */

const DialogWrap = props => {
  const {
    visible,
    getContainer,
    forceRender,
    destroyOnHidden = false,
    afterClose,
    closable,
    panelRef,
    keyboard = true,
    onClose
  } = props;
  const [animatedVisible, setAnimatedVisible] = React.useState(visible);
  const refContext = React.useMemo(() => ({
    panel: panelRef
  }), [panelRef]);
  const onEsc = ({
    top,
    event
  }) => {
    if (top && keyboard) {
      event.stopPropagation();
      onClose?.(event);
      return;
    }
  };
  React.useEffect(() => {
    if (visible) {
      setAnimatedVisible(true);
    }
  }, [visible]);

  // Destroy on close will remove wrapped div
  if (!forceRender && destroyOnHidden && !animatedVisible) {
    return null;
  }
  return /*#__PURE__*/React.createElement(RefContext.Provider, {
    value: refContext
  }, /*#__PURE__*/React.createElement(Portal, {
    open: visible || forceRender || animatedVisible,
    onEsc: onEsc,
    autoDestroy: false,
    getContainer: getContainer,
    autoLock: visible || animatedVisible
  }, /*#__PURE__*/React.createElement(Dialog, _extends({}, props, {
    destroyOnHidden: destroyOnHidden,
    afterClose: () => {
      const closableObj = closable && typeof closable === 'object' ? closable : {};
      const {
        afterClose: closableAfterClose
      } = closableObj || {};
      closableAfterClose?.();
      afterClose?.();
      setAnimatedVisible(false);
    }
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  DialogWrap.displayName = 'Dialog';
}
export default DialogWrap;