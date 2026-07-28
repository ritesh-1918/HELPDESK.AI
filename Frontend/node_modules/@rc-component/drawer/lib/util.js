"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseWidthHeight = parseWidthHeight;
exports.warnCheck = warnCheck;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function parseWidthHeight(value) {
  if (typeof value === 'string') {
    const num = Number(value.replace(/px$/i, ''));
    const floatNum = parseFloat(value);
    if (floatNum === num) {
      (0, _warning.default)(false, 'Invalid value type of `width` or `height` which should be number type instead.');
    }
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return value;
}
function warnCheck(props) {
  (0, _warning.default)(!('wrapperClassName' in props), `'wrapperClassName' is removed. Please use 'rootClassName' instead.`);
  (0, _warning.default)((0, _canUseDom.default)() || !props.open, `Drawer with 'open' in SSR is not work since no place to createPortal. Please move to 'useEffect' instead.`);
}