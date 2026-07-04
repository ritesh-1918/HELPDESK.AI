"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getReactMajorVersion;
var _react = require("react");
// ZombieJ: This is only warn for React 17 not support.
// But Jest mock React 17 will cause many issues in testing,
// Can be safe to remove in next major version.

function getReactMajorVersion() {
  const majorVersion = Number.parseInt(_react.version.split('.')[0], 10);
  return majorVersion;
}