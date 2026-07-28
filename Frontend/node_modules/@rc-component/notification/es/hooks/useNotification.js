import * as React from 'react';
import Notifications from "../Notifications";
import { useEvent } from '@rc-component/util';
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
export default function useNotification(rootConfig = {}) {
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
  const contextHolder = /*#__PURE__*/React.createElement(Notifications, {
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
  const open = useEvent(config => {
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