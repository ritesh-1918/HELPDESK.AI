"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.floatButtonPrefixCls = exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _FileTextOutlined = _interopRequireDefault(require("@ant-design/icons/FileTextOutlined"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _convertToTooltipProps = _interopRequireDefault(require("../_util/convertToTooltipProps"));
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _badge = _interopRequireDefault(require("../badge"));
var _Button = _interopRequireDefault(require("../button/Button"));
var _configProvider = require("../config-provider");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _tooltip = _interopRequireDefault(require("../tooltip"));
var _context = require("./context");
var _style = _interopRequireDefault(require("./style"));
const floatButtonPrefixCls = exports.floatButtonPrefixCls = 'float-btn';
const InternalFloatButton = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    type = 'default',
    shape = 'circle',
    icon,
    description,
    content,
    tooltip,
    badge = {},
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction
  } = _react.default.useContext(_configProvider.ConfigContext);
  const groupContext = _react.default.useContext(_context.GroupContext);
  const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const {
    shape: contextShape,
    individual: contextIndividual,
    classNames: contextClassNames,
    styles: contextStyles
  } = groupContext || {};
  const mergedShape = contextShape || shape;
  const mergedIndividual = contextIndividual ?? true;
  const mergedContent = content ?? description;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    type,
    shape: mergedShape
  };
  // ============================ Styles ============================
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const floatButtonClassNames = _react.default.useMemo(() => ({
    icon: `${prefixCls}-icon`,
    content: `${prefixCls}-content`
  }), [prefixCls]);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([floatButtonClassNames, contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Icon =============================
  const mergedIcon = !mergedContent && !icon ? /*#__PURE__*/_react.default.createElement(_FileTextOutlined.default, null) : icon;
  // ============================ zIndex ============================
  const [zIndex] = (0, _hooks.useZIndex)('FloatButton', style?.zIndex);
  const mergedStyle = {
    ...style,
    zIndex
  };
  // ============================ Badge =============================
  // 虽然在 ts 中已经 omit 过了，但是为了防止多余的属性被透传进来，这里再 omit 一遍，以防万一
  const badgeProps = (0, _util.omit)(badge, ['title', 'children', 'status', 'text']);
  const badgeNode = 'badge' in props && (/*#__PURE__*/_react.default.createElement(_badge.default, {
    ...badgeProps,
    className: (0, _clsx.clsx)(badgeProps.className, `${prefixCls}-badge`, {
      [`${prefixCls}-badge-dot`]: badgeProps.dot
    })
  }));
  // =========================== Tooltip ============================
  const tooltipProps = (0, _convertToTooltipProps.default)(tooltip);
  // =========================== Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('FloatButton');
    process.env.NODE_ENV !== "production" ? warning(!(mergedShape === 'circle' && mergedContent), 'usage', 'supported only when `shape` is `square`. Due to narrow space for text, short sentence is recommended.') : void 0;
    warning.deprecated(!description, 'description', 'content');
  }
  // ============================ Render ============================
  let node = /*#__PURE__*/_react.default.createElement(_Button.default, {
    ...restProps,
    ref: ref,
    // Styles
    className: (0, _clsx.clsx)(hashId, cssVarCls, rootCls, prefixCls, className, rootClassName, `${prefixCls}-${type}`, `${prefixCls}-${mergedShape}`, {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-individual`]: mergedIndividual,
      [`${prefixCls}-icon-only`]: !mergedContent
    }),
    classNames: mergedClassNames,
    styles: mergedStyles,
    style: mergedStyle,
    shape: mergedShape,
    // Others
    type: type,
    size: "large",
    icon: mergedIcon,
    _skipSemantic: true
  }, mergedContent, badgeNode);
  if (tooltipProps) {
    node = /*#__PURE__*/_react.default.createElement(_tooltip.default, {
      ...tooltipProps
    }, node);
  }
  return node;
});
const FloatButton = InternalFloatButton;
if (process.env.NODE_ENV !== 'production') {
  FloatButton.displayName = 'FloatButton';
}
var _default = exports.default = FloatButton;