"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useMessage;
exports.useInternalMessage = useInternalMessage;
var React = _interopRequireWildcard(require("react"));
var _notification = require("@rc-component/notification");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _PurePanel = require("./PurePanel");
var _style = _interopRequireDefault(require("./style"));
var _util = require("./util");
const DEFAULT_OFFSET = 8;
const DEFAULT_DURATION = 3;
const Wrapper = ({
  children,
  prefixCls
}) => {
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  return /*#__PURE__*/React.createElement(_notification.NotificationProvider, {
    classNames: {
      list: (0, _clsx.clsx)(hashId, cssVarCls, rootCls)
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
  } = (0, _context.useComponentConfig)('message');
  const {
    message
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = staticPrefixCls || getPrefixCls('message');
  // =============================== Style ===============================
  const getStyle = () => ({
    left: '50%',
    transform: 'translateX(-50%)',
    top: top ?? DEFAULT_OFFSET
  });
  const getClassName = () => (0, _clsx.clsx)({
    [`${prefixCls}-rtl`]: rtl ?? direction === 'rtl'
  });
  // ============================== Motion ===============================
  const getNotificationMotion = () => (0, _util.getMotion)(prefixCls, transitionName);
  // Use useMergeSemantic to merge classNames and styles
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([props?.classNames, message?.classNames], [props?.styles, message?.styles], {
    props
  });
  // ============================== Origin ===============================
  const [api, holder] = (0, _notification.useNotification)({
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
function useInternalMessage(messageConfig) {
  const holderRef = React.useRef(null);
  const warning = (0, _warning.devUseWarning)('Message');
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
      if (!(0, _isNonNullable.default)(mergedKey)) {
        keyIndex += 1;
        mergedKey = `antd-message-${keyIndex}`;
      }
      const contextConfig = {
        ...messageConfig,
        ...config
      };
      const contextClassNames = (0, _hooks.resolveStyleOrClass)(rawContextClassNames, {
        props: contextConfig
      });
      const semanticClassNames = (0, _hooks.resolveStyleOrClass)(configClassNames, {
        props: contextConfig
      });
      const contextStyles = (0, _hooks.resolveStyleOrClass)(rawContextStyles, {
        props: contextConfig
      });
      const semanticStyles = (0, _hooks.resolveStyleOrClass)(styles, {
        props: contextConfig
      });
      const mergedClassNames = (0, _hooks.mergeClassNames)(undefined, contextClassNames, semanticClassNames, originClassNames);
      const mergedStyles = (0, _hooks.mergeStyles)(contextStyles, semanticStyles, originStyles);
      return (0, _util.wrapPromiseFn)(resolve => {
        originOpen({
          ...restConfig,
          key: mergedKey,
          content: (/*#__PURE__*/React.createElement(_PurePanel.PureContent, {
            prefixCls: prefixCls,
            type: type,
            icon: icon,
            classNames: mergedClassNames,
            styles: mergedStyles
          }, content)),
          placement: 'top',
          className: (0, _clsx.clsx)({
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
function useMessage(messageConfig) {
  return useInternalMessage(messageConfig);
}