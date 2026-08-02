"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = get;
function get(entity, path) {
  let current = entity;
  for (let i = 0; i < path.length; i += 1) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[path[i]];
  }
  return current;
}