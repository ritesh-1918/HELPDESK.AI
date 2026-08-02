"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InternalContext = void 0;
var React = _interopRequireWildcard(require("react"));
/**
 * When use this context. Will trade as sub component instead of root Steps component.
 */
const InternalContext = exports.InternalContext = /*#__PURE__*/React.createContext(null);