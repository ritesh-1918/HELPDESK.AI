"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useSelectTriggerControl;
exports.isInside = isInside;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function isInside(elements, target) {
  return elements.filter(element => element).some(element => element.contains(target) || element === target);
}
function useSelectTriggerControl(elements, open, triggerOpen, customizedTrigger) {
  const onGlobalMouseDown = (0, _util.useEvent)(event => {
    // If trigger is customized, Trigger will take control of popupVisible
    if (customizedTrigger) {
      return;
    }
    let target = event.target;
    if (target.shadowRoot && event.composed) {
      target = event.composedPath()[0] || target;
    }
    if (event._ori_target) {
      target = event._ori_target;
    }
    if (open &&
    // Marked by SelectInput mouseDown event
    !isInside(elements(), target)) {
      // Should trigger close
      triggerOpen(false);
    }
  });
  React.useEffect(() => {
    window.addEventListener('mousedown', onGlobalMouseDown);
    return () => window.removeEventListener('mousedown', onGlobalMouseDown);
  }, [onGlobalMouseDown]);
}