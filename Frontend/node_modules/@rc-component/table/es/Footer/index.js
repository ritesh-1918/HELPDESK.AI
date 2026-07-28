import { useContext } from '@rc-component/context';
import * as React from 'react';
import TableContext, { responseImmutable } from "../context/TableContext";
import devRenderTimes from "../hooks/useRenderTimes";
import Summary from "./Summary";
import SummaryContext from "./SummaryContext";
const Footer = props => {
  if (process.env.NODE_ENV !== 'production') {
    devRenderTimes(props);
  }
  const {
    children,
    stickyOffsets,
    flattenColumns
  } = props;
  const prefixCls = useContext(TableContext, 'prefixCls');
  const lastColumnIndex = flattenColumns.length - 1;
  const scrollColumn = flattenColumns[lastColumnIndex];
  const summaryContext = React.useMemo(() => ({
    stickyOffsets,
    flattenColumns,
    scrollColumnIndex: scrollColumn?.scrollbar ? lastColumnIndex : null
  }), [scrollColumn, flattenColumns, lastColumnIndex, stickyOffsets]);
  return /*#__PURE__*/React.createElement(SummaryContext.Provider, {
    value: summaryContext
  }, /*#__PURE__*/React.createElement("tfoot", {
    className: `${prefixCls}-summary`
  }, children));
};
export default responseImmutable(Footer);
export const FooterComponents = Summary;