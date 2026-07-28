function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { INTERNAL_COL_DEFINE } from "./utils/legacyUtil";
import { useContext } from '@rc-component/context';
import TableContext from "./context/TableContext";
const ColGroup = props => {
  const {
    colWidths,
    columns,
    columCount
  } = props;
  const {
    tableLayout
  } = useContext(TableContext, ['tableLayout']);
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
      additionalProps = column[INTERNAL_COL_DEFINE];

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
export default ColGroup;