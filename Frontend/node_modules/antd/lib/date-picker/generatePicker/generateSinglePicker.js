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
var _picker = _interopRequireDefault(require("@rc-component/picker"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../../_util/ContextIsolator"));
var _hooks = require("../../_util/hooks");
var _statusUtils = require("../../_util/statusUtils");
var _warning = require("../../_util/warning");
var _configProvider = require("../../config-provider");
var _context = require("../../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../../config-provider/hooks/useSize"));
var _context2 = require("../../form/context");
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
const generatePicker = generateConfig => {
  const getPicker = (picker, displayName) => {
    const pickerType = displayName === _constant.TIMEPICKER ? 'timePicker' : 'datePicker';
    const Picker = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
      const {
        prefixCls: customizePrefixCls,
        getPopupContainer: customizeGetPopupContainer,
        components,
        style,
        className,
        size: customizeSize,
        bordered,
        placement,
        placeholder,
        disabled: customDisabled,
        status: customStatus,
        variant: customVariant,
        onCalendarChange,
        classNames,
        styles,
        dropdownClassName,
        popupClassName,
        popupStyle,
        rootClassName,
        suffixIcon,
        ...restProps
      } = props;
      const {
        suffixIcon: contextSuffixIcon
      } = (0, _context.useComponentConfig)(displayName === _constant.TIMEPICKER ? 'timePicker' : 'datePicker');
      // ====================== Warning =======================
      if (process.env.NODE_ENV !== 'production') {
        const warning = (0, _warning.devUseWarning)(displayName || 'DatePicker');
        process.env.NODE_ENV !== "production" ? warning(picker !== 'quarter', 'deprecated', `DatePicker.${displayName} is legacy usage. Please use DatePicker[picker='${picker}'] directly.`) : void 0;
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
      const {
        getPrefixCls,
        direction,
        getPopupContainer,
        // Consume different styles according to different names
        [pickerType]: contextPickerConfig
      } = (0, _react.useContext)(_configProvider.ConfigContext);
      const prefixCls = getPrefixCls('picker', customizePrefixCls);
      // ===================== Size =====================
      const {
        compactSize,
        compactItemClassnames
      } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
      const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
      // ===================== Disabled =====================
      const disabled = React.useContext(_DisabledContext.default);
      const mergedDisabled = customDisabled ?? disabled;
      // =========== Merged Props for Semantic ===========
      const mergedProps = {
        ...props,
        size: mergedSize,
        disabled: mergedDisabled,
        status: customStatus,
        variant: customVariant
      };
      // ========================= Style ==========================
      // Use original useMergedPickerSemantic for proper popup handling
      const [mergedClassNames, mergedStyles] = (0, _useMergedPickerSemantic.default)(pickerType, classNames, styles, popupClassName || dropdownClassName, popupStyle, mergedProps);
      const innerRef = React.useRef(null);
      const [variant, enableVariantCls] = (0, _useVariants.default)('datePicker', customVariant, bordered);
      const rootCls = (0, _useCSSVarCls.default)(prefixCls);
      const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
      const mergedRootClassName = (0, _clsx.clsx)(hashId, cssVarCls, rootCls, rootClassName);
      (0, _react.useImperativeHandle)(ref, () => innerRef.current);
      const additionalProps = {
        showToday: true
      };
      const mergedPicker = picker || props.picker;
      const rootPrefixCls = getPrefixCls();
      // ==================== Legacy =====================
      const {
        onSelect,
        multiple
      } = restProps;
      const hasLegacyOnSelect = onSelect && picker === 'time' && !multiple;
      const onInternalCalendarChange = (date, dateStr, info) => {
        onCalendarChange?.(date, dateStr, info);
        if (hasLegacyOnSelect) {
          onSelect(date);
        }
      };
      // ===================== Icon =====================
      const [mergedAllowClear, removeIcon] = (0, _util2.useIcons)(props, prefixCls);
      // ================== components ==================
      const mergedComponents = (0, _useComponents.default)(components);
      // ===================== FormItemInput =====================
      const formItemContext = (0, _react.useContext)(_context2.FormItemInputContext);
      const {
        hasFeedback,
        status: contextStatus,
        feedbackIcon
      } = formItemContext;
      const mergedSuffixIcon = (0, _useSuffixIcon.default)({
        picker: mergedPicker,
        hasFeedback,
        feedbackIcon,
        suffixIcon: suffixIcon === undefined ? contextSuffixIcon : suffixIcon
      });
      const [contextLocale] = (0, _locale.useLocale)('DatePicker', _en_US.default);
      const locale = (0, _util.merge)(contextLocale, props.locale || {});
      // ============================ zIndex ============================
      const [zIndex] = (0, _hooks.useZIndex)('DatePicker', mergedStyles?.popup?.root?.zIndex);
      return /*#__PURE__*/React.createElement(_ContextIsolator.default, {
        space: true
      }, /*#__PURE__*/React.createElement(_picker.default, {
        ref: innerRef,
        placeholder: (0, _util2.getPlaceholder)(locale, mergedPicker, placeholder),
        suffixIcon: mergedSuffixIcon,
        placement: placement,
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
        onCalendarChange: onInternalCalendarChange,
        ...additionalProps,
        ...restProps,
        locale: locale.lang,
        getPopupContainer: customizeGetPopupContainer || getPopupContainer,
        generateConfig: generateConfig,
        components: mergedComponents,
        direction: direction,
        disabled: mergedDisabled,
        // Style
        prefixCls: prefixCls,
        rootClassName: mergedRootClassName,
        className: (0, _clsx.clsx)({
          [`${prefixCls}-${mergedSize}`]: mergedSize,
          [`${prefixCls}-${variant}`]: enableVariantCls
        }, (0, _statusUtils.getStatusClassNames)(prefixCls, (0, _statusUtils.getMergedStatus)(contextStatus, customStatus), hasFeedback), compactItemClassnames, contextPickerConfig?.className, className),
        style: {
          ...contextPickerConfig?.style,
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
        allowClear: mergedAllowClear,
        removeIcon: removeIcon
      }));
    });
    if (process.env.NODE_ENV !== 'production' && displayName) {
      Picker.displayName = displayName;
    }
    return Picker;
  };
  const DatePicker = getPicker();
  const WeekPicker = getPicker(_constant.WEEK, _constant.WEEKPICKER);
  const MonthPicker = getPicker(_constant.MONTH, _constant.MONTHPICKER);
  const YearPicker = getPicker(_constant.YEAR, _constant.YEARPICKER);
  const QuarterPicker = getPicker(_constant.QUARTER, _constant.QUARTERPICKER);
  const TimePicker = getPicker(_constant.TIME, _constant.TIMEPICKER);
  return {
    DatePicker,
    WeekPicker,
    MonthPicker,
    YearPicker,
    TimePicker,
    QuarterPicker
  };
};
var _default = exports.default = generatePicker;