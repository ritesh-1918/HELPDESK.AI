function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import Trigger from '@rc-component/trigger';
import { clsx } from 'clsx';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import useEvent from "@rc-component/util/es/hooks/useEvent";
import KeyCode from "@rc-component/util/es/KeyCode";
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import { useMemo } from 'react';
import { useClosable } from "./hooks/useClosable";
import useTarget from "./hooks/useTarget";
import Mask from "./Mask";
import { getPlacements } from "./placements";
import TourStep from "./TourStep";
import { getPlacement } from "./util";
import Placeholder from "./Placeholder";
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
  const [mergedCurrent, setMergedCurrent] = useControlledState(defaultCurrent || 0, current);
  const [internalOpen, setMergedOpen] = useControlledState(defaultOpen, open);
  const mergedOpen = mergedCurrent < 0 || mergedCurrent >= steps.length ? false : internalOpen ?? true;

  // Record if already rended in the DOM to avoid `findDOMNode` issue
  const [hasOpened, setHasOpened] = React.useState(mergedOpen);
  const openRef = React.useRef(mergedOpen);
  useLayoutEffect(() => {
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
  const mergedClosable = useClosable(stepClosable, stepCloseIcon, closable, closeIcon);
  const mergedMask = mergedOpen && (stepMask ?? mask);
  const mergedScrollIntoViewOptions = stepScrollIntoViewOptions ?? scrollIntoViewOptions;

  // ====================== Align Target ======================
  const placeholderRef = React.useRef(null);
  const inlineMode = getPopupContainer === false;
  const [posInfo, targetElement] = useTarget(target, open, gap, mergedScrollIntoViewOptions, inlineMode, placeholderRef);
  const mergedPlacement = getPlacement(targetElement, placement, stepPlacement);

  // ========================= arrow =========================
  const mergedArrow = targetElement ? typeof stepArrow === 'undefined' ? arrow : stepArrow : false;
  const arrowPointAtCenter = typeof mergedArrow === 'object' ? mergedArrow.pointAtCenter : false;
  useLayoutEffect(() => {
    triggerRef.current?.forceAlign();
  }, [arrowPointAtCenter, mergedCurrent]);

  // ========================= Change =========================
  const onInternalChange = nextCurrent => {
    setMergedCurrent(nextCurrent);
    onChange?.(nextCurrent);
  };
  const mergedBuiltinPlacements = useMemo(() => {
    if (builtinPlacements) {
      return typeof builtinPlacements === 'function' ? builtinPlacements({
        arrowPointAtCenter
      }) : builtinPlacements;
    }
    return getPlacements(arrowPointAtCenter);
  }, [builtinPlacements, arrowPointAtCenter]);
  const handleClose = () => {
    setMergedOpen(false);
    onClose?.(mergedCurrent);
  };

  // ========================= Esc Close =========================
  // Use Portal's onEsc to handle Escape key with proper stacking logic
  const handleEscClose = useEvent(({
    event
  }) => {
    if (keyboard && mergedClosable !== null) {
      event.preventDefault();
      handleClose();
    }
  });

  // ========================= Keyboard =========================
  // Support ArrowLeft/ArrowRight to navigate steps.
  const keyboardHandler = useEvent(e => {
    // Ignore keyboard events from input-like elements to avoid interfering when typing
    if (KeyCode.isEditableTarget(e)) {
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
  useLayoutEffect(() => {
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
  const getPopupElement = () => /*#__PURE__*/React.createElement(TourStep, _extends({
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Mask, {
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
  }), /*#__PURE__*/React.createElement(Trigger, _extends({}, restProps, {
    // `rc-portal` def bug not support `false` but does support and in used.
    getPopupContainer: getPopupContainer,
    builtinPlacements: mergedBuiltinPlacements,
    ref: triggerRef,
    popupStyle: stepStyle,
    popupPlacement: mergedPlacement,
    popupVisible: mergedOpen,
    popupClassName: clsx(rootClassName, stepClassName),
    prefixCls: prefixCls,
    popup: getPopupElement,
    forceRender: false,
    autoDestroy: true,
    zIndex: zIndex,
    arrow: !!mergedArrow
  }), /*#__PURE__*/React.createElement(Placeholder, {
    open: mergedOpen,
    autoLock: !inlineMode,
    getContainer: getPopupContainer,
    domRef: placeholderRef,
    fallbackDOM: fallbackDOM,
    className: clsx(className, rootClassName, `${prefixCls}-target-placeholder`),
    style: {
      ...(posInfo || CENTER_PLACEHOLDER),
      position: inlineMode ? 'absolute' : 'fixed',
      pointerEvents: 'none',
      ...style
    }
  })));
};
export default Tour;