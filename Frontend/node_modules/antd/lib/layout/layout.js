"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Header = exports.Footer = exports.Content = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _context2 = require("./context");
var _useHasSider = _interopRequireDefault(require("./hooks/useHasSider"));
var _style = _interopRequireDefault(require("./style"));
const generator = ({
  suffixCls,
  tagName,
  displayName
}) => {
  return Component => {
    const Adapter = /*#__PURE__*/React.forwardRef((props, ref) => (/*#__PURE__*/React.createElement(Component, {
      ref: ref,
      suffixCls: suffixCls,
      tagName: tagName,
      ...props
    })));
    if (process.env.NODE_ENV !== 'production') {
      Adapter.displayName = displayName;
    }
    return Adapter;
  };
};
const Basic = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    suffixCls,
    className,
    tagName: TagName,
    ...others
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('layout', customizePrefixCls);
  const [hashId] = (0, _style.default)(prefixCls);
  const prefixWithSuffixCls = suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  return /*#__PURE__*/React.createElement(TagName, {
    className: (0, _clsx.clsx)(customizePrefixCls || prefixWithSuffixCls, className, hashId),
    ref: ref,
    ...others
  });
});
const BasicLayout = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const [siders, setSiders] = React.useState([]);
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    hasSider,
    tagName: Tag,
    style,
    ...others
  } = props;
  const passedProps = (0, _util.omit)(others, ['suffixCls']);
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle
  } = (0, _context.useComponentConfig)('layout');
  const prefixCls = getPrefixCls('layout', customizePrefixCls);
  const mergedHasSider = (0, _useHasSider.default)(siders, children, hasSider);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const classString = (0, _clsx.clsx)(prefixCls, {
    [`${prefixCls}-has-sider`]: mergedHasSider,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const contextValue = React.useMemo(() => ({
    siderHook: {
      addSider: id => {
        setSiders(prev => [].concat((0, _toConsumableArray2.default)(prev), [id]));
      },
      removeSider: id => {
        setSiders(prev => prev.filter(currentId => currentId !== id));
      }
    }
  }), []);
  return /*#__PURE__*/React.createElement(_context2.LayoutContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Tag, {
    ref: ref,
    className: classString,
    style: {
      ...contextStyle,
      ...style
    },
    ...passedProps
  }, children));
});
const Layout = generator({
  tagName: 'div',
  displayName: 'Layout'
})(BasicLayout);
const Header = exports.Header = generator({
  suffixCls: 'header',
  tagName: 'header',
  displayName: 'Header'
})(Basic);
const Footer = exports.Footer = generator({
  suffixCls: 'footer',
  tagName: 'footer',
  displayName: 'Footer'
})(Basic);
const Content = exports.Content = generator({
  suffixCls: 'content',
  tagName: 'main',
  displayName: 'Content'
})(Basic);
var _default = exports.default = Layout;