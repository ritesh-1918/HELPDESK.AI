"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TypeIcon = exports.PureContent = void 0;
var React = _interopRequireWildcard(require("react"));
var _CheckCircleFilled = _interopRequireDefault(require("@ant-design/icons/CheckCircleFilled"));
var _CloseCircleFilled = _interopRequireDefault(require("@ant-design/icons/CloseCircleFilled"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _InfoCircleFilled = _interopRequireDefault(require("@ant-design/icons/InfoCircleFilled"));
var _LoadingOutlined = _interopRequireDefault(require("@ant-design/icons/LoadingOutlined"));
var _notification = require("@rc-component/notification");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _reactNode = require("../_util/reactNode");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _style = _interopRequireDefault(require("./style"));
const TypeIcon = exports.TypeIcon = {
  info: /*#__PURE__*/React.createElement(_InfoCircleFilled.default, null),
  success: /*#__PURE__*/React.createElement(_CheckCircleFilled.default, null),
  error: /*#__PURE__*/React.createElement(_CloseCircleFilled.default, null),
  warning: /*#__PURE__*/React.createElement(_ExclamationCircleFilled.default, null),
  loading: /*#__PURE__*/React.createElement(_LoadingOutlined.default, null)
};
const PureContent = props => {
  const {
    prefixCls,
    type,
    icon,
    children,
    classNames: pureContentClassNames,
    styles
  } = props;
  const iconElement = icon || type && TypeIcon[type];
  const iconNode = (0, _reactNode.cloneElement)(iconElement, currentProps => {
    const mergedStyle = {
      ...currentProps?.style,
      ...styles?.icon
    };
    return {
      className: (0, _clsx.clsx)(currentProps.className, pureContentClassNames?.icon),
      style: mergedStyle
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-custom-content`, `${prefixCls}-${type}`)
  }, iconNode, /*#__PURE__*/React.createElement("span", {
    className: pureContentClassNames?.content,
    style: styles?.content
  }, children));
};
/** @private Internal Component. Do not use in your production. */
exports.PureContent = PureContent;
const PurePanel = props => {
  const {
    prefixCls: staticPrefixCls,
    className,
    style,
    type,
    icon,
    content,
    classNames: messageClassNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('message');
  const prefixCls = staticPrefixCls || getPrefixCls('message');
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, messageClassNames], [contextStyles, styles], {
    props
  });
  return /*#__PURE__*/React.createElement(_notification.Notice, {
    ...restProps,
    prefixCls: prefixCls,
    className: (0, _clsx.clsx)(contextClassName, mergedClassNames.root, className, hashId, `${prefixCls}-notice-pure-panel`, cssVarCls, rootCls),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    eventKey: "pure",
    duration: null,
    content: /*#__PURE__*/React.createElement(PureContent, {
      prefixCls: prefixCls,
      type: type,
      icon: icon,
      classNames: mergedClassNames,
      styles: mergedStyles
    }, content)
  });
};
var _default = exports.default = PurePanel;