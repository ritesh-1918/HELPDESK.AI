"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useImmutableMark = exports.responseImmutable = exports.makeImmutable = exports.default = void 0;
var _context = require("@rc-component/context");
const {
  makeImmutable,
  responseImmutable,
  useImmutableMark
} = (0, _context.createImmutable)();
exports.useImmutableMark = useImmutableMark;
exports.responseImmutable = responseImmutable;
exports.makeImmutable = makeImmutable;
const TableContext = (0, _context.createContext)();
var _default = exports.default = TableContext;