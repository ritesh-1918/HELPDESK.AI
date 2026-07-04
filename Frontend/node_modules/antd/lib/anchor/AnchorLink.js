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
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = _interopRequireDefault(require("./context"));
const AnchorLink = props => {
  const {
    href,
    title,
    prefixCls: customizePrefixCls,
    children,
    className,
    target,
    replace
  } = props;
  const context = React.useContext(_context.default);
  const {
    registerLink,
    unregisterLink,
    scrollTo,
    onClick,
    activeLink,
    direction,
    classNames: mergedClassNames,
    styles: mergedStyles
  } = context || {};
  React.useEffect(() => {
    registerLink?.(href);
    return () => {
      unregisterLink?.(href);
    };
  }, [href]);
  const handleClick = e => {
    onClick?.(e, {
      title,
      href
    });
    scrollTo?.(href);
    // Support clicking on an anchor does not record history.
    if (e.defaultPrevented) {
      return;
    }
    const isExternalLink = href.startsWith('http://') || href.startsWith('https://');
    // Support external link
    if (isExternalLink) {
      if (replace) {
        e.preventDefault();
        window.location.replace(href);
      }
      return;
    }
    // Handling internal anchor link
    e.preventDefault();
    const historyMethod = replace ? 'replaceState' : 'pushState';
    window.history[historyMethod](null, '', href);
  };
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Anchor.Link');
    process.env.NODE_ENV !== "production" ? warning(!children || direction !== 'horizontal', 'usage', '`Anchor.Link children` is not supported when `Anchor` direction is horizontal') : void 0;
  }
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('anchor', customizePrefixCls);
  const active = activeLink === href;
  const wrapperClassName = (0, _clsx.clsx)(`${prefixCls}-link`, className, mergedClassNames?.item, {
    [`${prefixCls}-link-active`]: active
  });
  const titleClassName = (0, _clsx.clsx)(`${prefixCls}-link-title`, mergedClassNames?.itemTitle, {
    [`${prefixCls}-link-title-active`]: active
  });
  return /*#__PURE__*/React.createElement("div", {
    className: wrapperClassName,
    style: mergedStyles?.item
  }, /*#__PURE__*/React.createElement("a", {
    className: titleClassName,
    style: mergedStyles?.itemTitle,
    href: href,
    title: typeof title === 'string' ? title : '',
    target: target,
    onClick: handleClick
  }, title), direction !== 'horizontal' ? children : null);
};
var _default = exports.default = AnchorLink;