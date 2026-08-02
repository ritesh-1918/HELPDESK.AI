function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { useContext } from '@rc-component/context';
import { clsx } from 'clsx';
import * as React from 'react';
import TableContext from "../context/TableContext";
import devRenderTimes from "../hooks/useRenderTimes";
import useCellRender from "./useCellRender";
import useHoverState from "./useHoverState";
import { useEvent } from '@rc-component/util';
const getTitleFromCellRenderChildren = ({
  ellipsis,
  rowType,
  children
}) => {
  let title;
  const ellipsisConfig = ellipsis === true ? {
    showTitle: true
  } : ellipsis;
  if (ellipsisConfig && (ellipsisConfig.showTitle || rowType === 'header')) {
    if (typeof children === 'string' || typeof children === 'number') {
      title = children.toString();
    } else if ( /*#__PURE__*/React.isValidElement(children) && typeof children.props?.children === 'string') {
      title = children.props?.children;
    }
  }
  return title;
};
const Cell = props => {
  if (process.env.NODE_ENV !== 'production') {
    devRenderTimes(props);
  }
  const {
    component: Component,
    children,
    ellipsis,
    scope,
    // Style
    prefixCls,
    className,
    style,
    align,
    // Value
    record,
    render,
    dataIndex,
    renderIndex,
    shouldCellUpdate,
    // Row
    index,
    rowType,
    // Span
    colSpan,
    rowSpan,
    // Fixed
    fixStart,
    fixEnd,
    fixedStartShadow,
    fixedEndShadow,
    offsetFixedStartShadow,
    offsetFixedEndShadow,
    zIndex,
    zIndexReverse,
    // Private
    appendNode,
    additionalProps = {},
    isSticky
  } = props;
  const cellPrefixCls = `${prefixCls}-cell`;
  const {
    allColumnsFixedLeft,
    rowHoverable
  } = useContext(TableContext, ['allColumnsFixedLeft', 'rowHoverable']);

  // ====================== Value =======================
  const [childNode, legacyCellProps] = useCellRender(record, dataIndex, renderIndex, children, render, shouldCellUpdate);

  // ====================== Fixed =======================
  const fixedStyle = {};
  const isFixStart = typeof fixStart === 'number' && !allColumnsFixedLeft;
  const isFixEnd = typeof fixEnd === 'number' && !allColumnsFixedLeft;
  const [showFixStartShadow, showFixEndShadow] = useContext(TableContext, ({
    scrollInfo
  }) => {
    if (!isFixStart && !isFixEnd) {
      return [false, false];
    }
    const [absScroll, scrollWidth] = scrollInfo;
    const showStartShadow = (isFixStart && fixedStartShadow && absScroll) -
    // For precision, we not show shadow by default which has better user experience.
    offsetFixedStartShadow >= 1;
    const showEndShadow = (isFixEnd && fixedEndShadow && scrollWidth - absScroll) -
    // Same as above
    offsetFixedEndShadow > 1;
    return [showStartShadow, showEndShadow];
  });
  if (isFixStart) {
    fixedStyle.insetInlineStart = fixStart;
    fixedStyle['--z-offset'] = zIndex;
    fixedStyle['--z-offset-reverse'] = zIndexReverse;
  }
  if (isFixEnd) {
    fixedStyle.insetInlineEnd = fixEnd;
    fixedStyle['--z-offset'] = zIndex;
    fixedStyle['--z-offset-reverse'] = zIndexReverse;
  }

  // ================ RowSpan & ColSpan =================
  const mergedColSpan = legacyCellProps?.colSpan ?? additionalProps.colSpan ?? colSpan ?? 1;
  const mergedRowSpan = legacyCellProps?.rowSpan ?? additionalProps.rowSpan ?? rowSpan ?? 1;

  // ====================== Hover =======================
  const [hovering, onHover] = useHoverState(index, mergedRowSpan);
  const onMouseEnter = useEvent(event => {
    if (record) {
      onHover(index, index + mergedRowSpan - 1);
    }
    additionalProps?.onMouseEnter?.(event);
  });
  const onMouseLeave = useEvent(event => {
    if (record) {
      onHover(-1, -1);
    }
    additionalProps?.onMouseLeave?.(event);
  });

  // ====================== Render ======================
  if (mergedColSpan === 0 || mergedRowSpan === 0) {
    return null;
  }

  // >>>>> Title
  const title = additionalProps.title ?? getTitleFromCellRenderChildren({
    rowType,
    ellipsis,
    children: childNode
  });

  // >>>>> ClassName
  const mergedClassName = clsx(cellPrefixCls, className, {
    // Fixed
    [`${cellPrefixCls}-fix`]: isFixStart || isFixEnd,
    [`${cellPrefixCls}-fix-start`]: isFixStart,
    [`${cellPrefixCls}-fix-end`]: isFixEnd,
    // Fixed shadow
    [`${cellPrefixCls}-fix-start-shadow`]: fixedStartShadow,
    [`${cellPrefixCls}-fix-start-shadow-show`]: fixedStartShadow && showFixStartShadow,
    [`${cellPrefixCls}-fix-end-shadow`]: fixedEndShadow,
    [`${cellPrefixCls}-fix-end-shadow-show`]: fixedEndShadow && showFixEndShadow,
    [`${cellPrefixCls}-ellipsis`]: ellipsis,
    [`${cellPrefixCls}-with-append`]: appendNode,
    [`${cellPrefixCls}-fix-sticky`]: (isFixStart || isFixEnd) && isSticky,
    [`${cellPrefixCls}-row-hover`]: !legacyCellProps && hovering
  }, additionalProps.className, legacyCellProps?.className);

  // >>>>> Style
  const alignStyle = {};
  if (align) {
    alignStyle.textAlign = align;
  }

  // The order is important since user can overwrite style.
  // For example ant-design/ant-design#51763
  const mergedStyle = {
    ...legacyCellProps?.style,
    ...fixedStyle,
    ...alignStyle,
    ...additionalProps.style,
    ...style
  };

  // >>>>> Children Node
  let mergedChildNode = childNode;

  // Not crash if final `childNode` is not validate ReactNode
  if (typeof mergedChildNode === 'object' && !Array.isArray(mergedChildNode) && ! /*#__PURE__*/React.isValidElement(mergedChildNode)) {
    mergedChildNode = null;
  }
  if (ellipsis && (fixedStartShadow || fixedEndShadow)) {
    mergedChildNode = /*#__PURE__*/React.createElement("span", {
      className: `${cellPrefixCls}-content`
    }, mergedChildNode);
  }
  return /*#__PURE__*/React.createElement(Component, _extends({}, legacyCellProps, additionalProps, {
    className: mergedClassName,
    style: mergedStyle
    // A11y
    ,
    title: title,
    scope: scope
    // Hover
    ,
    onMouseEnter: rowHoverable ? onMouseEnter : undefined,
    onMouseLeave: rowHoverable ? onMouseLeave : undefined
    //Span
    ,
    colSpan: mergedColSpan !== 1 ? mergedColSpan : null,
    rowSpan: mergedRowSpan !== 1 ? mergedRowSpan : null
  }), appendNode, mergedChildNode);
};
export default /*#__PURE__*/React.memo(Cell);