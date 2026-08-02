"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const isFF = typeof navigator === 'object' && /Firefox/i.test(navigator.userAgent);
var _default = exports.default = isFF;