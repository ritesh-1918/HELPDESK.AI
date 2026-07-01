"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
const useMergedArrow = (providedArrow, providedContextArrow) => {
  const toConfig = arrow => typeof arrow === 'boolean' ? {
    show: arrow
  } : arrow || {};
  return _react.default.useMemo(() => {
    const arrowConfig = toConfig(providedArrow);
    const contextArrowConfig = toConfig(providedContextArrow);
    return {
      ...contextArrowConfig,
      ...arrowConfig,
      show: arrowConfig.show ?? contextArrowConfig.show ?? true
    };
  }, [providedArrow, providedContextArrow]);
};
var _default = exports.default = useMergedArrow;