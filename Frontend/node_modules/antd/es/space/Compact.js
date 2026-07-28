"use client";

import * as React from 'react';
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { useOrientation } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import useSize from '../config-provider/hooks/useSize';
import useStyle from './style/compact';
export const SpaceCompactItemContext = /*#__PURE__*/React.createContext(null);
export const useCompactItemContext = (prefixCls, direction) => {
  const compactItemContext = React.useContext(SpaceCompactItemContext);
  const compactItemClassnames = React.useMemo(() => {
    if (!compactItemContext) {
      return '';
    }
    const {
      compactDirection,
      isFirstItem,
      isLastItem
    } = compactItemContext;
    const separator = compactDirection === 'vertical' ? '-vertical-' : '-';
    return clsx(`${prefixCls}-compact${separator}item`, {
      [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
      [`${prefixCls}-compact${separator}last-item`]: isLastItem,
      [`${prefixCls}-compact${separator}item-rtl`]: direction === 'rtl'
    });
  }, [prefixCls, direction, compactItemContext]);
  return {
    compactSize: compactItemContext?.compactSize,
    compactDirection: compactItemContext?.compactDirection,
    compactItemClassnames
  };
};
export const NoCompactStyle = props => {
  const {
    children
  } = props;
  return /*#__PURE__*/React.createElement(SpaceCompactItemContext.Provider, {
    value: null
  }, children);
};
const CompactItem = props => {
  const {
    children,
    ...others
  } = props;
  return /*#__PURE__*/React.createElement(SpaceCompactItemContext.Provider, {
    value: React.useMemo(() => others, [others])
  }, children);
};
const Compact = props => {
  const {
    getPrefixCls,
    direction: directionConfig
  } = React.useContext(ConfigContext);
  const {
    size,
    direction,
    orientation,
    block,
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    vertical,
    ...restProps
  } = props;
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Space.Compact');
    warning.deprecated(!direction, 'direction', 'orientation');
  }
  const [mergedOrientation, mergedVertical] = useOrientation(orientation, vertical, direction);
  const mergedSize = useSize(ctx => size ?? ctx);
  const prefixCls = getPrefixCls('space-compact', customizePrefixCls);
  const [hashId] = useStyle(prefixCls);
  const clx = clsx(prefixCls, hashId, {
    [`${prefixCls}-rtl`]: directionConfig === 'rtl',
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-vertical`]: mergedVertical
  }, className, rootClassName);
  const compactItemContext = React.useContext(SpaceCompactItemContext);
  const childNodes = toArray(children);
  const nodes = React.useMemo(() => childNodes.map((child, i) => {
    const key = child?.key || `${prefixCls}-item-${i}`;
    return /*#__PURE__*/React.createElement(CompactItem, {
      key: key,
      compactSize: mergedSize,
      compactDirection: mergedOrientation,
      isFirstItem: i === 0 && (!compactItemContext || compactItemContext?.isFirstItem),
      isLastItem: i === childNodes.length - 1 && (!compactItemContext || compactItemContext?.isLastItem)
    }, child);
  }), [childNodes, compactItemContext, mergedOrientation, mergedSize, prefixCls]);
  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: clx,
    ...restProps
  }, nodes);
};
export default Compact;