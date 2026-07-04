"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { genCssVar } from '../theme/util/genStyleUtils';
const ProgressIcon = props => {
  const {
    prefixCls,
    rootPrefixCls,
    children,
    percent
  } = props;
  const progressCls = `${prefixCls}-item-progress-icon`;
  const circleCls = `${progressCls}-circle`;
  const [, varRef] = genCssVar(rootPrefixCls, 'cmp-steps');
  const dashArray = `calc(${varRef('progress-radius')} * 2 * ${Math.PI * percent / 100}) 9999`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
    className: `${progressCls}-svg`,
    viewBox: "0 0 100 100",
    width: "100%",
    height: "100%",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-valuemax": 100,
    "aria-valuemin": 0,
    "aria-valuenow": percent
  }, /*#__PURE__*/React.createElement("title", null, "Progress"), /*#__PURE__*/React.createElement("circle", {
    className: clsx(circleCls, `${circleCls}-rail`)
  }), /*#__PURE__*/React.createElement("circle", {
    className: clsx(circleCls, `${circleCls}-ptg`),
    strokeDasharray: dashArray,
    transform: "rotate(-90 50 50)"
  })), children);
};
export default ProgressIcon;