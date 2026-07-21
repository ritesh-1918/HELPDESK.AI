"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useCellRender;
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _get = _interopRequireDefault(require("@rc-component/util/lib/utils/get"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _PerfContext = _interopRequireDefault(require("../context/PerfContext"));
var _valueUtil = require("../utils/valueUtil");
var _TableContext = require("../context/TableContext");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function isRenderCell(data) {
  return data && typeof data === 'object' && !Array.isArray(data) && ! /*#__PURE__*/React.isValidElement(data);
}
function useCellRender(record, dataIndex, renderIndex, children, render, shouldCellUpdate) {
  // TODO: Remove this after next major version
  const perfRecord = React.useContext(_PerfContext.default);
  const mark = (0, _TableContext.useImmutableMark)();

  // ======================== Render ========================
  const retData = (0, _useMemo.default)(() => {
    if ((0, _valueUtil.validateValue)(children)) {
      return [children];
    }
    const path = dataIndex === null || dataIndex === undefined || dataIndex === '' ? [] : Array.isArray(dataIndex) ? dataIndex : [dataIndex];
    const value = (0, _get.default)(record, path);

    // Customize render node
    let returnChildNode = value;
    let returnCellProps = undefined;
    if (render) {
      const renderData = render(value, record, renderIndex);
      if (isRenderCell(renderData)) {
        if (process.env.NODE_ENV !== 'production') {
          (0, _warning.default)(false, '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.');
        }
        returnChildNode = renderData.children;
        returnCellProps = renderData.props;
        perfRecord.renderWithProps = true;
      } else {
        returnChildNode = renderData;
      }
    }
    return [returnChildNode, returnCellProps];
  }, [
  // Force update deps
  mark,
  // Normal deps
  record, children, dataIndex, render, renderIndex], (prev, next) => {
    if (shouldCellUpdate) {
      const [, prevRecord] = prev;
      const [, nextRecord] = next;
      return shouldCellUpdate(nextRecord, prevRecord);
    }

    // Legacy mode should always update
    if (perfRecord.renderWithProps) {
      return true;
    }
    return !(0, _isEqual.default)(prev, next, true);
  });
  return retData;
}