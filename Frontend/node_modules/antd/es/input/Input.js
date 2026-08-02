"use client";

import React, { forwardRef, useContext, useEffect, useRef } from 'react';
import RcInput from '@rc-component/input';
import { triggerFocus } from "@rc-component/util/es/Dom/focus";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import ContextIsolator from '../_util/ContextIsolator';
import getAllowClear from '../_util/getAllowClear';
import { useMergeSemantic } from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { FormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariants';
import { useCompactItemContext } from '../space/Compact';
import useRemovePasswordTimeout from './hooks/useRemovePasswordTimeout';
import useStyle, { useSharedStyle } from './style';
import { hasPrefixSuffix } from './utils';
export { triggerFocus };
const Input = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    status: customStatus,
    size: customSize,
    disabled: customDisabled,
    onBlur,
    onFocus,
    suffix,
    allowClear,
    addonAfter,
    addonBefore,
    className,
    style,
    styles,
    rootClassName,
    onChange,
    classNames,
    variant: customVariant,
    ...rest
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const {
      deprecated
    } = devUseWarning('Input');
    [['bordered', 'variant'], ['addonAfter', 'Space.Compact'], ['addonBefore', 'Space.Compact']].forEach(([prop, newProp]) => {
      deprecated(!(prop in props), prop, newProp);
    });
  }
  const {
    getPrefixCls,
    direction,
    allowClear: contextAllowClear,
    autoComplete: contextAutoComplete,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('input');
  const prefixCls = getPrefixCls('input', customizePrefixCls);
  const inputRef = useRef(null);
  // Style
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useSharedStyle(prefixCls, rootClassName);
  useStyle(prefixCls, rootCls);
  // ===================== Compact Item =====================
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  // ===================== Size =====================
  const mergedSize = useSize(ctx => customSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ===================== Status =====================
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  // ===================== Focus warning =====================
  const inputHasPrefixSuffix = hasPrefixSuffix(props) || !!hasFeedback;
  const prevHasPrefixSuffix = useRef(inputHasPrefixSuffix);
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Input');
    // biome-ignore lint/correctness/useHookAtTopLevel: Development-only warning hook called conditionally
    useEffect(() => {
      if (inputHasPrefixSuffix && !prevHasPrefixSuffix.current) {
        process.env.NODE_ENV !== "production" ? warning(document.activeElement === inputRef.current?.input, 'usage', `When Input is focused, dynamic add or remove prefix / suffix will make it lose focus caused by dom structure change. Read more: https://ant.design/components/input/#FAQ`) : void 0;
      }
      prevHasPrefixSuffix.current = inputHasPrefixSuffix;
    }, [inputHasPrefixSuffix]);
  }
  /* eslint-enable */
  // ===================== Remove Password value =====================
  const removePasswordTimeout = useRemovePasswordTimeout(inputRef, true);
  const handleBlur = e => {
    removePasswordTimeout();
    onBlur?.(e);
  };
  const handleFocus = e => {
    removePasswordTimeout();
    onFocus?.(e);
  };
  const handleChange = e => {
    removePasswordTimeout();
    onChange?.(e);
  };
  const suffixNode = (hasFeedback || suffix) && (/*#__PURE__*/React.createElement(React.Fragment, null, suffix, hasFeedback && feedbackIcon));
  const mergedAllowClear = getAllowClear(allowClear ?? contextAllowClear);
  const [variant, enableVariantCls] = useVariant('input', customVariant, bordered);
  return /*#__PURE__*/React.createElement(RcInput, {
    ref: composeRef(ref, inputRef),
    prefixCls: prefixCls,
    autoComplete: contextAutoComplete,
    ...rest,
    disabled: mergedDisabled,
    onBlur: handleBlur,
    onFocus: handleFocus,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    styles: mergedStyles,
    suffix: suffixNode,
    allowClear: mergedAllowClear,
    className: clsx(className, rootClassName, cssVarCls, rootCls, compactItemClassnames, contextClassName, mergedClassNames.root),
    onChange: handleChange,
    addonBefore: addonBefore && (/*#__PURE__*/React.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonBefore)),
    addonAfter: addonAfter && (/*#__PURE__*/React.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonAfter)),
    classNames: {
      ...mergedClassNames,
      input: clsx({
        [`${prefixCls}-sm`]: mergedSize === 'small',
        [`${prefixCls}-lg`]: mergedSize === 'large',
        [`${prefixCls}-rtl`]: direction === 'rtl'
      }, mergedClassNames.input, hashId),
      variant: clsx({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, mergedStatus)),
      affixWrapper: clsx({
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
        [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl'
      }, hashId),
      wrapper: clsx({
        [`${prefixCls}-group-rtl`]: direction === 'rtl'
      }, hashId),
      groupWrapper: clsx({
        [`${prefixCls}-group-wrapper-sm`]: mergedSize === 'small',
        [`${prefixCls}-group-wrapper-lg`]: mergedSize === 'large',
        [`${prefixCls}-group-wrapper-rtl`]: direction === 'rtl',
        [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls
      }, getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback), hashId)
    }
  });
});
if (process.env.NODE_ENV !== 'production') {
  Input.displayName = 'Input';
}
export default Input;