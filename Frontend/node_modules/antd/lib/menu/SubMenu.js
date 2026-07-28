"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _menu = require("@rc-component/menu");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _reactNode = require("../_util/reactNode");
var _MenuContext = _interopRequireDefault(require("./MenuContext"));
const SubMenu = props => {
  const {
    popupClassName,
    icon,
    title,
    theme: customTheme
  } = props;
  const context = React.useContext(_MenuContext.default);
  const {
    prefixCls,
    inlineCollapsed,
    theme: contextTheme,
    classNames,
    styles
  } = context;
  const parentPath = (0, _menu.useFullPath)();
  let titleNode;
  if (!icon) {
    titleNode = inlineCollapsed && !parentPath.length && title && typeof title === 'string' ? (/*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-inline-collapsed-noicon`
    }, title.charAt(0))) : (/*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-title-content`
    }, title));
  } else {
    // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
    // ref: https://github.com/ant-design/ant-design/pull/23456
    const titleIsSpan = /*#__PURE__*/React.isValidElement(title) && title.type === 'span';
    titleNode = /*#__PURE__*/React.createElement(React.Fragment, null, (0, _reactNode.cloneElement)(icon, oriProps => ({
      className: (0, _clsx.clsx)(oriProps.className, `${prefixCls}-item-icon`, classNames?.itemIcon),
      style: {
        ...oriProps.style,
        ...styles?.itemIcon
      }
    })), titleIsSpan ? title : /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-title-content`
    }, title));
  }
  const contextValue = React.useMemo(() => ({
    ...context,
    firstLevel: false
  }), [context]);
  // ============================ zIndex ============================
  const [zIndex] = (0, _hooks.useZIndex)('Menu');
  return /*#__PURE__*/React.createElement(_MenuContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(_menu.SubMenu, {
    ...(0, _util.omit)(props, ['icon']),
    title: titleNode,
    classNames: {
      list: classNames?.subMenu?.list,
      listTitle: classNames?.subMenu?.itemTitle
    },
    styles: {
      list: styles?.subMenu?.list,
      listTitle: styles?.subMenu?.itemTitle
    },
    popupClassName: (0, _clsx.clsx)(prefixCls, popupClassName, classNames?.popup?.root, `${prefixCls}-${customTheme || contextTheme}`),
    popupStyle: {
      zIndex,
      // fix: https://github.com/ant-design/ant-design/issues/47826#issuecomment-2360737237
      ...props.popupStyle,
      ...styles?.popup?.root
    }
  }));
};
var _default = exports.default = SubMenu;