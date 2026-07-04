"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import React, { useContext } from 'react';
import RcColorPicker from '@rc-component/color-picker';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { useForceUpdate } from '../../../_util/hooks';
import Segmented from '../../../segmented';
import { AggregationColor } from '../../color';
import { PanelPickerContext } from '../../context';
import { genAlphaColor, generateColor } from '../../util';
import ColorClear from '../ColorClear';
import ColorInput from '../ColorInput';
import ColorSlider from '../ColorSlider';
import GradientColorBar from './GradientColorBar';
const components = {
  slider: ColorSlider
};
const PanelPicker = () => {
  const panelPickerContext = useContext(PanelPickerContext);
  const {
    mode,
    onModeChange,
    modeOptions,
    prefixCls,
    allowClear,
    value,
    disabledAlpha,
    onChange,
    onClear,
    onChangeComplete,
    activeIndex,
    gradientDragging,
    ...injectProps
  } = panelPickerContext;
  // ============================ Colors ============================
  const colors = React.useMemo(() => {
    if (!value.cleared) {
      return value.getColors();
    }
    return [{
      percent: 0,
      color: new AggregationColor('')
    }, {
      percent: 100,
      color: new AggregationColor('')
    }];
  }, [value]);
  // ========================= Single Color =========================
  const isSingle = !value.isGradient();
  // We cache the point color in case user drag the gradient point across another one
  const [lockedColor, setLockedColor] = React.useState(value);
  // Use layout effect here since `useEffect` will cause a blink when mouseDown
  useLayoutEffect(() => {
    if (!isSingle) {
      setLockedColor(colors[activeIndex]?.color);
    }
  }, [isSingle, colors, gradientDragging, activeIndex]);
  const activeColor = React.useMemo(() => {
    if (isSingle) {
      return value;
    }
    // Use cache when dragging. User can not operation panel when dragging.
    if (gradientDragging) {
      return lockedColor;
    }
    return colors[activeIndex]?.color;
  }, [colors, value, activeIndex, isSingle, lockedColor, gradientDragging]);
  // ========================= Picker Color =========================
  const [pickerColor, setPickerColor] = React.useState(activeColor);
  const [forceSync, setForceSync] = useForceUpdate();
  const mergedPickerColor = pickerColor?.equals(activeColor) ? activeColor : pickerColor;
  useLayoutEffect(() => {
    setPickerColor(activeColor);
  }, [forceSync, activeColor?.toHexString()]);
  // ============================ Change ============================
  const fillColor = (nextColor, info) => {
    let submitColor = generateColor(nextColor);
    // Fill alpha color to 100% if origin is cleared color
    if (value.cleared) {
      const rgb = submitColor.toRgb();
      // Auto fill color if origin is `0/0/0` to enhance user experience
      if (!rgb.r && !rgb.g && !rgb.b && info) {
        const {
          type: infoType,
          value: infoValue = 0
        } = info;
        submitColor = new AggregationColor({
          h: infoType === 'hue' ? infoValue : 0,
          s: 1,
          b: 1,
          a: infoType === 'alpha' ? infoValue / 100 : 1
        });
      } else {
        submitColor = genAlphaColor(submitColor);
      }
    }
    if (mode === 'single') {
      return submitColor;
    }
    const nextColors = _toConsumableArray(colors);
    nextColors[activeIndex] = {
      ...nextColors[activeIndex],
      color: submitColor
    };
    return new AggregationColor(nextColors);
  };
  const onPickerChange = (colorValue, fromPicker, info) => {
    const nextColor = fillColor(colorValue, info);
    setPickerColor(nextColor.isGradient() ? nextColor.getColors()[activeIndex].color : nextColor);
    onChange(nextColor, fromPicker);
  };
  const onInternalChangeComplete = (nextColor, info) => {
    // Trigger complete event
    onChangeComplete(fillColor(nextColor, info));
    // Back of origin color in case in controlled
    // This will set after `onChangeComplete` to avoid `setState` trigger rerender
    // which will make `fillColor` get wrong `color.cleared` state
    setForceSync();
  };
  const onInputChange = colorValue => {
    onChange(fillColor(colorValue));
  };
  // ============================ Render ============================
  // Operation bar
  let operationNode = null;
  const showMode = modeOptions.length > 1;
  if (allowClear || showMode) {
    operationNode = /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-operation`
    }, showMode && (/*#__PURE__*/React.createElement(Segmented, {
      size: "small",
      options: modeOptions,
      value: mode,
      onChange: onModeChange
    })), /*#__PURE__*/React.createElement(ColorClear, {
      prefixCls: prefixCls,
      value: value,
      onChange: clearColor => {
        onChange(clearColor);
        onClear?.();
      },
      ...injectProps
    }));
  }
  // Return
  return /*#__PURE__*/React.createElement(React.Fragment, null, operationNode, /*#__PURE__*/React.createElement(GradientColorBar, {
    ...panelPickerContext,
    colors: colors
  }), /*#__PURE__*/React.createElement(RcColorPicker, {
    prefixCls: prefixCls,
    value: mergedPickerColor?.toHsb(),
    disabledAlpha: disabledAlpha,
    onChange: (colorValue, info) => {
      onPickerChange(colorValue, true, info);
    },
    onChangeComplete: (colorValue, info) => {
      onInternalChangeComplete(colorValue, info);
    },
    components: components
  }), /*#__PURE__*/React.createElement(ColorInput, {
    value: activeColor,
    onChange: onInputChange,
    prefixCls: prefixCls,
    disabledAlpha: disabledAlpha,
    ...injectProps
  }));
};
export default PanelPicker;