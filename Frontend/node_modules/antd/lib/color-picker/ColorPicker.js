"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _hooks = require("../_util/hooks");
var _PurePanel = _interopRequireDefault(require("../_util/PurePanel"));
var _statusUtils = require("../_util/statusUtils");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _context2 = require("../form/context");
var _popover = _interopRequireDefault(require("../popover"));
var _Compact = require("../space/Compact");
var _useMergedArrow = _interopRequireDefault(require("../tooltip/hook/useMergedArrow"));
var _color = require("./color");
var _ColorPickerPanel = _interopRequireDefault(require("./ColorPickerPanel"));
var _ColorTrigger = _interopRequireDefault(require("./components/ColorTrigger"));
var _useModeColor = _interopRequireDefault(require("./hooks/useModeColor"));
var _style = _interopRequireDefault(require("./style"));
var _util2 = require("./util");
const ColorPicker = props => {
  const {
    mode,
    value,
    defaultValue,
    format,
    defaultFormat,
    allowClear = false,
    presets,
    children,
    trigger = 'click',
    open,
    disabled,
    placement = 'bottomLeft',
    arrow,
    panelRender,
    showText,
    style,
    className,
    size: customizeSize,
    rootClassName,
    prefixCls: customizePrefixCls,
    styles,
    classNames,
    disabledAlpha = false,
    onFormatChange,
    onChange,
    onClear,
    onOpenChange,
    onChangeComplete,
    getPopupContainer,
    autoAdjustOverflow = true,
    destroyTooltipOnHide,
    destroyOnHidden,
    disabledFormat,
    ...rest
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    arrow: contextArrow
  } = (0, _context.useComponentConfig)('colorPicker');
  const contextDisabled = (0, _react.useContext)(_DisabledContext.default);
  const mergedDisabled = disabled ?? contextDisabled;
  const prefixCls = getPrefixCls('color-picker', customizePrefixCls);
  const mergedArrow = (0, _useMergedArrow.default)(arrow, contextArrow);
  // ================== Size ==================
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    trigger,
    allowClear,
    autoAdjustOverflow,
    disabledAlpha,
    arrow: mergedArrow,
    placement,
    disabled: mergedDisabled,
    size: mergedSize
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  const [internalPopupOpen, setPopupOpen] = (0, _util.useControlledState)(false, open);
  const popupOpen = !mergedDisabled && internalPopupOpen;
  const [formatValue, setFormatValue] = (0, _util.useControlledState)(defaultFormat, format);
  const triggerFormatChange = newFormat => {
    setFormatValue(newFormat);
    if (formatValue !== newFormat) {
      onFormatChange?.(newFormat);
    }
  };
  const triggerOpenChange = visible => {
    if (!visible || !mergedDisabled) {
      setPopupOpen(visible);
      onOpenChange?.(visible);
    }
  };
  // ================== Value & Mode =================
  const [mergedColor, setColor, modeState, setModeState, modeOptions] = (0, _useModeColor.default)(defaultValue, value, mode);
  const isAlphaColor = (0, _react.useMemo)(() => (0, _util2.getColorAlpha)(mergedColor) < 100, [mergedColor]);
  // ==================== Change =====================
  // To enhance user experience, we cache the gradient color when switch from gradient to single
  // If user not modify single color, we will use the cached gradient color.
  const [cachedGradientColor, setCachedGradientColor] = _react.default.useState(null);
  const onInternalChangeComplete = color => {
    if (onChangeComplete) {
      let changeColor = (0, _util2.generateColor)(color);
      // ignore alpha color
      if (disabledAlpha && isAlphaColor) {
        changeColor = (0, _util2.genAlphaColor)(color);
      }
      onChangeComplete(changeColor);
    }
  };
  const onInternalChange = (data, changeFromPickerDrag) => {
    let color = (0, _util2.generateColor)(data);
    // ignore alpha color
    if (disabledAlpha && isAlphaColor) {
      color = (0, _util2.genAlphaColor)(color);
    }
    setColor(color);
    setCachedGradientColor(null);
    // Trigger change event
    if (onChange) {
      onChange(color, color.toCssString());
    }
    // Only for drag-and-drop color picking
    if (!changeFromPickerDrag) {
      onInternalChangeComplete(color);
    }
  };
  // =================== Gradient ====================
  const [activeIndex, setActiveIndex] = _react.default.useState(0);
  const [gradientDragging, setGradientDragging] = _react.default.useState(false);
  // Mode change should also trigger color change
  const onInternalModeChange = newMode => {
    setModeState(newMode);
    if (newMode === 'single' && mergedColor.isGradient()) {
      setActiveIndex(0);
      onInternalChange(new _color.AggregationColor(mergedColor.getColors()[0].color));
      // Should after `onInternalChange` since it will clear the cached color
      setCachedGradientColor(mergedColor);
    } else if (newMode === 'gradient' && !mergedColor.isGradient()) {
      const baseColor = isAlphaColor ? (0, _util2.genAlphaColor)(mergedColor) : mergedColor;
      onInternalChange(new _color.AggregationColor(cachedGradientColor || [{
        percent: 0,
        color: baseColor
      }, {
        percent: 100,
        color: baseColor
      }]));
    }
  };
  // ================== Form Status ==================
  const {
    status: contextStatus
  } = _react.default.useContext(_context2.FormItemInputContext);
  // ===================== Style =====================
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const rtlCls = {
    [`${prefixCls}-rtl`]: direction
  };
  const mergedRootCls = (0, _clsx.clsx)(rootClassName, cssVarCls, rootCls, rtlCls);
  const mergedCls = (0, _clsx.clsx)((0, _statusUtils.getStatusClassNames)(prefixCls, contextStatus), {
    [`${prefixCls}-sm`]: mergedSize === 'small',
    [`${prefixCls}-lg`]: mergedSize === 'large'
  }, compactItemClassnames, contextClassName, mergedRootCls, className, hashId);
  const mergedPopupCls = (0, _clsx.clsx)(prefixCls, mergedRootCls, mergedClassNames.popup?.root);
  // ===================== Warning ======================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('ColorPicker');
    process.env.NODE_ENV !== "production" ? warning(!(disabledAlpha && isAlphaColor), 'usage', '`disabledAlpha` will make the alpha to be 100% when use alpha color.') : void 0;
  }
  const popoverProps = {
    open: popupOpen,
    trigger,
    placement,
    arrow: mergedArrow,
    rootClassName,
    getPopupContainer,
    autoAdjustOverflow,
    destroyOnHidden: destroyOnHidden ?? !!destroyTooltipOnHide
  };
  const mergedStyle = {
    ...contextStyle,
    ...style
  };
  // ============================ zIndex ============================
  return /*#__PURE__*/_react.default.createElement(_popover.default, {
    classNames: {
      root: mergedPopupCls
    },
    styles: {
      root: mergedStyles.popup?.root,
      container: styles?.popupOverlayInner
    },
    onOpenChange: triggerOpenChange,
    content: /*#__PURE__*/_react.default.createElement(_ContextIsolator.default, {
      form: true
    }, /*#__PURE__*/_react.default.createElement(_ColorPickerPanel.default, {
      mode: modeState,
      onModeChange: onInternalModeChange,
      modeOptions: modeOptions,
      prefixCls: prefixCls,
      value: mergedColor,
      allowClear: allowClear,
      disabled: mergedDisabled,
      disabledAlpha: disabledAlpha,
      presets: presets,
      panelRender: panelRender,
      format: formatValue,
      onFormatChange: triggerFormatChange,
      onChange: onInternalChange,
      onChangeComplete: onInternalChangeComplete,
      onClear: onClear,
      activeIndex: activeIndex,
      onActive: setActiveIndex,
      gradientDragging: gradientDragging,
      onGradientDragging: setGradientDragging,
      disabledFormat: disabledFormat
    })),
    ...popoverProps
  }, children || (/*#__PURE__*/_react.default.createElement(_ColorTrigger.default, {
    activeIndex: popupOpen ? activeIndex : -1,
    open: popupOpen,
    className: mergedCls,
    style: mergedStyle,
    classNames: mergedClassNames,
    styles: mergedStyles,
    prefixCls: prefixCls,
    disabled: mergedDisabled,
    showText: showText,
    format: formatValue,
    ...rest,
    color: mergedColor
  })));
};
if (process.env.NODE_ENV !== 'production') {
  ColorPicker.displayName = 'ColorPicker';
}
const PurePanel = (0, _PurePanel.default)(ColorPicker, undefined, props => ({
  ...props,
  placement: 'bottom',
  autoAdjustOverflow: false
}), 'color-picker', /* istanbul ignore next */
prefixCls => prefixCls);
ColorPicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
var _default = exports.default = ColorPicker;