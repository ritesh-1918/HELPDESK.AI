"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _util = require("./util");
var _clsx = require("clsx");
var _color = require("./color");
var _ColorBlock = _interopRequireDefault(require("./components/ColorBlock"));
var _Picker = _interopRequireDefault(require("./components/Picker"));
var _useColorState = _interopRequireDefault(require("./hooks/useColorState"));
var _useComponent = _interopRequireDefault(require("./hooks/useComponent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
const ColorPicker = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    value,
    defaultValue,
    prefixCls = _util.ColorPickerPrefixCls,
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
  const [Slider] = (0, _useComponent.default)(components);

  // ============================ Color =============================
  const [colorValue, setColorValue] = (0, _useColorState.default)(defaultValue || _util.defaultColor, value);
  const alphaColor = (0, _react.useMemo)(() => colorValue.setA(1).toRgbString(), [colorValue]);

  // ============================ Events ============================
  const handleChange = (data, type) => {
    if (!value) {
      setColorValue(data);
    }
    onChange?.(data, type);
  };

  // Convert
  const getHueColor = hue => new _color.Color(colorValue.setHue(hue));
  const getAlphaColor = alpha => new _color.Color(colorValue.setA(alpha / 100));

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
  const mergeCls = (0, _clsx.clsx)(`${prefixCls}-panel`, className, {
    [`${prefixCls}-panel-disabled`]: disabled
  });
  const sharedSliderProps = {
    prefixCls,
    disabled,
    color: colorValue
  };
  const defaultPanel = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Picker.default, _extends({
    onChange: handleChange
  }, sharedSliderProps, {
    onChangeComplete: onChangeComplete
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-slider-container`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-slider-group`, {
      [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha
    })
  }, /*#__PURE__*/_react.default.createElement(Slider, _extends({}, sharedSliderProps, {
    type: "hue",
    colors: HUE_COLORS,
    min: 0,
    max: 359,
    value: colorValue.getHue(),
    onChange: onHueChange,
    onChangeComplete: onHueChangeComplete
  })), !disabledAlpha && /*#__PURE__*/_react.default.createElement(Slider, _extends({}, sharedSliderProps, {
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
  }))), /*#__PURE__*/_react.default.createElement(_ColorBlock.default, {
    color: colorValue.toRgbString(),
    prefixCls: prefixCls
  })));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: mergeCls,
    style: style,
    ref: ref
  }, typeof panelRender === 'function' ? panelRender(defaultPanel) : defaultPanel);
});
if (process.env.NODE_ENV !== 'production') {
  ColorPicker.displayName = 'ColorPicker';
}
var _default = exports.default = ColorPicker;