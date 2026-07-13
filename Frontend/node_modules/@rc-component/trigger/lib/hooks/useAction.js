"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useAction;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function toArray(val) {
  return val ? Array.isArray(val) ? val : [val] : [];
}
function useAction(action, showAction, hideAction) {
  return React.useMemo(() => {
    const mergedShowAction = toArray(showAction ?? action);
    const mergedHideAction = toArray(hideAction ?? action);
    const showActionSet = new Set(mergedShowAction);
    const hideActionSet = new Set(mergedHideAction);
    if (showActionSet.has('hover') && !showActionSet.has('click')) {
      showActionSet.add('touch');
    }
    if (hideActionSet.has('hover') && !hideActionSet.has('click')) {
      hideActionSet.add('touch');
    }
    return [showActionSet, hideActionSet];
  }, [action, showAction, hideAction]);
}