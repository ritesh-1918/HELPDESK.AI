function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { useEvent, useControlledState } from '@rc-component/util';
import raf from "@rc-component/util/es/raf";
import React from 'react';

/**
 * Will be `true` immediately for next effect.
 * But will be `false` for a delay of effect.
 */
export default function useDelayState(value, defaultValue, onChange) {
  var _useControlledState = useControlledState(defaultValue, value),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    state = _useControlledState2[0],
    setState = _useControlledState2[1];

  // Need force update to ensure React re-render
  var _React$useState = React.useState({}),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    forceUpdate = _React$useState2[1];
  var triggerUpdate = useEvent(function (nextState) {
    setState(nextState);
    forceUpdate({});
  });
  var nextValueRef = React.useRef(value);

  // ============================= Update =============================
  var rafRef = React.useRef();
  var cancelRaf = function cancelRaf() {
    raf.cancel(rafRef.current);
  };
  var doUpdate = useEvent(function () {
    triggerUpdate(nextValueRef.current);
    if (onChange && state !== nextValueRef.current) {
      onChange(nextValueRef.current);
    }
  });
  var updateValue = useEvent(function (next, immediately) {
    cancelRaf();
    nextValueRef.current = next;
    if (next || immediately) {
      doUpdate();
    } else {
      rafRef.current = raf(doUpdate);
    }
  });
  React.useEffect(function () {
    return cancelRaf;
  }, []);
  return [state, updateValue];
}