function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import { MenuContext } from "../context/MenuContext";
const InternalSubMenuList = ({
  className,
  children,
  ...restProps
}, ref) => {
  const {
    prefixCls,
    mode,
    rtl
  } = React.useContext(MenuContext);
  return /*#__PURE__*/React.createElement("ul", _extends({
    className: clsx(prefixCls, rtl && `${prefixCls}-rtl`, `${prefixCls}-sub`, `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`, className),
    role: "menu"
  }, restProps, {
    "data-menu-list": true,
    ref: ref
  }), children);
};
const SubMenuList = /*#__PURE__*/React.forwardRef(InternalSubMenuList);
if (process.env.NODE_ENV !== 'production') {
  SubMenuList.displayName = 'SubMenuList';
}
export default SubMenuList;