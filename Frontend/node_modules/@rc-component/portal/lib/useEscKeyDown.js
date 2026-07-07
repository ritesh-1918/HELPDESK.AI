"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._test = void 0;
exports.default = useEscKeyDown;
var _util = require("@rc-component/util");
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _react = require("react");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let stack = [];
const IME_LOCK_DURATION = 200;
let lastCompositionEndTime = 0;

// Export for testing
const _test = exports._test = process.env.NODE_ENV === 'test' ? () => ({
  stack,
  reset: () => {
    // Not reset stack to ensure effect will clean up correctly
    lastCompositionEndTime = 0;
  }
}) : null;

// Global event handlers
const onGlobalKeyDown = event => {
  if (event.key === 'Escape' && !event.isComposing) {
    const now = Date.now();
    if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
      return;
    }
    const len = stack.length;
    for (let i = len - 1; i >= 0; i -= 1) {
      stack[i].onEsc({
        top: i === len - 1,
        event
      });
    }
  }
};
const onGlobalCompositionEnd = () => {
  lastCompositionEndTime = Date.now();
};
function attachGlobalEventListeners() {
  window.addEventListener('keydown', onGlobalKeyDown);
  window.addEventListener('compositionend', onGlobalCompositionEnd);
}
function detachGlobalEventListeners() {
  if (stack.length === 0) {
    window.removeEventListener('keydown', onGlobalKeyDown);
    window.removeEventListener('compositionend', onGlobalCompositionEnd);
  }
}
function useEscKeyDown(open, onEsc) {
  const id = (0, _useId.default)();
  const onEventEsc = (0, _util.useEvent)(onEsc);
  const ensure = () => {
    if (!stack.find(item => item.id === id)) {
      stack.push({
        id,
        onEsc: onEventEsc
      });
    }
  };
  const clear = () => {
    stack = stack.filter(item => item.id !== id);
  };
  (0, _react.useMemo)(() => {
    if (open) {
      ensure();
    } else if (!open) {
      clear();
    }
  }, [open]);
  (0, _react.useEffect)(() => {
    if (open) {
      ensure();
      // Attach global event listeners
      attachGlobalEventListeners();
      return () => {
        clear();
        // Remove global event listeners if instances is empty
        detachGlobalEventListeners();
      };
    }
  }, [open]);
}