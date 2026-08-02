"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _motion = require("@rc-component/motion");
var _Notice = _interopRequireDefault(require("./Notice"));
var _NotificationProvider = require("./NotificationProvider");
var _useStack = _interopRequireDefault(require("./hooks/useStack"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const NoticeList = props => {
  const {
    configList,
    placement,
    prefixCls,
    className,
    style,
    motion,
    onAllNoticeRemoved,
    onNoticeClose,
    stack: stackConfig
  } = props;
  const {
    classNames: ctxCls
  } = (0, _react.useContext)(_NotificationProvider.NotificationContext);
  const dictRef = (0, _react.useRef)({});
  const [latestNotice, setLatestNotice] = (0, _react.useState)(null);
  const [hoverKeys, setHoverKeys] = (0, _react.useState)([]);
  const keys = configList.map(config => ({
    config,
    key: String(config.key)
  }));
  const [stack, {
    offset,
    threshold,
    gap
  }] = (0, _useStack.default)(stackConfig);
  const expanded = stack && (hoverKeys.length > 0 || keys.length <= threshold);
  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  // Clean hover key
  (0, _react.useEffect)(() => {
    if (stack && hoverKeys.length > 1) {
      setHoverKeys(prev => prev.filter(key => keys.some(({
        key: dataKey
      }) => key === dataKey)));
    }
  }, [hoverKeys, keys, stack]);

  // Force update latest notice
  (0, _react.useEffect)(() => {
    if (stack && dictRef.current[keys[keys.length - 1]?.key]) {
      setLatestNotice(dictRef.current[keys[keys.length - 1]?.key]);
    }
  }, [keys, stack]);
  return /*#__PURE__*/_react.default.createElement(_motion.CSSMotionList, _extends({
    key: placement,
    className: (0, _clsx.clsx)(prefixCls, `${prefixCls}-${placement}`, ctxCls?.list, className, {
      [`${prefixCls}-stack`]: !!stack,
      [`${prefixCls}-stack-expanded`]: expanded
    }),
    style: style,
    keys: keys,
    motionAppear: true
  }, placementMotion, {
    onAllRemoved: () => {
      onAllNoticeRemoved(placement);
    }
  }), ({
    config,
    className: motionClassName,
    style: motionStyle,
    index: motionIndex
  }, nodeRef) => {
    const {
      key,
      times
    } = config;
    const strKey = String(key);
    const {
      className: configClassName,
      style: configStyle,
      classNames: configClassNames,
      styles: configStyles,
      ...restConfig
    } = config;
    const dataIndex = keys.findIndex(item => item.key === strKey);

    // If dataIndex is -1, that means this notice has been removed in data, but still in dom
    // Should minus (motionIndex - 1) to get the correct index because keys.length is not the same as dom length
    const stackStyle = {};
    if (stack) {
      const index = keys.length - 1 - (dataIndex > -1 ? dataIndex : motionIndex - 1);
      const transformX = placement === 'top' || placement === 'bottom' ? '-50%' : '0';
      if (index > 0) {
        stackStyle.height = expanded ? dictRef.current[strKey]?.offsetHeight : latestNotice?.offsetHeight;

        // Transform
        let verticalOffset = 0;
        for (let i = 0; i < index; i++) {
          verticalOffset += dictRef.current[keys[keys.length - 1 - i].key]?.offsetHeight + gap;
        }
        const transformY = (expanded ? verticalOffset : index * offset) * (placement.startsWith('top') ? 1 : -1);
        const scaleX = !expanded && latestNotice?.offsetWidth && dictRef.current[strKey]?.offsetWidth ? (latestNotice?.offsetWidth - offset * 2 * (index < 3 ? index : 3)) / dictRef.current[strKey]?.offsetWidth : 1;
        stackStyle.transform = `translate3d(${transformX}, ${transformY}px, 0) scaleX(${scaleX})`;
      } else {
        stackStyle.transform = `translate3d(${transformX}, 0, 0)`;
      }
    }
    return /*#__PURE__*/_react.default.createElement("div", {
      ref: nodeRef,
      className: (0, _clsx.clsx)(`${prefixCls}-notice-wrapper`, motionClassName, configClassNames?.wrapper),
      style: {
        ...motionStyle,
        ...stackStyle,
        ...configStyles?.wrapper
      },
      onMouseEnter: () => setHoverKeys(prev => prev.includes(strKey) ? prev : [...prev, strKey]),
      onMouseLeave: () => setHoverKeys(prev => prev.filter(k => k !== strKey))
    }, /*#__PURE__*/_react.default.createElement(_Notice.default, _extends({}, restConfig, {
      ref: node => {
        if (dataIndex > -1) {
          dictRef.current[strKey] = node;
        } else {
          delete dictRef.current[strKey];
        }
      },
      prefixCls: prefixCls,
      classNames: configClassNames,
      styles: configStyles,
      className: (0, _clsx.clsx)(configClassName, ctxCls?.notice),
      style: configStyle,
      times: times,
      key: key,
      eventKey: key,
      onNoticeClose: onNoticeClose,
      hovering: stack && hoverKeys.length > 0
    })));
  });
};
if (process.env.NODE_ENV !== 'production') {
  NoticeList.displayName = 'NoticeList';
}
var _default = exports.default = NoticeList;