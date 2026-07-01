"use client";

import * as React from 'react';
import { forwardRef } from 'react';
import EllipsisOutlined from "@ant-design/icons/es/icons/EllipsisOutlined";
import RcMenu from '@rc-component/menu';
import { omit, useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import initCollapseMotion from '../_util/motion';
import { cloneElement } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import MenuContext from './MenuContext';
import Divider from './MenuDivider';
import MenuItem from './MenuItem';
import OverrideContext from './OverrideContext';
import useStyle from './style';
import SubMenu from './SubMenu';
function isEmptyIcon(icon) {
  return icon === null || icon === false;
}
const MENU_COMPONENTS = {
  item: MenuItem,
  submenu: SubMenu,
  divider: Divider
};
const InternalMenu = /*#__PURE__*/forwardRef((props, ref) => {
  const override = React.useContext(OverrideContext);
  const overrideObj = override || {};
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    theme = 'light',
    expandIcon,
    _internalDisableMenuItemTitleTooltip,
    tooltip,
    inlineCollapsed,
    siderCollapsed,
    rootClassName,
    mode,
    selectable,
    onClick,
    overflowedIndicatorPopupClassName,
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    menu
  } = React.useContext(ConfigContext);
  const {
    getPrefixCls,
    getPopupContainer,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('menu');
  const rootPrefixCls = getPrefixCls();
  const passedProps = omit(restProps, ['collapsedWidth']);
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Menu');
    process.env.NODE_ENV !== "production" ? warning(!('inlineCollapsed' in props && mode !== 'inline'), 'usage', '`inlineCollapsed` should only be used when `mode` is inline.') : void 0;
    warning.deprecated('items' in props && !props.children, 'children', 'items');
  }
  overrideObj.validator?.({
    mode
  });
  // ========================== Click ==========================
  // Tell dropdown that item clicked
  const onItemClick = useEvent((...args) => {
    onClick?.(...args);
    overrideObj.onClick?.();
  });
  // ========================== Mode ===========================
  const mergedMode = overrideObj.mode || mode;
  // ======================= Selectable ========================
  const mergedSelectable = selectable ?? overrideObj.selectable;
  // ======================== Collapsed ========================
  // Inline Collapsed
  const mergedInlineCollapsed = inlineCollapsed ?? siderCollapsed;
  // ================ Merged Props for Semantic ================
  const mergedProps = {
    ...props,
    mode: mergedMode,
    inlineCollapsed: mergedInlineCollapsed,
    selectable: mergedSelectable,
    theme
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    },
    subMenu: {
      _default: 'item'
    }
  });
  const defaultMotions = {
    horizontal: {
      motionName: `${rootPrefixCls}-slide-up`
    },
    inline: initCollapseMotion(rootPrefixCls),
    other: {
      motionName: `${rootPrefixCls}-zoom-big`
    }
  };
  const prefixCls = getPrefixCls('menu', customizePrefixCls || overrideObj.prefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls, !override);
  const menuClassName = clsx(`${prefixCls}-${theme}`, contextClassName, className);
  // ====================== ExpandIcon ========================
  const mergedExpandIcon = React.useMemo(() => {
    if (typeof expandIcon === 'function' || isEmptyIcon(expandIcon)) {
      return expandIcon || null;
    }
    if (typeof overrideObj.expandIcon === 'function' || isEmptyIcon(overrideObj.expandIcon)) {
      return overrideObj.expandIcon || null;
    }
    if (typeof menu?.expandIcon === 'function' || isEmptyIcon(menu?.expandIcon)) {
      return menu?.expandIcon || null;
    }
    const mergedIcon = expandIcon ?? overrideObj?.expandIcon ?? menu?.expandIcon;
    return cloneElement(mergedIcon, {
      className: clsx(`${prefixCls}-submenu-expand-icon`, /*#__PURE__*/React.isValidElement(mergedIcon) ? mergedIcon.props?.className : undefined)
    });
  }, [expandIcon, overrideObj?.expandIcon, menu?.expandIcon, prefixCls]);
  // ======================== Context ==========================
  const contextValue = React.useMemo(() => ({
    prefixCls,
    inlineCollapsed: mergedInlineCollapsed || false,
    direction,
    firstLevel: true,
    theme,
    mode: mergedMode,
    disableMenuItemTitleTooltip: _internalDisableMenuItemTitleTooltip,
    tooltip,
    classNames: mergedClassNames,
    styles: mergedStyles
  }), [prefixCls, mergedInlineCollapsed, direction, _internalDisableMenuItemTitleTooltip, theme, mergedMode, mergedClassNames, mergedStyles, tooltip]);
  // ========================= Render ==========================
  return /*#__PURE__*/React.createElement(OverrideContext.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(MenuContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(RcMenu, {
    getPopupContainer: getPopupContainer,
    overflowedIndicator: /*#__PURE__*/React.createElement(EllipsisOutlined, null),
    overflowedIndicatorPopupClassName: clsx(prefixCls, `${prefixCls}-${theme}`, overflowedIndicatorPopupClassName),
    classNames: {
      list: mergedClassNames.list,
      listTitle: mergedClassNames.itemTitle
    },
    styles: {
      list: mergedStyles.list,
      listTitle: mergedStyles.itemTitle
    },
    mode: mergedMode,
    selectable: mergedSelectable,
    onClick: onItemClick,
    ...passedProps,
    inlineCollapsed: mergedInlineCollapsed,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    className: menuClassName,
    prefixCls: prefixCls,
    direction: direction,
    defaultMotions: defaultMotions,
    expandIcon: mergedExpandIcon,
    ref: ref,
    rootClassName: clsx(rootClassName, hashId, overrideObj.rootClassName, cssVarCls, rootCls, mergedClassNames.root),
    _internalComponents: MENU_COMPONENTS
  })));
});
export default InternalMenu;