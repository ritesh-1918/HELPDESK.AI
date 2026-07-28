"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _QuestionCircleOutlined = _interopRequireDefault(require("@ant-design/icons/QuestionCircleOutlined"));
var _clsx = require("clsx");
var _col = _interopRequireDefault(require("../grid/col"));
var _locale = require("../locale");
var _en_US = _interopRequireDefault(require("../locale/en_US"));
var _tooltip = _interopRequireDefault(require("../tooltip"));
var _context = require("./context");
var _convertToTooltipProps = _interopRequireDefault(require("../_util/convertToTooltipProps"));
const FormItemLabel = ({
  prefixCls,
  label,
  htmlFor,
  labelCol,
  labelAlign,
  colon,
  required,
  requiredMark,
  tooltip,
  vertical
}) => {
  const [formLocale] = (0, _locale.useLocale)('Form');
  const {
    labelAlign: contextLabelAlign,
    labelCol: contextLabelCol,
    labelWrap,
    colon: contextColon,
    classNames: contextClassNames,
    styles: contextStyles,
    tooltip: contextTooltip
  } = React.useContext(_context.FormContext);
  if (!label) {
    return null;
  }
  const mergedLabelCol = labelCol || contextLabelCol || {};
  const mergedLabelAlign = labelAlign || contextLabelAlign;
  const labelClsBasic = `${prefixCls}-item-label`;
  const labelColClassName = (0, _clsx.clsx)(labelClsBasic, mergedLabelAlign === 'left' && `${labelClsBasic}-left`, mergedLabelCol.className, {
    [`${labelClsBasic}-wrap`]: !!labelWrap
  });
  let labelChildren = label;
  // Keep label is original where there should have no colon
  const computedColon = colon === true || contextColon !== false && colon !== false;
  const haveColon = computedColon && !vertical;
  // Remove duplicated user input colon
  if (haveColon && typeof label === 'string' && label.trim()) {
    labelChildren = label.replace(/[:|：]\s*$/, '');
  }
  const tooltipProps = (0, _convertToTooltipProps.default)(tooltip, contextTooltip);
  if (tooltipProps) {
    const tooltipNode = /*#__PURE__*/React.createElement(_tooltip.default, {
      ...tooltipProps
    }, /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-item-tooltip`,
      onClick: e => {
        e.preventDefault();
      },
      tabIndex: -1
    }, tooltipProps.icon || tooltipProps.children || /*#__PURE__*/React.createElement(_QuestionCircleOutlined.default, null)));
    labelChildren = /*#__PURE__*/React.createElement(React.Fragment, null, labelChildren, tooltipNode);
  }
  // Required Mark
  const isOptionalMark = requiredMark === 'optional';
  const isRenderMark = typeof requiredMark === 'function';
  const hideRequiredMark = requiredMark === false;
  if (isRenderMark) {
    labelChildren = requiredMark(labelChildren, {
      required: !!required
    });
  } else if (isOptionalMark && !required) {
    labelChildren = /*#__PURE__*/React.createElement(React.Fragment, null, labelChildren, /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-item-optional`,
      title: ""
    }, formLocale?.optional || _en_US.default.Form?.optional));
  }
  // https://github.com/ant-design/ant-design/pull/52950#discussion_r1980880316
  let markType;
  if (hideRequiredMark) {
    markType = 'hidden';
  } else if (isOptionalMark || isRenderMark) {
    markType = 'optional';
  }
  const labelClassName = (0, _clsx.clsx)(contextClassNames?.label, {
    [`${prefixCls}-item-required`]: required,
    [`${prefixCls}-item-required-mark-${markType}`]: markType,
    [`${prefixCls}-item-no-colon`]: !computedColon
  });
  return /*#__PURE__*/React.createElement(_col.default, {
    ...mergedLabelCol,
    className: labelColClassName
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    className: labelClassName,
    style: contextStyles?.label,
    title: typeof label === 'string' ? label : ''
  }, labelChildren));
};
var _default = exports.default = FormItemLabel;