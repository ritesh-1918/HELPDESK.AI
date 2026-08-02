"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _collapse = _interopRequireDefault(require("@rc-component/collapse"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _motion = _interopRequireDefault(require("../_util/motion"));
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _CollapsePanel = _interopRequireDefault(require("./CollapsePanel"));
var _style = _interopRequireDefault(require("./style"));
const Collapse = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction,
    expandIcon: contextExpandIcon,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('collapse');
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    bordered = true,
    ghost,
    size: customizeSize,
    expandIconPlacement,
    expandIconPosition,
    children,
    destroyInactivePanel,
    destroyOnHidden,
    expandIcon,
    classNames,
    styles
  } = props;
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? ctx ?? 'middle');
  const prefixCls = getPrefixCls('collapse', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const mergedPlacement = expandIconPlacement ?? expandIconPosition ?? 'start';
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size: mergedSize,
    bordered,
    expandIconPlacement: mergedPlacement
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const mergedExpandIcon = expandIcon ?? contextExpandIcon;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Collapse');
    [['destroyInactivePanel', 'destroyOnHidden'], ['expandIconPosition', 'expandIconPlacement']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const renderExpandIcon = React.useCallback((panelProps = {}) => {
    const icon = typeof mergedExpandIcon === 'function' ? mergedExpandIcon(panelProps) : (/*#__PURE__*/React.createElement(_RightOutlined.default, {
      rotate: panelProps.isActive ? direction === 'rtl' ? -90 : 90 : undefined,
      "aria-label": panelProps.isActive ? 'expanded' : 'collapsed'
    }));
    return (0, _reactNode.cloneElement)(icon, oriProps => ({
      className: (0, _clsx.clsx)(oriProps.className, `${prefixCls}-arrow`)
    }));
  }, [mergedExpandIcon, prefixCls, direction]);
  const collapseClassName = (0, _clsx.clsx)(`${prefixCls}-icon-placement-${mergedPlacement}`, {
    [`${prefixCls}-borderless`]: !bordered,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-ghost`]: !!ghost,
    [`${prefixCls}-${mergedSize}`]: mergedSize !== 'middle'
  }, contextClassName, className, rootClassName, hashId, cssVarCls, mergedClassNames.root);
  const openMotion = React.useMemo(() => ({
    ...(0, _motion.default)(rootPrefixCls),
    motionAppear: false,
    leavedClassName: `${prefixCls}-panel-hidden`
  }), [rootPrefixCls, prefixCls]);
  const items = React.useMemo(() => {
    if (children) {
      return (0, _util.toArray)(children).map(child => child);
    }
    return null;
  }, [children]);
  return (
    /*#__PURE__*/
    // @ts-ignore
    React.createElement(_collapse.default, {
      ref: ref,
      openMotion: openMotion,
      ...(0, _util.omit)(props, ['rootClassName']),
      expandIcon: renderExpandIcon,
      prefixCls: prefixCls,
      className: collapseClassName,
      style: {
        ...mergedStyles.root,
        ...contextStyle,
        ...style
      },
      classNames: mergedClassNames,
      styles: mergedStyles,
      destroyOnHidden: destroyOnHidden ?? destroyInactivePanel
    }, items)
  );
});
if (process.env.NODE_ENV !== 'production') {
  Collapse.displayName = 'Collapse';
}
var _default = exports.default = Object.assign(Collapse, {
  Panel: _CollapsePanel.default
});