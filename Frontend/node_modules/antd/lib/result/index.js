"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IconMap = exports.ExceptionMap = void 0;
var React = _interopRequireWildcard(require("react"));
var _CheckCircleFilled = _interopRequireDefault(require("@ant-design/icons/CheckCircleFilled"));
var _CloseCircleFilled = _interopRequireDefault(require("@ant-design/icons/CloseCircleFilled"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _WarningFilled = _interopRequireDefault(require("@ant-design/icons/WarningFilled"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _noFound = _interopRequireDefault(require("./noFound"));
var _serverError = _interopRequireDefault(require("./serverError"));
var _style = _interopRequireDefault(require("./style"));
var _unauthorized = _interopRequireDefault(require("./unauthorized"));
const IconMap = exports.IconMap = {
  success: _CheckCircleFilled.default,
  error: _CloseCircleFilled.default,
  info: _ExclamationCircleFilled.default,
  warning: _WarningFilled.default
};
const ExceptionMap = exports.ExceptionMap = {
  '404': _noFound.default,
  '500': _serverError.default,
  '403': _unauthorized.default
};
// ExceptionImageMap keys
const ExceptionStatus = Object.keys(ExceptionMap);
const Icon = ({
  icon,
  status,
  className,
  style
}) => {
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Result');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
  }
  if (ExceptionStatus.includes(`${status}`)) {
    const SVGComponent = ExceptionMap[status];
    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: style
    }, /*#__PURE__*/React.createElement(SVGComponent, null));
  }
  const iconNode = /*#__PURE__*/React.createElement(IconMap[status]);
  if (icon === null || icon === false) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, icon || iconNode);
};
const Extra = ({
  className,
  extra,
  style
}) => {
  if (!extra) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, extra);
};
const Result = props => {
  const {
    prefixCls: customizePrefixCls,
    className: customizeClassName,
    rootClassName,
    subTitle,
    title,
    style,
    children,
    status = 'info',
    icon,
    extra,
    styles,
    classNames,
    ...rest
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('result');
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    status
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('result', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const rootClassNames = (0, _clsx.clsx)(prefixCls, `${prefixCls}-${status}`, customizeClassName, contextClassName, rootClassName, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, cssVarCls, mergedClassNames.root);
  const titleClassNames = (0, _clsx.clsx)(`${prefixCls}-title`, mergedClassNames.title);
  const subTitleClassNames = (0, _clsx.clsx)(`${prefixCls}-subtitle`, mergedClassNames.subTitle);
  const extraClassNames = (0, _clsx.clsx)(`${prefixCls}-extra`, mergedClassNames.extra);
  const bodyClassNames = (0, _clsx.clsx)(`${prefixCls}-body`, mergedClassNames.body);
  const iconClassNames = (0, _clsx.clsx)(`${prefixCls}-icon`, {
    [`${prefixCls}-image`]: ExceptionStatus.includes(`${status}`)
  }, mergedClassNames.icon);
  const rootStyles = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const restProps = (0, _pickAttrs.default)(rest, {
    aria: true,
    data: true
  });
  return /*#__PURE__*/React.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: rootStyles
  }, /*#__PURE__*/React.createElement(Icon, {
    className: iconClassNames,
    style: mergedStyles.icon,
    status: status,
    icon: icon
  }), /*#__PURE__*/React.createElement("div", {
    className: titleClassNames,
    style: mergedStyles.title
  }, title), subTitle && (/*#__PURE__*/React.createElement("div", {
    className: subTitleClassNames,
    style: mergedStyles.subTitle
  }, subTitle)), /*#__PURE__*/React.createElement(Extra, {
    className: extraClassNames,
    extra: extra,
    style: mergedStyles.extra
  }), children && (/*#__PURE__*/React.createElement("div", {
    className: bodyClassNames,
    style: mergedStyles.body
  }, children)));
};
Result.PRESENTED_IMAGE_403 = ExceptionMap['403'];
Result.PRESENTED_IMAGE_404 = ExceptionMap['404'];
Result.PRESENTED_IMAGE_500 = ExceptionMap['500'];
if (process.env.NODE_ENV !== 'production') {
  Result.displayName = 'Result';
}
var _default = exports.default = Result;