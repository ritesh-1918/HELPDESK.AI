import * as React from 'react';
import { clsx } from 'clsx';
const Block = ({
  bg,
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: '100%',
    height: '100%',
    background: bg
  }
}, children);
function getPtgColors(color, scale) {
  return Object.keys(color).map(key => {
    const parsedKey = parseFloat(key);
    const ptgKey = `${Math.floor(parsedKey * scale)}%`;
    return `${color[key]} ${ptgKey}`;
  });
}
const PtgCircle = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    color,
    gradientId,
    radius,
    className,
    style: circleStyleForStack,
    ptg,
    strokeLinecap,
    strokeWidth,
    size,
    gapDegree
  } = props;
  const isGradient = color && typeof color === 'object';
  const stroke = isGradient ? `#FFF` : undefined;

  // ========================== Circle ==========================
  const halfSize = size / 2;
  const circleNode = /*#__PURE__*/React.createElement("circle", {
    className: clsx(`${prefixCls}-circle-path`, className),
    r: radius,
    cx: halfSize,
    cy: halfSize,
    stroke: stroke,
    strokeLinecap: strokeLinecap,
    strokeWidth: strokeWidth,
    opacity: ptg === 0 ? 0 : 1,
    style: circleStyleForStack,
    ref: ref
  });

  // ========================== Render ==========================
  if (!isGradient) {
    return circleNode;
  }
  const maskId = `${gradientId}-conic`;
  const fromDeg = gapDegree ? `${180 + gapDegree / 2}deg` : '0deg';
  const conicColors = getPtgColors(color, (360 - gapDegree) / 360);
  const linearColors = getPtgColors(color, 1);
  const conicColorBg = `conic-gradient(from ${fromDeg}, ${conicColors.join(', ')})`;
  const linearColorBg = `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${linearColors.join(', ')})`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("mask", {
    id: maskId
  }, circleNode), /*#__PURE__*/React.createElement("foreignObject", {
    x: 0,
    y: 0,
    width: size,
    height: size,
    mask: `url(#${maskId})`
  }, /*#__PURE__*/React.createElement(Block, {
    bg: linearColorBg
  }, /*#__PURE__*/React.createElement(Block, {
    bg: conicColorBg
  }))));
});
if (process.env.NODE_ENV !== 'production') {
  PtgCircle.displayName = 'PtgCircle';
}
export default PtgCircle;