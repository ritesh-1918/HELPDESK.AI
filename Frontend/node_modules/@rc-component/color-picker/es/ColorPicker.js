function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { forwardRef, useMemo } from 'react';
import { ColorPickerPrefixCls, defaultColor } from "./util";
import { clsx } from 'clsx';
import { Color } from "./color";
import ColorBlock from "./components/ColorBlock";
import Picker from "./components/Picker";
import useColorState from "./hooks/useColorState";
import useComponent from "./hooks/useComponent";
const HUE_COLORS = [{
  color: 'rgb(255, 0, 0)',
  percent: 0
}, {
  color: 'rgb(255, 255, 0)',
  percent: 17
}, {
  color: 'rgb(0, 255, 0)',
  percent: 33
}, {
  color: 'rgb(0, 255, 255)',
  percent: 50
}, {
  color: 'rgb(0, 0, 255)',
  percent: 67
}, {
  color: 'rgb(255, 0, 255)',
  percent: 83
}, {
  color: 'rgb(255, 0, 0)',
  percent: 100
}];
const ColorPicker = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    value,
    defaultValue,
    prefixCls = ColorPickerPrefixCls,
    onChange,
    onChangeComplete,
    className,
    style,
    panelRender,
    disabledAlpha = false,
    disabled = false,
    components
  } = props;

  // ========================== Components ==========================
  const [Slider] = useComponent(components);

  // ============================ Color =============================
  const [colorValue, setColorValue] = useColorState(defaultValue || defaultColor, value);
  const alphaColor = useMemo(() => colorValue.setA(1).toRgbString(), [colorValue]);

  // ============================ Events ============================
  const handleChange = (data, type) => {
    if (!value) {
      setColorValue(data);
    }
    onChange?.(data, type);
  };

  // Convert
  const getHueColor = hue => new Color(colorValue.setHue(hue));
  const getAlphaColor = alpha => new Color(colorValue.setA(alpha / 100));

  // Slider change
  const onHueChange = hue => {
    handleChange(getHueColor(hue), {
      type: 'hue',
      value: hue
    });
  };
  const onAlphaChange = alpha => {
    handleChange(getAlphaColor(alpha), {
      type: 'alpha',
      value: alpha
    });
  };

  // Complete
  const onHueChangeComplete = hue => {
    if (onChangeComplete) {
      onChangeComplete(getHueColor(hue));
    }
  };
  const onAlphaChangeComplete = alpha => {
    if (onChangeComplete) {
      onChangeComplete(getAlphaColor(alpha));
    }
  };

  // ============================ Render ============================
  const mergeCls = clsx(`${prefixCls}-panel`, className, {
    [`${prefixCls}-panel-disabled`]: disabled
  });
  const sharedSliderProps = {
    prefixCls,
    disabled,
    color: colorValue
  };
  const defaultPanel = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Picker, _extends({
    onChange: handleChange
  }, sharedSliderProps, {
    onChangeComplete: onChangeComplete
  })), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-slider-container`
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-slider-group`, {
      [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha
    })
  }, /*#__PURE__*/React.createElement(Slider, _extends({}, sharedSliderProps, {
    type: "hue",
    colors: HUE_COLORS,
    min: 0,
    max: 359,
    value: colorValue.getHue(),
    onChange: onHueChange,
    onChangeComplete: onHueChangeComplete
  })), !disabledAlpha && /*#__PURE__*/React.createElement(Slider, _extends({}, sharedSliderProps, {
    type: "alpha",
    colors: [{
      percent: 0,
      color: 'rgba(255, 0, 4, 0)'
    }, {
      percent: 100,
      color: alphaColor
    }],
    min: 0,
    max: 100,
    value: colorValue.a * 100,
    onChange: onAlphaChange,
    onChangeComplete: onAlphaChangeComplete
  }))), /*#__PURE__*/React.createElement(ColorBlock, {
    color: colorValue.toRgbString(),
    prefixCls: prefixCls
  })));
  return /*#__PURE__*/React.createElement("div", {
    className: mergeCls,
    style: style,
    ref: ref
  }, typeof panelRender === 'function' ? panelRender(defaultPanel) : defaultPanel);
});
if (process.env.NODE_ENV !== 'production') {
  ColorPicker.displayName = 'ColorPicker';
}
export default ColorPicker;