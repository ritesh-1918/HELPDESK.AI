"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import React from 'react';
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import isNonNullable from '../_util/isNonNullable';
import Button from '../button/Button';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
// Due to the independent design of Panel, it will be too coupled to put in rc-tour,
// so a set of Panel logic is implemented separately in antd.
const TourPanel = props => {
  const {
    stepProps,
    current,
    type,
    indicatorsRender,
    actionsRender
  } = props;
  const {
    prefixCls,
    total = 1,
    title,
    onClose,
    onPrev,
    onNext,
    onFinish,
    cover,
    description,
    nextButtonProps,
    prevButtonProps,
    type: stepType,
    closable,
    classNames = {},
    styles = {}
  } = stepProps;
  const mergedType = stepType ?? type;
  const ariaProps = pickAttrs(closable ?? {}, true);
  const [contextLocaleGlobal] = useLocale('global', defaultLocale.global);
  const [contextLocaleTour] = useLocale('Tour', defaultLocale.Tour);
  const mergedCloseIcon = /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: `${prefixCls}-close`,
    "aria-label": contextLocaleGlobal?.close,
    ...ariaProps
  }, closable?.closeIcon || /*#__PURE__*/React.createElement(CloseOutlined, {
    className: `${prefixCls}-close-icon`
  }));
  const isLastStep = current === total - 1;
  const prevBtnClick = () => {
    onPrev?.();
    prevButtonProps?.onClick?.();
  };
  const nextBtnClick = () => {
    if (isLastStep) {
      onFinish?.();
    } else {
      onNext?.();
    }
    nextButtonProps?.onClick?.();
  };
  const headerNode = isNonNullable(title) ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-header`, classNames.header),
    style: styles.header
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, classNames.title),
    style: styles.title
  }, title))) : null;
  const descriptionNode = isNonNullable(description) ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, classNames.description),
    style: styles.description
  }, description)) : null;
  const coverNode = isNonNullable(cover) ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-cover`, classNames.cover),
    style: styles.cover
  }, cover)) : null;
  let mergedIndicatorNode;
  if (indicatorsRender) {
    mergedIndicatorNode = indicatorsRender(current, total);
  } else {
    mergedIndicatorNode = _toConsumableArray(Array.from({
      length: total
    }).keys()).map((stepItem, index) => (/*#__PURE__*/React.createElement("span", {
      key: stepItem,
      className: clsx(index === current && `${prefixCls}-indicator-active`, `${prefixCls}-indicator`, classNames.indicator),
      style: styles.indicator
    })));
  }
  const mainBtnType = mergedType === 'primary' ? 'default' : 'primary';
  const secondaryBtnProps = {
    type: 'default',
    ghost: mergedType === 'primary'
  };
  const defaultActionsNode = /*#__PURE__*/React.createElement(React.Fragment, null, current !== 0 ? (/*#__PURE__*/React.createElement(Button, {
    size: "small",
    ...secondaryBtnProps,
    ...prevButtonProps,
    onClick: prevBtnClick,
    className: clsx(`${prefixCls}-prev-btn`, prevButtonProps?.className)
  }, prevButtonProps?.children ?? contextLocaleTour?.Previous)) : null, /*#__PURE__*/React.createElement(Button, {
    size: "small",
    type: mainBtnType,
    ...nextButtonProps,
    onClick: nextBtnClick,
    className: clsx(`${prefixCls}-next-btn`, nextButtonProps?.className)
  }, nextButtonProps?.children ?? (isLastStep ? contextLocaleTour?.Finish : contextLocaleTour?.Next)));
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-panel`
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-section`, classNames.section),
    style: styles.section
  }, closable && mergedCloseIcon, coverNode, headerNode, descriptionNode, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-footer`, classNames.footer),
    style: styles.footer
  }, total > 1 && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-indicators`, classNames.indicators),
    style: styles.indicators
  }, mergedIndicatorNode)), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-actions`, classNames.actions),
    style: styles.actions
  }, actionsRender ? actionsRender(defaultActionsNode, {
    current,
    total
  }) : defaultActionsNode))));
};
export default TourPanel;