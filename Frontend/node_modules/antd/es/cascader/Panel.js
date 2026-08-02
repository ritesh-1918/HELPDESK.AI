"use client";

import * as React from 'react';
import { Panel } from '@rc-component/cascader';
import { clsx } from 'clsx';
import { useComponentConfig } from '../config-provider/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useBase from './hooks/useBase';
import useCheckable from './hooks/useCheckable';
import useStyle from './style';
import usePanelStyle from './style/panel';
import useIcons from './hooks/useIcons';
function CascaderPanel(props) {
  const {
    prefixCls: customizePrefixCls,
    className,
    multiple,
    rootClassName,
    notFoundContent,
    direction,
    expandIcon,
    loadingIcon,
    disabled: customDisabled
  } = props;
  const {
    expandIcon: contextExpandIcon,
    loadingIcon: contextLoadingIcon
  } = useComponentConfig('cascader');
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  const [_, cascaderPrefixCls, mergedDirection, renderEmpty] = useBase(customizePrefixCls, direction);
  const rootCls = useCSSVarCls(cascaderPrefixCls);
  const [hashId, cssVarCls] = useStyle(cascaderPrefixCls, rootCls);
  usePanelStyle(cascaderPrefixCls);
  const isRtl = mergedDirection === 'rtl';
  // ===================== Icon ======================
  const {
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon
  } = useIcons({
    contextExpandIcon,
    contextLoadingIcon,
    expandIcon,
    loadingIcon,
    isRtl
  });
  // ===================== Empty =====================
  const mergedNotFoundContent = notFoundContent || renderEmpty?.('Cascader') || (/*#__PURE__*/React.createElement(DefaultRenderEmpty, {
    componentName: "Cascader"
  }));
  // =================== Multiple ====================
  const checkable = useCheckable(cascaderPrefixCls, multiple);
  // ==================== Render =====================
  return /*#__PURE__*/React.createElement(Panel, {
    ...props,
    checkable: checkable,
    prefixCls: cascaderPrefixCls,
    className: clsx(className, hashId, rootClassName, cssVarCls, rootCls),
    notFoundContent: mergedNotFoundContent,
    direction: mergedDirection,
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon,
    disabled: mergedDisabled
  });
}
export default CascaderPanel;