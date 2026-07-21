"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// \b([A-Za-z_$][\w$]*)\s*!==\s*(?:undefined\s*&&\s*\1\s*!==\s*null|null\s*&&\s*\1\s*!==\s*undefined)\b
// \b([A-Za-z_$][\w$\.]*)\s*===\s*(?:undefined|null)\s*\|\|\s*\1\s*===\s*(?:undefined|null)\b
const isNonNullable = val => {
  return val !== undefined && val !== null;
};
var _default = exports.default = isNonNullable;