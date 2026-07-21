"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEffectState;
var _react = require("react");
/**
 * Trigger a callback on state change
 */
function useEffectState() {
  const [effectId, setEffectId] = (0, _react.useState)({
    id: 0,
    callback: null
  });
  const update = (0, _react.useCallback)(callback => {
    setEffectId(({
      id
    }) => ({
      id: id + 1,
      callback
    }));
  }, []);
  (0, _react.useEffect)(() => {
    effectId.callback?.();
  }, [effectId]);
  return update;
}