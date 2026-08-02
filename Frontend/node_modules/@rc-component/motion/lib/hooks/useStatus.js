"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useStatus;
var _util = require("@rc-component/util");
var _useState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useState"));
var _useSyncState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useSyncState"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _interface = require("../interface");
var _useDomMotionEvents = _interopRequireDefault(require("./useDomMotionEvents"));
var _useIsomorphicLayoutEffect = _interopRequireDefault(require("./useIsomorphicLayoutEffect"));
var _useStepQueue = _interopRequireWildcard(require("./useStepQueue"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useStatus(supportMotion, visible, getElement, {
  motionEnter = true,
  motionAppear = true,
  motionLeave = true,
  motionDeadline,
  motionLeaveImmediately,
  onAppearPrepare,
  onEnterPrepare,
  onLeavePrepare,
  onAppearStart,
  onEnterStart,
  onLeaveStart,
  onAppearActive,
  onEnterActive,
  onLeaveActive,
  onAppearEnd,
  onEnterEnd,
  onLeaveEnd,
  onVisibleChanged
}) {
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const [asyncVisible, setAsyncVisible] = (0, _useState.default)();
  const [getStatus, setStatus] = (0, _useSyncState.default)(_interface.STATUS_NONE);
  const [style, setStyle] = (0, _useState.default)(null);
  const currentStatus = getStatus();
  const mountedRef = (0, _react.useRef)(false);
  const deadlineRef = (0, _react.useRef)(null);

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement();
  }

  // ========================== Motion End ==========================
  const activeRef = (0, _react.useRef)(false);

  /**
   * Clean up status & style
   */
  function updateMotionEndStatus() {
    setStatus(_interface.STATUS_NONE);
    setStyle(null, true);
  }
  const onInternalMotionEnd = (0, _util.useEvent)(event => {
    const status = getStatus();
    // Do nothing since not in any transition status.
    // This may happen when `motionDeadline` trigger.
    if (status === _interface.STATUS_NONE) {
      return;
    }
    const element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return;
    }
    const currentActive = activeRef.current;
    let canEnd;
    if (status === _interface.STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd?.(element, event);
    } else if (status === _interface.STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd?.(element, event);
    } else if (status === _interface.STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd?.(element, event);
    }

    // Only update status when `canEnd` and not destroyed
    if (currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  });
  const [patchMotionEvents] = (0, _useDomMotionEvents.default)(onInternalMotionEnd);

  // ============================= Step =============================
  const getEventHandlers = targetStatus => {
    switch (targetStatus) {
      case _interface.STATUS_APPEAR:
        return {
          [_interface.STEP_PREPARE]: onAppearPrepare,
          [_interface.STEP_START]: onAppearStart,
          [_interface.STEP_ACTIVE]: onAppearActive
        };
      case _interface.STATUS_ENTER:
        return {
          [_interface.STEP_PREPARE]: onEnterPrepare,
          [_interface.STEP_START]: onEnterStart,
          [_interface.STEP_ACTIVE]: onEnterActive
        };
      case _interface.STATUS_LEAVE:
        return {
          [_interface.STEP_PREPARE]: onLeavePrepare,
          [_interface.STEP_START]: onLeaveStart,
          [_interface.STEP_ACTIVE]: onLeaveActive
        };
      default:
        return {};
    }
  };
  const eventHandlers = React.useMemo(() => getEventHandlers(currentStatus), [currentStatus]);
  const [startStep, step] = (0, _useStepQueue.default)(currentStatus, !supportMotion, newStep => {
    // Only prepare step can be skip
    if (newStep === _interface.STEP_PREPARE) {
      const onPrepare = eventHandlers[_interface.STEP_PREPARE];
      if (!onPrepare) {
        return _useStepQueue.SkipStep;
      }
      return onPrepare(getDomElement());
    }

    // Rest step is sync update
    if (step in eventHandlers) {
      setStyle(eventHandlers[step]?.(getDomElement(), null) || null);
    }
    if (step === _interface.STEP_ACTIVE && currentStatus !== _interface.STATUS_NONE) {
      // Patch events when motion needed
      patchMotionEvents(getDomElement());
      if (motionDeadline > 0) {
        clearTimeout(deadlineRef.current);
        deadlineRef.current = setTimeout(() => {
          onInternalMotionEnd({
            deadline: true
          });
        }, motionDeadline);
      }
    }
    if (step === _interface.STEP_PREPARED) {
      updateMotionEndStatus();
    }
    return _useStepQueue.DoStep;
  });
  const active = (0, _useStepQueue.isActive)(step);
  activeRef.current = active;

  // ============================ Status ============================
  const visibleRef = (0, _react.useRef)(null);

  // Update with new status
  (0, _useIsomorphicLayoutEffect.default)(() => {
    // When use Suspense, the `visible` will repeat trigger,
    // But not real change of the `visible`, we need to skip it.
    // https://github.com/ant-design/ant-design/issues/44379
    if (mountedRef.current && visibleRef.current === visible) {
      return;
    }
    setAsyncVisible(visible);
    const isMounted = mountedRef.current;
    mountedRef.current = true;

    // if (!supportMotion) {
    //   return;
    // }

    let nextStatus;

    // Appear
    if (!isMounted && visible && motionAppear) {
      nextStatus = _interface.STATUS_APPEAR;
    }

    // Enter
    if (isMounted && visible && motionEnter) {
      nextStatus = _interface.STATUS_ENTER;
    }

    // Leave
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = _interface.STATUS_LEAVE;
    }
    const nextEventHandlers = getEventHandlers(nextStatus);

    // Update to next status
    if (nextStatus && (supportMotion || nextEventHandlers[_interface.STEP_PREPARE])) {
      setStatus(nextStatus);
      startStep();
    } else {
      // Set back in case no motion but prev status has prepare step
      setStatus(_interface.STATUS_NONE);
    }
    visibleRef.current = visible;
  }, [visible]);

  // ============================ Effect ============================
  // Reset when motion changed
  (0, _react.useEffect)(() => {
    if (
    // Cancel appear
    currentStatus === _interface.STATUS_APPEAR && !motionAppear ||
    // Cancel enter
    currentStatus === _interface.STATUS_ENTER && !motionEnter ||
    // Cancel leave
    currentStatus === _interface.STATUS_LEAVE && !motionLeave) {
      setStatus(_interface.STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0, _react.useEffect)(() => () => {
    mountedRef.current = false;
    clearTimeout(deadlineRef.current);
  }, []);

  // Trigger `onVisibleChanged`
  const firstMountChangeRef = React.useRef(false);
  (0, _react.useEffect)(() => {
    // [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== undefined && currentStatus === _interface.STATUS_NONE) {
      // Skip first render is invisible since it's nothing changed
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged?.(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, currentStatus]);

  // ============================ Styles ============================
  let mergedStyle = style;
  if (eventHandlers[_interface.STEP_PREPARE] && step === _interface.STEP_START) {
    mergedStyle = {
      transition: 'none',
      ...mergedStyle
    };
  }
  return [getStatus, step, mergedStyle, asyncVisible ?? visible];
}