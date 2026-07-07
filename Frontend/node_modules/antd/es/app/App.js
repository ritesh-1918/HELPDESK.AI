"use client";

import React, { useContext } from 'react';
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useMessage from '../message/useMessage';
import useModal from '../modal/useModal';
import useNotification from '../notification/useNotification';
import AppContext, { AppConfigContext } from './context';
import useStyle from './style';
const App = props => {
  const {
    prefixCls: customizePrefixCls,
    children,
    className,
    rootClassName,
    message,
    notification,
    style,
    component = 'div'
  } = props;
  const {
    direction,
    getPrefixCls,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('app');
  const prefixCls = getPrefixCls('app', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const customClassName = clsx(hashId, prefixCls, className, rootClassName, cssVarCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  });
  const appConfig = useContext(AppConfigContext);
  const mergedAppConfig = React.useMemo(() => ({
    message: {
      ...appConfig.message,
      ...message
    },
    notification: {
      ...appConfig.notification,
      ...notification
    }
  }), [message, notification, appConfig.message, appConfig.notification]);
  const [messageApi, messageContextHolder] = useMessage(mergedAppConfig.message);
  const [notificationApi, notificationContextHolder] = useNotification(mergedAppConfig.notification);
  const [ModalApi, ModalContextHolder] = useModal();
  const memoizedContextValue = React.useMemo(() => ({
    message: messageApi,
    notification: notificationApi,
    modal: ModalApi
  }), [messageApi, notificationApi, ModalApi]);
  // https://github.com/ant-design/ant-design/issues/48802#issuecomment-2097813526
  devUseWarning('App')(!(cssVarCls && component === false), 'usage', 'When using cssVar, ensure `component` is assigned a valid React component string.');
  // ============================ Render ============================
  const Component = component === false ? React.Fragment : component;
  const rootProps = {
    className: clsx(contextClassName, customClassName),
    style: {
      ...contextStyle,
      ...style
    }
  };
  return /*#__PURE__*/React.createElement(AppContext.Provider, {
    value: memoizedContextValue
  }, /*#__PURE__*/React.createElement(AppConfigContext.Provider, {
    value: mergedAppConfig
  }, /*#__PURE__*/React.createElement(Component, {
    ...(component === false ? undefined : rootProps)
  }, ModalContextHolder, messageContextHolder, notificationContextHolder, children)));
};
if (process.env.NODE_ENV !== 'production') {
  App.displayName = 'App';
}
export default App;