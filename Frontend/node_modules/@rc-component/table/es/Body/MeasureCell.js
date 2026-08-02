import * as React from 'react';
import ResizeObserver from '@rc-component/resize-observer';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
const MeasureCell = props => {
  const {
    columnKey,
    onColumnResize,
    title
  } = props;
  const cellRef = React.useRef(null);
  useLayoutEffect(() => {
    if (cellRef.current) {
      onColumnResize(columnKey, cellRef.current.offsetWidth);
    }
  }, []);
  return /*#__PURE__*/React.createElement(ResizeObserver, {
    data: columnKey
  }, /*#__PURE__*/React.createElement("td", {
    ref: cellRef,
    style: {
      paddingTop: 0,
      paddingBottom: 0,
      borderTop: 0,
      borderBottom: 0,
      height: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 0,
      overflow: 'hidden',
      fontWeight: 'bold'
    }
  }, title || '\xa0')));
};
export default MeasureCell;