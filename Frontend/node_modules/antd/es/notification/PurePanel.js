"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import InfoCircleFilled from "@ant-design/icons/es/icons/InfoCircleFilled";
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import { Notice } from '@rc-component/notification';
import { clsx } from 'clsx';
import { pickClosable, useClosable, useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import PurePanelStyle from './style/pure-panel';
export const TypeIcon = {
  info: /*#__PURE__*/React.createElement(InfoCircleFilled, null),
  success: /*#__PURE__*/React.createElement(CheckCircleFilled, null),
  error: /*#__PURE__*/React.createElement(CloseCircleFilled, null),
  warning: /*#__PURE__*/React.createElement(ExclamationCircleFilled, null),
  loading: /*#__PURE__*/React.createElement(LoadingOutlined, null)
};
export function getCloseIcon(prefixCls, closeIcon) {
  if (closeIcon === null || closeIcon === false) {
    return null;
  }
  return closeIcon || /*#__PURE__*/React.createElement(CloseOutlined, {
    className: `${prefixCls}-close-icon`
  });
}
const typeToIcon = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled
};
export const PureContent = props => {
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
      className: clsx(`${prefixCls}-icon`, pureContentCls.icon),
      style: styles.icon
    }, icon);
  } else if (type) {
    iconNode = /*#__PURE__*/React.createElement(typeToIcon[type] || null, {
      className: clsx(`${prefixCls}-icon`, pureContentCls.icon, `${prefixCls}-icon-${type}`),
      style: styles.icon
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: clsx({
      [`${prefixCls}-with-icon`]: iconNode
    }),
    role: role
  }, iconNode, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, pureContentCls.title),
    style: styles.title
  }, title), description && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, pureContentCls.description),
    style: styles.description
  }, description)), actions && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-actions`, pureContentCls.actions),
    style: styles.actions
  }, actions)));
};
/** @private Internal Component. Do not use in your production. */
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
  } = useComponentConfig('notification');
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, notificationClassNames], [contextStyles, styles], {
    props
  });
  const {
    notification: notificationContext
  } = React.useContext(ConfigContext);
  const mergedActions = actions ?? btn;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Notification');
    [['btn', 'actions'], ['message', 'title']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const mergedTitle = title ?? message;
  const prefixCls = staticPrefixCls || getPrefixCls('notification');
  const noticePrefixCls = `${prefixCls}-notice`;
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const [rawClosable, mergedCloseIcon,, ariaProps] = useClosable(pickClosable(props), pickClosable(notificationContext), {
    closable: true,
    closeIcon: /*#__PURE__*/React.createElement(CloseOutlined, {
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
    className: clsx(`${noticePrefixCls}-pure-panel`, hashId, notificationClassName, cssVarCls, rootCls, mergedClassNames.root),
    style: mergedStyles.root
  }, /*#__PURE__*/React.createElement(PurePanelStyle, {
    prefixCls: prefixCls
  }), /*#__PURE__*/React.createElement(Notice, {
    style: {
      ...contextStyle,
      ...style
    },
    ...restProps,
    prefixCls: prefixCls,
    eventKey: "pure",
    duration: null,
    closable: mergedClosable,
    className: clsx(notificationClassName, contextClassName),
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
export default PurePanel;