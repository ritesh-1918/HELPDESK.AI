"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _segmented = _interopRequireDefault(require("@rc-component/segmented"));
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _context = require("../config-provider/context");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _tooltip = _interopRequireDefault(require("../tooltip"));
var _style = _interopRequireDefault(require("./style"));
function isSegmentedLabeledOptionWithIcon(option) {
  return typeof option === 'object' && !!option?.icon;
}
const InternalSegmented = /*#__PURE__*/React.forwardRef((props, ref) => {
  const defaultName = (0, _useId.default)();
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    block,
    options = [],
    size: customSize = 'middle',
    style,
    vertical,
    orientation,
    shape = 'default',
    name = defaultName,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('segmented');
  const mergedProps = {
    ...props,
    options,
    size: customSize,
    shape
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('segmented', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  // ===================== Size =====================
  const mergedSize = (0, _useSize.default)(customSize);
  // syntactic sugar to support `icon` for Segmented Item
  const extendedOptions = React.useMemo(() => options.map(option => {
    if (isSegmentedLabeledOptionWithIcon(option)) {
      const {
        icon,
        label,
        ...restOption
      } = option;
      return {
        ...restOption,
        label: (/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
          className: (0, _clsx.clsx)(`${prefixCls}-item-icon`, mergedClassNames.icon),
          style: mergedStyles.icon
        }, icon), label && /*#__PURE__*/React.createElement("span", null, label)))
      };
    }
    return option;
  }), [options, prefixCls, mergedClassNames.icon, mergedStyles.icon]);
  const [, mergedVertical] = (0, _hooks.useOrientation)(orientation, vertical);
  const cls = (0, _clsx.clsx)(className, rootClassName, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-sm`]: mergedSize === 'small',
    [`${prefixCls}-lg`]: mergedSize === 'large',
    [`${prefixCls}-vertical`]: mergedVertical,
    [`${prefixCls}-shape-${shape}`]: shape === 'round'
  }, hashId, cssVarCls);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const itemRender = (node, {
    item
  }) => {
    if (!item.tooltip) {
      return node;
    }
    const tooltipProps = typeof item.tooltip === 'object' ? item.tooltip : {
      title: item.tooltip
    };
    return /*#__PURE__*/React.createElement(_tooltip.default, {
      ...tooltipProps
    }, node);
  };
  return /*#__PURE__*/React.createElement(_segmented.default, {
    ...restProps,
    name: name,
    className: cls,
    style: mergedStyle,
    classNames: mergedClassNames,
    styles: mergedStyles,
    itemRender: itemRender,
    options: extendedOptions,
    ref: ref,
    prefixCls: prefixCls,
    direction: direction,
    vertical: mergedVertical
  });
});
const Segmented = InternalSegmented;
if (process.env.NODE_ENV !== 'production') {
  Segmented.displayName = 'Segmented';
}
var _default = exports.default = Segmented;