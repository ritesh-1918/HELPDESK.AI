"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTargetState;
var _react = _interopRequireDefault(require("react"));
var _util = require("@rc-component/util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 * 4. During appear/enter animation, cache new options and apply after animation completes.
 */
function useTargetState() {
  const [options, setOptions] = _react.default.useState(null);
  const [open, setOpen] = _react.default.useState(false);
  const [isAnimating, setIsAnimating] = _react.default.useState(false);
  const pendingOptionsRef = _react.default.useRef(null);
  const trigger = (0, _util.useEvent)(nextOptions => {
    if (nextOptions === false) {
      // Clear pending options when hiding
      pendingOptionsRef.current = null;
      setOpen(false);
    } else {
      if (isAnimating && open) {
        // If animating (appear or enter), cache new options
        pendingOptionsRef.current = nextOptions;
      } else {
        setOpen(true);
        // Set new options
        setOptions(nextOptions);
        pendingOptionsRef.current = null;

        // Only mark as animating when transitioning from closed to open
        if (!open) {
          setIsAnimating(true);
        }
      }
    }
  });
  const onVisibleChanged = (0, _util.useEvent)(visible => {
    if (visible) {
      // Animation enter completed, check if there are pending options
      setIsAnimating(false);
      if (pendingOptionsRef.current) {
        // Apply pending options
        setOptions(pendingOptionsRef.current);
        pendingOptionsRef.current = null;
      }
    } else {
      // Animation leave completed
      setIsAnimating(false);
      pendingOptionsRef.current = null;
    }
  });
  return [trigger, open, options, onVisibleChanged];
}