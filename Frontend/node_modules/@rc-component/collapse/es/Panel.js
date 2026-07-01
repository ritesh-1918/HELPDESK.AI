import _extends from "@babel/runtime/helpers/esm/extends";
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import KeyCode from "@rc-component/util/es/KeyCode";
import React from 'react';
import PanelContent from "./PanelContent";
const CollapsePanel = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    showArrow = true,
    headerClass,
    isActive,
    onItemClick,
    forceRender,
    className,
    classNames: customizeClassNames = {},
    styles = {},
    prefixCls,
    collapsible,
    accordion,
    panelKey,
    extra,
    header,
    expandIcon,
    openMotion,
    destroyOnHidden,
    children,
    ...resetProps
  } = props;
  const disabled = collapsible === 'disabled';
  const ifExtraExist = extra !== null && extra !== undefined && typeof extra !== 'boolean';
  const collapsibleProps = {
    onClick: () => {
      onItemClick?.(panelKey);
    },
    onKeyDown: e => {
      if (e.key === 'Enter' || e.keyCode === KeyCode.ENTER || e.which === KeyCode.ENTER) {
        onItemClick?.(panelKey);
      }
    },
    role: accordion ? 'tab' : 'button',
    ['aria-expanded']: isActive,
    ['aria-disabled']: disabled,
    tabIndex: disabled ? -1 : 0
  };

  // ======================== Icon ========================
  const iconNodeInner = typeof expandIcon === 'function' ? expandIcon(props) : /*#__PURE__*/React.createElement("i", {
    className: "arrow"
  });
  const iconNode = iconNodeInner && /*#__PURE__*/React.createElement("div", _extends({
    className: clsx(`${prefixCls}-expand-icon`, customizeClassNames?.icon),
    style: styles?.icon
  }, ['header', 'icon'].includes(collapsible) ? collapsibleProps : {}), iconNodeInner);
  const collapsePanelClassNames = clsx(`${prefixCls}-item`, {
    [`${prefixCls}-item-active`]: isActive,
    [`${prefixCls}-item-disabled`]: disabled
  }, className);
  const headerClassName = clsx(headerClass, `${prefixCls}-header`, {
    [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible
  }, customizeClassNames?.header);

  // ======================== HeaderProps ========================
  const headerProps = {
    className: headerClassName,
    style: styles?.header,
    ...(['header', 'icon'].includes(collapsible) ? {} : collapsibleProps)
  };

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement("div", _extends({}, resetProps, {
    ref: ref,
    className: collapsePanelClassNames
  }), /*#__PURE__*/React.createElement("div", headerProps, showArrow && iconNode, /*#__PURE__*/React.createElement("span", _extends({
    className: clsx(`${prefixCls}-title`, customizeClassNames?.title),
    style: styles?.title
  }, collapsible === 'header' ? collapsibleProps : {}), header), ifExtraExist && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-extra`
  }, extra)), /*#__PURE__*/React.createElement(CSSMotion, _extends({
    visible: isActive,
    leavedClassName: `${prefixCls}-panel-hidden`
  }, openMotion, {
    forceRender: forceRender,
    removeOnLeave: destroyOnHidden
  }), ({
    className: motionClassName,
    style: motionStyle
  }, motionRef) => {
    return /*#__PURE__*/React.createElement(PanelContent, {
      ref: motionRef,
      prefixCls: prefixCls,
      className: motionClassName,
      classNames: customizeClassNames,
      style: motionStyle,
      styles: styles,
      isActive: isActive,
      forceRender: forceRender,
      role: accordion ? 'tabpanel' : undefined
    }, children);
  }));
});
export default CollapsePanel;