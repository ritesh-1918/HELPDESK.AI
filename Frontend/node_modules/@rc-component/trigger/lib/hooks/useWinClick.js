"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useWinClick;
var _shadow = require("@rc-component/util/lib/Dom/shadow");
var _warning = require("@rc-component/util/lib/warning");
var React = _interopRequireWildcard(require("react"));
var _util = require("../util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Close if click on the window.
 * Return the function that click on the Popup element.
 */
function useWinClick(open, clickToHide, targetEle, popupEle, mask, maskClosable, inPopupOrChild, triggerOpen) {
  const openRef = React.useRef(open);
  openRef.current = open;
  const popupPointerDownRef = React.useRef(false);

  // Click to hide is special action since click popup element should not hide
  React.useEffect(() => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      const onPointerDown = () => {
        popupPointerDownRef.current = false;
      };
      const onTriggerClose = e => {
        if (openRef.current && !inPopupOrChild(e.composedPath?.()?.[0] || e.target) && !popupPointerDownRef.current) {
          triggerOpen(false);
        }
      };
      const win = (0, _util.getWin)(popupEle);
      win.addEventListener('pointerdown', onPointerDown, true);
      win.addEventListener('mousedown', onTriggerClose, true);
      win.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      const targetShadowRoot = (0, _shadow.getShadowRoot)(targetEle);
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true);
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true);
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production' && targetEle) {
        const targetRoot = targetEle.getRootNode?.();
        const popupRoot = popupEle.getRootNode?.();
        (0, _warning.warning)(targetRoot === popupRoot, `trigger element and popup element should in same shadow root.`);
      }
      return () => {
        win.removeEventListener('pointerdown', onPointerDown, true);
        win.removeEventListener('mousedown', onTriggerClose, true);
        win.removeEventListener('contextmenu', onTriggerClose, true);
        if (targetShadowRoot) {
          targetShadowRoot.removeEventListener('mousedown', onTriggerClose, true);
          targetShadowRoot.removeEventListener('contextmenu', onTriggerClose, true);
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
  function onPopupPointerDown() {
    popupPointerDownRef.current = true;
  }
  return onPopupPointerDown;
}