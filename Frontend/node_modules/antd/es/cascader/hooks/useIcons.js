"use client";

import * as React from 'react';
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
const defaultLoadingIcon = /*#__PURE__*/React.createElement(LoadingOutlined, {
  spin: true
});
const defaultExpandIcon = /*#__PURE__*/React.createElement(RightOutlined, null);
const defaultRtlExpandIcon = /*#__PURE__*/React.createElement(LeftOutlined, null);
export default function useIcons({
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