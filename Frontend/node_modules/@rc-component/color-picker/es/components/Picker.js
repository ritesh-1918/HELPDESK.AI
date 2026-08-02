import React, { useRef } from 'react';
import useColorDrag from "../hooks/useColorDrag";
import { calcOffset, calculateColor } from "../util";
import { useEvent } from '@rc-component/util';
import Handler from "./Handler";
import Palette from "./Palette";
import Transform from "./Transform";
const Picker = ({
  color,
  onChange,
  prefixCls,
  onChangeComplete,
  disabled
}) => {
  const pickerRef = useRef();
  const transformRef = useRef();
  const colorRef = useRef(color);
  const onDragChange = useEvent(offsetValue => {
    const calcColor = calculateColor({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: pickerRef,
      color
    });
    colorRef.current = calcColor;
    onChange(calcColor);
  });
  const [offset, dragStartHandle] = useColorDrag({
    color,
    containerRef: pickerRef,
    targetRef: transformRef,
    calculate: () => calcOffset(color),
    onDragChange,
    onDragChangeComplete: () => onChangeComplete?.(colorRef.current),
    disabledDrag: disabled
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: pickerRef,
    className: `${prefixCls}-select`,
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, /*#__PURE__*/React.createElement(Palette, {
    prefixCls: prefixCls
  }, /*#__PURE__*/React.createElement(Transform, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, /*#__PURE__*/React.createElement(Handler, {
    color: color.toRgbString(),
    prefixCls: prefixCls
  })), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-saturation`,
    style: {
      backgroundColor: `hsl(${color.toHsb().h},100%, 50%)`,
      backgroundImage: 'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))'
    }
  })));
};
export default Picker;