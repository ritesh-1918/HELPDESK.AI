"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.NotificationContext = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const NotificationContext = exports.NotificationContext = /*#__PURE__*/_react.default.createContext({});
const NotificationProvider = ({
  children,
  classNames
}) => {
  return /*#__PURE__*/_react.default.createElement(NotificationContext.Provider, {
    value: {
      classNames
    }
  }, children);
};
var _default = exports.default = NotificationProvider;