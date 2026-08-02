import { useContext } from '@rc-component/context';
import * as React from 'react';
import Cell from "../Cell";
import TableContext from "../context/TableContext";
import devRenderTimes from "../hooks/useRenderTimes";
const ExpandedRow = props => {
  if (process.env.NODE_ENV !== 'production') {
    devRenderTimes(props);
  }
  const {
    prefixCls,
    children,
    component: Component,
    cellComponent,
    className,
    expanded,
    colSpan,
    isEmpty,
    stickyOffset = 0
  } = props;
  const {
    scrollbarSize,
    fixHeader,
    fixColumn,
    componentWidth,
    horizonScroll
  } = useContext(TableContext, ['scrollbarSize', 'fixHeader', 'fixColumn', 'componentWidth', 'horizonScroll']);

  // Cache render node
  let contentNode = children;
  if (isEmpty ? horizonScroll && componentWidth : fixColumn) {
    contentNode = /*#__PURE__*/React.createElement("div", {
      style: {
        width: componentWidth - stickyOffset - (fixHeader && !isEmpty ? scrollbarSize : 0),
        position: 'sticky',
        left: stickyOffset,
        overflow: 'hidden'
      },
      className: `${prefixCls}-expanded-row-fixed`
    }, contentNode);
  }
  return /*#__PURE__*/React.createElement(Component, {
    className: className,
    style: {
      display: expanded ? null : 'none'
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    component: cellComponent,
    prefixCls: prefixCls,
    colSpan: colSpan
  }, contentNode));
};
export default ExpandedRow;