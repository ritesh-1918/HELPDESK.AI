"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Checkbox = void 0;
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Checkbox = exports.Checkbox = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    prefixCls = 'rc-checkbox',
    className,
    style,
    checked,
    disabled,
    defaultChecked = false,
    type = 'checkbox',
    title,
    onChange,
    ...inputProps
  } = props;
  const inputRef = (0, _react.useRef)(null);
  const holderRef = (0, _react.useRef)(null);
  const [rawValue, setRawValue] = (0, _useControlledState.default)(defaultChecked, checked);
  (0, _react.useImperativeHandle)(ref, () => ({
    focus: options => {
      inputRef.current?.focus(options);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    input: inputRef.current,
    nativeElement: holderRef.current
  }));
  const classString = (0, _clsx.clsx)(prefixCls, className, {
    [`${prefixCls}-checked`]: rawValue,
    [`${prefixCls}-disabled`]: disabled
  });
  const handleChange = e => {
    if (disabled) {
      return;
    }
    if (!('checked' in props)) {
      setRawValue(e.target.checked);
    }
    onChange?.({
      target: {
        ...props,
        type,
        checked: e.target.checked
      },
      stopPropagation() {
        e.stopPropagation();
      },
      preventDefault() {
        e.preventDefault();
      },
      nativeEvent: e.nativeEvent
    });
  };
  return /*#__PURE__*/React.createElement("span", {
    className: classString,
    title: title,
    style: style,
    ref: holderRef
  }, /*#__PURE__*/React.createElement("input", _extends({}, inputProps, {
    className: `${prefixCls}-input`,
    ref: inputRef,
    onChange: handleChange,
    disabled: disabled,
    checked: !!rawValue,
    type: type
  })));
});
var _default = exports.default = Checkbox;