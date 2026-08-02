"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useIcons;
var React = _interopRequireWildcard(require("react"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _LoadingOutlined = _interopRequireDefault(require("@ant-design/icons/LoadingOutlined"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
const defaultLoadingIcon = /*#__PURE__*/React.createElement(_LoadingOutlined.default, {
  spin: true
});
const defaultExpandIcon = /*#__PURE__*/React.createElement(_RightOutlined.default, null);
const defaultRtlExpandIcon = /*#__PURE__*/React.createElement(_LeftOutlined.default, null);
function useIcons({
  contextExpandIcon,
  contextLoadingIcon,
  expandIcon,
  loadingIcon,
  isRtl
}) {
  return React.useMemo(() => ({
    expandIcon: expandIcon ?? contextExpandIcon ?? (isRtl ? defaultRtlExpandIcon : defaultExpandIcon),
    loadingIcon: loadingIcon ?? contextLoadingIcon ?? defaultLoadingIcon
  }), [contextExpandIcon, contextLoadingIcon, expandIcon, isRtl, loadingIcon]);
}