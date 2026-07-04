"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useFocusable;
var _react = _interopRequireDefault(require("react"));
var _focus = require("@rc-component/util/lib/Dom/focus");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useFocusable(getContainer, open, autoFocus, focusTrap, mask) {
  const mergedFocusTrap = focusTrap ?? mask !== false;

  // Focus lock
  const [ignoreElement] = (0, _focus.useLockFocus)(open && mergedFocusTrap, getContainer);

  // Auto Focus
  _react.default.useEffect(() => {
    if (open && autoFocus === true) {
      getContainer()?.focus({
        preventScroll: true
      });
    }
  }, [open]);
  return ignoreElement;
}