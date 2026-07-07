import { isValidElement, useMemo } from 'react';
import { devUseWarning } from '../../_util/warning';
function normalizeMask(mask) {
  if (/*#__PURE__*/isValidElement(mask)) {
    return [mask, undefined];
  }
  if (typeof mask === 'boolean' || mask && typeof mask === 'object') {
    return [undefined, mask];
  }
  return [undefined, undefined];
}
export default function usePreviewConfig(preview) {
  // Get origin preview config
  const rawPreviewConfig = useMemo(() => {
    if (typeof preview === 'boolean') {
      return preview ? {} : null;
    }
    return preview && typeof preview === 'object' ? preview : {};
  }, [preview]);
  const splittedPreviewConfig = useMemo(() => {
    if (!rawPreviewConfig) {
      return [rawPreviewConfig, '', ''];
    }
    const {
      open,
      onOpenChange,
      cover,
      actionsRender,
      visible,
      onVisibleChange,
      rootClassName,
      maskClassName,
      mask,
      forceRender: _forceRender,
      destroyOnClose: _destroyOnClose,
      toolbarRender,
      ...restPreviewConfig
    } = rawPreviewConfig;
    let onInternalOpenChange;
    if (onOpenChange) {
      onInternalOpenChange = onOpenChange;
    } else if (onVisibleChange) {
      onInternalOpenChange = (nextOpen, info) => {
        const {
          current
        } = info || {};
        if (current !== undefined) {
          onVisibleChange(nextOpen, !nextOpen, current);
        } else {
          onVisibleChange(nextOpen, !nextOpen);
        }
      };
    }
    const [coverElement, maskConfig] = normalizeMask(mask);
    return [{
      ...restPreviewConfig,
      open: open ?? visible,
      onOpenChange: onInternalOpenChange,
      cover: cover ?? coverElement,
      mask: maskConfig,
      actionsRender: actionsRender ?? toolbarRender
    }, rootClassName, maskClassName];
  }, [rawPreviewConfig]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Image');
    if (rawPreviewConfig) {
      [['visible', 'open'], ['onVisibleChange', 'onOpenChange'], ['maskClassName', 'classNames.cover'], ['rootClassName', 'classNames.root'], ['toolbarRender', 'actionsRender']].forEach(([deprecatedName, newName]) => {
        warning.deprecated(!(deprecatedName in rawPreviewConfig), deprecatedName, newName);
      });
      process.env.NODE_ENV !== "production" ? warning(! /*#__PURE__*/isValidElement(rawPreviewConfig.mask), 'deprecated', '`mask` used as ReactNode is deprecated. Please use `cover` instead.') : void 0;
      process.env.NODE_ENV !== "production" ? warning(!('forceRender' in rawPreviewConfig), 'breaking', '`forceRender` is no longer supported.') : void 0;
      process.env.NODE_ENV !== "production" ? warning(!('destroyOnClose' in rawPreviewConfig), 'breaking', '`destroyOnClose` is no longer supported.') : void 0;
    }
  }
  return splittedPreviewConfig;
}