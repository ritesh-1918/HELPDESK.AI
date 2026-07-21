import * as React from 'react';
import { ConfigContext, Variants } from '../../config-provider';
import { VariantContext } from '../context';
/**
 * Compatible for legacy `bordered` prop.
 */
const useVariant = (component, variant, legacyBordered) => {
  const {
    variant: configVariant,
    [component]: componentConfig
  } = React.useContext(ConfigContext);
  const ctxVariant = React.useContext(VariantContext);
  const configComponentVariant = componentConfig?.variant;
  let mergedVariant;
  if (typeof variant !== 'undefined') {
    mergedVariant = variant;
  } else if (legacyBordered === false) {
    mergedVariant = 'borderless';
  } else {
    // form variant > component global variant > global variant
    mergedVariant = ctxVariant ?? configComponentVariant ?? configVariant ?? 'outlined';
  }
  const enableVariantCls = Variants.includes(mergedVariant);
  return [mergedVariant, enableVariantCls];
};
export default useVariant;