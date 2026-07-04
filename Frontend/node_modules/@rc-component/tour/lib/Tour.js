"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _clsx = require("clsx");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _useClosable = require("./hooks/useClosable");
var _useTarget = _interopRequireDefault(require("./hooks/useTarget"));
var _Mask = _interopRequireDefault(require("./Mask"));
var _placements = require("./placements");
var _TourStep = _interopRequireDefault(require("./TourStep"));
var _util = require("./util");
var _Placeholder = _interopRequireDefault(require("./Placeholder"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const CENTER_PLACEHOLDER = {
  left: '50%',
  top: '50%',
  width: 1,
  height: 1
};
const defaultScrollIntoViewOptions = {
  block: 'center',
  inline: 'center'
};
const Tour = props => {
  const {
    prefixCls = 'rc-tour',
    steps = [],
    defaultCurrent,
    current,
    keyboard = true,
    onChange,
    onClose,
    onFinish,
    open,
    defaultOpen,
    mask = true,
    arrow = true,
    rootClassName,
    placement,
    renderPanel,
    gap,
    animated,
    scrollIntoViewOptions = defaultScrollIntoViewOptions,
    zIndex = 1001,
    closeIcon,
    closable,
    builtinPlacements,
    disabledInteraction,
    styles,
    classNames: tourClassNames,
    className,
    style,
    getPopupContainer,
    ...restProps
  } = props;
  const triggerRef = React.useRef();
  const [mergedCurrent, setMergedCurrent] = (0, _useControlledState.default)(defaultCurrent || 0, current);
  const [internalOpen, setMergedOpen] = (0, _useControlledState.default)(defaultOpen, open);
  const mergedOpen = mergedCurrent < 0 || mergedCurrent >= steps.length ? false : internalOpen ?? true;

  // Record if already rended in the DOM to avoid `findDOMNode` issue
  const [hasOpened, setHasOpened] = React.useState(mergedOpen);
  const openRef = React.useRef(mergedOpen);
  (0, _useLayoutEffect.default)(() => {
    if (mergedOpen) {
      if (!openRef.current) {
        setMergedCurrent(0);
      }
      setHasOpened(true);
    }
    openRef.current = mergedOpen;
  }, [mergedOpen, setMergedCurrent]);
  const {
    target,
    placement: stepPlacement,
    style: stepStyle,
    arrow: stepArrow,
    className: stepClassName,
    mask: stepMask,
    scrollIntoViewOptions: stepScrollIntoViewOptions = defaultScrollIntoViewOptions,
    closeIcon: stepCloseIcon,
    closable: stepClosable
  } = steps[mergedCurrent] || {};
  const mergedClosable = (0, _useClosable.useClosable)(stepClosable, stepCloseIcon, closable, closeIcon);
  const mergedMask = mergedOpen && (stepMask ?? mask);
  const mergedScrollIntoViewOptions = stepScrollIntoViewOptions ?? scrollIntoViewOptions;

  // ====================== Align Target ======================
  const placeholderRef = React.useRef(null);
  const inlineMode = getPopupContainer === false;
  const [posInfo, targetElement] = (0, _useTarget.default)(target, open, gap, mergedScrollIntoViewOptions, inlineMode, placeholderRef);
  const mergedPlacement = (0, _util.getPlacement)(targetElement, placement, stepPlacement);

  // ========================= arrow =========================
  const mergedArrow = targetElement ? typeof stepArrow === 'undefined' ? arrow : stepArrow : false;
  const arrowPointAtCenter = typeof mergedArrow === 'object' ? mergedArrow.pointAtCenter : false;
  (0, _useLayoutEffect.default)(() => {
    triggerRef.current?.forceAlign();
  }, [arrowPointAtCenter, mergedCurrent]);

  // ========================= Change =========================
  const onInternalChange = nextCurrent => {
    setMergedCurrent(nextCurrent);
    onChange?.(nextCurrent);
  };
  const mergedBuiltinPlacements = (0, _react.useMemo)(() => {
    if (builtinPlacements) {
      return typeof builtinPlacements === 'function' ? builtinPlacements({
        arrowPointAtCenter
      }) : builtinPlacements;
    }
    return (0, _placements.getPlacements)(arrowPointAtCenter);
  }, [builtinPlacements, arrowPointAtCenter]);
  const handleClose = () => {
    setMergedOpen(false);
    onClose?.(mergedCurrent);
  };

  // ========================= Esc Close =========================
  // Use Portal's onEsc to handle Escape key with proper stacking logic
  const handleEscClose = (0, _useEvent.default)(({
    event
  }) => {
    if (keyboard && mergedClosable !== null) {
      event.preventDefault();
      handleClose();
    }
  });

  // ========================= Keyboard =========================
  // Support ArrowLeft/ArrowRight to navigate steps.
  const keyboardHandler = (0, _useEvent.default)(e => {
    // Ignore keyboard events from input-like elements to avoid interfering when typing
    if (_KeyCode.default.isEditableTarget(e)) {
      return;
    }
    if (keyboard && e.key === 'ArrowLeft') {
      if (mergedCurrent > 0) {
        e.preventDefault();
        onInternalChange(mergedCurrent - 1);
      }
      return;
    }
    if (keyboard && e.key === 'ArrowRight') {
      if (mergedCurrent < steps.length - 1) {
        e.preventDefault();
        onInternalChange(mergedCurrent + 1);
      }
      return;
    }
  });
  (0, _useLayoutEffect.default)(() => {
    if (!mergedOpen) return;
    window.addEventListener('keydown', keyboardHandler);
    return () => {
      window.removeEventListener('keydown', keyboardHandler);
    };
  }, [mergedOpen, keyboardHandler]);

  // ========================= Render =========================
  // Skip if not init yet
  if (targetElement === undefined || !hasOpened) {
    return null;
  }
  const getPopupElement = () => /*#__PURE__*/React.createElement(_TourStep.default, _extends({
    styles: styles,
    classNames: tourClassNames,
    arrow: mergedArrow,
    key: "content",
    prefixCls: prefixCls,
    total: steps.length,
    renderPanel: renderPanel,
    onPrev: () => {
      onInternalChange(mergedCurrent - 1);
    },
    onNext: () => {
      onInternalChange(mergedCurrent + 1);
    },
    onClose: handleClose,
    current: mergedCurrent,
    onFinish: () => {
      handleClose();
      onFinish?.();
    }
  }, steps[mergedCurrent], {
    closable: mergedClosable
  }));
  const mergedShowMask = typeof mergedMask === 'boolean' ? mergedMask : !!mergedMask;
  const mergedMaskStyle = typeof mergedMask === 'boolean' ? undefined : mergedMask;

  // when targetElement is not exist, use body as triggerDOMNode
  const fallbackDOM = () => {
    return targetElement || document.body;
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_Mask.default, {
    getPopupContainer: getPopupContainer,
    styles: styles,
    classNames: tourClassNames,
    zIndex: zIndex,
    prefixCls: prefixCls,
    pos: posInfo,
    showMask: mergedShowMask,
    style: mergedMaskStyle?.style,
    fill: mergedMaskStyle?.color,
    open: mergedOpen,
    animated: animated,
    rootClassName: rootClassName,
    disabledInteraction: disabledInteraction,
    onEsc: handleEscClose
  }), /*#__PURE__*/React.createElement(_trigger.default, _extends({}, restProps, {
    // `rc-portal` def bug not support `false` but does support and in used.
    getPopupContainer: getPopupContainer,
    builtinPlacements: mergedBuiltinPlacements,
    ref: triggerRef,
    popupStyle: stepStyle,
    popupPlacement: mergedPlacement,
    popupVisible: mergedOpen,
    popupClassName: (0, _clsx.clsx)(rootClassName, stepClassName),
    prefixCls: prefixCls,
    popup: getPopupElement,
    forceRender: false,
    autoDestroy: true,
    zIndex: zIndex,
    arrow: !!mergedArrow
  }), /*#__PURE__*/React.createElement(_Placeholder.default, {
    open: mergedOpen,
    autoLock: !inlineMode,
    getContainer: getPopupContainer,
    domRef: placeholderRef,
    fallbackDOM: fallbackDOM,
    className: (0, _clsx.clsx)(className, rootClassName, `${prefixCls}-target-placeholder`),
    style: {
      ...(posInfo || CENTER_PLACEHOLDER),
      position: inlineMode ? 'absolute' : 'fixed',
      pointerEvents: 'none',
      ...style
    }
  })));
};
var _default = exports.default = Tour;