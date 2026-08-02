"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _checkbox = _interopRequireDefault(require("@rc-component/checkbox"));
var _util = require("@rc-component/util");
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _wave = _interopRequireDefault(require("../_util/wave"));
var _interface = require("../_util/wave/interface");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _context2 = require("../form/context");
var _GroupContext = _interopRequireDefault(require("./GroupContext"));
var _style = _interopRequireDefault(require("./style"));
var _useBubbleLock = _interopRequireDefault(require("./useBubbleLock"));
const InternalCheckbox = (props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    children,
    indeterminate = false,
    onMouseEnter,
    onMouseLeave,
    skipGroup = false,
    disabled,
    // Style
    rootClassName,
    className,
    style,
    classNames,
    styles,
    // Name
    name,
    // Value
    value,
    // Checked
    checked,
    defaultChecked,
    onChange,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('checkbox');
  const checkboxGroup = React.useContext(_GroupContext.default);
  const {
    isFormItemInput
  } = React.useContext(_context2.FormItemInputContext);
  const contextDisabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = (checkboxGroup?.disabled || disabled) ?? contextDisabled;
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Checkbox');
    process.env.NODE_ENV !== "production" ? warning('checked' in props || !!checkboxGroup || !('value' in props), 'usage', '`value` is not a valid prop, do you mean `checked`?') : void 0;
  }
  // ============================= Checked ==============================
  const [innerChecked, setInnerChecked] = (0, _util.useControlledState)(defaultChecked, checked);
  let mergedChecked = innerChecked;
  const onInternalChange = (0, _util.useEvent)(event => {
    setInnerChecked(event.target.checked);
    onChange?.(event);
    if (!skipGroup && checkboxGroup?.toggleOption) {
      checkboxGroup.toggleOption({
        label: children,
        value
      });
    }
  });
  // ============================== Group ===============================
  if (checkboxGroup && !skipGroup) {
    mergedChecked = checkboxGroup.value.includes(value);
  }
  const checkboxRef = React.useRef(null);
  const mergedRef = (0, _ref.useComposeRef)(ref, checkboxRef);
  React.useEffect(() => {
    if (skipGroup || !checkboxGroup) {
      return;
    }
    checkboxGroup.registerValue(value);
    return () => {
      checkboxGroup.cancelValue(value);
    };
  }, [value, skipGroup]);
  // ========================== Indeterminate ===========================
  React.useEffect(() => {
    if (checkboxRef.current?.input) {
      checkboxRef.current.input.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  // ============================== Style ===============================
  const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const checkboxProps = {
    ...restProps
  };
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    indeterminate,
    disabled: mergedDisabled,
    checked: mergedChecked
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const classString = (0, _clsx.clsx)(`${prefixCls}-wrapper`, {
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-wrapper-checked`]: mergedChecked,
    [`${prefixCls}-wrapper-disabled`]: mergedDisabled,
    [`${prefixCls}-wrapper-in-form-item`]: isFormItemInput
  }, contextClassName, className, mergedClassNames.root, rootClassName, cssVarCls, rootCls, hashId);
  const checkboxClass = (0, _clsx.clsx)(mergedClassNames.icon, {
    [`${prefixCls}-indeterminate`]: indeterminate
  }, _interface.TARGET_CLS, hashId);
  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = (0, _useBubbleLock.default)(checkboxProps.onClick);
  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement(_wave.default, {
    component: "Checkbox",
    disabled: mergedDisabled
  }, /*#__PURE__*/React.createElement("label", {
    className: classString,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onLabelClick
  }, /*#__PURE__*/React.createElement(_checkbox.default, {
    ...checkboxProps,
    name: !skipGroup && checkboxGroup ? checkboxGroup.name : name,
    checked: mergedChecked,
    onClick: onInputClick,
    onChange: onInternalChange,
    prefixCls: prefixCls,
    className: checkboxClass,
    style: mergedStyles.icon,
    disabled: mergedDisabled,
    ref: mergedRef,
    value: value
  }), (0, _isNonNullable.default)(children) && (/*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-label`, mergedClassNames.label),
    style: mergedStyles.label
  }, children))));
};
const Checkbox = /*#__PURE__*/React.forwardRef(InternalCheckbox);
if (process.env.NODE_ENV !== 'production') {
  Checkbox.displayName = 'Checkbox';
}
var _default = exports.default = Checkbox;