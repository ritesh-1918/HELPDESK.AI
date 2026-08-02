"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createContext", {
  enumerable: true,
  get: function () {
    return _context.createContext;
  }
});
Object.defineProperty(exports, "createImmutable", {
  enumerable: true,
  get: function () {
    return _Immutable.default;
  }
});
exports.responseImmutable = exports.makeImmutable = void 0;
Object.defineProperty(exports, "useContext", {
  enumerable: true,
  get: function () {
    return _context.useContext;
  }
});
exports.useImmutableMark = void 0;
var _context = require("./context");
var _Immutable = _interopRequireDefault(require("./Immutable"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// For legacy usage, we export it directly
const {
  makeImmutable,
  responseImmutable,
  useImmutableMark
} = (0, _Immutable.default)();
exports.useImmutableMark = useImmutableMark;
exports.responseImmutable = responseImmutable;
exports.makeImmutable = makeImmutable;