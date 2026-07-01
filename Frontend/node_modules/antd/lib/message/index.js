"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.actWrapper = exports.actDestroy = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _react = _interopRequireWildcard(require("react"));
var _render = require("@rc-component/util/lib/React/render");
var _context = require("../app/context");
var _configProvider = _interopRequireWildcard(require("../config-provider"));
var _PurePanel = _interopRequireDefault(require("./PurePanel"));
var _useMessage = _interopRequireWildcard(require("./useMessage"));
var _util = require("./util");
let message = null;
let act = callback => callback();
let taskQueue = [];
let defaultGlobalConfig = {};
function getGlobalContext() {
  const {
    getContainer,
    duration,
    rtl,
    maxCount,
    top
  } = defaultGlobalConfig;
  const mergedContainer = getContainer?.() || document.body;
  return {
    getContainer: () => mergedContainer,
    duration,
    rtl,
    maxCount,
    top
  };
}
const GlobalHolder = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    messageConfig,
    sync
  } = props;
  const {
    getPrefixCls
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const prefixCls = defaultGlobalConfig.prefixCls || getPrefixCls('message');
  const appConfig = (0, _react.useContext)(_context.AppConfigContext);
  const [api, holder] = (0, _useMessage.useInternalMessage)({
    ...messageConfig,
    prefixCls,
    ...appConfig.message
  });
  _react.default.useImperativeHandle(ref, () => {
    const instance = {
      ...api
    };
    Object.keys(instance).forEach(method => {
      instance[method] = (...args) => {
        sync();
        return api[method].apply(api, args);
      };
    });
    return {
      instance,
      sync
    };
  });
  return holder;
});
const GlobalHolderWrapper = /*#__PURE__*/_react.default.forwardRef((_, ref) => {
  const [messageConfig, setMessageConfig] = _react.default.useState(getGlobalContext);
  const sync = () => {
    setMessageConfig(getGlobalContext);
  };
  _react.default.useEffect(sync, []);
  const global = (0, _configProvider.globalConfig)();
  const rootPrefixCls = global.getRootPrefixCls();
  const rootIconPrefixCls = global.getIconPrefixCls();
  const theme = global.getTheme();
  const dom = /*#__PURE__*/_react.default.createElement(GlobalHolder, {
    ref: ref,
    sync: sync,
    messageConfig: messageConfig
  });
  return /*#__PURE__*/_react.default.createElement(_configProvider.default, {
    prefixCls: rootPrefixCls,
    iconPrefixCls: rootIconPrefixCls,
    theme: theme
  }, global.holderRender ? global.holderRender(dom) : dom);
});
const flushMessageQueue = () => {
  if (!message) {
    const holderFragment = document.createDocumentFragment();
    const newMessage = {
      fragment: holderFragment
    };
    message = newMessage;
    // Delay render to avoid sync issue
    act(() => {
      (0, _render.render)(/*#__PURE__*/_react.default.createElement(GlobalHolderWrapper, {
        ref: node => {
          const {
            instance,
            sync
          } = node || {};
          // React 18 test env will throw if call immediately in ref
          Promise.resolve().then(() => {
            if (!newMessage.instance && instance) {
              newMessage.instance = instance;
              newMessage.sync = sync;
              flushMessageQueue();
            }
          });
        }
      }), holderFragment);
    });
    return;
  }
  // Notification not ready
  if (!message.instance) {
    return;
  }
  // >>> Execute task
  taskQueue.forEach(task => {
    const {
      type,
      skipped
    } = task;
    // Only `skipped` when user call notice but cancel it immediately
    // and instance not ready
    if (!skipped) {
      switch (type) {
        case 'open':
          {
            act(() => {
              const closeFn = message.instance.open({
                ...defaultGlobalConfig,
                ...task.config
              });
              closeFn?.then(task.resolve);
              task.setCloseFn(closeFn);
            });
            break;
          }
        case 'destroy':
          act(() => {
            message?.instance.destroy(task.key);
          });
          break;
        // Other type open
        default:
          {
            act(() => {
              var _message$instance;
              const closeFn = (_message$instance = message.instance)[type].apply(_message$instance, (0, _toConsumableArray2.default)(task.args));
              closeFn?.then(task.resolve);
              task.setCloseFn(closeFn);
            });
          }
      }
    }
  });
  // Clean up
  taskQueue = [];
};
// ==============================================================================
// ==                                  Export                                  ==
// ==============================================================================
function setMessageGlobalConfig(config) {
  defaultGlobalConfig = {
    ...defaultGlobalConfig,
    ...config
  };
  // Trigger sync for it
  act(() => {
    message?.sync?.();
  });
}
function open(config) {
  const result = (0, _util.wrapPromiseFn)(resolve => {
    let closeFn;
    const task = {
      type: 'open',
      config,
      resolve,
      setCloseFn: fn => {
        closeFn = fn;
      }
    };
    taskQueue.push(task);
    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });
  flushMessageQueue();
  return result;
}
function typeOpen(type, args) {
  const global = (0, _configProvider.globalConfig)();
  if (process.env.NODE_ENV !== 'production' && !global.holderRender) {
    (0, _configProvider.warnContext)('message');
  }
  const result = (0, _util.wrapPromiseFn)(resolve => {
    let closeFn;
    const task = {
      type,
      args,
      resolve,
      setCloseFn: fn => {
        closeFn = fn;
      }
    };
    taskQueue.push(task);
    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });
  flushMessageQueue();
  return result;
}
const destroy = key => {
  taskQueue.push({
    type: 'destroy',
    key
  });
  flushMessageQueue();
};
const methods = ['success', 'info', 'warning', 'error', 'loading'];
const baseStaticMethods = {
  open,
  destroy,
  config: setMessageGlobalConfig,
  useMessage: _useMessage.default,
  _InternalPanelDoNotUseOrYouWillBeFired: _PurePanel.default
};
const staticMethods = baseStaticMethods;
methods.forEach(type => {
  staticMethods[type] = (...args) => typeOpen(type, args);
});
// ==============================================================================
// ==                                   Test                                   ==
// ==============================================================================
const noop = () => {};
let _actWrapper = noop;
if (process.env.NODE_ENV === 'test') {
  _actWrapper = wrapper => {
    act = wrapper;
  };
}
const actWrapper = exports.actWrapper = _actWrapper;
let _actDestroy = noop;
if (process.env.NODE_ENV === 'test') {
  _actDestroy = () => {
    message = null;
  };
}
const actDestroy = exports.actDestroy = _actDestroy;
var _default = exports.default = staticMethods;