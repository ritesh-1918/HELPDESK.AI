"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _fastColor = require("@ant-design/fast-color");
var _locale = require("../locale");
var _internal = require("../theme/internal");
const Simple = () => {
  const [, token] = (0, _internal.useToken)();
  const [locale] = (0, _locale.useLocale)('Empty');
  const {
    colorFill,
    colorFillTertiary,
    colorFillQuaternary,
    colorBgContainer
  } = token;
  const {
    borderColor,
    shadowColor,
    contentColor
  } = (0, _react.useMemo)(() => ({
    borderColor: new _fastColor.FastColor(colorFill).onBackground(colorBgContainer).toHexString(),
    shadowColor: new _fastColor.FastColor(colorFillTertiary).onBackground(colorBgContainer).toHexString(),
    contentColor: new _fastColor.FastColor(colorFillQuaternary).onBackground(colorBgContainer).toHexString()
  }), [colorFill, colorFillTertiary, colorFillQuaternary, colorBgContainer]);
  return /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "41",
    viewBox: "0 0 64 41",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("title", null, locale?.description || 'Empty'), /*#__PURE__*/React.createElement("g", {
    transform: "translate(0 1)",
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React.createElement("ellipse", {
    fill: shadowColor,
    cx: "32",
    cy: "33",
    rx: "32",
    ry: "7"
  }), /*#__PURE__*/React.createElement("g", {
    fillRule: "nonzero",
    stroke: borderColor
  }, /*#__PURE__*/React.createElement("path", {
    d: "M55 12.8 44.9 1.3Q44 0 42.9 0H21.1q-1.2 0-2 1.3L9 12.8V22h46z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M41.6 16c0-1.7 1-3 2.2-3H55v18.1c0 2.2-1.3 3.9-3 3.9H12c-1.7 0-3-1.7-3-3.9V13h11.2c1.2 0 2.2 1.3 2.2 3s1 2.9 2.2 2.9h14.8c1.2 0 2.2-1.4 2.2-3",
    fill: contentColor
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  Simple.displayName = 'SimpleImage';
}
var _default = exports.default = Simple;