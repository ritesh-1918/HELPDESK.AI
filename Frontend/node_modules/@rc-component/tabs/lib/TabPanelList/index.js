"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var React = _interopRequireWildcard(require("react"));
var _TabContext = _interopRequireDefault(require("../TabContext"));
var _TabPane = _interopRequireDefault(require("./TabPane"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const TabPanelList = props => {
  const {
    id,
    activeKey,
    animated,
    tabPosition,
    destroyOnHidden,
    contentStyle,
    contentClassName
  } = props;
  const {
    prefixCls,
    tabs
  } = React.useContext(_TabContext.default);
  const tabPaneAnimated = animated.tabPane;
  const tabPanePrefixCls = `${prefixCls}-tabpane`;
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-content-holder`)
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-content`, `${prefixCls}-content-${tabPosition}`, {
      [`${prefixCls}-content-animated`]: tabPaneAnimated
    })
  }, tabs.map(item => {
    const {
      key,
      forceRender,
      style: paneStyle,
      className: paneClassName,
      destroyOnHidden: itemDestroyOnHidden,
      ...restTabProps
    } = item;
    const active = key === activeKey;
    return /*#__PURE__*/React.createElement(_motion.default, _extends({
      key: key,
      visible: active,
      forceRender: forceRender,
      removeOnLeave: !!(destroyOnHidden ?? itemDestroyOnHidden),
      leavedClassName: `${tabPanePrefixCls}-hidden`
    }, animated.tabPaneMotion), ({
      style: motionStyle,
      className: motionClassName
    }, ref) => /*#__PURE__*/React.createElement(_TabPane.default, _extends({}, restTabProps, {
      prefixCls: tabPanePrefixCls,
      id: id,
      tabKey: key,
      animated: tabPaneAnimated,
      active: active,
      style: {
        ...contentStyle,
        ...paneStyle,
        ...motionStyle
      },
      className: (0, _clsx.clsx)(contentClassName, paneClassName, motionClassName),
      ref: ref
    })));
  })));
};
var _default = exports.default = TabPanelList;