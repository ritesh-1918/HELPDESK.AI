"use client";

import React, { useMemo } from 'react';
import ResizeObserver from '@rc-component/resize-observer';
import { clsx } from 'clsx';
const MasonryItem = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    item,
    style,
    prefixCls,
    itemRender,
    className,
    index,
    column,
    onResize
  } = props;
  const itemPrefix = `${prefixCls}-item`;
  // ====================== Render ======================
  const renderNode = useMemo(() => {
    return item.children ?? itemRender?.({
      ...item,
      index,
      column
    });
  }, [item, itemRender, column, index]);
  let returnNode = /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: style,
    className: clsx(itemPrefix, className)
  }, renderNode);
  // Listen for resize
  if (onResize) {
    returnNode = /*#__PURE__*/React.createElement(ResizeObserver, {
      onResize: onResize
    }, returnNode);
  }
  return returnNode;
});
if (process.env.NODE_ENV !== 'production') {
  MasonryItem.displayName = 'MasonryItem';
}
export default MasonryItem;