import { clsx } from 'clsx';
const _InputStatuses = ['warning', 'error', '', 'success', 'validating'];
export const getStatusClassNames = (prefixCls, status, hasFeedback) => {
  return clsx({
    [`${prefixCls}-status-success`]: status === 'success',
    [`${prefixCls}-status-warning`]: status === 'warning',
    [`${prefixCls}-status-error`]: status === 'error',
    [`${prefixCls}-status-validating`]: status === 'validating',
    [`${prefixCls}-has-feedback`]: hasFeedback
  });
};
export const getMergedStatus = (contextStatus, customStatus) => customStatus || contextStatus;