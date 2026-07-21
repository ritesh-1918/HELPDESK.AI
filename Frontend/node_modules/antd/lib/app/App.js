"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useMessage = _interopRequireDefault(require("../message/useMessage"));
var _useModal = _interopRequireDefault(require("../modal/useModal"));
var _useNotification = _interopRequireDefault(require("../notification/useNotification"));
var _context2 = _interopRequireWildcard(require("./context"));
var _style = _interopRequireDefault(require("./style"));
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
  } = (0, _context.useComponentConfig)('app');
  const prefixCls = getPrefixCls('app', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const customClassName = (0, _clsx.clsx)(hashId, prefixCls, className, rootClassName, cssVarCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  });
  const appConfig = (0, _react.useContext)(_context2.AppConfigContext);
  const mergedAppConfig = _react.default.useMemo(() => ({
    message: {
      ...appConfig.message,
      ...message
    },
    notification: {
      ...appConfig.notification,
      ...notification
    }
  }), [message, notification, appConfig.message, appConfig.notification]);
  const [messageApi, messageContextHolder] = (0, _useMessage.default)(mergedAppConfig.message);
  const [notificationApi, notificationContextHolder] = (0, _useNotification.default)(mergedAppConfig.notification);
  const [ModalApi, ModalContextHolder] = (0, _useModal.default)();
  const memoizedContextValue = _react.default.useMemo(() => ({
    message: messageApi,
    notification: notificationApi,
    modal: ModalApi
  }), [messageApi, notificationApi, ModalApi]);
  // https://github.com/ant-design/ant-design/issues/48802#issuecomment-2097813526
  (0, _warning.devUseWarning)('App')(!(cssVarCls && component === false), 'usage', 'When using cssVar, ensure `component` is assigned a valid React component string.');
  // ============================ Render ============================
  const Component = component === false ? _react.default.Fragment : component;
  const rootProps = {
    className: (0, _clsx.clsx)(contextClassName, customClassName),
    style: {
      ...contextStyle,
      ...style
    }
  };
  return /*#__PURE__*/_react.default.createElement(_context2.default.Provider, {
    value: memoizedContextValue
  }, /*#__PURE__*/_react.default.createElement(_context2.AppConfigContext.Provider, {
    value: mergedAppConfig
  }, /*#__PURE__*/_react.default.createElement(Component, {
    ...(component === false ? undefined : rootProps)
  }, ModalContextHolder, messageContextHolder, notificationContextHolder, children)));
};
if (process.env.NODE_ENV !== 'production') {
  App.displayName = 'App';
}
var _default = exports.default = App;