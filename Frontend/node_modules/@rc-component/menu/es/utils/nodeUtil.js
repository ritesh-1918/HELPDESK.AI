function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import Divider from "../Divider";
import MenuItem from "../MenuItem";
import MenuItemGroup from "../MenuItemGroup";
import SubMenu from "../SubMenu";
import { parseChildren } from "./commonUtil";
function convertItemsToNodes(list, components, prefixCls) {
  const {
    item: MergedMenuItem,
    group: MergedMenuItemGroup,
    submenu: MergedSubMenu,
    divider: MergedDivider
  } = components;
  return (list || []).map((opt, index) => {
    if (opt && typeof opt === 'object') {
      const {
        label,
        children,
        key,
        type,
        extra,
        ...restProps
      } = opt;
      const mergedKey = key ?? `tmp-${index}`;

      // MenuItemGroup & SubMenuItem
      if (children || type === 'group') {
        if (type === 'group') {
          // Group
          return /*#__PURE__*/React.createElement(MergedMenuItemGroup, _extends({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes(children, components, prefixCls));
        }

        // Sub Menu
        return /*#__PURE__*/React.createElement(MergedSubMenu, _extends({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes(children, components, prefixCls));
      }

      // MenuItem & Divider
      if (type === 'divider') {
        return /*#__PURE__*/React.createElement(MergedDivider, _extends({
          key: mergedKey
        }, restProps));
      }
      return /*#__PURE__*/React.createElement(MergedMenuItem, _extends({
        key: mergedKey
      }, restProps, {
        extra: extra
      }), label, (!!extra || extra === 0) && /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-item-extra`
      }, extra));
    }
    return null;
  }).filter(opt => opt);
}
export function parseItems(children, items, keyPath, components, prefixCls) {
  let childNodes = children;
  const mergedComponents = {
    divider: Divider,
    item: MenuItem,
    group: MenuItemGroup,
    submenu: SubMenu,
    ...components
  };
  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls);
  }
  return parseChildren(childNodes, keyPath);
}