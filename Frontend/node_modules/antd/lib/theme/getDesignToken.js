"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _theme = _interopRequireDefault(require("./themes/default/theme"));
var _seed = _interopRequireDefault(require("./themes/seed"));
var _alias = _interopRequireDefault(require("./util/alias"));
const getDesignToken = config => {
  const theme = config?.algorithm ? (0, _cssinjs.createTheme)(config.algorithm) : _theme.default;
  const mergedToken = {
    ..._seed.default,
    ...config?.token
  };
  return (0, _cssinjs.getComputedToken)(mergedToken, {
    override: config?.token
  }, theme, _alias.default);
};
var _default = exports.default = getDesignToken;