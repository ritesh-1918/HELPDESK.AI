"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Always trigger latest once when call multiple time
 */
var _default = () => {
  const idRef = (0, _react.useRef)(0);
  const cleanUp = () => {
    _raf.default.cancel(idRef.current);
  };
  (0, _react.useEffect)(() => cleanUp, []);
  return callback => {
    cleanUp();
    idRef.current = (0, _raf.default)(() => {
      callback();
    });
  };
};
exports.default = _default;