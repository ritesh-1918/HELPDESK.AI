"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Keyframe {
  name;
  style;
  constructor(name, style) {
    this.name = name;
    this.style = style;
  }
  getName(hashId = '') {
    return hashId ? `${hashId}-${this.name}` : this.name;
  }
  _keyframe = true;
}
var _default = exports.default = Keyframe;