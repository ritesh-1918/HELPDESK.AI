"use client";

import * as React from 'react';
import { forwardRef, useContext, useImperativeHandle } from 'react';
import RCPicker from '@rc-component/picker';
import { merge } from '@rc-component/util';
import { clsx } from 'clsx';
import ContextIsolator from '../../_util/ContextIsolator';
import { useZIndex } from '../../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../../_util/statusUtils';
import { devUseWarning } from '../../_util/warning';
import { ConfigContext } from '../../config-provider';
import { useComponentConfig } from '../../config-provider/context';
import DisabledContext from '../../config-provider/DisabledContext';
import useCSSVarCls from '../../config-provider/hooks/useCSSVarCls';
import useSize from '../../config-provider/hooks/useSize';
import { FormItemInputContext } from '../../form/context';
import useVariant from '../../form/hooks/useVariants';
import { useLocale } from '../../locale';
import { useCompactItemContext } from '../../space/Compact';
import useMergedPickerSemantic from '../hooks/useMergedPickerSemantic';
import enUS from '../locale/en_US';
import useStyle from '../style';
import { getPlaceholder, useIcons } from '../util';
import { MONTH, MONTHPICKER, QUARTER, QUARTERPICKER, TIME, TIMEPICKER, WEEK, WEEKPICKER, YEAR, YEARPICKER } from './constant';
import useSuffixIcon from './useSuffixIcon';
import useComponents from './useComponents';
const generatePicker = generateConfig => {
  const getPicker = (picker, displayName) => {
    const pickerType = displayName === TIMEPICKER ? 'timePicker' : 'datePicker';
    const Picker = /*#__PURE__*/forwardRef((props, ref) => {
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
      } = useComponentConfig(displayName === TIMEPICKER ? 'timePicker' : 'datePicker');
      // ====================== Warning =======================
      if (process.env.NODE_ENV !== 'production') {
        const warning = devUseWarning(displayName || 'DatePicker');
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
      } = useContext(ConfigContext);
      const prefixCls = getPrefixCls('picker', customizePrefixCls);
      // ===================== Size =====================
      const {
        compactSize,
        compactItemClassnames
      } = useCompactItemContext(prefixCls, direction);
      const mergedSize = useSize(ctx => customizeSize ?? compactSize ?? ctx);
      // ===================== Disabled =====================
      const disabled = React.useContext(DisabledContext);
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
      const [mergedClassNames, mergedStyles] = useMergedPickerSemantic(pickerType, classNames, styles, popupClassName || dropdownClassName, popupStyle, mergedProps);
      const innerRef = React.useRef(null);
      const [variant, enableVariantCls] = useVariant('datePicker', customVariant, bordered);
      const rootCls = useCSSVarCls(prefixCls);
      const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
      const mergedRootClassName = clsx(hashId, cssVarCls, rootCls, rootClassName);
      useImperativeHandle(ref, () => innerRef.current);
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
      const [mergedAllowClear, removeIcon] = useIcons(props, prefixCls);
      // ================== components ==================
      const mergedComponents = useComponents(components);
      // ===================== FormItemInput =====================
      const formItemContext = useContext(FormItemInputContext);
      const {
        hasFeedback,
        status: contextStatus,
        feedbackIcon
      } = formItemContext;
      const mergedSuffixIcon = useSuffixIcon({
        picker: mergedPicker,
        hasFeedback,
        feedbackIcon,
        suffixIcon: suffixIcon === undefined ? contextSuffixIcon : suffixIcon
      });
      const [contextLocale] = useLocale('DatePicker', enUS);
      const locale = merge(contextLocale, props.locale || {});
      // ============================ zIndex ============================
      const [zIndex] = useZIndex('DatePicker', mergedStyles?.popup?.root?.zIndex);
      return /*#__PURE__*/React.createElement(ContextIsolator, {
        space: true
      }, /*#__PURE__*/React.createElement(RCPicker, {
        ref: innerRef,
        placeholder: getPlaceholder(locale, mergedPicker, placeholder),
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
        className: clsx({
          [`${prefixCls}-${mergedSize}`]: mergedSize,
          [`${prefixCls}-${variant}`]: enableVariantCls
        }, getStatusClassNames(prefixCls, getMergedStatus(contextStatus, customStatus), hasFeedback), compactItemClassnames, contextPickerConfig?.className, className),
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
  const WeekPicker = getPicker(WEEK, WEEKPICKER);
  const MonthPicker = getPicker(MONTH, MONTHPICKER);
  const YearPicker = getPicker(YEAR, YEARPICKER);
  const QuarterPicker = getPicker(QUARTER, QUARTERPICKER);
  const TimePicker = getPicker(TIME, TIMEPICKER);
  return {
    DatePicker,
    WeekPicker,
    MonthPicker,
    YearPicker,
    TimePicker,
    QuarterPicker
  };
};
export default generatePicker;