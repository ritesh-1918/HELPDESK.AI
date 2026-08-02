"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useNotification;
var React = _interopRequireWildcard(require("react"));
var _Notifications = _interopRequireDefault(require("../Notifications"));
var _util = require("@rc-component/util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const defaultGetContainer = () => document.body;
let uniqueKey = 0;
function mergeConfig(...objList) {
  const clone = {};
  objList.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (val !== undefined) {
          clone[key] = val;
        }
      });
    }
  });
  return clone;
}
function useNotification(rootConfig = {}) {
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    maxCount,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications,
    ...shareConfig
  } = rootConfig;
  const [container, setContainer] = React.useState();
  const notificationsRef = React.useRef();
  const contextHolder = /*#__PURE__*/React.createElement(_Notifications.default, {
    container: container,
    ref: notificationsRef,
    prefixCls: prefixCls,
    motion: motion,
    maxCount: maxCount,
    className: className,
    style: style,
    onAllRemoved: onAllRemoved,
    stack: stack,
    renderNotifications: renderNotifications
  });
  const [taskQueue, setTaskQueue] = React.useState([]);
  const open = (0, _util.useEvent)(config => {
    const mergedConfig = mergeConfig(shareConfig, config);
    if (mergedConfig.key === null || mergedConfig.key === undefined) {
      mergedConfig.key = `rc-notification-${uniqueKey}`;
      uniqueKey += 1;
    }
    setTaskQueue(queue => [...queue, {
      type: 'open',
      config: mergedConfig
    }]);
  });

  // ========================= Refs =========================
  const api = React.useMemo(() => ({
    open: open,
    close: key => {
      setTaskQueue(queue => [...queue, {
        type: 'close',
        key
      }]);
    },
    destroy: () => {
      setTaskQueue(queue => [...queue, {
        type: 'destroy'
      }]);
    }
  }), []);

  // ======================= Container ======================
  // React 18 should all in effect that we will check container in each render
  // Which means getContainer should be stable.
  React.useEffect(() => {
    setContainer(getContainer());
  });

  // ======================== Effect ========================
  React.useEffect(() => {
    // Flush task when node ready
    if (notificationsRef.current && taskQueue.length) {
      taskQueue.forEach(task => {
        switch (task.type) {
          case 'open':
            notificationsRef.current.open(task.config);
            break;
          case 'close':
            notificationsRef.current.close(task.key);
            break;
          case 'destroy':
            notificationsRef.current.destroy();
            break;
        }
      });

      // https://github.com/ant-design/ant-design/issues/52590
      // React `startTransition` will run once `useEffect` but many times `setState`,
      // So `setTaskQueue` with filtered array will cause infinite loop.
      // We cache the first match queue instead.
      let oriTaskQueue;
      let tgtTaskQueue;

      // React 17 will mix order of effect & setState in async
      // - open: setState[0]
      // - effect[0]
      // - open: setState[1]
      // - effect setState([]) * here will clean up [0, 1] in React 17
      setTaskQueue(oriQueue => {
        if (oriTaskQueue !== oriQueue || !tgtTaskQueue) {
          oriTaskQueue = oriQueue;
          tgtTaskQueue = oriQueue.filter(task => !taskQueue.includes(task));
        }
        return tgtTaskQueue;
      });
    }
  }, [taskQueue]);

  // ======================== Return ========================
  return [api, contextHolder];
}