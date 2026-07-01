"use client";

import * as React from 'react';
import { NotificationProvider, useNotification as useRcNotification } from '@rc-component/notification';
import { clsx } from 'clsx';
import { mergeClassNames, mergeStyles, resolveStyleOrClass, useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { PureContent } from './PurePanel';
import useStyle from './style';
import { getMotion, wrapPromiseFn } from './util';
const DEFAULT_OFFSET = 8;
const DEFAULT_DURATION = 3;
const Wrapper = ({
  children,
  prefixCls
}) => {
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  return /*#__PURE__*/React.createElement(NotificationProvider, {
    classNames: {
      list: clsx(hashId, cssVarCls, rootCls)
    }
  }, children);
};
const renderNotifications = (node, {
  prefixCls,
  key
}) => (/*#__PURE__*/React.createElement(Wrapper, {
  prefixCls: prefixCls,
  key: key
}, node));
const Holder = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    top,
    prefixCls: staticPrefixCls,
    getContainer: staticGetContainer,
    maxCount,
    duration = DEFAULT_DURATION,
    rtl,
    transitionName,
    onAllRemoved,
    pauseOnHover = true
  } = props;
  const {
    getPrefixCls,
    direction,
    getPopupContainer
  } = useComponentConfig('message');
  const {
    message
  } = React.useContext(ConfigContext);
  const prefixCls = staticPrefixCls || getPrefixCls('message');
  // =============================== Style ===============================
  const getStyle = () => ({
    left: '50%',
    transform: 'translateX(-50%)',
    top: top ?? DEFAULT_OFFSET
  });
  const getClassName = () => clsx({
    [`${prefixCls}-rtl`]: rtl ?? direction === 'rtl'
  });
  // ============================== Motion ===============================
  const getNotificationMotion = () => getMotion(prefixCls, transitionName);
  // Use useMergeSemantic to merge classNames and styles
  const [mergedClassNames, mergedStyles] = useMergeSemantic([props?.classNames, message?.classNames], [props?.styles, message?.styles], {
    props
  });
  // ============================== Origin ===============================
  const [api, holder] = useRcNotification({
    prefixCls,
    style: getStyle,
    className: getClassName,
    motion: getNotificationMotion,
    // closable=false requires-no closeIcon
    closable: false,
    duration,
    getContainer: () => staticGetContainer?.() || getPopupContainer?.() || document.body,
    maxCount,
    onAllRemoved,
    renderNotifications,
    pauseOnHover
  });
  // ================================ Ref ================================
  React.useImperativeHandle(ref, () => ({
    ...api,
    prefixCls,
    message,
    classNames: mergedClassNames,
    styles: mergedStyles
  }));
  return holder;
});
// ==============================================================================
// ==                                   Hook                                   ==
// ==============================================================================
let keyIndex = 0;
export function useInternalMessage(messageConfig) {
  const holderRef = React.useRef(null);
  const warning = devUseWarning('Message');
  // ================================ API ================================
  const wrapAPI = React.useMemo(() => {
    // Wrap with notification content
    // >>> close
    const close = key => {
      holderRef.current?.close(key);
    };
    // >>> Open
    const open = config => {
      if (!holderRef.current) {
        process.env.NODE_ENV !== "production" ? warning(false, 'usage', 'You are calling notice in render which will break in React 18 concurrent mode. Please trigger in effect instead.') : void 0;
        const fakeResult = () => {};
        // eslint-disable-next-line react-hooks/immutability
        fakeResult.then = () => {};
        return fakeResult;
      }
      const {
        open: originOpen,
        prefixCls,
        message,
        classNames: originClassNames,
        styles: originStyles
      } = holderRef.current;
      const contextClassName = message?.className || {};
      const contextStyle = message?.style || {};
      const rawContextClassNames = message?.classNames || {};
      const rawContextStyles = message?.styles || {};
      const noticePrefixCls = `${prefixCls}-notice`;
      const {
        content,
        icon,
        type,
        key,
        className,
        style,
        onClose,
        classNames: configClassNames = {},
        styles = {},
        ...restConfig
      } = config;
      let mergedKey = key;
      if (!isNonNullable(mergedKey)) {
        keyIndex += 1;
        mergedKey = `antd-message-${keyIndex}`;
      }
      const contextConfig = {
        ...messageConfig,
        ...config
      };
      const contextClassNames = resolveStyleOrClass(rawContextClassNames, {
        props: contextConfig
      });
      const semanticClassNames = resolveStyleOrClass(configClassNames, {
        props: contextConfig
      });
      const contextStyles = resolveStyleOrClass(rawContextStyles, {
        props: contextConfig
      });
      const semanticStyles = resolveStyleOrClass(styles, {
        props: contextConfig
      });
      const mergedClassNames = mergeClassNames(undefined, contextClassNames, semanticClassNames, originClassNames);
      const mergedStyles = mergeStyles(contextStyles, semanticStyles, originStyles);
      return wrapPromiseFn(resolve => {
        originOpen({
          ...restConfig,
          key: mergedKey,
          content: (/*#__PURE__*/React.createElement(PureContent, {
            prefixCls: prefixCls,
            type: type,
            icon: icon,
            classNames: mergedClassNames,
            styles: mergedStyles
          }, content)),
          placement: 'top',
          className: clsx({
            [`${noticePrefixCls}-${type}`]: type
          }, className, contextClassName, mergedClassNames.root),
          style: {
            ...mergedStyles.root,
            ...contextStyle,
            ...style
          },
          onClose: () => {
            onClose?.();
            resolve();
          }
        });
        // Return close function
        return () => {
          close(mergedKey);
        };
      });
    };
    // >>> destroy
    const destroy = key => {
      if (key !== undefined) {
        close(key);
      } else {
        holderRef.current?.destroy();
      }
    };
    const clone = {
      open,
      destroy
    };
    const keys = ['info', 'success', 'warning', 'error', 'loading'];
    keys.forEach(type => {
      const typeOpen = (jointContent, duration, onClose) => {
        let config;
        if (jointContent && typeof jointContent === 'object' && 'content' in jointContent) {
          config = jointContent;
        } else {
          config = {
            content: jointContent
          };
        }
        // Params
        let mergedDuration;
        let mergedOnClose;
        if (typeof duration === 'function') {
          mergedOnClose = duration;
        } else {
          mergedDuration = duration;
          mergedOnClose = onClose;
        }
        const mergedConfig = {
          onClose: mergedOnClose,
          duration: mergedDuration,
          ...config,
          type
        };
        return open(mergedConfig);
      };
      clone[type] = typeOpen;
    });
    return clone;
  }, []);
  // ============================== Return ===============================
  return [wrapAPI, /*#__PURE__*/React.createElement(Holder, {
    key: "message-holder",
    ...messageConfig,
    ref: holderRef
  })];
}
export default function useMessage(messageConfig) {
  return useInternalMessage(messageConfig);
}