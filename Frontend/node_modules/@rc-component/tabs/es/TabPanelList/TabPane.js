import { clsx } from 'clsx';
import * as React from 'react';
const TabPane = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    style,
    id,
    active,
    tabKey,
    children
  } = props;
  const hasContent = React.Children.count(children) > 0;
  return /*#__PURE__*/React.createElement("div", {
    id: id && `${id}-panel-${tabKey}`,
    role: "tabpanel",
    tabIndex: active && hasContent ? 0 : -1,
    "aria-labelledby": id && `${id}-tab-${tabKey}`,
    "aria-hidden": !active,
    style: style,
    className: clsx(prefixCls, active && `${prefixCls}-active`, className),
    ref: ref
  }, children);
});
if (process.env.NODE_ENV !== 'production') {
  TabPane.displayName = 'TabPane';
}
export default TabPane;