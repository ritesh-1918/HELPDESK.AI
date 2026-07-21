"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _tour = _interopRequireDefault(require("@rc-component/tour"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _placements = _interopRequireDefault(require("../_util/placements"));
var _zindexContext = _interopRequireDefault(require("../_util/zindexContext"));
var _context = require("../config-provider/context");
var _internal = require("../theme/internal");
var _panelRender = _interopRequireDefault(require("./panelRender"));
var _PurePanel = _interopRequireDefault(require("./PurePanel"));
var _style = _interopRequireDefault(require("./style"));
const Tour = props => {
  const {
    prefixCls: customizePrefixCls,
    type,
    rootClassName,
    indicatorsRender,
    actionsRender,
    steps,
    closeIcon,
    keyboard = true,
    classNames,
    styles,
    className,
    style,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    closeIcon: contextCloseIcon,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('tour');
  const prefixCls = getPrefixCls('tour', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const [, token] = (0, _internal.useToken)();
  const mergedSteps = _react.default.useMemo(() => steps?.map(step => ({
    ...step,
    className: (0, _clsx.clsx)(step.className, {
      [`${prefixCls}-primary`]: (step.type ?? type) === 'primary'
    })
  })), [prefixCls, steps, type]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    steps: mergedSteps
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const builtinPlacements = config => (0, _placements.default)({
    arrowPointAtCenter: config?.arrowPointAtCenter ?? true,
    autoAdjustOverflow: true,
    offset: token.marginXXS,
    arrowWidth: token.sizePopupArrow,
    borderRadius: token.borderRadius
  });
  const mergedRootClassName = (0, _clsx.clsx)({
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, cssVarCls, rootClassName, contextClassName, mergedClassNames.root, className);
  const semanticStyles = {
    ...mergedStyles,
    mask: {
      ...mergedStyles.root,
      ...mergedStyles.mask,
      ...contextStyle,
      ...style
    }
  };
  const mergedRenderPanel = (stepProps, stepCurrent) => (/*#__PURE__*/_react.default.createElement(_panelRender.default, {
    styles: semanticStyles,
    classNames: mergedClassNames,
    type: type,
    stepProps: stepProps,
    current: stepCurrent,
    indicatorsRender: indicatorsRender,
    actionsRender: actionsRender
  }));
  // ============================ zIndex ============================
  const [zIndex, contextZIndex] = (0, _hooks.useZIndex)('Tour', restProps.zIndex);
  return /*#__PURE__*/_react.default.createElement(_zindexContext.default.Provider, {
    value: contextZIndex
  }, /*#__PURE__*/_react.default.createElement(_tour.default, {
    ...restProps,
    styles: semanticStyles,
    classNames: mergedClassNames,
    closeIcon: closeIcon ?? contextCloseIcon,
    keyboard: keyboard,
    zIndex: zIndex,
    rootClassName: mergedRootClassName,
    prefixCls: prefixCls,
    animated: true,
    renderPanel: mergedRenderPanel,
    builtinPlacements: builtinPlacements,
    steps: mergedSteps
  }));
};
if (process.env.NODE_ENV !== 'production') {
  Tour.displayName = 'Tour';
}
Tour._InternalPanelDoNotUseOrYouWillBeFired = _PurePanel.default;
var _default = exports.default = Tour;