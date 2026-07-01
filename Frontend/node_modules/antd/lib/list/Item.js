"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Meta = void 0;
var _react = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _reactNode = require("../_util/reactNode");
var _configProvider = require("../config-provider");
var _grid = require("../grid");
var _context = require("./context");
const Meta = ({
  prefixCls: customizePrefixCls,
  className,
  avatar,
  title,
  description,
  ...others
}) => {
  const {
    getPrefixCls
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const classString = (0, _clsx.clsx)(`${prefixCls}-item-meta`, className);
  const content = /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-item-meta-content`
  }, title && /*#__PURE__*/_react.default.createElement("h4", {
    className: `${prefixCls}-item-meta-title`
  }, title), description && /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-item-meta-description`
  }, description));
  return /*#__PURE__*/_react.default.createElement("div", {
    ...others,
    className: classString
  }, avatar && /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-item-meta-avatar`
  }, avatar), (title || description) && content);
};
exports.Meta = Meta;
const InternalItem = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    children,
    actions,
    extra,
    styles,
    className,
    classNames: customizeClassNames,
    colStyle,
    ...others
  } = props;
  const {
    grid,
    itemLayout
  } = (0, _react.useContext)(_context.ListContext);
  const {
    getPrefixCls,
    list
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const moduleClass = moduleName => (0, _clsx.clsx)(list?.item?.classNames?.[moduleName], customizeClassNames?.[moduleName]);
  const moduleStyle = moduleName => ({
    ...list?.item?.styles?.[moduleName],
    ...styles?.[moduleName]
  });
  const isItemContainsTextNodeAndNotSingular = () => {
    const childNodes = (0, _util.toArray)(children);
    const hasTextNode = childNodes.some(node => typeof node === 'string');
    return hasTextNode && childNodes.length > 1;
  };
  const isFlexMode = () => {
    if (itemLayout === 'vertical') {
      return !!extra;
    }
    return !isItemContainsTextNodeAndNotSingular();
  };
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const actionsContent = actions && actions.length > 0 && (/*#__PURE__*/_react.default.createElement("ul", {
    className: (0, _clsx.clsx)(`${prefixCls}-item-action`, moduleClass('actions')),
    key: "actions",
    style: moduleStyle('actions')
  }, actions.map((action, i) => (
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  _react.default.createElement("li", {
    key: `${prefixCls}-item-action-${i}`
  }, action, i !== actions.length - 1 && /*#__PURE__*/_react.default.createElement("em", {
    className: `${prefixCls}-item-action-split`
  }))))));
  const Element = grid ? 'div' : 'li';
  const itemChildren = /*#__PURE__*/_react.default.createElement(Element, {
    ...others,
    ...(!grid ? {
      ref
    } : {}),
    className: (0, _clsx.clsx)(`${prefixCls}-item`, {
      [`${prefixCls}-item-no-flex`]: !isFlexMode()
    }, className)
  }, itemLayout === 'vertical' && extra ? [/*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-item-main`,
    key: "content"
  }, children, actionsContent), /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-item-extra`, moduleClass('extra')),
    key: "extra",
    style: moduleStyle('extra')
  }, extra)] : [children, actionsContent, (0, _reactNode.cloneElement)(extra, {
    key: 'extra'
  })]);
  return grid ? (/*#__PURE__*/_react.default.createElement(_grid.Col, {
    ref: ref,
    flex: 1,
    style: colStyle
  }, itemChildren)) : itemChildren;
});
const Item = InternalItem;
Item.Meta = Meta;
var _default = exports.default = Item;