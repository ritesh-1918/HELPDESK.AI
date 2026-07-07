import * as React from 'react';
function isConfigObj(closable) {
  return closable !== null && typeof closable === 'object';
}
/**
 * Convert `closable` to ClosableConfig.
 * When `preset` is true, will auto fill ClosableConfig with default value.
 */
function getClosableConfig(closable, closeIcon, preset) {
  if (closable === false || closeIcon === false && (!isConfigObj(closable) || !closable.closeIcon)) {
    return null;
  }
  const mergedCloseIcon = typeof closeIcon !== 'boolean' ? closeIcon : undefined;
  if (isConfigObj(closable)) {
    return {
      ...closable,
      closeIcon: closable.closeIcon ?? mergedCloseIcon
    };
  }

  // When StepClosable no need auto fill, but RootClosable need this.
  return preset || closable || closeIcon ? {
    closeIcon: mergedCloseIcon
  } : 'empty';
}
export function useClosable(stepClosable, stepCloseIcon, closable, closeIcon) {
  return React.useMemo(() => {
    const stepClosableConfig = getClosableConfig(stepClosable, stepCloseIcon, false);
    const rootClosableConfig = getClosableConfig(closable, closeIcon, true);
    if (stepClosableConfig !== 'empty') {
      return stepClosableConfig;
    }
    return rootClosableConfig;
  }, [closable, closeIcon, stepClosable, stepCloseIcon]);
}