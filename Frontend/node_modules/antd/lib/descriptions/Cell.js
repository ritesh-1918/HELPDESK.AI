"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _DescriptionsContext = _interopRequireDefault(require("./DescriptionsContext"));
const Cell = props => {
  const {
    itemPrefixCls,
    component,
    span,
    className,
    style,
    labelStyle,
    contentStyle,
    bordered,
    label,
    content,
    colon,
    type,
    styles,
    classNames
  } = props;
  const Component = component;
  const {
    classNames: contextClassNames,
    styles: contextStyles
  } = _react.default.useContext(_DescriptionsContext.default);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  const mergedLabelStyle = {
    ...labelStyle,
    ...mergedStyles.label
  };
  const mergedContentStyle = {
    ...contentStyle,
    ...mergedStyles.content
  };
  if (bordered) {
    return /*#__PURE__*/_react.default.createElement(Component, {
      colSpan: span,
      style: style,
      className: (0, _clsx.clsx)(className, {
        [`${itemPrefixCls}-item-${type}`]: type === 'label' || type === 'content',
        [mergedClassNames.label]: mergedClassNames.label && type === 'label',
        [mergedClassNames.content]: mergedClassNames.content && type === 'content'
      })
    }, (0, _isNonNullable.default)(label) && /*#__PURE__*/_react.default.createElement("span", {
      style: mergedLabelStyle
    }, label), (0, _isNonNullable.default)(content) && /*#__PURE__*/_react.default.createElement("span", {
      style: mergedContentStyle
    }, content));
  }
  return /*#__PURE__*/_react.default.createElement(Component, {
    className: (0, _clsx.clsx)(`${itemPrefixCls}-item`, className),
    style: style,
    colSpan: span
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `${itemPrefixCls}-item-container`
  }, (0, _isNonNullable.default)(label) && (/*#__PURE__*/_react.default.createElement("span", {
    style: mergedLabelStyle,
    className: (0, _clsx.clsx)(`${itemPrefixCls}-item-label`, mergedClassNames.label, {
      [`${itemPrefixCls}-item-no-colon`]: !colon
    })
  }, label)), (0, _isNonNullable.default)(content) && (/*#__PURE__*/_react.default.createElement("span", {
    style: mergedContentStyle,
    className: (0, _clsx.clsx)(`${itemPrefixCls}-item-content`, mergedClassNames.content)
  }, content))));
};
var _default = exports.default = Cell;