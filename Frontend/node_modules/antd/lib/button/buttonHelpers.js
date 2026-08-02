"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ButtonVariantTypes = exports._ButtonColorTypes = void 0;
exports.convertLegacyProps = convertLegacyProps;
exports.isString = isString;
exports.isTwoCNChar = void 0;
exports.isUnBorderedButtonVariant = isUnBorderedButtonVariant;
exports.spaceChildren = spaceChildren;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _reactNode = require("../_util/reactNode");
var _interface = require("../theme/interface");
const rxTwoCNChar = /^[\u4E00-\u9FA5]{2}$/;
const isTwoCNChar = exports.isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function convertLegacyProps(type) {
  if (type === 'danger') {
    return {
      danger: true
    };
  }
  return {
    type
  };
}
function isString(str) {
  return typeof str === 'string';
}
function isUnBorderedButtonVariant(type) {
  return type === 'text' || type === 'link';
}
function splitCNCharsBySpace(child, needInserted, style, className) {
  if (!(0, _isNonNullable.default)(child) || child === '') {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  if (typeof child !== 'string' && typeof child !== 'number' && isString(child.type) && isTwoCNChar(child.props.children)) {
    return (0, _reactNode.cloneElement)(child, oriProps => {
      const mergedCls = (0, _clsx.clsx)(oriProps.className, className) || undefined;
      const mergedStyle = {
        ...style,
        ...oriProps.style
      };
      return {
        ...oriProps,
        children: oriProps.children.split('').join(SPACE),
        className: mergedCls,
        style: mergedStyle
      };
    });
  }
  if (isString(child)) {
    return /*#__PURE__*/_react.default.createElement("span", {
      className: className,
      style: style
    }, isTwoCNChar(child) ? child.split('').join(SPACE) : child);
  }
  if ((0, _reactNode.isFragment)(child)) {
    return /*#__PURE__*/_react.default.createElement("span", {
      className: className,
      style: style
    }, child);
  }
  return (0, _reactNode.cloneElement)(child, oriProps => ({
    ...oriProps,
    className: (0, _clsx.clsx)(oriProps.className, className) || undefined,
    style: {
      ...oriProps.style,
      ...style
    }
  }));
}
function spaceChildren(children, needInserted, style, className) {
  let isPrevChildPure = false;
  const childList = [];
  _react.default.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });
  return _react.default.Children.map(childList, child => splitCNCharsBySpace(child, needInserted, style, className));
}
const _ButtonTypes = ['default', 'primary', 'dashed', 'link', 'text'];
const _ButtonShapes = ['default', 'circle', 'round', 'square'];
const _ButtonHTMLTypes = ['submit', 'button', 'reset'];
const _ButtonVariantTypes = exports._ButtonVariantTypes = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'];
const _ButtonColorTypes = exports._ButtonColorTypes = ['default', 'primary', 'danger'].concat((0, _toConsumableArray2.default)(_interface.PresetColors));