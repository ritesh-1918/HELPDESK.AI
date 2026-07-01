"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _genStyleUtils = require("../theme/util/genStyleUtils");
const ProgressIcon = props => {
  const {
    prefixCls,
    rootPrefixCls,
    children,
    percent
  } = props;
  const progressCls = `${prefixCls}-item-progress-icon`;
  const circleCls = `${progressCls}-circle`;
  const [, varRef] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'cmp-steps');
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
    className: (0, _clsx.clsx)(circleCls, `${circleCls}-rail`)
  }), /*#__PURE__*/React.createElement("circle", {
    className: (0, _clsx.clsx)(circleCls, `${circleCls}-ptg`),
    strokeDasharray: dashArray,
    transform: "rotate(-90 50 50)"
  })), children);
};
var _default = exports.default = ProgressIcon;