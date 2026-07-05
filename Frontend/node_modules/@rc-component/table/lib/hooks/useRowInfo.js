"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRowInfo;
var _context = require("@rc-component/context");
var _TableContext = _interopRequireDefault(require("../context/TableContext"));
var _valueUtil = require("../utils/valueUtil");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useRowInfo(record, rowKey, recordIndex, indent) {
  const context = (0, _context.useContext)(_TableContext.default, ['prefixCls', 'fixedInfoList', 'flattenColumns', 'expandableType', 'expandRowByClick', 'onTriggerExpand', 'rowClassName', 'expandedRowClassName', 'indentSize', 'expandIcon', 'expandedRowRender', 'expandIconColumnIndex', 'expandedKeys', 'childrenColumnName', 'rowExpandable', 'onRow']);
  const {
    flattenColumns,
    expandableType,
    expandedKeys,
    childrenColumnName,
    onTriggerExpand,
    rowExpandable,
    onRow,
    expandRowByClick,
    rowClassName
  } = context;

  // ======================= Expandable =======================
  // Only when row is not expandable and `children` exist in record
  const nestExpandable = expandableType === 'nest';
  const rowSupportExpand = expandableType === 'row' && (!rowExpandable || rowExpandable(record));
  const mergedExpandable = rowSupportExpand || nestExpandable;
  const expanded = expandedKeys && expandedKeys.has(rowKey);
  const hasNestChildren = childrenColumnName && record && record[childrenColumnName];
  const onInternalTriggerExpand = (0, _util.useEvent)(onTriggerExpand);

  // ========================= onRow ==========================
  const rowProps = onRow?.(record, recordIndex);
  const onRowClick = rowProps?.onClick;
  const onClick = (event, ...args) => {
    if (expandRowByClick && mergedExpandable) {
      onTriggerExpand(record, event);
    }
    onRowClick?.(event, ...args);
  };

  // ====================== RowClassName ======================
  let computeRowClassName;
  if (typeof rowClassName === 'string') {
    computeRowClassName = rowClassName;
  } else if (typeof rowClassName === 'function') {
    computeRowClassName = rowClassName(record, recordIndex, indent);
  }

  // ========================= Column =========================
  const columnsKey = (0, _valueUtil.getColumnsKey)(flattenColumns);
  return {
    ...context,
    columnsKey,
    nestExpandable,
    expanded,
    hasNestChildren,
    record,
    onTriggerExpand: onInternalTriggerExpand,
    rowSupportExpand,
    expandable: mergedExpandable,
    rowProps: {
      ...rowProps,
      className: (0, _clsx.clsx)(computeRowClassName, rowProps?.className),
      onClick
    }
  };
}