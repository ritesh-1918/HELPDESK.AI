"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warningNullOptions = warningNullOptions;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// value in Cascader options should not be null
function warningNullOptions(options, fieldNames) {
  if (options) {
    const recursiveOptions = optionsList => {
      for (let i = 0; i < optionsList.length; i++) {
        const option = optionsList[i];
        if (option[fieldNames?.value] === null) {
          (0, _warning.default)(false, '`value` in Cascader options should not be `null`.');
          return true;
        }
        if (Array.isArray(option[fieldNames?.children]) && recursiveOptions(option[fieldNames?.children])) {
          return true;
        }
      }
    };
    recursiveOptions(options);
  }
}