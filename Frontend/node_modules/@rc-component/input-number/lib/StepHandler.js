"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = StepHandler;
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable react/no-unknown-property */

/**
 * When click and hold on a button - the speed of auto changing the value.
 */
const STEP_INTERVAL = 200;

/**
 * When click and hold on a button - the delay before auto changing the value.
 */
const STEP_DELAY = 600;
function StepHandler({
  prefixCls,
  action,
  children,
  disabled,
  className,
  style,
  onStep
}) {
  // ======================== MISC ========================
  const isUpAction = action === 'up';

  // ======================== Step ========================
  const stepTimeoutRef = React.useRef();
  const frameIds = React.useRef([]);
  const onStopStep = () => {
    clearTimeout(stepTimeoutRef.current);
  };

  // We will interval update step when hold mouse down
  const onStepMouseDown = e => {
    e.preventDefault();
    onStopStep();
    onStep(isUpAction, 'handler');

    // Loop step for interval
    function loopStep() {
      onStep(isUpAction, 'handler');
      stepTimeoutRef.current = setTimeout(loopStep, STEP_INTERVAL);
    }

    // First time press will wait some time to trigger loop step update
    stepTimeoutRef.current = setTimeout(loopStep, STEP_DELAY);
  };
  React.useEffect(() => () => {
    onStopStep();
    frameIds.current.forEach(id => {
      _raf.default.cancel(id);
    });
  }, []);

  // ======================= Render =======================
  const actionClassName = `${prefixCls}-action`;
  const mergedClassName = (0, _clsx.clsx)(actionClassName, `${actionClassName}-${action}`, {
    [`${actionClassName}-${action}-disabled`]: disabled
  }, className);

  // fix: https://github.com/ant-design/ant-design/issues/43088
  // In Safari, When we fire onmousedown and onmouseup events in quick succession,
  // there may be a problem that the onmouseup events are executed first,
  // resulting in a disordered program execution.
  // So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
  const safeOnStopStep = () => frameIds.current.push((0, _raf.default)(onStopStep));
  return /*#__PURE__*/React.createElement("span", {
    unselectable: "on",
    role: "button",
    onMouseUp: safeOnStopStep,
    onMouseLeave: safeOnStopStep,
    onMouseDown: e => {
      onStepMouseDown(e);
    },
    "aria-label": isUpAction ? 'Increase Value' : 'Decrease Value',
    "aria-disabled": disabled,
    className: mergedClassName,
    style: style
  }, children || /*#__PURE__*/React.createElement("span", {
    unselectable: "on",
    className: `${prefixCls}-action-${action}-inner`
  }));
}