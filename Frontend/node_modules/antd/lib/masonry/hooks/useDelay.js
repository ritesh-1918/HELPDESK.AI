"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDelay;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
function useDelay(callback) {
  const idRef = React.useRef(0);
  const clearRaf = () => {
    _raf.default.cancel(idRef.current);
  };
  React.useEffect(() => clearRaf, []);
  const triggerFn = (0, _util.useEvent)(() => {
    clearRaf();
    idRef.current = (0, _raf.default)(callback);
  });
  return triggerFn;
}