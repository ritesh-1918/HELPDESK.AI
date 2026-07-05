"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = InlineSubMenuList;
var React = _interopRequireWildcard(require("react"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _motionUtil = require("../utils/motionUtil");
var _MenuContext = _interopRequireWildcard(require("../context/MenuContext"));
var _SubMenuList = _interopRequireDefault(require("./SubMenuList"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function InlineSubMenuList({
  id,
  open,
  keyPath,
  children
}) {
  const fixedMode = 'inline';
  const {
    prefixCls,
    forceSubMenuRender,
    motion,
    defaultMotions,
    mode
  } = React.useContext(_MenuContext.MenuContext);

  // Always use latest mode check
  const sameModeRef = React.useRef(false);
  sameModeRef.current = mode === fixedMode;

  // We record `destroy` mark here since when mode change from `inline` to others.
  // The inline list should remove when motion end.
  const [destroy, setDestroy] = React.useState(!sameModeRef.current);
  const mergedOpen = sameModeRef.current ? open : false;

  // ================================= Effect =================================
  // Reset destroy state when mode change back
  React.useEffect(() => {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);

  // ================================= Render =================================
  const mergedMotion = {
    ...(0, _motionUtil.getMotion)(fixedMode, motion, defaultMotions)
  };

  // No need appear since nest inlineCollapse changed
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }

  // Hide inline list when mode changed and motion end
  const originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = newVisible => {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged?.(newVisible);
  };
  if (destroy) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_MenuContext.default, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, /*#__PURE__*/React.createElement(_motion.default, _extends({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: `${prefixCls}-hidden`
  }), ({
    className: motionClassName,
    style: motionStyle
  }) => {
    return /*#__PURE__*/React.createElement(_SubMenuList.default, {
      id: id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}