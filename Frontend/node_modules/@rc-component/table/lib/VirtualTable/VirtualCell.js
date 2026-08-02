"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getColumnWidth = getColumnWidth;
var _context = require("@rc-component/context");
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _BodyRow = require("../Body/BodyRow");
var _Cell = _interopRequireDefault(require("../Cell"));
var _context2 = require("./context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/**
 * Return the width of the column by `colSpan`.
 * When `colSpan` is `0` will be trade as `1`.
 */
function getColumnWidth(colIndex, colSpan, columnsOffset) {
  const mergedColSpan = colSpan || 1;
  return columnsOffset[colIndex + mergedColSpan] - (columnsOffset[colIndex] || 0);
}
const VirtualCell = props => {
  const {
    rowInfo,
    column,
    colIndex,
    indent,
    index,
    component,
    renderIndex,
    record,
    style,
    className,
    inverse,
    getHeight
  } = props;
  const {
    render,
    dataIndex,
    className: columnClassName,
    width: colWidth
  } = column;
  const {
    columnsOffset
  } = (0, _context.useContext)(_context2.GridContext, ['columnsOffset']);

  // TODO: support `expandableRowOffset`
  const {
    key,
    fixedInfo,
    appendCellNode,
    additionalCellProps
  } = (0, _BodyRow.getCellProps)(rowInfo, column, colIndex, indent, index);
  const {
    style: cellStyle,
    colSpan = 1,
    rowSpan = 1
  } = additionalCellProps;

  // ========================= ColWidth =========================
  // column width
  const startColIndex = colIndex - 1;
  const concatColWidth = getColumnWidth(startColIndex, colSpan, columnsOffset);

  // margin offset
  const marginOffset = colSpan > 1 ? colWidth - concatColWidth : 0;

  // ========================== Style ===========================
  const mergedStyle = {
    ...cellStyle,
    ...style,
    flex: `0 0 ${concatColWidth}px`,
    width: `${concatColWidth}px`,
    marginRight: marginOffset,
    pointerEvents: 'auto'
  };

  // When `colSpan` or `rowSpan` is `0`, should skip render.
  const needHide = React.useMemo(() => {
    if (inverse) {
      return rowSpan <= 1;
    } else {
      return colSpan === 0 || rowSpan === 0 || rowSpan > 1;
    }
  }, [rowSpan, colSpan, inverse]);

  // 0 rowSpan or colSpan should not render
  if (needHide) {
    mergedStyle.visibility = 'hidden';
  } else if (inverse) {
    mergedStyle.height = getHeight?.(rowSpan);
  }
  const mergedRender = needHide ? () => null : render;

  // ========================== Render ==========================
  const cellSpan = {};

  // Virtual should reset `colSpan` & `rowSpan`
  if (rowSpan === 0 || colSpan === 0) {
    cellSpan.rowSpan = 1;
    cellSpan.colSpan = 1;
  }
  return /*#__PURE__*/React.createElement(_Cell.default, _extends({
    className: (0, _clsx.clsx)(columnClassName, className),
    ellipsis: column.ellipsis,
    align: column.align,
    scope: column.rowScope,
    component: component,
    prefixCls: rowInfo.prefixCls,
    key: key,
    record: record,
    index: index,
    renderIndex: renderIndex,
    dataIndex: dataIndex,
    render: mergedRender,
    shouldCellUpdate: column.shouldCellUpdate
  }, fixedInfo, {
    appendNode: appendCellNode,
    additionalProps: {
      ...additionalCellProps,
      style: mergedStyle,
      ...cellSpan
    }
  }));
};
var _default = exports.default = VirtualCell;