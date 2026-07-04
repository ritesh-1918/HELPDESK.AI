"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareComponentToken = exports.default = void 0;
var _fade = require("../../style/motion/fade");
var _internal = require("../../theme/internal");
var _button = _interopRequireDefault(require("./button"));
var _group = _interopRequireDefault(require("./group"));
// ============================== Export ==============================
const prepareComponentToken = () => ({});
exports.prepareComponentToken = prepareComponentToken;
var _default = exports.default = (0, _internal.genStyleHooks)('FloatButton', token => {
  const {
    controlHeightLG,
    marginXXL,
    marginLG,
    fontSizeIcon,
    calc
  } = token;
  const floatButtonToken = (0, _internal.mergeToken)(token, {
    floatButtonIconSize: calc(fontSizeIcon).mul(1.5).equal(),
    floatButtonSize: controlHeightLG,
    floatButtonInsetBlockEnd: marginXXL,
    floatButtonInsetInlineEnd: marginLG
  });
  return [(0, _button.default)(floatButtonToken), (0, _group.default)(floatButtonToken), (0, _fade.initFadeMotion)(token)];
}, prepareComponentToken, {
  // Should be higher than Button (-999)
  order: -998
});