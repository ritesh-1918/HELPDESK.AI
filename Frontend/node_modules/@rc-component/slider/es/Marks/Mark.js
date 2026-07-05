import { clsx } from 'clsx';
import * as React from 'react';
import SliderContext from "../context";
import { getDirectionStyle } from "../util";
const Mark = props => {
  const {
    prefixCls,
    style,
    children,
    value,
    onClick
  } = props;
  const {
    min,
    max,
    direction,
    includedStart,
    includedEnd,
    included
  } = React.useContext(SliderContext);
  const textCls = `${prefixCls}-text`;

  // ============================ Offset ============================
  const positionStyle = getDirectionStyle(direction, value, min, max);
  return /*#__PURE__*/React.createElement("span", {
    className: clsx(textCls, {
      [`${textCls}-active`]: included && includedStart <= value && value <= includedEnd
    }),
    style: {
      ...positionStyle,
      ...style
    },
    onMouseDown: e => {
      e.stopPropagation();
    },
    onClick: () => {
      onClick(value);
    }
  }, children);
};
export default Mark;