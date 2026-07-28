"use client";

import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import BarsOutlined from "@ant-design/icons/es/icons/BarsOutlined";
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import { LayoutContext } from './context';
import useStyle from './style/sider';
const dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
  xxxl: `1839.98px`
};
const isNumeric = val => !Number.isNaN(Number.parseFloat(val)) && Number.isFinite(Number(val));
export const SiderContext = /*#__PURE__*/React.createContext({});
const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();
const Sider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    trigger,
    children,
    defaultCollapsed = false,
    theme = 'dark',
    style = {},
    collapsible = false,
    reverseArrow = false,
    width = 200,
    collapsedWidth = 80,
    zeroWidthTriggerStyle,
    breakpoint,
    onCollapse,
    onBreakpoint,
    ...otherProps
  } = props;
  const {
    siderHook
  } = useContext(LayoutContext);
  const [collapsed, setCollapsed] = useState('collapsed' in props ? props.collapsed : defaultCollapsed);
  const [below, setBelow] = useState(false);
  useEffect(() => {
    if ('collapsed' in props) {
      setCollapsed(props.collapsed);
    }
  }, [props.collapsed]);
  const handleSetCollapsed = (value, type) => {
    if (!('collapsed' in props)) {
      setCollapsed(value);
    }
    onCollapse?.(value, type);
  };
  // =========================== Prefix ===========================
  const {
    getPrefixCls,
    direction
  } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  // ========================= Responsive =========================
  const responsiveHandlerRef = useRef(null);
  responsiveHandlerRef.current = mql => {
    setBelow(mql.matches);
    onBreakpoint?.(mql.matches);
    if (collapsed !== mql.matches) {
      handleSetCollapsed(mql.matches, 'responsive');
    }
  };
  useEffect(() => {
    function responsiveHandler(mql) {
      return responsiveHandlerRef.current?.(mql);
    }
    let mql;
    if (typeof window?.matchMedia !== 'undefined' && breakpoint && breakpoint in dimensionMaxMap) {
      mql = window.matchMedia(`screen and (max-width: ${dimensionMaxMap[breakpoint]})`);
      if (typeof mql?.addEventListener === 'function') {
        mql.addEventListener('change', responsiveHandler);
      }
      responsiveHandler(mql);
    }
    return () => {
      if (typeof mql?.removeEventListener === 'function') {
        mql.removeEventListener('change', responsiveHandler);
      }
    };
  }, [breakpoint]); // in order to accept dynamic 'breakpoint' property, we need to add 'breakpoint' into dependency array.
  useEffect(() => {
    const uniqueId = generateId('ant-sider-');
    siderHook.addSider(uniqueId);
    return () => siderHook.removeSider(uniqueId);
  }, []);
  const toggle = () => {
    handleSetCollapsed(!collapsed, 'clickTrigger');
  };
  const divProps = omit(otherProps, ['collapsed']);
  const rawWidth = collapsed ? collapsedWidth : width;
  // use "px" as fallback unit for width
  const siderWidth = isNumeric(rawWidth) ? `${rawWidth}px` : String(rawWidth);
  // special trigger when collapsedWidth == 0
  const zeroWidthTrigger = Number.parseFloat(String(collapsedWidth || 0)) === 0 ? (/*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    className: clsx(`${prefixCls}-zero-width-trigger`, `${prefixCls}-zero-width-trigger-${reverseArrow ? 'right' : 'left'}`),
    style: zeroWidthTriggerStyle
  }, trigger || /*#__PURE__*/React.createElement(BarsOutlined, null))) : null;
  const reverseIcon = direction === 'rtl' === !reverseArrow;
  const iconObj = {
    expanded: reverseIcon ? /*#__PURE__*/React.createElement(RightOutlined, null) : /*#__PURE__*/React.createElement(LeftOutlined, null),
    collapsed: reverseIcon ? /*#__PURE__*/React.createElement(LeftOutlined, null) : /*#__PURE__*/React.createElement(RightOutlined, null)
  };
  const status = collapsed ? 'collapsed' : 'expanded';
  const defaultTrigger = iconObj[status];
  const triggerDom = trigger !== null ? zeroWidthTrigger || (/*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-trigger`,
    onClick: toggle,
    style: {
      width: siderWidth
    }
  }, trigger || defaultTrigger)) : null;
  const divStyle = {
    ...style,
    flex: `0 0 ${siderWidth}`,
    maxWidth: siderWidth,
    // Fix width transition bug in IE11
    minWidth: siderWidth,
    // https://github.com/ant-design/ant-design/issues/6349
    width: siderWidth
  };
  const siderCls = clsx(prefixCls, `${prefixCls}-${theme}`, {
    [`${prefixCls}-collapsed`]: !!collapsed,
    [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
    [`${prefixCls}-below`]: !!below,
    [`${prefixCls}-zero-width`]: Number.parseFloat(siderWidth) === 0
  }, className, hashId, cssVarCls);
  const contextValue = React.useMemo(() => ({
    siderCollapsed: collapsed
  }), [collapsed]);
  return /*#__PURE__*/React.createElement(SiderContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement("aside", {
    className: siderCls,
    ...divProps,
    style: divStyle,
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-children`
  }, children), collapsible || below && zeroWidthTrigger ? triggerDom : null));
});
if (process.env.NODE_ENV !== 'production') {
  Sider.displayName = 'Sider';
}
export default Sider;