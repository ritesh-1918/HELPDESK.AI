"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Notice", {
  enumerable: true,
  get: function () {
    return _Notice.default;
  }
});
Object.defineProperty(exports, "NotificationProvider", {
  enumerable: true,
  get: function () {
    return _NotificationProvider.default;
  }
});
Object.defineProperty(exports, "useNotification", {
  enumerable: true,
  get: function () {
    return _useNotification.default;
  }
});
var _useNotification = _interopRequireDefault(require("./hooks/useNotification"));
var _Notice = _interopRequireDefault(require("./Notice"));
var _NotificationProvider = _interopRequireDefault(require("./NotificationProvider"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }