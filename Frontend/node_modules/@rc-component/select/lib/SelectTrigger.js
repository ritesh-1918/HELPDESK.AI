"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const getBuiltInPlacements = popupMatchSelectWidth => {
  // Enable horizontal overflow auto-adjustment when a custom dropdown width is provided
  const adjustX = popupMatchSelectWidth === true ? 0 : 1;
  return {
    bottomLeft: {
      points: ['tl', 'bl'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1
      },
      htmlRegion: 'scroll'
    },
    bottomRight: {
      points: ['tr', 'br'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1
      },
      htmlRegion: 'scroll'
    },
    topLeft: {
      points: ['bl', 'tl'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1
      },
      htmlRegion: 'scroll'
    },
    topRight: {
      points: ['br', 'tr'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1
      },
      htmlRegion: 'scroll'
    }
  };
};
const SelectTrigger = (props, ref) => {
  const {
    prefixCls,
    disabled,
    visible,
    children,
    popupElement,
    animation,
    transitionName,
    popupStyle,
    popupClassName,
    direction = 'ltr',
    placement,
    builtinPlacements,
    popupMatchSelectWidth,
    popupRender,
    popupAlign,
    getPopupContainer,
    empty,
    onPopupVisibleChange,
    onPopupMouseEnter,
    onPopupMouseDown,
    onPopupBlur,
    ...restProps
  } = props;

  // We still use `dropdown` className to keep compatibility
  // This is used for:
  // 1. Styles
  // 2. Animation
  // 3. Theme customization
  // Please do not modify this since it's a breaking change
  const popupPrefixCls = `${prefixCls}-dropdown`;
  let popupNode = popupElement;
  if (popupRender) {
    popupNode = popupRender(popupElement);
  }
  const mergedBuiltinPlacements = React.useMemo(() => builtinPlacements || getBuiltInPlacements(popupMatchSelectWidth), [builtinPlacements, popupMatchSelectWidth]);

  // ===================== Motion ======================
  const mergedTransitionName = animation ? `${popupPrefixCls}-${animation}` : transitionName;

  // =================== Popup Width ===================
  const isNumberPopupWidth = typeof popupMatchSelectWidth === 'number';
  const stretch = React.useMemo(() => {
    if (isNumberPopupWidth) {
      return null;
    }
    return popupMatchSelectWidth === false ? 'minWidth' : 'width';
  }, [popupMatchSelectWidth, isNumberPopupWidth]);
  let mergedPopupStyle = popupStyle;
  if (isNumberPopupWidth) {
    mergedPopupStyle = {
      ...popupStyle,
      width: popupMatchSelectWidth
    };
  }

  // ======================= Ref =======================
  const triggerPopupRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    getPopupElement: () => triggerPopupRef.current?.popupElement
  }));
  return /*#__PURE__*/React.createElement(_trigger.default, _extends({}, restProps, {
    showAction: onPopupVisibleChange ? ['click'] : [],
    hideAction: onPopupVisibleChange ? ['click'] : [],
    popupPlacement: placement || (direction === 'rtl' ? 'bottomRight' : 'bottomLeft'),
    builtinPlacements: mergedBuiltinPlacements,
    prefixCls: popupPrefixCls,
    popupMotion: {
      motionName: mergedTransitionName
    },
    popup: /*#__PURE__*/React.createElement("div", {
      onMouseEnter: onPopupMouseEnter,
      onMouseDown: onPopupMouseDown,
      onBlur: onPopupBlur
    }, popupNode),
    ref: triggerPopupRef,
    stretch: stretch,
    popupAlign: popupAlign,
    popupVisible: visible,
    getPopupContainer: getPopupContainer,
    popupClassName: (0, _clsx.clsx)(popupClassName, {
      [`${popupPrefixCls}-empty`]: empty
    }),
    popupStyle: mergedPopupStyle,
    onPopupVisibleChange: onPopupVisibleChange
  }), children);
};
const RefSelectTrigger = /*#__PURE__*/React.forwardRef(SelectTrigger);
if (process.env.NODE_ENV !== 'production') {
  RefSelectTrigger.displayName = 'SelectTrigger';
}
var _default = exports.default = RefSelectTrigger;