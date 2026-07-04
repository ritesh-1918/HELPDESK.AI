"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
var _NoticeList = _interopRequireDefault(require("./NoticeList"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// ant-notification ant-notification-topRight
const Notifications = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-notification',
    container,
    motion,
    maxCount,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications
  } = props;
  const [configList, setConfigList] = React.useState([]);

  // ======================== Close =========================
  const onNoticeClose = key => {
    // Trigger close event
    const config = configList.find(item => item.key === key);
    const closable = config?.closable;
    const closableObj = closable && typeof closable === 'object' ? closable : {};
    const {
      onClose: closableOnClose
    } = closableObj;
    closableOnClose?.();
    config?.onClose?.();
    setConfigList(list => list.filter(item => item.key !== key));
  };

  // ========================= Refs =========================
  React.useImperativeHandle(ref, () => ({
    open: config => {
      setConfigList(list => {
        let clone = [...list];

        // Replace if exist
        const index = clone.findIndex(item => item.key === config.key);
        const innerConfig = {
          ...config
        };
        if (index >= 0) {
          innerConfig.times = (list[index]?.times || 0) + 1;
          clone[index] = innerConfig;
        } else {
          innerConfig.times = 0;
          clone.push(innerConfig);
        }
        if (maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount);
        }
        return clone;
      });
    },
    close: key => {
      onNoticeClose(key);
    },
    destroy: () => {
      setConfigList([]);
    }
  }));

  // ====================== Placements ======================
  const [placements, setPlacements] = React.useState({});
  React.useEffect(() => {
    const nextPlacements = {};
    configList.forEach(config => {
      const {
        placement = 'topRight'
      } = config;
      if (placement) {
        nextPlacements[placement] = nextPlacements[placement] || [];
        nextPlacements[placement].push(config);
      }
    });

    // Fill exist placements to avoid empty list causing remove without motion
    Object.keys(placements).forEach(placement => {
      nextPlacements[placement] = nextPlacements[placement] || [];
    });
    setPlacements(nextPlacements);
  }, [configList]);

  // Clean up container if all notices fade out
  const onAllNoticeRemoved = placement => {
    setPlacements(originPlacements => {
      const clone = {
        ...originPlacements
      };
      const list = clone[placement] || [];
      if (!list.length) {
        delete clone[placement];
      }
      return clone;
    });
  };

  // Effect tell that placements is empty now
  const emptyRef = React.useRef(false);
  React.useEffect(() => {
    if (Object.keys(placements).length > 0) {
      emptyRef.current = true;
    } else if (emptyRef.current) {
      // Trigger only when from exist to empty
      onAllRemoved?.();
      emptyRef.current = false;
    }
  }, [placements]);
  // ======================== Render ========================
  if (!container) {
    return null;
  }
  const placementList = Object.keys(placements);
  return /*#__PURE__*/(0, _reactDom.createPortal)( /*#__PURE__*/React.createElement(React.Fragment, null, placementList.map(placement => {
    const placementConfigList = placements[placement];
    const list = /*#__PURE__*/React.createElement(_NoticeList.default, {
      key: placement,
      configList: placementConfigList,
      placement: placement,
      prefixCls: prefixCls,
      className: className?.(placement),
      style: style?.(placement),
      motion: motion,
      onNoticeClose: onNoticeClose,
      onAllNoticeRemoved: onAllNoticeRemoved,
      stack: stack
    });
    return renderNotifications ? renderNotifications(list, {
      prefixCls,
      key: placement
    }) : list;
  })), container);
});
if (process.env.NODE_ENV !== 'production') {
  Notifications.displayName = 'Notifications';
}
var _default = exports.default = Notifications;