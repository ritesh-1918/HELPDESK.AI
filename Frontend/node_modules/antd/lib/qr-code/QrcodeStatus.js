"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = QRcodeStatus;
var _react = _interopRequireDefault(require("react"));
var _ReloadOutlined = _interopRequireDefault(require("@ant-design/icons/ReloadOutlined"));
var _Button = _interopRequireDefault(require("../button/Button"));
var _spin = _interopRequireDefault(require("../spin"));
const defaultSpin = /*#__PURE__*/_react.default.createElement(_spin.default, null);
function QRcodeStatus({
  prefixCls,
  locale,
  onRefresh,
  statusRender,
  status
}) {
  const defaultExpiredNode = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", {
    className: `${prefixCls}-expired`
  }, locale?.expired), onRefresh && (/*#__PURE__*/_react.default.createElement(_Button.default, {
    type: "link",
    icon: /*#__PURE__*/_react.default.createElement(_ReloadOutlined.default, null),
    onClick: onRefresh
  }, locale?.refresh)));
  const defaultScannedNode = /*#__PURE__*/_react.default.createElement("p", {
    className: `${prefixCls}-scanned`
  }, locale?.scanned);
  const defaultNodes = {
    expired: defaultExpiredNode,
    loading: defaultSpin,
    scanned: defaultScannedNode
  };
  const defaultStatusRender = info => defaultNodes[info.status];
  const mergedStatusRender = statusRender ?? defaultStatusRender;
  return mergedStatusRender({
    status,
    locale,
    onRefresh
  });
}