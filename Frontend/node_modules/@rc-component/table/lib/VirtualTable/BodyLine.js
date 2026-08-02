"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _Cell = _interopRequireDefault(require("../Cell"));
var _TableContext = _interopRequireWildcard(require("../context/TableContext"));
var _useRowInfo = _interopRequireDefault(require("../hooks/useRowInfo"));
var _VirtualCell = _interopRequireDefault(require("./VirtualCell"));
var _context2 = require("./context");
var _expandUtil = require("../utils/expandUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls', 'flattenColumns', 'fixColumn', 'componentWidth', 'scrollX']);
  const {
    getComponent
  } = (0, _context.useContext)(_context2.StaticContext, ['getComponent']);
  const rowInfo = (0, _useRowInfo.default)(record, rowKey, index, indent);
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
    const expandedClsName = (0, _expandUtil.computedExpandedClassName)(expandedRowClassName, record, index, indent);
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
      className: (0, _clsx.clsx)(`${prefixCls}-expanded-row`, `${prefixCls}-expanded-row-level-${indent + 1}`, expandedClsName)
    }, /*#__PURE__*/React.createElement(_Cell.default, {
      component: cellComponent,
      prefixCls: prefixCls,
      className: (0, _clsx.clsx)(rowCellCls, {
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
    className: (0, _clsx.clsx)(className, `${prefixCls}-row`, rowProps?.className, {
      [`${prefixCls}-row-extra`]: extra
    }),
    style: {
      ...rowStyle,
      ...rowProps?.style
    }
  }), flattenColumns.map((column, colIndex) => {
    return /*#__PURE__*/React.createElement(_VirtualCell.default, {
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
const ResponseBodyLine = (0, _TableContext.responseImmutable)(BodyLine);
if (process.env.NODE_ENV !== 'production') {
  ResponseBodyLine.displayName = 'BodyLine';
}
var _default = exports.default = ResponseBodyLine;