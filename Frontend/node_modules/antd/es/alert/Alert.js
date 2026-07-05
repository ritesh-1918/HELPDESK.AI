"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import InfoCircleFilled from "@ant-design/icons/es/icons/InfoCircleFilled";
import CSSMotion from '@rc-component/motion';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';
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
    success: successIcon ?? /*#__PURE__*/React.createElement(CheckCircleFilled, null),
    info: infoIcon ?? /*#__PURE__*/React.createElement(InfoCircleFilled, null),
    error: errorIcon ?? /*#__PURE__*/React.createElement(CloseCircleFilled, null),
    warning: warningIcon ?? /*#__PURE__*/React.createElement(ExclamationCircleFilled, null)
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
  const mergedCloseIcon = closeIcon === true || closeIcon === undefined ? /*#__PURE__*/React.createElement(CloseOutlined, null) : closeIcon;
  return isClosable ? (/*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleClose,
    className: clsx(`${prefixCls}-close-icon`, className),
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
    const warning = devUseWarning('Alert');
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
  } = useComponentConfig('alert');
  const prefixCls = getPrefixCls('alert', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
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
    if (closeIcon !== false && isNonNullable(closeIcon)) {
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
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const alertCls = clsx(prefixCls, `${prefixCls}-${type}`, {
    [`${prefixCls}-with-description`]: !!description,
    [`${prefixCls}-no-icon`]: !isShowIcon,
    [`${prefixCls}-banner`]: !!banner,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, mergedClassNames.root, cssVarCls, hashId);
  const restProps = pickAttrs(otherProps, {
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
      return pickAttrs(merged, {
        data: true,
        aria: true
      });
    }
    return {};
  }, [closable, contextClosable]);
  return /*#__PURE__*/React.createElement(CSSMotion, {
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
    ref: composeRef(internalRef, setRef),
    "data-show": !closed,
    className: clsx(alertCls, motionClassName),
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
    className: clsx(`${prefixCls}-icon`, mergedClassNames.icon),
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
    className: clsx(`${prefixCls}-section`, mergedClassNames.section),
    style: mergedStyles.section
  }, mergedTitle ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, mergedClassNames.title),
    style: mergedStyles.title
  }, mergedTitle)) : null, description ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, mergedClassNames.description),
    style: mergedStyles.description
  }, description)) : null), action ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-actions`, mergedClassNames.actions),
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
export default Alert;