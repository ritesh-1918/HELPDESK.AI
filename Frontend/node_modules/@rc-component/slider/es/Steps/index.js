import * as React from 'react';
import SliderContext from "../context";
import Dot from "./Dot";
const Steps = props => {
  const {
    prefixCls,
    marks,
    dots,
    style,
    activeStyle
  } = props;
  const {
    min,
    max,
    step
  } = React.useContext(SliderContext);
  const stepDots = React.useMemo(() => {
    const dotSet = new Set();

    // Add marks
    marks.forEach(mark => {
      dotSet.add(mark.value);
    });

    // Fill dots
    if (dots && step !== null) {
      let current = min;
      while (current <= max) {
        dotSet.add(current);
        current += step;
      }
    }
    return Array.from(dotSet);
  }, [min, max, step, dots, marks]);
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-step`
  }, stepDots.map(dotValue => /*#__PURE__*/React.createElement(Dot, {
    prefixCls: prefixCls,
    key: dotValue,
    value: dotValue,
    style: style,
    activeStyle: activeStyle
  })));
};
export default Steps;