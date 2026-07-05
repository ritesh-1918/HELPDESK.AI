"use client";

import * as React from 'react';
import { omit } from '@rc-component/util';
import isVisible from "@rc-component/util/es/Dom/isVisible";
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { clsx } from 'clsx';
import isNonNullable from '../../_util/isNonNullable';
import { Row } from '../../grid';
import { FormContext, NoStyleItemContext } from '../context';
import FormItemInput from '../FormItemInput';
import FormItemLabel from '../FormItemLabel';
import useDebounce from '../hooks/useDebounce';
import { getStatus } from '../util';
import StatusProvider from './StatusProvider';
export default function ItemHolder(props) {
  const {
    prefixCls,
    className,
    rootClassName,
    style,
    help,
    errors,
    warnings,
    validateStatus,
    meta,
    hasFeedback,
    hidden,
    children,
    fieldId,
    required,
    isRequired,
    onSubItemMetaChange,
    layout: propsLayout,
    name,
    ...restProps
  } = props;
  const itemPrefixCls = `${prefixCls}-item`;
  const {
    requiredMark,
    layout: formLayout
  } = React.useContext(FormContext);
  const layout = propsLayout || formLayout;
  const vertical = layout === 'vertical';
  // ======================== Margin ========================
  const itemRef = React.useRef(null);
  const debounceErrors = useDebounce(errors);
  const debounceWarnings = useDebounce(warnings);
  const hasHelp = isNonNullable(help);
  const hasError = !!(hasHelp || errors.length || warnings.length);
  const isOnScreen = !!itemRef.current && isVisible(itemRef.current);
  const [marginBottom, setMarginBottom] = React.useState(null);
  useLayoutEffect(() => {
    if (hasError && itemRef.current) {
      // The element must be part of the DOMTree to use getComputedStyle
      // https://stackoverflow.com/questions/35360711/getcomputedstyle-returns-a-cssstyledeclaration-but-all-properties-are-empty-on-a
      const itemStyle = getComputedStyle(itemRef.current);
      setMarginBottom(Number.parseInt(itemStyle.marginBottom, 10));
    }
  }, [hasError, isOnScreen]);
  const onErrorVisibleChanged = nextVisible => {
    if (!nextVisible) {
      setMarginBottom(null);
    }
  };
  // ======================== Status ========================
  const getValidateState = (isDebounce = false) => {
    const _errors = isDebounce ? debounceErrors : meta.errors;
    const _warnings = isDebounce ? debounceWarnings : meta.warnings;
    return getStatus(_errors, _warnings, meta, '', !!hasFeedback, validateStatus);
  };
  const mergedValidateStatus = getValidateState();
  // ======================== Render ========================
  const itemClassName = clsx(itemPrefixCls, className, rootClassName, {
    [`${itemPrefixCls}-with-help`]: hasHelp || debounceErrors.length || debounceWarnings.length,
    // Status
    [`${itemPrefixCls}-has-feedback`]: mergedValidateStatus && hasFeedback,
    [`${itemPrefixCls}-has-success`]: mergedValidateStatus === 'success',
    [`${itemPrefixCls}-has-warning`]: mergedValidateStatus === 'warning',
    [`${itemPrefixCls}-has-error`]: mergedValidateStatus === 'error',
    [`${itemPrefixCls}-is-validating`]: mergedValidateStatus === 'validating',
    [`${itemPrefixCls}-hidden`]: hidden,
    // Layout
    [`${itemPrefixCls}-${layout}`]: layout
  });
  return /*#__PURE__*/React.createElement("div", {
    className: itemClassName,
    style: style,
    ref: itemRef
  }, /*#__PURE__*/React.createElement(Row, {
    className: `${itemPrefixCls}-row`,
    ...omit(restProps, ['_internalItemRender', 'colon', 'dependencies', 'extra', 'fieldKey', 'getValueFromEvent', 'getValueProps', 'htmlFor', 'id',
    // It is deprecated because `htmlFor` is its replacement.
    'initialValue', 'isListField', 'label', 'labelAlign', 'labelCol', 'labelWrap', 'messageVariables', 'name', 'normalize', 'noStyle', 'preserve', 'requiredMark', 'rules', 'shouldUpdate', 'trigger', 'tooltip', 'validateFirst', 'validateTrigger', 'valuePropName', 'wrapperCol', 'validateDebounce'])
  }, /*#__PURE__*/React.createElement(FormItemLabel, {
    htmlFor: fieldId,
    ...props,
    requiredMark: requiredMark,
    required: required ?? isRequired,
    prefixCls: prefixCls,
    vertical: vertical
  }), /*#__PURE__*/React.createElement(FormItemInput, {
    ...props,
    ...meta,
    errors: debounceErrors,
    warnings: debounceWarnings,
    prefixCls: prefixCls,
    status: mergedValidateStatus,
    help: help,
    marginBottom: marginBottom,
    onErrorVisibleChanged: onErrorVisibleChanged
  }, /*#__PURE__*/React.createElement(NoStyleItemContext.Provider, {
    value: onSubItemMetaChange
  }, /*#__PURE__*/React.createElement(StatusProvider, {
    prefixCls: prefixCls,
    meta: meta,
    errors: meta.errors,
    warnings: meta.warnings,
    hasFeedback: hasFeedback,
    // Already calculated
    validateStatus: mergedValidateStatus,
    name: name
  }, children)))), !!marginBottom && (/*#__PURE__*/React.createElement("div", {
    className: `${itemPrefixCls}-margin-offset`,
    style: {
      marginBottom: -marginBottom
    }
  })));
}