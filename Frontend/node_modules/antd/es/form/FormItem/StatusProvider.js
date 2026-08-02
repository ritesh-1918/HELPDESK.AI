"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import { clsx } from 'clsx';
import { FormContext, FormItemInputContext } from '../context';
import { getStatus } from '../util';
const iconMap = {
  success: CheckCircleFilled,
  warning: ExclamationCircleFilled,
  error: CloseCircleFilled,
  validating: LoadingOutlined
};
function StatusProvider({
  children,
  errors,
  warnings,
  hasFeedback,
  validateStatus,
  prefixCls,
  meta,
  noStyle,
  name
}) {
  const itemPrefixCls = `${prefixCls}-item`;
  const {
    feedbackIcons
  } = React.useContext(FormContext);
  const mergedValidateStatus = getStatus(errors, warnings, meta, null, !!hasFeedback, validateStatus);
  const {
    isFormItemInput: parentIsFormItemInput,
    status: parentStatus,
    hasFeedback: parentHasFeedback,
    feedbackIcon: parentFeedbackIcon,
    name: parentName
  } = React.useContext(FormItemInputContext);
  // ====================== Context =======================
  const formItemStatusContext = React.useMemo(() => {
    let feedbackIcon;
    if (hasFeedback) {
      const customIcons = hasFeedback !== true && hasFeedback.icons || feedbackIcons;
      const customIconNode = mergedValidateStatus && customIcons?.({
        status: mergedValidateStatus,
        errors,
        warnings
      })?.[mergedValidateStatus];
      const IconNode = mergedValidateStatus ? iconMap[mergedValidateStatus] : null;
      feedbackIcon = customIconNode !== false && IconNode ? (/*#__PURE__*/React.createElement("span", {
        className: clsx(`${itemPrefixCls}-feedback-icon`, `${itemPrefixCls}-feedback-icon-${mergedValidateStatus}`)
      }, customIconNode || /*#__PURE__*/React.createElement(IconNode, null))) : null;
    }
    const context = {
      status: mergedValidateStatus || '',
      errors,
      warnings,
      hasFeedback: !!hasFeedback,
      feedbackIcon,
      isFormItemInput: true,
      name
    };
    // No style will follow parent context
    if (noStyle) {
      context.status = (mergedValidateStatus ?? parentStatus) || '';
      context.isFormItemInput = parentIsFormItemInput;
      context.hasFeedback = !!(hasFeedback ?? parentHasFeedback);
      context.feedbackIcon = hasFeedback !== undefined ? context.feedbackIcon : parentFeedbackIcon;
      context.name = name ?? parentName;
    }
    return context;
  }, [mergedValidateStatus, hasFeedback, noStyle, parentIsFormItemInput, parentStatus]);
  // ======================= Render =======================
  return /*#__PURE__*/React.createElement(FormItemInputContext.Provider, {
    value: formItemStatusContext
  }, children);
}
export default StatusProvider;