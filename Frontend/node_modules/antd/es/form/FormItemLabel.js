"use client";

import * as React from 'react';
import QuestionCircleOutlined from "@ant-design/icons/es/icons/QuestionCircleOutlined";
import { clsx } from 'clsx';
import Col from '../grid/col';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import Tooltip from '../tooltip';
import { FormContext } from './context';
import convertToTooltipProps from '../_util/convertToTooltipProps';
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
  const [formLocale] = useLocale('Form');
  const {
    labelAlign: contextLabelAlign,
    labelCol: contextLabelCol,
    labelWrap,
    colon: contextColon,
    classNames: contextClassNames,
    styles: contextStyles,
    tooltip: contextTooltip
  } = React.useContext(FormContext);
  if (!label) {
    return null;
  }
  const mergedLabelCol = labelCol || contextLabelCol || {};
  const mergedLabelAlign = labelAlign || contextLabelAlign;
  const labelClsBasic = `${prefixCls}-item-label`;
  const labelColClassName = clsx(labelClsBasic, mergedLabelAlign === 'left' && `${labelClsBasic}-left`, mergedLabelCol.className, {
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
  const tooltipProps = convertToTooltipProps(tooltip, contextTooltip);
  if (tooltipProps) {
    const tooltipNode = /*#__PURE__*/React.createElement(Tooltip, {
      ...tooltipProps
    }, /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-item-tooltip`,
      onClick: e => {
        e.preventDefault();
      },
      tabIndex: -1
    }, tooltipProps.icon || tooltipProps.children || /*#__PURE__*/React.createElement(QuestionCircleOutlined, null)));
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
    }, formLocale?.optional || defaultLocale.Form?.optional));
  }
  // https://github.com/ant-design/ant-design/pull/52950#discussion_r1980880316
  let markType;
  if (hideRequiredMark) {
    markType = 'hidden';
  } else if (isOptionalMark || isRenderMark) {
    markType = 'optional';
  }
  const labelClassName = clsx(contextClassNames?.label, {
    [`${prefixCls}-item-required`]: required,
    [`${prefixCls}-item-required-mark-${markType}`]: markType,
    [`${prefixCls}-item-no-colon`]: !computedColon
  });
  return /*#__PURE__*/React.createElement(Col, {
    ...mergedLabelCol,
    className: labelColClassName
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    className: labelClassName,
    style: contextStyles?.label,
    title: typeof label === 'string' ? label : ''
  }, labelChildren));
};
export default FormItemLabel;