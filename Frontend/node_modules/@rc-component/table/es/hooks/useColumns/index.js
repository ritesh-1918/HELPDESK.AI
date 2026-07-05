import toArray from "@rc-component/util/es/Children/toArray";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { EXPAND_COLUMN } from "../../constant";
import { INTERNAL_COL_DEFINE } from "../../utils/legacyUtil";
import useWidthColumns from "./useWidthColumns";
export function convertChildrenToColumns(children) {
  return toArray(children).filter(node => /*#__PURE__*/React.isValidElement(node)).map(node => {
    const {
      key,
      props
    } = node;
    const {
      children: nodeChildren,
      ...restProps
    } = props;
    const column = {
      key,
      ...restProps
    };
    if (nodeChildren) {
      column.children = convertChildrenToColumns(nodeChildren);
    }
    return column;
  });
}
function filterHiddenColumns(columns) {
  return columns.filter(column => column && typeof column === 'object' && !column.hidden).map(column => {
    const subColumns = column.children;
    if (subColumns && subColumns.length > 0) {
      return {
        ...column,
        children: filterHiddenColumns(subColumns)
      };
    }
    return column;
  });
}
function flatColumns(columns, parentKey = 'key') {
  return columns.filter(column => column && typeof column === 'object').reduce((list, column, index) => {
    const {
      fixed
    } = column;
    const parsedFixed = fixed === true || fixed === 'left' ? 'start' : fixed === 'right' ? 'end' : fixed;
    const mergedKey = `${parentKey}-${index}`;
    const subColumns = column.children;
    if (subColumns && subColumns.length > 0) {
      return [...list, ...flatColumns(subColumns, mergedKey).map(subColum => ({
        ...subColum,
        fixed: subColum.fixed ?? parsedFixed
      }))];
    }
    return [...list, {
      key: mergedKey,
      ...column,
      fixed: parsedFixed
    }];
  }, []);
}

/**
 * Parse `columns` & `children` into `columns`.
 */
function useColumns({
  prefixCls,
  columns,
  children,
  expandable,
  expandedKeys,
  columnTitle,
  getRowKey,
  onTriggerExpand,
  expandIcon,
  rowExpandable,
  expandIconColumnIndex,
  expandedRowOffset = 0,
  direction,
  expandRowByClick,
  columnWidth,
  fixed,
  scrollWidth,
  clientWidth
}, transformColumns) {
  const baseColumns = React.useMemo(() => {
    const newColumns = columns || convertChildrenToColumns(children) || [];
    return filterHiddenColumns(newColumns.slice());
  }, [columns, children]);

  // ========================== Expand ==========================
  const withExpandColumns = React.useMemo(() => {
    if (expandable) {
      let cloneColumns = baseColumns.slice();

      // >>> Warning if use `expandIconColumnIndex`
      if (process.env.NODE_ENV !== 'production' && expandIconColumnIndex >= 0) {
        warning(false, '`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.');
      }

      // >>> Insert expand column if not exist
      if (!cloneColumns.includes(EXPAND_COLUMN)) {
        const expandColIndex = expandIconColumnIndex || 0;
        const insertIndex = expandColIndex === 0 && (fixed === 'right' || fixed === 'end') ? baseColumns.length : expandColIndex;
        if (insertIndex >= 0) {
          cloneColumns.splice(insertIndex, 0, EXPAND_COLUMN);
        }
      }

      // >>> Deduplicate additional expand column
      if (process.env.NODE_ENV !== 'production' && cloneColumns.filter(c => c === EXPAND_COLUMN).length > 1) {
        warning(false, 'There exist more than one `EXPAND_COLUMN` in `columns`.');
      }
      const expandColumnIndex = cloneColumns.indexOf(EXPAND_COLUMN);
      cloneColumns = cloneColumns.filter((column, index) => column !== EXPAND_COLUMN || index === expandColumnIndex);

      // >>> Check if expand column need to fixed
      const prevColumn = baseColumns[expandColumnIndex];
      let fixedColumn;
      if (fixed) {
        fixedColumn = fixed;
      } else {
        fixedColumn = prevColumn ? prevColumn.fixed : null;
      }

      // >>> Create expandable column
      const expandColumn = {
        [INTERNAL_COL_DEFINE]: {
          className: `${prefixCls}-expand-icon-col`,
          columnType: 'EXPAND_COLUMN'
        },
        title: columnTitle,
        fixed: fixedColumn,
        className: `${prefixCls}-row-expand-icon-cell`,
        width: columnWidth,
        render: (_, record, index) => {
          const rowKey = getRowKey(record, index);
          const expanded = expandedKeys.has(rowKey);
          const recordExpandable = rowExpandable ? rowExpandable(record) : true;
          const icon = expandIcon({
            prefixCls,
            expanded,
            expandable: recordExpandable,
            record,
            onExpand: onTriggerExpand
          });
          if (expandRowByClick) {
            return /*#__PURE__*/React.createElement("span", {
              onClick: e => e.stopPropagation()
            }, icon);
          }
          return icon;
        }
      };
      return cloneColumns.map((col, index) => {
        const column = col === EXPAND_COLUMN ? expandColumn : col;
        if (index < expandedRowOffset) {
          return {
            ...column,
            fixed: column.fixed || 'start'
          };
        }
        return column;
      });
    }
    if (process.env.NODE_ENV !== 'production' && baseColumns.includes(EXPAND_COLUMN)) {
      warning(false, '`expandable` is not config but there exist `EXPAND_COLUMN` in `columns`.');
    }
    return baseColumns.filter(col => col !== EXPAND_COLUMN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandable, baseColumns, getRowKey, expandedKeys, expandIcon, direction, expandedRowOffset]);

  // ========================= Transform ========================
  const mergedColumns = React.useMemo(() => {
    let finalColumns = withExpandColumns;
    if (transformColumns) {
      finalColumns = transformColumns(finalColumns);
    }

    // Always provides at least one column for table display
    if (!finalColumns.length) {
      finalColumns = [{
        render: () => null
      }];
    }
    return finalColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformColumns, withExpandColumns, direction]);

  // ========================== Flatten =========================
  const flattenColumns = React.useMemo(() => flatColumns(mergedColumns),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [mergedColumns, direction, scrollWidth]);

  // ========================= FillWidth ========================
  const [filledColumns, realScrollWidth] = useWidthColumns(flattenColumns, scrollWidth, clientWidth);
  return [mergedColumns, filledColumns, realScrollWidth];
}
export default useColumns;