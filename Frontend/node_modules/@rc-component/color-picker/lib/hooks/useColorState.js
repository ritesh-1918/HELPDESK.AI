"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("@rc-component/util");
var _react = require("react");
var _util2 = require("../util");
const useColorState = (defaultValue, value) => {
  const [mergedValue, setValue] = (0, _util.useControlledState)(defaultValue, value);
  const color = (0, _react.useMemo)(() => (0, _util2.generateColor)(mergedValue), [mergedValue]);
  return [color, setValue];
};
var _default = exports.default = useColorState;