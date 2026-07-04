"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _List = require("./List");
const List = /*#__PURE__*/React.forwardRef((props, ref) => (0, _List.RawList)({
  ...props,
  virtual: false
}, ref));
List.displayName = 'List';
var _default = exports.default = List;