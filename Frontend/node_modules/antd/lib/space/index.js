"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "SpaceContext", {
  enumerable: true,
  get: function () {
    return _context2.SpaceContext;
  }
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _gapSize = require("../_util/gapSize");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _Addon = _interopRequireDefault(require("./Addon"));
var _Compact = _interopRequireDefault(require("./Compact"));
var _context2 = require("./context");
var _Item = _interopRequireDefault(require("./Item"));
var _style = _interopRequireDefault(require("./style"));
const InternalSpace = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction: directionConfig,
    size: contextSize,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('space');
  const {
    size = contextSize ?? 'small',
    align,
    className,
    rootClassName,
    children,
    direction,
    orientation,
    prefixCls: customizePrefixCls,
    split,
    separator,
    style,
    vertical,
    wrap = false,
    classNames,
    styles,
    ...restProps
  } = props;
  const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];
  const isPresetVerticalSize = (0, _gapSize.isPresetSize)(verticalSize);
  const isPresetHorizontalSize = (0, _gapSize.isPresetSize)(horizontalSize);
  const isValidVerticalSize = (0, _gapSize.isValidGapNumber)(verticalSize);
  const isValidHorizontalSize = (0, _gapSize.isValidGapNumber)(horizontalSize);
  const childNodes = (0, _util.toArray)(children, {
    keepEmpty: true
  });
  const [mergedOrientation, mergedVertical] = (0, _hooks.useOrientation)(orientation, vertical, direction);
  const mergedAlign = align === undefined && !mergedVertical ? 'center' : align;
  const mergedSeparator = separator ?? split;
  const prefixCls = getPrefixCls('space', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size,
    orientation: mergedOrientation,
    align: mergedAlign
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rootClassNames = (0, _clsx.clsx)(prefixCls, contextClassName, hashId, `${prefixCls}-${mergedOrientation}`, {
    [`${prefixCls}-rtl`]: directionConfig === 'rtl',
    [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
    [`${prefixCls}-gap-row-${verticalSize}`]: isPresetVerticalSize,
    [`${prefixCls}-gap-col-${horizontalSize}`]: isPresetHorizontalSize
  }, className, rootClassName, cssVarCls, mergedClassNames.root);
  const itemClassName = (0, _clsx.clsx)(`${prefixCls}-item`, mergedClassNames.item);
  // Calculate latest one
  const renderedItems = childNodes.map((child, i) => {
    const key = child?.key || `${itemClassName}-${i}`;
    return /*#__PURE__*/React.createElement(_Item.default, {
      prefix: prefixCls,
      classNames: mergedClassNames,
      styles: mergedStyles,
      className: itemClassName,
      key: key,
      index: i,
      separator: mergedSeparator,
      style: mergedStyles.item
    }, child);
  });
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Space');
    [['direction', 'orientation'], ['split', 'separator']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const memoizedSpaceContext = React.useMemo(() => {
    const calcLatestIndex = childNodes.reduce((latest, child, i) => (0, _isNonNullable.default)(child) ? i : latest, 0);
    return {
      latestIndex: calcLatestIndex
    };
  }, [childNodes]);
  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }
  const gapStyle = {};
  if (wrap) {
    gapStyle.flexWrap = 'wrap';
  }
  if (!isPresetHorizontalSize && isValidHorizontalSize) {
    gapStyle.columnGap = horizontalSize;
  }
  if (!isPresetVerticalSize && isValidVerticalSize) {
    gapStyle.rowGap = verticalSize;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: rootClassNames,
    style: {
      ...gapStyle,
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    ...restProps
  }, /*#__PURE__*/React.createElement(_context2.SpaceContextProvider, {
    value: memoizedSpaceContext
  }, renderedItems));
});
const Space = InternalSpace;
Space.Compact = _Compact.default;
Space.Addon = _Addon.default;
if (process.env.NODE_ENV !== 'production') {
  Space.displayName = 'Space';
}
var _default = exports.default = Space;