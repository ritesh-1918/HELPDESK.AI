"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inline = void 0;
exports.inlineMock = inlineMock;
let inline = exports.inline = false;
function inlineMock(nextInline) {
  if (typeof nextInline === 'boolean') {
    exports.inline = inline = nextInline;
  }
  return inline;
}