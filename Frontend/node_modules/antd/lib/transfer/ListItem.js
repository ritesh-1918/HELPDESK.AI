"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DeleteOutlined = _interopRequireDefault(require("@ant-design/icons/DeleteOutlined"));
var _clsx = require("clsx");
var _checkbox = _interopRequireDefault(require("../checkbox"));
var _locale = require("../locale");
var _en_US = _interopRequireDefault(require("../locale/en_US"));
const ListItem = props => {
  const {
    prefixCls,
    classNames,
    styles,
    renderedText,
    renderedEl,
    item,
    checked,
    disabled,
    onClick,
    onRemove,
    showRemove
  } = props;
  const mergedDisabled = disabled || item?.disabled;
  const classes = (0, _clsx.clsx)(`${prefixCls}-content-item`, classNames.item, {
    [`${prefixCls}-content-item-disabled`]: mergedDisabled,
    [`${prefixCls}-content-item-checked`]: checked && !mergedDisabled
  });
  let title;
  if (typeof renderedText === 'string' || typeof renderedText === 'number') {
    title = String(renderedText);
  }
  const [contextLocale] = (0, _locale.useLocale)('Transfer', _en_US.default.Transfer);
  const liProps = {
    className: classes,
    style: styles.item,
    title
  };
  const labelNode = /*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefixCls}-content-item-text`, classNames.itemContent),
    style: styles.itemContent
  }, renderedEl);
  if (showRemove) {
    return /*#__PURE__*/React.createElement("li", {
      ...liProps
    }, labelNode, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: mergedDisabled,
      className: `${prefixCls}-content-item-remove`,
      "aria-label": contextLocale?.remove,
      onClick: () => onRemove?.(item)
    }, /*#__PURE__*/React.createElement(_DeleteOutlined.default, null)));
  }
  // Default click to select
  liProps.onClick = mergedDisabled ? undefined : event => onClick(item, event);
  return /*#__PURE__*/React.createElement("li", {
    ...liProps
  }, /*#__PURE__*/React.createElement(_checkbox.default, {
    className: (0, _clsx.clsx)(`${prefixCls}-checkbox`, classNames.itemIcon),
    style: styles.itemIcon,
    checked: checked,
    disabled: mergedDisabled
  }), labelNode);
};
var _default = exports.default = /*#__PURE__*/React.memo(ListItem);