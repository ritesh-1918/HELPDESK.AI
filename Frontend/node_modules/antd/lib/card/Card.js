"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
var _skeleton = _interopRequireDefault(require("../skeleton"));
var _tabs = _interopRequireDefault(require("../tabs"));
var _CardGrid = _interopRequireDefault(require("./CardGrid"));
var _style = _interopRequireDefault(require("./style"));
const ActionNode = props => {
  const {
    actionClasses,
    actions = [],
    actionStyle
  } = props;
  return /*#__PURE__*/React.createElement("ul", {
    className: actionClasses,
    style: actionStyle
  }, actions.map((action, index) => {
    // Move this out since eslint not allow index key
    // And eslint-disable makes conflict with rollup
    // ref https://github.com/ant-design/ant-design/issues/46022
    const key = `action-${index}`;
    return /*#__PURE__*/React.createElement("li", {
      style: {
        width: `${100 / actions.length}%`
      },
      key: key
    }, /*#__PURE__*/React.createElement("span", null, action));
  }));
};
const Card = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    extra,
    headStyle = {},
    bodyStyle = {},
    title,
    loading,
    bordered,
    variant: customVariant,
    size: customizeSize,
    type,
    cover,
    actions,
    tabList,
    children,
    activeTabKey,
    defaultActiveTabKey,
    tabBarExtraContent,
    hoverable,
    tabProps = {},
    classNames,
    styles,
    ...rest
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('card');
  const [variant] = (0, _useVariants.default)('card', customVariant, bordered);
  const mergedSize = (0, _useSize.default)(customizeSize);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    variant: variant,
    loading
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // =================Warning===================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Card');
    [['headStyle', 'styles.header'], ['bodyStyle', 'styles.body'], ['bordered', 'variant']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const onTabChange = key => {
    props.onTabChange?.(key);
  };
  const isContainGrid = React.useMemo(() => {
    const childNodes = (0, _util.toArray)(children);
    return childNodes.some(child => /*#__PURE__*/React.isValidElement(child) && child.type === _CardGrid.default);
  }, [children]);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const loadingBlock = /*#__PURE__*/React.createElement(_skeleton.default, {
    loading: true,
    active: true,
    paragraph: {
      rows: 4
    },
    title: false
  }, children);
  const hasActiveTabKey = activeTabKey !== undefined;
  const extraProps = {
    ...tabProps,
    [hasActiveTabKey ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey ? activeTabKey : defaultActiveTabKey,
    tabBarExtraContent
  };
  let head;
  const tabSize = !mergedSize || mergedSize === 'default' ? 'large' : mergedSize;
  const tabs = tabList ? (/*#__PURE__*/React.createElement(_tabs.default, {
    size: tabSize,
    ...extraProps,
    className: `${prefixCls}-head-tabs`,
    onChange: onTabChange,
    items: tabList.map(({
      tab,
      ...item
    }) => ({
      label: tab,
      ...item
    }))
  })) : null;
  if (title || extra || tabs) {
    const headClasses = (0, _clsx.clsx)(`${prefixCls}-head`, mergedClassNames.header);
    const titleClasses = (0, _clsx.clsx)(`${prefixCls}-head-title`, mergedClassNames.title);
    const extraClasses = (0, _clsx.clsx)(`${prefixCls}-extra`, mergedClassNames.extra);
    const mergedHeadStyle = {
      ...headStyle,
      ...mergedStyles.header
    };
    head = /*#__PURE__*/React.createElement("div", {
      className: headClasses,
      style: mergedHeadStyle
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-head-wrapper`
    }, title && (/*#__PURE__*/React.createElement("div", {
      className: titleClasses,
      style: mergedStyles.title
    }, title)), extra && (/*#__PURE__*/React.createElement("div", {
      className: extraClasses,
      style: mergedStyles.extra
    }, extra))), tabs);
  }
  const coverClasses = (0, _clsx.clsx)(`${prefixCls}-cover`, mergedClassNames.cover);
  const coverDom = cover ? (/*#__PURE__*/React.createElement("div", {
    className: coverClasses,
    style: mergedStyles.cover
  }, cover)) : null;
  const bodyClasses = (0, _clsx.clsx)(`${prefixCls}-body`, mergedClassNames.body);
  const mergedBodyStyle = {
    ...bodyStyle,
    ...mergedStyles.body
  };
  const body = /*#__PURE__*/React.createElement("div", {
    className: bodyClasses,
    style: mergedBodyStyle
  }, loading ? loadingBlock : children);
  const actionClasses = (0, _clsx.clsx)(`${prefixCls}-actions`, mergedClassNames.actions);
  const actionDom = actions?.length ? (/*#__PURE__*/React.createElement(ActionNode, {
    actionClasses: actionClasses,
    actionStyle: mergedStyles.actions,
    actions: actions
  })) : null;
  const divProps = (0, _util.omit)(rest, ['onTabChange']);
  const classString = (0, _clsx.clsx)(prefixCls, contextClassName, {
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-bordered`]: variant !== 'borderless',
    [`${prefixCls}-hoverable`]: hoverable,
    [`${prefixCls}-contain-grid`]: isContainGrid,
    [`${prefixCls}-contain-tabs`]: tabList?.length,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    [`${prefixCls}-type-${type}`]: !!type,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, hashId, cssVarCls, mergedClassNames.root);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    ...divProps,
    className: classString,
    style: mergedStyle
  }, head, coverDom, body, actionDom);
});
if (process.env.NODE_ENV !== 'production') {
  Card.displayName = 'Card';
}
var _default = exports.default = Card;