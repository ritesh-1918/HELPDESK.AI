"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Field", {
  enumerable: true,
  get: function () {
    return _Field.default;
  }
});
Object.defineProperty(exports, "FieldContext", {
  enumerable: true,
  get: function () {
    return _FieldContext.default;
  }
});
Object.defineProperty(exports, "FormProvider", {
  enumerable: true,
  get: function () {
    return _FormContext.FormProvider;
  }
});
Object.defineProperty(exports, "List", {
  enumerable: true,
  get: function () {
    return _List.default;
  }
});
Object.defineProperty(exports, "ListContext", {
  enumerable: true,
  get: function () {
    return _ListContext.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "useForm", {
  enumerable: true,
  get: function () {
    return _useForm.default;
  }
});
Object.defineProperty(exports, "useWatch", {
  enumerable: true,
  get: function () {
    return _useWatch.default;
  }
});
var React = _interopRequireWildcard(require("react"));
var _Field = _interopRequireDefault(require("./Field"));
var _List = _interopRequireDefault(require("./List"));
var _useForm = _interopRequireDefault(require("./hooks/useForm"));
var _Form = _interopRequireDefault(require("./Form"));
var _FormContext = require("./FormContext");
var _FieldContext = _interopRequireDefault(require("./FieldContext"));
var _ListContext = _interopRequireDefault(require("./ListContext"));
var _useWatch = _interopRequireDefault(require("./hooks/useWatch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const InternalForm = /*#__PURE__*/React.forwardRef(_Form.default);
const RefForm = InternalForm;
RefForm.FormProvider = _FormContext.FormProvider;
RefForm.Field = _Field.default;
RefForm.List = _List.default;
RefForm.useForm = _useForm.default;
RefForm.useWatch = _useWatch.default;
var _default = exports.default = RefForm;