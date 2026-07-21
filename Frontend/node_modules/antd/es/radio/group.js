"use client";

import * as React from 'react';
import { useControlledState } from '@rc-component/util';
import useId from "@rc-component/util/es/hooks/useId";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useOrientation } from '../_util/hooks';
import { ConfigContext } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { FormItemInputContext } from '../form/context';
import { toNamePathStr } from '../form/hooks/useForm';
import { RadioGroupContextProvider } from './context';
import Radio from './radio';
import useStyle from './style';
const RadioGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const {
    name: formItemName
  } = React.useContext(FormItemInputContext);
  const defaultName = useId(toNamePathStr(formItemName));
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    options,
    buttonStyle = 'outline',
    disabled,
    children,
    size: customizeSize,
    style,
    id,
    optionType,
    name = defaultName,
    defaultValue,
    value: customizedValue,
    block = false,
    onChange,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    orientation,
    vertical,
    role = 'radiogroup'
  } = props;
  const [value, setValue] = useControlledState(defaultValue, customizedValue);
  const onRadioChange = React.useCallback(event => {
    const lastValue = value;
    const val = event.target.value;
    if (!('value' in props)) {
      setValue(val);
    }
    if (val !== lastValue) {
      onChange?.(event);
    }
  }, [value, setValue, onChange]);
  const prefixCls = getPrefixCls('radio', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  // Style
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  let childrenToRender = children;
  // 如果存在 options, 优先使用
  if (options && options.length > 0) {
    childrenToRender = options.map(option => {
      if (typeof option === 'string' || typeof option === 'number') {
        // 此处类型自动推导为 string
        return /*#__PURE__*/React.createElement(Radio, {
          key: option.toString(),
          prefixCls: prefixCls,
          disabled: disabled,
          value: option,
          checked: value === option
        }, option);
      }
      // 此处类型自动推导为 { label: string value: string }
      return /*#__PURE__*/React.createElement(Radio, {
        key: `radio-group-value-options-${option.value}`,
        prefixCls: prefixCls,
        disabled: option.disabled || disabled,
        value: option.value,
        checked: value === option.value,
        title: option.title,
        style: option.style,
        className: option.className,
        id: option.id,
        required: option.required
      }, option.label);
    });
  }
  const mergedSize = useSize(customizeSize);
  const [, mergedVertical] = useOrientation(orientation, vertical);
  const classString = clsx(groupPrefixCls, `${groupPrefixCls}-${buttonStyle}`, {
    [`${groupPrefixCls}-${mergedSize}`]: mergedSize,
    [`${groupPrefixCls}-rtl`]: direction === 'rtl',
    [`${groupPrefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls, rootCls);
  const memoizedValue = React.useMemo(() => ({
    onChange: onRadioChange,
    value,
    disabled,
    name,
    optionType,
    block
  }), [onRadioChange, value, disabled, name, optionType, block]);
  return /*#__PURE__*/React.createElement("div", {
    ...pickAttrs(props, {
      aria: true,
      data: true
    }),
    role: role,
    className: clsx(classString, {
      [`${prefixCls}-group-vertical`]: mergedVertical
    }),
    style: style,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onFocus: onFocus,
    onBlur: onBlur,
    id: id,
    ref: ref
  }, /*#__PURE__*/React.createElement(RadioGroupContextProvider, {
    value: memoizedValue
  }, childrenToRender));
});
export default /*#__PURE__*/React.memo(RadioGroup);