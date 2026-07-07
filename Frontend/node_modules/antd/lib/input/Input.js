"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
Object.defineProperty(exports, "triggerFocus", {
  enumerable: true,
  get: function () {
    return _focus.triggerFocus;
  }
});
var _react = _interopRequireWildcard(require("react"));
var _input = _interopRequireDefault(require("@rc-component/input"));
var _focus = require("@rc-component/util/lib/Dom/focus");
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _getAllowClear = _interopRequireDefault(require("../_util/getAllowClear"));
var _hooks = require("../_util/hooks");
var _statusUtils = require("../_util/statusUtils");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _context2 = require("../form/context");
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
var _Compact = require("../space/Compact");
var _useRemovePasswordTimeout = _interopRequireDefault(require("./hooks/useRemovePasswordTimeout"));
var _style = _interopRequireWildcard(require("./style"));
var _utils = require("./utils");
const Input = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    status: customStatus,
    size: customSize,
    disabled: customDisabled,
    onBlur,
    onFocus,
    suffix,
    allowClear,
    addonAfter,
    addonBefore,
    className,
    style,
    styles,
    rootClassName,
    onChange,
    classNames,
    variant: customVariant,
    ...rest
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const {
      deprecated
    } = (0, _warning.devUseWarning)('Input');
    [['bordered', 'variant'], ['addonAfter', 'Space.Compact'], ['addonBefore', 'Space.Compact']].forEach(([prop, newProp]) => {
      deprecated(!(prop in props), prop, newProp);
    });
  }
  const {
    getPrefixCls,
    direction,
    allowClear: contextAllowClear,
    autoComplete: contextAutoComplete,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('input');
  const prefixCls = getPrefixCls('input', customizePrefixCls);
  const inputRef = (0, _react.useRef)(null);
  // Style
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.useSharedStyle)(prefixCls, rootClassName);
  (0, _style.default)(prefixCls, rootCls);
  // ===================== Compact Item =====================
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  // ===================== Size =====================
  const mergedSize = (0, _useSize.default)(ctx => customSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = _react.default.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ===================== Status =====================
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = (0, _react.useContext)(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(contextStatus, customStatus);
  // ===================== Focus warning =====================
  const inputHasPrefixSuffix = (0, _utils.hasPrefixSuffix)(props) || !!hasFeedback;
  const prevHasPrefixSuffix = (0, _react.useRef)(inputHasPrefixSuffix);
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Input');
    // biome-ignore lint/correctness/useHookAtTopLevel: Development-only warning hook called conditionally
    (0, _react.useEffect)(() => {
      if (inputHasPrefixSuffix && !prevHasPrefixSuffix.current) {
        process.env.NODE_ENV !== "production" ? warning(document.activeElement === inputRef.current?.input, 'usage', `When Input is focused, dynamic add or remove prefix / suffix will make it lose focus caused by dom structure change. Read more: https://ant.design/components/input/#FAQ`) : void 0;
      }
      prevHasPrefixSuffix.current = inputHasPrefixSuffix;
    }, [inputHasPrefixSuffix]);
  }
  /* eslint-enable */
  // ===================== Remove Password value =====================
  const removePasswordTimeout = (0, _useRemovePasswordTimeout.default)(inputRef, true);
  const handleBlur = e => {
    removePasswordTimeout();
    onBlur?.(e);
  };
  const handleFocus = e => {
    removePasswordTimeout();
    onFocus?.(e);
  };
  const handleChange = e => {
    removePasswordTimeout();
    onChange?.(e);
  };
  const suffixNode = (hasFeedback || suffix) && (/*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, suffix, hasFeedback && feedbackIcon));
  const mergedAllowClear = (0, _getAllowClear.default)(allowClear ?? contextAllowClear);
  const [variant, enableVariantCls] = (0, _useVariants.default)('input', customVariant, bordered);
  return /*#__PURE__*/_react.default.createElement(_input.default, {
    ref: (0, _ref.composeRef)(ref, inputRef),
    prefixCls: prefixCls,
    autoComplete: contextAutoComplete,
    ...rest,
    disabled: mergedDisabled,
    onBlur: handleBlur,
    onFocus: handleFocus,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    styles: mergedStyles,
    suffix: suffixNode,
    allowClear: mergedAllowClear,
    className: (0, _clsx.clsx)(className, rootClassName, cssVarCls, rootCls, compactItemClassnames, contextClassName, mergedClassNames.root),
    onChange: handleChange,
    addonBefore: addonBefore && (/*#__PURE__*/_react.default.createElement(_ContextIsolator.default, {
      form: true,
      space: true
    }, addonBefore)),
    addonAfter: addonAfter && (/*#__PURE__*/_react.default.createElement(_ContextIsolator.default, {
      form: true,
      space: true
    }, addonAfter)),
    classNames: {
      ...mergedClassNames,
      input: (0, _clsx.clsx)({
        [`${prefixCls}-sm`]: mergedSize === 'small',
        [`${prefixCls}-lg`]: mergedSize === 'large',
        [`${prefixCls}-rtl`]: direction === 'rtl'
      }, mergedClassNames.input, hashId),
      variant: (0, _clsx.clsx)({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, (0, _statusUtils.getStatusClassNames)(prefixCls, mergedStatus)),
      affixWrapper: (0, _clsx.clsx)({
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
        [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl'
      }, hashId),
      wrapper: (0, _clsx.clsx)({
        [`${prefixCls}-group-rtl`]: direction === 'rtl'
      }, hashId),
      groupWrapper: (0, _clsx.clsx)({
        [`${prefixCls}-group-wrapper-sm`]: mergedSize === 'small',
        [`${prefixCls}-group-wrapper-lg`]: mergedSize === 'large',
        [`${prefixCls}-group-wrapper-rtl`]: direction === 'rtl',
        [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls
      }, (0, _statusUtils.getStatusClassNames)(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback), hashId)
    }
  });
});
if (process.env.NODE_ENV !== 'production') {
  Input.displayName = 'Input';
}
var _default = exports.default = Input;