"use client";

import * as React from 'react';
import { Item } from '@rc-component/menu';
import { omit, toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { cloneElement } from '../_util/reactNode';
import { SiderContext } from '../layout/Sider';
import Tooltip from '../tooltip';
import MenuContext from './MenuContext';
const MenuItem = props => {
  const {
    className,
    children,
    icon,
    title,
    danger,
    extra
  } = props;
  const {
    prefixCls,
    firstLevel,
    direction,
    disableMenuItemTitleTooltip,
    tooltip,
    inlineCollapsed: isInlineCollapsed,
    styles,
    classNames
  } = React.useContext(MenuContext);
  const renderItemChildren = inlineCollapsed => {
    const label = children?.[0];
    const wrapNode = /*#__PURE__*/React.createElement("span", {
      className: clsx(`${prefixCls}-title-content`, firstLevel ? classNames?.itemContent : classNames?.subMenu?.itemContent, {
        [`${prefixCls}-title-content-with-extra`]: !!extra || extra === 0
      }),
      style: firstLevel ? styles?.itemContent : styles?.subMenu?.itemContent
    }, children);
    // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
    // ref: https://github.com/ant-design/ant-design/pull/23456
    if (!icon || /*#__PURE__*/React.isValidElement(children) && children.type === 'span') {
      if (children && inlineCollapsed && firstLevel && typeof label === 'string') {
        return /*#__PURE__*/React.createElement("div", {
          className: `${prefixCls}-inline-collapsed-noicon`
        }, label.charAt(0));
      }
    }
    return wrapNode;
  };
  const {
    siderCollapsed
  } = React.useContext(SiderContext);
  let tooltipTitle = title;
  if (typeof title === 'undefined') {
    tooltipTitle = firstLevel ? children : '';
  } else if (title === false) {
    tooltipTitle = '';
  }
  const tooltipConfig = tooltip === false ? undefined : tooltip;
  const mergedTooltipTitle = tooltipConfig && tooltipConfig.title !== undefined ? tooltipConfig.title : tooltipTitle;
  const tooltipProps = {
    ...(tooltipConfig ?? null),
    title: mergedTooltipTitle
  };
  if (!siderCollapsed && !isInlineCollapsed) {
    tooltipProps.title = null;
    // Reset `open` to fix control mode tooltip display not correct
    // ref: https://github.com/ant-design/ant-design/issues/16742
    tooltipProps.open = false;
  }
  const childrenLength = toArray(children).length;
  let returnNode = /*#__PURE__*/React.createElement(Item, {
    ...omit(props, ['title', 'icon', 'danger']),
    className: clsx(firstLevel ? classNames?.item : classNames?.subMenu?.item, {
      [`${prefixCls}-item-danger`]: danger,
      [`${prefixCls}-item-only-child`]: (icon ? childrenLength + 1 : childrenLength) === 1
    }, className),
    style: {
      ...(firstLevel ? styles?.item : styles?.subMenu?.item),
      ...props.style
    },
    title: typeof title === 'string' ? title : undefined
  }, cloneElement(icon, oriProps => ({
    className: clsx(`${prefixCls}-item-icon`, firstLevel ? classNames?.itemIcon : classNames?.subMenu?.itemIcon, oriProps.className),
    style: {
      ...(firstLevel ? styles?.itemIcon : styles?.subMenu?.itemIcon),
      ...oriProps.style
    }
  })), renderItemChildren(isInlineCollapsed));
  if (!disableMenuItemTitleTooltip && tooltip !== false) {
    const mergedTooltipPlacement = tooltipConfig && tooltipConfig.placement ? tooltipConfig.placement : direction === 'rtl' ? 'left' : 'right';
    const baseTooltipClassName = `${prefixCls}-inline-collapsed-tooltip`;
    const mergeTooltipRootClassName = classNames => ({
      ...classNames,
      root: clsx(baseTooltipClassName, classNames?.root)
    });
    const mergedTooltipClassNames = tooltipConfig && typeof tooltipConfig.classNames === 'function' ? info => {
      const resolvedClassNames = tooltipConfig.classNames(info);
      return mergeTooltipRootClassName(resolvedClassNames);
    } : mergeTooltipRootClassName(tooltipConfig?.classNames);
    returnNode = /*#__PURE__*/React.createElement(Tooltip, {
      ...tooltipProps,
      placement: mergedTooltipPlacement,
      classNames: mergedTooltipClassNames
    }, returnNode);
  }
  return returnNode;
};
export default MenuItem;