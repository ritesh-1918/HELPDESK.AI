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
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _InfoCircleFilled = _interopRequireDefault(require("@ant-design/icons/InfoCircleFilled"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _style = _interopRequireDefault(require("./style"));
const IconNode = props => {
  const {
    icon,
    type,
    className,
    style,
    successIcon,
    infoIcon,
    warningIcon,
    errorIcon
  } = props;
  const iconMapFilled = {
    success: successIcon ?? /*#__PURE__*/React.createElement(_CheckCircleFilled.default, null),
    info: infoIcon ?? /*#__PURE__*/React.createElement(_InfoCircleFilled.default, null),
    error: errorIcon ?? /*#__PURE__*/React.createElement(_CloseCircleFilled.default, null),
    warning: warningIcon ?? /*#__PURE__*/React.createElement(_ExclamationCircleFilled.default, null)
  };
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: style
  }, icon ?? iconMapFilled[type]);
};
const CloseIconNode = props => {
  const {
    isClosable,
    prefixCls,
    closeIcon,
    handleClose,
    ariaProps,
    className,
    style
  } = props;
  const mergedCloseIcon = closeIcon === true || closeIcon === undefined ? /*#__PURE__*/React.createElement(_CloseOutlined.default, null) : closeIcon;
  return isClosable ? (/*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleClose,
    className: (0, _clsx.clsx)(`${prefixCls}-close-icon`, className),
    tabIndex: 0,
    style: style,
    ...ariaProps
  }, mergedCloseIcon)) : null;
};
const Alert = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    description,
    prefixCls: customizePrefixCls,
    message,
    title,
    banner,
    className,
    rootClassName,
    style,
    onMouseEnter,
    onMouseLeave,
    onClick,
    afterClose,
    showIcon,
    closable,
    closeText,
    closeIcon,
    action,
    id,
    styles,
    classNames,
    ...otherProps
  } = props;
  const mergedTitle = title ?? message;
  const [closed, setClosed] = React.useState(false);
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Alert');
    [['closeText', 'closable.closeIcon'], ['message', 'title']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const internalRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current
  }));
  const {
    getPrefixCls,
    direction,
    closable: contextClosable,
    closeIcon: contextCloseIcon,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    successIcon,
    infoIcon,
    warningIcon,
    errorIcon
  } = (0, _context.useComponentConfig)('alert');
  const prefixCls = getPrefixCls('alert', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const {
    onClose: closableOnClose,
    afterClose: closableAfterClose
  } = closable && typeof closable === 'object' ? closable : {};
  const handleClose = e => {
    setClosed(true);
    (closableOnClose ?? props.onClose)?.(e);
  };
  const type = React.useMemo(() => {
    if (props.type !== undefined) {
      return props.type;
    }
    // banner mode defaults to 'warning'
    return banner ? 'warning' : 'info';
  }, [props.type, banner]);
  // closeable when closeText or closeIcon is assigned
  const isClosable = React.useMemo(() => {
    if (typeof closable === 'object' && closable.closeIcon) {
      return true;
    }
    if (closeText) {
      return true;
    }
    if (typeof closable === 'boolean') {
      return closable;
    }
    // should be true when closeIcon is 0 or ''
    if (closeIcon !== false && (0, _isNonNullable.default)(closeIcon)) {
      return true;
    }
    return !!contextClosable;
  }, [closeText, closeIcon, closable, contextClosable]);
  // banner mode defaults to Icon
  const isShowIcon = banner && showIcon === undefined ? true : showIcon;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    prefixCls,
    type,
    showIcon: isShowIcon,
    closable: isClosable
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const alertCls = (0, _clsx.clsx)(prefixCls, `${prefixCls}-${type}`, {
    [`${prefixCls}-with-description`]: !!description,
    [`${prefixCls}-no-icon`]: !isShowIcon,
    [`${prefixCls}-banner`]: !!banner,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, mergedClassNames.root, cssVarCls, hashId);
  const restProps = (0, _pickAttrs.default)(otherProps, {
    aria: true,
    data: true
  });
  const mergedCloseIcon = React.useMemo(() => {
    if (typeof closable === 'object' && closable.closeIcon) {
      return closable.closeIcon;
    }
    if (closeText) {
      return closeText;
    }
    if (closeIcon !== undefined) {
      return closeIcon;
    }
    if (typeof contextClosable === 'object' && contextClosable.closeIcon) {
      return contextClosable.closeIcon;
    }
    return contextCloseIcon;
  }, [closeIcon, closable, contextClosable, closeText, contextCloseIcon]);
  const mergedAriaProps = React.useMemo(() => {
    const merged = closable ?? contextClosable;
    if (typeof merged === 'object') {
      return (0, _pickAttrs.default)(merged, {
        data: true,
        aria: true
      });
    }
    return {};
  }, [closable, contextClosable]);
  return /*#__PURE__*/React.createElement(_motion.default, {
    visible: !closed,
    motionName: `${prefixCls}-motion`,
    motionAppear: false,
    motionEnter: false,
    onLeaveStart: node => ({
      maxHeight: node.offsetHeight
    }),
    onLeaveEnd: closableAfterClose ?? afterClose
  }, ({
    className: motionClassName,
    style: motionStyle
  }, setRef) => (/*#__PURE__*/React.createElement("div", {
    id: id,
    ref: (0, _ref.composeRef)(internalRef, setRef),
    "data-show": !closed,
    className: (0, _clsx.clsx)(alertCls, motionClassName),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style,
      ...motionStyle
    },
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onClick,
    role: "alert",
    ...restProps
  }, isShowIcon ? (/*#__PURE__*/React.createElement(IconNode, {
    className: (0, _clsx.clsx)(`${prefixCls}-icon`, mergedClassNames.icon),
    style: mergedStyles.icon,
    description: description,
    icon: props.icon,
    prefixCls: prefixCls,
    type: type,
    successIcon: successIcon,
    infoIcon: infoIcon,
    warningIcon: warningIcon,
    errorIcon: errorIcon
  })) : null, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-section`, mergedClassNames.section),
    style: mergedStyles.section
  }, mergedTitle ? (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, mergedClassNames.title),
    style: mergedStyles.title
  }, mergedTitle)) : null, description ? (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-description`, mergedClassNames.description),
    style: mergedStyles.description
  }, description)) : null), action ? (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, mergedClassNames.actions),
    style: mergedStyles.actions
  }, action)) : null, /*#__PURE__*/React.createElement(CloseIconNode, {
    className: mergedClassNames.close,
    style: mergedStyles.close,
    isClosable: isClosable,
    prefixCls: prefixCls,
    closeIcon: mergedCloseIcon,
    handleClose: handleClose,
    ariaProps: mergedAriaProps
  }))));
});
if (process.env.NODE_ENV !== 'production') {
  Alert.displayName = 'Alert';
}
var _default = exports.default = Alert;