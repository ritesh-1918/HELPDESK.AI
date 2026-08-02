"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INTERNAL_COL_DEFINE = void 0;
exports.getExpandableProps = getExpandableProps;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const INTERNAL_COL_DEFINE = exports.INTERNAL_COL_DEFINE = 'RC_TABLE_INTERNAL_COL_DEFINE';
function getExpandableProps(props) {
  const {
    expandable,
    ...legacyExpandableConfig
  } = props;
  let config;
  if ('expandable' in props) {
    config = {
      ...legacyExpandableConfig,
      ...expandable
    };
  } else {
    if (process.env.NODE_ENV !== 'production' && ['indentSize', 'expandedRowKeys', 'defaultExpandedRowKeys', 'defaultExpandAllRows', 'expandedRowRender', 'expandRowByClick', 'expandIcon', 'onExpand', 'onExpandedRowsChange', 'expandedRowClassName', 'expandIconColumnIndex', 'showExpandColumn', 'title'].some(prop => prop in props)) {
      (0, _warning.default)(false, 'expanded related props have been moved into `expandable`.');
    }
    config = legacyExpandableConfig;
  }
  if (config.showExpandColumn === false) {
    config.expandIconColumnIndex = -1;
  }
  return config;
}