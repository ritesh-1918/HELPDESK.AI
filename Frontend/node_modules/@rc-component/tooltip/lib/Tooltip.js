"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _placements = require("./placements");
var _Popup = _interopRequireDefault(require("./Popup"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Tooltip = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    trigger = ['hover'],
    mouseEnterDelay = 0,
    mouseLeaveDelay = 0.1,
    prefixCls = 'rc-tooltip',
    children,
    onVisibleChange,
    afterVisibleChange,
    motion,
    placement = 'right',
    align = {},
    destroyOnHidden = false,
    defaultVisible,
    getTooltipContainer,
    arrowContent,
    overlay,
    id,
    showArrow = true,
    classNames,
    styles,
    ...restProps
  } = props;
  const mergedId = (0, _useId.default)(id);
  const triggerRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(ref, () => triggerRef.current);
  const extraProps = {
    ...restProps
  };
  if ('visible' in props) {
    extraProps.popupVisible = props.visible;
  }

  // ========================= Arrow ==========================
  // Process arrow configuration
  const mergedArrow = React.useMemo(() => {
    if (!showArrow) {
      return false;
    }

    // Convert true to object for unified processing
    const arrowConfig = showArrow === true ? {} : showArrow;

    // Apply semantic styles with unified logic
    return {
      ...arrowConfig,
      className: (0, _clsx.clsx)(arrowConfig.className, classNames?.arrow),
      style: {
        ...arrowConfig.style,
        ...styles?.arrow
      },
      content: arrowConfig.content ?? arrowContent
    };
  }, [showArrow, classNames?.arrow, styles?.arrow, arrowContent]);

  // ======================== Children ========================
  const getChildren = ({
    open
  }) => {
    const child = React.Children.only(children);
    const ariaProps = {
      'aria-describedby': overlay && open ? mergedId : undefined
    };
    return /*#__PURE__*/React.cloneElement(child, ariaProps);
  };

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(_trigger.default, _extends({
    popupClassName: classNames?.root,
    prefixCls: prefixCls,
    popup: /*#__PURE__*/React.createElement(_Popup.default, {
      key: "content",
      prefixCls: prefixCls,
      id: mergedId,
      classNames: classNames,
      styles: styles
    }, overlay),
    action: trigger,
    builtinPlacements: _placements.placements,
    popupPlacement: placement,
    ref: triggerRef,
    popupAlign: align,
    getPopupContainer: getTooltipContainer,
    onOpenChange: onVisibleChange,
    afterOpenChange: afterVisibleChange,
    popupMotion: motion,
    defaultPopupVisible: defaultVisible,
    autoDestroy: destroyOnHidden,
    mouseLeaveDelay: mouseLeaveDelay,
    popupStyle: styles?.root,
    mouseEnterDelay: mouseEnterDelay,
    arrow: mergedArrow,
    uniqueContainerClassName: classNames?.uniqueContainer,
    uniqueContainerStyle: styles?.uniqueContainer
  }, extraProps), getChildren);
});
var _default = exports.default = Tooltip;