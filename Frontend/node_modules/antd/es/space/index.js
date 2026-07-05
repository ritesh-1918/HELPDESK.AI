"use client";

import * as React from 'react';
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { isPresetSize, isValidGapNumber } from '../_util/gapSize';
import { useMergeSemantic, useOrientation } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Addon from './Addon';
import Compact from './Compact';
import { SpaceContextProvider } from './context';
import Item from './Item';
import useStyle from './style';
export { SpaceContext } from './context';
const InternalSpace = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction: directionConfig,
    size: contextSize,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('space');
  const {
    size = contextSize ?? 'small',
    align,
    className,
    rootClassName,
    children,
    direction,
    orientation,
    prefixCls: customizePrefixCls,
    split,
    separator,
    style,
    vertical,
    wrap = false,
    classNames,
    styles,
    ...restProps
  } = props;
  const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];
  const isPresetVerticalSize = isPresetSize(verticalSize);
  const isPresetHorizontalSize = isPresetSize(horizontalSize);
  const isValidVerticalSize = isValidGapNumber(verticalSize);
  const isValidHorizontalSize = isValidGapNumber(horizontalSize);
  const childNodes = toArray(children, {
    keepEmpty: true
  });
  const [mergedOrientation, mergedVertical] = useOrientation(orientation, vertical, direction);
  const mergedAlign = align === undefined && !mergedVertical ? 'center' : align;
  const mergedSeparator = separator ?? split;
  const prefixCls = getPrefixCls('space', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size,
    orientation: mergedOrientation,
    align: mergedAlign
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rootClassNames = clsx(prefixCls, contextClassName, hashId, `${prefixCls}-${mergedOrientation}`, {
    [`${prefixCls}-rtl`]: directionConfig === 'rtl',
    [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
    [`${prefixCls}-gap-row-${verticalSize}`]: isPresetVerticalSize,
    [`${prefixCls}-gap-col-${horizontalSize}`]: isPresetHorizontalSize
  }, className, rootClassName, cssVarCls, mergedClassNames.root);
  const itemClassName = clsx(`${prefixCls}-item`, mergedClassNames.item);
  // Calculate latest one
  const renderedItems = childNodes.map((child, i) => {
    const key = child?.key || `${itemClassName}-${i}`;
    return /*#__PURE__*/React.createElement(Item, {
      prefix: prefixCls,
      classNames: mergedClassNames,
      styles: mergedStyles,
      className: itemClassName,
      key: key,
      index: i,
      separator: mergedSeparator,
      style: mergedStyles.item
    }, child);
  });
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Space');
    [['direction', 'orientation'], ['split', 'separator']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const memoizedSpaceContext = React.useMemo(() => {
    const calcLatestIndex = childNodes.reduce((latest, child, i) => isNonNullable(child) ? i : latest, 0);
    return {
      latestIndex: calcLatestIndex
    };
  }, [childNodes]);
  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }
  const gapStyle = {};
  if (wrap) {
    gapStyle.flexWrap = 'wrap';
  }
  if (!isPresetHorizontalSize && isValidHorizontalSize) {
    gapStyle.columnGap = horizontalSize;
  }
  if (!isPresetVerticalSize && isValidVerticalSize) {
    gapStyle.rowGap = verticalSize;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: rootClassNames,
    style: {
      ...gapStyle,
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    ...restProps
  }, /*#__PURE__*/React.createElement(SpaceContextProvider, {
    value: memoizedSpaceContext
  }, renderedItems));
});
const Space = InternalSpace;
Space.Compact = Compact;
Space.Addon = Addon;
if (process.env.NODE_ENV !== 'production') {
  Space.displayName = 'Space';
}
export default Space;