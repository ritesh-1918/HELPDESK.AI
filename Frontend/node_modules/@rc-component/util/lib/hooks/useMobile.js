"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _isMobile = _interopRequireDefault(require("../isMobile"));
var _useLayoutEffect = _interopRequireDefault(require("./useLayoutEffect"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Hook to detect if the user is on a mobile device
 * Notice that this hook will only detect the device type in effect, so it will always be false in server side
 */
const useMobile = () => {
  const [mobile, setMobile] = (0, _react.useState)(false);
  (0, _useLayoutEffect.default)(() => {
    setMobile((0, _isMobile.default)());
  }, []);
  return mobile;
};
var _default = exports.default = useMobile;