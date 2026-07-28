function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { useContext } from '@rc-component/context';
import { clsx } from 'clsx';
import * as React from 'react';
import Cell from "../Cell";
import TableContext, { responseImmutable } from "../context/TableContext";
import useRowInfo from "../hooks/useRowInfo";
import VirtualCell from "./VirtualCell";
import { StaticContext } from "./context";
import { computedExpandedClassName } from "../utils/expandUtil";
const BodyLine = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    data,
    index,
    className,
    rowKey,
    style,
    extra,
    getHeight,
    ...restProps
  } = props;
  const {
    record,
    indent,
    index: renderIndex
  } = data;
  const {
    scrollX,
    flattenColumns,
    prefixCls,
    fixColumn,
    componentWidth
  } = useContext(TableContext, ['prefixCls', 'flattenColumns', 'fixColumn', 'componentWidth', 'scrollX']);
  const {
    getComponent
  } = useContext(StaticContext, ['getComponent']);
  const rowInfo = useRowInfo(record, rowKey, index, indent);
  const RowComponent = getComponent(['body', 'row'], 'div');
  const cellComponent = getComponent(['body', 'cell'], 'div');

  // ========================== Expand ==========================
  const {
    rowSupportExpand,
    expanded,
    rowProps,
    expandedRowRender,
    expandedRowClassName
  } = rowInfo;
  let expandRowNode;
  if (rowSupportExpand && expanded) {
    const expandContent = expandedRowRender(record, index, indent + 1, expanded);
    const expandedClsName = computedExpandedClassName(expandedRowClassName, record, index, indent);
    let additionalProps = {};
    if (fixColumn) {
      additionalProps = {
        style: {
          ['--virtual-width']: `${componentWidth}px`
        }
      };
    }
    const rowCellCls = `${prefixCls}-expanded-row-cell`;
    expandRowNode = /*#__PURE__*/React.createElement(RowComponent, {
      className: clsx(`${prefixCls}-expanded-row`, `${prefixCls}-expanded-row-level-${indent + 1}`, expandedClsName)
    }, /*#__PURE__*/React.createElement(Cell, {
      component: cellComponent,
      prefixCls: prefixCls,
      className: clsx(rowCellCls, {
        [`${rowCellCls}-fixed`]: fixColumn
      }),
      additionalProps: additionalProps
    }, expandContent));
  }

  // ========================== Render ==========================
  const rowStyle = {
    ...style,
    width: scrollX
  };
  if (extra) {
    rowStyle.position = 'absolute';
    rowStyle.pointerEvents = 'none';
  }
  const rowNode = /*#__PURE__*/React.createElement(RowComponent, _extends({}, rowProps, restProps, {
    "data-row-key": rowKey,
    ref: rowSupportExpand ? null : ref,
    className: clsx(className, `${prefixCls}-row`, rowProps?.className, {
      [`${prefixCls}-row-extra`]: extra
    }),
    style: {
      ...rowStyle,
      ...rowProps?.style
    }
  }), flattenColumns.map((column, colIndex) => {
    return /*#__PURE__*/React.createElement(VirtualCell, {
      key: colIndex,
      component: cellComponent,
      rowInfo: rowInfo,
      column: column,
      colIndex: colIndex,
      indent: indent,
      index: index,
      renderIndex: renderIndex,
      record: record,
      inverse: extra,
      getHeight: getHeight
    });
  }));
  if (rowSupportExpand) {
    return /*#__PURE__*/React.createElement("div", {
      ref: ref
    }, rowNode, expandRowNode);
  }
  return rowNode;
});
const ResponseBodyLine = responseImmutable(BodyLine);
if (process.env.NODE_ENV !== 'production') {
  ResponseBodyLine.displayName = 'BodyLine';
}
export default ResponseBodyLine;