"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _legacyUtil = require("./utils/legacyUtil");
var _context = require("@rc-component/context");
var _TableContext = _interopRequireDefault(require("./context/TableContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const ColGroup = props => {
  const {
    colWidths,
    columns,
    columCount
  } = props;
  const {
    tableLayout
  } = (0, _context.useContext)(_TableContext.default, ['tableLayout']);
  const cols = [];
  const len = columCount || columns.length;

  // Only insert col with width & additional props
  // Skip if rest col do not have any useful info
  let mustInsert = false;
  for (let i = len - 1; i >= 0; i -= 1) {
    const width = colWidths[i];
    const column = columns && columns[i];
    let additionalProps;
    let minWidth;
    if (column) {
      additionalProps = column[_legacyUtil.INTERNAL_COL_DEFINE];

      // fixed will cause layout problems
      if (tableLayout === 'auto') {
        minWidth = column.minWidth;
      }
    }
    if (width || minWidth || additionalProps || mustInsert) {
      const {
        columnType,
        ...restAdditionalProps
      } = additionalProps || {};
      cols.unshift( /*#__PURE__*/React.createElement("col", _extends({
        key: i,
        style: {
          width,
          minWidth
        }
      }, restAdditionalProps)));
      mustInsert = true;
    }
  }
  return cols.length > 0 ? /*#__PURE__*/React.createElement("colgroup", null, cols) : null;
};
var _default = exports.default = ColGroup;