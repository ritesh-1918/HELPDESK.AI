"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ = require(".");
var _capitalize = _interopRequireDefault(require("../../_util/capitalize"));
var _internal = require("../../theme/internal");
const genTagStatusStyle = (token, status, cssVariableType) => {
  const capitalizedCssVariableType = (0, _capitalize.default)(cssVariableType);
  return {
    [`${token.componentCls}${token.componentCls}-${status}:not(${token.componentCls}-disabled)`]: {
      [`&${token.componentCls}-outlined`]: {
        backgroundColor: token[`color${capitalizedCssVariableType}Bg`],
        borderColor: token[`color${capitalizedCssVariableType}Border`],
        color: token[`color${cssVariableType}`]
      },
      [`&${token.componentCls}-solid`]: {
        backgroundColor: token[`color${cssVariableType}`],
        borderColor: token[`color${cssVariableType}`]
      },
      [`&${token.componentCls}-filled`]: {
        backgroundColor: token[`color${capitalizedCssVariableType}Bg`],
        color: token[`color${cssVariableType}`]
      }
    }
  };
};
// ============================== Export ==============================
var _default = exports.default = (0, _internal.genSubStyleComponent)(['Tag', 'status'], token => {
  const tagToken = (0, _.prepareToken)(token);
  return [genTagStatusStyle(tagToken, 'success', 'Success'), genTagStatusStyle(tagToken, 'processing', 'Info'), genTagStatusStyle(tagToken, 'error', 'Error'), genTagStatusStyle(tagToken, 'warning', 'Warning')];
}, _.prepareComponentToken);