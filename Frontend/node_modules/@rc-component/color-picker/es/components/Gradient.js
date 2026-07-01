import React, { useMemo } from 'react';
import { Color } from "../color";
import { generateColor } from "../util";
const Gradient = ({
  colors,
  children,
  direction = 'to right',
  type,
  prefixCls
}) => {
  const gradientColors = useMemo(() => colors.map((color, idx) => {
    let result = generateColor(color);
    if (type === 'alpha' && idx === colors.length - 1) {
      result = new Color(result.setA(1));
    }
    return result.toRgbString();
  }).join(','), [colors, type]);
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-gradient`,
    style: {
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(${direction}, ${gradientColors})`
    }
  }, children);
};
export default Gradient;