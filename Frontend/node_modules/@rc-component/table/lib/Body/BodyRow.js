"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCellProps = getCellProps;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _Cell = _interopRequireDefault(require("../Cell"));
var _TableContext = require("../context/TableContext");
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
var _useRowInfo = _interopRequireDefault(require("../hooks/useRowInfo"));
var _ExpandedRow = _interopRequireDefault(require("./ExpandedRow"));
var _expandUtil = require("../utils/expandUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// ==================================================================================
// ==                                 getCellProps                                 ==
// ==================================================================================
function getCellProps(rowInfo, column, colIndex, indent, index, rowKeys = [], expandedRowOffset = 0) {
  const {
    record,
    prefixCls,
    columnsKey,
    fixedInfoList,
    expandIconColumnIndex,
    nestExpandable,
    indentSize,
    expandIcon,
    expanded,
    hasNestChildren,
    onTriggerExpand,
    expandable,
    expandedKeys
  } = rowInfo;
  const key = columnsKey[colIndex];
  const fixedInfo = fixedInfoList[colIndex];

  // ============= Used for nest expandable =============
  let appendCellNode;
  if (colIndex === (expandIconColumnIndex || 0) && nestExpandable) {
    appendCellNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        paddingLeft: `${indentSize * indent}px`
      },
      className: `${prefixCls}-row-indent indent-level-${indent}`
    }), expandIcon({
      prefixCls,
      expanded,
      expandable: hasNestChildren,
      record,
      onExpand: onTriggerExpand
    }));
  }
  const additionalCellProps = column.onCell?.(record, index) || {};

  // Expandable row has offset
  if (expandedRowOffset) {
    const {
      rowSpan = 1
    } = additionalCellProps;

    // For expandable row with rowSpan,
    // We should increase the rowSpan if the row is expanded
    if (expandable && rowSpan && colIndex < expandedRowOffset) {
      let currentRowSpan = rowSpan;
      for (let i = index; i < index + rowSpan; i += 1) {
        const rowKey = rowKeys[i];
        if (expandedKeys.has(rowKey)) {
          currentRowSpan += 1;
        }
      }
      additionalCellProps.rowSpan = currentRowSpan;
    }
  }
  return {
    key,
    fixedInfo,
    appendCellNode,
    additionalCellProps: additionalCellProps
  };
}

// ==================================================================================
// ==                                 getCellProps                                 ==
// ==================================================================================
const BodyRow = props => {
  if (process.env.NODE_ENV !== 'production') {
    (0, _useRenderTimes.default)(props);
  }
  const {
    className,
    style,
    classNames,
    styles,
    record,
    index,
    renderIndex,
    rowKey,
    rowKeys,
    indent = 0,
    rowComponent: RowComponent,
    cellComponent,
    scopeCellComponent,
    expandedRowInfo
  } = props;
  const rowInfo = (0, _useRowInfo.default)(record, rowKey, index, indent);
  const {
    prefixCls,
    flattenColumns,
    expandedRowClassName,
    expandedRowRender,
    rowProps,
    // Misc
    expanded,
    rowSupportExpand
  } = rowInfo;

  // Force render expand row if expanded before
  const expandedRef = React.useRef(false);
  expandedRef.current ||= expanded;
  if (process.env.NODE_ENV !== 'production') {
    (0, _useRenderTimes.default)(props);
  }

  // 若没有 expandedRowRender 参数, 将使用 baseRowNode 渲染 Children
  // 此时如果 level > 1 则说明是 expandedRow, 一样需要附加 computedExpandedRowClassName
  const expandedClsName = (0, _expandUtil.computedExpandedClassName)(expandedRowClassName, record, index, indent);

  // ======================== Base tr row ========================
  const baseRowNode = /*#__PURE__*/React.createElement(RowComponent, _extends({}, rowProps, {
    "data-row-key": rowKey,
    className: (0, _clsx.clsx)(className, `${prefixCls}-row`, `${prefixCls}-row-level-${indent}`, rowProps?.className, classNames.row, {
      [expandedClsName]: indent >= 1
    }),
    style: {
      ...style,
      ...rowProps?.style,
      ...styles.row
    }
  }), flattenColumns.map((column, colIndex) => {
    const {
      render,
      dataIndex,
      className: columnClassName
    } = column;
    const {
      key,
      fixedInfo,
      appendCellNode,
      additionalCellProps
    } = getCellProps(rowInfo, column, colIndex, indent, index, rowKeys, expandedRowInfo?.offset);
    return /*#__PURE__*/React.createElement(_Cell.default, _extends({
      className: (0, _clsx.clsx)(columnClassName, classNames.cell),
      style: styles.cell,
      ellipsis: column.ellipsis,
      align: column.align,
      scope: column.rowScope,
      component: column.rowScope ? scopeCellComponent : cellComponent,
      prefixCls: prefixCls,
      key: key,
      record: record,
      index: index,
      renderIndex: renderIndex,
      dataIndex: dataIndex,
      render: render,
      shouldCellUpdate: column.shouldCellUpdate
    }, fixedInfo, {
      appendNode: appendCellNode,
      additionalProps: additionalCellProps
    }));
  }));

  // ======================== Expand Row =========================
  let expandRowNode;
  if (rowSupportExpand && (expandedRef.current || expanded)) {
    const expandContent = expandedRowRender(record, index, indent + 1, expanded);
    expandRowNode = /*#__PURE__*/React.createElement(_ExpandedRow.default, {
      expanded: expanded,
      className: (0, _clsx.clsx)(`${prefixCls}-expanded-row`, `${prefixCls}-expanded-row-level-${indent + 1}`, expandedClsName),
      prefixCls: prefixCls,
      component: RowComponent,
      cellComponent: cellComponent,
      colSpan: expandedRowInfo ? expandedRowInfo.colSpan : flattenColumns.length,
      isEmpty: false,
      stickyOffset: expandedRowInfo?.sticky
    }, expandContent);
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, baseRowNode, expandRowNode);
};
if (process.env.NODE_ENV !== 'production') {
  BodyRow.displayName = 'BodyRow';
}
var _default = exports.default = (0, _TableContext.responseImmutable)(BodyRow);