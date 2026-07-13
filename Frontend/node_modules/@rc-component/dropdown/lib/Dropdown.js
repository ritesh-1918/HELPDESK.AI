"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
var _useAccessibility = _interopRequireDefault(require("./hooks/useAccessibility"));
var _Overlay = _interopRequireDefault(require("./Overlay"));
var _placements = _interopRequireDefault(require("./placements"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Dropdown = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    arrow = false,
    prefixCls = 'rc-dropdown',
    transitionName,
    animation,
    align,
    placement = 'bottomLeft',
    placements = _placements.default,
    getPopupContainer,
    showAction,
    hideAction,
    overlayClassName,
    overlayStyle,
    visible,
    trigger = ['hover'],
    autoFocus,
    overlay,
    children,
    onVisibleChange,
    ...otherProps
  } = props;
  const [triggerVisible, setTriggerVisible] = _react.default.useState();
  const mergedVisible = 'visible' in props ? visible : triggerVisible;
  const mergedMotionName = animation ? `${prefixCls}-${animation}` : transitionName;
  const triggerRef = _react.default.useRef(null);
  const overlayRef = _react.default.useRef(null);
  const childRef = _react.default.useRef(null);
  _react.default.useImperativeHandle(ref, () => triggerRef.current);
  const handleVisibleChange = newVisible => {
    setTriggerVisible(newVisible);
    onVisibleChange?.(newVisible);
  };
  (0, _useAccessibility.default)({
    visible: mergedVisible,
    triggerRef: childRef,
    onVisibleChange: handleVisibleChange,
    autoFocus,
    overlayRef
  });
  const onClick = e => {
    const {
      onOverlayClick
    } = props;
    setTriggerVisible(false);
    if (onOverlayClick) {
      onOverlayClick(e);
    }
  };
  const getMenuElement = () => /*#__PURE__*/_react.default.createElement(_Overlay.default, {
    ref: overlayRef,
    overlay: overlay,
    prefixCls: prefixCls,
    arrow: arrow
  });
  const getMenuElementOrLambda = () => {
    if (typeof overlay === 'function') {
      return getMenuElement;
    }
    return getMenuElement();
  };
  const getMinOverlayWidthMatchTrigger = () => {
    const {
      minOverlayWidthMatchTrigger,
      alignPoint
    } = props;
    if ('minOverlayWidthMatchTrigger' in props) {
      return minOverlayWidthMatchTrigger;
    }
    return !alignPoint;
  };
  const getOpenClassName = () => {
    const {
      openClassName
    } = props;
    if (openClassName !== undefined) {
      return openClassName;
    }
    return `${prefixCls}-open`;
  };
  const childrenNode = /*#__PURE__*/_react.default.cloneElement(children, {
    className: (0, _clsx.clsx)(children.props?.className, mergedVisible && getOpenClassName()),
    ref: (0, _ref.supportRef)(children) ? (0, _ref.composeRef)(childRef, (0, _ref.getNodeRef)(children)) : undefined
  });
  let triggerHideAction = hideAction;
  if (!triggerHideAction && trigger.indexOf('contextMenu') !== -1) {
    triggerHideAction = ['click'];
  }
  return /*#__PURE__*/_react.default.createElement(_trigger.default, _extends({
    builtinPlacements: placements
  }, otherProps, {
    prefixCls: prefixCls,
    ref: triggerRef,
    popupClassName: (0, _clsx.clsx)(overlayClassName, {
      [`${prefixCls}-show-arrow`]: arrow
    }),
    popupStyle: overlayStyle,
    action: trigger,
    showAction: showAction,
    hideAction: triggerHideAction,
    popupPlacement: placement,
    popupAlign: align,
    popupMotion: {
      motionName: mergedMotionName
    },
    popupVisible: mergedVisible,
    stretch: getMinOverlayWidthMatchTrigger() ? 'minWidth' : '',
    popup: getMenuElementOrLambda(),
    onOpenChange: handleVisibleChange,
    onPopupClick: onClick,
    getPopupContainer: getPopupContainer
  }), childrenNode);
});
var _default = exports.default = Dropdown;