"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _react = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _CheckableTag = _interopRequireDefault(require("./CheckableTag"));
var _style = _interopRequireDefault(require("./style"));
function CheckableTagGroup(props, ref) {
  const {
    id,
    prefixCls: customizePrefixCls,
    rootClassName,
    className,
    style,
    classNames,
    styles,
    disabled,
    options,
    value,
    defaultValue,
    onChange,
    multiple,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('tag');
  const prefixCls = getPrefixCls('tag', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-checkable-group`;
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  // ====================== Styles ======================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  // =============================== Option ===============================
  const parsedOptions = (0, _react.useMemo)(() => (options || []).map(option => {
    if (option && typeof option === 'object') {
      return option;
    }
    return {
      value: option,
      label: option
    };
  }), [options]);
  // =============================== Values ===============================
  const [mergedValue, setMergedValue] = (0, _util.useControlledState)(defaultValue, value);
  const handleChange = (checked, option) => {
    let newValue = null;
    if (multiple) {
      const valueList = mergedValue || [];
      newValue = checked ? [].concat((0, _toConsumableArray2.default)(valueList), [option.value]) : valueList.filter(item => item !== option.value);
    } else {
      newValue = checked ? option.value : null;
    }
    setMergedValue(newValue);
    onChange?.(newValue); // TS not support generic type in function call
  };
  // ================================ Refs ================================
  const divRef = _react.default.useRef(null);
  (0, _react.useImperativeHandle)(ref, () => ({
    nativeElement: divRef.current
  }));
  // ================================ ARIA ================================
  const ariaProps = (0, _pickAttrs.default)(restProps, {
    aria: true,
    data: true
  });
  // =============================== Render ===============================
  return /*#__PURE__*/_react.default.createElement("div", {
    ...ariaProps,
    className: (0, _clsx.clsx)(groupPrefixCls, contextClassName, rootClassName, {
      [`${groupPrefixCls}-disabled`]: disabled,
      [`${groupPrefixCls}-rtl`]: direction === 'rtl'
    }, hashId, cssVarCls, className, mergedClassNames.root),
    style: {
      ...contextStyle,
      ...mergedStyles.root,
      ...style
    },
    id: id,
    ref: divRef
  }, parsedOptions.map(option => (/*#__PURE__*/_react.default.createElement(_CheckableTag.default, {
    key: option.value,
    className: (0, _clsx.clsx)(`${groupPrefixCls}-item`, mergedClassNames.item),
    style: mergedStyles.item,
    checked: multiple ? (mergedValue || []).includes(option.value) : mergedValue === option.value,
    onChange: checked => handleChange(checked, option),
    disabled: disabled
  }, option.label))));
}
const ForwardCheckableTagGroup = /*#__PURE__*/_react.default.forwardRef(CheckableTagGroup);
if (process.env.NODE_ENV !== 'production') {
  ForwardCheckableTagGroup.displayName = 'CheckableTagGroup';
}
var _default = exports.default = ForwardCheckableTagGroup;