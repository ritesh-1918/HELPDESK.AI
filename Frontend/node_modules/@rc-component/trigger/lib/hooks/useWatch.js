"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useWatch;
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _util = require("../util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useWatch(open, target, popup, onAlign, onScroll) {
  (0, _useLayoutEffect.default)(() => {
    if (open && target && popup) {
      const targetElement = target;
      const popupElement = popup;
      const targetScrollList = (0, _util.collectScroller)(targetElement);
      const popupScrollList = (0, _util.collectScroller)(popupElement);
      const win = (0, _util.getWin)(popupElement);
      const mergedList = new Set([win, ...targetScrollList, ...popupScrollList]);
      function notifyScroll() {
        onAlign();
        onScroll();
      }
      mergedList.forEach(scroller => {
        scroller.addEventListener('scroll', notifyScroll, {
          passive: true
        });
      });
      win.addEventListener('resize', notifyScroll, {
        passive: true
      });

      // First time always do align
      onAlign();
      return () => {
        mergedList.forEach(scroller => {
          scroller.removeEventListener('scroll', notifyScroll);
          win.removeEventListener('resize', notifyScroll);
        });
      };
    }
  }, [open, target, popup]);
}