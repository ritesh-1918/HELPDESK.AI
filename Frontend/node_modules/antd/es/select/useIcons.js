"use client";

import * as React from 'react';
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import DownOutlined from "@ant-design/icons/es/icons/DownOutlined";
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import SearchOutlined from "@ant-design/icons/es/icons/SearchOutlined";
import { devUseWarning } from '../_util/warning';
export default function useIcons({
  suffixIcon,
  clearIcon,
  menuItemSelectedIcon,
  removeIcon,
  loading,
  loadingIcon,
  multiple,
  hasFeedback,
  showSuffixIcon,
  feedbackIcon,
  showArrow,
  componentName
}) {
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning(componentName);
    warning.deprecated(!clearIcon, 'clearIcon', 'allowClear={{ clearIcon: React.ReactNode }}');
  }
  // Clear Icon
  const mergedClearIcon = clearIcon ?? /*#__PURE__*/React.createElement(CloseCircleFilled, null);
  // Validation Feedback Icon
  const getSuffixIconNode = arrowIcon => {
    if (suffixIcon === null && !hasFeedback && !showArrow) {
      return null;
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, showSuffixIcon !== false && arrowIcon, hasFeedback && feedbackIcon);
  };
  // Arrow item icon
  let mergedSuffixIcon = null;
  if (suffixIcon !== undefined) {
    mergedSuffixIcon = getSuffixIconNode(suffixIcon);
  } else if (loading) {
    mergedSuffixIcon = getSuffixIconNode(loadingIcon ?? /*#__PURE__*/React.createElement(LoadingOutlined, {
      spin: true
    }));
  } else {
    mergedSuffixIcon = ({
      open,
      showSearch
    }) => {
      if (open && showSearch) {
        return getSuffixIconNode(/*#__PURE__*/React.createElement(SearchOutlined, null));
      }
      return getSuffixIconNode(/*#__PURE__*/React.createElement(DownOutlined, null));
    };
  }
  // Checked item icon
  let mergedItemIcon = null;
  if (menuItemSelectedIcon !== undefined) {
    mergedItemIcon = menuItemSelectedIcon;
  } else if (multiple) {
    mergedItemIcon = /*#__PURE__*/React.createElement(CheckOutlined, null);
  } else {
    mergedItemIcon = null;
  }
  let mergedRemoveIcon = null;
  if (removeIcon !== undefined) {
    mergedRemoveIcon = removeIcon;
  } else {
    mergedRemoveIcon = /*#__PURE__*/React.createElement(CloseOutlined, null);
  }
  return {
    // TODO: remove as when all the deps bumped
    clearIcon: mergedClearIcon,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon
  };
}