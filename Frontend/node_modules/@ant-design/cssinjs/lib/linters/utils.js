"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lintWarning = lintWarning;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
function lintWarning(message, info) {
  const {
    path,
    parentSelectors
  } = info;
  (0, _warning.default)(false, `[Ant Design CSS-in-JS] ${path ? `Error in ${path}: ` : ''}${message}${parentSelectors.length ? ` Selector: ${parentSelectors.join(' | ')}` : ''}`);
}