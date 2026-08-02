"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import isNonNullable from '../_util/isNonNullable';
import { ConfigContext } from '../config-provider';
import Dropdown from '../dropdown/dropdown';
import BreadcrumbContext from './BreadcrumbContext';
import BreadcrumbSeparator from './BreadcrumbSeparator';
import { renderItem } from './useItemRender';
export const InternalBreadcrumbItem = props => {
  const {
    prefixCls,
    separator = '/',
    children,
    menu,
    dropdownProps,
    href,
    dropdownIcon
  } = props;
  const breadcrumbContext = React.useContext(BreadcrumbContext);
  const {
    classNames: mergedClassNames,
    styles: mergedStyles
  } = breadcrumbContext;
  /** If overlay is have Wrap a Dropdown */
  const renderBreadcrumbNode = breadcrumbItem => {
    if (menu) {
      const mergeDropDownProps = {
        ...dropdownProps
      };
      if (menu) {
        const {
          items,
          ...menuProps
        } = menu || {};
        mergeDropDownProps.menu = {
          ...menuProps,
          items: items?.map(({
            key,
            title,
            label,
            path,
            ...itemProps
          }, index) => {
            let mergedLabel = label ?? title;
            if (path) {
              mergedLabel = /*#__PURE__*/React.createElement("a", {
                href: `${href}${path}`
              }, mergedLabel);
            }
            return {
              ...itemProps,
              key: key ?? index,
              label: mergedLabel
            };
          })
        };
      }
      return /*#__PURE__*/React.createElement(Dropdown, {
        placement: "bottom",
        ...mergeDropDownProps
      }, /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-overlay-link`
      }, breadcrumbItem, dropdownIcon));
    }
    return breadcrumbItem;
  };
  // wrap to dropDown
  const link = renderBreadcrumbNode(children);
  if (isNonNullable(link)) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", {
      className: clsx(`${prefixCls}-item`, mergedClassNames?.item),
      style: mergedStyles?.item
    }, link), separator && /*#__PURE__*/React.createElement(BreadcrumbSeparator, null, separator));
  }
  return null;
};
const BreadcrumbItem = props => {
  const {
    prefixCls: customizePrefixCls,
    children,
    href,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
  return /*#__PURE__*/React.createElement(InternalBreadcrumbItem, {
    ...restProps,
    prefixCls: prefixCls
  }, renderItem(prefixCls, restProps, children, href));
};
BreadcrumbItem.__ANT_BREADCRUMB_ITEM = true;
export default BreadcrumbItem;