"use client";

import * as React from 'react';
import EllipsisOutlined from "@ant-design/icons/es/icons/EllipsisOutlined";
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import Button from '../button';
import { ConfigContext } from '../config-provider';
import Space from '../space';
import { useCompactItemContext } from '../space/Compact';
import Dropdown from './dropdown';
/** @deprecated Please use Space.Compact + Dropdown + Button instead */
const DropdownButton = props => {
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    type = 'default',
    danger,
    disabled,
    loading,
    onClick,
    htmlType,
    children,
    className,
    menu,
    arrow,
    autoFocus,
    trigger,
    align,
    open,
    onOpenChange,
    placement,
    getPopupContainer,
    href,
    icon = /*#__PURE__*/React.createElement(EllipsisOutlined, null),
    title,
    buttonsRender = buttons => buttons,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    destroyPopupOnHide,
    dropdownRender,
    popupRender,
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('dropdown', customizePrefixCls);
  const buttonPrefixCls = `${prefixCls}-button`;
  const mergedPopupRender = popupRender || dropdownRender;
  const dropdownProps = {
    menu,
    arrow,
    autoFocus,
    align,
    disabled,
    trigger: disabled ? [] : trigger,
    onOpenChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    mouseEnterDelay,
    mouseLeaveDelay,
    classNames: {
      root: overlayClassName
    },
    styles: {
      root: overlayStyle
    },
    destroyOnHidden,
    popupRender: mergedPopupRender
  };
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const classes = clsx(buttonPrefixCls, compactItemClassnames, className);
  if ('destroyPopupOnHide' in props) {
    dropdownProps.destroyPopupOnHide = destroyPopupOnHide;
  }
  if ('open' in props) {
    dropdownProps.open = open;
  }
  if ('placement' in props) {
    dropdownProps.placement = placement;
  } else {
    dropdownProps.placement = direction === 'rtl' ? 'bottomLeft' : 'bottomRight';
  }
  // ============================== Warn ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Dropdown.Button');
    warning.deprecated(false, 'Dropdown.Button', 'Space.Compact + Dropdown + Button');
  }
  const leftButton = /*#__PURE__*/React.createElement(Button, {
    type: type,
    danger: danger,
    disabled: disabled,
    loading: loading,
    onClick: onClick,
    htmlType: htmlType,
    href: href,
    title: title
  }, children);
  const rightButton = /*#__PURE__*/React.createElement(Button, {
    type: type,
    danger: danger,
    icon: icon
  });
  const [leftButtonToRender, rightButtonToRender] = buttonsRender([leftButton, rightButton]);
  return /*#__PURE__*/React.createElement(Space.Compact, {
    className: classes,
    size: compactSize,
    block: true,
    ...restProps
  }, leftButtonToRender, /*#__PURE__*/React.createElement(Dropdown, {
    ...dropdownProps
  }, rightButtonToRender));
};
DropdownButton.__ANT_BUTTON = true;
export default DropdownButton;