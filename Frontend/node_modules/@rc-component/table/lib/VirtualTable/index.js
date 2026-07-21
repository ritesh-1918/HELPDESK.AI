"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genVirtualTable = exports.default = void 0;
var _clsx = require("clsx");
var _util = require("@rc-component/util");
var React = _interopRequireWildcard(require("react"));
var _constant = require("../constant");
var _TableContext = require("../context/TableContext");
var _Table = _interopRequireWildcard(require("../Table"));
var _BodyGrid = _interopRequireDefault(require("./BodyGrid"));
var _context = require("./context");
var _get = _interopRequireDefault(require("@rc-component/util/lib/utils/get"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const renderBody = (rawData, props) => {
  const {
    ref,
    onScroll
  } = props;
  return /*#__PURE__*/React.createElement(_BodyGrid.default, {
    ref: ref,
    data: rawData,
    onScroll: onScroll
  });
};
const VirtualTable = (props, ref) => {
  const {
    data,
    columns,
    scroll,
    sticky,
    prefixCls = _Table.DEFAULT_PREFIX,
    className,
    listItemHeight,
    components,
    onScroll
  } = props;
  let {
    x: scrollX,
    y: scrollY
  } = scroll || {};

  // Fill scrollX
  if (typeof scrollX !== 'number') {
    if (process.env.NODE_ENV !== 'production') {
      (0, _util.warning)(!scrollX, '`scroll.x` in virtual table must be number.');
    }
    scrollX = 1;
  }

  // Fill scrollY
  if (typeof scrollY !== 'number') {
    scrollY = 500;
    if (process.env.NODE_ENV !== 'production') {
      (0, _util.warning)(false, '`scroll.y` in virtual table must be number.');
    }
  }
  const getComponent = (0, _util.useEvent)((path, defaultComponent) => (0, _get.default)(components, path) || defaultComponent);

  // Memo this
  const onInternalScroll = (0, _util.useEvent)(onScroll);

  // ========================= Context ==========================
  const context = React.useMemo(() => ({
    sticky,
    scrollY,
    listItemHeight,
    getComponent,
    onScroll: onInternalScroll
  }), [sticky, scrollY, listItemHeight, getComponent, onInternalScroll]);

  // ========================== Render ==========================
  return /*#__PURE__*/React.createElement(_context.StaticContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(_Table.default, _extends({}, props, {
    className: (0, _clsx.clsx)(className, `${prefixCls}-virtual`),
    scroll: {
      ...scroll,
      x: scrollX
    },
    components: {
      ...components,
      // fix https://github.com/ant-design/ant-design/issues/48991
      body: data?.length ? renderBody : undefined
    },
    columns: columns,
    internalHooks: _constant.INTERNAL_HOOKS,
    tailor: true,
    ref: ref
  })));
};
const RefVirtualTable = /*#__PURE__*/React.forwardRef(VirtualTable);
if (process.env.NODE_ENV !== 'production') {
  RefVirtualTable.displayName = 'VirtualTable';
}
const genVirtualTable = shouldTriggerRender => {
  return (0, _TableContext.makeImmutable)(RefVirtualTable, shouldTriggerRender);
};
exports.genVirtualTable = genVirtualTable;
var _default = exports.default = genVirtualTable();