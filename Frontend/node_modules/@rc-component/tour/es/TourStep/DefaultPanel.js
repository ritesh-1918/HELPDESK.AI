function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import pickAttrs from "@rc-component/util/es/pickAttrs";
export default function DefaultPanel(props) {
  const {
    prefixCls,
    current,
    total,
    title,
    description,
    onClose,
    onPrev,
    onNext,
    onFinish,
    className,
    closable,
    classNames: tourClassNames,
    styles
  } = props;
  const ariaProps = pickAttrs(closable || {}, true);
  const closeIcon = closable?.closeIcon ?? /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-close-x`
  }, "\xD7");
  const mergedClosable = !!closable;
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-panel`, className)
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-section`, tourClassNames?.section),
    style: styles?.section
  }, mergedClosable && /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClose,
    "aria-label": "Close"
  }, ariaProps, {
    className: `${prefixCls}-close`
  }), closeIcon), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-header`, tourClassNames?.header),
    style: styles?.header
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, tourClassNames?.title),
    style: styles?.title
  }, title)), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, tourClassNames?.description),
    style: styles?.description
  }, description), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-footer`, tourClassNames?.footer),
    style: styles?.footer
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-sliders`
  }, total > 1 ? [...Array.from({
    length: total
  }).keys()].map((item, index) => {
    return /*#__PURE__*/React.createElement("span", {
      key: item,
      className: index === current ? 'active' : ''
    });
  }) : null), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-actions`, tourClassNames?.actions),
    style: styles?.actions
  }, current !== 0 ? /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-prev-btn`,
    onClick: onPrev
  }, "Prev") : null, current === total - 1 ? /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-finish-btn`,
    onClick: onFinish
  }, "Finish") : /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-next-btn`,
    onClick: onNext
  }, "Next")))));
}