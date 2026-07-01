import React, { useRef } from 'react';
import useColorDrag from "../hooks/useColorDrag";
import Palette from "./Palette";
import { useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import { Color } from "../color";
import { calcOffset, calculateColor } from "../util";
import Gradient from "./Gradient";
import Handler from "./Handler";
import Transform from "./Transform";
const Slider = props => {
  const {
    prefixCls,
    colors,
    disabled,
    onChange,
    onChangeComplete,
    color,
    type
  } = props;
  const sliderRef = useRef(null);
  const transformRef = useRef(null);
  const colorRef = useRef(color);
  const getValue = c => {
    return type === 'hue' ? c.getHue() : c.a * 100;
  };
  const onDragChange = useEvent(offsetValue => {
    const calcColor = calculateColor({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: sliderRef,
      color,
      type
    });
    colorRef.current = calcColor;
    onChange(getValue(calcColor));
  });
  const [offset, dragStartHandle] = useColorDrag({
    color,
    targetRef: transformRef,
    containerRef: sliderRef,
    calculate: () => calcOffset(color, type),
    onDragChange,
    onDragChangeComplete() {
      onChangeComplete(getValue(colorRef.current));
    },
    direction: 'x',
    disabledDrag: disabled
  });
  const handleColor = React.useMemo(() => {
    if (type === 'hue') {
      const hsb = color.toHsb();
      hsb.s = 1;
      hsb.b = 1;
      hsb.a = 1;
      const lightColor = new Color(hsb);
      return lightColor;
    }
    return color;
  }, [color, type]);

  // ========================= Gradient =========================
  const gradientList = React.useMemo(() => colors.map(info => `${info.color} ${info.percent}%`), [colors]);

  // ========================== Render ==========================
  return /*#__PURE__*/React.createElement("div", {
    ref: sliderRef,
    className: clsx(`${prefixCls}-slider`, `${prefixCls}-slider-${type}`),
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, /*#__PURE__*/React.createElement(Palette, {
    prefixCls: prefixCls
  }, /*#__PURE__*/React.createElement(Transform, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, /*#__PURE__*/React.createElement(Handler, {
    size: "small",
    color: handleColor.toHexString(),
    prefixCls: prefixCls
  })), /*#__PURE__*/React.createElement(Gradient, {
    colors: gradientList,
    type: type,
    prefixCls: prefixCls
  })));
};
export default Slider;