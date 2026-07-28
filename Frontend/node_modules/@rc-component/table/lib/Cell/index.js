"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _TableContext = _interopRequireDefault(require("../context/TableContext"));
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
var _useCellRender = _interopRequireDefault(require("./useCellRender"));
var _useHoverState = _interopRequireDefault(require("./useHoverState"));
var _util = require("@rc-component/util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
    (0, _useRenderTimes.default)(props);
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
  } = (0, _context.useContext)(_TableContext.default, ['allColumnsFixedLeft', 'rowHoverable']);

  // ====================== Value =======================
  const [childNode, legacyCellProps] = (0, _useCellRender.default)(record, dataIndex, renderIndex, children, render, shouldCellUpdate);

  // ====================== Fixed =======================
  const fixedStyle = {};
  const isFixStart = typeof fixStart === 'number' && !allColumnsFixedLeft;
  const isFixEnd = typeof fixEnd === 'number' && !allColumnsFixedLeft;
  const [showFixStartShadow, showFixEndShadow] = (0, _context.useContext)(_TableContext.default, ({
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
  const [hovering, onHover] = (0, _useHoverState.default)(index, mergedRowSpan);
  const onMouseEnter = (0, _util.useEvent)(event => {
    if (record) {
      onHover(index, index + mergedRowSpan - 1);
    }
    additionalProps?.onMouseEnter?.(event);
  });
  const onMouseLeave = (0, _util.useEvent)(event => {
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
  const mergedClassName = (0, _clsx.clsx)(cellPrefixCls, className, {
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
var _default = exports.default = /*#__PURE__*/React.memo(Cell);