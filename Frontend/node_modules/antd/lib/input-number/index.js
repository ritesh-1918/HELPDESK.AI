"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MinusOutlined = _interopRequireDefault(require("@ant-design/icons/MinusOutlined"));
var _PlusOutlined = _interopRequireDefault(require("@ant-design/icons/PlusOutlined"));
var _DownOutlined = _interopRequireDefault(require("@ant-design/icons/DownOutlined"));
var _UpOutlined = _interopRequireDefault(require("@ant-design/icons/UpOutlined"));
var _inputNumber = _interopRequireDefault(require("@rc-component/input-number"));
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _hooks = require("../_util/hooks");
var _statusUtils = require("../_util/statusUtils");
var _warning = require("../_util/warning");
var _configProvider = _interopRequireDefault(require("../config-provider"));
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _context2 = require("../form/context");
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
var _Addon = _interopRequireDefault(require("../space/Addon"));
var _Compact = _interopRequireWildcard(require("../space/Compact"));
var _style = _interopRequireDefault(require("./style"));
const InternalInputNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);
  const {
    rootClassName,
    size: customizeSize,
    disabled: customDisabled,
    prefixCls,
    addonBefore: _addonBefore,
    addonAfter: _addonAfter,
    prefix,
    suffix,
    bordered,
    readOnly,
    status,
    controls = true,
    variant: customVariant,
    className,
    style,
    classNames,
    styles,
    mode,
    ...others
  } = props;
  const {
    direction,
    className: contextClassName,
    style: contextStyle,
    styles: contextStyles,
    classNames: contextClassNames
  } = (0, _context.useComponentConfig)('inputNumber');
  // ===================== Disabled =====================
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  // controls && !mergedDisabled && !readOnly;
  const mergedControls = React.useMemo(() => {
    if (!controls || mergedDisabled || readOnly) {
      return false;
    }
    return controls;
  }, [controls, mergedDisabled, readOnly]);
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  let upIcon = mode === 'spinner' ? /*#__PURE__*/React.createElement(_PlusOutlined.default, null) : /*#__PURE__*/React.createElement(_UpOutlined.default, null);
  let downIcon = mode === 'spinner' ? /*#__PURE__*/React.createElement(_MinusOutlined.default, null) : /*#__PURE__*/React.createElement(_DownOutlined.default, null);
  const controlsTemp = typeof mergedControls === 'boolean' ? mergedControls : undefined;
  if (typeof mergedControls === 'object') {
    upIcon = mergedControls.upIcon || upIcon;
    downIcon = mergedControls.downIcon || downIcon;
  }
  const {
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(_context2.FormItemInputContext);
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
  const [variant, enableVariantCls] = (0, _useVariants.default)('inputNumber', customVariant, bordered);
  const suffixNode = hasFeedback && /*#__PURE__*/React.createElement(React.Fragment, null, feedbackIcon);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled,
    controls: mergedControls
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  return /*#__PURE__*/React.createElement(_inputNumber.default, {
    ref: inputRef,
    mode: mode,
    disabled: mergedDisabled,
    className: (0, _clsx.clsx)(className, rootClassName, mergedClassNames.root, contextClassName, compactItemClassnames, (0, _statusUtils.getStatusClassNames)(prefixCls, status, hasFeedback), {
      [`${prefixCls}-${variant}`]: enableVariantCls,
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-in-form-item`]: isFormItemInput,
      [`${prefixCls}-without-controls`]: !mergedControls
    }),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    upHandler: upIcon,
    downHandler: downIcon,
    prefixCls: prefixCls,
    readOnly: readOnly,
    controls: controlsTemp,
    prefix: prefix,
    suffix: suffixNode || suffix,
    classNames: mergedClassNames,
    styles: mergedStyles,
    ...others
  });
});
// ===================================================================
// ==                          InputNumber                          ==
// ===================================================================
const InputNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    addonBefore,
    addonAfter,
    prefixCls: customizePrefixCls,
    className,
    status: customStatus,
    rootClassName,
    ...rest
  } = props;
  const {
    getPrefixCls
  } = (0, _context.useComponentConfig)('inputNumber');
  const prefixCls = getPrefixCls('input-number', customizePrefixCls);
  const {
    status: contextStatus
  } = React.useContext(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(contextStatus, customStatus);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const hasLegacyAddon = addonBefore || addonAfter;
  // ======================= Warn =======================
  if (process.env.NODE_ENV !== 'production') {
    const typeWarning = (0, _warning.devUseWarning)('InputNumber');
    [['bordered', 'variant'], ['addonAfter', 'Space.Compact'], ['addonBefore', 'Space.Compact']].forEach(([prop, newProp]) => {
      typeWarning.deprecated(!(prop in props), prop, newProp);
    });
    typeWarning(!(props.type === 'number' && props.changeOnWheel), 'usage', 'When `type=number` is used together with `changeOnWheel`, changeOnWheel may not work properly. Please delete `type=number` if it is not necessary.');
  }
  // ====================== Render ======================
  const inputNumberNode = /*#__PURE__*/React.createElement(InternalInputNumber, {
    ref: ref,
    ...rest,
    prefixCls: prefixCls,
    status: mergedStatus,
    className: (0, _clsx.clsx)(cssVarCls, rootCls, hashId, className),
    rootClassName: !hasLegacyAddon ? rootClassName : undefined
  });
  if (hasLegacyAddon) {
    const renderAddon = node => {
      if (!node) {
        return null;
      }
      return /*#__PURE__*/React.createElement(_Addon.default, {
        className: (0, _clsx.clsx)(`${prefixCls}-addon`, cssVarCls, hashId),
        variant: props.variant,
        disabled: props.disabled,
        status: mergedStatus
      }, /*#__PURE__*/React.createElement(_ContextIsolator.default, {
        form: true
      }, node));
    };
    const addonBeforeNode = renderAddon(addonBefore);
    const addonAfterNode = renderAddon(addonAfter);
    return /*#__PURE__*/React.createElement(_Compact.default, {
      rootClassName: rootClassName
    }, addonBeforeNode, inputNumberNode, addonAfterNode);
  }
  return inputNumberNode;
});
const TypedInputNumber = InputNumber;
/** @private Internal Component. Do not use in your production. */
const PureInputNumber = props => (/*#__PURE__*/React.createElement(_configProvider.default, {
  theme: {
    components: {
      InputNumber: {
        handleVisible: true
      }
    }
  }
}, /*#__PURE__*/React.createElement(InputNumber, {
  ...props
})));
if (process.env.NODE_ENV !== 'production') {
  InternalInputNumber.displayName = 'InternalInputNumber';
  TypedInputNumber.displayName = 'InputNumber';
}
TypedInputNumber._InternalPanelDoNotUseOrYouWillBeFired = PureInputNumber;
var _default = exports.default = TypedInputNumber;