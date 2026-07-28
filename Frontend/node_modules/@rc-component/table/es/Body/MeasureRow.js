import * as React from 'react';
import ResizeObserver from '@rc-component/resize-observer';
import MeasureCell from "./MeasureCell";
import isVisible from "@rc-component/util/es/Dom/isVisible";
import { useContext } from '@rc-component/context';
import TableContext from "../context/TableContext";
const MeasureRow = ({
  prefixCls,
  columnsKey,
  onColumnResize,
  columns
}) => {
  const ref = React.useRef(null);
  const {
    measureRowRender
  } = useContext(TableContext, ['measureRowRender']);
  const measureRow = /*#__PURE__*/React.createElement("tr", {
    "aria-hidden": "true",
    className: `${prefixCls}-measure-row`,
    style: {
      height: 0
    },
    ref: ref
  }, /*#__PURE__*/React.createElement(ResizeObserver.Collection, {
    onBatchResize: infoList => {
      if (isVisible(ref.current)) {
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
    return /*#__PURE__*/React.createElement(MeasureCell, {
      key: columnKey,
      columnKey: columnKey,
      onColumnResize: onColumnResize,
      title: titleForMeasure
    });
  })));
  return typeof measureRowRender === 'function' ? measureRowRender(measureRow) : measureRow;
};
export default MeasureRow;