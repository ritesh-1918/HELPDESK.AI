"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Switch = /*#__PURE__*/React.forwardRef(({
  prefixCls = 'rc-switch',
  className,
  checked,
  defaultChecked,
  disabled,
  loadingIcon,
  checkedChildren,
  unCheckedChildren,
  onClick,
  onChange,
  onKeyDown,
  styles,
  classNames: switchClassNames,
  ...restProps
}, ref) => {
  const [innerChecked, setInnerChecked] = (0, _useControlledState.default)(defaultChecked ?? false, checked);
  function triggerChange(newChecked, event) {
    let mergedChecked = innerChecked;
    if (!disabled) {
      mergedChecked = newChecked;
      setInnerChecked(mergedChecked);
      onChange?.(mergedChecked, event);
    }
    return mergedChecked;
  }
  function onInternalKeyDown(e) {
    if (e.which === _KeyCode.default.LEFT) {
      triggerChange(false, e);
    } else if (e.which === _KeyCode.default.RIGHT) {
      triggerChange(true, e);
    }
    onKeyDown?.(e);
  }
  function onInternalClick(e) {
    const ret = triggerChange(!innerChecked, e);
    // [Legacy] trigger onClick with value
    onClick?.(ret, e);
  }
  const switchClassName = (0, _clsx.clsx)(prefixCls, className, {
    [`${prefixCls}-checked`]: innerChecked,
    [`${prefixCls}-disabled`]: disabled
  });
  return /*#__PURE__*/React.createElement("button", _extends({}, restProps, {
    type: "button",
    role: "switch",
    "aria-checked": innerChecked,
    disabled: disabled,
    className: switchClassName,
    ref: ref,
    onKeyDown: onInternalKeyDown,
    onClick: onInternalClick
  }), loadingIcon, /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-inner`
  }, /*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-inner-checked`, switchClassNames?.content),
    style: styles?.content
  }, checkedChildren), /*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-inner-unchecked`, switchClassNames?.content),
    style: styles?.content
  }, unCheckedChildren)));
});
Switch.displayName = 'Switch';
var _default = exports.default = Switch;