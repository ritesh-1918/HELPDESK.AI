"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GradientColorSlider = void 0;
var React = _interopRequireWildcard(require("react"));
var _slider = require("@rc-component/slider");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _slider2 = _interopRequireDefault(require("../../slider"));
var _Context = _interopRequireDefault(require("../../slider/Context"));
var _util2 = require("../util");
const GradientColorSlider = props => {
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
  const onInternalDragStart = (0, _util.useEvent)(onDragStart);
  const onInternalDragChange = (0, _util.useEvent)(onDragChange);
  const unstableContext = React.useMemo(() => ({
    onDragStart: onInternalDragStart,
    onDragChange: onInternalDragChange
  }), []);
  // ======================= Context: Render ========================
  const handleRender = (0, _util.useEvent)((ori, info) => {
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
      mergedStyle.background = (0, _util2.getGradientPercentColor)(colors, info.value);
    }
    return /*#__PURE__*/React.cloneElement(ori, {
      onFocus: e => {
        onActive?.(info.index);
        onFocus?.(e);
      },
      style: mergedStyle,
      className: (0, _clsx.clsx)(handleCls, {
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
  return /*#__PURE__*/React.createElement(_Context.default.Provider, {
    value: sliderContext
  }, /*#__PURE__*/React.createElement(_slider.UnstableContext.Provider, {
    value: unstableContext
  }, /*#__PURE__*/React.createElement(_slider2.default, {
    ...sliderProps,
    className: (0, _clsx.clsx)(className, `${prefixCls}-slider`),
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
exports.GradientColorSlider = GradientColorSlider;
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
var _default = exports.default = SingleColorSlider;