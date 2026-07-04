function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import { useTransitionDuration, defaultProps } from "./common";
import getIndeterminateLine from "./utils/getIndeterminateLine";
import useId from "@rc-component/util/es/hooks/useId";
const Line = props => {
  const {
    id,
    className,
    percent,
    prefixCls,
    strokeColor,
    strokeLinecap,
    strokeWidth,
    style,
    railColor,
    railWidth,
    transition,
    loading,
    ...restProps
  } = {
    ...defaultProps,
    ...props
  };
  const mergedId = useId(id);

  // eslint-disable-next-line no-param-reassign
  delete restProps.gapPosition;
  const percentList = Array.isArray(percent) ? percent : [percent];
  const strokeColorList = Array.isArray(strokeColor) ? strokeColor : [strokeColor];
  const paths = useTransitionDuration();
  const center = strokeWidth / 2;
  const right = 100 - strokeWidth / 2;
  const pathString = `M ${strokeLinecap === 'round' ? center : 0},${center}
         L ${strokeLinecap === 'round' ? right : 100},${center}`;
  const viewBoxString = `0 0 100 ${strokeWidth}`;
  let stackPtg = 0;
  const {
    indeterminateStyleProps,
    indeterminateStyleAnimation
  } = getIndeterminateLine({
    id: mergedId,
    loading,
    percent: percentList[0],
    strokeLinecap,
    strokeWidth
  });
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: clsx(`${prefixCls}-line`, className),
    viewBox: viewBoxString,
    preserveAspectRatio: "none",
    style: style
  }, restProps), /*#__PURE__*/React.createElement("path", {
    className: `${prefixCls}-line-rail`,
    d: pathString,
    strokeLinecap: strokeLinecap,
    stroke: railColor,
    strokeWidth: railWidth || strokeWidth,
    fillOpacity: "0"
  }), percentList.map((ptg, index) => {
    let dashPercent = 1;
    switch (strokeLinecap) {
      case 'round':
        dashPercent = 1 - strokeWidth / 100;
        break;
      case 'square':
        dashPercent = 1 - strokeWidth / 2 / 100;
        break;
      default:
        dashPercent = 1;
        break;
    }
    const pathStyle = {
      strokeDasharray: `${ptg * dashPercent}px, 100px`,
      strokeDashoffset: `-${stackPtg}px`,
      transition: transition || 'stroke-dashoffset 0.3s ease 0s, stroke-dasharray .3s ease 0s, stroke 0.3s linear',
      ...indeterminateStyleProps
    };
    const color = strokeColorList[index] || strokeColorList[strokeColorList.length - 1];
    stackPtg += ptg;
    return /*#__PURE__*/React.createElement("path", {
      key: index,
      className: `${prefixCls}-line-path`,
      d: pathString,
      strokeLinecap: strokeLinecap,
      stroke: color,
      strokeWidth: strokeWidth,
      fillOpacity: "0",
      ref: elem => {
        // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
        // React will call the ref callback with the DOM element when the component mounts,
        // and call it with `null` when it unmounts.
        // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

        paths[index] = elem;
      },
      style: pathStyle
    });
  }), indeterminateStyleAnimation);
};
if (process.env.NODE_ENV !== 'production') {
  Line.displayName = 'Line';
}
export default Line;