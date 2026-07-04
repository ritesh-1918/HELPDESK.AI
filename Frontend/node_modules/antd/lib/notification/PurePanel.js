"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TypeIcon = exports.PureContent = void 0;
exports.getCloseIcon = getCloseIcon;
var React = _interopRequireWildcard(require("react"));
var _CheckCircleFilled = _interopRequireDefault(require("@ant-design/icons/CheckCircleFilled"));
var _CloseCircleFilled = _interopRequireDefault(require("@ant-design/icons/CloseCircleFilled"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _InfoCircleFilled = _interopRequireDefault(require("@ant-design/icons/InfoCircleFilled"));
var _LoadingOutlined = _interopRequireDefault(require("@ant-design/icons/LoadingOutlined"));
var _notification = require("@rc-component/notification");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _style = _interopRequireDefault(require("./style"));
var _purePanel = _interopRequireDefault(require("./style/pure-panel"));
const TypeIcon = exports.TypeIcon = {
  info: /*#__PURE__*/React.createElement(_InfoCircleFilled.default, null),
  success: /*#__PURE__*/React.createElement(_CheckCircleFilled.default, null),
  error: /*#__PURE__*/React.createElement(_CloseCircleFilled.default, null),
  warning: /*#__PURE__*/React.createElement(_ExclamationCircleFilled.default, null),
  loading: /*#__PURE__*/React.createElement(_LoadingOutlined.default, null)
};
function getCloseIcon(prefixCls, closeIcon) {
  if (closeIcon === null || closeIcon === false) {
    return null;
  }
  return closeIcon || /*#__PURE__*/React.createElement(_CloseOutlined.default, {
    className: `${prefixCls}-close-icon`
  });
}
const typeToIcon = {
  success: _CheckCircleFilled.default,
  info: _InfoCircleFilled.default,
  error: _CloseCircleFilled.default,
  warning: _ExclamationCircleFilled.default
};
const PureContent = props => {
  const {
    prefixCls,
    icon,
    type,
    title,
    description,
    actions,
    role = 'alert',
    styles,
    classNames: pureContentCls
  } = props;
  let iconNode = null;
  if (icon) {
    iconNode = /*#__PURE__*/React.createElement("span", {
      className: (0, _clsx.clsx)(`${prefixCls}-icon`, pureContentCls.icon),
      style: styles.icon
    }, icon);
  } else if (type) {
    iconNode = /*#__PURE__*/React.createElement(typeToIcon[type] || null, {
      className: (0, _clsx.clsx)(`${prefixCls}-icon`, pureContentCls.icon, `${prefixCls}-icon-${type}`),
      style: styles.icon
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)({
      [`${prefixCls}-with-icon`]: iconNode
    }),
    role: role
  }, iconNode, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, pureContentCls.title),
    style: styles.title
  }, title), description && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-description`, pureContentCls.description),
    style: styles.description
  }, description)), actions && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, pureContentCls.actions),
    style: styles.actions
  }, actions)));
};
/** @private Internal Component. Do not use in your production. */
exports.PureContent = PureContent;
const PurePanel = props => {
  const {
    prefixCls: staticPrefixCls,
    icon,
    type,
    message,
    title,
    description,
    btn,
    actions,
    closeIcon: _closeIcon,
    className: notificationClassName,
    style,
    styles,
    classNames: notificationClassNames,
    closable,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('notification');
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, notificationClassNames], [contextStyles, styles], {
    props
  });
  const {
    notification: notificationContext
  } = React.useContext(_configProvider.ConfigContext);
  const mergedActions = actions ?? btn;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Notification');
    [['btn', 'actions'], ['message', 'title']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const mergedTitle = title ?? message;
  const prefixCls = staticPrefixCls || getPrefixCls('notification');
  const noticePrefixCls = `${prefixCls}-notice`;
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const [rawClosable, mergedCloseIcon,, ariaProps] = (0, _hooks.useClosable)((0, _hooks.pickClosable)(props), (0, _hooks.pickClosable)(notificationContext), {
    closable: true,
    closeIcon: /*#__PURE__*/React.createElement(_CloseOutlined.default, {
      className: `${prefixCls}-close-icon`
    }),
    closeIconRender: icon => getCloseIcon(prefixCls, icon)
  });
  const mergedClosable = rawClosable ? {
    onClose: closable && typeof closable === 'object' ? closable?.onClose : undefined,
    closeIcon: mergedCloseIcon,
    ...ariaProps
  } : false;
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${noticePrefixCls}-pure-panel`, hashId, notificationClassName, cssVarCls, rootCls, mergedClassNames.root),
    style: mergedStyles.root
  }, /*#__PURE__*/React.createElement(_purePanel.default, {
    prefixCls: prefixCls
  }), /*#__PURE__*/React.createElement(_notification.Notice, {
    style: {
      ...contextStyle,
      ...style
    },
    ...restProps,
    prefixCls: prefixCls,
    eventKey: "pure",
    duration: null,
    closable: mergedClosable,
    className: (0, _clsx.clsx)(notificationClassName, contextClassName),
    content: /*#__PURE__*/React.createElement(PureContent, {
      classNames: mergedClassNames,
      styles: mergedStyles,
      prefixCls: noticePrefixCls,
      icon: icon,
      type: type,
      title: mergedTitle,
      description: description,
      actions: mergedActions
    })
  }));
};
var _default = exports.default = PurePanel;