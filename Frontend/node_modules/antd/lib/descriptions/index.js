"use strict";
"use client";

/* eslint-disable react/no-array-index-key */
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DescriptionsContext", {
  enumerable: true,
  get: function () {
    return _DescriptionsContext.default;
  }
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _responsiveObserver = require("../_util/responsiveObserver");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _useBreakpoint = _interopRequireDefault(require("../grid/hooks/useBreakpoint"));
var _constant = _interopRequireDefault(require("./constant"));
var _DescriptionsContext = _interopRequireDefault(require("./DescriptionsContext"));
var _useItems = _interopRequireDefault(require("./hooks/useItems"));
var _useRow = _interopRequireDefault(require("./hooks/useRow"));
var _Item = _interopRequireDefault(require("./Item"));
var _Row = _interopRequireDefault(require("./Row"));
var _style = _interopRequireDefault(require("./style"));
const Descriptions = props => {
  const {
    prefixCls: customizePrefixCls,
    title,
    extra,
    column,
    colon = true,
    bordered,
    layout,
    children,
    className,
    rootClassName,
    style,
    size: customizeSize,
    labelStyle,
    contentStyle,
    styles,
    items,
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
  } = (0, _context.useComponentConfig)('descriptions');
  const prefixCls = getPrefixCls('descriptions', customizePrefixCls);
  const screens = (0, _useBreakpoint.default)();
  // ============================== Warn ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Descriptions');
    [['labelStyle', 'styles.label'], ['contentStyle', 'styles.content']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  // Column count
  const mergedColumn = React.useMemo(() => {
    if (typeof column === 'number') {
      return column;
    }
    return (0, _responsiveObserver.matchScreen)(screens, {
      ..._constant.default,
      ...column
    }) ?? 3;
  }, [screens, column]);
  // Items with responsive
  const mergedItems = (0, _useItems.default)(screens, items, children);
  const mergedSize = (0, _useSize.default)(customizeSize);
  const rows = (0, _useRow.default)(mergedColumn, mergedItems);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    column: mergedColumn,
    items: mergedItems,
    size: mergedSize
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ======================== Render ========================
  const memoizedValue = React.useMemo(() => ({
    labelStyle,
    contentStyle,
    styles: {
      label: mergedStyles.label,
      content: mergedStyles.content
    },
    classNames: {
      label: mergedClassNames.label,
      content: mergedClassNames.content
    }
  }), [labelStyle, contentStyle, mergedStyles.label, mergedStyles.content, mergedClassNames.label, mergedClassNames.content]);
  return /*#__PURE__*/React.createElement(_DescriptionsContext.default.Provider, {
    value: memoizedValue
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(prefixCls, contextClassName, mergedClassNames.root, {
      [`${prefixCls}-${mergedSize}`]: mergedSize && mergedSize !== 'default',
      [`${prefixCls}-bordered`]: !!bordered,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, className, rootClassName, hashId, cssVarCls),
    style: {
      ...contextStyle,
      ...mergedStyles.root,
      ...style
    },
    ...restProps
  }, (title || extra) && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-header`, mergedClassNames.header),
    style: mergedStyles.header
  }, title && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, mergedClassNames.title),
    style: mergedStyles.title
  }, title)), extra && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-extra`, mergedClassNames.extra),
    style: mergedStyles.extra
  }, extra)))), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-view`
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("tbody", null, rows.map((row, index) => (/*#__PURE__*/React.createElement(_Row.default, {
    key: index,
    index: index,
    colon: colon,
    prefixCls: prefixCls,
    vertical: layout === 'vertical',
    bordered: bordered,
    row: row
  }))))))));
};
if (process.env.NODE_ENV !== 'production') {
  Descriptions.displayName = 'Descriptions';
}
Descriptions.Item = _Item.default;
var _default = exports.default = Descriptions;