"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.legacyPropsWarning = legacyPropsWarning;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function legacyPropsWarning(props) {
  var picker = props.picker,
    disabledHours = props.disabledHours,
    disabledMinutes = props.disabledMinutes,
    disabledSeconds = props.disabledSeconds;
  if (picker === 'time' && (disabledHours || disabledMinutes || disabledSeconds)) {
    (0, _warning.default)(false, "'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.");
  }
}