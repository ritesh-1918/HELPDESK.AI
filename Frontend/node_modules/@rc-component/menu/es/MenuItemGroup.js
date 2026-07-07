function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import omit from "@rc-component/util/es/omit";
import * as React from 'react';
import { MenuContext } from "./context/MenuContext";
import { useFullPath, useMeasure } from "./context/PathContext";
import { parseChildren } from "./utils/commonUtil";
const InternalMenuItemGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    title,
    eventKey,
    children,
    ...restProps
  } = props;
  const {
    prefixCls,
    classNames: menuClassNames,
    styles
  } = React.useContext(MenuContext);
  const groupPrefixCls = `${prefixCls}-item-group`;
  return /*#__PURE__*/React.createElement("li", _extends({
    ref: ref,
    role: "presentation"
  }, restProps, {
    onClick: e => e.stopPropagation(),
    className: clsx(groupPrefixCls, className)
  }), /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    className: clsx(`${groupPrefixCls}-title`, menuClassNames?.listTitle),
    style: styles?.listTitle,
    title: typeof title === 'string' ? title : undefined
  }, title), /*#__PURE__*/React.createElement("ul", {
    role: "group",
    className: clsx(`${groupPrefixCls}-list`, menuClassNames?.list),
    style: styles?.list
  }, children));
});
const MenuItemGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    eventKey,
    children
  } = props;
  const connectedKeyPath = useFullPath(eventKey);
  const childList = parseChildren(children, connectedKeyPath);
  const measure = useMeasure();
  if (measure) {
    return childList;
  }
  return /*#__PURE__*/React.createElement(InternalMenuItemGroup, _extends({
    ref: ref
  }, omit(props, ['warnKey'])), childList);
});
if (process.env.NODE_ENV !== 'production') {
  MenuItemGroup.displayName = 'MenuItemGroup';
}
export default MenuItemGroup;