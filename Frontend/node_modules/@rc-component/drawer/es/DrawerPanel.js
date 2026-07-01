function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import * as React from 'react';
import { RefContext } from "./context";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { useComposeRef } from "@rc-component/util/es/ref";
const DrawerPanel = props => {
  const {
    prefixCls,
    className,
    containerRef,
    ...restProps
  } = props;
  const {
    panel: panelRef
  } = React.useContext(RefContext);
  const mergedRef = useComposeRef(panelRef, containerRef);

  // =============================== Render ===============================

  return /*#__PURE__*/React.createElement("div", _extends({
    className: clsx(`${prefixCls}-section`, className),
    role: "dialog",
    ref: mergedRef
  }, pickAttrs(props, {
    aria: true
  }), {
    "aria-modal": "true"
  }, restProps));
};
if (process.env.NODE_ENV !== 'production') {
  DrawerPanel.displayName = 'DrawerPanel';
}
export default DrawerPanel;