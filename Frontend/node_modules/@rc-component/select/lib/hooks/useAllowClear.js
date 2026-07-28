"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAllowClear = void 0;
var _react = require("react");
const useAllowClear = (prefixCls, displayValues, allowClear, clearIcon, disabled = false, mergedSearchValue, mode) => {
  // Convert boolean to object first
  const allowClearConfig = (0, _react.useMemo)(() => {
    if (typeof allowClear === 'boolean') {
      return {
        allowClear
      };
    }
    if (allowClear && typeof allowClear === 'object') {
      return allowClear;
    }
    return {
      allowClear: false
    };
  }, [allowClear]);
  return (0, _react.useMemo)(() => {
    const mergedAllowClear = !disabled && allowClearConfig.allowClear !== false && (displayValues.length || mergedSearchValue) && !(mode === 'combobox' && mergedSearchValue === '');
    return {
      allowClear: mergedAllowClear,
      clearIcon: mergedAllowClear ? allowClearConfig.clearIcon || clearIcon || '×' : null
    };
  }, [allowClearConfig, clearIcon, disabled, displayValues.length, mergedSearchValue, mode]);
};
exports.useAllowClear = useAllowClear;