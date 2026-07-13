"use client";

import * as React from 'react';
import FieldForm, { List, useWatch } from '@rc-component/form';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext, { DisabledContextProvider } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import SizeContext from '../config-provider/SizeContext';
import { FormContext, FormProvider, NoFormStyle, VariantContext } from './context';
import useForm from './hooks/useForm';
import useFormWarning from './hooks/useFormWarning';
import useStyle from './style';
import ValidateMessagesContext from './validateMessagesContext';
const InternalForm = (props, ref) => {
  const contextDisabled = React.useContext(DisabledContext);
  const {
    getPrefixCls,
    direction,
    requiredMark: contextRequiredMark,
    colon: contextColon,
    scrollToFirstError: contextScrollToFirstError,
    className: contextClassName,
    style: contextStyle,
    styles: contextStyles,
    classNames: contextClassNames,
    tooltip: contextTooltip
  } = useComponentConfig('form');
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    size,
    disabled = contextDisabled,
    form,
    colon,
    labelAlign,
    labelWrap,
    labelCol,
    wrapperCol,
    layout = 'horizontal',
    scrollToFirstError,
    requiredMark,
    onFinishFailed,
    name,
    style,
    feedbackIcons,
    variant,
    classNames,
    styles,
    tooltip,
    ...restFormProps
  } = props;
  const mergedSize = useSize(size);
  const contextValidateMessages = React.useContext(ValidateMessagesContext);
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    // biome-ignore lint/correctness/useHookAtTopLevel: Development-only warning hook called conditionally
    useFormWarning(props);
  }
  /* eslint-enable */
  const mergedRequiredMark = React.useMemo(() => {
    if (requiredMark !== undefined) {
      return requiredMark;
    }
    if (contextRequiredMark !== undefined) {
      return contextRequiredMark;
    }
    return true;
  }, [requiredMark, contextRequiredMark]);
  const mergedColon = colon ?? contextColon;
  const mergedTooltip = {
    ...contextTooltip,
    ...tooltip
  };
  const prefixCls = getPrefixCls('form', customizePrefixCls);
  // Style
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled,
    layout,
    colon: mergedColon,
    requiredMark: mergedRequiredMark
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const formClassName = clsx(prefixCls, `${prefixCls}-${layout}`, {
    [`${prefixCls}-hide-required-mark`]: mergedRequiredMark === false,
    // todo: remove in next major version
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-${mergedSize}`]: mergedSize
  }, cssVarCls, rootCls, hashId, contextClassName, className, rootClassName, mergedClassNames.root);
  const [wrapForm] = useForm(form);
  const {
    __INTERNAL__
  } = wrapForm;
  __INTERNAL__.name = name;
  const formContextValue = React.useMemo(() => ({
    name,
    labelAlign,
    labelCol,
    labelWrap,
    wrapperCol,
    layout,
    colon: mergedColon,
    requiredMark: mergedRequiredMark,
    itemRef: __INTERNAL__.itemRef,
    form: wrapForm,
    feedbackIcons,
    tooltip: mergedTooltip,
    classNames: mergedClassNames,
    styles: mergedStyles
  }), [name, labelAlign, labelCol, wrapperCol, layout, mergedColon, mergedRequiredMark, wrapForm, feedbackIcons, mergedClassNames, mergedStyles, mergedTooltip]);
  const nativeElementRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    ...wrapForm,
    nativeElement: nativeElementRef.current?.nativeElement
  }));
  const scrollToField = (options, fieldName) => {
    if (options) {
      let defaultScrollToFirstError = {
        block: 'nearest'
      };
      if (typeof options === 'object') {
        defaultScrollToFirstError = {
          ...defaultScrollToFirstError,
          ...options
        };
      }
      wrapForm.scrollToField(fieldName, defaultScrollToFirstError);
    }
  };
  const onInternalFinishFailed = errorInfo => {
    onFinishFailed?.(errorInfo);
    if (errorInfo.errorFields.length) {
      const fieldName = errorInfo.errorFields[0].name;
      if (scrollToFirstError !== undefined) {
        scrollToField(scrollToFirstError, fieldName);
        return;
      }
      if (contextScrollToFirstError !== undefined) {
        scrollToField(contextScrollToFirstError, fieldName);
      }
    }
  };
  return /*#__PURE__*/React.createElement(VariantContext.Provider, {
    value: variant
  }, /*#__PURE__*/React.createElement(DisabledContextProvider, {
    disabled: disabled
  }, /*#__PURE__*/React.createElement(SizeContext.Provider, {
    value: mergedSize
  }, /*#__PURE__*/React.createElement(FormProvider, {
    // This is not list in API, we pass with spread
    validateMessages: contextValidateMessages
  }, /*#__PURE__*/React.createElement(FormContext.Provider, {
    value: formContextValue
  }, /*#__PURE__*/React.createElement(NoFormStyle, {
    status: true
  }, /*#__PURE__*/React.createElement(FieldForm, {
    id: name,
    ...restFormProps,
    name: name,
    onFinishFailed: onInternalFinishFailed,
    form: wrapForm,
    ref: nativeElementRef,
    style: {
      ...mergedStyles?.root,
      ...contextStyle,
      ...style
    },
    className: formClassName
  })))))));
};
const Form = /*#__PURE__*/React.forwardRef(InternalForm);
if (process.env.NODE_ENV !== 'production') {
  Form.displayName = 'Form';
}
export { List, useForm, useWatch };
export default Form;