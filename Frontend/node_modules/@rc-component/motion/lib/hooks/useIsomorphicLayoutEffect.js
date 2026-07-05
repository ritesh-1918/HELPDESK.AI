"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
var _react = require("react");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = (0, _canUseDom.default)() ? _react.useLayoutEffect : _react.useEffect;
var _default = exports.default = useIsomorphicLayoutEffect;