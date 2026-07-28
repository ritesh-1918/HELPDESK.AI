"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import React, { useImperativeHandle, useMemo } from 'react';
import { useControlledState } from '@rc-component/util';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import CheckableTag from './CheckableTag';
import useStyle from './style';
function CheckableTagGroup(props, ref) {
  const {
    id,
    prefixCls: customizePrefixCls,
    rootClassName,
    className,
    style,
    classNames,
    styles,
    disabled,
    options,
    value,
    defaultValue,
    onChange,
    multiple,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('tag');
  const prefixCls = getPrefixCls('tag', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-checkable-group`;
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  // ====================== Styles ======================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  // =============================== Option ===============================
  const parsedOptions = useMemo(() => (options || []).map(option => {
    if (option && typeof option === 'object') {
      return option;
    }
    return {
      value: option,
      label: option
    };
  }), [options]);
  // =============================== Values ===============================
  const [mergedValue, setMergedValue] = useControlledState(defaultValue, value);
  const handleChange = (checked, option) => {
    let newValue = null;
    if (multiple) {
      const valueList = mergedValue || [];
      newValue = checked ? [].concat(_toConsumableArray(valueList), [option.value]) : valueList.filter(item => item !== option.value);
    } else {
      newValue = checked ? option.value : null;
    }
    setMergedValue(newValue);
    onChange?.(newValue); // TS not support generic type in function call
  };
  // ================================ Refs ================================
  const divRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    nativeElement: divRef.current
  }));
  // ================================ ARIA ================================
  const ariaProps = pickAttrs(restProps, {
    aria: true,
    data: true
  });
  // =============================== Render ===============================
  return /*#__PURE__*/React.createElement("div", {
    ...ariaProps,
    className: clsx(groupPrefixCls, contextClassName, rootClassName, {
      [`${groupPrefixCls}-disabled`]: disabled,
      [`${groupPrefixCls}-rtl`]: direction === 'rtl'
    }, hashId, cssVarCls, className, mergedClassNames.root),
    style: {
      ...contextStyle,
      ...mergedStyles.root,
      ...style
    },
    id: id,
    ref: divRef
  }, parsedOptions.map(option => (/*#__PURE__*/React.createElement(CheckableTag, {
    key: option.value,
    className: clsx(`${groupPrefixCls}-item`, mergedClassNames.item),
    style: mergedStyles.item,
    checked: multiple ? (mergedValue || []).includes(option.value) : mergedValue === option.value,
    onChange: checked => handleChange(checked, option),
    disabled: disabled
  }, option.label))));
}
const ForwardCheckableTagGroup = /*#__PURE__*/React.forwardRef(CheckableTagGroup);
if (process.env.NODE_ENV !== 'production') {
  ForwardCheckableTagGroup.displayName = 'CheckableTagGroup';
}
export default ForwardCheckableTagGroup;