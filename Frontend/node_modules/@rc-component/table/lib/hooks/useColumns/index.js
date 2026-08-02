"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertChildrenToColumns = convertChildrenToColumns;
exports.default = void 0;
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _constant = require("../../constant");
var _legacyUtil = require("../../utils/legacyUtil");
var _useWidthColumns = _interopRequireDefault(require("./useWidthColumns"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function convertChildrenToColumns(children) {
  return (0, _toArray.default)(children).filter(node => /*#__PURE__*/React.isValidElement(node)).map(node => {
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
        (0, _warning.default)(false, '`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.');
      }

      // >>> Insert expand column if not exist
      if (!cloneColumns.includes(_constant.EXPAND_COLUMN)) {
        const expandColIndex = expandIconColumnIndex || 0;
        const insertIndex = expandColIndex === 0 && (fixed === 'right' || fixed === 'end') ? baseColumns.length : expandColIndex;
        if (insertIndex >= 0) {
          cloneColumns.splice(insertIndex, 0, _constant.EXPAND_COLUMN);
        }
      }

      // >>> Deduplicate additional expand column
      if (process.env.NODE_ENV !== 'production' && cloneColumns.filter(c => c === _constant.EXPAND_COLUMN).length > 1) {
        (0, _warning.default)(false, 'There exist more than one `EXPAND_COLUMN` in `columns`.');
      }
      const expandColumnIndex = cloneColumns.indexOf(_constant.EXPAND_COLUMN);
      cloneColumns = cloneColumns.filter((column, index) => column !== _constant.EXPAND_COLUMN || index === expandColumnIndex);

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
        [_legacyUtil.INTERNAL_COL_DEFINE]: {
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
        const column = col === _constant.EXPAND_COLUMN ? expandColumn : col;
        if (index < expandedRowOffset) {
          return {
            ...column,
            fixed: column.fixed || 'start'
          };
        }
        return column;
      });
    }
    if (process.env.NODE_ENV !== 'production' && baseColumns.includes(_constant.EXPAND_COLUMN)) {
      (0, _warning.default)(false, '`expandable` is not config but there exist `EXPAND_COLUMN` in `columns`.');
    }
    return baseColumns.filter(col => col !== _constant.EXPAND_COLUMN);
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
  const [filledColumns, realScrollWidth] = (0, _useWidthColumns.default)(flattenColumns, scrollWidth, clientWidth);
  return [mergedColumns, filledColumns, realScrollWidth];
}
var _default = exports.default = useColumns;