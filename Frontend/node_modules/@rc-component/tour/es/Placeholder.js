import Portal from '@rc-component/portal';
import * as React from 'react';
const Placeholder = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    open,
    autoLock,
    getContainer,
    domRef,
    className,
    style,
    fallbackDOM
  } = props;
  React.useImperativeHandle(ref, () => domRef.current || fallbackDOM());
  return /*#__PURE__*/React.createElement(Portal, {
    open: open,
    autoLock: autoLock,
    getContainer: getContainer
  }, /*#__PURE__*/React.createElement("div", {
    ref: domRef,
    className: className,
    style: style
  }));
});
if (process.env.NODE_ENV !== 'production') {
  Placeholder.displayName = 'Placeholder';
}
export default Placeholder;