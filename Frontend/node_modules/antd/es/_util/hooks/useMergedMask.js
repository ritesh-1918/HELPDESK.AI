import { useMemo } from 'react';
export const normalizeMaskConfig = (mask, maskClosable) => {
  let maskConfig = {};
  if (mask && typeof mask === 'object') {
    maskConfig = mask;
  }
  if (typeof mask === 'boolean') {
    maskConfig = {
      enabled: mask
    };
  }
  if (maskConfig.closable === undefined && maskClosable !== undefined) {
    maskConfig.closable = maskClosable;
  }
  return maskConfig;
};
export const useMergedMask = (mask, contextMask, prefixCls, maskClosable) => {
  return useMemo(() => {
    const maskConfig = normalizeMaskConfig(mask, maskClosable);
    const contextMaskConfig = normalizeMaskConfig(contextMask);
    const mergedConfig = {
      blur: false,
      ...contextMaskConfig,
      ...maskConfig,
      closable: maskConfig.closable ?? maskClosable ?? contextMaskConfig.closable ?? true
    };
    const className = mergedConfig.blur ? `${prefixCls}-mask-blur` : undefined;
    return [mergedConfig.enabled !== false, {
      mask: className
    }, !!mergedConfig.closable];
  }, [mask, contextMask, prefixCls, maskClosable]);
};