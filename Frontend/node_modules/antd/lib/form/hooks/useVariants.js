"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _configProvider = require("../../config-provider");
var _context = require("../context");
/**
 * Compatible for legacy `bordered` prop.
 */
const useVariant = (component, variant, legacyBordered) => {
  const {
    variant: configVariant,
    [component]: componentConfig
  } = React.useContext(_configProvider.ConfigContext);
  const ctxVariant = React.useContext(_context.VariantContext);
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
  const enableVariantCls = _configProvider.Variants.includes(mergedVariant);
  return [mergedVariant, enableVariantCls];
};
var _default = exports.default = useVariant;