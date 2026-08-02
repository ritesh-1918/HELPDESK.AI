"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PopupTrigger;
var React = _interopRequireWildcard(require("react"));
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _clsx = require("clsx");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _MenuContext = require("../context/MenuContext");
var _placements = require("../placements");
var _motionUtil = require("../utils/motionUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop'
};
function PopupTrigger({
  prefixCls,
  visible,
  children,
  popup,
  popupStyle,
  popupClassName,
  popupOffset,
  disabled,
  mode,
  onVisibleChange
}) {
  const {
    getPopupContainer,
    rtl,
    subMenuOpenDelay,
    subMenuCloseDelay,
    builtinPlacements,
    triggerSubMenuAction,
    forceSubMenuRender,
    rootClassName,
    // Motion
    motion,
    defaultMotions
  } = React.useContext(_MenuContext.MenuContext);
  const [innerVisible, setInnerVisible] = React.useState(false);
  const placement = rtl ? {
    ..._placements.placementsRtl,
    ...builtinPlacements
  } : {
    ..._placements.placements,
    ...builtinPlacements
  };
  const popupPlacement = popupPlacementMap[mode];
  const targetMotion = (0, _motionUtil.getMotion)(mode, motion, defaultMotions);
  const targetMotionRef = React.useRef(targetMotion);
  if (mode !== 'inline') {
    /**
     * PopupTrigger is only used for vertical and horizontal types.
     * When collapsed is unfolded, the inline animation will destroy the vertical animation.
     */
    targetMotionRef.current = targetMotion;
  }
  const mergedMotion = {
    ...targetMotionRef.current,
    leavedClassName: `${prefixCls}-hidden`,
    removeOnLeave: false,
    motionAppear: true
  };

  // Delay to change visible
  const visibleRef = React.useRef();
  React.useEffect(() => {
    visibleRef.current = (0, _raf.default)(() => {
      setInnerVisible(visible);
    });
    return () => {
      _raf.default.cancel(visibleRef.current);
    };
  }, [visible]);
  return /*#__PURE__*/React.createElement(_trigger.default, {
    prefixCls: prefixCls,
    popupClassName: (0, _clsx.clsx)(`${prefixCls}-popup`, {
      [`${prefixCls}-rtl`]: rtl
    }, popupClassName, rootClassName),
    stretch: mode === 'horizontal' ? 'minWidth' : null,
    getPopupContainer: getPopupContainer,
    builtinPlacements: placement,
    popupPlacement: popupPlacement,
    popupVisible: innerVisible,
    popup: popup,
    popupStyle: popupStyle,
    popupAlign: popupOffset && {
      offset: popupOffset
    },
    action: disabled ? [] : [triggerSubMenuAction],
    mouseEnterDelay: subMenuOpenDelay,
    mouseLeaveDelay: subMenuCloseDelay,
    onPopupVisibleChange: onVisibleChange,
    forceRender: forceSubMenuRender,
    popupMotion: mergedMotion,
    fresh: true
  }, children);
}