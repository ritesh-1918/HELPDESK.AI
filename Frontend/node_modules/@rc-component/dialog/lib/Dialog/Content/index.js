"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _util = require("../../util");
var _Panel = _interopRequireDefault(require("./Panel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Content = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    title,
    style,
    className,
    visible,
    forceRender,
    destroyOnHidden,
    motionName,
    ariaId,
    onVisibleChanged,
    mousePosition
  } = props;
  const dialogRef = (0, _react.useRef)(null);
  const panelRef = (0, _react.useRef)(null);

  // ============================== Refs ==============================
  React.useImperativeHandle(ref, () => ({
    ...panelRef.current,
    inMotion: dialogRef.current.inMotion,
    enableMotion: dialogRef.current.enableMotion
  }));

  // ============================= Style ==============================
  const [transformOrigin, setTransformOrigin] = React.useState();
  const contentStyle = {};
  if (transformOrigin) {
    contentStyle.transformOrigin = transformOrigin;
  }
  function onPrepare() {
    if (!dialogRef.current?.nativeElement) {
      return;
    }
    const elementOffset = (0, _util.offset)(dialogRef.current.nativeElement);
    setTransformOrigin(mousePosition && (mousePosition.x || mousePosition.y) ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px` : '');
  }

  // ============================= Render =============================
  return /*#__PURE__*/React.createElement(_motion.default, {
    visible: visible,
    onVisibleChanged: onVisibleChanged,
    onAppearPrepare: onPrepare,
    onEnterPrepare: onPrepare,
    forceRender: forceRender,
    motionName: motionName,
    removeOnLeave: destroyOnHidden,
    ref: dialogRef
  }, ({
    className: motionClassName,
    style: motionStyle
  }, motionRef) => /*#__PURE__*/React.createElement(_Panel.default, _extends({}, props, {
    ref: panelRef,
    title: title,
    ariaId: ariaId,
    prefixCls: prefixCls,
    holderRef: motionRef,
    style: {
      ...motionStyle,
      ...style,
      ...contentStyle
    },
    className: (0, _clsx.clsx)(className, motionClassName)
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Content.displayName = 'Content';
}
var _default = exports.default = Content;