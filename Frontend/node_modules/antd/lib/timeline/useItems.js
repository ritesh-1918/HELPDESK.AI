"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LoadingOutlined = _interopRequireDefault(require("@ant-design/icons/LoadingOutlined"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _genStyleUtils = require("../theme/util/genStyleUtils");
const useItems = (rootPrefixCls, prefixCls, mode, items, children, pending, pendingDot) => {
  const itemCls = `${prefixCls}-item`;
  const [varName] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'cmp-steps');
  // Merge items and children
  const parseItems = React.useMemo(() => {
    return Array.isArray(items) ? items : (0, _util.toArray)(children).map(ele => ({
      ...ele.props
    }));
  }, [items, children]);
  // convert legacy type
  return React.useMemo(() => {
    const mergedItems = parseItems.map((item, index) => {
      const {
        label,
        children,
        title,
        content,
        color,
        className,
        style,
        icon,
        dot,
        placement,
        position,
        loading,
        ...restProps
      } = item;
      let mergedStyle = style;
      let mergedClassName = className;
      if (color) {
        if (['blue', 'red', 'green', 'gray'].includes(color)) {
          mergedClassName = (0, _clsx.clsx)(className, `${itemCls}-color-${color}`);
        } else {
          mergedStyle = {
            [varName('item-icon-dot-color')]: color,
            ...style
          };
        }
      }
      // Placement
      const mergedPlacement = placement ?? position ?? (mode === 'alternate' ? index % 2 === 0 ? 'start' : 'end' : mode);
      mergedClassName = (0, _clsx.clsx)(mergedClassName, `${itemCls}-placement-${mergedPlacement}`);
      // Icon
      let mergedIcon = icon ?? dot;
      if (!mergedIcon && loading) {
        mergedIcon = /*#__PURE__*/React.createElement(_LoadingOutlined.default, null);
      }
      return {
        ...restProps,
        title: title ?? label,
        content: content ?? children,
        style: mergedStyle,
        className: mergedClassName,
        icon: mergedIcon,
        status: loading ? 'process' : 'finish'
      };
    });
    if (pending) {
      mergedItems.push({
        icon: pendingDot ?? /*#__PURE__*/React.createElement(_LoadingOutlined.default, null),
        content: pending,
        status: 'process'
      });
    }
    return mergedItems;
  }, [parseItems, pending, mode, itemCls, varName, pendingDot]);
};
var _default = exports.default = useItems;