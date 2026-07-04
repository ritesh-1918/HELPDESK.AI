"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { UnstableContext } from '@rc-component/steps';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Steps from '../steps';
import { InternalContext } from '../steps/context';
import { genCssVar } from '../theme/util/genStyleUtils';
import useStyle from './style';
import useItems from './useItems';
const stepInternalContext = {
  rootComponent: 'ol',
  itemComponent: 'li'
};
const Timeline = props => {
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('timeline');
  const {
    prefixCls: customizePrefixCls,
    // Style
    className,
    style,
    classNames,
    styles,
    // Design
    variant = 'outlined',
    mode,
    orientation = 'vertical',
    titleSpan,
    // Data
    items,
    children,
    reverse,
    // Legacy Pending
    pending,
    pendingDot,
    ...restProps
  } = props;
  // ===================== MISC =======================
  const rootPrefixCls = getPrefixCls();
  const prefixCls = getPrefixCls('timeline', customizePrefixCls);
  // ==================== Styles ======================
  // This will be duplicated with Steps's hashId & cssVarCls when they have same token
  // But this is safe to keep here since web will do nothing
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [varName] = genCssVar(rootPrefixCls, 'timeline');
  const stepsClassNames = React.useMemo(() => ({
    item: `${prefixCls}-item`,
    itemTitle: `${prefixCls}-item-title`,
    itemIcon: `${prefixCls}-item-icon`,
    itemContent: `${prefixCls}-item-content`,
    itemRail: `${prefixCls}-item-rail`,
    itemWrapper: `${prefixCls}-item-wrapper`,
    itemSection: `${prefixCls}-item-section`,
    itemHeader: `${prefixCls}-item-header`
  }), [prefixCls]);
  // ===================== Mode =======================
  const mergedMode = React.useMemo(() => {
    // Deprecated
    if (mode === 'left') {
      return 'start';
    }
    if (mode === 'right') {
      return 'end';
    }
    // Fill
    const modeList = ['alternate', 'start', 'end'];
    return modeList.includes(mode) ? mode : 'start';
  }, [mode]);
  // ===================== Data =======================
  const rawItems = useItems(rootPrefixCls, prefixCls, mergedMode, items, children, pending, pendingDot);
  const mergedItems = React.useMemo(() => reverse ? _toConsumableArray(rawItems).reverse() : rawItems, [reverse, rawItems]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    variant,
    mode: mergedMode,
    orientation,
    items: mergedItems
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([stepsClassNames, contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const stepContext = React.useMemo(() => ({
    railFollowPrevStatus: reverse
  }), [reverse]);
  // ==================== Design ======================
  const layoutAlternate = React.useMemo(() => mergedMode === 'alternate' || orientation === 'vertical' && mergedItems.some(item => item.title), [mergedItems, mergedMode, orientation]);
  // ===================== Warn =======================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Timeline');
    // Item
    warning.deprecated(!children, 'Timeline.Item', 'items');
    // Pending
    const pendingWarning = 'You can create a `item` as pending node directly.';
    warning.deprecated(!pending, 'pending', 'items', pendingWarning);
    warning.deprecated(!pendingDot, 'pendingDot', 'items', pendingWarning);
    // Mode
    warning.deprecated(mode !== 'left' && mode !== 'right', 'mode=left|right', 'mode=start|end');
    // Item Props
    const warnItems = items || [];
    [['label', 'title'], ['children', 'content'], ['dot', 'icon'], ['position', 'placement']].forEach(([oldProp, newProp]) => {
      warning.deprecated(warnItems.every(item => !item[oldProp]), `items.${oldProp}`, `items.${newProp}`);
    });
  }
  // ==================== Render ======================
  const stepStyle = {
    ...contextStyle,
    ...style
  };
  if (isNonNullable(titleSpan) && mergedMode !== 'alternate') {
    if (typeof titleSpan === 'number' && !Number.isNaN(titleSpan)) {
      stepStyle[varName('head-span')] = titleSpan;
    } else {
      stepStyle[varName('head-span-ptg')] = titleSpan;
    }
  }
  return /*#__PURE__*/React.createElement(InternalContext.Provider, {
    value: stepInternalContext
  }, /*#__PURE__*/React.createElement(UnstableContext.Provider, {
    value: stepContext
  }, /*#__PURE__*/React.createElement(Steps, {
    ...restProps,
    // Style
    className: clsx(prefixCls, contextClassName, className, hashId, cssVarCls, {
      [`${prefixCls}-${orientation}`]: orientation === 'horizontal',
      [`${prefixCls}-layout-alternate`]: layoutAlternate,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }),
    style: stepStyle,
    classNames: mergedClassNames,
    styles: mergedStyles,
    // Design
    variant: variant,
    orientation: orientation,
    // Layout
    type: "dot",
    items: mergedItems,
    current: mergedItems.length - 1
  })));
};
Timeline.Item = () => {};
if (process.env.NODE_ENV !== 'production') {
  Timeline.displayName = 'Timeline';
}
export default Timeline;