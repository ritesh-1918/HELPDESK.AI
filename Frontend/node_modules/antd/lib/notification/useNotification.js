"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useNotification;
exports.useInternalNotification = useInternalNotification;
var _react = _interopRequireWildcard(require("react"));
var _notification = require("@rc-component/notification");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _internal = require("../theme/internal");
var _PurePanel = require("./PurePanel");
var _style = _interopRequireDefault(require("./style"));
var _util = require("./util");
const DEFAULT_OFFSET = 24;
const DEFAULT_DURATION = 4.5;
const DEFAULT_PLACEMENT = 'topRight';
const Wrapper = ({
  children,
  prefixCls
}) => {
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  return /*#__PURE__*/_react.default.createElement(_notification.NotificationProvider, {
    classNames: {
      list: (0, _clsx.clsx)(hashId, cssVarCls, rootCls)
    }
  }, children);
};
const renderNotifications = (node, {
  prefixCls,
  key
}) => (/*#__PURE__*/_react.default.createElement(Wrapper, {
  prefixCls: prefixCls,
  key: key
}, node));
const Holder = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    top,
    bottom,
    prefixCls: staticPrefixCls,
    getContainer: staticGetContainer,
    maxCount,
    rtl,
    onAllRemoved,
    stack,
    duration = DEFAULT_DURATION,
    pauseOnHover = true,
    showProgress
  } = props;
  const {
    getPrefixCls,
    getPopupContainer,
    direction
  } = (0, _context.useComponentConfig)('notification');
  const {
    notification
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const [, token] = (0, _internal.useToken)();
  const prefixCls = staticPrefixCls || getPrefixCls('notification');
  const mergedDuration = (0, _react.useMemo)(() => typeof duration === 'number' && duration > 0 ? duration : false, [duration]);
  // =============================== Style ===============================
  const getStyle = placement => (0, _util.getPlacementStyle)(placement, top ?? DEFAULT_OFFSET, bottom ?? DEFAULT_OFFSET);
  const getClassName = () => (0, _clsx.clsx)({
    [`${prefixCls}-rtl`]: rtl ?? direction === 'rtl'
  });
  // ============================== Motion ===============================
  const getNotificationMotion = () => (0, _util.getMotion)(prefixCls);
  // ============================== Origin ===============================
  const [api, holder] = (0, _notification.useNotification)({
    prefixCls,
    style: getStyle,
    className: getClassName,
    motion: getNotificationMotion,
    closable: {
      closeIcon: (0, _PurePanel.getCloseIcon)(prefixCls)
    },
    duration: mergedDuration,
    getContainer: () => staticGetContainer?.() || getPopupContainer?.() || document.body,
    maxCount,
    pauseOnHover,
    showProgress,
    onAllRemoved,
    renderNotifications,
    stack: stack === false ? false : {
      threshold: typeof stack === 'object' ? stack?.threshold : undefined,
      offset: 8,
      gap: token.margin
    }
  });
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([notification?.classNames, props?.classNames], [notification?.styles, props?.styles], {
    props
  });
  // ================================ Ref ================================
  _react.default.useImperativeHandle(ref, () => ({
    ...api,
    prefixCls,
    notification,
    classNames: mergedClassNames,
    styles: mergedStyles
  }));
  return holder;
});
// ==============================================================================
// ==                                   Hook                                   ==
// ==============================================================================
function useInternalNotification(notificationConfig) {
  const holderRef = _react.default.useRef(null);
  const warning = (0, _warning.devUseWarning)('Notification');
  const {
    notification: notificationContext
  } = _react.default.useContext(_configProvider.ConfigContext);
  // ================================ API ================================
  const wrapAPI = _react.default.useMemo(() => {
    // Wrap with notification content
    // >>> Open
    const open = config => {
      if (!holderRef.current) {
        process.env.NODE_ENV !== "production" ? warning(false, 'usage', 'You are calling notice in render which will break in React 18 concurrent mode. Please trigger in effect instead.') : void 0;
        return;
      }
      const {
        open: originOpen,
        prefixCls,
        notification,
        classNames: originClassNames,
        styles: originStyles
      } = holderRef.current;
      const contextClassName = notification?.className || {};
      const contextStyle = notification?.style || {};
      const noticePrefixCls = `${prefixCls}-notice`;
      const {
        title,
        message,
        description,
        icon,
        type,
        btn,
        actions,
        className,
        style,
        role = 'alert',
        closeIcon,
        closable,
        classNames: configClassNames = {},
        styles = {},
        ...restConfig
      } = config;
      if (process.env.NODE_ENV !== 'production') {
        [['btn', 'actions'], ['message', 'title']].forEach(([deprecatedName, newName]) => {
          warning.deprecated(!(deprecatedName in config), deprecatedName, newName);
        });
      }
      const mergedTitle = title ?? message;
      const mergedActions = actions ?? btn;
      const realCloseIcon = (0, _PurePanel.getCloseIcon)(noticePrefixCls, (0, _util.getCloseIconConfig)(closeIcon, notificationConfig, notification));
      const [rawClosable, mergedCloseIcon,, ariaProps] = (0, _hooks.computeClosable)((0, _hooks.pickClosable)({
        ...(notificationConfig || {}),
        ...config
      }), (0, _hooks.pickClosable)(notificationContext), {
        closable: true,
        closeIcon: realCloseIcon
      });
      const mergedClosable = rawClosable ? {
        onClose: closable && typeof closable === 'object' ? closable.onClose : undefined,
        closeIcon: mergedCloseIcon,
        ...ariaProps
      } : false;
      const semanticClassNames = (0, _hooks.resolveStyleOrClass)(configClassNames, {
        props: config
      });
      const semanticStyles = (0, _hooks.resolveStyleOrClass)(styles, {
        props: config
      });
      const mergedClassNames = (0, _hooks.mergeClassNames)(undefined, originClassNames, semanticClassNames);
      const mergedStyles = (0, _hooks.mergeStyles)(originStyles, semanticStyles);
      return originOpen({
        // use placement from props instead of hard-coding "topRight"
        placement: notificationConfig?.placement ?? DEFAULT_PLACEMENT,
        ...restConfig,
        content: (/*#__PURE__*/_react.default.createElement(_PurePanel.PureContent, {
          prefixCls: noticePrefixCls,
          icon: icon,
          type: type,
          title: mergedTitle,
          description: description,
          actions: mergedActions,
          role: role,
          classNames: mergedClassNames,
          styles: mergedStyles
        })),
        className: (0, _clsx.clsx)({
          [`${noticePrefixCls}-${type}`]: type
        }, className, contextClassName, mergedClassNames.root),
        style: {
          ...contextStyle,
          ...mergedStyles.root,
          ...style
        },
        closable: mergedClosable
      });
    };
    // >>> destroy
    const destroy = key => {
      if (key !== undefined) {
        holderRef.current?.close(key);
      } else {
        holderRef.current?.destroy();
      }
    };
    const clone = {
      open,
      destroy
    };
    const keys = ['success', 'info', 'warning', 'error'];
    keys.forEach(type => {
      clone[type] = config => open({
        ...config,
        type
      });
    });
    return clone;
  }, [notificationConfig, notificationContext]);
  // ============================== Return ===============================
  return [wrapAPI, /*#__PURE__*/_react.default.createElement(Holder, {
    key: "notification-holder",
    ...notificationConfig,
    ref: holderRef
  })];
}
function useNotification(notificationConfig) {
  return useInternalNotification(notificationConfig);
}