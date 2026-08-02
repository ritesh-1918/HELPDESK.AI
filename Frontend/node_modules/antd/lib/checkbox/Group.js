"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "GroupContext", {
  enumerable: true,
  get: function () {
    return _GroupContext.default;
  }
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _Checkbox = _interopRequireDefault(require("./Checkbox"));
var _GroupContext = _interopRequireDefault(require("./GroupContext"));
var _style = _interopRequireDefault(require("./style"));
const CheckboxGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    defaultValue,
    children,
    options = [],
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    onChange,
    role = 'group',
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const [value, setValue] = React.useState(restProps.value || defaultValue || []);
  const [registeredValues, setRegisteredValues] = React.useState([]);
  React.useEffect(() => {
    if ('value' in restProps) {
      setValue(restProps.value || []);
    }
  }, [restProps.value]);
  const memoizedOptions = React.useMemo(() => options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        label: option,
        value: option
      };
    }
    return option;
  }), [options]);
  const cancelValue = val => {
    setRegisteredValues(prevValues => prevValues.filter(v => v !== val));
  };
  const registerValue = val => {
    setRegisteredValues(prevValues => [].concat((0, _toConsumableArray2.default)(prevValues), [val]));
  };
  const toggleOption = option => {
    const optionIndex = value.indexOf(option.value);
    const newValue = (0, _toConsumableArray2.default)(value);
    if (optionIndex === -1) {
      newValue.push(option.value);
    } else {
      newValue.splice(optionIndex, 1);
    }
    if (!('value' in restProps)) {
      setValue(newValue);
    }
    onChange?.(newValue.filter(val => registeredValues.includes(val)).sort((a, b) => {
      const indexA = memoizedOptions.findIndex(opt => opt.value === a);
      const indexB = memoizedOptions.findIndex(opt => opt.value === b);
      return indexA - indexB;
    }));
  };
  const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const domProps = (0, _util.omit)(restProps, ['value', 'disabled']);
  const childrenNode = options.length ? memoizedOptions.map(option => (/*#__PURE__*/React.createElement(_Checkbox.default, {
    prefixCls: prefixCls,
    key: option.value.toString(),
    disabled: 'disabled' in option ? option.disabled : restProps.disabled,
    value: option.value,
    checked: value.includes(option.value),
    onChange: option.onChange,
    className: (0, _clsx.clsx)(`${groupPrefixCls}-item`, option.className),
    style: option.style,
    title: option.title,
    id: option.id,
    required: option.required
  }, option.label))) : children;
  const memoizedContext = React.useMemo(() => ({
    toggleOption,
    value,
    disabled: restProps.disabled,
    name: restProps.name,
    // https://github.com/ant-design/ant-design/issues/16376
    registerValue,
    cancelValue
  }), [toggleOption, value, restProps.disabled, restProps.name, registerValue, cancelValue]);
  const classString = (0, _clsx.clsx)(groupPrefixCls, {
    [`${groupPrefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, cssVarCls, rootCls, hashId);
  return /*#__PURE__*/React.createElement("div", {
    className: classString,
    style: style,
    role: role,
    ...domProps,
    ref: ref
  }, /*#__PURE__*/React.createElement(_GroupContext.default.Provider, {
    value: memoizedContext
  }, childrenNode));
});
var _default = exports.default = CheckboxGroup;