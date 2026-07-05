"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEffectState;
exports.useBatcher = useBatcher;
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
var _channelUpdate = _interopRequireDefault(require("./channelUpdate"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Batcher for record any `useEffectState` need update.
 */
function useBatcher() {
  // Updater Trigger
  const updateFuncRef = React.useRef(null);

  // Notify update
  const notifyEffectUpdate = callback => {
    if (!updateFuncRef.current) {
      updateFuncRef.current = [];
      (0, _channelUpdate.default)(() => {
        (0, _reactDom.unstable_batchedUpdates)(() => {
          updateFuncRef.current.forEach(fn => {
            fn();
          });
          updateFuncRef.current = null;
        });
      });
    }
    updateFuncRef.current.push(callback);
  };
  return notifyEffectUpdate;
}

/**
 * Trigger state update by `useLayoutEffect` to save perf.
 */
function useEffectState(notifyEffectUpdate, defaultValue) {
  // Value
  const [stateValue, setStateValue] = React.useState(defaultValue);

  // Set State
  const setEffectVal = (0, _useEvent.default)(nextValue => {
    notifyEffectUpdate(() => {
      setStateValue(nextValue);
    });
  });
  return [stateValue, setEffectVal];
}