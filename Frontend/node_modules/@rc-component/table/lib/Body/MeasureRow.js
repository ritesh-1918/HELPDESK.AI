"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _MeasureCell = _interopRequireDefault(require("./MeasureCell"));
var _isVisible = _interopRequireDefault(require("@rc-component/util/lib/Dom/isVisible"));
var _context = require("@rc-component/context");
var _TableContext = _interopRequireDefault(require("../context/TableContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const MeasureRow = ({
  prefixCls,
  columnsKey,
  onColumnResize,
  columns
}) => {
  const ref = React.useRef(null);
  const {
    measureRowRender
  } = (0, _context.useContext)(_TableContext.default, ['measureRowRender']);
  const measureRow = /*#__PURE__*/React.createElement("tr", {
    "aria-hidden": "true",
    className: `${prefixCls}-measure-row`,
    style: {
      height: 0
    },
    ref: ref
  }, /*#__PURE__*/React.createElement(_resizeObserver.default.Collection, {
    onBatchResize: infoList => {
      if ((0, _isVisible.default)(ref.current)) {
        infoList.forEach(({
          data: columnKey,
          size
        }) => {
          onColumnResize(columnKey, size.offsetWidth);
        });
      }
    }
  }, columnsKey.map(columnKey => {
    const column = columns.find(col => col.key === columnKey);
    const rawTitle = column?.title;
    const titleForMeasure = /*#__PURE__*/React.isValidElement(rawTitle) ? /*#__PURE__*/React.cloneElement(rawTitle, {
      ref: null
    }) : rawTitle;
    return /*#__PURE__*/React.createElement(_MeasureCell.default, {
      key: columnKey,
      columnKey: columnKey,
      onColumnResize: onColumnResize,
      title: titleForMeasure
    });
  })));
  return typeof measureRowRender === 'function' ? measureRowRender(measureRow) : measureRow;
};
var _default = exports.default = MeasureRow;