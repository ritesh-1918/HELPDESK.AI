"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SkipStep = exports.DoStep = void 0;
exports.isActive = isActive;
var _useState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useState"));
var React = _interopRequireWildcard(require("react"));
var _interface = require("../interface");
var _useIsomorphicLayoutEffect = _interopRequireDefault(require("./useIsomorphicLayoutEffect"));
var _useNextFrame = _interopRequireDefault(require("./useNextFrame"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const FULL_STEP_QUEUE = [_interface.STEP_PREPARE, _interface.STEP_START, _interface.STEP_ACTIVE, _interface.STEP_ACTIVATED];
const SIMPLE_STEP_QUEUE = [_interface.STEP_PREPARE, _interface.STEP_PREPARED];

/** Skip current step */
const SkipStep = exports.SkipStep = false;
/** Current step should be update in */
const DoStep = exports.DoStep = true;
function isActive(step) {
  return step === _interface.STEP_ACTIVE || step === _interface.STEP_ACTIVATED;
}
var _default = (status, prepareOnly, callback) => {
  const [step, setStep] = (0, _useState.default)(_interface.STEP_NONE);
  const [nextFrame, cancelNextFrame] = (0, _useNextFrame.default)();
  function startQueue() {
    setStep(_interface.STEP_PREPARE, true);
  }
  const STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
  (0, _useIsomorphicLayoutEffect.default)(() => {
    if (step !== _interface.STEP_NONE && step !== _interface.STEP_ACTIVATED) {
      const index = STEP_QUEUE.indexOf(step);
      const nextStep = STEP_QUEUE[index + 1];
      const result = callback(step);
      if (result === SkipStep) {
        // Skip when no needed
        setStep(nextStep, true);
      } else if (nextStep) {
        // Do as frame for step update
        nextFrame(info => {
          function doNext() {
            // Skip since current queue is ood
            if (info.isCanceled()) return;
            setStep(nextStep, true);
          }
          if (result === true) {
            doNext();
          } else {
            // Only promise should be async
            Promise.resolve(result).then(doNext);
          }
        });
      }
    }
  }, [status, step]);
  React.useEffect(() => () => {
    cancelNextFrame();
  }, []);
  return [startQueue, step];
};
exports.default = _default;