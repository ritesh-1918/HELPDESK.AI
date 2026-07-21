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
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _wave = _interopRequireDefault(require("../_util/wave"));
var _interface = require("../_util/wave/interface");
var _useBubbleLock = _interopRequireDefault(require("../checkbox/useBubbleLock"));
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _context2 = require("../form/context");
var _context3 = _interopRequireWildcard(require("./context"));
var _style = _interopRequireDefault(require("./style"));
const InternalRadio = (props, ref) => {
  const groupContext = React.useContext(_context3.default);
  const radioOptionTypeContext = React.useContext(_context3.RadioOptionTypeContext);
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('radio');
  const innerRef = React.useRef(null);
  const mergedRef = (0, _ref.composeRef)(ref, innerRef);
  const {
    isFormItemInput
  } = React.useContext(_context2.FormItemInputContext);
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Radio');
    process.env.NODE_ENV !== "production" ? warning(!('optionType' in props), 'usage', '`optionType` is only support in Radio.Group.') : void 0;
  }
  const onChange = e => {
    props.onChange?.(e);
    groupContext?.onChange?.(e);
  };
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    style,
    title,
    classNames,
    styles,
    ...restProps
  } = props;
  const radioPrefixCls = getPrefixCls('radio', customizePrefixCls);
  const isButtonType = (groupContext?.optionType || radioOptionTypeContext) === 'button';
  const prefixCls = isButtonType ? `${radioPrefixCls}-button` : radioPrefixCls;
  // Style
  const rootCls = (0, _useCSSVarCls.default)(radioPrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(radioPrefixCls, rootCls);
  const radioProps = {
    ...restProps
  };
  // ===================== Disabled =====================
  const disabled = React.useContext(_DisabledContext.default);
  // ====================== Checked ======================
  let mergedChecked = radioProps.checked;
  if (groupContext) {
    radioProps.name = groupContext.name;
    radioProps.onChange = onChange;
    mergedChecked = props.value === groupContext.value;
    radioProps.disabled = radioProps.disabled ?? groupContext.disabled;
  }
  radioProps.disabled = radioProps.disabled ?? disabled;
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    ...radioProps,
    checked: mergedChecked
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const wrapperClassString = (0, _clsx.clsx)(`${prefixCls}-wrapper`, {
    [`${prefixCls}-wrapper-checked`]: mergedChecked,
    [`${prefixCls}-wrapper-disabled`]: radioProps.disabled,
    [`${prefixCls}-wrapper-rtl`]: direction === 'rtl',
    [`${prefixCls}-wrapper-in-form-item`]: isFormItemInput,
    [`${prefixCls}-wrapper-block`]: !!groupContext?.block
  }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls, rootCls);
  // ============================ Event Lock ============================
  const [onLabelClick, onInputClick] = (0, _useBubbleLock.default)(radioProps.onClick);
  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement(_wave.default, {
    component: "Radio",
    disabled: radioProps.disabled
  }, /*#__PURE__*/React.createElement("label", {
    className: wrapperClassString,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    title: title,
    onClick: onLabelClick
  }, /*#__PURE__*/React.createElement(_checkbox.default, {
    ...radioProps,
    checked: mergedChecked,
    className: (0, _clsx.clsx)(mergedClassNames.icon, {
      [_interface.TARGET_CLS]: !isButtonType
    }),
    style: mergedStyles.icon,
    type: "radio",
    prefixCls: prefixCls,
    ref: mergedRef,
    onClick: onInputClick
  }), children !== undefined ? (/*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-label`, mergedClassNames.label),
    style: mergedStyles.label
  }, children)) : null));
};
const Radio = /*#__PURE__*/React.forwardRef(InternalRadio);
if (process.env.NODE_ENV !== 'production') {
  Radio.displayName = 'Radio';
}
var _default = exports.default = Radio;