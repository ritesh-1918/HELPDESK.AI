"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _responsiveObserver = require("../_util/responsiveObserver");
var _configProvider = require("../config-provider");
var _useBreakpoint = _interopRequireDefault(require("./hooks/useBreakpoint"));
var _useGutter = _interopRequireDefault(require("./hooks/useGutter"));
var _RowContext = _interopRequireDefault(require("./RowContext"));
var _style = require("./style");
const _RowAligns = ['top', 'middle', 'bottom', 'stretch'];
const _RowJustify = ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly'];
function useMergedPropByScreen(oriProp, screen) {
  const [prop, setProp] = React.useState(typeof oriProp === 'string' ? oriProp : '');
  const calcMergedAlignOrJustify = () => {
    if (typeof oriProp === 'string') {
      setProp(oriProp);
    }
    if (typeof oriProp !== 'object') {
      return;
    }
    for (let i = 0; i < _responsiveObserver.responsiveArray.length; i++) {
      const breakpoint = _responsiveObserver.responsiveArray[i];
      // if do not match, do nothing
      if (!screen || !screen[breakpoint]) {
        continue;
      }
      const curVal = oriProp[breakpoint];
      if (curVal !== undefined) {
        setProp(curVal);
        return;
      }
    }
  };
  React.useEffect(() => {
    calcMergedAlignOrJustify();
  }, [JSON.stringify(oriProp), screen]);
  return prop;
}
const Row = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    justify,
    align,
    className,
    style,
    children,
    gutter = 0,
    wrap,
    ...others
  } = props;
  const {
    getPrefixCls,
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const screens = (0, _useBreakpoint.default)(true, null);
  const mergedAlign = useMergedPropByScreen(align, screens);
  const mergedJustify = useMergedPropByScreen(justify, screens);
  const prefixCls = getPrefixCls('row', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.useRowStyle)(prefixCls);
  const gutters = (0, _useGutter.default)(gutter, screens);
  const classes = (0, _clsx.clsx)(prefixCls, {
    [`${prefixCls}-no-wrap`]: wrap === false,
    [`${prefixCls}-${mergedJustify}`]: mergedJustify,
    [`${prefixCls}-${mergedAlign}`]: mergedAlign,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, hashId, cssVarCls);
  // Add gutter related style
  const rowStyle = {};
  if (gutters?.[0]) {
    const horizontalGutter = typeof gutters[0] === 'number' ? `${gutters[0] / -2}px` : `calc(${gutters[0]} / -2)`;
    rowStyle.marginInline = horizontalGutter;
  }
  // "gutters" is a new array in each rendering phase, it'll make 'React.useMemo' effectless.
  // So we deconstruct "gutters" variable here.
  const [gutterH, gutterV] = gutters;
  rowStyle.rowGap = gutterV;
  const rowContext = React.useMemo(() => ({
    gutter: [gutterH, gutterV],
    wrap
  }), [gutterH, gutterV, wrap]);
  return /*#__PURE__*/React.createElement(_RowContext.default.Provider, {
    value: rowContext
  }, /*#__PURE__*/React.createElement("div", {
    ...others,
    className: classes,
    style: {
      ...rowStyle,
      ...style
    },
    ref: ref
  }, children));
});
if (process.env.NODE_ENV !== 'production') {
  Row.displayName = 'Row';
}
var _default = exports.default = Row;