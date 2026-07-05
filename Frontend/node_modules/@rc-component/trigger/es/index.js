import Portal from '@rc-component/portal';
import { clsx } from 'clsx';
import { useResizeObserver } from '@rc-component/resize-observer';
import { getDOM, isDOM } from "@rc-component/util/es/Dom/findDOMNode";
import { getShadowRoot } from "@rc-component/util/es/Dom/shadow";
import { getNodeRef, useComposeRef } from "@rc-component/util/es/ref";
import useEvent from "@rc-component/util/es/hooks/useEvent";
import useId from "@rc-component/util/es/hooks/useId";
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import * as React from 'react';
import Popup from "./Popup";
import TriggerContext, { UniqueContext } from "./context";
import useAction from "./hooks/useAction";
import useAlign from "./hooks/useAlign";
import useDelay from "./hooks/useDelay";
import useWatch from "./hooks/useWatch";
import useWinClick from "./hooks/useWinClick";
import { getAlignPopupClassName } from "./util";
import UniqueProvider from "./UniqueProvider";
import { useControlledState } from '@rc-component/util';
import { flushSync } from 'react-dom';
export { UniqueProvider };

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export function generateTrigger(PortalComponent = Portal) {
  const Trigger = /*#__PURE__*/React.forwardRef((props, ref) => {
    const {
      prefixCls = 'rc-trigger-popup',
      children,
      // Action
      action = 'hover',
      showAction,
      hideAction,
      // Open
      popupVisible,
      defaultPopupVisible,
      onOpenChange,
      afterOpenChange,
      onPopupVisibleChange,
      afterPopupVisibleChange,
      // Delay
      mouseEnterDelay,
      mouseLeaveDelay = 0.1,
      focusDelay,
      blurDelay,
      // Mask
      mask,
      maskClosable = true,
      // Portal
      getPopupContainer,
      forceRender,
      autoDestroy,
      // Popup
      popup,
      popupClassName,
      uniqueContainerClassName,
      uniqueContainerStyle,
      popupStyle,
      popupPlacement,
      builtinPlacements = {},
      popupAlign,
      zIndex,
      stretch,
      getPopupClassNameFromAlign,
      fresh,
      unique,
      alignPoint,
      onPopupClick,
      onPopupAlign,
      // Arrow
      arrow,
      // Motion
      popupMotion,
      maskMotion,
      // Private
      mobile,
      ...restProps
    } = props;
    const mergedAutoDestroy = autoDestroy || false;
    const openUncontrolled = popupVisible === undefined;

    // =========================== Mobile ===========================
    const isMobile = !!mobile;

    // ========================== Context ===========================
    const subPopupElements = React.useRef({});
    const parentContext = React.useContext(TriggerContext);
    const context = React.useMemo(() => {
      return {
        registerSubPopup: (id, subPopupEle) => {
          subPopupElements.current[id] = subPopupEle;
          parentContext?.registerSubPopup(id, subPopupEle);
        }
      };
    }, [parentContext]);

    // ======================== UniqueContext =========================
    const uniqueContext = React.useContext(UniqueContext);

    // =========================== Popup ============================
    const id = useId();
    const [popupEle, setPopupEle] = React.useState(null);

    // Used for forwardRef popup. Not use internal
    const externalPopupRef = React.useRef(null);
    const setPopupRef = useEvent(node => {
      externalPopupRef.current = node;
      if (isDOM(node) && popupEle !== node) {
        setPopupEle(node);
      }
      parentContext?.registerSubPopup(id, node);
    });

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    const [targetEle, setTargetEle] = React.useState(null);

    // Used for forwardRef target. Not use internal
    const externalForwardRef = React.useRef(null);
    const setTargetRef = useEvent(node => {
      const domNode = getDOM(node);
      if (isDOM(domNode) && targetEle !== domNode) {
        setTargetEle(domNode);
        externalForwardRef.current = domNode;
      }
    });
    const cloneProps = {};
    const inPopupOrChild = useEvent(ele => {
      const childDOM = targetEle;
      return childDOM?.contains(ele) || getShadowRoot(childDOM)?.host === ele || ele === childDOM || popupEle?.contains(ele) || getShadowRoot(popupEle)?.host === ele || ele === popupEle || Object.values(subPopupElements.current).some(subPopupEle => subPopupEle?.contains(ele) || ele === subPopupEle);
    });

    // =========================== Arrow ============================
    const innerArrow = arrow ? {
      // true and Object likely
      ...(arrow !== true ? arrow : {})
    } : null;

    // ============================ Open ============================
    const [internalOpen, setInternalOpen] = useControlledState(defaultPopupVisible || false, popupVisible);
    const mergedOpen = internalOpen || false;

    // ========================== Children ==========================
    const child = React.useMemo(() => {
      const nextChild = typeof children === 'function' ? children({
        open: mergedOpen
      }) : children;
      return React.Children.only(nextChild);
    }, [children, mergedOpen]);
    const originChildProps = child?.props || {};

    // Support ref
    const isOpen = useEvent(() => mergedOpen);

    // Extract common options for UniqueProvider
    const getUniqueOptions = useEvent((delay = 0) => ({
      popup,
      target: targetEle,
      delay,
      prefixCls,
      popupClassName,
      uniqueContainerClassName,
      uniqueContainerStyle,
      popupStyle,
      popupPlacement,
      builtinPlacements,
      popupAlign,
      zIndex,
      mask,
      maskClosable,
      popupMotion,
      maskMotion,
      arrow: innerArrow,
      getPopupContainer,
      getPopupClassNameFromAlign,
      id,
      onEsc
    }));

    // Handle controlled state changes for UniqueProvider
    // Only sync to UniqueProvider when it's controlled mode
    // If there is a parentContext, don't call uniqueContext methods
    useLayoutEffect(() => {
      if (uniqueContext && unique && targetEle && !openUncontrolled && !parentContext) {
        if (mergedOpen) {
          uniqueContext.show(getUniqueOptions(mouseEnterDelay), isOpen);
        } else {
          uniqueContext.hide(mouseLeaveDelay);
        }
      }
    }, [mergedOpen, targetEle]);
    const openRef = React.useRef(mergedOpen);
    openRef.current = mergedOpen;
    const internalTriggerOpen = useEvent(nextOpen => {
      flushSync(() => {
        if (mergedOpen !== nextOpen) {
          setInternalOpen(nextOpen);
          onOpenChange?.(nextOpen);
          onPopupVisibleChange?.(nextOpen);
        }
      });
    });

    // Trigger for delay
    const delayInvoke = useDelay();
    const triggerOpen = (nextOpen, delay = 0) => {
      // If it's controlled mode, always use internal trigger logic
      // UniqueProvider will be synced through useLayoutEffect
      if (popupVisible !== undefined) {
        delayInvoke(() => {
          internalTriggerOpen(nextOpen);
        }, delay);
        return;
      }

      // If UniqueContext exists and not controlled, pass delay to Provider instead of handling it internally
      // If there is a parentContext, don't call uniqueContext methods
      if (uniqueContext && unique && openUncontrolled && !parentContext) {
        if (nextOpen) {
          uniqueContext.show(getUniqueOptions(delay), isOpen);
        } else {
          uniqueContext.hide(delay);
        }
        return;
      }
      delayInvoke(() => {
        internalTriggerOpen(nextOpen);
      }, delay);
    };
    function onEsc({
      top
    }) {
      if (top) {
        triggerOpen(false);
      }
    }

    // ========================== Motion ============================
    const [inMotion, setInMotion] = React.useState(false);
    useLayoutEffect(firstMount => {
      if (!firstMount || mergedOpen) {
        setInMotion(true);
      }
    }, [mergedOpen]);
    const [motionPrepareResolve, setMotionPrepareResolve] = React.useState(null);

    // =========================== Align ============================
    const [mousePos, setMousePos] = React.useState(null);
    const setMousePosByEvent = event => {
      setMousePos([event.clientX, event.clientY]);
    };
    const [ready, offsetX, offsetY, offsetR, offsetB, arrowX, arrowY, scaleX, scaleY, alignInfo, onAlign] = useAlign(mergedOpen, popupEle, alignPoint && mousePos !== null ? mousePos : targetEle, popupPlacement, builtinPlacements, popupAlign, onPopupAlign, isMobile);
    const [showActions, hideActions] = useAction(action, showAction, hideAction);
    const clickToShow = showActions.has('click');
    const clickToHide = hideActions.has('click') || hideActions.has('contextMenu');
    const triggerAlign = useEvent(() => {
      if (!inMotion) {
        onAlign();
      }
    });
    const onScroll = () => {
      if (openRef.current && alignPoint && clickToHide) {
        triggerOpen(false);
      }
    };
    useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);
    useLayoutEffect(() => {
      triggerAlign();
    }, [mousePos, popupPlacement]);

    // When no builtinPlacements and popupAlign changed
    useLayoutEffect(() => {
      if (mergedOpen && !builtinPlacements?.[popupPlacement]) {
        triggerAlign();
      }
    }, [JSON.stringify(popupAlign)]);
    const alignedClassName = React.useMemo(() => {
      const baseClassName = getAlignPopupClassName(builtinPlacements, prefixCls, alignInfo, alignPoint);
      return clsx(baseClassName, getPopupClassNameFromAlign?.(alignInfo));
    }, [alignInfo, getPopupClassNameFromAlign, builtinPlacements, prefixCls, alignPoint]);

    // ============================ Refs ============================
    React.useImperativeHandle(ref, () => ({
      nativeElement: externalForwardRef.current,
      popupElement: externalPopupRef.current,
      forceAlign: triggerAlign
    }));

    // ========================== Stretch ===========================
    const [targetWidth, setTargetWidth] = React.useState(0);
    const [targetHeight, setTargetHeight] = React.useState(0);
    const syncTargetSize = () => {
      if (stretch && targetEle) {
        const rect = targetEle.getBoundingClientRect();
        setTargetWidth(rect.width);
        setTargetHeight(rect.height);
      }
    };
    const onTargetResize = () => {
      syncTargetSize();
      triggerAlign();
    };

    // ========================== Motion ============================
    const onVisibleChanged = visible => {
      setInMotion(false);
      onAlign();
      afterOpenChange?.(visible);
      afterPopupVisibleChange?.(visible);
    };

    // We will trigger align when motion is in prepare
    const onPrepare = () => new Promise(resolve => {
      syncTargetSize();
      setMotionPrepareResolve(() => resolve);
    });
    useLayoutEffect(() => {
      if (motionPrepareResolve) {
        onAlign();
        motionPrepareResolve();
        setMotionPrepareResolve(null);
      }
    }, [motionPrepareResolve]);

    // =========================== Action ===========================
    /**
     * Util wrapper for trigger action
     * @param eventName  Listen event name
     * @param nextOpen  Next open state after trigger
     * @param delay Delay to trigger open change
     * @param callback Callback if current event need additional action
     * @param ignoreCheck  Ignore current event if check return true
     */
    function wrapperAction(eventName, nextOpen, delay, callback, ignoreCheck) {
      cloneProps[eventName] = (event, ...args) => {
        if (!ignoreCheck || !ignoreCheck()) {
          callback?.(event);
          triggerOpen(nextOpen, delay);
        }

        // Pass to origin
        originChildProps[eventName]?.(event, ...args);
      };
    }

    // ======================= Action: Touch ========================
    const touchToShow = showActions.has('touch');
    const touchToHide = hideActions.has('touch');

    /** Used for prevent `hover` event conflict with mobile env */
    const touchedRef = React.useRef(false);
    if (touchToShow || touchToHide) {
      cloneProps.onTouchStart = (...args) => {
        touchedRef.current = true;
        if (openRef.current && touchToHide) {
          triggerOpen(false);
        } else if (!openRef.current && touchToShow) {
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.onTouchStart?.(...args);
      };
    }

    // ======================= Action: Click ========================
    if (clickToShow || clickToHide) {
      cloneProps.onClick = (event, ...args) => {
        if (openRef.current && clickToHide) {
          triggerOpen(false);
        } else if (!openRef.current && clickToShow) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.onClick?.(event, ...args);
        touchedRef.current = false;
      };
    }

    // Click to hide is special action since click popup element should not hide
    const onPopupPointerDown = useWinClick(mergedOpen, clickToHide || touchToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen);

    // ======================= Action: Hover ========================
    const hoverToShow = showActions.has('hover');
    const hoverToHide = hideActions.has('hover');
    let onPopupMouseEnter;
    let onPopupMouseLeave;
    const ignoreMouseTrigger = () => {
      return touchedRef.current;
    };
    if (hoverToShow) {
      const onMouseEnterCallback = event => {
        setMousePosByEvent(event);
      };

      // Compatible with old browser which not support pointer event
      wrapperAction('onMouseEnter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
      wrapperAction('onPointerEnter', true, mouseEnterDelay, onMouseEnterCallback, ignoreMouseTrigger);
      onPopupMouseEnter = event => {
        // Only trigger re-open when popup is visible
        if ((mergedOpen || inMotion) && popupEle?.contains(event.target)) {
          triggerOpen(true, mouseEnterDelay);
        }
      };

      // Align Point
      if (alignPoint) {
        cloneProps.onMouseMove = event => {
          originChildProps.onMouseMove?.(event);
        };
      }
    }
    if (hoverToHide) {
      wrapperAction('onMouseLeave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);
      wrapperAction('onPointerLeave', false, mouseLeaveDelay, undefined, ignoreMouseTrigger);
      onPopupMouseLeave = () => {
        triggerOpen(false, mouseLeaveDelay);
      };
    }

    // ======================= Action: Focus ========================
    if (showActions.has('focus')) {
      wrapperAction('onFocus', true, focusDelay);
    }
    if (hideActions.has('focus')) {
      wrapperAction('onBlur', false, blurDelay);
    }

    // ==================== Action: ContextMenu =====================
    if (showActions.has('contextMenu')) {
      cloneProps.onContextMenu = (event, ...args) => {
        if (openRef.current && hideActions.has('contextMenu')) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }
        event.preventDefault();

        // Pass to origin
        originChildProps.onContextMenu?.(event, ...args);
      };
    }

    // ============================ Perf ============================
    const rendedRef = React.useRef(false);
    rendedRef.current ||= forceRender || mergedOpen || inMotion;

    // =========================== Render ===========================
    const mergedChildrenProps = {
      ...originChildProps,
      ...cloneProps
    };

    // Pass props into cloneProps for nest usage
    const passedProps = {};
    const passedEventList = ['onContextMenu', 'onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur'];
    passedEventList.forEach(eventName => {
      if (restProps[eventName]) {
        passedProps[eventName] = (...args) => {
          mergedChildrenProps[eventName]?.(...args);
          restProps[eventName](...args);
        };
      }
    });
    const arrowPos = {
      x: arrowX,
      y: arrowY
    };

    // =================== Resize Observer ===================
    // Use hook to observe target element resize
    // Pass targetEle directly instead of a function so the hook will re-observe when target changes
    useResizeObserver(mergedOpen, targetEle, onTargetResize);

    // Compose refs
    const mergedRef = useComposeRef(setTargetRef, getNodeRef(child));

    // Child Node
    const triggerNode = /*#__PURE__*/React.cloneElement(child, {
      ...mergedChildrenProps,
      ...passedProps,
      ref: mergedRef
    });

    // Render
    return /*#__PURE__*/React.createElement(React.Fragment, null, triggerNode, rendedRef.current && (!uniqueContext || !unique) && /*#__PURE__*/React.createElement(TriggerContext.Provider, {
      value: context
    }, /*#__PURE__*/React.createElement(Popup, {
      portal: PortalComponent,
      ref: setPopupRef,
      prefixCls: prefixCls,
      popup: popup,
      className: clsx(popupClassName, !isMobile && alignedClassName),
      style: popupStyle,
      target: targetEle,
      onMouseEnter: onPopupMouseEnter,
      onMouseLeave: onPopupMouseLeave
      // https://github.com/ant-design/ant-design/issues/43924
      ,
      onPointerEnter: onPopupMouseEnter,
      zIndex: zIndex
      // Open
      ,
      open: mergedOpen,
      keepDom: inMotion,
      fresh: fresh
      // Click
      ,
      onClick: onPopupClick,
      onPointerDownCapture: onPopupPointerDown
      // Mask
      ,
      mask: mask
      // Motion
      ,
      motion: popupMotion,
      maskMotion: maskMotion,
      onVisibleChanged: onVisibleChanged,
      onPrepare: onPrepare
      // Portal
      ,
      forceRender: forceRender,
      autoDestroy: mergedAutoDestroy,
      getPopupContainer: getPopupContainer,
      onEsc: onEsc
      // Arrow
      ,
      align: alignInfo,
      arrow: innerArrow,
      arrowPos: arrowPos
      // Align
      ,
      ready: ready,
      offsetX: offsetX,
      offsetY: offsetY,
      offsetR: offsetR,
      offsetB: offsetB,
      onAlign: triggerAlign
      // Stretch
      ,
      stretch: stretch,
      targetWidth: targetWidth / scaleX,
      targetHeight: targetHeight / scaleY
      // Mobile
      ,
      mobile: mobile
    })));
  });
  if (process.env.NODE_ENV !== 'production') {
    Trigger.displayName = 'Trigger';
  }
  return Trigger;
}
export default generateTrigger(Portal);