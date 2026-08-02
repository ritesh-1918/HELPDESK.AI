"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _SingleContent = _interopRequireDefault(require("./SingleContent"));
var _MultipleContent = _interopRequireDefault(require("./MultipleContent"));
var _context = require("../context");
var _useBaseProps = _interopRequireDefault(require("../../hooks/useBaseProps"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const SelectContent = /*#__PURE__*/React.forwardRef(function SelectContent(_, ref) {
  const {
    multiple,
    onInputKeyDown,
    tabIndex
  } = (0, _context.useSelectInputContext)();
  const baseProps = (0, _useBaseProps.default)();
  const {
    showSearch
  } = baseProps;
  const ariaProps = (0, _pickAttrs.default)(baseProps, {
    aria: true
  });
  const sharedInputProps = {
    ...ariaProps,
    onKeyDown: onInputKeyDown,
    readOnly: !showSearch,
    tabIndex
  };
  if (multiple) {
    return /*#__PURE__*/React.createElement(_MultipleContent.default, {
      ref: ref,
      inputProps: sharedInputProps
    });
  }
  return /*#__PURE__*/React.createElement(_SingleContent.default, {
    ref: ref,
    inputProps: sharedInputProps
  });
});
var _default = exports.default = SelectContent;