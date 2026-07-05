"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _PerfContext = _interopRequireDefault(require("../context/PerfContext"));
var _TableContext = _interopRequireWildcard(require("../context/TableContext"));
var _useFlattenRecords = _interopRequireDefault(require("../hooks/useFlattenRecords"));
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
var _valueUtil = require("../utils/valueUtil");
var _BodyRow = _interopRequireDefault(require("./BodyRow"));
var _ExpandedRow = _interopRequireDefault(require("./ExpandedRow"));
var _MeasureRow = _interopRequireDefault(require("./MeasureRow"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Body = props => {
  if (process.env.NODE_ENV !== 'production') {
    (0, _useRenderTimes.default)(props);
  }
  const {
    data,
    measureColumnWidth
  } = props;
  const {
    prefixCls,
    getComponent,
    onColumnResize,
    flattenColumns,
    getRowKey,
    expandedKeys,
    childrenColumnName,
    emptyNode,
    classNames,
    styles,
    expandedRowOffset = 0,
    colWidths
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls', 'getComponent', 'onColumnResize', 'flattenColumns', 'getRowKey', 'expandedKeys', 'childrenColumnName', 'emptyNode', 'classNames', 'styles', 'expandedRowOffset', 'fixedInfoList', 'colWidths']);
  const {
    body: bodyCls = {}
  } = classNames || {};
  const {
    body: bodyStyles = {}
  } = styles || {};
  const flattenData = (0, _useFlattenRecords.default)(data, childrenColumnName, expandedKeys, getRowKey);
  const rowKeys = React.useMemo(() => flattenData.map(item => item.rowKey), [flattenData]);

  // =================== Performance ====================
  const perfRef = React.useRef({
    renderWithProps: false
  });

  // ===================== Expanded =====================
  // `expandedRowOffset` data is same for all the rows.
  // Let's calc on Body side to save performance.
  const expandedRowInfo = React.useMemo(() => {
    const expandedColSpan = flattenColumns.length - expandedRowOffset;
    let expandedStickyStart = 0;
    for (let i = 0; i < expandedRowOffset; i += 1) {
      expandedStickyStart += colWidths[i] || 0;
    }
    return {
      offset: expandedRowOffset,
      colSpan: expandedColSpan,
      sticky: expandedStickyStart
    };
  }, [flattenColumns.length, expandedRowOffset, colWidths]);

  // ====================== Render ======================
  const WrapperComponent = getComponent(['body', 'wrapper'], 'tbody');
  const trComponent = getComponent(['body', 'row'], 'tr');
  const tdComponent = getComponent(['body', 'cell'], 'td');
  const thComponent = getComponent(['body', 'cell'], 'th');
  let rows;
  if (data.length) {
    rows = flattenData.map((item, idx) => {
      const {
        record,
        indent,
        index: renderIndex,
        rowKey
      } = item;
      return /*#__PURE__*/React.createElement(_BodyRow.default, {
        classNames: bodyCls,
        styles: bodyStyles,
        key: rowKey,
        rowKey: rowKey,
        rowKeys: rowKeys,
        record: record,
        index: idx,
        renderIndex: renderIndex,
        rowComponent: trComponent,
        cellComponent: tdComponent,
        scopeCellComponent: thComponent,
        indent: indent
        // Expanded row info
        ,
        expandedRowInfo: expandedRowInfo
      });
    });
  } else {
    rows = /*#__PURE__*/React.createElement(_ExpandedRow.default, {
      expanded: true,
      className: `${prefixCls}-placeholder`,
      prefixCls: prefixCls,
      component: trComponent,
      cellComponent: tdComponent,
      colSpan: flattenColumns.length,
      isEmpty: true
    }, emptyNode);
  }
  const columnsKey = (0, _valueUtil.getColumnsKey)(flattenColumns);
  return /*#__PURE__*/React.createElement(_PerfContext.default.Provider, {
    value: perfRef.current
  }, /*#__PURE__*/React.createElement(WrapperComponent, {
    style: bodyStyles.wrapper,
    className: (0, _clsx.clsx)(`${prefixCls}-tbody`, bodyCls.wrapper)
  }, measureColumnWidth && /*#__PURE__*/React.createElement(_MeasureRow.default, {
    prefixCls: prefixCls,
    columnsKey: columnsKey,
    onColumnResize: onColumnResize,
    columns: flattenColumns
  }), rows));
};
if (process.env.NODE_ENV !== 'production') {
  Body.displayName = 'Body';
}
var _default = exports.default = (0, _TableContext.responseImmutable)(Body);