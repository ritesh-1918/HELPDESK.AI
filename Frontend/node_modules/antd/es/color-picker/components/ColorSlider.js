"use client";

import * as React from 'react';
import { UnstableContext } from '@rc-component/slider';
import { useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import Slider from '../../slider';
import SliderInternalContext from '../../slider/Context';
import { getGradientPercentColor } from '../util';
export const GradientColorSlider = props => {
  const {
    prefixCls,
    colors,
    type,
    color,
    range = false,
    className,
    activeIndex,
    onActive,
    onDragStart,
    onDragChange,
    onKeyDelete,
    ...restProps
  } = props;
  const sliderProps = {
    ...restProps,
    track: false
  };
  // ========================== Background ==========================
  const linearCss = React.useMemo(() => {
    const colorsStr = colors.map(c => `${c.color} ${c.percent}%`).join(', ');
    return `linear-gradient(90deg, ${colorsStr})`;
  }, [colors]);
  const pointColor = React.useMemo(() => {
    if (!color || !type) {
      return null;
    }
    if (type === 'alpha') {
      return color.toRgbString();
    }
    return `hsl(${color.toHsb().h}, 100%, 50%)`;
  }, [color, type]);
  // ======================= Context: Slider ========================
  const onInternalDragStart = useEvent(onDragStart);
  const onInternalDragChange = useEvent(onDragChange);
  const unstableContext = React.useMemo(() => ({
    onDragStart: onInternalDragStart,
    onDragChange: onInternalDragChange
  }), []);
  // ======================= Context: Render ========================
  const handleRender = useEvent((ori, info) => {
    const {
      onFocus,
      style,
      className: handleCls,
      onKeyDown
    } = ori.props;
    // Point Color
    const mergedStyle = {
      ...style
    };
    if (type === 'gradient') {
      mergedStyle.background = getGradientPercentColor(colors, info.value);
    }
    return /*#__PURE__*/React.cloneElement(ori, {
      onFocus: e => {
        onActive?.(info.index);
        onFocus?.(e);
      },
      style: mergedStyle,
      className: clsx(handleCls, {
        [`${prefixCls}-slider-handle-active`]: activeIndex === info.index
      }),
      onKeyDown: e => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && onKeyDelete) {
          onKeyDelete(info.index);
        }
        onKeyDown?.(e);
      }
    });
  });
  const sliderContext = React.useMemo(() => ({
    direction: 'ltr',
    handleRender
  }), []);
  // ============================ Render ============================
  return /*#__PURE__*/React.createElement(SliderInternalContext.Provider, {
    value: sliderContext
  }, /*#__PURE__*/React.createElement(UnstableContext.Provider, {
    value: unstableContext
  }, /*#__PURE__*/React.createElement(Slider, {
    ...sliderProps,
    className: clsx(className, `${prefixCls}-slider`),
    tooltip: {
      open: false
    },
    range: {
      editable: range,
      minCount: 2
    },
    styles: {
      rail: {
        background: linearCss
      },
      handle: pointColor ? {
        background: pointColor
      } : {}
    },
    classNames: {
      rail: `${prefixCls}-slider-rail`,
      handle: `${prefixCls}-slider-handle`
    }
  })));
};
const SingleColorSlider = props => {
  const {
    value,
    onChange,
    onChangeComplete
  } = props;
  const singleOnChange = v => onChange(v[0]);
  const singleOnChangeComplete = v => onChangeComplete(v[0]);
  return /*#__PURE__*/React.createElement(GradientColorSlider, {
    ...props,
    value: [value],
    onChange: singleOnChange,
    onChangeComplete: singleOnChangeComplete
  });
};
export default SingleColorSlider;