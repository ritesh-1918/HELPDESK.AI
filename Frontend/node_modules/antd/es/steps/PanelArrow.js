"use client";

import * as React from 'react';
const PanelArrow = props => {
  const {
    prefixCls
  } = props;
  return /*#__PURE__*/React.createElement("svg", {
    className: `${prefixCls}-panel-arrow`,
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("title", null, "Arrow"), /*#__PURE__*/React.createElement("path", {
    d: "M 0 0 L 100 50 L 0 100"
  }));
};
export default PanelArrow;