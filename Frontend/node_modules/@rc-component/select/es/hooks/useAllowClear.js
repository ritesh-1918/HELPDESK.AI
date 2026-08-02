import { useMemo } from 'react';
export const useAllowClear = (prefixCls, displayValues, allowClear, clearIcon, disabled = false, mergedSearchValue, mode) => {
  // Convert boolean to object first
  const allowClearConfig = useMemo(() => {
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
  return useMemo(() => {
    const mergedAllowClear = !disabled && allowClearConfig.allowClear !== false && (displayValues.length || mergedSearchValue) && !(mode === 'combobox' && mergedSearchValue === '');
    return {
      allowClear: mergedAllowClear,
      clearIcon: mergedAllowClear ? allowClearConfig.clearIcon || clearIcon || '×' : null
    };
  }, [allowClearConfig, clearIcon, disabled, displayValues.length, mergedSearchValue, mode]);
};