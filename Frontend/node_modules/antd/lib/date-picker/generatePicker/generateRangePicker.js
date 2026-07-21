"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _SwapRightOutlined = _interopRequireDefault(require("@ant-design/icons/SwapRightOutlined"));
var _picker = require("@rc-component/picker");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../../_util/ContextIsolator"));
var _hooks = require("../../_util/hooks");
var _statusUtils = require("../../_util/statusUtils");
var _warning = require("../../_util/warning");
var _configProvider = require("../../config-provider");
var _DisabledContext = _interopRequireDefault(require("../../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../../config-provider/hooks/useSize"));
var _context = require("../../form/context");
var _useVariants = _interopRequireDefault(require("../../form/hooks/useVariants"));
var _locale = require("../../locale");
var _Compact = require("../../space/Compact");
var _useMergedPickerSemantic = _interopRequireDefault(require("../hooks/useMergedPickerSemantic"));
var _en_US = _interopRequireDefault(require("../locale/en_US"));
var _style = _interopRequireDefault(require("../style"));
var _util2 = require("../util");
var _constant = require("./constant");
var _useSuffixIcon = _interopRequireDefault(require("./useSuffixIcon"));
var _useComponents = _interopRequireDefault(require("./useComponents"));
const generateRangePicker = generateConfig => {
  const RangePicker = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
    const {
      prefixCls: customizePrefixCls,
      getPopupContainer: customGetPopupContainer,
      components,
      className,
      style,
      classNames,
      styles,
      placement,
      size: customizeSize,
      disabled: customDisabled,
      bordered = true,
      placeholder,
      status: customStatus,
      variant: customVariant,
      picker,
      dropdownClassName,
      popupClassName,
      popupStyle,
      rootClassName,
      suffixIcon,
      separator,
      ...restProps
    } = props;
    const pickerType = picker === _constant.TIME ? 'timePicker' : 'datePicker';
    // ====================== Warning =======================
    if (process.env.NODE_ENV !== 'production') {
      const warning = (0, _warning.devUseWarning)('DatePicker.RangePicker');
      const deprecatedProps = {
        dropdownClassName: 'classNames.popup.root',
        popupClassName: 'classNames.popup.root',
        popupStyle: 'styles.popup.root',
        bordered: 'variant',
        onSelect: 'onCalendarChange'
      };
      Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
        warning.deprecated(!(oldProp in props), oldProp, newProp);
      });
    }
    const [mergedClassNames, mergedStyles] = (0, _useMergedPickerSemantic.default)(pickerType, classNames, styles, popupClassName || dropdownClassName, popupStyle);
    const innerRef = React.useRef(null);
    const {
      getPrefixCls,
      direction,
      getPopupContainer,
      rangePicker
    } = (0, _react.useContext)(_configProvider.ConfigContext);
    const prefixCls = getPrefixCls('picker', customizePrefixCls);
    const {
      compactSize,
      compactItemClassnames
    } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
    const rootPrefixCls = getPrefixCls();
    const mergedSeparator = separator ?? rangePicker?.separator;
    const [variant, enableVariantCls] = (0, _useVariants.default)('rangePicker', customVariant, bordered);
    const rootCls = (0, _useCSSVarCls.default)(prefixCls);
    const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
    const mergedRootClassName = (0, _clsx.clsx)(hashId, cssVarCls, rootCls, rootClassName);
    // ===================== Icon =====================
    const [mergedAllowClear] = (0, _util2.useIcons)(props, prefixCls);
    // ================== components ==================
    const mergedComponents = (0, _useComponents.default)(components);
    // ===================== Size =====================
    const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
    // ===================== Disabled =====================
    const disabled = React.useContext(_DisabledContext.default);
    const mergedDisabled = customDisabled ?? disabled;
    // ===================== FormItemInput =====================
    const formItemContext = (0, _react.useContext)(_context.FormItemInputContext);
    const {
      hasFeedback,
      status: contextStatus,
      feedbackIcon
    } = formItemContext;
    const mergedSuffixIcon = (0, _useSuffixIcon.default)({
      picker,
      hasFeedback,
      feedbackIcon,
      suffixIcon
    });
    (0, _react.useImperativeHandle)(ref, () => innerRef.current);
    const [contextLocale] = (0, _locale.useLocale)('Calendar', _en_US.default);
    const locale = (0, _util.merge)(contextLocale, props.locale || {});
    // ============================ zIndex ============================
    const [zIndex] = (0, _hooks.useZIndex)('DatePicker', mergedStyles?.popup?.root?.zIndex);
    return /*#__PURE__*/React.createElement(_ContextIsolator.default, {
      space: true
    }, /*#__PURE__*/React.createElement(_picker.RangePicker, {
      separator: /*#__PURE__*/React.createElement("span", {
        "aria-label": "to",
        className: `${prefixCls}-separator`
      }, mergedSeparator ?? /*#__PURE__*/React.createElement(_SwapRightOutlined.default, null)),
      disabled: mergedDisabled,
      ref: innerRef,
      placement: placement,
      placeholder: (0, _util2.getRangePlaceholder)(locale, picker, placeholder),
      suffixIcon: mergedSuffixIcon,
      prevIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-prev-icon`
      }),
      nextIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-next-icon`
      }),
      superPrevIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-super-prev-icon`
      }),
      superNextIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-super-next-icon`
      }),
      transitionName: `${rootPrefixCls}-slide-up`,
      picker: picker,
      ...restProps,
      locale: locale.lang,
      getPopupContainer: customGetPopupContainer || getPopupContainer,
      generateConfig: generateConfig,
      components: mergedComponents,
      direction: direction,
      // Style
      prefixCls: prefixCls,
      rootClassName: mergedRootClassName,
      className: (0, _clsx.clsx)({
        [`${prefixCls}-${mergedSize}`]: mergedSize,
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, (0, _statusUtils.getStatusClassNames)(prefixCls, (0, _statusUtils.getMergedStatus)(contextStatus, customStatus), hasFeedback), compactItemClassnames, className, rangePicker?.className),
      style: {
        ...rangePicker?.style,
        ...style
      },
      // Semantic Style
      classNames: mergedClassNames,
      styles: {
        ...mergedStyles,
        popup: {
          ...mergedStyles.popup,
          root: {
            ...mergedStyles.popup.root,
            zIndex
          }
        }
      },
      allowClear: mergedAllowClear
    }));
  });
  if (process.env.NODE_ENV !== 'production') {
    RangePicker.displayName = 'RangePicker';
  }
  return RangePicker;
};
var _default = exports.default = generateRangePicker;