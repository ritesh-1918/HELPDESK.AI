"use client";

import React from 'react';
import HolderOutlined from "@ant-design/icons/es/icons/HolderOutlined";
import RcTree from '@rc-component/tree';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import initCollapseMotion from '../_util/motion';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import { useToken } from '../theme/internal';
import useStyle from './style';
import dropIndicatorRender from './utils/dropIndicator';
import SwitcherIconCom from './utils/iconUtil';
const Tree = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('tree');
  const {
    virtual
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showIcon = false,
    showLine,
    switcherIcon,
    switcherLoadingIcon,
    blockNode = false,
    children,
    checkable = false,
    selectable = true,
    draggable,
    disabled,
    motion: customMotion,
    style,
    rootClassName,
    classNames,
    styles
  } = props;
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = disabled ?? contextDisabled;
  const prefixCls = getPrefixCls('tree', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const motion = customMotion ?? {
    ...initCollapseMotion(rootPrefixCls),
    motionAppear: false
  };
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    showIcon,
    blockNode,
    checkable,
    selectable,
    disabled: mergedDisabled,
    motion
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const newProps = {
    ...mergedProps,
    showLine: Boolean(showLine),
    dropIndicatorRender
  };
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [, token] = useToken();
  const itemHeight = token.paddingXS / 2 + (token.Tree?.titleHeight || token.controlHeightSM);
  const draggableConfig = React.useMemo(() => {
    if (!draggable) {
      return false;
    }
    let mergedDraggable = {};
    switch (typeof draggable) {
      case 'function':
        mergedDraggable.nodeDraggable = draggable;
        break;
      case 'object':
        mergedDraggable = {
          ...draggable
        };
        break;
      default:
        break;
      // Do nothing
    }
    if (mergedDraggable.icon !== false) {
      mergedDraggable.icon = mergedDraggable.icon || /*#__PURE__*/React.createElement(HolderOutlined, null);
    }
    return mergedDraggable;
  }, [draggable]);
  const renderSwitcherIcon = nodeProps => (/*#__PURE__*/React.createElement(SwitcherIconCom, {
    prefixCls: prefixCls,
    switcherIcon: switcherIcon,
    switcherLoadingIcon: switcherLoadingIcon,
    treeNodeProps: nodeProps,
    showLine: showLine
  }));
  return (
    /*#__PURE__*/
    // @ts-ignore
    React.createElement(RcTree, {
      itemHeight: itemHeight,
      ref: ref,
      virtual: virtual,
      ...newProps,
      // newProps may contain style so declare style below it
      prefixCls: prefixCls,
      className: clsx({
        [`${prefixCls}-icon-hide`]: !showIcon,
        [`${prefixCls}-block-node`]: blockNode,
        [`${prefixCls}-unselectable`]: !selectable,
        [`${prefixCls}-rtl`]: direction === 'rtl',
        [`${prefixCls}-disabled`]: mergedDisabled
      }, contextClassName, className, hashId, cssVarCls),
      style: {
        ...contextStyle,
        ...style
      },
      rootClassName: clsx(mergedClassNames?.root, rootClassName),
      rootStyle: mergedStyles?.root,
      classNames: mergedClassNames,
      styles: mergedStyles,
      direction: direction,
      checkable: checkable ? /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-checkbox-inner`
      }) : checkable,
      selectable: selectable,
      switcherIcon: renderSwitcherIcon,
      draggable: draggableConfig
    }, children)
  );
});
if (process.env.NODE_ENV !== 'production') {
  Tree.displayName = 'Tree';
}
export default Tree;