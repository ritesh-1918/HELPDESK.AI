import warning from "@rc-component/util/es/warning";
export const INTERNAL_COL_DEFINE = 'RC_TABLE_INTERNAL_COL_DEFINE';
export function getExpandableProps(props) {
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
      warning(false, 'expanded related props have been moved into `expandable`.');
    }
    config = legacyExpandableConfig;
  }
  if (config.showExpandColumn === false) {
    config.expandIconColumnIndex = -1;
  }
  return config;
}