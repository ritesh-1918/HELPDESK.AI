"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = channelUpdate;
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
function channelUpdate(callback) {
  if (typeof MessageChannel === 'undefined') {
    (0, _raf.default)(callback);
  } else {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => callback();
    channel.port2.postMessage(undefined);
  }
}