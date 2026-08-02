"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CheckCircleFilled = _interopRequireDefault(require("@ant-design/icons/CheckCircleFilled"));
var _CloseCircleFilled = _interopRequireDefault(require("@ant-design/icons/CloseCircleFilled"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _LoadingOutlined = _interopRequireDefault(require("@ant-design/icons/LoadingOutlined"));
var _clsx = require("clsx");
var _context = require("../context");
var _util = require("../util");
const iconMap = {
  success: _CheckCircleFilled.default,
  warning: _ExclamationCircleFilled.default,
  error: _CloseCircleFilled.default,
  validating: _LoadingOutlined.default
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
  } = React.useContext(_context.FormContext);
  const mergedValidateStatus = (0, _util.getStatus)(errors, warnings, meta, null, !!hasFeedback, validateStatus);
  const {
    isFormItemInput: parentIsFormItemInput,
    status: parentStatus,
    hasFeedback: parentHasFeedback,
    feedbackIcon: parentFeedbackIcon,
    name: parentName
  } = React.useContext(_context.FormItemInputContext);
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
        className: (0, _clsx.clsx)(`${itemPrefixCls}-feedback-icon`, `${itemPrefixCls}-feedback-icon-${mergedValidateStatus}`)
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
  return /*#__PURE__*/React.createElement(_context.FormItemInputContext.Provider, {
    value: formItemStatusContext
  }, children);
}
var _default = exports.default = StatusProvider;