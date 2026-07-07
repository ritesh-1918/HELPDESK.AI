"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCompactItemContext = exports.default = exports.SpaceCompactItemContext = exports.NoCompactStyle = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _compact = _interopRequireDefault(require("./style/compact"));
const SpaceCompactItemContext = exports.SpaceCompactItemContext = /*#__PURE__*/React.createContext(null);
const useCompactItemContext = (prefixCls, direction) => {
  const compactItemContext = React.useContext(SpaceCompactItemContext);
  const compactItemClassnames = React.useMemo(() => {
    if (!compactItemContext) {
      return '';
    }
    const {
      compactDirection,
      isFirstItem,
      isLastItem
    } = compactItemContext;
    const separator = compactDirection === 'vertical' ? '-vertical-' : '-';
    return (0, _clsx.clsx)(`${prefixCls}-compact${separator}item`, {
      [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
      [`${prefixCls}-compact${separator}last-item`]: isLastItem,
      [`${prefixCls}-compact${separator}item-rtl`]: direction === 'rtl'
    });
  }, [prefixCls, direction, compactItemContext]);
  return {
    compactSize: compactItemContext?.compactSize,
    compactDirection: compactItemContext?.compactDirection,
    compactItemClassnames
  };
};
exports.useCompactItemContext = useCompactItemContext;
const NoCompactStyle = props => {
  const {
    children
  } = props;
  return /*#__PURE__*/React.createElement(SpaceCompactItemContext.Provider, {
    value: null
  }, children);
};
exports.NoCompactStyle = NoCompactStyle;
const CompactItem = props => {
  const {
    children,
    ...others
  } = props;
  return /*#__PURE__*/React.createElement(SpaceCompactItemContext.Provider, {
    value: React.useMemo(() => others, [others])
  }, children);
};
const Compact = props => {
  const {
    getPrefixCls,
    direction: directionConfig
  } = React.useContext(_configProvider.ConfigContext);
  const {
    size,
    direction,
    orientation,
    block,
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    vertical,
    ...restProps
  } = props;
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Space.Compact');
    warning.deprecated(!direction, 'direction', 'orientation');
  }
  const [mergedOrientation, mergedVertical] = (0, _hooks.useOrientation)(orientation, vertical, direction);
  const mergedSize = (0, _useSize.default)(ctx => size ?? ctx);
  const prefixCls = getPrefixCls('space-compact', customizePrefixCls);
  const [hashId] = (0, _compact.default)(prefixCls);
  const clx = (0, _clsx.clsx)(prefixCls, hashId, {
    [`${prefixCls}-rtl`]: directionConfig === 'rtl',
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-vertical`]: mergedVertical
  }, className, rootClassName);
  const compactItemContext = React.useContext(SpaceCompactItemContext);
  const childNodes = (0, _util.toArray)(children);
  const nodes = React.useMemo(() => childNodes.map((child, i) => {
    const key = child?.key || `${prefixCls}-item-${i}`;
    return /*#__PURE__*/React.createElement(CompactItem, {
      key: key,
      compactSize: mergedSize,
      compactDirection: mergedOrientation,
      isFirstItem: i === 0 && (!compactItemContext || compactItemContext?.isFirstItem),
      isLastItem: i === childNodes.length - 1 && (!compactItemContext || compactItemContext?.isLastItem)
    }, child);
  }), [childNodes, compactItemContext, mergedOrientation, mergedSize, prefixCls]);
  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: clx,
    ...restProps
  }, nodes);
};
var _default = exports.default = Compact;