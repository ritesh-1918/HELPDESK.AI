import useMemo from "@rc-component/util/es/hooks/useMemo";
import isEqual from "@rc-component/util/es/isEqual";
import getValue from "@rc-component/util/es/utils/get";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import PerfContext from "../context/PerfContext";
import { validateValue } from "../utils/valueUtil";
import { useImmutableMark } from "../context/TableContext";
function isRenderCell(data) {
  return data && typeof data === 'object' && !Array.isArray(data) && ! /*#__PURE__*/React.isValidElement(data);
}
export default function useCellRender(record, dataIndex, renderIndex, children, render, shouldCellUpdate) {
  // TODO: Remove this after next major version
  const perfRecord = React.useContext(PerfContext);
  const mark = useImmutableMark();

  // ======================== Render ========================
  const retData = useMemo(() => {
    if (validateValue(children)) {
      return [children];
    }
    const path = dataIndex === null || dataIndex === undefined || dataIndex === '' ? [] : Array.isArray(dataIndex) ? dataIndex : [dataIndex];
    const value = getValue(record, path);

    // Customize render node
    let returnChildNode = value;
    let returnCellProps = undefined;
    if (render) {
      const renderData = render(value, record, renderIndex);
      if (isRenderCell(renderData)) {
        if (process.env.NODE_ENV !== 'production') {
          warning(false, '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.');
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
    return !isEqual(prev, next, true);
  });
  return retData;
}