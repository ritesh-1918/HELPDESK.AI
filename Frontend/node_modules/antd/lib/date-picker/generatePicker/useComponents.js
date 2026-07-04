"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useComponents;
var _react = require("react");
var _PickerButton = _interopRequireDefault(require("../PickerButton"));
function useComponents(components) {
  return (0, _react.useMemo)(() => ({
    button: _PickerButton.default,
    ...components
  }), [components]);
}