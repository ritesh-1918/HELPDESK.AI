"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint react/prop-types: 0 */

const Pager = props => {
  const {
    rootPrefixCls,
    page,
    active,
    className,
    style,
    showTitle,
    onClick,
    onKeyPress,
    itemRender
  } = props;
  const prefixCls = `${rootPrefixCls}-item`;
  const cls = (0, _clsx.clsx)(prefixCls, `${prefixCls}-${page}`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-disabled`]: !page
  }, className);
  const handleClick = () => {
    onClick(page);
  };
  const handleKeyPress = e => {
    onKeyPress(e, onClick, page);
  };
  const pager = itemRender(page, 'page', /*#__PURE__*/_react.default.createElement("a", {
    rel: "nofollow"
  }, page));
  return pager ? /*#__PURE__*/_react.default.createElement("li", {
    title: showTitle ? String(page) : null,
    className: cls,
    style: style,
    onClick: handleClick,
    onKeyDown: handleKeyPress,
    tabIndex: 0
  }, pager) : null;
};
if (process.env.NODE_ENV !== 'production') {
  Pager.displayName = 'Pager';
}
var _default = exports.default = Pager;