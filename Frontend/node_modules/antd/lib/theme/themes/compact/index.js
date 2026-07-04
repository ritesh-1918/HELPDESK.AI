"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default2 = _interopRequireDefault(require("../default"));
var _genControlHeight = _interopRequireDefault(require("../shared/genControlHeight"));
var _genFontMapToken = _interopRequireDefault(require("../shared/genFontMapToken"));
var _genCompactSizeMapToken = _interopRequireDefault(require("./genCompactSizeMapToken"));
const derivative = (token, mapToken) => {
  const mergedMapToken = mapToken ?? (0, _default2.default)(token);
  const fontSize = mergedMapToken.fontSizeSM; // Smaller size font-size as base
  const controlHeight = mergedMapToken.controlHeight - 4;
  return {
    ...mergedMapToken,
    ...(0, _genCompactSizeMapToken.default)(mapToken ?? token),
    // font
    ...(0, _genFontMapToken.default)(fontSize),
    // controlHeight
    controlHeight,
    ...(0, _genControlHeight.default)({
      ...mergedMapToken,
      controlHeight
    })
  };
};
var _default = exports.default = derivative;