"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStatusClassNames = exports.getMergedStatus = void 0;
var _clsx = require("clsx");
const _InputStatuses = ['warning', 'error', '', 'success', 'validating'];
const getStatusClassNames = (prefixCls, status, hasFeedback) => {
  return (0, _clsx.clsx)({
    [`${prefixCls}-status-success`]: status === 'success',
    [`${prefixCls}-status-warning`]: status === 'warning',
    [`${prefixCls}-status-error`]: status === 'error',
    [`${prefixCls}-status-validating`]: status === 'validating',
    [`${prefixCls}-has-feedback`]: hasFeedback
  });
};
exports.getStatusClassNames = getStatusClassNames;
const getMergedStatus = (contextStatus, customStatus) => customStatus || contextStatus;
exports.getMergedStatus = getMergedStatus;