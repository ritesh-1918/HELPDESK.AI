import { clsx } from 'clsx';
import * as React from 'react';
import SliderContext from "../context";
import { getDirectionStyle } from "../util";
const Dot = props => {
  const {
    prefixCls,
    value,
    style,
    activeStyle
  } = props;
  const {
    min,
    max,
    direction,
    included,
    includedStart,
    includedEnd
  } = React.useContext(SliderContext);
  const dotClassName = `${prefixCls}-dot`;
  const active = included && includedStart <= value && value <= includedEnd;

  // ============================ Offset ============================
  let mergedStyle = {
    ...getDirectionStyle(direction, value, min, max),
    ...(typeof style === 'function' ? style(value) : style)
  };
  if (active) {
    mergedStyle = {
      ...mergedStyle,
      ...(typeof activeStyle === 'function' ? activeStyle(value) : activeStyle)
    };
  }
  return /*#__PURE__*/React.createElement("span", {
    className: clsx(dotClassName, {
      [`${dotClassName}-active`]: active
    }),
    style: mergedStyle
  });
};
export default Dot;