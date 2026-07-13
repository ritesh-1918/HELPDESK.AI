"use client";

import * as React from 'react';
import RcCheckbox from '@rc-component/checkbox';
import { useControlledState, useEvent } from '@rc-component/util';
import { useComposeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import Wave from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { FormItemInputContext } from '../form/context';
import GroupContext from './GroupContext';
import useStyle from './style';
import useBubbleLock from './useBubbleLock';
const InternalCheckbox = (props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    children,
    indeterminate = false,
    onMouseEnter,
    onMouseLeave,
    skipGroup = false,
    disabled,
    // Style
    rootClassName,
    className,
    style,
    classNames,
    styles,
    // Name
    name,
    // Value
    value,
    // Checked
    checked,
    defaultChecked,
    onChange,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('checkbox');
  const checkboxGroup = React.useContext(GroupContext);
  const {
    isFormItemInput
  } = React.useContext(FormItemInputContext);
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = (checkboxGroup?.disabled || disabled) ?? contextDisabled;
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Checkbox');
    process.env.NODE_ENV !== "production" ? warning('checked' in props || !!checkboxGroup || !('value' in props), 'usage', '`value` is not a valid prop, do you mean `checked`?') : void 0;
  }
  // ============================= Checked ==============================
  const [innerChecked, setInnerChecked] = useControlledState(defaultChecked, checked);
  let mergedChecked = innerChecked;
  const onInternalChange = useEvent(event => {
    setInnerChecked(event.target.checked);
    onChange?.(event);
    if (!skipGroup && checkboxGroup?.toggleOption) {
      checkboxGroup.toggleOption({
        label: children,
        value
      });
    }
  });
  // ============================== Group ===============================
  if (checkboxGroup && !skipGroup) {
    mergedChecked = checkboxGroup.value.includes(value);
  }
  const checkboxRef = React.useRef(null);
  const mergedRef = useComposeRef(ref, checkboxRef);
  React.useEffect(() => {
    if (skipGroup || !checkboxGroup) {
      return;
    }
    checkboxGroup.registerValue(value);
    return () => {
      checkboxGroup.cancelValue(value);
    };
  }, [value, skipGroup]);
  // ========================== Indeterminate ===========================
  React.useEffect(() => {
    if (checkboxRef.current?.input) {
      checkboxRef.current.input.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  // ============================== Style ===============================
  const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const checkboxProps = {
    ...restProps
  };
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    indeterminate,
    disabled: mergedDisabled,
    checked: mergedChecked
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const classString = clsx(`${prefixCls}-wrapper`, {
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-wrapper-checked`]: mergedChecked,
    [`${prefixCls}-wrapper-disabled`]: mergedDisabled,
    [`${prefixCls}-wrapper-in-form-item`]: isFormItemInput
  }, contextClassName, className, mergedClassNames.root, rootClassName, cssVarCls, rootCls, hashId);
  const checkboxClass = clsx(mergedClassNames.icon, {
    [`${prefixCls}-indeterminate`]: indeterminate
  }, TARGET_CLS, hashId);
  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = useBubbleLock(checkboxProps.onClick);
  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement(Wave, {
    component: "Checkbox",
    disabled: mergedDisabled
  }, /*#__PURE__*/React.createElement("label", {
    className: classString,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onLabelClick
  }, /*#__PURE__*/React.createElement(RcCheckbox, {
    ...checkboxProps,
    name: !skipGroup && checkboxGroup ? checkboxGroup.name : name,
    checked: mergedChecked,
    onClick: onInputClick,
    onChange: onInternalChange,
    prefixCls: prefixCls,
    className: checkboxClass,
    style: mergedStyles.icon,
    disabled: mergedDisabled,
    ref: mergedRef,
    value: value
  }), isNonNullable(children) && (/*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}-label`, mergedClassNames.label),
    style: mergedStyles.label
  }, children))));
};
const Checkbox = /*#__PURE__*/React.forwardRef(InternalCheckbox);
if (process.env.NODE_ENV !== 'production') {
  Checkbox.displayName = 'Checkbox';
}
export default Checkbox;